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
  onFileSelected?: (file: File) => void;
}

/**
 * Modal reutilizável para importação de currículos.
 * Estruturado para receber, nas próximas sprints:
 *  - Upload real
 *  - Drag & Drop funcional
 *  - Barra de progresso
 *  - Validação de arquivos
 *  - Extração automática via IA
 */
export function ImportResumeDialog({
  open,
  onOpenChange,
  onFileSelected: _onFileSelected,
}: ImportResumeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Currículo</DialogTitle>
          <DialogDescription>
            Envie um arquivo para que a IA extraia suas informações
            profissionais.
          </DialogDescription>
        </DialogHeader>
        <UploadPlaceholder />
        <p className="text-center text-xs text-muted-foreground">
          Seus dados são processados com segurança e nunca compartilhados.
        </p>
      </DialogContent>
    </Dialog>
  );
}
