export type ProviderId =
  | "openai"
  | "gemini"
  | "anthropic"
  | "openai-compatible"
  | "ollama"
  | "groq";

export interface ModelCapability {
  id: string;
  name: string;
  providerId: ProviderId;
  contextWindow: number;
  supportsStreaming: boolean;
  supportsStructuredOutput: boolean;
  recommendedFor?: Array<"general" | "grammar" | "rewrite" | "speed" | "economy">;
  isLocal?: boolean;
  description?: string;
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel: string;
  customModels?: string[];
  enabled: boolean;
  organizationId?: string;
}

export type StoragePreference = "local" | "session" | "none";

export interface SelectionContext {
  fullText?: string;
  selectedText: string;
  beforeText?: string;
  afterText?: string;
  startIndex?: number;
  endIndex?: number;
}

export interface AIRequestPayload {
  providerId: ProviderId;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  apiKey?: string;
  baseUrl?: string;
  taskType: string;
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  finishReason?: string;
  model?: string;
}

export interface AIStreamChunk {
  delta: string;
  done: boolean;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface ProviderStatus {
  isConfigured: boolean;
  isConnected?: boolean;
  lastChecked?: number;
  errorMessage?: string;
}
