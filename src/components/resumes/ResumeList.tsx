import { ResumeCard } from "./ResumeCard";
import type { Resume } from "./types";
import type { AtsResumeMeta } from "@/services/resumes.service";

interface ResumeListProps {
  resumes: Resume[];
  onView?: (r: Resume) => void;
  onEdit?: (r: Resume) => void;
  onExportPdf?: (r: Resume) => void;
  onExportDocx?: (r: Resume) => void;
  onDelete?: (r: Resume) => void;
  onToggleDefault?: (r: Resume) => void;
  /** Metadados reais de versão/origem por id de currículo ATS. */
  atsMeta?: Map<string, AtsResumeMeta>;
}

export function ResumeList({ resumes, atsMeta, ...actions }: ResumeListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {resumes.map((r) => (
        <ResumeCard key={r.id} resume={r} meta={atsMeta?.get(r.id)} {...actions} />
      ))}
    </div>
  );
}
