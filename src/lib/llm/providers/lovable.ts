import type { LLMClient, LLMConfig, ChatInput, ChatOutput } from "../client";
import { mapProviderError } from "../errors";
import { logLLMCall } from "../logging";

const DEFAULT_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

export class LovableClient implements LLMClient {
  config: LLMConfig;
  private baseUrl: string;
  private model: string;

  constructor(config: LLMConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.model = config.model || DEFAULT_MODEL;
  }

  async chatCompletion(input: ChatInput): Promise<ChatOutput> {
    const start = Date.now();
    const requestId = `lovable-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: input.messages,
          response_format: {
            type: "json_schema",
            json_schema: { name: "ats_response", strict: true, schema: input.responseSchema },
          },
          temperature: input.temperature ?? 0.1,
          max_tokens: input.maxTokens ?? 4096,
        }),
        signal: AbortSignal.timeout(this.config.timeoutMs || 60000),
      });

      const latencyMs = Date.now() - start;

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        const errorCode = mapProviderError("lovable", response.status, errorText);
        logLLMCall({
          provider: "lovable",
          model: this.model,
          operation: input.messages[0]?.content?.includes("Análise") ? "analyzeWithAI" :
                     input.messages[0]?.content?.includes("currículo") ? "generateAtsWithAI" : "evaluateContentChecks",
          latencyMs,
          tokensIn: 0,
          tokensOut: 0,
          totalTokens: 0,
          status: "error",
          errorCode,
          requestId,
        });
        throw new Error(errorCode);
      }

      const payload = await response.json() as {
        choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
        usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
        id?: string;
      };

      const content = payload.choices?.[0]?.message?.content;
      const finishReason = payload.choices?.[0]?.finish_reason;
      const usage = payload.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      if (!content) {
        logLLMCall({
          provider: "lovable",
          model: this.model,
          operation: "analyzeWithAI",
          latencyMs,
          tokensIn: 0,
          tokensOut: 0,
          totalTokens: 0,
          status: "error",
          errorCode: "AI_UNAVAILABLE",
          requestId,
        });
        throw new Error("AI_UNAVAILABLE");
      }

      logLLMCall({
        provider: "lovable",
        model: this.model,
        operation: input.messages[0]?.content?.includes("Análise") ? "analyzeWithAI" :
                   input.messages[0]?.content?.includes("currículo") ? "generateAtsWithAI" : "evaluateContentChecks",
        latencyMs,
        tokensIn: usage.prompt_tokens,
        tokensOut: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        status: "success",
        requestId: payload.id || requestId,
      });

      return {
        content,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        model: this.model,
        provider: "lovable",
        latencyMs,
        requestId: payload.id || requestId,
      };
    } catch (err) {
      const latencyMs = Date.now() - start;
      if (err instanceof Error && ["AI_RATE_LIMIT", "AI_CREDITS", "AI_UNAVAILABLE"].includes(err.message)) {
        throw err;
      }
      logLLMCall({
        provider: "lovable",
        model: this.model,
        operation: "analyzeWithAI",
        latencyMs,
        tokensIn: 0,
        tokensOut: 0,
        totalTokens: 0,
        status: "error",
        errorCode: "AI_UNAVAILABLE",
        requestId,
      });
      throw new Error("AI_UNAVAILABLE");
    }
  }

  async healthCheck(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`${this.baseUrl}/models`, {
        method: "GET",
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;
      return { ok: response.ok, latencyMs, error: response.ok ? undefined : `HTTP ${response.status}` };
    } catch (err) {
      const latencyMs = Date.now() - start;
      return { ok: false, latencyMs, error: err instanceof Error ? err.message : String(err) };
    }
  }
}