import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteAnalysis,
  getAnalysis,
  listAnalyses,
  saveAnalysis,
  type SaveAnalysisInput,
} from "@/services/analyses.service";

const ANALYSES_KEY = ["analyses"] as const;
const PAGE_SIZE = 20;

export function useAnalyses() {
  return useInfiniteQuery({
    queryKey: ANALYSES_KEY,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => listAnalyses(pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length : undefined,
  });
}

export function useAnalysis(id: string) {
  return useQuery({
    queryKey: [...ANALYSES_KEY, id],
    queryFn: () => getAnalysis(id),
  });
}

export function useAnalysisMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ANALYSES_KEY });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnalysis(id),
    onSuccess: invalidate,
  });

  const saveMutation = useMutation({
    mutationFn: (input: SaveAnalysisInput) => saveAnalysis(input),
    onSuccess: invalidate,
  });

  return { deleteMutation, saveMutation };
}
