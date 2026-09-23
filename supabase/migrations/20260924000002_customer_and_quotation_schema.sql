-- Customer and Quotation tables
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code text UNIQUE,
  customer_name text NOT NULL,
  phone text,
  address text,
  tax_id text,
  email text,
  company_name text,
  id_card_number text,
  id_card_expiry text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_no text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id),
  customer_name text,
  customer_phone text,
  customer_address text,
  customer_tax_id text,
  site_name text,
  rental_start_date date,
  rental_end_date date,
  discount_amount numeric(12,2) DEFAULT 0,
  shipping_fee numeric(12,2) DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  deposit_amount numeric(12,2) DEFAULT 0,
  grand_total numeric(12,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'DRAFT', -- DRAFT, ACCEPTED, REJECTED, CONVERTED, CANCELLED
  remark text,
  cancel_reason text,
  converted_bill_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  cancelled_at timestamptz
);

CREATE TABLE quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text,
  product_code text,
  unit_name text,
  rental_type text, -- RENT, SALE
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  usage_count_or_days int DEFAULT 1,
  daily_start_date date,
  daily_end_date date,
  line_total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage customers and quotations
CREATE POLICY "Allow authenticated users to read customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert customers" ON customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update customers" ON customers FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read quotations" ON quotations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert quotations" ON quotations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update quotations" ON quotations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read quotation_items" ON quotation_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert quotation_items" ON quotation_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update quotation_items" ON quotation_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete quotation_items" ON quotation_items FOR DELETE TO authenticated USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
