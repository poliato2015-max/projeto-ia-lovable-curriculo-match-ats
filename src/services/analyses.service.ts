import { supabase } from "@/lib/supabase";
import type { AnalysisResult } from "@/components/analysis/mock";

export interface AnalysisRecord {
  id: string;
  jobTitle: string;
  company: string | null;
  jobUrl: string | null;
  jobDescription: string | null;
  matchScore: number | null;
  resumeId: string | null;
  resumeTitle: string | null;
  createdAt: string;
}

interface AnalysisRow {
  id: string;
  job_title: string;
  company: string | null;
  job_url: string | null;
  job_description: string | null;
  match_score: number | null;
  resume_id: string | null;
  resume_title: string | null;
  created_at: string;
}

function mapRow(row: AnalysisRow): AnalysisRecord {
  return {
    id: row.id,
    jobTitle: row.job_title,
    company: row.company,
    jobUrl: row.job_url,
    jobDescription: row.job_description,
    matchScore: row.match_score,
    resumeId: row.resume_id,
    resumeTitle: row.resume_title,
    createdAt: row.created_at,
  };
}

const SELECT_COLUMNS =
  "id, job_title, company, job_url, job_description, match_score, resume_id, resume_title, created_at";

export interface ListAnalysesResult {
  items: AnalysisRecord[];
  hasMore: boolean;
}

/** Lista paginada das análises do usuário autenticado (RLS garante o isolamento). */
export async function listAnalyses(
  page = 0,
  pageSize = 20,
): Promise<ListAnalysesResult> {
  const from = page * pageSize;
  const { data, error } = await supabase
    .from("analyses")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize);

  if (error) throw new Error("Não foi possível carregar seu histórico.");
  const rows = (data ?? []) as unknown as AnalysisRow[];
  return {
    items: rows.slice(0, pageSize).map(mapRow),
    hasMore: rows.length > pageSize,
  };
}

export interface AnalysisDetail {
  record: AnalysisRecord;
  result: AnalysisResult | null;
}

export async function getAnalysis(id: string): Promise<AnalysisDetail> {
  const { data, error } = await supabase
    .from("analyses")
    .select(SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) throw new Error("Análise não encontrada.");

  const { data: resultRow } = await supabase
    .from("analysis_results")
    .select("payload, summary")
    .eq("analysis_id", id)
    .maybeSingle();

  const payload = (resultRow?.payload ?? null) as AnalysisResult | null;

  return {
    record: mapRow(data as unknown as AnalysisRow),
    result: payload && typeof payload.score === "number" ? payload : null,
  };
}

export async function deleteAnalysis(id: string): Promise<void> {
  const { error: resultError } = await supabase
    .from("analysis_results")
    .delete()
    .eq("analysis_id", id);
  if (resultError) throw new Error("Não foi possível excluir esta análise.");

  const { error } = await supabase.from("analyses").delete().eq("id", id);
  if (error) throw new Error("Não foi possível excluir esta análise.");
}

export interface SaveAnalysisInput {
  jobTitle: string;
  company?: string;
  jobUrl?: string;
  jobDescription?: string;
  resumeId?: string | null;
  resumeTitle?: string | null;
  result: AnalysisResult;
}

/** Persiste uma análise concluída para aparecer no histórico do usuário. */
export async function saveAnalysis(input: SaveAnalysisInput): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Sessão expirada. Entre novamente.");

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: userData.user.id,
      job_title: input.jobTitle || "Análise ATS",
      company: input.company || null,
      job_url: input.jobUrl || null,
      job_description: input.jobDescription || null,
      resume_id: input.resumeId ?? null,
      resume_title: input.resumeTitle ?? null,
      match_score: input.result.score,
      status: "completed",
    })
    .select("id")
    .single();

  if (error || !data) throw new Error("Não foi possível salvar esta análise.");

  const { error: resultError } = await supabase.from("analysis_results").insert({
    analysis_id: data.id,
    summary: input.result.summary,
    recommendations: input.result.recommendations,
    keywords_found: [],
    keywords_missing: [],
    strengths: [],
    weaknesses: [],
    next_steps: [],
    payload: JSON.parse(JSON.stringify(input.result)),
  });

  if (resultError) throw new Error("Não foi possível salvar o resultado desta análise.");

  return data.id;
}
