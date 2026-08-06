import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageContainer } from "@/components/common/PageContainer";
import { PageTitle } from "@/components/common/PageTitle";
import { ContentCard } from "@/components/common/ContentCard";
import { AnalysisLoading, type AnalysisResult } from "@/components/analysis";
import { Stepper } from "@/components/analysis/wizard/Stepper";
import { StepVaga } from "@/components/analysis/wizard/StepVaga";
import { StepCurriculo } from "@/components/analysis/wizard/StepCurriculo";
import { StepObjetivo } from "@/components/analysis/wizard/StepObjetivo";
import { StepResultado } from "@/components/analysis/wizard/StepResultado";
import { StepCurriculoATS } from "@/components/analysis/wizard/StepCurriculoATS";
import type { WizardData } from "@/components/analysis/wizard/types";
import { useAnalysisMutations } from "@/hooks/useAnalyses";
import { runAnalysis as runAnalysisFn } from "@/lib/analysis.functions";

export const Route = createFileRoute("/_authenticated/analisar-vaga")({
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

function resumeTitleOf(wizard: WizardData): string | null {
  return (
    wizard.resume.savedResume?.name ??
    wizard.resume.fileName ??
    (wizard.resume.source === "paste" ? "Currículo colado" : null)
  );
}

function AnalisarVagaPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<Date>(new Date());
  const { saveMutation } = useAnalysisMutations();
  const savedIdRef = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const analyze = useServerFn(runAnalysisFn);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setResult(null);
    setStep(4);
    savedIdRef.current = null;

    try {
      const output = await analyze({
        data: {
          jobTitle: data.job.title,
          company: data.job.company,
          jobUrl: data.job.url,
          jobDescription: data.job.description,
          resumeText: data.resume.content,
          resumeId: data.resume.savedResume?.id ?? null,
          resumeTitle: resumeTitleOf(data),
          resumeType: data.resume.savedResume?.kind ?? null,
          objectives: data.objective.goals,
          instructions: data.objective.instructions,
        },
      });

      setResult(output.result);
      setAnalyzedAt(new Date(output.createdAt));
      savedIdRef.current = output.id;

      if (output.saved) {
        queryClient.invalidateQueries({ queryKey: ["analyses"] });
      } else {
        toast.error("Não foi possível salvar esta análise no seu histórico.", {
          description: "Use o botão \"Salvar análise\" para tentar novamente.",
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error("[analisar-vaga]", error);
      setStep(3);
      toast.error(friendlyError(error));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (savedIdRef.current) {
      toast.success("Esta análise já está salva no seu histórico.");
      return;
    }
    if (!result) return;
    saveMutation.mutate(
      {
        jobTitle: data.job.title,
        company: data.job.company,
        jobUrl: data.job.url,
        jobDescription: data.job.description,
        resumeId: data.resume.savedResume?.id ?? null,
        resumeTitle: resumeTitleOf(data),
        resumeType: data.resume.savedResume?.kind ?? null,
        result,
      },
      {
        onSuccess: (id) => {
          savedIdRef.current = id;
          toast.success("Análise salva no seu histórico.");
        },
        onError: () =>
          toast.error("Não foi possível salvar esta análise no seu histórico."),
      },
    );
  };

  const reset = () => {
    setResult(null);
    setIsAnalyzing(false);
    setData(INITIAL_DATA);
    savedIdRef.current = null;
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
              resumeTitle={resumeTitleOf(data)}
              onSave={handleSave}
              saving={saveMutation.isPending}
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

function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("AI_RATE_LIMIT"))
    return "Muitas análises em sequência. Aguarde alguns instantes e tente novamente.";
  if (message.includes("AI_CREDITS"))
    return "Os créditos de IA acabaram. Recarregue para continuar analisando.";
  if (message.includes("currículo")) return message;
  return "Não foi possível concluir esta análise. Tente novamente.";
}
