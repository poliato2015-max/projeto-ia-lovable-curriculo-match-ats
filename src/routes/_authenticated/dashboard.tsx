import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageContainer } from "@/components/common/PageContainer";
import { PageTitle } from "@/components/common/PageTitle";
import { StatsCard } from "@/components/common/StatsCard";
import { ContentCard } from "@/components/common/ContentCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDashboard } from "@/hooks/useDashboard";
import type { DashboardData } from "@/services/dashboard.service";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — RadarCV" },
      {
        name: "description",
        content:
          "Acompanhe o desempenho das suas análises de vagas, evolução do match ATS e pontos de melhoria.",
      },
      { property: "og:title", content: "Dashboard — RadarCV" },
      {
        property: "og:description",
        content: "Acompanhe seu desempenho nas análises e identifique onde pode melhorar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  const newAnalysisButton = (
    <Button asChild size="sm" className="gap-1.5">
      <Link to="/analisar-vaga">
        Nova análise
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );

  return (
    <PageContainer>
      <PageTitle
        title="Dashboard"
        description="Acompanhe seu desempenho nas análises e identifique onde pode melhorar."
        actions={newAnalysisButton}
      />

      {isLoading && <LoadingState rows={4} />}

      {isError && !isLoading && (
        <EmptyState
          icon={AlertTriangle}
          title="Não foi possível carregar seus indicadores"
          description="Tente novamente em alguns instantes."
        />
      )}

      {data && !isLoading && (data.total === 0 ? <NoAnalyses /> : <DashboardContent data={data} />)}
    </PageContainer>
  );
}

function NoAnalyses() {
  return (
    <EmptyState
      icon={BarChart3}
      title="Você ainda não realizou nenhuma análise."
      description="Faça sua primeira análise para começar a acompanhar seu desempenho."
      action={
        <Button asChild className="gap-1.5">
          <Link to="/analisar-vaga">
            Nova análise
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      }
    />
  );
}

type PeriodValue = 7 | 30 | 90 | "all";

const PERIODS: { value: PeriodValue; label: string }[] = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
  { value: "all", label: "Tudo" },
];

interface ChartPoint {
  label: string;
  score: number;
  createdAt: string;
  jobTitle: string;
  company: string | null;
  count: number;
}

/** Limite acima do qual os pontos passam a ser agrupados por dia. */
const GROUPING_THRESHOLD = 20;

function buildChartData(
  timeline: DashboardData["timeline"],
  period: PeriodValue,
): ChartPoint[] {
  const filtered =
    period === "all"
      ? timeline
      : timeline.filter(
          (point) =>
            new Date(point.createdAt).getTime() >= Date.now() - period * 24 * 60 * 60 * 1000,
        );

  const sorted = [...filtered].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (sorted.length <= GROUPING_THRESHOLD) {
    return sorted.map((point) => ({
      label: formatDate(point.createdAt),
      score: point.score,
      createdAt: point.createdAt,
      jobTitle: point.jobTitle,
      company: point.company,
      count: 1,
    }));
  }

  const byDay = new Map<string, { total: number; count: number; point: ChartPoint }>();
  for (const point of sorted) {
    const key = new Date(point.createdAt).toISOString().slice(0, 10);
    const existing = byDay.get(key);
    if (existing) {
      existing.total += point.score;
      existing.count += 1;
    } else {
      byDay.set(key, {
        total: point.score,
        count: 1,
        point: {
          label: formatDate(point.createdAt),
          score: point.score,
          createdAt: point.createdAt,
          jobTitle: point.jobTitle,
          company: point.company,
          count: 1,
        },
      });
    }
  }

  return [...byDay.values()].map((entry) => ({
    ...entry.point,
    score: Math.round(entry.total / entry.count),
    count: entry.count,
  }));
}

