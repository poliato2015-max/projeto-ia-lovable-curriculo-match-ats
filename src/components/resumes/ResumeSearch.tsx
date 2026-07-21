import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ResumeSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ResumeSearch({ value, onChange, placeholder }: ResumeSearchProps) {
  return (
    <div className="relative w-full md:w-80">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Pesquisar currículo por nome, cargo ou empresa..."}
        className="pl-9"
        aria-label="Pesquisar currículos"
      />
    </div>
  );
}
