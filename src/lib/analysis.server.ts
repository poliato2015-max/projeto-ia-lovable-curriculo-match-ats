import { getScoreTier } from "@/lib/ats-score";
import type { AnalysisResult, SkillItem } from "@/components/analysis/analysis-types";
import type { LLMClient } from "@/lib/llm/client";
import { buildPrompt, responseSchema, sanitizeSkills, toStringArray, type AnalyzeInput } from "@/lib/prompts/analysis.prompt";

/** Executa a análise ATS através do LLMClient injetado. */
export async function analyzeWithAI(client: LLMClient, input: AnalyzeInput): Promise<AnalysisResult> {
  const response = await client.chatCompletion({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em recrutamento e sistemas ATS. Avalie currículos com rigor, sem inventar experiências inexistentes.",
      },
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

  const keywordsFound = toStringArray(parsed["keywordsFound"]);
  const keywordsMissing = toStringArray(parsed["keywordsMissing"]);
  const score = Math.max(0, Math.min(100, Number(parsed["score"]) || 0));

  return {
    score,
    scoreLabel: `${getScoreTier(score).label} — ${score}% de compatibilidade com esta vaga.`,
    hardSkills: sanitizeSkills(parsed["hardSkills"]),
    softSkills: sanitizeSkills(parsed["softSkills"]),
    keywords: {
      found: keywordsFound.length,
      total: keywordsFound.length + keywordsMissing.length,
    },
    experienceMatch: Math.max(0, Math.min(100, Number(parsed["experienceMatch"]) || 0)),
    education: typeof parsed["education"] === "string" ? parsed["education"] : "—",
    languages: toStringArray(parsed["languages"]),
    recommendations: toStringArray(parsed["recommendations"]),
    summary: typeof parsed["summary"] === "string" ? parsed["summary"] : "",
    jobSummary: typeof parsed["jobSummary"] === "string" ? parsed["jobSummary"] : "",
    strengths: toStringArray(parsed["strengths"]),
    keywordsFound,
    keywordsMissing,
    improvements: toStringArray(parsed["improvements"]),
    nextSteps: toStringArray(parsed["nextSteps"]),
  };
}