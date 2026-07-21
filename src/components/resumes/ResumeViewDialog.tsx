import { Copy, FileDown, Pencil, Sparkles, FileUp, Wand2 } from "lucide-react";
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
import type { Resume } from "./types";

interface ResumeViewDialogProps {
  resume: Resume | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (r: Resume) => void;
}

const PREVIEW_TEXT = `PERFIL PROFISSIONAL
Profissional com sólida experiência em desenvolvimento de sistemas escaláveis,
liderança técnica e colaboração multidisciplinar.

EXPERIÊNCIA
• Tech Lead — Empresa X (2022 — atual)
• Engenheiro Sênior — Empresa Y (2019 — 2022)

FORMAÇÃO
• Bacharelado em Ciência da Computação

HABILIDADES
TypeScript, React, Node.js, PostgreSQL, AWS, Arquitetura de Software.`;

export function ResumeViewDialog({
  resume,
  open,
  onOpenChange,
  onEdit,
}: ResumeViewDialogProps) {
  if (!resume) return null;
  const isAts = resume.kind === "ats";

  const mock = (label: string) => () => toast.success(`${label} (mock)`);

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
            {isAts && (
              <span className="text-sm text-muted-foreground">
                • Gerado para{" "}
                <span className="font-medium text-foreground">
                  {resume.company ?? "Cliente confidencial"}
                </span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-y border-border/60 py-3">
            <Button size="sm" variant="outline" onClick={mock("Conteúdo copiado")}>
              <Copy className="mr-2 h-4 w-4" /> Copiar
            </Button>
            <Button size="sm" variant="outline" onClick={mock("Exportação PDF iniciada")}>
              <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
            </Button>
            <Button size="sm" variant="outline" onClick={mock("Exportação DOCX iniciada")}>
              <FileDown className="mr-2 h-4 w-4" /> Exportar DOCX
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onEdit?.(resume);
                mock("Modo edição")();
              }}
            >
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
            {isAts && (
              <Button size="sm" onClick={mock("Nova versão ATS será gerada")}>
                <Wand2 className="mr-2 h-4 w-4" /> Gerar nova versão
              </Button>
            )}
          </div>

          <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-border/60 bg-muted/30 p-5">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              {PREVIEW_TEXT}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
