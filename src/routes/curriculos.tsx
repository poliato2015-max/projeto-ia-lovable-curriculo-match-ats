import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SlidersHorizontal, Upload } from "lucide-react";

import { PageContainer } from "@/components/common/PageContainer";
import { PageTitle } from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import {
  EmptyResumeLibrary,
  ImportResumeDialog,
  MOCK_RESUMES,
  ResumeFilters,
  ResumeList,
  ResumeSearch,
  ResumeStats,
  type Resume,
  type ResumeFilter,
} from "@/components/resumes";

export const Route = createFileRoute("/curriculos")({
  head: () => ({
    meta: [
      { title: "Biblioteca de Currículos — RadarCV AI" },
      {
        name: "description",
        content:
          "Gerencie, filtre e organize seus currículos originais e versões ATS em um só lugar.",
      },
    ],
  }),
  component: CurriculosPage,
});

function applyFilter(resumes: Resume[], filter: ResumeFilter): Resume[] {
  switch (filter) {
    case "original":
      return resumes.filter((r) => r.kind === "original");
    case "ats":
      return resumes.filter((r) => r.kind === "ats");
    case "pt":
      return resumes.filter((r) => r.language === "pt");
    case "en":
      return resumes.filter((r) => r.language === "en");
    case "recent":
      return [...resumes].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    default:
      return resumes;
  }
}

function CurriculosPage() {
  // Estado mockado — toggle rápido para visualizar a Empty State:
  // troque `MOCK_RESUMES` por `[]` para ver o estado vazio.
  const [resumes] = useState<Resume[]>(MOCK_RESUMES);
  const [importOpen, setImportOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ResumeFilter>("all");

  const isEmpty = resumes.length === 0;

  const filtered = useMemo(() => {
    const byFilter = applyFilter(resumes, filter);
    const q = query.trim().toLowerCase();
    if (!q) return byFilter;
    return byFilter.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q),
    );
  }, [resumes, filter, query]);

  const openImport = () => setImportOpen(true);

  return (
    <PageContainer>
      <PageTitle
        title="Biblioteca de Currículos"
        description="Organize seus currículos originais e versões otimizadas para ATS."
        actions={
          !isEmpty ? (
            <>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
              <Button size="sm" className="gap-2" onClick={openImport}>
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importar Currículo</span>
                <span className="sm:hidden">Importar</span>
              </Button>
            </>
          ) : null
        }
      />

      {isEmpty ? (
        <EmptyResumeLibrary onImport={openImport} />
      ) : (
        <div className="space-y-6">
          <ResumeStats resumes={resumes} />

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <ResumeFilters active={filter} onChange={setFilter} />
            <ResumeSearch value={query} onChange={setQuery} />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center text-sm text-muted-foreground">
              Nenhum currículo encontrado para os filtros aplicados.
            </div>
          ) : (
            <ResumeList resumes={filtered} />
          )}
        </div>
      )}

      <ImportResumeDialog open={importOpen} onOpenChange={setImportOpen} />
    </PageContainer>
  );
}
