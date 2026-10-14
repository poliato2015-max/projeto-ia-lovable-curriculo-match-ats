/**
 * Exportacao real do conteudo textual de um curriculo (original ou ATS).
 *
 * As funcoes abaixo trabalham EXCLUSIVAMENTE com o texto do curriculo --
 * nenhum elemento da interface do RadarCV e lido, capturado ou impresso.
 * Implementacao unica, reutilizada pelo wizard e pela Biblioteca.
 */

/** Gera um nome de arquivo seguro a partir do titulo do curriculo. */
export function resumeFileName(title: string, fallback = "curriculo"): string {
  const base = (title || fallback)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || fallback;
}

function normalizeLines(content: string): string[] {
  return content.replace(/\r\n/g, "\n").replace(/ /g, " ").split("\n");
}

/** Heuristica simples: titulos de secao sao linhas curtas em caixa alta. */
function isHeading(line: string): boolean {
  const text = line.trim();
  if (!text || text.length > 60) return false;
  if (/[.:;]$/.test(text) && text.length > 40) return false;
  const letters = text.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letters.length < 3) return false;
  return letters === letters.toUpperCase();
}

function isBullet(line: string): boolean {
  return /^\s*[•\-*]\s+/.test(line);
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Copia o conteudo textual do curriculo para a area de transferencia. */
export async function copyResumeContent(content: string): Promise<void> {
  const text = content.trim();
  if (!text) throw new Error("Este curriculo nao possui conteudo para copiar.");
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

/** Gera e baixa um PDF real contendo apenas o curriculo. */
export async function exportResumePdf(content: string, title: string): Promise<void> {
  const text = content.trim();
  if (!text) throw new Error("Este curriculo nao possui conteudo para exportar.");

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  for (const rawLine of normalizeLines(text)) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      y += 8;
      continue;
    }

    const heading = isHeading(line);
    const bullet = isBullet(line);

    doc.setFont("helvetica", heading ? "bold" : "normal");
    doc.setFontSize(heading ? 12 : 10.5);

    const indent = bullet ? 14 : 0;
    const body = bullet ? line.replace(/^\s*[•\-*]\s+/, "") : line.trim();
    const wrapped = doc.splitTextToSize(body, maxWidth - indent) as string[];
    const lineHeight = heading ? 17 : 14;

    if (heading) {
      ensureSpace(lineHeight + 10);
      y += 10;
    }

    wrapped.forEach((part, index) => {
      ensureSpace(lineHeight);
      if (bullet && index === 0) doc.text("-", margin, y);
      doc.text(part, margin + indent, y);
      y += lineHeight;
    });

    if (heading) y += 2;
  }

  const pdfFileName = resumeFileName(title) + ".pdf";
  doc.save(pdfFileName);
}

/** Gera e baixa um arquivo .docx real contendo apenas o curriculo. */
export async function exportResumeDocx(content: string, title: string): Promise<void> {
  const text = content.trim();
  if (!text) throw new Error("Este curriculo nao possui conteudo para exportar.");

  const { Document, Packer, Paragraph, TextRun } = await import("docx");

  const paragraphs = normalizeLines(text).map((rawLine) => {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      return new Paragraph({ children: [new TextRun("")], spacing: { after: 80 } });
    }

    if (isHeading(line)) {
      return new Paragraph({
        spacing: { before: 220, after: 100 },
        children: [new TextRun({ text: line.trim(), bold: true, size: 24 })],
      });
    }

    if (isBullet(line)) {
      return new Paragraph({
        spacing: { after: 60 },
        indent: { left: 360, hanging: 180 },
        children: [
          new TextRun({
            text: "- " + line.replace(/^\s*[•\-*]\s+/, ""),
            size: 21,
          }),
        ],
      });
    }

    return new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: line.trim(), size: 21 })],
    });
  });

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 21 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const docxFileName = resumeFileName(title) + ".docx";
  saveBlob(blob, docxFileName);
}

