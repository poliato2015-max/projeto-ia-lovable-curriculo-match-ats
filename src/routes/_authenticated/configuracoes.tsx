import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — RadarCV AI" },
      { name: "description", content: "Ajuste as preferências da sua conta." },
    ],
  }),
  component: () => (
    <ComingSoonPage
      icon={Settings}
      title="Configurações"
      description="Personalize a sua conta, preferências, notificações e integrações."
    />
  ),
});
