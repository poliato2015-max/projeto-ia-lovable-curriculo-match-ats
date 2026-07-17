import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export const Route = createFileRoute("/ia-coach")({
  head: () => ({
    meta: [
      { title: "IA Coach — RadarCV AI" },
      { name: "description", content: "Um coach de carreira com IA disponível 24/7." },
    ],
  }),
  component: () => (
    <ComingSoonPage
      icon={Sparkles}
      title="IA Coach"
      description="Receba sugestões personalizadas para acelerar sua carreira com inteligência artificial."
    />
  ),
});