/* ============================================================================
 * EXPORTACAO DE RELATORIO DE ANALISE ATS (PDF)
 * ========================================================================== */

import type { AnalysisResult } from "@/components/analysis/analysis-types";

/** Tipos para exportacao de relatorio de analise ATS */
export interface AnalysisReportExportInput {
  result: AnalysisResult;
  jobTitle: string;
  company: string;
  analyzedAt: Date;
  resumeTitle?: string | null;
  readOnly?: boolean;
}

/** Mapeamento de tier de score para cor hex RGB (para jsPDF) */
export const SCORE_TIER_HEX: Record<string, { label: string; hex: string }> = {
  excelente: { label: "Excelente", hex: "#059669" }, // emerald-600
  "muito-bom": { label: "Muito bom", hex: "#7C3AED" }, // primary (purple-600)
  bom: { label: "Bom", hex: "#0284C7" }, // sky-600
  atencao: { label: "Atenção", hex: "#D97706" }, // amber-600
  baixa: { label: "Baixa compatibilidade", hex: "#DC2626" }, // destructive (red-600)
};

/** Formata data no padrao brasileiro DD/MM/AAAA */
export function formatDateBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Funcao compartilhada para garantir espaco na pagina */
function ensureSpace(
  doc: { addPage: () => void },
  y: number,
  height: number,
  margin: number,
  pageHeight: number,
): number {
  if (y + height > pageHeight - margin) {
    doc.addPage();
    return margin;
  }
  return y;
}

/** Indicador visual para status de skill no PDF */
function getSkillIndicator(status: "match" | "partial" | "missing"): string {
  switch (status) {
    case "match":
      return "v";
    case "partial":
      return "~";
    case "missing":
      return "x";
    default:
      return "-";
  }
}

