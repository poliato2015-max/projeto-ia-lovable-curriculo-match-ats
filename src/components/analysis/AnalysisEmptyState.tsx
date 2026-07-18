import { Radar } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";

export function AnalysisEmptyState() {
  return (
    <EmptyState
      icon={Radar}
      title="Nenhuma vaga analisada."
      description="Informe uma URL ou descrição da vaga e clique em Analisar Compatibilidade para ver seu Match ATS."
      className="min-h-[420px]"
    />
  );
}
