import { useState } from "react";
import { UploadCloud, ClipboardPaste, FolderOpen, ArrowRight, ArrowLeft, FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadPlaceholder } from "@/components/resumes/UploadPlaceholder";
import { SavedResumeDialog } from "./SavedResumeDialog";
import type { ResumeData, ResumeSource } from "./types";

interface StepCurriculoProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepCurriculo({ data, onChange, onNext, onBack }: StepCurriculoProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const canContinue =
    (data.source === "upload" && !!data.fileName) ||
    (data.source === "paste" && data.content.trim().length > 0) ||
    (data.source === "saved" && !!data.savedResume);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Selecione o currículo</h2>
        <p className="text-sm text-muted-foreground">
          Use um arquivo, cole o conteúdo ou escolha um currículo salvo.
        </p>
      </div>

      <Tabs
        value={data.source}
        onValueChange={(v) => onChange({ ...data, source: v as ResumeSource })}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="gap-2">
            <UploadCloud className="h-3.5 w-3.5" /> Importar
          </TabsTrigger>
          <TabsTrigger value="paste" className="gap-2">
            <ClipboardPaste className="h-3.5 w-3.5" /> Colar
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <FolderOpen className="h-3.5 w-3.5" /> Salvos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <UploadPlaceholder
            onSelect={() => {
              const mockName = "curriculo.pdf";
              onChange({ ...data, fileName: mockName });
              toast("Currículo anexado (mock)", { description: mockName });
            }}
          />
          {data.fileName && (
            <p className="mt-3 text-xs text-muted-foreground">
              Selecionado: <span className="font-medium text-foreground">{data.fileName}</span>
            </p>
          )}
        </TabsContent>

        <TabsContent value="paste" className="mt-4 space-y-2">
          <Label htmlFor="resume-paste">Conteúdo do currículo</Label>
          <Textarea
            id="resume-paste"
            placeholder="Cole aqui o conteúdo completo do seu currículo."
            className="min-h-[260px] resize-y"
            value={data.content}
            onChange={(e) => onChange({ ...data, content: e.target.value })}
          />
        </TabsContent>

        <TabsContent value="saved" className="mt-4">
          {data.savedResume ? (
            <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {data.savedResume.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {data.savedResume.role}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDialogOpen(true)}>
                Trocar
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface/50 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FolderOpen className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Escolher currículo da biblioteca
              </p>
              <p className="text-xs text-muted-foreground">
                Selecione entre seus currículos salvos.
              </p>
            </button>
          )}

          <SavedResumeDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSelect={(r) => onChange({ ...data, savedResume: r })}
          />
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="lg" className="gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button size="lg" className="gap-2" disabled={!canContinue} onClick={onNext}>
          Continuar <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
