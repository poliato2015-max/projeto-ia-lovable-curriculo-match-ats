import { ArrowLeft, Sparkles, Target } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OBJECTIVE_OPTIONS, type ObjectiveData } from "./types";

interface StepObjetivoProps {
  data: ObjectiveData;
  onChange: (data: ObjectiveData) => void;
  onAnalyze: () => void;
  onBack: () => void;
}

export function StepObjetivo({ data, onChange, onAnalyze, onBack }: StepObjetivoProps) {
  const toggle = (id: string) => {
    onChange({
      ...data,
      goals: data.goals.includes(id)
        ? data.goals.filter((g) => g !== id)
        : [...data.goals, id],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Qual seu objetivo?</h2>
        <p className="text-sm text-muted-foreground">
          Selecione uma ou mais opções para guiar a análise da IA.
        </p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {OBJECTIVE_OPTIONS.map((opt) => {
          const active = data.goals.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                active
                  ? "border-primary/60 bg-primary/5"
                  : "border-border/70 bg-surface/40 hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <Checkbox checked={active} onCheckedChange={() => toggle(opt.id)} />
              <div className="flex items-center gap-2">
                <Target
                  className={cn(
                    "h-4 w-4",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span className="font-medium text-foreground">{opt.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instruções adicionais (opcional)</Label>
        <Textarea
          id="instructions"
          placeholder="Ex.: destacar experiência com fintechs e liderança de times remotos."
          className="min-h-[100px] resize-y"
          value={data.instructions}
          onChange={(e) => onChange({ ...data, instructions: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="lg" className="gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button size="lg" className="gap-2" onClick={onAnalyze}>
          <Sparkles className="h-4 w-4" /> Analisar Compatibilidade
        </Button>
      </div>
    </div>
  );
}
