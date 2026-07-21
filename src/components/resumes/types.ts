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
  /** Marcado como favorito pelo usuário. */
  favorite?: boolean;
}

export type ResumeFilter =
  | "all"
  | "original"
  | "ats"
  | "favorites"
  | "recent";
