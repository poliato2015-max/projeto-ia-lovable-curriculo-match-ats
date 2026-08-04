export type ResumeKind = "original" | "ats";
export type ResumeLanguage = "pt" | "en";

export interface Resume {
  id: string;
  name: string;
  kind: ResumeKind;
  role: string;
  area: string;
  language: ResumeLanguage;
  updatedAt: string; // ISO
  analyses: number;
  atsVersions: number;
  fileType: "pdf" | "docx" | "txt" | "md";
  /** Empresa para a qual o currículo ATS foi gerado. */
  company?: string;
  /** Marcado como currículo padrão pelo usuário. */
  favorite?: boolean;
  /** Texto extraído do arquivo, quando disponível. */
  rawText?: string;
  /** Caminho do arquivo no Storage. */
  filePath?: string;
  /** Nome original do arquivo enviado. */
  fileName?: string;
}


export type ResumeFilter =
  | "all"
  | "original"
  | "ats"
  | "favorites"
  | "recent";
