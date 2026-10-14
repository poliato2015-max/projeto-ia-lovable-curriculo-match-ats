import type { LLMClient } from "@/lib/llm/client";
import { buildPrompt, responseSchema, SYSTEM_PROMPT, type ContentChecksInput, type ContentChecksOutput } from "@/lib/prompts/ats-checklist.prompt";

/** Avalia os critérios de conteúdo do Checklist ATS com base no conteúdo real. */
export async function evaluateContentChecks(
  client: LLMClient,
  input: ContentChecksInput,
): Promise<ContentChecksOutput> {
  const response = await client.chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildPrompt(input) },
    ],
    responseSchema,
    model: client.config.model,
    temperature: 0.1,
    maxTokens: 4096,
  });

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(response.content) as Record<string, unknown>;
  } catch {
    throw new Error("AI_UNAVAILABLE");
  }

  const text = (key: string, fallback: string) =>
    typeof parsed[key] === "string" && (parsed[key] as string).trim()
      ? (parsed[key] as string).trim()
      : fallback;

  const originalOk = parsed["originalOnlyPass"] === true;
  const languageOk = parsed["objectiveLanguagePass"] === true;
  const sectionsOk = parsed["sectionsPass"] === true;

  return {
    sections: {
      status: sectionsOk ? "pass" : "warn",
      detail: text(
        "sectionsDetail",
        sectionsOk
          ? "As seções estão claramente nomeadas e organizadas."
          : "As seções do currículo não estão claramente identificadas com títulos reconhecíveis.",
      ),
    },

    originalOnly: {
      status: originalOk ? "pass" : "warn",
      detail: text(
        "originalOnlyDetail",
        originalOk
          ? "Todo o conteúdo está fundamentado no currículo original."
          : "Há informação factual sem base no currículo original.",
      ),
    },
    objectiveLanguage: {
      status: languageOk ? "pass" : "warn",
      detail: text(
        "objectiveLanguageDetail",
        languageOk
          ? "Redação objetiva e adequada para currículo."
          : "A redação está prolixa ou repetitiva em partes do texto.",
      ),
    },
  };
}