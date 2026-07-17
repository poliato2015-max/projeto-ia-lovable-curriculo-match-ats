import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export const Route = createFileRoute("/analisar-vaga")({
  head: () => ({
    meta: [
      { title: "Analisar Vaga — RadarCV AI" },
      { name: "description", content: "Compare seu currículo com qualquer vaga em segundos." },
    ],
  }),
  component: () => (
    <ComingSoonPage
      icon={Search}
      title="Analisar Vaga"
      description="Descubra o quão compatível o seu currículo está com uma vaga específica."
    />
  ),
});
