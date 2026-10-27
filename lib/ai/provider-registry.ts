import { ProviderAdapter } from "./providers/types";
import { OpenAIAdapter } from "./providers/openai";
import { GeminiAdapter } from "./providers/gemini";
import { AnthropicAdapter } from "./providers/anthropic";
import { GroqAdapter } from "./providers/groq";
import { OllamaAdapter } from "./providers/ollama";
import { OpenAICompatibleAdapter } from "./providers/openai-compatible";
import { ProviderConfig, ProviderId, ModelCapability } from "@/types/provider";
import { PROVIDER_CATALOG, DEFAULT_MODELS, DEFAULT_BASE_URLS } from "./model-capabilities";
import { CredentialStorage } from "../security/api-key-storage";

class ProviderRegistry {
  private adapters: Map<ProviderId, ProviderAdapter> = new Map();

  constructor() {
    this.register(new OpenAIAdapter());
    this.register(new GeminiAdapter());
    this.register(new AnthropicAdapter());
    this.register(new GroqAdapter());
    this.register(new OllamaAdapter());
    this.register(new OpenAICompatibleAdapter());
  }

  register(adapter: ProviderAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(providerId: ProviderId): ProviderAdapter {
    const adapter = this.adapters.get(providerId);
    if (!adapter) {
      throw new Error(`Unsupported AI provider: "${providerId}".`);
    }
    return adapter;
  }

  getAllAdapters(): ProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Resolves the full current configuration for a provider, pulling stored credentials
   * and preferences from CredentialStorage.
   */
  resolveConfig(providerId: ProviderId): ProviderConfig {
    const apiKey = CredentialStorage.getApiKey(providerId);
    const baseUrl = CredentialStorage.getBaseUrl(providerId) || DEFAULT_BASE_URLS[providerId];
    const defaultModel = CredentialStorage.getDefaultModel(providerId) || DEFAULT_MODELS[providerId];

    return {
      id: providerId,
      name: PROVIDER_CATALOG[providerId]?.name || providerId,
      apiKey: apiKey || undefined,
      baseUrl: baseUrl || undefined,
      defaultModel,
      enabled: true,
    };
  }

  /**
   * Validates a provider's configuration.
   */
  validate(config: ProviderConfig): { isValid: boolean; error?: string } {
    const adapter = this.getAdapter(config.id);
    return adapter.validateConfig(config);
  }

  /**
   * Tests live connectivity for a provider.
   */
  async testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const adapter = this.getAdapter(config.id);
    return adapter.testConnection(config);
  }

  /**
   * Fetches models for a provider.
   */
  async listModels(config: ProviderConfig): Promise<ModelCapability[]> {
    const adapter = this.getAdapter(config.id);
    return adapter.listModels(config);
  }

  /**
   * Formats error message for user display.
   */
  normalizeError(providerId: ProviderId, error: unknown): string {
    const adapter = this.adapters.get(providerId);
    return adapter ? adapter.normalizeError(error) : String(error);
  }
}

export const providerRegistry = new ProviderRegistry();
