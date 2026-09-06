import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Copy,
  FileDown,
  FileText,
  Loader2,
  Pencil,
  Sparkles,
  FileUp,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ensureResumeText, loadAtsOrigin } from "@/services/resumes.service";
import { useResumeMutations } from "@/hooks/useResumes";
import { generateAtsResume } from "@/lib/ats-resume.functions";
import {
  copyResumeContent,
  exportResumeDocx,
  exportResumePdf,
} from "@/lib/resume-export";
import type { Resume } from "./types";

interface ResumeViewDialogProps {
  resume: Resume | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (r: Resume) => void;
}

export function ResumeViewDialog({
  resume,
  open,
  onOpenChange,
  onEdit,
}: ResumeViewDialogProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [generating, setGenerating] = useState(false);

  const generate = useServerFn(generateAtsResume);
  const { saveAtsMutation } = useResumeMutations();

  useEffect(() => {
    let active = true;
    if (!resume || !open) return;

    setContent("");
    setError(null);
    setLoading(true);
    ensureResumeText(resume)
      .then((text) => {
        if (active) setContent(text);
      })
      .catch((err: unknown) => {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar o conteúdo deste currículo.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [resume, open]);

  if (!resume) return null;
  const isAts = resume.kind === "ats";

  const handleCopy = async () => {
    try {
      await copyResumeContent(content);
      toast.success("Currículo copiado");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível copiar o currículo.",
      );
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    setExporting(format);
    try {
      if (format === "pdf") await exportResumePdf(content, resume.name);
      else await exportResumeDocx(content, resume.name);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível exportar o currículo.",
      );
    } finally {
      setExporting(null);
    }
  };

  /** Gera a próxima versão ATS reutilizando análise e currículo original existentes. */
  const handleNewVersion = async () => {
    setGenerating(true);
    try {
      const origin = await loadAtsOrigin(resume);
      const output = await generate({
        data: {
          jobTitle: origin.jobTitle,
          company: origin.company,
          jobDescription: origin.jobDescription,
          resumeText: origin.originalText,
          resumeId: origin.originalResumeId,
          keywordsFound: origin.keywordsFound,
          keywordsMissing: origin.keywordsMissing,
          objectives: [],
          instructions: "",
        },
      });

      const { version } = await saveAtsMutation.mutateAsync({
        content: output.content,
        jobTitle: origin.jobTitle,
        company: origin.company,
        sourceResumeId: origin.originalResumeId,
        analysisId: origin.analysisId,
      });

      toast.success(`Nova versão gerada (v${version})`, {
        description: "A versão anterior continua disponível na sua Biblioteca.",
      });
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Não foi possível gerar uma nova versão deste currículo.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const busy = loading || !content;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {resume.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "gap-1 border",
                isAts
                  ? "border-secondary/30 bg-secondary/10 text-secondary"
                  : "border-primary/20 bg-primary/10 text-primary",
              )}
            >
              {isAts ? (
                <Sparkles className="h-3 w-3" />
              ) : (
                <FileUp className="h-3 w-3" />
              )}
              {isAts ? "ATS Gerado" : "Importado"}
            </Badge>
            <span className="text-sm text-muted-foreground">{resume.role}</span>
            {isAts && resume.company && (
              <span className="text-sm text-muted-foreground">
                • Gerado para{" "}
                <span className="font-medium text-foreground">{resume.company}</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-y border-border/60 py-3">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void handleCopy()}>
              <Copy className="mr-2 h-4 w-4" /> Copiar
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy || exporting !== null}
              onClick={() => void handleExport("pdf")}
            >
              {exporting === "pdf" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              Exportar PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy || exporting !== null}
              onClick={() => void handleExport("docx")}
            >
              {exporting === "docx" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Exportar DOCX
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit?.({ ...resume, rawText: content || resume.rawText })}
            >
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
            {isAts && (
              <Button
                size="sm"
                disabled={busy || generating}
                onClick={() => void handleNewVersion()}
              >
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Gerar nova versão
              </Button>
            )}
          </div>

          <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-border/60 bg-muted/30 p-5">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando conteúdo...
              </div>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {content}
              </pre>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
