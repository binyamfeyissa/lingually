import { ModelCapability, ProviderConfig } from "@/types/provider";
import { ProviderAdapter } from "./types";
import { PROVIDER_CATALOG } from "../model-capabilities";
import { sanitizeErrorMessage } from "@/lib/security/sanitization";

export class GroqAdapter implements ProviderAdapter {
  id = "groq" as const;
  name = "Groq";

  validateConfig(config: ProviderConfig): { isValid: boolean; error?: string } {
    const key = config.apiKey?.trim();
    if (!key) {
      return { isValid: false, error: "Groq API key is required." };
    }
    if (!key.startsWith("gsk_")) {
      return {
        isValid: false,
        error: "Groq API keys typically start with 'gsk_'. Please check your key from console.groq.com.",
      };
    }
    return { isValid: true };
  }

  async testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.error || "Invalid Groq configuration.",
      };
    }

    const start = Date.now();
    try {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.apiKey?.trim()}`,
        },
      });

      const latencyMs = Date.now() - start;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const rawMsg = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        const msg = sanitizeErrorMessage(rawMsg, config.apiKey);
        return { success: false, message: msg, latencyMs };
      }

      return {
        success: true,
        message: `Successfully connected to Groq LPU (${latencyMs}ms).`,
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
    if (!config.apiKey) return PROVIDER_CATALOG.groq.popularModels;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${config.apiKey.trim()}` },
      });
      if (!res.ok) return PROVIDER_CATALOG.groq.popularModels;

      const data = await res.json();
      const ids = new Set((data.data || []).map((m: { id: string }) => m.id));
      const matched = PROVIDER_CATALOG.groq.popularModels.filter((m) => ids.has(m.id));
      return matched.length > 0 ? matched : PROVIDER_CATALOG.groq.popularModels;
    } catch {
      return PROVIDER_CATALOG.groq.popularModels;
    }
  }

  normalizeError(error: unknown): string {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      const err = error as { message?: string; status?: number };
      if (err.status === 401) {
        return "Invalid Groq API key. Check your credentials in console.groq.com.";
      }
      if (err.status === 429) {
        return "Groq rate limit exceeded. Please wait a few seconds before retrying.";
      }
      if (err.message) return err.message;
    }
    return "Failed to communicate with Groq. Check your network or API credentials.";
  }
}
