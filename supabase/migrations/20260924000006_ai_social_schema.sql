CREATE TABLE IF NOT EXISTS public.ai_social_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  suggested_images TEXT[],
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_social_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read ai drafts" ON public.ai_social_drafts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert ai drafts" ON public.ai_social_drafts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update ai drafts" ON public.ai_social_drafts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete ai drafts" ON public.ai_social_drafts FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS update_ai_social_drafts_updated_at ON public.ai_social_drafts;
CREATE TRIGGER update_ai_social_drafts_updated_at BEFORE UPDATE ON public.ai_social_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
