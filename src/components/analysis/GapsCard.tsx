import { AlertTriangle } from "lucide-react";
import { ContentCard } from "@/components/common/ContentCard";
import { cn } from "@/lib/utils";
import type { SkillItem } from "./analysis-types";

interface GapsCardProps {
  skills: SkillItem[];
}

export function GapsCard({ skills }: GapsCardProps) {
  const gaps = skills.filter((s) => s.status !== "match");
  return (
    <ContentCard
      title="Gaps identificados"
      description="Pontos que reduzem seu Match ATS."
      action={
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
        </span>
      }
    >
      {gaps.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum gap crítico identificado.</p>
      ) : (
        <ul className="space-y-2">
          {gaps.map((g) => (
            <li
              key={g.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface/40 px-3 py-2 text-sm"
            >
              <span className="font-medium text-foreground">{g.name}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  g.status === "partial"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                {g.status === "partial" ? "Parcial" : "Ausente"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </ContentCard>
  );
}
