/**
 * Lingually Desktop - Direct AI Provider Client & Connection Diagnostics
 * Supports Google Gemini, OpenAI, Anthropic Claude, Groq, Ollama, and OpenAI-Compatible APIs
 */

export type ProviderId = "gemini" | "openai" | "anthropic" | "groq" | "ollama" | "openai-compatible";

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  model?: string;
}

export const DEFAULT_MODELS: Record<ProviderId, string> = {
  gemini: "gemini-2.0-flash",
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-20241022",
  groq: "llama-3.3-70b-versatile",
  ollama: "llama3.2:latest",
  "openai-compatible": "default",
};

export const DEFAULT_BASE_URLS: Record<ProviderId, string> = {
  gemini: "https://generativelanguage.googleapis.com",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  groq: "https://api.groq.com/openai/v1",
  ollama: "http://localhost:11434",
  "openai-compatible": "http://localhost:1234/v1",
};

export const PROVIDER_NAMES: Record<ProviderId, string> = {
  gemini: "Google Gemini",
  openai: "OpenAI",
  anthropic: "Anthropic Claude",
  groq: "Groq Cloud",
  ollama: "Ollama (Local)",
  "openai-compatible": "OpenAI Compatible / Custom",
};

export class DesktopAIClient {
  /**
   * Tests live connectivity for any supported AI provider by sending a fast probe request
   * and measuring the round-trip latency in milliseconds.
   */
  static async testConnection(config: ProviderConfig): Promise<ConnectionTestResult> {
    const startTime = performance.now();
    const model = config.defaultModel || DEFAULT_MODELS[config.id];

    if (config.id !== "ollama" && !config.apiKey.trim()) {
      return {
        success: false,
        message: "API Key is required to connect to this provider.",
      };
    }

    try {
      switch (config.id) {
        case "gemini": {
          const baseUrl = config.baseUrl.trim() || DEFAULT_BASE_URLS.gemini;
          const url = `${baseUrl.replace(/\/+$/, "")}/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(config.apiKey.trim())}`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Hello! Reply with 'OK' only." }] }],
              generationConfig: { maxOutputTokens: 10, temperature: 0.1 },
            }),
          });
          const latencyMs = Math.round(performance.now() - startTime);

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
            return { success: false, message: errMsg, latencyMs };
          }
          return {
            success: true,
            message: `Connected successfully (${latencyMs}ms) • Model: ${model}`,
            latencyMs,
            model,
          };
        }

        case "openai": {
          const baseUrl = config.baseUrl.trim() || DEFAULT_BASE_URLS.openai;
          const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.apiKey.trim()}`,
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: "Reply with 'OK'." }],
              max_tokens: 5,
            }),
          });
          const latencyMs = Math.round(performance.now() - startTime);

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
            return { success: false, message: errMsg, latencyMs };
          }
          return {
            success: true,
            message: `Connected successfully (${latencyMs}ms) • Model: ${model}`,
            latencyMs,
            model,
          };
        }

        case "anthropic": {
          const baseUrl = config.baseUrl.trim() || DEFAULT_BASE_URLS.anthropic;
          const url = `${baseUrl.replace(/\/+$/, "")}/messages`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": config.apiKey.trim(),
              "anthropic-version": "2023-06-01",
              "anthropic-dangerous-direct-browser-access": "true",
            },
            body: JSON.stringify({
              model,
              max_tokens: 10,
              messages: [{ role: "user", content: "Reply with 'OK'." }],
            }),
          });
          const latencyMs = Math.round(performance.now() - startTime);

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
            return { success: false, message: errMsg, latencyMs };
          }
          return {
            success: true,
            message: `Connected successfully (${latencyMs}ms) • Model: ${model}`,
            latencyMs,
            model,
          };
        }

        case "groq": {
          const baseUrl = config.baseUrl.trim() || DEFAULT_BASE_URLS.groq;
          const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.apiKey.trim()}`,
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: "Reply with 'OK'." }],
              max_tokens: 5,
            }),
          });
          const latencyMs = Math.round(performance.now() - startTime);

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
            return { success: false, message: errMsg, latencyMs };
          }
          return {
            success: true,
            message: `Connected successfully (${latencyMs}ms) • Model: ${model}`,
            latencyMs,
            model,
          };
        }

        case "ollama": {
          const baseUrl = config.baseUrl.trim() || DEFAULT_BASE_URLS.ollama;
          const url = `${baseUrl.replace(/\/+$/, "")}/api/generate`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model,
              prompt: "Reply with OK",
              stream: false,
            }),
          });
          const latencyMs = Math.round(performance.now() - startTime);

          if (!res.ok) {
            return { success: false, message: `Could not reach Ollama at ${baseUrl} (HTTP ${res.status})`, latencyMs };
          }
          return {
            success: true,
            message: `Connected to Ollama (${latencyMs}ms) • Model: ${model}`,
            latencyMs,
            model,
          };
        }

        case "openai-compatible": {
          const baseUrl = config.baseUrl.trim() || DEFAULT_BASE_URLS["openai-compatible"];
          const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (config.apiKey.trim()) {
            headers["Authorization"] = `Bearer ${config.apiKey.trim()}`;
          }
          const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({
              model: model || "default",
              messages: [{ role: "user", content: "Reply with OK" }],
              max_tokens: 5,
            }),
          });
          const latencyMs = Math.round(performance.now() - startTime);

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
            return { success: false, message: errMsg, latencyMs };
          }
          return {
            success: true,
            message: `Connected successfully (${latencyMs}ms) • Endpoint: ${baseUrl}`,
            latencyMs,
            model,
          };
        }
      }
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Network/Connection error: ${msg}`,
        latencyMs,
      };
    }
  }

  /**
   * Executes a real AI text transformation (paraphrase, rewrite, grammar, or summarize)
   * using the user's configured provider and credentials.
   */
  static async executePrompt(
    config: ProviderConfig,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const model = config.defaultModel || DEFAULT_MODELS[config.id];

    switch (config.id) {
      case "gemini": {
        const baseUrl = config.baseUrl.trim() || DEFAULT_BASE_URLS.gemini;
        const url = `${baseUrl.replace(/\/+$/, "")}/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(config.apiKey.trim())}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nTask: ${userPrompt}` }],
              },
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `Gemini API error: HTTP ${res.status}`);
        }
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return text.trim();
      }

      case "openai":
      case "groq":
      case "openai-compatible": {
        const defaultBase = config.id === "groq"
          ? DEFAULT_BASE_URLS.groq
          : config.id === "openai"
          ? DEFAULT_BASE_URLS.openai
          : DEFAULT_BASE_URLS["openai-compatible"];
        const baseUrl = config.baseUrl.trim() || defaultBase;
        const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (config.apiKey.trim()) {
          headers["Authorization"] = `Bearer ${config.apiKey.trim()}`;
        }
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `API error: HTTP ${res.status}`);
        }
        const data = await res.json();
        return (data.choices?.[0]?.message?.content || "").trim();
      }

      case "anthropic": {
        const baseUrl = config.baseUrl.trim() || DEFAULT_BASE_URLS.anthropic;
        const url = `${baseUrl.replace(/\/+$/, "")}/messages`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey.trim(),
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model,
            max_tokens: 2048,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `Claude API error: HTTP ${res.status}`);
        }
        const data = await res.json();
        return (data.content?.[0]?.text || "").trim();
      }

      case "ollama": {
        const baseUrl = config.baseUrl.trim() || DEFAULT_BASE_URLS.ollama;
        const url = `${baseUrl.replace(/\/+$/, "")}/api/generate`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            system: systemPrompt,
            prompt: userPrompt,
            stream: false,
          }),
        });
        if (!res.ok) {
          throw new Error(`Ollama error: HTTP ${res.status}`);
        }
        const data = await res.json();
        return (data.response || "").trim();
      }
    }
  }
}
