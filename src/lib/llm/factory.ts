import type { LLMClient, LLMConfig } from "./client";
import { LovableClient } from "./providers/lovable";
import { NvidiaClient } from "./providers/nvidia";
import { OpenAICompatibleClient } from "./providers/openai-compatible";

export function createLLMClient(config: LLMConfig): LLMClient {
  switch (config.provider) {
    case "lovable":
      return new LovableClient(config);
    case "nvidia":
      return new NvidiaClient(config);
    case "openai":
    case "openrouter":
    case "groq":
    case "together":
    case "ollama":
      return new OpenAICompatibleClient(config);
    case "anthropic":
      // TODO: Implementar AnthropicClient dedicado (tool_choice para structured output)
      // Por enquanto usa base OpenAI-compatible se endpoint compatível
      return new OpenAICompatibleClient(config);
    default:
      // Fallback genérico OpenAI-compatible para provedores custom
      return new OpenAICompatibleClient(config);
  }
}

export function getDefaultConfig(provider: string): Partial<LLMConfig> {
  switch (provider) {
    case "lovable":
      return {
        baseUrl: "https://ai.gateway.lovable.dev/v1",
        model: "google/gemini-2.5-flash",
      };
    case "nvidia":
      return {
        baseUrl: "https://integrate.api.nvidia.com/v1",
        model: "nvidia/nemotron-3-ultra",
      };
    case "openai":
      return {
        baseUrl: "https://api.openai.com/v1",
        model: "gpt-4o-mini",
      };
    case "openrouter":
      return {
        baseUrl: "https://openrouter.ai/api/v1",
        model: "openai/gpt-4o-mini",
      };
    case "groq":
      return {
        baseUrl: "https://api.groq.com/openai/v1",
        model: "llama-3.1-70b-versatile",
      };
    case "together":
      return {
        baseUrl: "https://api.together.xyz/v1",
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      };
    case "ollama":
      return {
        baseUrl: "http://localhost:11434/v1",
        model: "llama3.1:70b",
      };
    default:
      return {};
  }
}