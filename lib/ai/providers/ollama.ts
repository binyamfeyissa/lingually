import { ModelCapability, ProviderConfig } from "@/types/provider";
import { ProviderAdapter } from "./types";
import { PROVIDER_CATALOG } from "../model-capabilities";
import { validateBaseUrl } from "@/lib/security/validation";

export class OllamaAdapter implements ProviderAdapter {
  id = "ollama" as const;
  name = "Ollama (Local)";

  validateConfig(config: ProviderConfig): { isValid: boolean; error?: string } {
    const baseUrl = config.baseUrl?.trim() || "http://localhost:11434";
    const validation = validateBaseUrl(baseUrl, true); // Allow localhost for Ollama
    if (!validation.isValid) {
      return { isValid: false, error: validation.error };
    }
    return { isValid: true };
  }

  async testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const start = Date.now();
    const baseUrl = (config.baseUrl?.trim() || "http://localhost:11434").replace(/\/+$/, "");

    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: "GET",
      });

      const latencyMs = Date.now() - start;

      if (!response.ok) {
        return {
          success: false,
          message: `Ollama returned HTTP ${response.status}: ${response.statusText}`,
          latencyMs,
        };
      }

      const data = await response.json();
      const count = data.models ? data.models.length : 0;
      return {
        success: true,
        message: `Connected to Ollama (${latencyMs}ms). Found ${count} locally installed model${count === 1 ? "" : "s"}.`,
        latencyMs,
      };
    } catch (err: unknown) {
      return {
        success: false,
        message:
          "Unable to reach Ollama at " +
          baseUrl +
          ". Ensure Ollama is running (`ollama serve`) and CORS is permitted (`OLLAMA_ORIGINS=\"*\"`).",
        latencyMs: Date.now() - start,
      };
    }
  }

  async listModels(config: ProviderConfig): Promise<ModelCapability[]> {
    const baseUrl = (config.baseUrl?.trim() || "http://localhost:11434").replace(/\/+$/, "");

    try {
      const res = await fetch(`${baseUrl}/api/tags`);
      if (!res.ok) return PROVIDER_CATALOG.ollama.popularModels;

      const data = await res.json();
      if (!data.models || !Array.isArray(data.models) || data.models.length === 0) {
        return PROVIDER_CATALOG.ollama.popularModels;
      }

      return data.models.map((m: { name: string; size?: number }) => ({
        id: m.name,
        name: m.name,
        providerId: "ollama" as const,
        contextWindow: 8192,
        supportsStreaming: true,
        supportsStructuredOutput: false,
        isLocal: true,
        description: m.size ? `Local model (${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB)` : "Locally pulled Ollama model",
      }));
    } catch {
      return PROVIDER_CATALOG.ollama.popularModels;
    }
  }

  normalizeError(error: unknown): string {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      const err = error as { message?: string };
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        return "Cannot connect to local Ollama. Start it with `ollama serve`. If using browser requests directly, launch with `OLLAMA_ORIGINS=\"*\" ollama serve`.";
      }
      if (err.message) return err.message;
    }
    return "Failed to communicate with Ollama service.";
  }
}
