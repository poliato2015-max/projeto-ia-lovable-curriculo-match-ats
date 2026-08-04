import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Radar } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Redefinir senha — RadarCV AI" },
      {
        name: "description",
        content: "Defina uma nova senha para sua conta RadarCV AI.",
      },
      { property: "og:title", content: "Redefinir senha — RadarCV AI" },
      {
        property: "og:description",
        content: "Defina uma nova senha para sua conta RadarCV AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      toast.success("Senha atualizada com sucesso.");
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Algo deu errado.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
          <Radar className="h-5 w-5" />
        </span>
        <span className="text-base font-bold tracking-tight text-foreground">RadarCV AI</span>
      </div>

      <Card className="w-full max-w-md border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Definir nova senha</CardTitle>
          <CardDescription>Escolha uma nova senha para acessar sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar senha</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repita a nova senha"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar nova senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
