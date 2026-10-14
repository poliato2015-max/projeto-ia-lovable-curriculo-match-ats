import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateAtsWithAI, type GenerateAtsOutput } from "@/lib/ats-resume.server";
import { createLLMClient } from "@/lib/llm/factory";
import { healthCheck } from "@/lib/llm/health";

export interface GenerateAtsResumeInput {
  jobTitle: string;
  company: string;
  jobDescription: string;
  resumeText: string;
  resumeId: string | null;
  keywordsFound: string[];
  keywordsMissing: string[];
  objectives: string[];
  instructions: string;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function arr(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function validate(data: unknown): GenerateAtsResumeInput {
  const d = (data ?? {}) as Record<string, unknown>;
  return {
    jobTitle: str(d["jobTitle"]).trim(),
    company: str(d["company"]).trim(),
    jobDescription: str(d["jobDescription"]),
    resumeText: str(d["resumeText"]),
    resumeId: typeof d["resumeId"] === "string" ? d["resumeId"] : null,
    keywordsFound: arr(d["keywordsFound"]),
    keywordsMissing: arr(d["keywordsMissing"]),
    objectives: arr(d["objectives"]),
    instructions: str(d["instructions"]),
  };
}

// Lazy health check flag
let healthCheckDone = false;

/**
 * Gera a versão ATS do currículo original do usuário autenticado.
 * O conteúdo é sempre derivado do currículo real — nunca inventado.
 */
export const generateAtsResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data, context }): Promise<GenerateAtsOutput> => {
    let resumeText = data.resumeText.trim();

    if (!resumeText && data.resumeId) {
      const { data: resume } = await context.supabase
        .from("resumes")
        .select("raw_text")
        .eq("id", data.resumeId)
        .maybeSingle();
      resumeText = (resume?.raw_text ?? "").trim();
    }

    if (!resumeText) {
      throw new Error("Não encontramos o conteúdo do currículo original para gerar a versão ATS.");
    }

    // Criar LLMClient via factory (config via env vars)
    const client = createLLMClient({
      provider: (process.env.LLM_PROVIDER as any) || "lovable",
      apiKey: process.env.LLM_API_KEY || process.env.LOVABLE_API_KEY || "",
      model: process.env.LLM_MODEL,
      baseUrl: process.env.LLM_BASE_URL,
      orgId: process.env.LLM_ORG_ID,
      timeoutMs: process.env.LLM_TIMEOUT_MS ? Number(process.env.LLM_TIMEOUT_MS) : undefined,
    });

    // Health check opcional (apenas primeira execução, non-blocking)
    if (!healthCheckDone) {
      healthCheckDone = true;
      healthCheck(client.config).catch(() => {}); // fire and forget, log only
    }

    return generateAtsWithAI(client, {
      jobTitle: data.jobTitle,
      company: data.company,
      jobDescription: data.jobDescription,
      resumeText,
      keywordsFound: data.keywordsFound,
      keywordsMissing: data.keywordsMissing,
      objectives: data.objectives,
      instructions: data.instructions,
    });
  });