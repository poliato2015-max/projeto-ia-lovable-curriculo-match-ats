const AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

export interface ContentChecksInput {
  atsContent: string;
  originalResume: string;
}

export interface ContentChecksOutput {
  sections: { status: "pass" | "warn"; detail: string };
  originalOnly: { status: "pass" | "warn"; detail: string };
  objectiveLanguage: { status: "pass" | "warn"; detail: string };
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "sectionsPass",
    "sectionsDetail",
    "originalOnlyPass",
    "originalOnlyDetail",
    "objectiveLanguagePass",
    "objectiveLanguageDetail",
  ],
  properties: {
    sectionsPass: { type: "boolean" },
    sectionsDetail: { type: "string" },
    originalOnlyPass: { type: "boolean" },
    originalOnlyDetail: { type: "string" },
    objectiveLanguagePass: { type: "boolean" },
    objectiveLanguageDetail: { type: "string" },
  },
} as const;

const SYSTEM_PROMPT = [
  "Você audita currículos otimizados para ATS. Responda em português do Brasil.",
  "",
  "Avalie TRÊS critérios, comparando o CURRÍCULO ATS com o CURRÍCULO ORIGINAL:",
  "",
  "1) sectionsPass — o currículo ATS tem seções claramente identificadas por títulos.",
  "Reconheça títulos SEMANTICAMENTE equivalentes, sem exigir texto literal:",
  "Experiência / Experiência Profissional / Histórico Profissional;",
  "Formação / Formação Acadêmica / Educação; Competências / Habilidades / Skills;",
  "Cursos / Certificações / Cursos e Certificações; Idiomas; Projetos;",
  "Resumo Profissional / Perfil Profissional. true quando há pelo menos três títulos",
  "claros e organizados. false apenas quando os títulos estão ausentes ou irreconhecíveis.",
  "",
  "2) originalOnlyPass — o currículo ATS usa somente informações sustentadas pelo original.",
  "Reorganizar, resumir, reescrever, combinar informações existentes e adaptar a apresentação",
  "NÃO é invenção. É invenção introduzir fatos novos: empresas, cargos, datas, локalizações,",
  "formações, certificações, cursos, tecnologias, ferramentas, projetos, competências,",
  "métricas, resultados ou responsabilidades sem base no original.",
  "REGRA DE LOCALIZAÇÃO: a localização que aparece junto ao nome do candidato pertence ao",
  "candidato. Se o ATS atribuir essa cidade/estado a uma empresa, cargo ou experiência que",
  "não a possui no original, isso é informação sem suporte → false.",
  "true = tudo fundamentado. false = há informação factual nova sem base.",
  "",
  "3) objectiveLanguagePass — a redação é objetiva, profissional e clara, sem prolixidade",
  "ou repetições desnecessárias. Reformulação legítima não é problema.",
  "Não use regra de contagem de palavras; julgue a qualidade real.",
  "",
  "Nos campos 'detail', escreva UMA frase curta e específica justificando o resultado",
  "(cite o dado inventado, a seção faltante ou o trecho prolixo quando houver).",
].join("\n");


/** Avalia os critérios de conteúdo do Checklist ATS com base no conteúdo real. */
export async function evaluateContentChecks(
  input: ContentChecksInput,
): Promise<ContentChecksOutput> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI_UNAVAILABLE");

  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            "# CURRÍCULO ORIGINAL (fonte de verdade)",
            input.originalResume.slice(0, 20000),
            "",
            "# CURRÍCULO ATS (versão atual exibida ao usuário)",
            input.atsContent.slice(0, 20000),
          ].join("\n"),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "ats_checklist", strict: true, schema: responseSchema },
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

  const text = (key: string, fallback: string) =>
    typeof parsed[key] === "string" && (parsed[key] as string).trim()
      ? (parsed[key] as string).trim()
      : fallback;

  const originalOk = parsed["originalOnlyPass"] === true;
  const languageOk = parsed["objectiveLanguagePass"] === true;

  return {
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
