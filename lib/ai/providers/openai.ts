import { ModelCapability, ProviderConfig } from "@/types/provider";
import { ProviderAdapter } from "./types";
import { PROVIDER_CATALOG } from "../model-capabilities";
import { sanitizeErrorMessage } from "@/lib/security/sanitization";

export class OpenAIAdapter implements ProviderAdapter {
  id = "openai" as const;
  name = "OpenAI";

  validateConfig(config: ProviderConfig): { isValid: boolean; error?: string } {
    if (!config.apiKey || !config.apiKey.trim()) {
      return { isValid: false, error: "OpenAI API key is required." };
    }
    if (!config.apiKey.startsWith("sk-")) {
      return {
        isValid: false,
        error: "OpenAI API keys typically start with 'sk-'. Please check your key.",
      };
    }
    return { isValid: true };
  }

  async testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const start = Date.now();
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.apiKey?.trim()}`,
          ...(config.organizationId ? { "OpenAI-Organization": config.organizationId } : {}),
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
        message: `Successfully connected to OpenAI (${latencyMs}ms).`,
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
    if (!config.apiKey) return PROVIDER_CATALOG.openai.popularModels;

    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${config.apiKey.trim()}` },
      });
      if (!res.ok) return PROVIDER_CATALOG.openai.popularModels;

      const data = await res.json();
      const availableIds = new Set((data.data || []).map((m: { id: string }) => m.id));

      // Filter catalog models that are accessible
      const models = PROVIDER_CATALOG.openai.popularModels.filter((m) =>
        availableIds.has(m.id)
      );

      return models.length > 0 ? models : PROVIDER_CATALOG.openai.popularModels;
    } catch {
      return PROVIDER_CATALOG.openai.popularModels;
    }
  }

  normalizeError(error: unknown): string {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      const err = error as { message?: string; status?: number; code?: string };
      if (err.status === 401 || err.code === "invalid_api_key") {
        return "Invalid OpenAI API key. Please verify your credentials in Settings.";
      }
      if (err.status === 429 || err.code === "insufficient_quota") {
        return "OpenAI rate limit or credit quota exceeded. Check your plan at platform.openai.com.";
      }
      if (err.message) return err.message;
    }
    return "Failed to communicate with OpenAI. Check network connectivity and credentials.";
  }
}
