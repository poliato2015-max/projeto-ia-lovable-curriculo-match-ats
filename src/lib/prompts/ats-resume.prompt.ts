export interface GenerateAtsInput {
  jobTitle: string;
  company: string;
  jobDescription: string;
  resumeText: string;
  keywordsMissing: string[];
  keywordsFound: string[];
  objectives: string[];
  instructions: string;
}

export interface GenerateAtsOutput {
  content: string;
  keywordsUsed: string[];
  omittedKeywords: string[];
  notes: string;
}

export const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["content", "keywordsUsed", "omittedKeywords", "notes"],
  properties: {
    content: { type: "string" },
    keywordsUsed: { type: "array", items: { type: "string" } },
    omittedKeywords: { type: "array", items: { type: "string" } },
    notes: { type: "string" },
  },
} as const;

export const SYSTEM_PROMPT = [
  "Você é um especialista em currículos otimizados para sistemas ATS.",
  "REGRA ABSOLUTA E INEGOCIÁVEL: é PROIBIDO inventar qualquer informação.",
  "Você NÃO pode criar: empresas, cargos, datas, tempo de experiência, tecnologias,",
  "ferramentas, certificações, formações, idiomas, projetos, métricas, resultados,",
  "responsabilidades ou habilidades que não estejam explicitamente no currículo original.",
  "Você NÃO pode inserir palavras-chave da vaga que não existam no currículo original,",
  "nem mesmo para aumentar o Match ATS.",
  "",
  "Você PODE e DEVE apenas: reorganizar seções, melhorar a redação e a clareza,",
  "reescrever descrições de experiências já existentes, destacar resultados já citados,",
  "reorganizar competências, ajustar a ordem das experiências, melhorar o resumo",
  "profissional a partir do que já existe, e aplicar formatação amigável a ATS",
  "(texto simples, sem tabelas, sem colunas, sem imagens, sem caracteres decorativos).",
  "",
  "REGRA DE LOCALIZAÇÃO: a cidade/estado que aparece junto ao nome ou contato do candidato",
  "pertence APENAS ao candidato. NUNCA copie essa localização para empresas, cargos ou",
  "experiências. Só informe a localização de uma empresa se ela estiver explicitamente",
  "associada àquela empresa no currículo original.",
  "Nunca transforme uma informação do candidato em informação de empresa, cargo ou experiência.",
  "",
  "Se um dado não existir no currículo original, simplesmente não o mencione.",
  "Nunca use placeholders como [inserir], XX anos, ou 'empresa exemplo'.",
  "",
  "Palavras-chave da vaga ausentes no currículo devem ser listadas em 'omittedKeywords',",
  "jamais escritas dentro de 'content'.",
  "Responda no mesmo idioma do currículo original (normalmente português do Brasil),",
  "exceto quando o bloco '# Idioma de saída' pedir outro idioma explicitamente.",
].join("\n");

export const TRANSLATE_EN_INSTRUCTION = [
  "# Idioma de saída (OBRIGATÓRIO)",
  "O candidato escolheu o objetivo 'Traduzir para inglês'.",
  "Escreva TODO o conteúdo de 'content' em inglês (US), incluindo títulos de seção",
  "(PROFESSIONAL SUMMARY, PROFESSIONAL EXPERIENCE, EDUCATION, SKILLS, LANGUAGES,",
  "CERTIFICATIONS, PROJECTS), resumo, descrições de experiências, formação,",
  "habilidades e projetos. O campo 'notes' também deve ser escrito em inglês.",
  "A tradução altera SOMENTE o idioma: não invente experiências, cargos, empresas,",
  "tecnologias, resultados ou localidades; não altere datas nem crie informações",
  "que não estejam no currículo original. Nomes próprios de empresas, produtos e",
  "certificações permanecem como no original.",
].join("\n");

export function buildPrompt(input: GenerateAtsInput): string {
  return [
    `# Vaga alvo\nTítulo: ${input.jobTitle || "não informado"}\nEmpresa: ${input.company || "não informada"}`,
    input.jobDescription ? `Descrição:\n${input.jobDescription.slice(0, 8000)}` : "",
    input.keywordsFound.length
      ? `# Palavras-chave já presentes no currículo (pode destacar)\n${input.keywordsFound.join(", ")}`
      : "",
    input.keywordsMissing.length
      ? `# Palavras-chave da vaga AUSENTES no currículo (NÃO inserir no currículo, apenas listar em omittedKeywords)\n${input.keywordsMissing.join(", ")}`
      : "",
    input.objectives.length ? `# Objetivos do candidato\n${input.objectives.join(", ")}` : "",
    input.objectives.includes("translate-en") ? TRANSLATE_EN_INSTRUCTION : "",
    input.instructions ? `# Instruções adicionais\n${input.instructions}` : "",
    "",
    "# Currículo original (única fonte de verdade)",
    input.resumeText.slice(0, 24000),
    "",
    "Gere em 'content' a versão ATS otimizada em texto simples, usando somente as",
    "informações acima. Em 'notes', explique de forma breve o que foi otimizado.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}