import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { analyzeWithAI } from "@/lib/analysis.server";
import { createLLMClient } from "@/lib/llm/factory";
import { healthCheck } from "@/lib/llm/health";
import type { AnalysisResult } from "@/components/analysis/analysis-types";

export interface RunAnalysisInput {
  jobTitle: string;
  company: string;
  jobUrl: string;
  jobDescription: string;
  /** Texto do currículo colado/importado, quando não vier da biblioteca. */
  resumeText: string;
  resumeId: string | null;
  resumeTitle: string | null;
  resumeType: "original" | "ats" | null;
  objectives: string[];
  instructions: string;
}

export interface RunAnalysisOutput {
  /** Id da análise persistida, ou null quando a gravação falhou. */
  id: string | null;
  saved: boolean;
  createdAt: string;
  result: AnalysisResult;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function validate(data: unknown): RunAnalysisInput {
  const d = (data ?? {}) as Record<string, unknown>;
  const jobTitle = str(d["jobTitle"]).trim();
  if (!jobTitle) throw new Error("Informe o título da vaga.");
  return {
    jobTitle,
    company: str(d["company"]).trim(),
    jobUrl: str(d["jobUrl"]).trim(),
    jobDescription: str(d["jobDescription"]).trim(),
    resumeText: str(d["resumeText"]),
    resumeId: typeof d["resumeId"] === "string" ? d["resumeId"] : null,
    resumeTitle: typeof d["resumeTitle"] === "string" ? d["resumeTitle"] : null,
    resumeType:
      d["resumeType"] === "ats" ? "ats" : d["resumeType"] === "original" ? "original" : null,
    objectives: Array.isArray(d["objectives"])
      ? (d["objectives"] as unknown[]).filter((v): v is string => typeof v === "string")
      : [],
    instructions: str(d["instructions"]),
  };
}

// Lazy health check flag
let healthCheckDone = false;

/**
 * Executa a análise ATS com IA e persiste o resultado completo para o usuário
 * autenticado. A UI recebe o resultado mesmo que a gravação falhe.
 */
export const runAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data, context }): Promise<RunAnalysisOutput> => {
    const supabase = context.supabase;

    let resumeText = data.resumeText.trim();
    let resumeTitle = data.resumeTitle;
    let resumeType = data.resumeType;

    if (data.resumeId) {
      const { data: resume } = await supabase
        .from("resumes")
        .select("id, title, type, raw_text")
        .eq("id", data.resumeId)
        .maybeSingle();
      if (resume) {
        resumeText = (resume.raw_text ?? "").trim() || resumeText;
        resumeTitle = resumeTitle ?? resume.title;
        resumeType = (resume.type === "ats" ? "ats" : "original") as "original" | "ats";
      }
    }

    if (!resumeText) {
      throw new Error(
        "Não encontramos o conteúdo do currículo. Cole o texto do currículo para analisar.",
      );
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

    const result = await analyzeWithAI(client, {
      jobTitle: data.jobTitle,
      company: data.company,
      jobUrl: data.jobUrl,
      jobDescription: data.jobDescription,
      resumeText,
      objectives: data.objectives,
      instructions: data.instructions,
    });

    const createdAt = new Date().toISOString();

    try {
      const { data: inserted, error } = await supabase
        .from("analyses")
        .insert({
          user_id: context.userId,
          job_title: data.jobTitle,
          company: data.company || null,
          job_url: data.jobUrl || null,
          job_description: data.jobDescription || null,
          resume_id: data.resumeId,
          resume_title: resumeTitle,
          resume_type: resumeType,
          match_score: result.score,
          status: "completed",
        })
        .select("id, created_at")
        .single();

      if (error || !inserted) throw error ?? new Error("insert failed");

      const { error: resultError } = await supabase.from("analysis_results").insert({
        analysis_id: inserted.id,
        summary: result.summary,
        strengths: result.strengths ?? [],
        weaknesses: [...result.hardSkills, ...result.softSkills]
          .filter((s) => s.status !== "match")
          .map((s) => s.name),
        keywords_found: result.keywordsFound ?? [],
        keywords_missing: result.keywordsMissing ?? [],
        recommendations: result.recommendations,
        next_steps: result.nextSteps ?? [],
        payload: JSON.parse(JSON.stringify(result)),
      });

      if (resultError) throw resultError;

      return { id: inserted.id, saved: true, createdAt: inserted.created_at, result };
    } catch (error) {
      if (process.env["NODE_ENV"] !== "production") {
        console.error("[analysis] persist failed", error);
      }
      return { id: null, saved: false, createdAt, result };
    }
  });