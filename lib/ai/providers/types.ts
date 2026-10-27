import { AIResponse, ModelCapability, ProviderConfig, ProviderId } from "@/types/provider";

export interface ProviderAdapter {
  id: ProviderId;
  name: string;

  /**
   * Validates whether the provider configuration contains required fields.
   */
  validateConfig(config: ProviderConfig): { isValid: boolean; error?: string };

  /**
   * Tests live connectivity to the provider using the configured credentials.
   */
  testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string; latencyMs?: number }>;

  /**
   * Lists available models from the provider or returns predefined catalog models.
   */
  listModels(config: ProviderConfig): Promise<ModelCapability[]>;

  /**
   * Normalizes provider-specific errors into user-friendly diagnostic messages.
   */
  normalizeError(error: unknown): string;
}
