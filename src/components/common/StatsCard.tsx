import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  className?: string;
  index?: number;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  className,
  index = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-md",
          className,
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:bg-primary/10"
        />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
            {delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                  delta.positive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                {delta.positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {delta.value}
              </span>
            )}
          </div>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
