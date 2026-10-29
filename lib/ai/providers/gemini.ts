import { ModelCapability, ProviderConfig } from "@/types/provider";
import { ProviderAdapter } from "./types";
import { PROVIDER_CATALOG } from "../model-capabilities";
import { sanitizeErrorMessage } from "@/lib/security/sanitization";

export class GeminiAdapter implements ProviderAdapter {
  id = "gemini" as const;
  name = "Google Gemini";

  validateConfig(config: ProviderConfig): { isValid: boolean; error?: string } {
    const key = config.apiKey?.trim();
    if (!key) {
      return { isValid: false, error: "Google Gemini API key is required." };
    }
    return { isValid: true };
  }

  async testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.error || "Invalid Google Gemini configuration.",
      };
    }

    const start = Date.now();
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey?.trim()}`,
        { method: "GET" }
      );

      const latencyMs = Date.now() - start;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const rawMsg = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        const msg = sanitizeErrorMessage(rawMsg, config.apiKey);
        return { success: false, message: msg, latencyMs };
      }

      return {
        success: true,
        message: `Successfully connected to Google Gemini (${latencyMs}ms).`,
        latencyMs,
      };
    } catch (err: unknown) {
      return {
        success: false,
        message: sanitizeErrorMessage(this.normalizeError(err), config.apiKey),
        latencyMs: Date.now() - start,
      };
    }
  }

  async listModels(config: ProviderConfig): Promise<ModelCapability[]> {
    if (!config.apiKey) return PROVIDER_CATALOG.gemini.popularModels;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey.trim()}`
      );
      if (!res.ok) return PROVIDER_CATALOG.gemini.popularModels;

      const data = await res.json();
      const apiModels = (data.models || []).map((m: { name: string; displayName?: string }) => {
        const id = m.name.replace(/^models\//, "");
        return id;
      });

      const set = new Set(apiModels);
      const matched = PROVIDER_CATALOG.gemini.popularModels.filter((m) => set.has(m.id));
      return matched.length > 0 ? matched : PROVIDER_CATALOG.gemini.popularModels;
    } catch {
      return PROVIDER_CATALOG.gemini.popularModels;
    }
  }

  normalizeError(error: unknown): string {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      const err = error as { message?: string; status?: number };
      if (err.status === 400 || err.message?.includes("API_KEY_INVALID")) {
        return "Invalid Gemini API key. Please check your credentials in Google AI Studio.";
      }
      if (err.status === 429 || err.message?.includes("RESOURCE_EXHAUSTED")) {
        return "Gemini quota or rate limit exceeded. Check your quota at aistudio.google.com.";
      }
      if (err.message) return err.message;
    }
    return "Failed to communicate with Google Gemini. Check your network or API key.";
  }
}
