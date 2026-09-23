-- Customer and Quotation tables
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  customer_code TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  email TEXT,
  company_name TEXT,
  id_card_number TEXT,
  id_card_expiry TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quotations (
  id TEXT PRIMARY KEY,
  quotation_no TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES public.customers(id),
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_tax_id TEXT,
  site_name TEXT,
  rental_start_date DATE,
  rental_end_date DATE,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  shipping_fee NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  deposit_amount NUMERIC(12,2) DEFAULT 0,
  grand_total NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, ACCEPTED, REJECTED, CONVERTED, CANCELLED
  remark TEXT,
  cancel_reason TEXT,
  converted_bill_id TEXT REFERENCES public.bills(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id TEXT REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id),
  product_name TEXT,
  product_code TEXT,
  unit_name TEXT,
  rental_type TEXT, -- RENT, SALE
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  usage_count_or_days INT DEFAULT 1,
  daily_start_date DATE,
  daily_end_date DATE,
  line_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage customers and quotations
CREATE POLICY "Allow authenticated users to read customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update customers" ON public.customers FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read quotations" ON public.quotations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert quotations" ON public.quotations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update quotations" ON public.quotations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read quotation_items" ON public.quotation_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert quotation_items" ON public.quotation_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update quotation_items" ON public.quotation_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete quotation_items" ON public.quotation_items FOR DELETE TO authenticated USING (true);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotations_updated_at ON public.quotations;
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
