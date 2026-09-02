/**
 * Avaliação REAL dos requisitos de compatibilidade ATS.
 * As checagens estruturais são derivadas do conteúdo atual do currículo ATS
 * (o mesmo texto que o usuário vê e edita) — nada é fixo.
 */

export type ChecklistStatus = "pass" | "warn";

export type ChecklistId =
  | "plain-text"
  | "no-images"
  | "single-column"
  | "sections"
  | "original-only"
  | "objective-language";

export interface ChecklistItem {
  id: ChecklistId;
  label: string;
  status: ChecklistStatus;
  detail: string;
}

export const CHECKLIST_LABELS: Record<ChecklistId, string> = {
  "plain-text": "Texto simples, sem tabelas",
  "no-images": "Sem imagens ou gráficos",
  "single-column": "Coluna única",
  sections: "Seções padronizadas",
  "original-only": "Somente informações do currículo original",
  "objective-language": "Linguagem objetiva",
};

const SECTION_KEYWORDS = [
  "resumo",
  "perfil",
  "objetivo",
  "experi",
  "forma",
  "educa",
  "acad",
  "compet",
  "habilidad",
  "skills",
  "certifica",
  "curso",
  "idioma",
  "language",
  "projeto",
  "summary",
  "experience",
  "education",
];

function lines(content: string): string[] {
  return content.split(/\r?\n/);
}

/** Critério 1 — tabelas / estruturas tabulares. */
export function checkPlainText(content: string): ChecklistItem {
  const ls = lines(content);
  const pipeRows = ls.filter((l) => (l.match(/\|/g)?.length ?? 0) >= 2).length;
  const separatorRow = ls.some((l) => /^\s*\|?[\s:|-]*-{3,}[\s:|-]*\|/.test(l));
  const htmlTable = /<\s*(table|tr|td|th)\b/i.test(content);
  const boxDrawing = /[┌┐└┘├┤┬┴┼─│╔╗╚╝═║]/.test(content);
  const tabColumns = ls.filter((l) => /\S\t+\S/.test(l)).length >= 2;

  const hasTable = pipeRows >= 2 || separatorRow || htmlTable || boxDrawing || tabColumns;
  return {
    id: "plain-text",
    label: CHECKLIST_LABELS["plain-text"],
    status: hasTable ? "warn" : "pass",
    detail: hasTable
      ? "Encontramos estrutura tabular no currículo — muitos ATS não conseguem ler tabelas."
      : "O currículo usa apenas texto corrido, ideal para leitura automática.",
  };
}

/** Critério 2 — imagens, gráficos e elementos visuais. */
export function checkNoImages(content: string): ChecklistItem {
  const markdownImage = /!\[[^\]]*\]\([^)]*\)/.test(content);
  const htmlImage = /<\s*(img|svg|figure|canvas|picture)\b/i.test(content);
  const dataImage = /data:image\//i.test(content);
  const imageFile = /\.(png|jpe?g|gif|svg|webp|bmp)\b/i.test(content);
  const chartBlocks = /[▇█▓▒░■◼◻▪▬]/.test(content);

  const hasVisual = markdownImage || htmlImage || dataImage || imageFile || chartBlocks;
  return {
    id: "no-images",
    label: CHECKLIST_LABELS["no-images"],
    status: hasVisual ? "warn" : "pass",
    detail: hasVisual
      ? "Há imagens, gráficos ou elementos visuais que o ATS descarta na leitura."
      : "Nenhuma imagem ou gráfico — todo o conteúdo é legível como texto.",
  };
}

/** Critério 3 — estrutura em coluna única. */
export function checkSingleColumn(content: string): ChecklistItem {
  const ls = lines(content).filter((l) => l.trim().length > 0);
  const columnLike = ls.filter((l) => /\S {3,}\S/.test(l.trimEnd()) || /\S\t+\S/.test(l)).length;
  const htmlColumns = /<\s*(table|div[^>]*column|section[^>]*col-)/i.test(content);

  const multiColumn = htmlColumns || (ls.length > 0 && columnLike >= Math.max(3, ls.length * 0.15));
  return {
    id: "single-column",
    label: CHECKLIST_LABELS["single-column"],
    status: multiColumn ? "warn" : "pass",
    detail: multiColumn
      ? "O texto aparenta estar dividido em colunas, o que embaralha a ordem de leitura no ATS."
      : "Conteúdo em fluxo único, na ordem correta de leitura.",
  };
}

/** Critério 4 — seções claramente identificadas. */
export function checkSections(content: string): ChecklistItem {
  const ls = lines(content);
  const headings = ls.filter((line) => {
    const raw = line.trim();
    if (!raw || raw.length > 60) return false;
    const isHeadingShape =
      /^#{1,4}\s+\S/.test(raw) ||
      /^[A-ZÀ-Ú0-9][A-ZÀ-Ú0-9\s/&.-]+$/.test(raw) ||
      /^[A-ZÀ-Ú][^.!?]*:$/.test(raw);
    if (!isHeadingShape) return false;
    const normalized = raw
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return SECTION_KEYWORDS.some((k) => normalized.includes(k));
  });

  const unique = new Set(headings.map((h) => h.trim().toLowerCase()));
  const ok = unique.size >= 3;
  return {
    id: "sections",
    label: CHECKLIST_LABELS.sections,
    status: ok ? "pass" : "warn",
    detail: ok
      ? `Identificamos ${unique.size} seções claramente nomeadas.`
      : "As seções do currículo não estão claramente identificadas com títulos reconhecíveis.",
  };
}

/** Roda somente as validações estruturais (sem IA). */
export function evaluateStructuralChecklist(content: string): ChecklistItem[] {
  return [
    checkPlainText(content),
    checkNoImages(content),
    checkSingleColumn(content),
    checkSections(content),
  ];
}

export interface ChecklistDiff {
  label: string;
  from: ChecklistStatus;
  to: ChecklistStatus;
}

export function diffChecklist(
  previous: ChecklistItem[],
  next: ChecklistItem[],
): ChecklistDiff[] {
  const prevById = new Map(previous.map((i) => [i.id, i.status]));
  return next
    .filter((item) => prevById.has(item.id) && prevById.get(item.id) !== item.status)
    .map((item) => ({
      label: item.label,
      from: prevById.get(item.id) as ChecklistStatus,
      to: item.status,
    }));
}
