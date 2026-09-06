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
import { Textarea } from "@/components/ui/textarea";
import { ensureResumeText } from "@/services/resumes.service";
import type { Resume } from "./types";

interface EditResumeDialogProps {
  resume: Resume | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: {
    title: string;
    position: string;
    company: string;
    content: string;
  }) => Promise<void> | void;
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
  const [content, setContent] = useState("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (!resume) return;

    setTitle(resume.name);
    setPosition(resume.role === "—" ? "" : resume.role);
    setCompany(resume.company ?? "");

    if (resume.rawText?.trim()) {
      setContent(resume.rawText);
      return;
    }

    setContent("");
    setLoadingContent(true);
    ensureResumeText(resume)
      .then((text) => {
        if (active) setContent(text);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoadingContent(false);
      });

    return () => {
      active = false;
    };
  }, [resume]);

  if (!resume) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave({ title, position, company, content });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
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
          <div className="space-y-2">
            <Label htmlFor="resume-content">Conteúdo do currículo</Label>
            <Textarea
              id="resume-content"
              className="min-h-[240px] resize-y font-mono text-xs"
              placeholder={loadingContent ? "Carregando conteúdo..." : "Conteúdo do currículo"}
              disabled={loadingContent}
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
