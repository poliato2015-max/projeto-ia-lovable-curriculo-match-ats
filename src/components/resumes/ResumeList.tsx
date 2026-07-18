import { ResumeCard } from "./ResumeCard";
import type { Resume } from "./types";

interface ResumeListProps {
  resumes: Resume[];
  onOpen?: (r: Resume) => void;
  onEdit?: (r: Resume) => void;
  onDuplicate?: (r: Resume) => void;
  onDelete?: (r: Resume) => void;
}

export function ResumeList({ resumes, ...actions }: ResumeListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {resumes.map((r) => (
        <ResumeCard key={r.id} resume={r} {...actions} />
      ))}
    </div>
  );
}
