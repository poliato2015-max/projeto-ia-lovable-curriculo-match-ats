import { Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AnalysisSummaryProps {
  summary: string;
}

export function AnalysisSummary({ summary }: AnalysisSummaryProps) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold text-foreground">Resumo da IA</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        <Button
          size="lg"
          className="w-full gap-2 sm:w-auto"
          onClick={() =>
            toast("Gerar Currículo ATS", {
              description: "Esta funcionalidade será implementada na próxima Sprint.",
            })
          }
        >
          <Wand2 className="h-4 w-4" />
          Gerar Currículo ATS
        </Button>
      </CardContent>
    </Card>
  );
}
