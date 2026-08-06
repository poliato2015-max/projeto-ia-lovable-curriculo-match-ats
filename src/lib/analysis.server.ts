import { getScoreTier } from "@/lib/ats-score";
import type { AnalysisResult, SkillItem } from "@/components/analysis/analysis-types";

const AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const isDev = process.env["NODE_ENV"] !== "production";
function devLog(...args: unknown[]) {
  if (isDev) console.log("[analysis]", ...args);
}

export interface AnalyzeInput {
  jobTitle: string;
  company: string;
  jobUrl: string;
  jobDescription: string;
  resumeText: string;
  objectives: string[];
  instructions: string;
}

const skillSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "status", "description"],
  properties: {
    name: { type: "string" },
    status: { type: "string", enum: ["match", "partial", "missing"] },
    description: { type: "string" },
  },
} as const;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "score",
    "summary",
    "jobSummary",
    "hardSkills",
    "softSkills",
    "keywordsFound",
    "keywordsMissing",
    "experienceMatch",
    "education",
    "languages",
    "strengths",
    "recommendations",
    "improvements",
    "nextSteps",
  ],
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string" },
    jobSummary: { type: "string" },
    hardSkills: { type: "array", items: skillSchema },
    softSkills: { type: "array", items: skillSchema },
    keywordsFound: { type: "array", items: { type: "string" } },
    keywordsMissing: { type: "array", items: { type: "string" } },
    experienceMatch: { type: "integer", minimum: 0, maximum: 100 },
    education: { type: "string" },
    languages: { type: "array", items: { type: "string" } },
    strengths: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    nextSteps: { type: "array", items: { type: "string" } },
  },
} as const;

function buildPrompt(input: AnalyzeInput): string {
  return [
    "Analise a compatibilidade (ATS) entre o currículo e a vaga abaixo.",
    "Responda sempre em português do Brasil, de forma objetiva e acionável.",
    "'score' e 'experienceMatch' são percentuais inteiros de 0 a 100 (ex.: 78).",
    "Liste de 5 a 8 hard skills e 3 a 5 soft skills exigidas pela vaga, marcando o status em relação ao currículo.",
    "",
    `# Vaga\nTítulo: ${input.jobTitle}\nEmpresa: ${input.company || "não informada"}`,
    input.jobUrl ? `Link: ${input.jobUrl}` : "",
    `Descrição:\n${input.jobDescription || "(não informada — infira os requisitos típicos do cargo)"}`,
    "",
    `# Currículo\n${input.resumeText.slice(0, 20000)}`,
    "",
    input.objectives.length ? `# Objetivos do candidato\n${input.objectives.join(", ")}` : "",
    input.instructions ? `# Instruções adicionais\n${input.instructions}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function sanitizeSkills(value: unknown): SkillItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is { name: string; status: string; description?: string } =>
      Boolean(s && typeof s === "object" && typeof (s as { name?: unknown }).name === "string"),
    )
    .map((s) => ({
      name: s.name,
      status:
        s.status === "match" || s.status === "partial" || s.status === "missing"
          ? s.status
          : "partial",
      ...(s.description ? { description: s.description } : {}),
    }));
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/** Executa a análise ATS através do Lovable AI Gateway. */
export async function analyzeWithAI(input: AnalyzeInput): Promise<AnalysisResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI_UNAVAILABLE");

  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em recrutamento e sistemas ATS. Avalie currículos com rigor, sem inventar experiências inexistentes.",
        },
        { role: "user", content: buildPrompt(input) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "ats_analysis", strict: true, schema: responseSchema },
      },
    }),
  });

  if (!response.ok) {
    devLog("gateway error", response.status, await response.text().catch(() => ""));
    if (response.status === 429) throw new Error("AI_RATE_LIMIT");
    if (response.status === 402) throw new Error("AI_CREDITS");
    throw new Error("AI_UNAVAILABLE");
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI_UNAVAILABLE");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content) as Record<string, unknown>;
  } catch {
    devLog("invalid json from model");
    throw new Error("AI_UNAVAILABLE");
  }

  const keywordsFound = toStringArray(parsed["keywordsFound"]);
  const keywordsMissing = toStringArray(parsed["keywordsMissing"]);
  const score = Math.max(0, Math.min(100, Number(parsed["score"]) || 0));

  return {
    score,
    scoreLabel: `${getScoreTier(score).label} compatibilidade com esta vaga.`,
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
