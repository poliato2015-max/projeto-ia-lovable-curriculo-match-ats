import type { ChatOutput, LLMConfig } from "./client";

export interface LogLLMCallParams {
  provider: string;
  model: string;
  operation: "analyzeWithAI" | "generateAtsWithAI" | "evaluateContentChecks";
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  status: "success" | "error";
  errorCode?: string;
  requestId?: string;
  estimatedCostUsd?: number;
}

const PRICING_USD_PER_1M: Record<string, { input: number; output: number }> = {
  "nvidia/nemotron-3-ultra": { input: 3.0, output: 10.0 },
  "nvidia/llama-3.1-nemotron-70b-instruct": { input: 1.5, output: 5.0 },
  "nvidia/nemotron-3-8b": { input: 0.2, output: 0.6 },
  "google/gemini-2.5-flash": { input: 0.0, output: 0.0 }, // Lovable credits (opaco)
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "claude-3-5-sonnet": { input: 3.0, output: 15.0 },
  "claude-3-5-haiku": { input: 0.25, output: 1.25 },
};

function estimateCost(provider: string, model: string, tokensIn: number, tokensOut: number): number | null {
  const pricing = PRICING_USD_PER_1M[model];
  if (!pricing) return null;
  return (tokensIn / 1_000_000) * pricing.input + (tokensOut / 1_000_000) * pricing.output;
}

export function logLLMCall(params: LogLLMCallParams): void {
  const estimatedCost = estimateCost(params.provider, params.model, params.tokensIn, params.tokensOut);

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: "info",
    provider: params.provider,
    model: params.model,
    operation: params.operation,
    latencyMs: params.latencyMs,
    tokensIn: params.tokensIn,
    tokensOut: params.tokensOut,
    totalTokens: params.totalTokens,
    estimatedCostUsd: estimatedCost ?? null,
    status: params.status,
    errorCode: params.errorCode ?? null,
    requestId: params.requestId ?? null,
  };

  // Console JSON para fácil parsing em log aggregators (Vercel, Cloudflare, Datadog, etc.)
  console.log(JSON.stringify(logEntry));
}

export function logLLMHealthCheck(config: LLMConfig, ok: boolean, latencyMs: number, error?: string): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: ok ? "info" : "warn",
    event: "llm_health_check",
    provider: config.provider,
    model: config.model,
    baseUrl: config.baseUrl ?? "default",
    ok,
    latencyMs,
    error: error ?? null,
  };
  console.log(JSON.stringify(logEntry));
}