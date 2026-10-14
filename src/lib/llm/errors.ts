export type AIErrorCode = "AI_RATE_LIMIT" | "AI_CREDITS" | "AI_UNAVAILABLE";

export interface ProviderErrorMap {
  [provider: string]: {
    rateLimit: number[];
    credits: number[];
    unavailable: number[];
  };
}

export const PROVIDER_ERROR_MAP: ProviderErrorMap = {
  lovable: {
    rateLimit: [429],
    credits: [402],
    unavailable: [400, 401, 500, 502, 503, 504],
  },
  nvidia: {
    rateLimit: [429],
    credits: [402],
    unavailable: [400, 401, 500, 502, 503, 504],
  },
  openai: {
    rateLimit: [429],
    credits: [402],
    unavailable: [400, 401, 500, 502, 503, 504],
  },
  openrouter: {
    rateLimit: [429],
    credits: [402],
    unavailable: [400, 401, 500, 502, 503, 504],
  },
  groq: {
    rateLimit: [429],
    credits: [402],
    unavailable: [400, 401, 500, 502, 503, 504],
  },
  together: {
    rateLimit: [429],
    credits: [402],
    unavailable: [400, 401, 500, 502, 503, 504],
  },
  ollama: {
    rateLimit: [429],
    credits: [],
    unavailable: [400, 401, 500, 502, 503, 504],
  },
  anthropic: {
    rateLimit: [429],
    credits: [402],
    unavailable: [400, 401, 500, 502, 503, 504],
  },
};

export function mapProviderError(
  provider: string,
  httpStatus: number,
  _body: unknown,
): AIErrorCode {
  const map = PROVIDER_ERROR_MAP[provider] || PROVIDER_ERROR_MAP.openai;
  if (map.rateLimit.includes(httpStatus)) return "AI_RATE_LIMIT";
  if (map.credits.includes(httpStatus)) return "AI_CREDITS";
  return "AI_UNAVAILABLE";
}