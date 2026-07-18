import { Lightbulb } from "lucide-react";
import { ContentCard } from "@/components/common/ContentCard";

interface RecommendationsCardProps {
  items: string[];
}

export function RecommendationsCard({ items }: RecommendationsCardProps) {
  return (
    <ContentCard
      title="Recomendações"
      description="Ações práticas para elevar seu score ATS."
      action={
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
          <Lightbulb className="h-4 w-4" />
        </span>
      }
    >
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-lg border border-border/60 bg-surface/40 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </ContentCard>
  );
}
