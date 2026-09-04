const AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

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

const responseSchema = {
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

const SYSTEM_PROMPT = [
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

  "Palavras-chave da vaga ausentes no currículo devem ser listadas em 'omittedKeywords',",
  "jamais escritas dentro de 'content'.",
  "Responda no mesmo idioma do currículo original (normalmente português do Brasil).",
].join("\n");

function buildPrompt(input: GenerateAtsInput): string {
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

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/** Gera o currículo ATS a partir do currículo original, sem inventar informações. */
export async function generateAtsWithAI(input: GenerateAtsInput): Promise<GenerateAtsOutput> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI_UNAVAILABLE");

  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(input) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "ats_resume", strict: true, schema: responseSchema },
      },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("AI_RATE_LIMIT");
    if (response.status === 402) throw new Error("AI_CREDITS");
    throw new Error("AI_UNAVAILABLE");
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = payload.choices?.[0]?.message?.content;
  if (!raw) throw new Error("AI_UNAVAILABLE");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
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
