import { ModelCapability, ProviderConfig } from "@/types/provider";
import { ProviderAdapter } from "./types";
import { PROVIDER_CATALOG } from "../model-capabilities";
import { sanitizeErrorMessage } from "@/lib/security/sanitization";

export class AnthropicAdapter implements ProviderAdapter {
  id = "anthropic" as const;
  name = "Anthropic Claude";

  validateConfig(config: ProviderConfig): { isValid: boolean; error?: string } {
    const key = config.apiKey?.trim();
    if (!key) {
      return { isValid: false, error: "Anthropic API key is required." };
    }
    return { isValid: true };
  }

  async testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.error || "Invalid Anthropic configuration.",
      };
    }

    const start = Date.now();
    try {
      const response = await fetch("https://api.anthropic.com/v1/models", {
        method: "GET",
        headers: {
          "x-api-key": config.apiKey?.trim() || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
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
        message: `Successfully connected to Anthropic Claude (${latencyMs}ms).`,
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
    if (!config.apiKey) return PROVIDER_CATALOG.anthropic.popularModels;

    try {
      const res = await fetch("https://api.anthropic.com/v1/models", {
        headers: {
          "x-api-key": config.apiKey.trim(),
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
      });
      if (!res.ok) return PROVIDER_CATALOG.anthropic.popularModels;

      const data = await res.json();
      const ids = new Set((data.data || []).map((m: { id: string }) => m.id));
      const matched = PROVIDER_CATALOG.anthropic.popularModels.filter((m) => ids.has(m.id));
      return matched.length > 0 ? matched : PROVIDER_CATALOG.anthropic.popularModels;
    } catch {
      return PROVIDER_CATALOG.anthropic.popularModels;
    }
  }

  normalizeError(error: unknown): string {
    if (typeof error === "string") {
      if (/failed to fetch/i.test(error)) {
        return "Unable to reach Anthropic Claude API from browser. Please check network connection and credentials.";
      }
      return error;
    }
    if (error && typeof error === "object") {
      const err = error as { message?: string; status?: number };
      if (err.status === 401) {
        return "Invalid Anthropic API key. Check your credentials in console.anthropic.com.";
      }
      if (err.status === 429) {
        return "Anthropic rate limit reached. Please wait a moment before trying again.";
      }
      if (err.message) {
        if (/failed to fetch/i.test(err.message)) {
          return "Unable to reach Anthropic Claude API from browser. Please check network connection and credentials.";
        }
        return err.message;
      }
    }
    return "Failed to connect to Anthropic Claude. Check network and API credentials.";
  }
}
