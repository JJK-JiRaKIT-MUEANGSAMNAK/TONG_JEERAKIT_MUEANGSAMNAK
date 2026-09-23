CREATE TABLE ai_social_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  suggested_images text[],
  status text DEFAULT 'DRAFT', -- DRAFT, PENDING_APPROVAL, PUBLISHED, REJECTED
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_social_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read ai drafts" ON ai_social_drafts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage ai drafts" ON ai_social_drafts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_ai_social_drafts_updated_at BEFORE UPDATE ON ai_social_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
