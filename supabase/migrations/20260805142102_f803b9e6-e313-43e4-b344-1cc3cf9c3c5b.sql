ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS job_url text,
  ADD COLUMN IF NOT EXISTS resume_title text;

ALTER TABLE public.analysis_results
  ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS analyses_user_created_idx
  ON public.analyses (user_id, created_at DESC);