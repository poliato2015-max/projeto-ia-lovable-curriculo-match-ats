/**
 * Classificação única do Match ATS usada em toda a aplicação.
 * Qualquer tela que precise rotular um score deve usar estas funções.
 */
export type ScoreTierId =
  | "excelente"
  | "muito-bom"
  | "bom"
  | "atencao"
  | "baixa";

export interface ScoreTier {
  id: ScoreTierId;
  label: string;
  /** Classes de cor semânticas para badges. */
  className: string;
}

const TIERS: ScoreTier[] = [
  {
    id: "excelente",
    label: "Excelente",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "muito-bom",
    label: "Muito bom",
    className: "bg-primary/10 text-primary",
  },
  {
    id: "bom",
    label: "Bom",
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    id: "atencao",
    label: "Atenção",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: "baixa",
    label: "Baixa compatibilidade",
    className: "bg-destructive/10 text-destructive",
  },
];

export const SCORE_TIERS = TIERS;

export function getScoreTier(score: number | null | undefined): ScoreTier {
  const value = score ?? 0;
  if (value >= 90) return TIERS[0]!;
  if (value >= 80) return TIERS[1]!;
  if (value >= 65) return TIERS[2]!;
  if (value >= 50) return TIERS[3]!;
  return TIERS[4]!;
}
