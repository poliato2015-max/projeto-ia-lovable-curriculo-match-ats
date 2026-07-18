import { FileText, FileCheck2, Sparkles, Languages } from "lucide-react";
import type { Resume } from "./types";

interface ResumeStatsProps {
  resumes: Resume[];
}

export function ResumeStats({ resumes }: ResumeStatsProps) {
  const total = resumes.length;
  const originals = resumes.filter((r) => r.kind === "original").length;
  const ats = resumes.filter((r) => r.kind === "ats").length;
  const languages = new Set(resumes.map((r) => r.language)).size;

  const items = [
    { icon: FileText, label: "Total", value: total },
    { icon: Sparkles, label: "Originais", value: originals },
    { icon: FileCheck2, label: "Versões ATS", value: ats },
    { icon: Languages, label: "Idiomas", value: languages },
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
