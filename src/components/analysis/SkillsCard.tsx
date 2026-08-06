import { Check, AlertTriangle, X } from "lucide-react";
import { ContentCard } from "@/components/common/ContentCard";
import { cn } from "@/lib/utils";
import type { SkillItem, SkillStatus } from "./analysis-types";

const CONFIG: Record<
  SkillStatus,
  { icon: typeof Check; className: string; label: string }
> = {
  match: {
    icon: Check,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "Compatível",
  },
  partial: {
    icon: AlertTriangle,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Parcial",
  },
  missing: {
    icon: X,
    className: "bg-destructive/10 text-destructive",
    label: "Ausente",
  },
};

interface SkillsCardProps {
  title: string;
  description?: string;
  skills: SkillItem[];
}

export function SkillsCard({ title, description, skills }: SkillsCardProps) {
  return (
    <ContentCard title={title} description={description}>
      <ul className="space-y-2.5">
        {skills.map((skill) => {
          const cfg = CONFIG[skill.status];
          const Icon = cfg.icon;
          return (
            <li
              key={skill.name}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-surface/40 px-3 py-2.5 transition-colors hover:bg-surface"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  cfg.className,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {skill.name}
                  </span>
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {cfg.label}
                  </span>
                </div>
                {skill.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{skill.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </ContentCard>
  );
}
