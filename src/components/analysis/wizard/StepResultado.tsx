import { Briefcase, GraduationCap, Languages, Save, Sparkles, RotateCcw, Building2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ATSScoreCard } from "../ATSScoreCard";
import { SkillsCard } from "../SkillsCard";
import { KeywordsCard } from "../KeywordsCard";
import { MetricCard } from "../MetricCard";
import { RecommendationsCard } from "../RecommendationsCard";
import { AnalysisSummary } from "../AnalysisSummary";
import { GapsCard } from "../GapsCard";
import type { AnalysisResult } from "../mock";

interface StepResultadoProps {
  result: AnalysisResult;
  jobTitle: string;
  company: string;
  analyzedAt: Date;
  onReset: () => void;
  onGenerate?: () => void;
  /** Ação de salvar a análise no histórico. */
  onSave?: () => void;
  saving?: boolean;
  /** Modo leitura, usado ao reabrir uma análise do histórico. */
  readOnly?: boolean;
  resumeTitle?: string | null;
  resetLabel?: string;
}

export function StepResultado({
  result,
  jobTitle,
  company,
  analyzedAt,
  onReset,
  onGenerate,
  onSave,
  saving,
  readOnly,
  resumeTitle,
  resetLabel,
}: StepResultadoProps) {
  const gaps = [...result.hardSkills, ...result.softSkills];
  const dateStr = analyzedAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="truncate text-xl font-semibold text-foreground">
            {jobTitle || "Análise ATS"}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {company || "—"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {dateStr}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2" onClick={onReset}>
            <RotateCcw className="h-4 w-4" /> Nova análise
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              toast("Análise salva (mock)", {
                description: "A persistência será implementada na próxima Sprint.",
              })
            }
          >
            <Save className="h-4 w-4" /> Salvar análise
          </Button>
          <Button size="sm" className="gap-2" onClick={onGenerate}>
            <Sparkles className="h-4 w-4" /> Gerar Currículo ATS
          </Button>
        </div>
      </div>

      {/* Hero: Match ATS + Resumo Executivo */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ATSScoreCard score={result.score} label={result.scoreLabel} />
        </div>
        <div className="lg:col-span-3">
          <AnalysisSummary summary={result.summary} />
        </div>
      </div>

      {/* Métricas */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Métricas da análise
        </h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkillsCard
            title="Hard Skills"
            description="Competências técnicas exigidas."
            skills={result.hardSkills}
          />
          <SkillsCard
            title="Soft Skills"
            description="Competências comportamentais."
            skills={result.softSkills}
          />
          <KeywordsCard found={result.keywords.found} total={result.keywords.total} />
          <MetricCard
            title="Experiência"
            icon={Briefcase}
            value={`${result.experienceMatch}%`}
            progress={result.experienceMatch}
            hint="Experiência compatível com a vaga."
          />
          <MetricCard
            title="Formação"
            icon={GraduationCap}
            value={result.education}
            hint="Requisitos acadêmicos atendidos."
          />
          <MetricCard
            title="Idiomas"
            icon={Languages}
            value={`${result.languages.length} identificados`}
            badges={result.languages}
          />
          <div className="md:col-span-2 xl:col-span-3">
            <GapsCard skills={gaps} />
          </div>
        </div>
      </div>

      {/* Recomendações */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recomendações prioritárias
        </h3>
        <RecommendationsCard items={result.recommendations} />
      </div>

      {/* Ação final */}
      <div className="flex justify-end border-t border-border/60 pt-4">
        <Button size="lg" className="gap-2" onClick={onGenerate}>
          <Sparkles className="h-4 w-4" /> Gerar Currículo ATS
        </Button>
      </div>
    </div>
  );
}
