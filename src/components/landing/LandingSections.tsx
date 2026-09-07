import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  ClipboardList,
  FileCheck2,
  FileSearch,
  FileText,
  Github,
  History,
  KeyRound,
  Library,
  ListChecks,
  Radar,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { scrollToSection } from "@/lib/navigation";
import { useAppEntryRoute } from "@/hooks/useAppEntry";
import { HeroMockup } from "./HeroMockup";

function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-20 px-4 py-16 md:px-6 md:py-24 ${className ?? ""}`}>
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

function SectionHeading({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h2>
      {text && <p className="mt-3 text-sm text-muted-foreground md:text-base">{text}</p>}
    </div>
  );
}

export function HeroSection() {
  const entryRoute = useAppEntryRoute();
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-28 md:px-6 md:pb-24 md:pt-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-primary/10 via-background to-background"
      />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">
            <Radar className="mr-1 h-3 w-3" />
            Inteligência de carreira
          </Badge>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Seu currículo está preparado para passar pelos sistemas ATS?
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            Analise qualquer vaga, descubra seu Match ATS, receba recomendações inteligentes e
            gere uma versão otimizada do seu currículo utilizando Inteligência Artificial.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-1.5">
              <Link to={entryRoute}>
                Analisar uma vaga
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("como-funciona")}
            >
              Ver como funciona
            </Button>
          </div>
        </motion.div>

        <HeroMockup />
      </div>
    </section>
  );
}

const problems = [
  {
    icon: FileText,
    title: "Currículos Genéricos",
    text: "Enviar o mesmo currículo para todas as vagas reduz significativamente as chances de aprovação.",
  },
  {
    icon: KeyRound,
    title: "Falta de Palavras-chave",
    text: "Competências importantes deixam de ser identificadas pelos sistemas ATS.",
  },
  {
    icon: AlertTriangle,
    title: "Baixa Compatibilidade",
    text: "Mesmo candidatos qualificados podem ser eliminados antes da entrevista.",
  },
];

export function ProblemSection() {
  return (
    <Section className="border-t border-border/60 bg-surface/30">
      <SectionHeading
        title="Por que tantos currículos são rejeitados antes mesmo da entrevista?"
        text="Grande parte das empresas utiliza sistemas ATS para filtrar candidatos automaticamente. Antes de qualquer avaliação humana, o software decide quem avança com base em palavras-chave e compatibilidade com a vaga."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {problems.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <Card className="h-full border-border/70 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

const features = [
  { icon: FileSearch, title: "Diagnóstico ATS", text: "Compare automaticamente currículo e vaga." },
  { icon: Target, title: "Match Inteligente", text: "Receba uma pontuação de aderência." },
  { icon: Brain, title: "Recomendações Inteligentes", text: "Saiba exatamente onde melhorar." },
  { icon: FileCheck2, title: "Currículo ATS", text: "Gere uma versão otimizada pronta para exportação." },
];

export function FeaturesSection() {
  return (
    <Section id="funcionalidades">
      <SectionHeading title="O RadarCV faz esse trabalho para você." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Card className="h-full border-border/70 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

const steps = [
  { icon: ClipboardList, title: "Cole a vaga", text: "Informe título, empresa e a descrição da vaga desejada." },
  { icon: FileText, title: "Escolha o currículo", text: "Use um currículo salvo, cole o texto ou importe um novo arquivo." },
  { icon: ListChecks, title: "Receba o diagnóstico", text: "Match ATS, palavras-chave, lacunas e recomendações priorizadas." },
  { icon: Wand2, title: "Gere o currículo ATS", text: "Uma versão otimizada, pronta para revisar e exportar." },
];

export function HowItWorksSection() {
  return (
    <Section id="como-funciona" className="border-y border-border/60 bg-surface/30">
      <SectionHeading
        title="Como funciona"
        text="Quatro etapas simples entre a vaga e um currículo otimizado."
      />
      <div className="relative grid gap-4 md:grid-cols-4">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-[38px] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
        />
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="relative"
          >
            <div className="flex flex-col items-center text-center">
              <span className="relative z-10 flex h-[76px] w-[76px] items-center justify-center rounded-2xl border border-border/70 bg-background text-primary shadow-sm">
                <s.icon className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[11px] font-bold text-primary-foreground shadow-sm">
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
                {s.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

const benefits = [
  { icon: Target, label: "Match ATS" },
  { icon: FileSearch, label: "Diagnóstico Inteligente" },
  { icon: ListChecks, label: "Recomendações Prioritárias" },
  { icon: FileCheck2, label: "Currículos ATS" },
  { icon: Library, label: "Biblioteca de Currículos" },
  { icon: History, label: "Histórico de Análises" },
  { icon: Sparkles, label: "IA Coach", soon: true },
];

export function BenefitsSection() {
  return (
    <Section className="border-t border-border/60 bg-surface/30">
      <SectionHeading title="Tudo que você precisa para aumentar suas chances nas candidaturas." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <Card key={b.label} className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <b.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{b.label}</p>
                {b.soon && (
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    Em breve
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function AboutSection() {
  return (
    <Section id="sobre">
      <div className="mx-auto max-w-3xl text-center">
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
          <BookOpen className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Sobre o RadarCV AI
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          RadarCV AI é um projeto Open Source desenvolvido para estudos de Inteligência Artificial
          aplicada à otimização de currículos para sistemas ATS.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Seu objetivo é demonstrar, na prática, a construção de uma plataforma SaaS moderna
          utilizando IA, automação e boas práticas de arquitetura de software.
        </p>
        <div className="mt-6">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Github className="h-4 w-4" />
            Ver projeto no GitHub
          </Button>
        </div>
      </div>
    </Section>
  );
}

export function FinalCTASection() {
  const entryRoute = useAppEntryRoute();
  return (
    <Section>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-6 py-12 text-center md:px-12 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Pronto para aumentar suas chances nas próximas candidaturas?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Comece agora sua primeira análise e descubra em minutos o que separa seu currículo da
            próxima entrevista.
          </p>
          <div className="mt-7 flex justify-center">
            <Button asChild size="lg" className="gap-1.5">
              <Link to={entryRoute}>
                Analisar uma vaga
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background px-4 py-10 md:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
            <Radar className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold tracking-tight text-foreground">RadarCV AI</span>
          <Badge variant="outline" className="text-[10px]">
            Versão Beta
          </Badge>
        </div>
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
          Projeto Open Source para estudos de Inteligência Artificial aplicada à otimização de
          currículos para sistemas ATS.
        </p>
      </div>
    </footer>
  );
}

