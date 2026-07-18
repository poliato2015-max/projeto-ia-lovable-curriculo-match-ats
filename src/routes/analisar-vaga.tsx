import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PageContainer } from "@/components/common/PageContainer";
import { PageTitle } from "@/components/common/PageTitle";
import { ContentCard } from "@/components/common/ContentCard";
import {
  AnalysisEmptyState,
  AnalysisLoading,
  AnalysisResultPanel,
  JobInputCard,
  MOCK_ANALYSIS,
  type AnalysisResult,
} from "@/components/analysis";

export const Route = createFileRoute("/analisar-vaga")({
  head: () => ({
    meta: [
      { title: "Analisar Vaga — RadarCV AI" },
      {
        name: "description",
        content:
          "Compare seu currículo com qualquer vaga e obtenha um Match ATS completo em segundos.",
      },
    ],
  }),
  component: AnalisarVagaPage,
});

function AnalisarVagaPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(MOCK_ANALYSIS);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <PageContainer>
      <PageTitle
        title="Analisar Vaga"
        description="Descubra o quão compatível seu currículo está com uma vaga específica."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <JobInputCard onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </div>

        <ContentCard
          title="Resultado da Análise ATS"
          description="Visualize seu Match ATS, gaps e recomendações personalizadas."
          bodyClassName="pt-2"
        >
          {isAnalyzing ? (
            <AnalysisLoading />
          ) : result ? (
            <AnalysisResultPanel result={result} />
          ) : (
            <AnalysisEmptyState />
          )}
        </ContentCard>
      </div>
    </PageContainer>
  );
}
