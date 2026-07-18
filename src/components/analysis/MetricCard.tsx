import type { LucideIcon } from "lucide-react";
import { ContentCard } from "@/components/common/ContentCard";
import { Progress } from "@/components/ui/progress";

interface MetricCardProps {
  title: string;
  icon: LucideIcon;
  value: string;
  hint?: string;
  progress?: number;
  badges?: string[];
}

export function MetricCard({ title, icon: Icon, value, hint, progress, badges }: MetricCardProps) {
  return (
    <ContentCard
      title={title}
      action={
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      }
    >
      <div className="space-y-3">
        <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
        {typeof progress === "number" && <Progress value={progress} className="h-2" />}
        {badges && (
          <div className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full border border-border/70 bg-surface/60 px-2.5 py-0.5 text-xs font-medium text-foreground"
              >
                {b}
              </span>
            ))}
          </div>
        )}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </ContentCard>
  );
}
