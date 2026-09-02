const AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

export interface ContentChecksInput {
  atsContent: string;
  originalResume: string;
}

export interface ContentChecksOutput {
  originalOnly: { status: "pass" | "warn"; detail: string };
  objectiveLanguage: { status: "pass" | "warn"; detail: string };
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "originalOnlyPass",
    "originalOnlyDetail",
    "objectiveLanguagePass",
    "objectiveLanguageDetail",
  ],
  properties: {
    originalOnlyPass: { type: "boolean" },
    originalOnlyDetail: { type: "string" },
    objectiveLanguagePass: { type: "boolean" },
    objectiveLanguageDetail: { type: "string" },
  },
} as const;

const SYSTEM_PROMPT = [
  "Você audita currículos otimizados para ATS. Responda em português do Brasil.",
  "",
  "Avalie DOIS critérios, comparando o CURRÍCULO ATS com o CURRÍCULO ORIGINAL:",
  "",
  "1) originalOnlyPass — o currículo ATS usa somente informações sustentadas pelo original.",
  "Reorganizar, resumir, reescrever, combinar informações existentes e adaptar a apresentação",
  "NÃO é invenção. É invenção introduzir fatos novos: empresas, cargos, datas, formações,",
  "certificações, tecnologias, competências, métricas ou resultados sem base no original.",
  "true = tudo fundamentado. false = há informação factual nova sem base.",
  "",
  "2) objectiveLanguagePass — a redação é objetiva, profissional e clara, sem prolixidade",
  "ou repetições desnecessárias. Não use regra de contagem de palavras; julgue a qualidade real.",
  "",
  "Nos campos 'detail', escreva UMA frase curta e específica justificando o resultado",
  "(cite o dado inventado ou o trecho prolixo quando houver).",
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
