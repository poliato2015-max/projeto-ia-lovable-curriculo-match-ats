import type { LLMClient, LLMConfig, ChatInput, ChatOutput } from "../client";
import { mapProviderError } from "../errors";
import { logLLMCall } from "../logging";

export class OpenAICompatibleClient implements LLMClient {
  config: LLMConfig;
  protected baseUrl: string;
  protected model: string;

  constructor(config: LLMConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://api.openai.com/v1";
    this.model = config.model || "gpt-4o-mini";
  }

  async chatCompletion(input: ChatInput): Promise<ChatOutput> {
    const start = Date.now();
    const requestId = `openai-compat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
    };

    // OpenAI-compatible providers may need org header
    if (this.config.orgId) {
      headers["OpenAI-Organization"] = this.config.orgId;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers,
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
        const providerKey = this.getProviderKey();
        const errorCode = mapProviderError(providerKey, response.status, errorText);
        logLLMCall({
          provider: providerKey,
          model: this.model,
          operation: this.detectOperation(input.messages),
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
      const usage = payload.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      if (!content) {
        logLLMCall({
          provider: this.getProviderKey(),
          model: this.model,
          operation: this.detectOperation(input.messages),
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
        provider: this.getProviderKey(),
        model: this.model,
        operation: this.detectOperation(input.messages),
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
        provider: this.getProviderKey(),
        latencyMs,
        requestId: payload.id || requestId,
      };
    } catch (err) {
      const latencyMs = Date.now() - start;
      if (err instanceof Error && ["AI_RATE_LIMIT", "AI_CREDITS", "AI_UNAVAILABLE"].includes(err.message)) {
        throw err;
      }
      logLLMCall({
        provider: this.getProviderKey(),
        model: this.model,
        operation: this.detectOperation(input.messages),
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
      if (!response.ok) {
        return { ok: false, latencyMs, error: `HTTP ${response.status}` };
      }
      const data = await response.json().catch(() => null);
      const hasModels = data && Array.isArray(data.data) && data.data.length > 0;
      return { ok: hasModels, latencyMs, error: hasModels ? undefined : "Resposta /models vazia" };
    } catch (err) {
      const latencyMs = Date.now() - start;
      return { ok: false, latencyMs, error: err instanceof Error ? err.message : String(err) };
    }
  }

  protected getProviderKey(): string {
    return this.config.provider;
  }

  protected detectOperation(messages: ChatInput["messages"]): "analyzeWithAI" | "generateAtsWithAI" | "evaluateContentChecks" {
    const systemContent = messages.find(m => m.role === "system")?.content || "";
    const userContent = messages.find(m => m.role === "user")?.content || "";
    const combined = systemContent + userContent;

    if (combined.includes("Análise") || combined.includes("ATS") || combined.includes("compatibilidade")) {
      return "analyzeWithAI";
    }
    if (combined.includes("currículo") || combined.includes("resume") || combined.includes("OTIMIZAD")) {
      return "generateAtsWithAI";
    }
    if (combined.includes("audita") || combined.includes("checklist") || combined.includes("CURRÍCULO ATS")) {
      return "evaluateContentChecks";
    }
    return "analyzeWithAI"; // default
  }
}