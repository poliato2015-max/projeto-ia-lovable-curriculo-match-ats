import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalysisSummaryProps {
  summary: string;
  title?: string;
}

export function AnalysisSummary({ summary, title = "Resumo Executivo" }: AnalysisSummaryProps) {
  return (
    <Card className="h-full overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
}
