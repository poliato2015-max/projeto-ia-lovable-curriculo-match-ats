import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteResume,
  importResume,
  listAtsResumeMeta,
  listResumes,
  saveAtsResume,
  setDefaultResume,
  updateResume,
  updateResumeContent,
  type ImportResumeInput,
  type SaveAtsResumeInput,
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

export function useAtsResumeMeta(enabled = true) {
  return useQuery({
    queryKey: ["ats-resume-meta"],
    queryFn: listAtsResumeMeta,
    enabled,
  });
}

export function useResumeMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: RESUMES_KEY });
    void qc.invalidateQueries({ queryKey: ["ats-resume-meta"] });
  };

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

  const contentMutation = useMutation({
    mutationFn: ({ resume, content }: { resume: Resume; content: string }) =>
      updateResumeContent(resume, content),
    onSuccess: invalidate,
  });

  const saveAtsMutation = useMutation({
    mutationFn: (input: SaveAtsResumeInput) => saveAtsResume(input),
    onSuccess: invalidate,
  });

  return {
    importMutation,
    updateMutation,
    deleteMutation,
    defaultMutation,
    saveAtsMutation,
    contentMutation,
  };
}
