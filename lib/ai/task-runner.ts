import { providerRegistry } from "./provider-registry";
import { buildPrompt, BuildPromptOptions } from "./prompts";
import { readSSEStream } from "./streaming";
import { AIResult, GrammarResult, RewriteAlternative } from "@/types/writing-tools";
import { ProviderId } from "@/types/provider";

export interface RunAITaskOptions extends BuildPromptOptions {
  providerId: ProviderId;
  model?: string;
  onStreamChunk?: (delta: string, accumulated: string) => void;
  signal?: AbortSignal;
}

export const AITaskRunner = {
  /**
   * Runs an AI writing workbench task with full streaming support, robust error handling,
   * and structured JSON response parsing for grammar and multiple alternatives.
   */
  async runTask(options: RunAITaskOptions): Promise<AIResult> {
    const { providerId, model, onStreamChunk, signal, ...promptOpts } = options;

    const config = providerRegistry.resolveConfig(providerId);
    const selectedModel = model || config.defaultModel;

    // 1. Pre-flight credential check
    const validation = providerRegistry.validate(config);
    if (!validation.isValid) {
      throw new Error(validation.error || `Provider "${providerId}" is not configured properly.`);
    }

    // 2. Build task-specific prompts
    const { systemPrompt, userPrompt } = buildPrompt(promptOpts);

    // 3. Dispatch to same-origin proxy
    const isStreamSupported = true; // All our providers support SSE streaming

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId,
        model: selectedModel,
        systemPrompt,
        userPrompt,
        temperature: 0.7,
        stream: isStreamSupported,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        taskType: promptOpts.toolId,
      }),
      signal,
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson?.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(providerRegistry.normalizeError(providerId, errorMsg));
    }

    let finalRawText = "";

    // 4. Handle stream or JSON response
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/event-stream") && response.body) {
      finalRawText = await readSSEStream(
        response.body,
        {
          onChunk: (delta, accumulated) => {
            if (onStreamChunk) onStreamChunk(delta, accumulated);
          },
          onDone: (text) => {
            finalRawText = text;
          },
          onError: (err) => {
            throw err;
          },
        },
        signal
      );
    } else {
      const data = await response.json();
      finalRawText = data.text || "";
      if (onStreamChunk) onStreamChunk(finalRawText, finalRawText);
    }

    // 5. Structure parsing for grammar or alternatives
    let grammarData: GrammarResult | undefined;
    let alternatives: RewriteAlternative[] | undefined;
    let cleanGeneratedText = finalRawText.trim();

    if (promptOpts.toolId === "grammar") {
      grammarData = parseGrammarOutput(finalRawText, promptOpts.text);
      cleanGeneratedText = grammarData.correctedText;
    } else if (promptOpts.alternativeCount && promptOpts.alternativeCount > 1) {
      alternatives = parseAlternativesOutput(finalRawText, promptOpts.alternativeCount);
      if (alternatives.length > 0) {
        cleanGeneratedText = alternatives[0].text;
      }
    }

    return {
      toolId: promptOpts.toolId,
      originalText: promptOpts.text,
      generatedText: cleanGeneratedText,
      grammarData,
      alternatives,
      modelUsed: selectedModel,
      timestamp: Date.now(),
      selectionOnly: promptOpts.isSelection,
    };
  },
};

/**
 * Robust JSON extractor that handles raw JSON or markdown code-fenced JSON blocks.
 */
function extractJsonString(raw: string): string {
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  const jsonObjectMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    return jsonObjectMatch[0].trim();
  }
  return raw.trim();
}

/**
 * Parses model output for grammar corrections. Falls back to original text if output is completely invalid.
 */
export function parseGrammarOutput(rawText: string, originalFallback: string): GrammarResult {
  try {
    const jsonStr = extractJsonString(rawText);
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === "object" && typeof parsed.correctedText === "string") {
      return {
        correctedText: parsed.correctedText,
        changes: Array.isArray(parsed.changes)
          ? parsed.changes.map((c: Record<string, unknown>) => ({
              original: String(c.original || ""),
              replacement: String(c.replacement || ""),
              explanation: String(c.explanation || ""),
              category: (c.category as any) || "grammar",
            }))
          : [],
        summary: parsed.summary ? String(parsed.summary) : undefined,
      };
    }
  } catch {
    // If model didn't return valid JSON, treat the raw response as the corrected text
    // if it looks like prose, or fallback to original
  }

  // Fallback: If not JSON, strip any leading/trailing quotes or markdown
  const cleaned = rawText
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/\n?```$/i, "")
    .replace(/^["']|["']$/g, "")
    .trim();

  return {
    correctedText: cleaned || originalFallback,
    changes: [],
    summary: "Edits applied directly to text.",
  };
}

/**
 * Parses model output for multiple rewrite alternatives.
 */
export function parseAlternativesOutput(rawText: string, count: number): RewriteAlternative[] {
  try {
    const jsonStr = extractJsonString(rawText);
    const parsed = JSON.parse(jsonStr);
    if (parsed && Array.isArray(parsed.alternatives) && parsed.alternatives.length > 0) {
      return parsed.alternatives.map((alt: Record<string, unknown>, idx: number) => ({
        id: String(alt.id || idx + 1),
        text: String(alt.text || ""),
        label: alt.label ? String(alt.label) : `Option ${idx + 1}`,
        explanation: alt.explanation ? String(alt.explanation) : undefined,
      }));
    }
  } catch {
    // Fallback: split by numbered lines (e.g. "1. ...", "2. ...")
  }

  const lines = rawText.split(/\n(?=\d+[\.)]\s+)/).filter((s) => s.trim().length > 0);
  if (lines.length > 1) {
    return lines.slice(0, count).map((line, idx) => ({
      id: String(idx + 1),
      text: line.replace(/^\d+[\.)]\s+/, "").trim(),
      label: `Option ${idx + 1}`,
    }));
  }

  return [
    {
      id: "1",
      text: rawText.trim(),
      label: "Option 1",
    },
  ];
}
