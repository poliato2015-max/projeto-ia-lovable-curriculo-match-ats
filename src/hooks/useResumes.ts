import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteResume,
  importResume,
  listResumes,
  setDefaultResume,
  updateResume,
  type ImportResumeInput,
  type UpdateResumeInput,
} from "@/services/resumes.service";
import type { Resume } from "@/components/resumes/types";

const RESUMES_KEY = ["resumes"] as const;

export function useResumes(enabled = true) {
  return useQuery({
    queryKey: RESUMES_KEY,
    queryFn: listResumes,
    enabled,
  });
}

export function useResumeMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: RESUMES_KEY });

  const importMutation = useMutation({
    mutationFn: (input: ImportResumeInput) => importResume(input),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateResumeInput }) =>
      updateResume(id, input),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (resume: Pick<Resume, "id" | "filePath">) => deleteResume(resume),
    onSuccess: invalidate,
  });

  const defaultMutation = useMutation({
    mutationFn: ({ id, isDefault }: { id: string; isDefault: boolean }) =>
      setDefaultResume(id, isDefault),
    onSuccess: invalidate,
  });

  return { importMutation, updateMutation, deleteMutation, defaultMutation };
}
