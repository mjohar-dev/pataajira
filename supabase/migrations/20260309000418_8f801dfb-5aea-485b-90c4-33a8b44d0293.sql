CREATE TABLE public.external_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  source_id text,
  title text NOT NULL,
  company text NOT NULL,
  company_logo text,
  location text,
  type text,
  industry text,
  skills text[] DEFAULT '{}',
  salary text,
  description text,
  requirements text[] DEFAULT '{}',
  responsibilities text[] DEFAULT '{}',
  deadline text,
  posted_date timestamp with time zone DEFAULT now(),
  remote boolean DEFAULT false,
  apply_url text,
  fetched_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(source, source_id)
);

ALTER TABLE public.external_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "External jobs viewable by all" ON public.external_jobs
  FOR SELECT USING (is_active = true);

CREATE INDEX idx_external_jobs_source ON public.external_jobs(source);
CREATE INDEX idx_external_jobs_fetched_at ON public.external_jobs(fetched_at DESC);