import { useState } from "react";
import { FileText, Search, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useResumes } from "@/hooks/useResumes";
import type { Resume } from "@/components/resumes/types";

interface SavedResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (r: Resume) => void;
}

export function SavedResumeDialog({ open, onOpenChange, onSelect }: SavedResumeDialogProps) {
  const [query, setQuery] = useState("");
  const { data: resumes, isLoading } = useResumes(open);
  const q = query.toLowerCase();
  const list = (resumes ?? []).filter((r) =>
    (r.name + " " + r.role + " " + (r.company ?? "")).toLowerCase().includes(q),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Selecionar currículo salvo</DialogTitle>
          <DialogDescription>
            Escolha um currículo da sua biblioteca para utilizar nesta análise.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome do currículo, vaga ou cargo..."
            className="pl-9"
          />
        </div>

        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {list.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum currículo encontrado.
            </p>
          ) : (
            list.map((r) => {
              const isAts = r.kind === "ats";
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onSelect(r);
                    onOpenChange(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border border-border/70 bg-surface/40 px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      isAts ? "bg-secondary/15 text-secondary" : "bg-primary/10 text-primary",
                    )}
                  >
                    {isAts ? <Sparkles className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.role}
                      {isAts && r.area ? ` • ${r.area}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "shrink-0 border",
                      isAts
                        ? "border-secondary/30 bg-secondary/10 text-secondary"
                        : "border-primary/20 bg-primary/10 text-primary",
                    )}
                  >
                    {isAts ? "ATS Gerado" : "Importado"}
                  </Badge>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
