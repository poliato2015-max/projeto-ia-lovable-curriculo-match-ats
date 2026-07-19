import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepDef {
  id: number;
  label: string;
}

interface StepperProps {
  steps: StepDef[];
  current: number;
  onStepClick?: (id: number) => void;
}

export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <ol className="flex w-full items-center gap-2 overflow-x-auto">
      {steps.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;
        const clickable = s.id < current && onStepClick;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2 min-w-0">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(s.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors min-w-0",
                clickable && "hover:bg-muted cursor-pointer",
                !clickable && "cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  active && "border-primary bg-primary text-primary-foreground",
                  done && "border-primary/60 bg-primary/10 text-primary",
                  !active && !done && "border-border bg-surface/60 text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : s.id}
              </span>
              <span
                className={cn(
                  "truncate text-sm font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1 transition-colors",
                  s.id < current ? "bg-primary/50" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
