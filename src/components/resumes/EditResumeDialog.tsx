import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Resume } from "./types";

interface EditResumeDialogProps {
  resume: Resume | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: { title: string; position: string; company: string }) => Promise<void> | void;
}

export function EditResumeDialog({
  resume,
  open,
  onOpenChange,
  onSave,
}: EditResumeDialogProps) {
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (resume) {
      setTitle(resume.name);
      setPosition(resume.role === "—" ? "" : resume.role);
      setCompany(resume.company ?? "");
    }
  }, [resume]);

  if (!resume) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave({ title, position, company });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar currículo</DialogTitle>
          <DialogDescription>Atualize as informações deste currículo.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="resume-title">Nome</Label>
            <Input
              id="resume-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume-position">Cargo</Label>
            <Input
              id="resume-position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume-company">Empresa</Label>
            <Input
              id="resume-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
