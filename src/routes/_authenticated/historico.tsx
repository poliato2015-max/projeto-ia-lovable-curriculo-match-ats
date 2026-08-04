import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — RadarCV AI" },
      { name: "description", content: "Todo o histórico das suas análises e edições." },
    ],
  }),
  component: () => (
    <ComingSoonPage
      icon={History}
      title="Histórico"
      description="Consulte todas as suas análises, edições e currículos gerados."
    />
  ),
});
