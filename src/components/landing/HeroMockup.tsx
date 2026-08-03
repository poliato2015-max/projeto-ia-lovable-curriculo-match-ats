import { motion } from "framer-motion";
import { CheckCircle2, FileCheck2, Lightbulb, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ring = { score: 91 };

export function HeroMockup() {
  const size = 132;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (ring.score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      className="relative"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-10 h-56 w-56 rounded-full bg-secondary/20 blur-3xl"
      />

      <Card className="relative overflow-hidden border-border/70 shadow-xl">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                Product Manager Sênior
              </p>
              <p className="truncate text-xs text-muted-foreground">Nubank · Análise ATS</p>
            </div>
            <Badge className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">
              <Sparkles className="mr-1 h-3 w-3" />
              Match ATS
            </Badge>
          </div>

          <div className="grid gap-4 rounded-xl border border-border/60 bg-surface/40 p-4 sm:grid-cols-[auto_minmax(0,1fr)]">
            <div className="mx-auto">
              <svg width={size} height={size} className="-rotate-90">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={stroke}
                  className="stroke-muted"
                  fill="none"
                />
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  className="stroke-primary"
                  fill="none"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              </svg>
              <div className="-mt-[86px] mb-[42px] text-center">
                <p className="text-3xl font-bold tracking-tight text-foreground">91%</p>
                <p className="text-[11px] text-muted-foreground">Compatibilidade</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-foreground">Palavras-chave</span>
                  <span className="text-muted-foreground">28 / 34</span>
                </div>
                <Progress value={82} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-foreground">Experiência</span>
                  <span className="text-muted-foreground">92%</span>
                </div>
                <Progress value={92} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-foreground">Formação</span>
                  <span className="text-muted-foreground">Compatível</span>
                </div>
                <Progress value={100} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                <Lightbulb className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-semibold text-foreground">Recomendações</p>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {[
                "Destacar experiência com Docker.",
                "Adicionar resultados mensuráveis nas conquistas.",
                "Evidenciar liderança técnica em projetos anteriores.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
              <FileCheck2 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Currículo ATS gerado</p>
              <p className="truncate text-xs text-muted-foreground">
                Versão otimizada pronta para exportação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
