import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadPlaceholder } from "./UploadPlaceholder";

interface ImportResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelected?: (file: File) => Promise<void> | void;
}

const MAX_SIZE = 10 * 1024 * 1024;

/** Modal de importação de currículos: envia o arquivo para o Storage e persiste os metadados. */
export function ImportResumeDialog({
  open,
  onOpenChange,
  onFileSelected,
}: ImportResumeDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > MAX_SIZE) {
      setError("O arquivo excede o limite de 10 MB.");
      return;
    }
    setBusy(true);
    try {
      await onFileSelected?.(file);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Currículo</DialogTitle>
          <DialogDescription>
            Envie um arquivo para que a IA extraia suas informações
            profissionais.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        {busy ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface/50 px-6 py-10 text-center">
            <Loader2 className="mb-3 h-6 w-6 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Enviando currículo...</p>
          </div>
        ) : (
          <UploadPlaceholder onSelect={() => inputRef.current?.click()} />
        )}

        {error && (
          <p className="text-center text-xs text-destructive">{error}</p>
        )}
        <p className="text-center text-xs text-muted-foreground">
          Formatos suportados: PDF ou DOCX • até 10 MB
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Seus dados são processados com segurança e nunca compartilhados.
        </p>
      </DialogContent>
    </Dialog>
  );
}
