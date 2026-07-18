import { useState } from "react";
import { Sparkles, Link2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ContentCard } from "@/components/common/ContentCard";

interface JobInputCardProps {
  onAnalyze: (payload: { url: string; description: string }) => void;
  isAnalyzing: boolean;
}

export function JobInputCard({ onAnalyze, isAnalyzing }: JobInputCardProps) {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = (url.trim().length > 0 || description.trim().length > 0) && !isAnalyzing;

  return (
    <ContentCard
      title="Informações da Vaga"
      description="Cole o link da vaga ou a descrição completa para iniciar a análise."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="job-url" className="flex items-center gap-2 text-sm">
            <Link2 className="h-3.5 w-3.5 text-primary" /> URL da vaga
          </Label>
          <Input
            id="job-url"
            type="url"
            placeholder="https://linkedin.com/jobs/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isAnalyzing}
          />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            OU
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-desc" className="flex items-center gap-2 text-sm">
            <FileText className="h-3.5 w-3.5 text-primary" /> Descrição da vaga
          </Label>
          <Textarea
            id="job-desc"
            placeholder="Cole aqui a descrição completa da vaga..."
            className="min-h-[220px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isAnalyzing}
          />
        </div>

        <Button
          className="w-full gap-2"
          size="lg"
          disabled={!canSubmit}
          onClick={() => onAnalyze({ url, description })}
        >
          <Sparkles className="h-4 w-4" />
          {isAnalyzing ? "Analisando..." : "Analisar Compatibilidade"}
        </Button>
      </div>
    </ContentCard>
  );
}
