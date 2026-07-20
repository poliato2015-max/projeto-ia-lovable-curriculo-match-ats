import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  FileText,
  FileDown,
  Pencil,
  Check,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ContentCard } from "@/components/common/ContentCard";
import type { AnalysisResult } from "../mock";

interface StepCurriculoATSProps {
  result: AnalysisResult;
  jobTitle: string;
  company: string;
  onBack: () => void;
}

const CHECKLIST = [
  "Sem tabelas",
  "Sem imagens",
  "Sem duas colunas",
  "Palavras-chave presentes",
  "Boa leitura ATS",
  "Linguagem objetiva",
  "Resultados mensuráveis",
];

const FOUND_KEYWORDS = [
  "React",
  "TypeScript",
  "Node.js",
  "Liderança",
  "APIs REST",
  "Microserviços",
  "Cloud",
  "Agile",
  "CI/CD",
  "Docker",
];

function buildResumeText(jobTitle: string, company: string) {
  return `JOÃO DA SILVA
São Paulo, SP • joao.silva@email.com • +55 (11) 99999-9999 • linkedin.com/in/joaosilva

RESUMO PROFISSIONAL
Engenheiro de Software Sênior com mais de 8 anos de experiência entregando produtos digitais escaláveis. Especialista em React, TypeScript e Node.js, com histórico comprovado de liderança técnica em equipes distribuídas e entrega de resultados mensuráveis${company ? ` em contextos similares ao da ${company}` : ""}${jobTitle ? `, com foco na função de ${jobTitle}` : ""}.

COMPETÊNCIAS TÉCNICAS
• Front-end: React, TypeScript, Next.js, Tailwind CSS
• Back-end: Node.js, APIs REST, GraphQL, Microserviços
• Cloud & DevOps: AWS, Docker, CI/CD, Observabilidade
• Metodologias: Agile, Scrum, Code Review, Mentoria

EXPERIÊNCIA PROFISSIONAL

Tech Lead — Empresa Anterior (2022 — Atual)
• Liderou equipe de 6 engenheiros na entrega de plataforma SaaS, aumentando a retenção em 28%.
• Reduziu o tempo de deploy em 45% através de nova pipeline de CI/CD.
• Definiu padrões de arquitetura front-end adotados por 4 squads.

Engenheiro de Software Pleno — Empresa Anterior (2019 — 2022)
• Implementou features críticas em produção com base de 1M+ usuários ativos.
• Reduziu bugs de produção em 30% com cobertura de testes automatizados.

FORMAÇÃO
Bacharelado em Ciência da Computação — Universidade XYZ (2015 — 2019)

IDIOMAS
Português (nativo) • Inglês (avançado)
`;
}

export function StepCurriculoATS({ result, jobTitle, company, onBack }: StepCurriculoATSProps) {
  const initial = useMemo(() => buildResumeText(jobTitle, company), [jobTitle, company]);
  const [content, setContent] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [version, setVersion] = useState(1);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast("Currículo copiado", { description: "Conteúdo enviado para a área de transferência." });
    } catch {
      toast("Não foi possível copiar", { description: "Verifique as permissões do navegador." });
    }
  };

  const handleEditToggle = () => {
    if (editing) {
      setEditing(false);
      toast("Alterações salvas", { description: "As mudanças foram aplicadas ao currículo." });
    } else {
      setEditing(true);
    }
  };

  const handleNewVersion = () => {
    const next = version + 1;
    setVersion(next);
    toast(`Nova versão v${next} criada (mock)`, {
      description: "A versão anterior foi preservada na biblioteca.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Voltar para análise
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Currículo ATS</h2>
            <p className="text-sm text-muted-foreground">
              Para a vaga: <span className="font-medium text-foreground">{jobTitle || "—"}</span>
              {" • "}Empresa: <span className="font-medium text-foreground">{company || "—"}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge className="border border-primary/20 bg-primary/10 text-primary" variant="secondary">
              Match ATS {result.score}%
            </Badge>
            <Badge variant="secondary" className="border border-border/70 bg-surface/60 text-foreground">
              Idioma: Português
            </Badge>
            <Badge variant="secondary" className="border border-border/70 bg-surface/60 text-foreground">
              {wordCount} palavras
            </Badge>
            <Badge variant="secondary" className="border border-secondary/30 bg-secondary/10 text-secondary">
              v{version}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
            <Copy className="h-4 w-4" /> Copiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => toast("Exportar PDF (mock)")}
          >
            <FileDown className="h-4 w-4" /> PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => toast("Exportar DOCX (mock)")}
          >
            <FileText className="h-4 w-4" /> DOCX
          </Button>
          <Button
            variant={editing ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={handleEditToggle}
          >
            {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            {editing ? "Salvar Alterações" : "Editar"}
          </Button>
          <Button size="sm" className="gap-2" onClick={handleNewVersion}>
            <Save className="h-4 w-4" /> Salvar Nova Versão
          </Button>
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Documento */}
        <div className="rounded-xl border border-border/70 bg-surface/40 shadow-sm">
          {editing ? (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[720px] resize-y rounded-xl border-0 bg-transparent p-8 font-mono text-sm leading-relaxed focus-visible:ring-0"
            />
          ) : (
            <pre className="whitespace-pre-wrap p-8 font-sans text-sm leading-relaxed text-foreground">
              {content}
            </pre>
          )}
        </div>

        {/* Painel lateral */}
        <aside className="space-y-4">
          <ContentCard
            title="Checklist ATS"
            description="Requisitos essenciais atendidos."
            action={
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </span>
            }
          >
            <ul className="space-y-2">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </ContentCard>

          <ContentCard title="Palavras-chave ATS" description="Termos identificados no documento.">
            <div className="flex flex-wrap gap-1.5">
              {FOUND_KEYWORDS.map((k) => (
                <Badge
                  key={k}
                  variant="secondary"
                  className="border border-primary/20 bg-primary/10 text-primary"
                >
                  {k}
                </Badge>
              ))}
            </div>
          </ContentCard>

          <ContentCard
            title="Observações da IA"
            action={
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
            }
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              Este currículo apresenta alta compatibilidade com a vaga por combinar as principais palavras-chave
              exigidas, evidenciar resultados quantitativos e adotar linguagem objetiva e amigável a sistemas ATS.
            </p>
          </ContentCard>
        </aside>
      </div>
    </div>
  );
}
