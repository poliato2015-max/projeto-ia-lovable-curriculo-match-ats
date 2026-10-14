import { OpenAICompatibleClient } from "./openai-compatible";
import type { LLMConfig } from "../client";

const NVIDIA_KNOWN_MODELS = [
  "nvidia/nemotron-3-ultra",
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "nvidia/nemotron-3-8b",
  "meta/llama-3.1-405b-instruct",
  "mistralai/mistral-large",
] as const;

export class NvidiaClient extends OpenAICompatibleClient {
  constructor(config: LLMConfig) {
    // Defaults específicos NVIDIA
    const nvidiaConfig: LLMConfig = {
      ...config,
      provider: "nvidia",
      baseUrl: config.baseUrl || "https://integrate.api.nvidia.com/v1",
      model: config.model || "nvidia/nemotron-3-ultra",
    };
    super(nvidiaConfig);
  }

  protected getProviderKey(): string {
    return "nvidia";
  }

  // Validação opcional: avisa se modelo não está na lista conhecida
  validateModel(): boolean {
    return NVIDIA_KNOWN_MODELS.includes(this.model as typeof NVIDIA_KNOWN_MODELS[number]);
  }

  getKnownModels(): readonly string[] {
    return NVIDIA_KNOWN_MODELS;
  }
}