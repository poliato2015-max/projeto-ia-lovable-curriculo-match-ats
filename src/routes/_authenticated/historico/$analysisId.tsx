import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, History, Loader2 } from "lucide-react";

import { PageContainer } from "@/components/common/PageContainer";
import { PageTitle } from "@/components/common/PageTitle";
import { ContentCard } from "@/components/common/ContentCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { StepResultado } from "@/components/analysis/wizard/StepResultado";
import { useAnalysis } from "@/hooks/useAnalyses";

export const Route = createFileRoute("/_authenticated/historico/$analysisId")({
  head: () => ({
    meta: [
      { title: "Resultado da análise — RadarCV AI" },
      {
        name: "description",
        content: "Reveja o Match ATS, métricas e recomendações de uma análise anterior.",
      },
      { property: "og:title", content: "Resultado da análise — RadarCV AI" },
      {
        property: "og:description",
        content: "Reveja o Match ATS e as recomendações de uma análise anterior.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnaliseHistoricaPage,
});

function AnaliseHistoricaPage() {
  const { analysisId } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAnalysis(analysisId);

  const backToHistory = () => navigate({ to: "/historico" });

  return (
    <PageContainer>
      <PageTitle
        title="Resultado ATS"
        description="Você está visualizando uma análise anterior do seu histórico."
        actions={
          <Button variant="outline" className="gap-2" onClick={backToHistory}>
            <ArrowLeft className="h-4 w-4" /> Voltar ao histórico
          </Button>
        }
      />

      <ContentCard bodyClassName="pt-6">
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando análise...
          </div>
        )}

        {!isLoading && (isError || !data?.result) && (
          <EmptyState
            icon={History}
            title="Análise indisponível"
            description="Não foi possível recuperar o resultado desta análise."
            action={<Button onClick={backToHistory}>Voltar ao histórico</Button>}
          />
        )}

        {!isLoading && data?.result && (
          <StepResultado
            result={data.result}
            jobTitle={data.record.jobTitle}
            company={data.record.company ?? ""}
            analyzedAt={new Date(data.record.createdAt)}
            resumeTitle={data.record.resumeTitle}
            readOnly
            resetLabel="Voltar ao histórico"
            onReset={backToHistory}
          />
        )}
      </ContentCard>
    </PageContainer>
  );
}
