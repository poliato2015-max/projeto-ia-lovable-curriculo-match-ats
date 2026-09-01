import { supabase } from "@/lib/supabase";

export interface DashboardPoint {
  id: string;
  score: number;
  createdAt: string;
  jobTitle: string;
  company: string | null;
}

export interface FrequencyItem {
  label: string;
  count: number;
}

export interface DashboardData {
  total: number;
  averageScore: number | null;
  bestScore: number | null;
  thisMonth: number;
  timeline: DashboardPoint[];
  distribution: { high: number; good: number; low: number };
  attentionPoints: FrequencyItem[];
  strengths: FrequencyItem[];
  nextSteps: string[];
}

interface AnalysisRow {
  id: string;
  job_title: string;
  company: string | null;
  match_score: number | null;
  created_at: string;
}

interface ResultRow {
  analysis_id: string;
  strengths: unknown;
  weaknesses: unknown;
  keywords_missing: unknown;
  recommendations: unknown;
  next_steps: unknown;
}

/** Normaliza valores JSONB heterogêneos em uma lista de textos limpos. */
function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const candidate = record["name"] ?? record["title"] ?? record["label"] ?? record["text"];
        if (typeof candidate === "string") return candidate;
      }
      return "";
    })
    .map((text) => text.trim())
    .filter(Boolean);
}

function rank(values: string[], limit = 5): FrequencyItem[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const value of values) {
    const key = value.toLowerCase();
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { label: value, count: 1 });
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

/**
 * Calcula as métricas do dashboard a partir das análises reais do usuário.
 * O isolamento por usuário é garantido pelas políticas RLS existentes.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const { data, error } = await supabase
    .from("analyses")
    .select("id, job_title, company, match_score, created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error("Não foi possível carregar seus indicadores.");

  const analyses = (data ?? []) as unknown as AnalysisRow[];
  const scored = analyses.filter((a) => typeof a.match_score === "number");

  const now = new Date();
  const thisMonth = analyses.filter((a) => {
    const date = new Date(a.created_at);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const scores = scored.map((a) => a.match_score as number);
  const distribution = { high: 0, good: 0, low: 0 };
  for (const score of scores) {
    if (score >= 80) distribution.high += 1;
    else if (score >= 60) distribution.good += 1;
    else distribution.low += 1;
  }

  let attentionPoints: FrequencyItem[] = [];
  let strengths: FrequencyItem[] = [];
  let nextSteps: string[] = [];

  if (analyses.length > 0) {
    const { data: resultData } = await supabase
      .from("analysis_results")
      .select("analysis_id, strengths, weaknesses, keywords_missing, recommendations, next_steps")
      .in(
        "analysis_id",
        analyses.map((a) => a.id),
      );

    const results = (resultData ?? []) as unknown as ResultRow[];
    attentionPoints = rank(
      results.flatMap((r) => [...toStrings(r.weaknesses), ...toStrings(r.keywords_missing)]),
    );
    strengths = rank(results.flatMap((r) => toStrings(r.strengths)));

    const latest = [...results].reverse();
    nextSteps = rank(
      latest.flatMap((r) => [...toStrings(r.next_steps), ...toStrings(r.recommendations)]),
      3,
    ).map((item) => item.label);
  }

  return {
    total: analyses.length,
    averageScore: scores.length
      ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
      : null,
    bestScore: scores.length ? Math.max(...scores) : null,
    thisMonth,
    timeline: scored.map((a) => ({
      id: a.id,
      score: a.match_score as number,
      createdAt: a.created_at,
      jobTitle: a.job_title,
      company: a.company,
    })),
    distribution,
    attentionPoints,
    strengths,
    nextSteps,
  };
}
