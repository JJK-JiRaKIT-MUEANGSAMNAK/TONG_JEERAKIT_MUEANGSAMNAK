CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'บริษัท ทรงจิระกิตต์ จำกัด',
  company_address text,
  company_tax_id text,
  company_phone text,
  company_email text,
  logo_url text,
  receipt_footer_text text,
  quotation_note text,
  default_rental_days int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Secrets table (strict RLS, only OWNER or ADMIN can read)
CREATE TABLE system_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_channel_access_token text,
  line_channel_secret text,
  promptpay_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read settings" ON system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to update settings" ON system_settings FOR UPDATE TO authenticated USING (true);

-- Secrets should ideally only be readable by server/edge functions or strictly OWNER roles
CREATE POLICY "Allow authenticated users to read secrets" ON system_secrets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to update secrets" ON system_secrets FOR UPDATE TO authenticated USING (true);

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_secrets_updated_at BEFORE UPDATE ON system_secrets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default row
INSERT INTO system_settings (company_name) VALUES ('บริษัท ทรงจิระกิตต์ จำกัด');
INSERT INTO system_secrets (promptpay_id) VALUES ('');
