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
}

export const MOCK_ANALYSIS: AnalysisResult = {
  score: 91,
  scoreLabel: "Excelente compatibilidade com esta vaga.",
  hardSkills: [
    { name: "React", status: "match", description: "Domínio comprovado em projetos recentes." },
    { name: "TypeScript", status: "match", description: "Uso avançado em aplicações produtivas." },
    { name: "Node.js", status: "match", description: "APIs REST e microserviços." },
    { name: "Docker", status: "partial", description: "Experiência básica identificada." },
    { name: "Kubernetes", status: "missing", description: "Não encontrado no currículo." },
  ],
  softSkills: [
    { name: "Liderança", status: "match" },
    { name: "Comunicação", status: "match" },
    { name: "Trabalho em equipe", status: "match" },
    { name: "Gestão de conflitos", status: "partial" },
  ],
  keywords: { found: 28, total: 34 },
  experienceMatch: 92,
  education: "Compatível",
  languages: ["Português", "Inglês"],
  recommendations: [
    "Destacar experiência com Docker.",
    "Adicionar resultados mensuráveis nas conquistas.",
    "Evidenciar liderança técnica em projetos anteriores.",
    "Incluir Terraform como diferencial de infraestrutura.",
  ],
  summary:
    "Seu currículo apresenta excelente aderência à vaga analisada. Foram identificados alguns pontos de melhoria que podem aumentar ainda mais a compatibilidade ATS e destacar seu perfil frente a outros candidatos.",
};
