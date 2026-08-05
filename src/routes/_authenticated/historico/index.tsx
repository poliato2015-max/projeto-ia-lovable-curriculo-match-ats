import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  FileText,
  History,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "@/components/common/PageContainer";
import { PageTitle } from "@/components/common/PageTitle";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreTier, SCORE_TIERS } from "@/lib/ats-score";
import { useAnalyses, useAnalysisMutations } from "@/hooks/useAnalyses";
import type { AnalysisRecord } from "@/services/analyses.service";

export const Route = createFileRoute("/_authenticated/historico/")({
  head: () => ({
    meta: [
      { title: "Histórico de análises — RadarCV AI" },
      {
        name: "description",
        content:
          "Consulte suas análises de vagas anteriores, acompanhe o Match ATS e reabra resultados.",
      },
      { property: "og:title", content: "Histórico de análises — RadarCV AI" },
      {
        property: "og:description",
        content: "Consulte suas análises de vagas anteriores e acompanhe seus resultados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoricoPage,
});

type PeriodFilter = "all" | "today" | "7d" | "30d";
type SortOption = "recent" | "oldest" | "score-desc" | "score-asc";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function withinPeriod(iso: string, period: PeriodFilter) {
  if (period === "all") return true;
  const date = new Date(iso);
  const now = new Date();
  if (period === "today") return date.toDateString() === now.toDateString();
  const days = period === "7d" ? 7 : 30;
  return now.getTime() - date.getTime() <= days * 24 * 60 * 60 * 1000;
}

function HistoricoPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAnalyses();
  const { deleteMutation } = useAnalysisMutations();

  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<string>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [sort, setSort] = useState<SortOption>("recent");
  const [pendingDelete, setPendingDelete] = useState<AnalysisRecord | null>(null);

  const analyses = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const stats = useMemo(() => {
    if (analyses.length === 0) {
      return { total: 0, last: "Nenhuma análise realizada", best: "—" };
    }
    const scores = analyses
      .map((a) => a.matchScore)
      .filter((s): s is number => typeof s === "number");
    return {
      total: analyses.length,
      last: formatDate(analyses[0]!.createdAt),
      best: scores.length ? `${Math.max(...scores)}%` : "—",
    };
  }, [analyses]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = analyses.filter((a) => {
      const matchesTerm =
        !term ||
        a.jobTitle.toLowerCase().includes(term) ||
        (a.company ?? "").toLowerCase().includes(term);
      const matchesTier = tier === "all" || getScoreTier(a.matchScore).id === tier;
      return matchesTerm && matchesTier && withinPeriod(a.createdAt, period);
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "score-desc":
          return (b.matchScore ?? 0) - (a.matchScore ?? 0);
        case "score-asc":
          return (a.matchScore ?? 0) - (b.matchScore ?? 0);
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
  }, [analyses, search, tier, period, sort]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      toast.success("Análise excluída do seu histórico.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir análise.");
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <PageContainer>
      <PageTitle
        title="Histórico de análises"
        description="Consulte suas análises de vagas anteriores e acompanhe seus resultados."
        actions={
          <Button className="gap-2" onClick={() => navigate({ to: "/analisar-vaga" })}>
            <Sparkles className="h-4 w-4" /> Nova análise
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total de análises" value={String(stats.total)} />
        <SummaryCard label="Última análise" value={stats.last} />
        <SummaryCard label="Maior Match ATS" value={stats.best} />
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar análises..."
            className="pl-9"
            aria-label="Pesquisar análises"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto">
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger className="sm:w-[190px]" aria-label="Filtrar por Match ATS">
              <SelectValue placeholder="Match ATS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {SCORE_TIERS.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="sm:w-[160px]" aria-label="Filtrar por período">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="sm:w-[170px]" aria-label="Ordenar análises">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigas</SelectItem>
              <SelectItem value="score-desc">Maior Match ATS</SelectItem>
              <SelectItem value="score-asc">Menor Match ATS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando histórico...
          </div>
        )}

        {isError && !isLoading && (
          <EmptyState
            icon={History}
            title="Não foi possível carregar seu histórico"
            description="Tente novamente em alguns instantes."
          />
        )}

        {!isLoading && !isError && analyses.length === 0 && (
          <EmptyState
            icon={History}
            title="Você ainda não realizou nenhuma análise"
            description="Analise uma vaga comparando-a com seu currículo para começar a construir seu histórico."
            action={
              <Button className="gap-2" onClick={() => navigate({ to: "/analisar-vaga" })}>
                <Sparkles className="h-4 w-4" /> Nova análise
              </Button>
            }
          />
        )}

        {!isLoading && !isError && analyses.length > 0 && visible.length === 0 && (
          <EmptyState
            icon={Search}
            title="Nenhuma análise encontrada"
            description="Ajuste a pesquisa ou os filtros para ver outros resultados."
          />
        )}

        {visible.map((analysis) => (
          <AnalysisHistoryCard
            key={analysis.id}
            analysis={analysis}
            onDelete={() => setPendingDelete(analysis)}
          />
        ))}

        {hasNextPage && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
            </Button>
          </div>
        )}
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir análise?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá esta análise do seu histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              Excluir análise
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <p className="mt-2 truncate text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function AnalysisHistoryCard({
  analysis,
  onDelete,
}: {
  analysis: AnalysisRecord;
  onDelete: () => void;
}) {
  const tier = getScoreTier(analysis.matchScore);

  return (
    <Card className="border-border/70 transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h3 className="truncate text-base font-semibold text-foreground">
            {analysis.jobTitle}
          </h3>
          <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            {analysis.company || "—"}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(analysis.createdAt)}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {analysis.resumeTitle || "Currículo não identificado"}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <div className="text-right">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {analysis.matchScore ?? "—"}
              {analysis.matchScore !== null && (
                <span className="text-base font-semibold">%</span>
              )}
            </p>
            <span
              className={cn(
                "mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                tier.className,
              )}
            >
              {tier.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link
                to="/historico/$analysisId"
                params={{ analysisId: analysis.id }}
              >
                Ver análise
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Excluir análise"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
