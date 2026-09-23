CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT NOT NULL DEFAULT 'บริษัท ทรงจิระกิตต์ จำกัด',
  company_address TEXT,
  company_tax_id TEXT,
  company_phone TEXT,
  company_email TEXT,
  logo_url TEXT,
  receipt_footer_text TEXT,
  quotation_note TEXT,
  default_rental_days INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Secrets table (strict RLS, only service_role can read/write)
CREATE TABLE IF NOT EXISTS public.system_secrets (
  id TEXT PRIMARY KEY DEFAULT 'default',
  line_channel_access_token TEXT,
  line_channel_secret TEXT,
  promptpay_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read settings" ON public.system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow OWNER to update settings" ON public.system_settings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'OWNER'));

-- Secrets: server-side only. No policies means deny all for anon and authenticated.
-- service_role bypasses RLS by default.

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_secrets_updated_at ON public.system_secrets;
CREATE TRIGGER update_system_secrets_updated_at BEFORE UPDATE ON public.system_secrets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default row
INSERT INTO public.system_settings (id, company_name) VALUES ('default', 'บริษัท ทรงจิระกิตต์ จำกัด') ON CONFLICT DO NOTHING;
INSERT INTO public.system_secrets (id, promptpay_id) VALUES ('default', '') ON CONFLICT DO NOTHING;
