import { NextRequest, NextResponse } from "next/server";
import { AIRequestSchema, validateBaseUrl } from "@/lib/security/validation";
import { sanitizeErrorMessage } from "@/lib/security/sanitization";
import { ProviderId } from "@/types/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Same-origin proxy Route Handler.
 * Forwards requests to selected AI provider using client-supplied ephemeral credentials.
 * NEVER persists credentials or document text.
 * Implements strict SSRF protection and sanitized error responses.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = AIRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const {
      providerId,
      model,
      systemPrompt,
      userPrompt,
      temperature,
      maxTokens,
      stream,
      apiKey,
      baseUrl: rawBaseUrl,
    } = parseResult.data;

    // SSRF & protocol checks for custom base URLs
    let baseUrl = rawBaseUrl;
    if (baseUrl) {
      const isLocalPermitted = providerId === "ollama" || providerId === "openai-compatible";
      const validation = validateBaseUrl(baseUrl, isLocalPermitted);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      baseUrl = validation.normalizedUrl;
    }

    switch (providerId) {
      case "openai":
        return handleOpenAI({ apiKey, model, systemPrompt, userPrompt, temperature, maxTokens, stream });
      case "gemini":
        return handleGemini({ apiKey, model, systemPrompt, userPrompt, temperature, maxTokens, stream });
      case "anthropic":
        return handleAnthropic({ apiKey, model, systemPrompt, userPrompt, temperature, maxTokens, stream });
      case "groq":
        return handleGroq({ apiKey, model, systemPrompt, userPrompt, temperature, maxTokens, stream });
      case "ollama":
        return handleOllama({ baseUrl: baseUrl || "http://localhost:11434", model, systemPrompt, userPrompt, temperature, stream });
      case "openai-compatible":
        return handleOpenAICompatible({
          baseUrl: baseUrl || "http://localhost:1234/v1",
          apiKey,
          model,
          systemPrompt,
          userPrompt,
          temperature,
          maxTokens,
          stream,
        });
      default:
        return NextResponse.json({ error: `Unsupported provider: ${providerId}` }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error occurred while processing AI request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// -----------------------------------------------------------------------------
// Provider Request Handlers
// -----------------------------------------------------------------------------

async function handleOpenAI({
  apiKey,
  model,
  systemPrompt,
  userPrompt,
  temperature,
  maxTokens,
  stream,
}: {
  apiKey?: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens?: number;
  stream: boolean;
}) {
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key is missing. Configure it in Settings." }, { status: 401 });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      stream,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const rawMessage = errorData?.error?.message || `OpenAI returned status ${response.status}`;
    const message = sanitizeErrorMessage(rawMessage, apiKey);
    return NextResponse.json({ error: message }, { status: response.status });
  }

  if (stream && response.body) {
    // Transform OpenAI SSE to normalized text stream
    const transformStream = createOpenAITransformStream();
    return new Response(response.body.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  return NextResponse.json({ text, usage: data.usage });
}

async function handleGemini({
  apiKey,
  model: rawModel,
  systemPrompt,
  userPrompt,
  temperature,
  maxTokens,
  stream,
}: {
  apiKey?: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens?: number;
  stream: boolean;
}) {
  if (!apiKey) {
    return NextResponse.json({ error: "Google Gemini API key is missing. Configure it in Settings." }, { status: 401 });
  }

  // Gracefully upgrade retired/deprecated Gemini model IDs to active production models (Bug 45)
  let model = rawModel;
  const proFallbacks = ["gemini-1.5-pro", "gemini-2.5-pro", "gemini-pro"];
  const flashFallbacks = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash", "gemini-flash"];

  if (proFallbacks.includes(rawModel) || (rawModel.includes("pro") && !rawModel.includes("3.1"))) {
    model = "gemini-3.1-pro-preview";
  } else if (flashFallbacks.includes(rawModel) || (rawModel.includes("flash") && !rawModel.includes("3.8"))) {
    model = "gemini-3.8-flash";
  }

  // Helper to fetch with a 30s timeout to prevent 90s hangs under high demand
  const executeGeminiCall = async (targetModel: string) => {
    const endpoint = stream
      ? `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${apiKey.trim()}`
      : `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey.trim()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  let response: Response;
  try {
    response = await executeGeminiCall(model);
  } catch (err: any) {
    // Retry once if timed out or network error
    try {
      await new Promise((r) => setTimeout(r, 1000));
      response = await executeGeminiCall(model);
    } catch {
      // Fallback model if primary model times out under high demand
      const fallbackModel = model === "gemini-3.8-flash" ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";
      response = await executeGeminiCall(fallbackModel);
    }
  }

  // If overloaded (503 / 429), retry or fallback
  if (!response.ok && (response.status === 503 || response.status === 429)) {
    await new Promise((r) => setTimeout(r, 1200));
    try {
      const retryResponse = await executeGeminiCall(model);
      if (retryResponse.ok) {
        response = retryResponse;
      } else {
        const fallbackModel = model === "gemini-3.8-flash" ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";
        const altResponse = await executeGeminiCall(fallbackModel);
        if (altResponse.ok) {
          response = altResponse;
        }
      }
    } catch {
      // Proceed to standard error handling
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const rawMessage = errorData?.error?.message || `Gemini returned status ${response.status}`;
    const message = sanitizeErrorMessage(rawMessage, apiKey);
    return NextResponse.json({ error: message }, { status: response.status });
  }

  if (stream && response.body) {
    const transformStream = createGeminiTransformStream();
    return new Response(response.body.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return NextResponse.json({
    text,
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount,
      completionTokens: data.usageMetadata?.candidatesTokenCount,
      totalTokens: data.usageMetadata?.totalTokenCount,
    },
  });
}

async function handleAnthropic({
  apiKey,
  model,
  systemPrompt,
  userPrompt,
  temperature,
  maxTokens = 4096,
  stream,
}: {
  apiKey?: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens?: number;
  stream: boolean;
}) {
  if (!apiKey) {
    return NextResponse.json({ error: "Anthropic API key is missing. Configure it in Settings." }, { status: 401 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey.trim(),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      temperature,
      max_tokens: maxTokens,
      stream,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const rawMessage = errorData?.error?.message || `Anthropic returned status ${response.status}`;
    const message = sanitizeErrorMessage(rawMessage, apiKey);
    return NextResponse.json({ error: message }, { status: response.status });
  }

  if (stream && response.body) {
    const transformStream = createAnthropicTransformStream();
    return new Response(response.body.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  return NextResponse.json({
    text,
    usage: {
      promptTokens: data.usage?.input_tokens,
      completionTokens: data.usage?.output_tokens,
      totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
  });
}

async function handleGroq({
  apiKey,
  model,
  systemPrompt,
  userPrompt,
  temperature,
  maxTokens,
  stream,
}: {
  apiKey?: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens?: number;
  stream: boolean;
}) {
  if (!apiKey) {
    return NextResponse.json({ error: "Groq API key is missing. Configure it in Settings." }, { status: 401 });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      stream,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const rawMessage = errorData?.error?.message || `Groq returned status ${response.status}`;
    const message = sanitizeErrorMessage(rawMessage, apiKey);
    return NextResponse.json({ error: message }, { status: response.status });
  }

  if (stream && response.body) {
    const transformStream = createOpenAITransformStream();
    return new Response(response.body.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  return NextResponse.json({ text, usage: data.usage });
}

async function handleOllama({
  baseUrl,
  model,
  systemPrompt,
  userPrompt,
  temperature,
  stream,
}: {
  baseUrl: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  stream: boolean;
}) {
  const url = `${baseUrl.replace(/\/+$/, "")}/api/chat`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      options: { temperature },
      stream,
    }),
  });

  if (!response.ok) {
    const message = `Ollama returned status ${response.status}: ${response.statusText}`;
    return NextResponse.json({ error: message }, { status: response.status });
  }

  if (stream && response.body) {
    const transformStream = createOllamaTransformStream();
    return new Response(response.body.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const data = await response.json();
  const text = data.message?.content || "";
  return NextResponse.json({ text });
}

async function handleOpenAICompatible({
  baseUrl,
  apiKey,
  model,
  systemPrompt,
  userPrompt,
  temperature,
  maxTokens,
  stream,
}: {
  baseUrl: string;
  apiKey?: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens?: number;
  stream: boolean;
}) {
  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey?.trim()) {
    headers["Authorization"] = `Bearer ${apiKey.trim()}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      stream,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const rawMessage = errorData?.error?.message || `Endpoint returned status ${response.status}`;
    const message = sanitizeErrorMessage(rawMessage, apiKey);
    return NextResponse.json({ error: message }, { status: response.status });
  }

  if (stream && response.body) {
    const transformStream = createOpenAITransformStream();
    return new Response(response.body.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  return NextResponse.json({ text, usage: data.usage });
}

// -----------------------------------------------------------------------------
// Stream Normalization Transformers (Transforms provider streams into normalized SSE)
// Output SSE event format: data: {"delta": "...", "done": boolean}\n\n
// -----------------------------------------------------------------------------

function createOpenAITransformStream() {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new TransformStream<UintKit, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;

        if (trimmed === "data: [DONE]") {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: "", done: true })}\n\n`));
          continue;
        }

        if (trimmed.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content || "";
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, done: false })}\n\n`));
            }
          } catch {
            // Ignore partial parse errors in stream
          }
        }
      }
    },
    flush(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: "", done: true })}\n\n`));
    },
  });
}

function createGeminiTransformStream() {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new TransformStream<UintKit, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, done: false })}\n\n`));
            }
          } catch {
            // Ignore stream fragment parse error
          }
        }
      }
    },
    flush(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: "", done: true })}\n\n`));
    },
  });
}

function createAnthropicTransformStream() {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new TransformStream<UintKit, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.type === "content_block_delta") {
              const delta = parsed.delta?.text || "";
              if (delta) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, done: false })}\n\n`));
              }
            } else if (parsed.type === "message_stop") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: "", done: true })}\n\n`));
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    },
    flush(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: "", done: true })}\n\n`));
    },
  });
}

function createOllamaTransformStream() {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new TransformStream<UintKit, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed);
          const delta = parsed.message?.content || parsed.response || "";
          const done = !!parsed.done;
          if (delta) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, done })}\n\n`));
          } else if (done) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: "", done: true })}\n\n`));
          }
        } catch {
          // Ignore partial line
        }
      }
    },
    flush(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: "", done: true })}\n\n`));
    },
  });
}

type UintKit = Uint8Array;
