/**
 * Exportação real do conteúdo textual de um currículo (original ou ATS).
 *
 * As funções abaixo trabalham EXCLUSIVAMENTE com o texto do currículo —
 * nenhum elemento da interface do RadarCV é lido, capturado ou impresso.
 * Implementação única, reutilizada pelo wizard e pela Biblioteca.
 */

/** Gera um nome de arquivo seguro a partir do título do currículo. */
export function resumeFileName(title: string, fallback = "curriculo"): string {
  const base = (title || fallback)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || fallback;
}

function normalizeLines(content: string): string[] {
  return content.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").split("\n");
}

/** Heurística simples: títulos de seção são linhas curtas em caixa alta. */
function isHeading(line: string): boolean {
  const text = line.trim();
  if (!text || text.length > 60) return false;
  if (/[.:;]$/.test(text) && text.length > 40) return false;
  const letters = text.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letters.length < 3) return false;
  return letters === letters.toUpperCase();
}

function isBullet(line: string): boolean {
  return /^\s*[•\-*\u2022]\s+/.test(line);
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

/** Copia o conteúdo textual do currículo para a área de transferência. */
export async function copyResumeContent(content: string): Promise<void> {
  const text = content.trim();
  if (!text) throw new Error("Este currículo não possui conteúdo para copiar.");
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

/** Gera e baixa um PDF real contendo apenas o currículo. */
export async function exportResumePdf(content: string, title: string): Promise<void> {
  const text = content.trim();
  if (!text) throw new Error("Este currículo não possui conteúdo para exportar.");

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
    const body = bullet ? line.replace(/^\s*[•\-*\u2022]\s+/, "") : line.trim();
    const wrapped = doc.splitTextToSize(body, maxWidth - indent) as string[];
    const lineHeight = heading ? 17 : 14;

    if (heading) {
      ensureSpace(lineHeight + 10);
      y += 10;
    }

    wrapped.forEach((part, index) => {
      ensureSpace(lineHeight);
      if (bullet && index === 0) doc.text("•", margin, y);
      doc.text(part, margin + indent, y);
      y += lineHeight;
    });

    if (heading) y += 2;
  }

  doc.save(`${resumeFileName(title)}.pdf`);
}

/** Gera e baixa um arquivo .docx real contendo apenas o currículo. */
export async function exportResumeDocx(content: string, title: string): Promise<void> {
  const text = content.trim();
  if (!text) throw new Error("Este currículo não possui conteúdo para exportar.");

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
            text: `• ${line.replace(/^\s*[•\-*\u2022]\s+/, "")}`,
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
  saveBlob(blob, `${resumeFileName(title)}.docx`);
}
