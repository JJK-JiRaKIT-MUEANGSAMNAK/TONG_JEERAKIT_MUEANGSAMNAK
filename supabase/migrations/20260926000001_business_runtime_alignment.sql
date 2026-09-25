-- Migration: Business Runtime Alignment to Supabase Source of Truth
-- Timestamp: 20260926000001
-- Aligns bills, quotations, appointments, reservations, backorders, and audit_logs
-- with full runtime fields and secure access policies.

-- 1. BILLS TABLE EXTENSIONS
ALTER TABLE public.bills
  ADD COLUMN IF NOT EXISTS quotation_no TEXT,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS reservation_id TEXT,
  ADD COLUMN IF NOT EXISTS original_bill_id TEXT,
  ADD COLUMN IF NOT EXISTS parent_bill_id TEXT,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revisions JSONB DEFAULT '[]'::jsonb;

-- 2. QUOTATIONS TABLE EXTENSIONS
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- 3. APPOINTMENTS TABLE EXTENSIONS
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'GENERAL',
  ADD COLUMN IF NOT EXISTS appointment_type_id TEXT,
  ADD COLUMN IF NOT EXISTS date TEXT,
  ADD COLUMN IF NOT EXISTS start_time TEXT,
  ADD COLUMN IF NOT EXISTS end_time TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_person TEXT,
  ADD COLUMN IF NOT EXISTS bill_id TEXT,
  ADD COLUMN IF NOT EXISTS bill_no TEXT,
  ADD COLUMN IF NOT EXISTS quotation_id TEXT,
  ADD COLUMN IF NOT EXISTS quotation_no TEXT,
  ADD COLUMN IF NOT EXISTS details TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'NORMAL',
  ADD COLUMN IF NOT EXISTS assignee_id TEXT,
  ADD COLUMN IF NOT EXISTS assignee_name TEXT,
  ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]'::jsonb;

-- 4. RESERVATIONS TABLE EXTENSIONS & ID TYPE
ALTER TABLE public.reservations ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS reservation_no TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS source_no TEXT,
  ADD COLUMN IF NOT EXISTS customer_id TEXT,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS product_code TEXT,
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'RENT',
  ADD COLUMN IF NOT EXISTS start_date TEXT,
  ADD COLUMN IF NOT EXISTS end_date TEXT,
  ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS release_reason TEXT,
  ADD COLUMN IF NOT EXISTS correlation_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 5. BACKORDERS TABLE EXTENSIONS & ID TYPE
ALTER TABLE public.backorders ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.backorders
  ADD COLUMN IF NOT EXISTS backorder_no TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS source_no TEXT,
  ADD COLUMN IF NOT EXISTS product_code TEXT,
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'RENT',
  ADD COLUMN IF NOT EXISTS requested_qty INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fulfilled_qty INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outstanding_qty INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS start_date TEXT,
  ADD COLUMN IF NOT EXISTS end_date TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS allocated_ready_qty INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS correlation_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 6. AUDIT LOGS TABLE EXTENSIONS & INSERT POLICY
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS bill_id TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS before JSONB,
  ADD COLUMN IF NOT EXISTS after JSONB;

GRANT INSERT ON TABLE public.audit_logs TO authenticated;
DROP POLICY IF EXISTS "Allow authenticated insert audit_logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- 7. STATEMENT TRANSACTIONS INSERT POLICY FOR GENERAL RECORDINGS
GRANT INSERT ON TABLE public.statement_transactions TO authenticated;
DROP POLICY IF EXISTS "Allow authenticated insert statement_transactions" ON public.statement_transactions;
CREATE POLICY "Allow authenticated insert statement_transactions" ON public.statement_transactions FOR INSERT TO authenticated WITH CHECK (true);

-- Indexing for high performance lookups
CREATE INDEX IF NOT EXISTS idx_bills_quotation_id ON public.bills(quotation_id);
CREATE INDEX IF NOT EXISTS idx_reservations_product_status ON public.reservations(product_id, status);
CREATE INDEX IF NOT EXISTS idx_backorders_product_status ON public.backorders(product_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation_id ON public.audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