function DashboardContent({ data }: { data: DashboardData }) {
  const [period, setPeriod] = useState<PeriodValue>(30);
  const chartData = useMemo(() => buildChartData(data.timeline, period), [data.timeline, period]);


  const distributionRows = [
    { label: "Alta compatibilidade", hint: "80% a 100%", value: data.distribution.high },
    { label: "Boa compatibilidade", hint: "60% a 79%", value: data.distribution.good },
    { label: "Baixa compatibilidade", hint: "0% a 59%", value: data.distribution.low },
  ];
  const distributionTotal = distributionRows.reduce((sum, row) => sum + row.value, 0) || 1;

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          index={0}
          label="Match médio"
          value={data.averageScore !== null ? `${data.averageScore}%` : "—"}
          icon={Target}
          hint="Média das suas análises"
        />
        <StatsCard
          index={1}
          label="Melhor match"
          value={data.bestScore !== null ? `${data.bestScore}%` : "—"}
          icon={TrendingUp}
          hint="Sua melhor compatibilidade"
        />
        <StatsCard
          index={2}
          label="Análises realizadas"
          value={data.total}
          icon={Search}
          hint="Total no seu histórico"
        />
        <StatsCard
          index={3}
          label="Este mês"
          value={data.thisMonth}
          icon={CalendarDays}
          hint="Análises no mês atual"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ContentCard
          className="lg:col-span-2"
          title="Histórico do seu Match ATS"
          description="Variação cronológica dos resultados das suas análises"
          action={
            <div className="flex flex-wrap gap-1">
              {PERIODS.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={period === option.value ? "secondary" : "ghost"}
                  className="h-7 px-2 text-xs"
                  onClick={() => setPeriod(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          }
        >
          {chartData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma análise com pontuação neste período.
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
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
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const point = payload[0]?.payload as ChartPoint;
                      return (
                        <div className="max-w-56 rounded-lg border border-border bg-popover p-3 text-xs shadow-md">
                          <p className="font-semibold text-foreground">
                            {point.score}% {point.count > 1 ? "de match médio" : "de match"}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {new Date(point.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                          {point.count > 1 ? (
                            <p className="text-muted-foreground">
                              {point.count} análises neste dia
                            </p>
                          ) : (
                            <>
                              <p className="text-muted-foreground">{point.jobTitle}</p>
                              {point.company && (
                                <p className="text-muted-foreground">{point.company}</p>
                              )}
                            </>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ContentCard>

        <ContentCard
          title="Compatibilidade das suas análises"
          description="Distribuição por faixa de match"
        >
          <div className="space-y-5">
            {distributionRows.map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="min-w-0 truncate text-foreground">{row.label}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {row.value} {row.value === 1 ? "análise" : "análises"}
                  </span>
                </div>
                <Progress value={(row.value / distributionTotal) * 100} />
                <p className="mt-1 text-xs text-muted-foreground">{row.hint}</p>
              </div>
            ))}
          </div>
        </ContentCard>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FrequencyCard
          title="Principais pontos de atenção"
          description="Itens que mais se repetem nas suas análises"
          icon={AlertTriangle}
          tone="warning"
          items={data.attentionPoints}
          emptyMessage="Ainda não há dados suficientes para identificar seus principais pontos de atenção."
        />
        <FrequencyCard
          title="Seus principais pontos fortes"
          description="O que mais se destaca nos seus resultados"
          icon={CheckCircle2}
          tone="positive"
          items={data.strengths}
          emptyMessage="Ainda não há dados suficientes para identificar seus principais pontos fortes."
        />
      </section>

      <section className="mt-6">
        <ContentCard
          title="Próximo passo"
          description="Orientação baseada nas suas análises"
        >
          {data.nextSteps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Continue realizando análises para que o RadarCV consiga identificar padrões e sugerir
              próximos passos.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.nextSteps.map((step, index) => (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex gap-3 text-sm text-foreground"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="min-w-0">{step}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </ContentCard>
      </section>
    </>
  );
}

function FrequencyCard({
  title,
  description,
  icon: Icon,
  tone,
  items,
  emptyMessage,
}: {
  title: string;
  description: string;
  icon: typeof AlertTriangle;
  tone: "warning" | "positive";
  items: { label: string; count: number }[];
  emptyMessage: string;
}) {
  return (
    <ContentCard title={title} description={description}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.slice(0, 5).map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              <Icon
                className={
                  tone === "warning"
                    ? "h-4 w-4 shrink-0 text-destructive"
                    : "h-4 w-4 shrink-0 text-primary"
                }
              />
              <FrequencyLabel label={item.label} />
              <Badge variant="outline" className="shrink-0 text-[10px]">
                {item.count}x
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </ContentCard>
  );
}

/** Rótulo compacto: trunca visualmente e revela o texto completo em hover ou toque. */
function FrequencyLabel({ label }: { label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="min-w-0 flex-1 truncate text-left text-sm text-foreground"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={() => setOpen((value) => !value)}
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        collisionPadding={12}
        className="max-w-xs text-sm leading-relaxed break-words"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {label}
      </PopoverContent>
    </Popover>
  );
}
