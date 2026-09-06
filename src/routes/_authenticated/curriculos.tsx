import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "@/components/common/PageContainer";
import { PageTitle } from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import {
  EditResumeDialog,
  EmptyResumeLibrary,
  ImportResumeDialog,
  ResumeFilters,
  ResumeList,
  ResumeSearch,
  ResumeStats,
  ResumeViewDialog,
  type Resume,
  type ResumeFilter,
} from "@/components/resumes";
import { useResumeMutations, useResumes } from "@/hooks/useResumes";
import { ensureResumeText } from "@/services/resumes.service";
import { exportResumeDocx, exportResumePdf } from "@/lib/resume-export";

export const Route = createFileRoute("/_authenticated/curriculos")({
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
  const { data, isLoading, isError } = useResumes();
  const {
    importMutation,
    updateMutation,
    deleteMutation,
    defaultMutation,
    contentMutation,
  } = useResumeMutations();

  const resumes = useMemo(() => data ?? [], [data]);
  const [importOpen, setImportOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ResumeFilter>("all");
  const [viewing, setViewing] = useState<Resume | null>(null);
  const [editing, setEditing] = useState<Resume | null>(null);

  const isEmpty = !isLoading && resumes.length === 0;

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
  const fail = (error: unknown, fallback: string) =>
    toast.error(error instanceof Error ? error.message : fallback);

  const handleImport = async (file: File) => {
    try {
      await importMutation.mutateAsync({ file });
      toast.success("Currículo importado com sucesso.");
      setImportOpen(false);
    } catch (error) {
      fail(error, "Falha ao importar o currículo.");
    }
  };

  const handleDelete = async (resume: Resume) => {
    try {
      await deleteMutation.mutateAsync({ id: resume.id, filePath: resume.filePath });
      toast.success("Currículo excluído.");
    } catch (error) {
      fail(error, "Falha ao excluir o currículo.");
    }
  };

  const handleToggleDefault = async (resume: Resume) => {
    try {
      await defaultMutation.mutateAsync({ id: resume.id, isDefault: !resume.favorite });
      toast.success(
        resume.favorite ? "Currículo padrão removido." : "Currículo definido como padrão.",
      );
    } catch (error) {
      fail(error, "Falha ao atualizar o currículo padrão.");
    }
  };

  /** Exporta o currículo selecionado usando somente o seu conteúdo textual real. */
  const handleExport = async (resume: Resume, format: "pdf" | "docx") => {
    try {
      const text = await ensureResumeText(resume);
      if (format === "pdf") await exportResumePdf(text, resume.name);
      else await exportResumeDocx(text, resume.name);
    } catch (error) {
      fail(error, "Não foi possível exportar este currículo.");
    }
  };

  const handleSaveEdit = async (values: {
    title: string;
    position: string;
    company: string;
    content: string;
  }) => {
    if (!editing) return;
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        input: {
          title: values.title,
          position: values.position || null,
          company: values.company || null,
        },
      });
      if (values.content.trim() && values.content.trim() !== (editing.rawText ?? "").trim()) {
        await contentMutation.mutateAsync({ resume: editing, content: values.content });
      }
      toast.success("Currículo atualizado.");
      setEditing(null);
    } catch (error) {
      fail(error, "Falha ao salvar o currículo.");
    }
  };

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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface/50 px-6 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Carregando currículos...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-12 text-center text-sm text-destructive">
          Não foi possível carregar seus currículos. Tente novamente em instantes.
        </div>
      ) : isEmpty ? (
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
              onEdit={setEditing}
              onExportPdf={(r) => void handleExport(r, "pdf")}
              onExportDocx={(r) => void handleExport(r, "docx")}
              onToggleDefault={(r) => void handleToggleDefault(r)}
              onDelete={(r) => void handleDelete(r)}
            />
          )}
        </div>
      )}

      <ImportResumeDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onFileSelected={handleImport}
      />
      <ResumeViewDialog
        resume={viewing}
        open={viewing !== null}
        onOpenChange={(o) => !o && setViewing(null)}
        onEdit={(r) => {
          setViewing(null);
          setEditing(r);
        }}
      />
      <EditResumeDialog
        resume={editing}
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        onSave={handleSaveEdit}
      />
    </PageContainer>
  );
}
