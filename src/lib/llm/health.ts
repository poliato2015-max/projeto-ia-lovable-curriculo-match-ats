import type { LLMConfig } from "./client";
import { logLLMHealthCheck } from "./logging";

export async function healthCheck(config: LLMConfig): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  const baseUrl = config.baseUrl || getDefaultBaseUrl(config.provider);
  const url = `${baseUrl.replace(/\/+$/, "")}/models`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 10000);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const latencyMs = Date.now() - start;

    if (!response.ok) {
      const error = `HTTP ${response.status}: ${await response.text().catch(() => "")}`;
      logLLMHealthCheck(config, false, latencyMs, error);
      return { ok: false, latencyMs, error };
    }

    // Verifica se a resposta tem estrutura esperada
    const data = await response.json().catch(() => null);
    const hasModels = data && Array.isArray(data.data) && data.data.length > 0;

    if (!hasModels) {
      const error = "Resposta /models inesperada ou vazia";
      logLLMHealthCheck(config, false, latencyMs, error);
      return { ok: false, latencyMs, error };
    }

    logLLMHealthCheck(config, true, latencyMs);
    return { ok: true, latencyMs };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const error = err instanceof Error ? err.message : String(err);
    logLLMHealthCheck(config, false, latencyMs, error);
    return { ok: false, latencyMs, error };
  }
}

function getDefaultBaseUrl(provider: string): string {
  switch (provider) {
    case "lovable":
      return "https://ai.gateway.lovable.dev/v1";
    case "nvidia":
      return "https://integrate.api.nvidia.com/v1";
    case "openai":
      return "https://api.openai.com/v1";
    case "openrouter":
      return "https://openrouter.ai/api/v1";
    case "groq":
      return "https://api.groq.com/openai/v1";
    case "together":
      return "https://api.together.xyz/v1";
    case "ollama":
      return "http://localhost:11434/v1";
    case "anthropic":
      return "https://api.anthropic.com/v1"; // Anthropic não tem /models compatível OpenAI
    default:
      return "https://api.openai.com/v1";
  }
}