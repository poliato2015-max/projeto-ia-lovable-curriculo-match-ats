import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResumeFilter } from "./types";

const FILTERS: { key: ResumeFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "original", label: "Originais" },
  { key: "ats", label: "ATS" },
  { key: "pt", label: "Português" },
  { key: "en", label: "Inglês" },
  { key: "recent", label: "Mais recentes" },
];

interface ResumeFiltersProps {
  active: ResumeFilter;
  onChange: (filter: ResumeFilter) => void;
}

export function ResumeFilters({ active, onChange }: ResumeFiltersProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtros de currículos"
      className="flex flex-wrap gap-2"
    >
      {FILTERS.map((f) => {
        const isActive = active === f.key;
        return (
          <Button
            key={f.key}
            role="tab"
            aria-selected={isActive}
            size="sm"
            variant={isActive ? "default" : "outline"}
            onClick={() => onChange(f.key)}
            className={cn(
              "h-8 rounded-full px-3 text-xs font-medium transition-all",
              isActive && "shadow-sm",
            )}
          >
            {f.label}
          </Button>
        );
      })}
    </div>
  );
}
