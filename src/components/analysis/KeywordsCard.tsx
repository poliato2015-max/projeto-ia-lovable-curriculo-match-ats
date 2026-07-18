import { Tag } from "lucide-react";
import { ContentCard } from "@/components/common/ContentCard";
import { Progress } from "@/components/ui/progress";

interface KeywordsCardProps {
  found: number;
  total: number;
}

export function KeywordsCard({ found, total }: KeywordsCardProps) {
  const pct = Math.round((found / total) * 100);
  return (
    <ContentCard
      title="Palavras-chave ATS"
      description="Termos exigidos pela vaga presentes no currículo."
      action={
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Tag className="h-4 w-4" />
        </span>
      }
    >
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-foreground">{found}</span>
          <span className="text-sm text-muted-foreground">de {total} encontradas</span>
        </div>
        <Progress value={pct} className="h-2" />
        <p className="text-xs text-muted-foreground">{pct}% de aderência ao vocabulário da vaga.</p>
      </div>
    </ContentCard>
  );
}
