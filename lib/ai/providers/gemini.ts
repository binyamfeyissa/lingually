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
      const rawList: any[] = data.models || [];

      // Filter for models supporting content generation and exclude known deprecated models
      const validGenerative = rawList.filter((m) => {
        const methods: string[] = m.supportedGenerationMethods || [];
        const isGenerative = methods.length === 0 || methods.includes("generateContent");
        const id = (m.name || "").replace(/^models\//, "");
        // Exclude retired models reported in Bug 45 (2.5, 2.0, and 1.5 families)
        const retiredIds = [
          "gemini-2.5-flash",
          "gemini-2.5-pro",
          "gemini-2.0-flash",
          "gemini-1.5-flash",
          "gemini-1.5-pro",
        ];
        if (retiredIds.includes(id)) return false;
        return isGenerative;
      });

      if (validGenerative.length === 0) {
        return PROVIDER_CATALOG.gemini.popularModels;
      }

      // Map models dynamically to ModelCapability
      const capabilities: ModelCapability[] = validGenerative.map((m) => {
        const id = (m.name || "").replace(/^models\//, "");
        const matchedPopular = PROVIDER_CATALOG.gemini.popularModels.find((p) => p.id === id);
        if (matchedPopular) return matchedPopular;

        return {
          id,
          name: m.displayName || id,
          providerId: "gemini",
          contextWindow: m.inputTokenLimit || 1048576,
          supportsStreaming: true,
          supportsStructuredOutput: true,
          recommendedFor: id.includes("flash") ? ["speed", "grammar", "general"] : ["rewrite", "general"],
          description: m.description || `Google Gemini model ${id}.`,
        };
      });

      // Sort so popular models appear at the top
      capabilities.sort((a, b) => {
        const aPop = PROVIDER_CATALOG.gemini.popularModels.findIndex((p) => p.id === a.id);
        const bPop = PROVIDER_CATALOG.gemini.popularModels.findIndex((p) => p.id === b.id);
        if (aPop !== -1 && bPop !== -1) return aPop - bPop;
        if (aPop !== -1) return -1;
        if (bPop !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

      return capabilities;
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
