import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, LogOut, Mail, ShieldCheck, Star, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "@/components/common/PageContainer";
import { PageTitle } from "@/components/common/PageTitle";
import { ContentCard } from "@/components/common/ContentCard";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useResumeMutations, useResumes } from "@/hooks/useResumes";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — RadarCV AI" },
      {
        name: "description",
        content:
          "Gerencie suas preferências, currículo padrão e informações da sua conta no RadarCV AI.",
      },
      { property: "og:title", content: "Configurações — RadarCV AI" },
      {
        property: "og:description",
        content: "Gerencie suas preferências e informações da sua conta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: resumes, isLoading } = useResumes();
  const { defaultMutation } = useResumeMutations();

  const displayName =
    (user?.user_metadata?.["full_name"] as string | undefined) ??
    (user?.user_metadata?.["name"] as string | undefined) ??
    "";
  const originalResumes = resumes?.filter((resume) => resume.kind === "original");
  const defaultResume = originalResumes?.find((resume) => resume.favorite);

  const handleSelectDefault = async (id: string) => {
    try {
      await defaultMutation.mutateAsync({ id, isDefault: true });
      toast.success("Currículo padrão atualizado.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível definir o currículo padrão.",
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await signOut();
      navigate({ to: "/", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível sair.");
    }
  };

  return (
    <PageContainer>
      <PageTitle
        title="Configurações"
        description="Gerencie suas preferências e informações da sua conta."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ContentCard title="Conta" description="Informações da sua conta no RadarCV">
          <div className="space-y-4">
            {displayName && (
              <div className="space-y-1.5">
                <Label htmlFor="settings-name" className="flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" /> Nome
                </Label>
                <Input id="settings-name" value={displayName} readOnly />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="settings-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> E-mail
              </Label>
              <Input id="settings-email" value={user?.email ?? ""} readOnly />
              <p className="text-xs text-muted-foreground">
                O e-mail da conta não pode ser alterado nesta versão.
              </p>
            </div>
          </div>
        </ContentCard>

        <ContentCard
          title="Currículo padrão"
          description="Escolha qual currículo será usado como referência"
        >
          {isLoading ? (
            <LoadingState rows={2} />
          ) : !resumes || resumes.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Você ainda não possui currículos cadastrados.
              </p>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/curriculos">
                  <FileText className="h-4 w-4" /> Ir para Biblioteca
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Select
                value={defaultResume?.id ?? ""}
                onValueChange={(value) => void handleSelectDefault(value)}
                disabled={defaultMutation.isPending}
              >
                <SelectTrigger aria-label="Currículo padrão">
                  <SelectValue placeholder="Selecione um currículo" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.name}
                      {resume.kind === "ats" ? " · ATS" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {defaultResume ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 text-primary" />
                  Atual: {defaultResume.name}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Nenhum currículo definido como padrão.
                </p>
              )}
            </div>
          )}
        </ContentCard>

        <ContentCard title="Segurança" description="Proteção da sua conta">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-foreground">
                Sua conta é protegida pelo sistema de autenticação do RadarCV.
              </p>
              <Badge variant="outline" className="mt-2 text-[10px]">
                Autenticação ativa
              </Badge>
            </div>
          </div>
        </ContentCard>

        <ContentCard title="Sessão" description="Encerrar o acesso neste dispositivo">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ao sair, você será redirecionado para a página inicial.
            </p>
            <Separator />
            <Button variant="outline" className="gap-2" onClick={() => void handleSignOut()}>
              <LogOut className="h-4 w-4" /> Sair da conta
            </Button>
          </div>
        </ContentCard>
      </div>
    </PageContainer>
  );
}
