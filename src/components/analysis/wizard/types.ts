import type { Resume } from "@/components/resumes/types";

export type JobSource = "url" | "description" | "upload";
export type ResumeSource = "upload" | "paste" | "saved";

export interface JobData {
  source: JobSource;
  url: string;
  description: string;
  fileName?: string;
}

export interface ResumeData {
  source: ResumeSource;
  content: string;
  fileName?: string;
  savedResume?: Resume;
}

export interface ObjectiveData {
  goals: string[];
  instructions: string;
}

export interface WizardData {
  job: JobData;
  resume: ResumeData;
  objective: ObjectiveData;
}

export const OBJECTIVE_OPTIONS = [
  { id: "maximize-ats", label: "Maximizar Score ATS" },
  { id: "leadership", label: "Destacar liderança" },
  { id: "narrative", label: "Melhorar narrativa" },
  { id: "career-transition", label: "Adaptar para transição de carreira" },
  { id: "one-page", label: "Reduzir para uma página" },
  { id: "translate-en", label: "Traduzir para inglês" },
] as const;
