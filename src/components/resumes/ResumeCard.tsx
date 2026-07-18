import { motion } from "framer-motion";
import {
  FileText,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  ExternalLink,
  Sparkles,
  FileCheck2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Resume } from "./types";

interface ResumeCardProps {
  resume: Resume;
  onOpen?: (r: Resume) => void;
  onEdit?: (r: Resume) => void;
  onDuplicate?: (r: Resume) => void;
  onDelete?: (r: Resume) => void;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

const LANGUAGE_LABEL: Record<Resume["language"], string> = {
  pt: "Português",
  en: "Inglês",
};

export function ResumeCard({
  resume,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}: ResumeCardProps) {
  const isAts = resume.kind === "ats";
  const KindIcon = isAts ? FileCheck2 : Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <Card className="group h-full border-border/70 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
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
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onOpen?.(resume)}>
                <ExternalLink className="mr-2 h-4 w-4" /> Abrir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(resume)}>
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(resume)}>
                <Copy className="mr-2 h-4 w-4" /> Duplicar
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
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
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
              {isAts ? "ATS" : "Original"}
            </Badge>
            <Badge variant="outline" className="font-normal">
              {resume.area}
            </Badge>
            <Badge variant="outline" className="font-normal">
              {LANGUAGE_LABEL[resume.language]}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-muted-foreground">Análises</p>
              <p className="font-semibold text-foreground">{resume.analyses}</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-muted-foreground">Versões ATS</p>
              <p className="font-semibold text-foreground">
                {resume.atsVersions}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>Atualizado em {formatDate(resume.updatedAt)}</span>
          <span className="uppercase tracking-wide">
            .{resume.fileType}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
