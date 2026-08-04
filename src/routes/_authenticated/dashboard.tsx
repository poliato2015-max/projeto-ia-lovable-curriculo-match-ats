import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  FileCheck2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Radar,
  Clock,
  Target,
  Award,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageContainer } from "@/components/common/PageContainer";
import { StatsCard } from "@/components/common/StatsCard";
import { ContentCard } from "@/components/common/ContentCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — RadarCV AI" },
      {
        name: "description",
        content:
          "Visualize suas estatísticas de currículos, vagas analisadas e score ATS em um só lugar.",
      },
    ],
  }),
  component: DashboardPage,
});

const chartData = [
  { name: "Seg", score: 62 },
  { name: "Ter", score: 68 },
  { name: "Qua", score: 71 },
  { name: "Qui", score: 74 },
  { name: "Sex", score: 79 },
  { name: "Sáb", score: 82 },
  { name: "Dom", score: 86 },
];

const recentActivities = [
  {
    icon: FileCheck2,
    title: "Currículo ATS gerado",
    subtitle: "Product Manager Sênior · Nubank",
    time: "há 2h",
    tag: "ATS",
  },
  {
    icon: Search,
    title: "Vaga analisada",
    subtitle: "Frontend Engineer · Stripe",
    time: "há 5h",
    tag: "Análise",
  },
  {
    icon: FileText,
    title: "Currículo atualizado",
    subtitle: "Versão 3 · Design System",
    time: "ontem",
    tag: "Edição",
  },
  {
    icon: Sparkles,
    title: "IA Coach sugeriu melhorias",
    subtitle: "12 sugestões aplicadas",
    time: "ontem",
    tag: "Coach",
  },
];

function DashboardPage() {
  return (
    <PageContainer>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 md:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"
        />
        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6">
          <div className="min-w-0">
            <Badge className="mb-3 border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">
              <Radar className="mr-1 h-3 w-3" />
              Foundation Sprint
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl">
              Bem-vindo ao RadarCV AI
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
              Otimize seus currículos, analise vagas e destaque-se no processo seletivo
              com inteligência artificial de ponta.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" className="gap-1.5">
                Analisar vaga
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                Novo currículo
              </Button>
            </div>
          </div>
          <div className="hidden shrink-0 md:block">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-xl">
              <Radar className="h-10 w-10" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          index={0}
          label="Currículos"
          value={12}
          icon={FileText}
          delta={{ value: "+3", positive: true }}
          hint="Nos últimos 30 dias"
        />
        <StatsCard
          index={1}
          label="Vagas analisadas"
          value={38}
          icon={Search}
          delta={{ value: "+18%", positive: true }}
          hint="vs. mês anterior"
        />
        <StatsCard
          index={2}
          label="Score médio ATS"
          value="86"
          icon={Target}
          delta={{ value: "+4 pts", positive: true }}
          hint="Compatibilidade média"
        />
        <StatsCard
          index={3}
          label="Currículos ATS"
          value={24}
          icon={FileCheck2}
          delta={{ value: "+6", positive: true }}
          hint="Gerados este mês"
        />
      </section>

      {/* Chart + activities */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ContentCard
          className="lg:col-span-2"
          title="Evolução do score ATS"
          description="Média semanal de compatibilidade"
          action={
            <Badge variant="outline" className="gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              +24 pts
            </Badge>
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  domain={[40, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-popover)",
                    borderColor: "var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--color-foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>

        <ContentCard
          title="Metas do mês"
          description="Progresso das suas metas"
        >
          <div className="space-y-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  Score ATS 90+
                </span>
                <span className="text-muted-foreground">86 / 90</span>
              </div>
              <Progress value={95} />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Search className="h-3.5 w-3.5 text-primary" />
                  Vagas analisadas
                </span>
                <span className="text-muted-foreground">38 / 50</span>
              </div>
              <Progress value={76} />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-foreground">
                  <FileCheck2 className="h-3.5 w-3.5 text-primary" />
                  Currículos ATS
                </span>
                <span className="text-muted-foreground">24 / 30</span>
              </div>
              <Progress value={80} />
            </div>
          </div>
        </ContentCard>
      </section>

      {/* Recent activities */}
      <section className="mt-8">
        <SectionTitle
          title="Atividade recente"
          description="Suas últimas ações na plataforma"
          action={
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              Ver tudo
              <ArrowRight className="h-3 w-3" />
            </Button>
          }
        />
        <ContentCard bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {recentActivities.map((a, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.subtitle}</p>
                </div>
                <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">
                  {a.tag}
                </Badge>
                <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
                  <Clock className="h-3 w-3" />
                  {a.time}
                </span>
              </motion.li>
            ))}
          </ul>
        </ContentCard>
      </section>
    </PageContainer>
  );
}
