import { motion } from "framer-motion";
import { FileUp, Sparkles, Search, FileCheck2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyResumeLibraryProps {
  onImport: () => void;
}

const STEPS = [
  { icon: Upload, label: "Importe seu currículo" },
  { icon: Sparkles, label: "A IA extrai as informações" },
  { icon: Search, label: "Compare com uma vaga" },
  { icon: FileCheck2, label: "Gere um currículo ATS" },
];

export function EmptyResumeLibrary({ onImport }: EmptyResumeLibraryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto flex max-w-2xl flex-col items-center text-center"
    >
      <div className="relative mb-6">
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl"
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
          <FileUp className="h-7 w-7" />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Importe seu primeiro currículo
      </h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground md:text-base">
        O RadarCV utiliza Inteligência Artificial para analisar seu currículo
        e gerar versões otimizadas para cada vaga.
      </p>

      <Button size="lg" className="mt-6" onClick={onImport}>
        <Upload className="mr-2 h-4 w-4" />
        Importar Currículo
      </Button>

      <Card className="mt-10 w-full border-border/70 shadow-sm">
        <CardContent className="p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Como funciona
          </p>
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.label} className="flex items-start gap-3 text-left">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Passo {i + 1}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {step.label}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </motion.div>
  );
}
