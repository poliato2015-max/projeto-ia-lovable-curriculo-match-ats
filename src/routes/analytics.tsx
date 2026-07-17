import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — RadarCV AI" },
      { name: "description", content: "Métricas e insights sobre a sua evolução profissional." },
    ],
  }),
  component: () => (
    <ComingSoonPage
      icon={BarChart3}
      title="Analytics"
      description="Acompanhe seu desempenho, evolução do score ATS e tendências ao longo do tempo."
    />
  ),
});
