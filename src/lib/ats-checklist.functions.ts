import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { evaluateContentChecks, type ContentChecksOutput } from "@/lib/ats-checklist.server";
import { createLLMClient } from "@/lib/llm/factory";
import { healthCheck } from "@/lib/llm/health";

export interface EvaluateChecklistInput {
  atsContent: string;
  resumeText: string;
  resumeId: string | null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function validate(data: unknown): EvaluateChecklistInput {
  const d = (data ?? {}) as Record<string, unknown>;
  return {
    atsContent: str(d["atsContent"]),
    resumeText: str(d["resumeText"]),
    resumeId: typeof d["resumeId"] === "string" ? d["resumeId"] : null,
  };
}

// Lazy health check flag
let healthCheckDone = false;

/** Avalia os critérios de conteúdo do Checklist ATS para a versão atual do currículo. */
export const evaluateAtsChecklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data, context }): Promise<ContentChecksOutput> => {
    const atsContent = data.atsContent.trim();
    if (!atsContent) throw new Error("O currículo ATS está vazio.");

    let originalResume = data.resumeText.trim();
    if (!originalResume && data.resumeId) {
      const { data: resume } = await context.supabase
        .from("resumes")
        .select("raw_text")
        .eq("id", data.resumeId)
        .maybeSingle();
      originalResume = (resume?.raw_text ?? "").trim();
    }

    if (!originalResume) {
      throw new Error("Não encontramos o currículo original para comparar.");
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

    return evaluateContentChecks(client, { atsContent, originalResume });
  });