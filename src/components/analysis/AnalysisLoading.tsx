import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentCard } from "@/components/common/ContentCard";

interface AnalysisLoadingProps {
  durationMs?: number;
}

export function AnalysisLoading({ durationMs = 2000 }: AnalysisLoadingProps) {
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(96, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);
    }, 80);
    return () => window.clearInterval(id);
  }, [durationMs]);

  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <ContentCard title="Analisando compatibilidade" description="Processando dados da vaga com IA...">
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
            <p>• Extraindo palavras-chave da vaga</p>
            <p>• Cruzando com hard skills</p>
            <p>• Avaliando soft skills</p>
            <p>• Calculando score ATS</p>
          </div>
        </div>
      </ContentCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ContentCard key={i}>
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </ContentCard>
        ))}
      </div>
    </div>
  );
}
