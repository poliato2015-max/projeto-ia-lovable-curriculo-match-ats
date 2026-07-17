import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export const Route = createFileRoute("/curriculos")({
  head: () => ({
    meta: [
      { title: "Currículos — RadarCV AI" },
      { name: "description", content: "Gerencie e otimize seus currículos com IA." },
    ],
  }),
  component: () => (
    <ComingSoonPage
      icon={FileText}
      title="Currículos"
      description="Crie, edite e organize múltiplas versões do seu currículo em um único lugar."
    />
  ),
});
