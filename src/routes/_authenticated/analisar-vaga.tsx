import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PageContainer } from "@/components/common/PageContainer";
import { PageTitle } from "@/components/common/PageTitle";
import { ContentCard } from "@/components/common/ContentCard";
import { AnalysisLoading, MOCK_ANALYSIS, type AnalysisResult } from "@/components/analysis";
import { Stepper } from "@/components/analysis/wizard/Stepper";
import { StepVaga } from "@/components/analysis/wizard/StepVaga";
import { StepCurriculo } from "@/components/analysis/wizard/StepCurriculo";
import { StepObjetivo } from "@/components/analysis/wizard/StepObjetivo";
import { StepResultado } from "@/components/analysis/wizard/StepResultado";
import { StepCurriculoATS } from "@/components/analysis/wizard/StepCurriculoATS";
import type { WizardData } from "@/components/analysis/wizard/types";

export const Route = createFileRoute("/analisar-vaga")({
  head: () => ({
    meta: [
      { title: "Analisar Vaga — RadarCV AI" },
      {
        name: "description",
        content:
          "Compare seu currículo com qualquer vaga através de um wizard guiado e obtenha um Match ATS completo.",
      },
    ],
  }),
  component: AnalisarVagaPage,
});

const STEPS = [
  { id: 1, label: "Vaga" },
  { id: 2, label: "Currículo" },
  { id: 3, label: "Objetivo" },
  { id: 4, label: "Resultado" },
  { id: 5, label: "Currículo ATS" },
];

const INITIAL_DATA: WizardData = {
  job: { source: "url", title: "", company: "", url: "", description: "" },
  resume: { source: "upload", content: "" },
  objective: { goals: ["maximize-ats"], instructions: "" },
};

function AnalisarVagaPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<Date>(new Date());

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setResult(null);
    setStep(4);
    window.setTimeout(() => {
      setResult(MOCK_ANALYSIS);
      setAnalyzedAt(new Date());
      setIsAnalyzing(false);
    }, 2000);
  };

  const reset = () => {
    setResult(null);
    setIsAnalyzing(false);
    setData(INITIAL_DATA);
    setStep(1);
  };

  return (
    <PageContainer>
      <PageTitle
        title="Analisar Vaga"
        description="Um passo a passo guiado para descobrir sua compatibilidade com qualquer vaga."
      />

      <ContentCard bodyClassName="space-y-6 pt-6">
        <Stepper
          steps={STEPS}
          current={step}
          onStepClick={(id) => {
            if (!isAnalyzing && id < step) setStep(id);
          }}
        />

        {step === 1 && (
          <StepVaga
            data={data.job}
            onChange={(job) => setData({ ...data, job })}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepCurriculo
            data={data.resume}
            onChange={(resume) => setData({ ...data, resume })}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepObjetivo
            data={data.objective}
            onChange={(objective) => setData({ ...data, objective })}
            onAnalyze={runAnalysis}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 &&
          (isAnalyzing || !result ? (
            <AnalysisLoading />
          ) : (
            <StepResultado
              result={result}
              jobTitle={data.job.title}
              company={data.job.company}
              analyzedAt={analyzedAt}
              onReset={reset}
              onGenerate={() => setStep(5)}
            />
          ))}

        {step === 5 && result && (
          <StepCurriculoATS
            result={result}
            jobTitle={data.job.title}
            company={data.job.company}
            onBack={() => setStep(4)}
          />
        )}
      </ContentCard>
    </PageContainer>
  );
}
