import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2 } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export const Route = createFileRoute("/_authenticated/curriculos-ats")({
  head: () => ({
    meta: [
      { title: "Currículos ATS — RadarCV AI" },
      { name: "description", content: "Gere currículos otimizados para sistemas ATS." },
    ],
  }),
  component: () => (
    <ComingSoonPage
      icon={FileCheck2}
      title="Currículos ATS"
      description="Versões otimizadas para passar por sistemas de rastreamento de candidatos."
    />
  ),
});
