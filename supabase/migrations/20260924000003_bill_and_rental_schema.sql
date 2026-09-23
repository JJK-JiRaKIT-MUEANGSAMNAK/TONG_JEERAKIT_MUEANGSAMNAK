-- Bill and Rental Lifecycle tables (Altering existing bills table)
ALTER TABLE public.bills 
  ADD COLUMN IF NOT EXISTS quotation_id TEXT REFERENCES public.quotations(id),
  ADD COLUMN IF NOT EXISTS dispatch_status TEXT DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS rental_status TEXT DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'UNPAID',
  ADD COLUMN IF NOT EXISTS bill_amount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_refunded NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_applied NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_due NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
  ADD COLUMN IF NOT EXISTS remark TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id TEXT REFERENCES public.bills(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id),
  product_name TEXT,
  product_code TEXT,
  unit TEXT,
  rental_type TEXT, -- DAILY, ROUND, SALE
  quantity INT NOT NULL DEFAULT 1,
  returned_qty INT DEFAULT 0,
  outstanding_qty INT DEFAULT 0,
  daily_rate NUMERIC(12,2) DEFAULT 0,
  rental_start_date DATE,
  scheduled_return_date DATE,
  usage_count INT DEFAULT 1,
  billable_days INT DEFAULT 1,
  is_delivered BOOLEAN DEFAULT false,
  actual_return_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;

-- Note: bills RLS is handled in 20260924000001_business_schema_and_finance_security.sql
CREATE POLICY "Allow authenticated users to read bill_items" ON public.bill_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert bill_items" ON public.bill_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update bill_items" ON public.bill_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete bill_items" ON public.bill_items FOR DELETE TO authenticated USING (true);

-- Drop trigger if exists to prevent duplicate error
DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills;
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
