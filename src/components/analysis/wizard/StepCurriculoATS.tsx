import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Copy,
  FileText,
  FileDown,
  Pencil,
  Check,
  Save,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ContentCard } from "@/components/common/ContentCard";
import { useResumeMutations } from "@/hooks/useResumes";
import { generateAtsResume } from "@/lib/ats-resume.functions";
import { evaluateAtsChecklist } from "@/lib/ats-checklist.functions";
import {
  CHECKLIST_LABELS,
  diffChecklist,
  evaluateStructuralChecklist,
  type ChecklistItem,
} from "@/lib/ats-checklist";
import type { AnalysisResult } from "../analysis-types";

interface StepCurriculoATSProps {
  result: AnalysisResult;
  jobTitle: string;
  company: string;
  jobDescription?: string;
  /** Conteúdo do currículo original — única fonte de verdade para a otimização. */
  resumeText: string;
  resumeId: string | null;
  analysisId: string | null;
  objectives?: string[];
  instructions?: string;
  onBack: () => void;
}


function download(content: string, fileName: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function StepCurriculoATS({
  result,
  jobTitle,
  company,
  jobDescription = "",
  resumeText,
  resumeId,
  analysisId,
  objectives = [],
  instructions = "",
  onBack,
}: StepCurriculoATSProps) {
  const [content, setContent] = useState("");
  const [keywordsUsed, setKeywordsUsed] = useState<string[]>([]);
  const [omitted, setOmitted] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [savedVersion, setSavedVersion] = useState<number | null>(null);

  const generate = useServerFn(generateAtsResume);
  const { saveAtsMutation } = useResumeMutations();

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const output = await generate({
        data: {
          jobTitle,
          company,
          jobDescription,
          resumeText,
          resumeId,
          keywordsFound: result.keywordsFound ?? [],
          keywordsMissing: result.keywordsMissing ?? [],
          objectives,
          instructions,
        },
      });
      setContent(output.content);
      setKeywordsUsed(output.keywordsUsed);
      setOmitted(output.omittedKeywords);
      setNotes(output.notes);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        message.includes("AI_RATE_LIMIT")
          ? "Muitas gerações em sequência. Aguarde alguns instantes e tente novamente."
          : message.includes("AI_CREDITS")
            ? "Os créditos de IA acabaram. Recarregue para continuar."
            : message.includes("currículo")
              ? message
              : "Não foi possível gerar o currículo ATS. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Currículo copiado", {
        description: "Conteúdo enviado para a área de transferência.",
      });
    } catch {
      toast.error("Não foi possível copiar", {
        description: "Verifique as permissões do navegador.",
      });
    }
  };

  const baseFileName = `curriculo-ats-${(jobTitle || "vaga")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

  const handleSave = () => {
    saveAtsMutation.mutate(
      { content, jobTitle, company, sourceResumeId: resumeId, analysisId },
      {
        onSuccess: ({ version }) => {
          setSavedVersion(version);
          toast.success(`Currículo ATS salvo (v${version})`, {
            description: "Disponível na sua Biblioteca de Currículos.",
          });
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Não foi possível salvar o currículo ATS.",
          ),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Voltar para análise
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Currículo ATS</h2>
            <p className="text-sm text-muted-foreground">
              Para a vaga: <span className="font-medium text-foreground">{jobTitle || "—"}</span>
              {" • "}Empresa: <span className="font-medium text-foreground">{company || "—"}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge className="border border-primary/20 bg-primary/10 text-primary" variant="secondary">
              Match ATS {result.score}%
            </Badge>
            <Badge variant="secondary" className="border border-border/70 bg-surface/60 text-foreground">
              {wordCount} palavras
            </Badge>
            {savedVersion !== null && (
              <Badge variant="secondary" className="border border-secondary/30 bg-secondary/10 text-secondary">
                Salvo • v{savedVersion}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!content}
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" /> Copiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!content}
            onClick={() => window.print()}
          >
            <FileDown className="h-4 w-4" /> PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!content}
            onClick={() =>
              download(content, `${baseFileName}.doc`, "application/msword")
            }
          >
            <FileText className="h-4 w-4" /> DOCX
          </Button>
          <Button
            variant={editing ? "default" : "outline"}
            size="sm"
            className="gap-2"
            disabled={!content}
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            {editing ? "Concluir edição" : "Editar"}
          </Button>
          <Button
            size="sm"
            className="gap-2"
            disabled={!content || saveAtsMutation.isPending}
            onClick={handleSave}
          >
            {saveAtsMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {savedVersion !== null ? "Salvar nova versão" : "Salvar na biblioteca"}
          </Button>
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Documento */}
        <div className="rounded-xl border border-border/70 bg-surface/40 shadow-sm">
          {loading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">
                Otimizando seu currículo para esta vaga...
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                A IA reorganiza e reescreve apenas o que já existe no seu currículo — nada é
                inventado.
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center">
              <AlertTriangle className="h-7 w-7 text-destructive" />
              <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => void run()}>
                <RefreshCw className="h-4 w-4" /> Tentar novamente
              </Button>
            </div>
          ) : editing ? (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[720px] resize-y rounded-xl border-0 bg-transparent p-8 font-mono text-sm leading-relaxed focus-visible:ring-0"
            />
          ) : (
            <pre className="whitespace-pre-wrap p-8 font-sans text-sm leading-relaxed text-foreground">
              {content}
            </pre>
          )}
        </div>

        {/* Painel lateral */}
        <aside className="space-y-4">
          <ContentCard
            title="Checklist ATS"
            description="Requisitos essenciais atendidos."
            action={
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </span>
            }
          >
            <ul className="space-y-2">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </ContentCard>

          <ContentCard
            title="Palavras-chave aplicadas"
            description="Termos reais do seu currículo destacados."
          >
            {keywordsUsed.length ? (
              <div className="flex flex-wrap gap-1.5">
                {keywordsUsed.map((k) => (
                  <Badge
                    key={k}
                    variant="secondary"
                    className="border border-primary/20 bg-primary/10 text-primary"
                  >
                    {k}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma palavra-chave destacada nesta versão.
              </p>
            )}
          </ContentCard>

          {omitted.length > 0 && (
            <ContentCard
              title="Não incluídas"
              description="Exigências da vaga ausentes no seu currículo — não foram inventadas."
            >
              <div className="flex flex-wrap gap-1.5">
                {omitted.map((k) => (
                  <Badge
                    key={k}
                    variant="secondary"
                    className="border border-border/70 bg-surface/60 text-muted-foreground"
                  >
                    {k}
                  </Badge>
                ))}
              </div>
            </ContentCard>
          )}

          <ContentCard
            title="Observações da IA"
            action={
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
            }
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              {notes ||
                "As otimizações usam exclusivamente o conteúdo do seu currículo original."}
            </p>
          </ContentCard>
        </aside>
      </div>
    </div>
  );
}
