import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Radar, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar — RadarCV AI" },
      {
        name: "description",
        content:
          "Acesse sua conta RadarCV AI para analisar vagas e gerenciar sua biblioteca de currículos.",
      },
      { property: "og:title", content: "Entrar — RadarCV AI" },
      {
        property: "og:description",
        content: "Acesse sua conta RadarCV AI e continue otimizando seus currículos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined): string {
  if (!value) return "/dashboard";
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return "/dashboard";
    return url.pathname + url.search;
  } catch {
    return "/dashboard";
  }
}

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { session, signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "recover">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) {
      navigate({ to: safePath(search.redirect), replace: true });
    }
  }, [session, search.redirect, navigate]);

  const handle = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Algo deu errado.");
    } finally {
      setBusy(false);
    }
  };

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    void handle(async () => {
      await signIn(email, password);
      toast.success("Bem-vindo de volta!");
    });
  };

  const onSignup = (e: React.FormEvent) => {
    e.preventDefault();
    void handle(async () => {
      const { needsConfirmation } = await signUp(email, password);
      toast.success(
        needsConfirmation
          ? "Conta criada! Confirme seu e-mail para entrar."
          : "Conta criada com sucesso!",
      );
    });
  };

  const onRecover = (e: React.FormEvent) => {
    e.preventDefault();
    void handle(async () => {
      await resetPassword(email);
      toast.success("Enviamos um link de recuperação para seu e-mail.");
      setMode("login");
    });
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <Link to="/" className="mb-6 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
          <Radar className="h-5 w-5" />
        </span>
        <span className="text-base font-bold tracking-tight text-foreground">RadarCV AI</span>
      </Link>

      <Card className="w-full max-w-md border-border/70 shadow-sm">
        {mode === "recover" ? (
          <>
            <CardHeader>
              <CardTitle>Recuperar senha</CardTitle>
              <CardDescription>
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onRecover}>
                <div className="space-y-2">
                  <Label htmlFor="recover-email">E-mail</Label>
                  <Input
                    id="recover-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar link de recuperação
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMode("login")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao login
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Acesse sua conta</CardTitle>
              <CardDescription>
                Entre ou crie sua conta para usar o RadarCV AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Criar conta</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-4">
                  <form className="space-y-4" onSubmit={onLogin}>
                    <div className="space-y-2">
                      <Label htmlFor="login-email">E-mail</Label>
                      <Input
                        id="login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="voce@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <Input
                        id="login-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Entrar
                    </Button>
                    <button
                      type="button"
                      onClick={() => setMode("recover")}
                      className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-4">
                  <form className="space-y-4" onSubmit={onSignup}>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">E-mail</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="voce@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo de 6 caracteres"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Criar conta
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
