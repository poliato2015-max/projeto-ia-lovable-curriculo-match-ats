export type SkillStatus = "match" | "partial" | "missing";

export interface SkillItem {
  name: string;
  status: SkillStatus;
  description?: string;
}

export interface AnalysisResult {
  score: number;
  scoreLabel: string;
  hardSkills: SkillItem[];
  softSkills: SkillItem[];
  keywords: { found: number; total: number };
  experienceMatch: number;
  education: string;
  languages: string[];
  recommendations: string[];
  summary: string;
  /** Resumo da vaga interpretado pela IA. */
  jobSummary?: string;
  /** Pontos fortes identificados no currículo. */
  strengths?: string[];
  /** Palavras-chave encontradas no currículo. */
  keywordsFound?: string[];
  /** Palavras-chave da vaga ausentes no currículo. */
  keywordsMissing?: string[];
  /** Melhorias sugeridas para o currículo. */
  improvements?: string[];
  /** Próximos passos recomendados. */
  nextSteps?: string[];
}
