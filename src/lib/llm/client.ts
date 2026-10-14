export interface ChatInput {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  responseSchema: Record<string, unknown>; // JSON Schema com strict: true
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatOutput {
  content: string; // JSON string válido conforme schema
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
  latencyMs: number;
  requestId?: string;
}

export interface LLMConfig {
  provider: "lovable" | "nvidia" | "openai" | "openrouter" | "groq" | "together" | "ollama" | "anthropic" | string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  orgId?: string;
  timeoutMs?: number;
}

export interface LLMClient {
  chatCompletion(input: ChatInput): Promise<ChatOutput>;
  healthCheck?(): Promise<{ ok: boolean; latencyMs: number; error?: string }>;
  config: LLMConfig;
}