/** Gera e baixa um PDF do relatorio de analise ATS. */
export async function exportAnalysisReportPdf(input: AnalysisReportExportInput): Promise<void> {
  const { result, jobTitle, company, analyzedAt, resumeTitle, readOnly } = input;

  // Validacao de entrada
  if (!result || typeof result.score !== "number") {
    throw new Error("Resultado de analise invalido para exportacao.");
  }
  if (!jobTitle?.trim()) {
    throw new Error("Titulo da vaga ausente.");
  }
  if (!analyzedAt || isNaN(analyzedAt.getTime())) {
    throw new Error("Data da analise invalida.");
  }

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper local para ensureSpace
  const checkSpace = (height: number) => {
    y = ensureSpace(doc, y, height, margin, pageHeight);
  };

  // ============ CABECALHO ============
  const tier =
    SCORE_TIER_HEX[
      result.score >= 90
        ? "excelente"
        : result.score >= 80
          ? "muito-bom"
          : result.score >= 65
            ? "bom"
            : result.score >= 50
              ? "atencao"
              : "baixa"
    ];

  // Titulo da vaga
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor("#1E1E2E"); // foreground
  const titleLines = doc.splitTextToSize(jobTitle, maxWidth) as string[];
  titleLines.forEach((line: string) => {
    checkSpace(22);
    doc.text(line, margin, y);
    y += 22;
  });

  // Empresa + Data + Score
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor("#71717A"); // muted-foreground

  const dateStr = formatDateBR(analyzedAt);
  const metaLine = company + "  -  " + dateStr + (readOnly ? "  -  Analise do historico" : "");
  checkSpace(15);
  doc.text(metaLine, margin, y);
  y += 15;

  // Score box
  checkSpace(40);
  const scoreBoxWidth = 120;
  const scoreBoxHeight = 36;
  const scoreBoxX = pageWidth - margin - scoreBoxWidth;
  const scoreBoxY = y - 30;

  // Fundo do score box
  doc.setFillColor(tier.hex);
  doc.roundedRect(scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight, 6, 6, "F");

  // Texto do score
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor("#FFFFFF");
  const scoreText = String(result.score);
  const scoreTextWidth = doc.getTextWidth(scoreText);
  doc.text(scoreText, scoreBoxX + (scoreBoxWidth - scoreTextWidth) / 2, scoreBoxY + 24);

  // Label do tier
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const labelText = tier.label;
  const labelWidth = doc.getTextWidth(labelText);
  doc.text(labelText, scoreBoxX + (scoreBoxWidth - labelWidth) / 2, scoreBoxY + 34);

  y += 20;

  // Linha separadora
  doc.setDrawColor("#E4E4E7"); // border
  doc.setLineWidth(0.5);
  checkSpace(10);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  // ============ RESUMO EXECUTIVO ============
  if (result.summary?.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor("#1E1E2E");
    checkSpace(18);
    doc.text("Resumo Executivo", margin, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor("#4B4B5A");
    const summaryLines = doc.splitTextToSize(result.summary, maxWidth) as string[];
    summaryLines.forEach((line: string) => {
      checkSpace(14);
      doc.text(line, margin, y);
      y += 14;
    });
    y += 8;
  }

  // ============ HARD SKILLS ============
  if (result.hardSkills?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor("#1E1E2E");
    checkSpace(18);
    doc.text("Hard Skills", margin, y);
    y += 18;

    result.hardSkills.forEach((skill) => {
      const indicator = getSkillIndicator(skill.status);
      const skillText =
        indicator + " " + skill.name + (skill.description ? " -- " + skill.description : "");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      // Cor baseada no status
      switch (skill.status) {
        case "match":
          doc.setTextColor("#059669");
          break; // emerald
        case "partial":
          doc.setTextColor("#D97706");
          break; // amber
        case "missing":
          doc.setTextColor("#DC2626");
          break; // red
        default:
          doc.setTextColor("#4B4B5A");
      }

      const wrapped = doc.splitTextToSize(skillText, maxWidth) as string[];
      wrapped.forEach((line: string) => {
        checkSpace(14);
        doc.text(line, margin + 8, y);
        y += 14;
      });
    });
    y += 6;
  }

  // ============ SOFT SKILLS ============
  if (result.softSkills?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor("#1E1E2E");
    checkSpace(18);
    doc.text("Soft Skills", margin, y);
    y += 18;

    result.softSkills.forEach((skill) => {
      const indicator = getSkillIndicator(skill.status);
      const skillText =
        indicator + " " + skill.name + (skill.description ? " -- " + skill.description : "");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      switch (skill.status) {
        case "match":
          doc.setTextColor("#059669");
          break;
        case "partial":
          doc.setTextColor("#D97706");
          break;
        case "missing":
          doc.setTextColor("#DC2626");
          break;
        default:
          doc.setTextColor("#4B4B5A");
      }

      const wrapped = doc.splitTextToSize(skillText, maxWidth) as string[];
      wrapped.forEach((line: string) => {
        checkSpace(14);
        doc.text(line, margin + 8, y);
        y += 14;
      });
    });
    y += 6;
  }

  // ============ KEYWORDS ============
  if (result.keywordsFound?.length || result.keywordsMissing?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor("#1E1E2E");
    checkSpace(18);
    doc.text("Palavras-chave", margin, y);
    y += 18;

    // Encontradas
    if (result.keywordsFound?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor("#059669"); // emerald
      checkSpace(14);
      doc.text("Encontradas (" + result.keywordsFound.length + ")", margin, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor("#4B4B5A");
      const foundText = result.keywordsFound.join(", ");
      const foundLines = doc.splitTextToSize(foundText, maxWidth) as string[];
      foundLines.forEach((line: string) => {
        checkSpace(13);
        doc.text(line, margin + 8, y);
        y += 13;
      });
      y += 4;
    }

    // Faltantes
    if (result.keywordsMissing?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor("#DC2626"); // red
      checkSpace(14);
      doc.text("Faltantes (" + result.keywordsMissing.length + ")", margin, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor("#4B4B5A");
      const missingText = result.keywordsMissing.join(", ");
      const missingLines = doc.splitTextToSize(missingText, maxWidth) as string[];
      missingLines.forEach((line: string) => {
        checkSpace(13);
        doc.text(line, margin + 8, y);
        y += 13;
      });
      y += 6;
    }
  }

  // ============ METRICAS ============
  const hasMetrics =
    result.experienceMatch != null ||
    result.education?.trim() ||
    (result.languages?.length ?? 0) > 0;
  if (hasMetrics) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor("#1E1E2E");
    checkSpace(18);
    doc.text("Metricas", margin, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#4B4B5A");

    if (result.experienceMatch != null) {
      checkSpace(14);
      doc.text("Experiencia: " + result.experienceMatch + "% compativel", margin + 8, y);
      y += 14;
    }
    if (result.education?.trim()) {
      checkSpace(14);
      doc.text("Formacao: " + result.education, margin + 8, y);
      y += 14;
    }
    if (result.languages?.length) {
      checkSpace(14);
      doc.text(
        "Idiomas: " +
          result.languages.length +
          " identificados (" +
          result.languages.join(", ") +
          ")",
        margin + 8,
        y,
      );
      y += 14;
    }
    y += 6;
  }

  // ============ GAPS (skills partial/missing) ============
  const allSkills = [...(result.hardSkills ?? []), ...(result.softSkills ?? [])];
  const gaps = allSkills.filter((s) => s.status !== "match");
  if (gaps.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor("#1E1E2E");
    checkSpace(18);
    doc.text("Gaps Prioritarios", margin, y);
    y += 18;

    gaps.forEach((skill) => {
      const indicator = getSkillIndicator(skill.status);
      const skillText =
        indicator + " " + skill.name + (skill.description ? " -- " + skill.description : "");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      switch (skill.status) {
        case "partial":
          doc.setTextColor("#D97706");
          break; // amber
        case "missing":
          doc.setTextColor("#DC2626");
          break; // red
        default:
          doc.setTextColor("#4B4B5A");
      }

      const wrapped = doc.splitTextToSize(skillText, maxWidth) as string[];
      wrapped.forEach((line: string) => {
        checkSpace(14);
        doc.text(line, margin + 8, y);
        y += 14;
      });
    });
    y += 6;
  }

  // ============ RECOMENDACOES ============
  if (result.recommendations?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor("#1E1E2E");
    checkSpace(18);
    doc.text("Recomendacoes", margin, y);
    y += 18;

    result.recommendations.forEach((rec, idx) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#4B4B5A");
      const recText = idx + 1 + ". " + rec;
      const wrapped = doc.splitTextToSize(recText, maxWidth) as string[];
      wrapped.forEach((line: string) => {
        checkSpace(14);
        doc.text(line, margin + 8, y);
        y += 14;
      });
    });
    y += 6;
  }

  // ============ PROXIMOS PASSOS ============
  if (result.nextSteps?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor("#1E1E2E");
    checkSpace(18);
    doc.text("Proximos Passos", margin, y);
    y += 18;

    result.nextSteps.forEach((step, idx) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#4B4B5A");
      const stepText = idx + 1 + ". " + step;
      const wrapped = doc.splitTextToSize(stepText, maxWidth) as string[];
      wrapped.forEach((line: string) => {
        checkSpace(14);
        doc.text(line, margin + 8, y);
        y += 14;
      });
    });
    y += 6;
  }

  // ============ RODAPE EM TODAS AS PAGINAS ============
  const totalPages = doc.getNumberOfPages();
  const footerText =
    "Gerado por RadarCV - Analise ATS - " +
    formatDateBR(analyzedAt) +
    " - " +
    jobTitle +
    " @ " +
    company;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#A1A1AA"); // muted
    const footerY = pageHeight - margin + 10;
    const textWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - textWidth) / 2, footerY);
  }

  // ============ NOME DO ARQUIVO E DOWNLOAD ============
  const baseName =
    "relatorio-analise-" + jobTitle + "-" + company + "-" + analyzedAt.toISOString().split("T")[0];
  const fileName = resumeFileName(baseName) + ".pdf";

  doc.save(fileName);
}
