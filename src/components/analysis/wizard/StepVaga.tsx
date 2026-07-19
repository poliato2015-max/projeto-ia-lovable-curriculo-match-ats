import { Link2, FileText, UploadCloud, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadPlaceholder } from "@/components/resumes/UploadPlaceholder";
import { toast } from "sonner";
import type { JobData, JobSource } from "./types";

interface StepVagaProps {
  data: JobData;
  onChange: (data: JobData) => void;
  onNext: () => void;
}

export function StepVaga({ data, onChange, onNext }: StepVagaProps) {
  const canContinue =
    (data.source === "url" && data.url.trim().length > 0) ||
    (data.source === "description" && data.description.trim().length > 0) ||
    (data.source === "upload" && !!data.fileName);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Informe a vaga</h2>
        <p className="text-sm text-muted-foreground">
          Escolha uma das formas abaixo para nos contar sobre a oportunidade.
        </p>
      </div>

      <Tabs
        value={data.source}
        onValueChange={(v) => onChange({ ...data, source: v as JobSource })}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="url" className="gap-2">
            <Link2 className="h-3.5 w-3.5" /> URL
          </TabsTrigger>
          <TabsTrigger value="description" className="gap-2">
            <FileText className="h-3.5 w-3.5" /> Descrição
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <UploadCloud className="h-3.5 w-3.5" /> Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-4 space-y-2">
          <Label htmlFor="job-url">URL da vaga</Label>
          <Input
            id="job-url"
            type="url"
            placeholder="https://linkedin.com/jobs/..."
            value={data.url}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            LinkedIn, Gupy, Kenoby, Vagas.com — qualquer plataforma pública.
          </p>
        </TabsContent>

        <TabsContent value="description" className="mt-4 space-y-2">
          <Label htmlFor="job-desc">Descrição da vaga</Label>
          <Textarea
            id="job-desc"
            placeholder="Cole aqui a descrição completa da vaga..."
            className="min-h-[240px] resize-y"
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <UploadPlaceholder
            accepted={["PDF", "DOCX", "TXT"]}
            onSelect={() => {
              const mockName = "vaga-descricao.pdf";
              onChange({ ...data, fileName: mockName });
              toast("Arquivo anexado (mock)", { description: mockName });
            }}
          />
          {data.fileName && (
            <p className="mt-3 text-xs text-muted-foreground">
              Selecionado: <span className="font-medium text-foreground">{data.fileName}</span>
            </p>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button size="lg" className="gap-2" disabled={!canContinue} onClick={onNext}>
          Continuar <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
