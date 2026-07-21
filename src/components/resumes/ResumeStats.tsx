import { FileText, FileUp, Sparkles, Star } from "lucide-react";
import type { Resume } from "./types";

interface ResumeStatsProps {
  resumes: Resume[];
}

export function ResumeStats({ resumes }: ResumeStatsProps) {
  const total = resumes.length;
  const importados = resumes.filter((r) => r.kind === "original").length;
  const ats = resumes.filter((r) => r.kind === "ats").length;
  const favoritos = resumes.filter((r) => r.favorite).length;

  const items = [
    { icon: FileText, label: "Total de Currículos", value: total },
    { icon: FileUp, label: "Importados", value: importados },
    { icon: Sparkles, label: "ATS Gerados", value: ats },
    { icon: Star, label: "Favoritos", value: favoritos },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <item.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-lg font-semibold text-foreground">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
