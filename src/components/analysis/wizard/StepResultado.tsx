import { Briefcase, GraduationCap, Save, Sparkles, RotateCcw } from "lucide-react";
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
  onReset: () => void;
}

export function StepResultado({ result, onReset }: StepResultadoProps) {
  const gaps = [...result.hardSkills, ...result.softSkills];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Resultado da Análise ATS</h2>
          <p className="text-sm text-muted-foreground">
            Score, gaps e recomendações personalizadas para esta vaga.
          </p>
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
          <Button
            size="sm"
            className="gap-2"
            onClick={() =>
              toast("Otimizar Currículo", {
                description: "Esta funcionalidade será implementada na próxima Sprint.",
              })
            }
          >
            <Sparkles className="h-4 w-4" /> Otimizar Currículo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ATSScoreCard score={result.score} label={result.scoreLabel} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
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
          <GapsCard skills={gaps} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecommendationsCard items={result.recommendations} />
        <AnalysisSummary summary={result.summary} />
      </div>
    </div>
  );
}
