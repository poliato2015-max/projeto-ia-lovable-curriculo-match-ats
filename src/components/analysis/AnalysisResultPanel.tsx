import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Languages, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ATSScoreCard } from "./ATSScoreCard";
import { SkillsCard } from "./SkillsCard";
import { KeywordsCard } from "./KeywordsCard";
import { MetricCard } from "./MetricCard";
import { RecommendationsCard } from "./RecommendationsCard";
import { AnalysisSummary } from "./AnalysisSummary";
import { toast } from "sonner";
import { exportAnalysisReportPdf } from "@/lib/resume-export";
import type { AnalysisResult } from "./analysis-types";

interface AnalysisResultPanelProps {
  result: AnalysisResult;
  jobTitle?: string;
  company?: string;
  analyzedAt?: Date;
  readOnly?: boolean;
  resumeTitle?: string | null;
}

export function AnalysisResultPanel({
  result,
  jobTitle,
  company,
  analyzedAt,
  readOnly,
  resumeTitle,
}: AnalysisResultPanelProps) {
  const [exporting, setExporting] = useState(false);

  const handleExportReport = async () => {
    if (!jobTitle || !company || !analyzedAt) return;

    setExporting(true);
    try {
      await exportAnalysisReportPdf({
        result,
        jobTitle,
        company,
        analyzedAt,
        resumeTitle,
        readOnly,
      });
      toast.success("Relatório PDF baixado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao gerar PDF do relatório");
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Header com botão de exportação no modo readOnly */}
      {readOnly && jobTitle && company && analyzedAt && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={exporting}
            onClick={handleExportReport}
            aria-label="Exportar relatório de análise em PDF"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            PDF Relatório
          </Button>
        </div>
      )}

      <ATSScoreCard score={result.score} label={result.scoreLabel} />

      <div className="grid gap-4 md:grid-cols-2">
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
      </div>

      <MetricCard
        title="Idiomas"
        icon={Languages}
        value={`${result.languages.length} identificados`}
        badges={result.languages}
      />

      <RecommendationsCard items={result.recommendations} />

      <AnalysisSummary summary={result.summary} />
    </motion.div>
  );
}
