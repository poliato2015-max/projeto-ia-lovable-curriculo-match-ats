import type { LLMClient } from "@/lib/llm/client";
import { buildPrompt, responseSchema, toStringArray, SYSTEM_PROMPT, type GenerateAtsInput, type GenerateAtsOutput } from "@/lib/prompts/ats-resume.prompt";

/** Gera o currículo ATS a partir do currículo original, sem inventar informações. */
export async function generateAtsWithAI(client: LLMClient, input: GenerateAtsInput): Promise<GenerateAtsOutput> {
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

  const content = typeof parsed["content"] === "string" ? parsed["content"].trim() : "";
  if (!content) throw new Error("AI_UNAVAILABLE");

  return {
    content,
    keywordsUsed: toStringArray(parsed["keywordsUsed"]),
    omittedKeywords: toStringArray(parsed["omittedKeywords"]),
    notes: typeof parsed["notes"] === "string" ? parsed["notes"] : "",
  };
}