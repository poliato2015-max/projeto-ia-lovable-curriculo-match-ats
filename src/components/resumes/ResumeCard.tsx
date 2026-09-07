import { motion } from "framer-motion";
import {
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  FileDown,
  Sparkles,
  FileUp,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Resume } from "./types";
import type { AtsResumeMeta } from "@/services/resumes.service";

interface ResumeCardProps {
  resume: Resume;
  onView?: (r: Resume) => void;
  onEdit?: (r: Resume) => void;
  onExportPdf?: (r: Resume) => void;
  onExportDocx?: (r: Resume) => void;
  onDelete?: (r: Resume) => void;
  onToggleDefault?: (r: Resume) => void;
  /** Versão e análise de origem reais, apenas para currículos ATS. */
  meta?: AtsResumeMeta;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function ResumeCard({
  resume,
  onView,
  onEdit,
  onExportPdf,
  onExportDocx,
  onDelete,
  onToggleDefault,
  meta,
}: ResumeCardProps) {
  const isAts = resume.kind === "ats";
  const isDefault = !isAts && Boolean(resume.favorite);
  const originLabel = isAts
    ? [meta?.jobTitle, meta?.company].filter(Boolean).join(" • ")
    : "";
  const KindIcon = isAts ? Sparkles : FileUp;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <Card
        onClick={() => onView?.(resume)}
        className={cn(
          "group h-full cursor-pointer border-border/70 shadow-sm transition-all hover:border-primary/40 hover:shadow-md",
          isDefault && "border-primary/50 ring-1 ring-primary/30",
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                isAts
                  ? "bg-secondary/15 text-secondary"
                  : "bg-primary/10 text-primary",
              )}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {resume.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {resume.role}
              </p>
            </div>
          </div>
          <div onClick={stop}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label="Ações do currículo"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onView?.(resume)}>
                  <Eye className="mr-2 h-4 w-4" /> Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(resume)}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                {!isAts && (
                  <DropdownMenuItem onClick={() => onToggleDefault?.(resume)}>
                    <Star className="mr-2 h-4 w-4" />
                    {resume.favorite ? "Remover padrão" : "Definir como padrão"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onExportPdf?.(resume)}>
                  <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportDocx?.(resume)}>
                  <FileDown className="mr-2 h-4 w-4" /> Exportar DOCX
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(resume)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
          {isDefault && (
            <Badge
              variant="secondary"
              className="gap-1 border border-primary/30 bg-primary/10 text-primary"
            >
              <Star className="h-3 w-3 fill-current" />
              Currículo padrão
            </Badge>
          )}
          <Badge
            variant="secondary"
            className={cn(
              "gap-1 border",
              isAts
                ? "border-secondary/30 bg-secondary/10 text-secondary"
                : "border-primary/20 bg-primary/10 text-primary",
            )}
          >
            <KindIcon className="h-3 w-3" />
            {isAts ? "ATS Gerado" : "Importado"}
          </Badge>
          {isAts && meta?.version ? (
            <Badge variant="outline" className="border-border/70 text-muted-foreground">
              Versão {meta.version}
            </Badge>
          ) : null}
          </div>

          {isAts && (
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Gerado para
              </p>
              <p className="truncate text-sm font-medium text-foreground">
                {resume.company ?? "Cliente confidencial"}
              </p>
              {originLabel ? (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  Análise: {originLabel}
                </p>
              ) : null}
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
          Atualizado em {formatDate(resume.updatedAt)}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
