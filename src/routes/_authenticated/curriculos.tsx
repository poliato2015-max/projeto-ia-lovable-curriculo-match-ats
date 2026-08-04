import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

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
  ResumeViewDialog,
  type Resume,
  type ResumeFilter,
} from "@/components/resumes";

export const Route = createFileRoute("/_authenticated/_authenticated/curriculos")({
  head: () => ({
    meta: [
      { title: "Biblioteca de Currículos — RadarCV AI" },
      {
        name: "description",
        content:
          "Organize seus currículos importados e versões otimizadas para ATS em um único lugar.",
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
    case "favorites":
      return resumes.filter((r) => r.favorite);
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
  const navigate = useNavigate();
  const [resumes] = useState<Resume[]>(MOCK_RESUMES);
  const [importOpen, setImportOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ResumeFilter>("all");
  const [viewing, setViewing] = useState<Resume | null>(null);

  const isEmpty = resumes.length === 0;

  const filtered = useMemo(() => {
    const byFilter = applyFilter(resumes, filter);
    const q = query.trim().toLowerCase();
    if (!q) return byFilter;
    return byFilter.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        (r.company ?? "").toLowerCase().includes(q),
    );
  }, [resumes, filter, query]);

  const openImport = () => setImportOpen(true);
  const mock = (label: string) => toast.success(`${label} (mock)`);

  return (
    <PageContainer>
      <PageTitle
        title="Biblioteca de Currículos"
        description="Organize seus currículos importados e versões otimizadas para ATS em um único lugar."
        actions={
          !isEmpty ? (
            <>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate({ to: "/analisar-vaga" })}>
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Nova análise</span>
                <span className="sm:hidden">Analisar</span>
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
            <ResumeList
              resumes={filtered}
              onView={setViewing}
              onEdit={() => mock("Editar currículo")}
              onExportPdf={() => mock("Exportação PDF iniciada")}
              onExportDocx={() => mock("Exportação DOCX iniciada")}
              onDelete={() => mock("Currículo excluído")}
            />
          )}
        </div>
      )}

      <ImportResumeDialog open={importOpen} onOpenChange={setImportOpen} />
      <ResumeViewDialog
        resume={viewing}
        open={viewing !== null}
        onOpenChange={(o) => !o && setViewing(null)}
        onEdit={() => mock("Modo edição")}
      />
    </PageContainer>
  );
}
