import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Languages } from "lucide-react";
import { ATSScoreCard } from "./ATSScoreCard";
import { SkillsCard } from "./SkillsCard";
import { KeywordsCard } from "./KeywordsCard";
import { MetricCard } from "./MetricCard";
import { RecommendationsCard } from "./RecommendationsCard";
import { AnalysisSummary } from "./AnalysisSummary";
import type { AnalysisResult } from "./mock";

interface AnalysisResultPanelProps {
  result: AnalysisResult;
}

export function AnalysisResultPanel({ result }: AnalysisResultPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
    >
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
