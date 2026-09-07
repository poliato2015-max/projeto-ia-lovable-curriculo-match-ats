import { createFileRoute } from "@tanstack/react-router";

import { LandingHeader } from "@/components/landing/LandingHeader";
import {
  HeroSection,
  ProblemSection,
  FeaturesSection,
  HowItWorksSection,
  BenefitsSection,
  AboutSection,
  FinalCTASection,
  LandingFooter,
} from "@/components/landing/LandingSections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RadarCV AI — Match ATS e currículos otimizados com IA" },
      {
        name: "description",
        content:
          "Analise vagas, descubra seu Match ATS, receba recomendações inteligentes e gere um currículo otimizado com Inteligência Artificial.",
      },
      { property: "og:title", content: "RadarCV AI — Match ATS e currículos otimizados com IA" },
      {
        property: "og:description",
        content:
          "Descubra seu Match ATS, receba recomendações e gere um currículo otimizado com IA.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://projeto-ia-lovable-radarcv.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://projeto-ia-lovable-radarcv.lovable.app/" }],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <AboutSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
