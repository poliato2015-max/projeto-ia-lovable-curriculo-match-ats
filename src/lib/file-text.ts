/**
 * Serviço único de leitura de arquivos de currículo/vaga.
 * Usado tanto pela Biblioteca de Currículos quanto pelo wizard "Analisar Vaga",
 * garantindo que qualquer arquivo aceito em um fluxo também seja aceito no outro.
 */

export const ACCEPTED_FILE_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"] as const;
export const ACCEPTED_FILE_ACCEPT = ACCEPTED_FILE_EXTENSIONS.join(",");
export const ACCEPTED_FILE_LABELS = ["PDF", "DOCX", "TXT", "Markdown"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_FILE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function normalize(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdf(buffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as Array<{ str?: string; hasEOL?: boolean }>;
    pages.push(
      items.map((item) => (item.str ?? "") + (item.hasEOL ? "\n" : " ")).join(""),
    );
  }
  await doc.destroy();
  return normalize(pages.join("\n\n"));
}

async function extractDocx(buffer: ArrayBuffer): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser");
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return normalize(result.value ?? "");
}

/**
 * Extrai o texto de um arquivo suportado.
 * Lança erro amigável quando o formato não é suportado ou o conteúdo não pôde ser lido.
 */
export async function extractFileText(file: File | Blob, fileName?: string): Promise<string> {
  const name = (fileName ?? (file as File).name ?? "").toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return normalize(await file.text());
  }

  if (name.endsWith(".pdf")) {
    const text = await extractPdf(await file.arrayBuffer());
    if (!text) {
      throw new Error(
        "Este PDF parece ser digitalizado (imagem) e não contém texto selecionável. Use a opção Colar.",
      );
    }
    return text;
  }

  if (name.endsWith(".docx")) {
    const text = await extractDocx(await file.arrayBuffer());
    if (!text) throw new Error("Não foi possível ler o conteúdo deste DOCX.");
    return text;
  }

  throw new Error("Formato não suportado. Use PDF, DOCX, TXT ou Markdown.");
}

/** Valida tamanho e extensão antes de qualquer processamento. */
export function validateFile(file: File): string | null {
  if (!isAcceptedFile(file)) {
    return "Formato não suportado. Use PDF, DOCX, TXT ou Markdown.";
  }
  if (file.size > MAX_FILE_SIZE) return "O arquivo excede o limite de 10 MB.";
  return null;
}
