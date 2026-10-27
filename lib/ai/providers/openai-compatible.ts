import { ModelCapability, ProviderConfig } from "@/types/provider";
import { ProviderAdapter } from "./types";
import { PROVIDER_CATALOG } from "../model-capabilities";
import { validateBaseUrl } from "@/lib/security/validation";

export class OpenAICompatibleAdapter implements ProviderAdapter {
  id = "openai-compatible" as const;
  name = "OpenAI-Compatible Endpoint";

  validateConfig(config: ProviderConfig): { isValid: boolean; error?: string } {
    if (!config.baseUrl || !config.baseUrl.trim()) {
      return { isValid: false, error: "Base URL is required for OpenAI-compatible endpoints." };
    }
    const validation = validateBaseUrl(config.baseUrl, true);
    if (!validation.isValid) {
      return { isValid: false, error: validation.error };
    }
    return { isValid: true };
  }

  async testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const start = Date.now();
    const baseUrl = (config.baseUrl?.trim() || "http://localhost:1234/v1").replace(/\/+$/, "");

    try {
      const headers: Record<string, string> = {};
      if (config.apiKey?.trim()) {
        headers["Authorization"] = `Bearer ${config.apiKey.trim()}`;
      }

      const response = await fetch(`${baseUrl}/models`, {
        method: "GET",
        headers,
      });

      const latencyMs = Date.now() - start;

      if (!response.ok) {
        return {
          success: false,
          message: `Endpoint returned HTTP ${response.status}: ${response.statusText}`,
          latencyMs,
        };
      }

      const data = await response.json();
      const count = Array.isArray(data.data) ? data.data.length : 1;
      return {
        success: true,
        message: `Connected successfully to custom endpoint (${latencyMs}ms). Found ${count} model${count === 1 ? "" : "s"}.`,
        latencyMs,
      };
    } catch (err: unknown) {
      return {
        success: false,
        message:
          "Unable to connect to endpoint at " +
          baseUrl +
          ". Verify URL, server status, network connectivity, and CORS headers.",
        latencyMs: Date.now() - start,
      };
    }
  }

  async listModels(config: ProviderConfig): Promise<ModelCapability[]> {
    const baseUrl = (config.baseUrl?.trim() || "http://localhost:1234/v1").replace(/\/+$/, "");
    if (!baseUrl) return PROVIDER_CATALOG["openai-compatible"].popularModels;

    try {
      const headers: Record<string, string> = {};
      if (config.apiKey?.trim()) {
        headers["Authorization"] = `Bearer ${config.apiKey.trim()}`;
      }

      const res = await fetch(`${baseUrl}/models`, { headers });
      if (!res.ok) return PROVIDER_CATALOG["openai-compatible"].popularModels;

      const data = await res.json();
      if (!Array.isArray(data.data) || data.data.length === 0) {
        return PROVIDER_CATALOG["openai-compatible"].popularModels;
      }

      return data.data.map((m: { id: string }) => ({
        id: m.id,
        name: m.id,
        providerId: "openai-compatible" as const,
        contextWindow: 32768,
        supportsStreaming: true,
        supportsStructuredOutput: false,
        description: "Compatible endpoint model",
      }));
    } catch {
      return PROVIDER_CATALOG["openai-compatible"].popularModels;
    }
  }

  normalizeError(error: unknown): string {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      const err = error as { message?: string };
      if (err.message) return err.message;
    }
    return "Failed to communicate with the OpenAI-compatible endpoint.";
  }
}
