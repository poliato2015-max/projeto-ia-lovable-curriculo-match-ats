import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ACCEPTED_FILE_LABELS } from "@/lib/file-text";

interface UploadPlaceholderProps {
  onSelect?: () => void;
  /** Recebe o arquivo solto na área (drag & drop). */
  onDropFile?: (file: File) => void;
  className?: string;
  accepted?: string[];
}

export function UploadPlaceholder({
  onSelect,
  onDropFile,
  className,
  accepted = ACCEPTED_FILE_LABELS,
}: UploadPlaceholderProps) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        depth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        depth.current -= 1;
        if (depth.current <= 0) {
          depth.current = 0;
          setDragging(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        depth.current = 0;
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onDropFile?.(file);
      }}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface/50 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        dragging && "border-primary bg-primary/10",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
        <UploadCloud className="h-7 w-7" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {dragging ? "Solte o arquivo aqui" : "Arraste um arquivo ou clique para selecionar"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Formatos aceitos: {accepted.join(", ")}
      </p>
      <Button
        type="button"
        size="sm"
        className="mt-4"
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
      >
        Selecionar Arquivo
      </Button>
    </div>
  );
}
