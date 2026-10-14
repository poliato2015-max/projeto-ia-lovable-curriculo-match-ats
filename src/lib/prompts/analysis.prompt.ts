import type { AnalysisResult, SkillItem } from "@/components/analysis/analysis-types";

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

export const responseSchema = {
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

export const SYSTEM_PROMPT = `Você é um especialista em recrutamento e sistemas ATS. Avalie currículos com rigor, sem inventar experiências inexistentes.`;

export function buildPrompt(input: AnalyzeInput): string {
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

export function sanitizeSkills(value: unknown): SkillItem[] {
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

export function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}