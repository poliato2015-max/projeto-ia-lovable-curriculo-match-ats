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
}

export type ResumeFilter =
  | "all"
  | "original"
  | "ats"
  | "pt"
  | "en"
  | "recent";
