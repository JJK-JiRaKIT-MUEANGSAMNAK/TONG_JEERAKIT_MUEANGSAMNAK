-- Migration: Business Schema and Finance Security Hardening (Workset 1)

-- Shared updated_at trigger helper required by subsequent business migrations
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

-- 1. HARDEN FINANCIAL DATABASE SECURITY

-- Remove anon access from all finance tables
DROP POLICY IF EXISTS "Allow authenticated bills read" ON public.bills;
DROP POLICY IF EXISTS "Allow authenticated bills write" ON public.bills;
DROP POLICY IF EXISTS "Allow authenticated payment_batches read" ON public.payment_batches;
DROP POLICY IF EXISTS "Allow authenticated payment_batches write" ON public.payment_batches;
DROP POLICY IF EXISTS "Allow authenticated statement_transactions read" ON public.statement_transactions;
DROP POLICY IF EXISTS "Allow authenticated statement_transactions write" ON public.statement_transactions;
DROP POLICY IF EXISTS "Allow authenticated audit_logs read" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow authenticated audit_logs write" ON public.audit_logs;

-- Bills: authenticated SELECT/INSERT/UPDATE (No DELETE)
CREATE POLICY "Allow authenticated bills select" ON public.bills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated bills insert" ON public.bills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated bills update" ON public.bills FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Payment Batches, Statement Transactions, Audit Logs: SELECT only from client
CREATE POLICY "Allow authenticated payment_batches select" ON public.payment_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated statement_transactions select" ON public.statement_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated audit_logs select" ON public.audit_logs FOR SELECT TO authenticated USING (true);


-- Update split payment RPC to use auth.uid() and secure it
CREATE OR REPLACE FUNCTION public.process_split_payment_rpc(
    p_bill_id TEXT,
    p_request_id TEXT,
    p_payload_hash TEXT,
    p_tenders JSONB,
    p_payment_date TIMESTAMPTZ DEFAULT now(),
    p_correlation_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_uid UUID;
    v_actor_user_id TEXT;
    v_actor_display_name TEXT;
    v_bill RECORD;
    v_existing_batch RECORD;
    v_existing_txs JSONB;
    v_tender RECORD;
    v_total_amount NUMERIC(12,2) := 0;
    v_new_paid NUMERIC(12,2);
    v_new_outstanding NUMERIC(12,2);
    v_new_payment_status TEXT;
    v_batch_id TEXT;
    v_receipt_no TEXT;
    v_tx_id TEXT;
    v_tx_list JSONB := '[]'::jsonb;
    v_tx_record JSONB;
    v_correlation_id TEXT := COALESCE(p_correlation_id, gen_random_uuid()::text);
    v_date_str TEXT;
BEGIN
    -- Security & Identity
    v_caller_uid := auth.uid();
    
    IF v_caller_uid IS NOT NULL THEN
        v_actor_user_id := v_caller_uid::text;
        
        -- Use profiles.display_name or username (no full_name legacy)
        SELECT COALESCE(display_name, username, 'เจ้าหน้าที่') INTO v_actor_display_name
        FROM public.profiles
        WHERE id = v_caller_uid;
    ELSIF current_user = 'service_role' OR auth.role() = 'service_role' THEN
        v_actor_user_id := 'service_role';
        v_actor_display_name := 'ระบบ (Service Role)';
    ELSE
        RAISE EXCEPTION 'FORBIDDEN: Anonymous users are strictly prohibited';
    END IF;

    -- 1. Idempotency Check on p_request_id
    SELECT * INTO v_existing_batch
    FROM public.payment_batches
    WHERE request_id = p_request_id;

    IF FOUND THEN
        IF v_existing_batch.payload_hash = p_payload_hash THEN
            SELECT * INTO v_bill FROM public.bills WHERE id = v_existing_batch.bill_id;
            SELECT jsonb_agg(to_jsonb(t)) INTO v_existing_txs
            FROM public.statement_transactions t
            WHERE t.batch_id = v_existing_batch.id;

            RETURN jsonb_build_object(
                'status', 'IDEMPOTENT_REPLAY',
                'batch_id', v_existing_batch.id,
                'receipt_no', v_existing_batch.receipt_no,
                'bill', to_jsonb(v_bill),
                'transactions', COALESCE(v_existing_txs, '[]'::jsonb),
                'tenders', v_existing_batch.tenders,
                'total_amount', v_existing_batch.total_amount,
                'outstanding_after', v_existing_batch.outstanding_after,
                'paid_amount_after', v_existing_batch.paid_amount_after
            );
        ELSE
            RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT: requestId % already processed with different payload', p_request_id;
        END IF;
    END IF;

    -- 2. Row Lock Bill FOR UPDATE
    SELECT * INTO v_bill
    FROM public.bills
    WHERE id = p_bill_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BILL_NOT_FOUND: Bill with id % does not exist', p_bill_id;
    END IF;

    -- 3. Calculate and Validate Total Amount from Tenders
    FOR v_tender IN SELECT * FROM jsonb_to_recordset(p_tenders) AS x(
        "paymentMethod" TEXT,
        "amount" NUMERIC,
        "referenceNo" TEXT,
        "cashReceived" NUMERIC
    ) LOOP
        IF v_tender.amount > 0 THEN
            v_total_amount := v_total_amount + v_tender.amount;
        END IF;
    END LOOP;

    IF v_total_amount <= 0 THEN
        RAISE EXCEPTION 'INVALID_AMOUNT: Total payment amount must be greater than 0';
    END IF;

    IF v_total_amount > (v_bill.outstanding_amount + 0.001) THEN
        RAISE EXCEPTION 'PAYMENT_EXCEEDS_OUTSTANDING: Total payment % exceeds outstanding amount %',
            v_total_amount, v_bill.outstanding_amount;
    END IF;

    -- 4. Calculate New Balances
    v_new_paid := v_bill.paid_amount + v_total_amount;
    v_new_outstanding := GREATEST(0, v_bill.outstanding_amount - v_total_amount);
    v_new_payment_status := CASE WHEN v_new_outstanding <= 0 THEN 'PAID' ELSE 'PARTIAL' END;

    -- 5. Generate Collision-Proof Identifiers
    v_date_str := to_char(now(), 'YYYYMMDD');
    v_batch_id := 'PAY-' || v_date_str || '-' || lpad(nextval('public.payment_batch_seq')::text, 5, '0');
    v_receipt_no := 'RC-' || v_date_str || '-' || lpad(nextval('public.receipt_no_seq')::text, 5, '0');

    -- 6. Insert Payment Batch
    INSERT INTO public.payment_batches (
        id,
        request_id,
        payload_hash,
        bill_id,
        bill_no,
        receipt_no,
        total_amount,
        outstanding_after,
        paid_amount_after,
        tenders,
        actor_user_id,
        actor_display_name,
        created_at
    ) VALUES (
        v_batch_id,
        p_request_id,
        p_payload_hash,
        p_bill_id,
        v_bill.bill_no,
        v_receipt_no,
        v_total_amount,
        v_new_outstanding,
        v_new_paid,
        p_tenders,
        v_actor_user_id,
        v_actor_display_name,
        now()
    );

    -- 7. Insert Statement Transactions (1 per tender)
    FOR v_tender IN SELECT * FROM jsonb_to_recordset(p_tenders) AS x(
        "paymentMethod" TEXT,
        "amount" NUMERIC,
        "referenceNo" TEXT,
        "cashReceived" NUMERIC
    ) LOOP
        IF v_tender.amount > 0 THEN
            v_tx_id := 'tx-pay-' || gen_random_uuid()::text;
            
            INSERT INTO public.statement_transactions (
                id,
                batch_id,
                date_time,
                ref_no,
                type,
                category,
                description,
                customer_name,
                income_amount,
                expense_amount,
                running_balance,
                channel,
                bill_id,
                bill_no,
                correlation_id,
                is_deposit,
                created_at
            ) VALUES (
                v_tx_id,
                v_batch_id,
                COALESCE(p_payment_date, now()),
                CASE WHEN v_tender."referenceNo" IS NOT NULL AND v_tender."referenceNo" <> ''
                     THEN 'TX-' || v_bill.bill_no || '-' || v_tender."referenceNo"
                     ELSE 'TX-' || v_bill.bill_no || '-' || lpad(nextval('public.receipt_no_seq')::text, 4, '0')
                END,
                'INCOME',
                'ค่าเช่าอุปกรณ์',
                'รับชำระเงิน (' || v_tender."paymentMethod" || ') บิลเลขที่ ' || v_bill.bill_no,
                v_bill.customer_name,
                v_tender.amount,
                0,
                0,
                v_tender."paymentMethod",
                v_bill.id,
                v_bill.bill_no,
                v_correlation_id,
                false,
                now()
            );

            v_tx_record := jsonb_build_object(
                'id', v_tx_id,
                'batch_id', v_batch_id,
                'channel', v_tender."paymentMethod",
                'amount', v_tender.amount,
                'refNo', v_tender."referenceNo",
                'billId', v_bill.id,
                'billNo', v_bill.bill_no
            );
            v_tx_list := v_tx_list || jsonb_build_array(v_tx_record);

            -- Audit Log for PAYMENT_RECEIVE
            INSERT INTO public.audit_logs (
                user_id,
                display_name,
                action,
                entity_type,
                entity_id,
                before_state,
                after_state,
                correlation_id,
                created_at
            ) VALUES (
                v_actor_user_id,
                v_actor_display_name,
                'PAYMENT_RECEIVE',
                'FINANCE',
                v_tx_id,
                NULL,
                jsonb_build_object(
                    'billNo', v_bill.bill_no,
                    'amount', v_tender.amount,
                    'channel', v_tender."paymentMethod"
                ),
                v_correlation_id,
                now()
            );
        END IF;
    END LOOP;

    -- 8. Update Bill
    UPDATE public.bills
    SET paid_amount = v_new_paid,
    outstanding_amount = v_new_outstanding,
    payment_status = v_new_payment_status,
    updated_at = now()
    WHERE id = p_bill_id;

    -- 9. Audit Log for BILL_PAYMENT
    INSERT INTO public.audit_logs (
        user_id,
        display_name,
        action,
        entity_type,
        entity_id,
        before_state,
        after_state,
        correlation_id,
        created_at
    ) VALUES (
        v_actor_user_id,
        v_actor_display_name,
        'BILL_PAYMENT',
        'BILL',
        v_bill.id,
        jsonb_build_object(
            'billNo', v_bill.bill_no,
            'paidAmount', v_bill.paid_amount,
            'outstandingAmount', v_bill.outstanding_amount,
            'paymentStatus', v_bill.payment_status
        ),
        jsonb_build_object(
            'billNo', v_bill.bill_no,
            'paidAmount', v_new_paid,
            'outstandingAmount', v_new_outstanding,
            'paymentStatus', v_new_payment_status,
            'totalReceived', v_total_amount,
            'batchId', v_batch_id,
            'receiptNo', v_receipt_no
        ),
        v_correlation_id,
        now()
    );

    -- 10. Fetch Updated Bill
    SELECT * INTO v_bill FROM public.bills WHERE id = p_bill_id;

    RETURN jsonb_build_object(
        'status', 'SUCCESS',
        'batch_id', v_batch_id,
        'receipt_no', v_receipt_no,
        'bill', to_jsonb(v_bill),
        'transactions', v_tx_list,
        'tenders', p_tenders,
        'total_amount', v_total_amount,
        'outstanding_after', v_new_outstanding,
        'paid_amount_after', v_new_paid
    );
END;
$$;

REVOKE ALL ON FUNCTION public.process_split_payment_rpc(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_split_payment_rpc(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.process_split_payment_rpc(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT) TO authenticated, service_role;

-- 2. BUSINESS DATABASE FOUNDATION SCHEMA (Base tables only)

CREATE TABLE IF NOT EXISTS public.product_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.units (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES public.product_categories(id),
    unit_id TEXT REFERENCES public.units(id),
    type TEXT NOT NULL DEFAULT 'RENT', -- RENT, SALE, BOTH
    rent_price NUMERIC(12,2) DEFAULT 0,
    sale_price NUMERIC(12,2) DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id),
    type TEXT NOT NULL, -- RECEIVE, RENT, SALE, RETURN, DAMAGE, LOST, ADJUSTMENT
    quantity INTEGER NOT NULL, -- positive or negative
    reference_id TEXT, -- bill_id, job_id, etc.
    reference_type TEXT,
    remark TEXT,
    actor_user_id TEXT NOT NULL,
    actor_display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    reference_id TEXT NOT NULL, -- quotation_id or bill_id
    reference_type TEXT NOT NULL, -- QUOTATION, BILL
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, CANCELLED
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.backorders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    customer_id TEXT, -- Will reference customers in 02
    customer_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, FULFILLED, CANCELLED
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    customer_id TEXT, -- Will reference customers in 02
    customer_name TEXT NOT NULL,
    appointment_date TIMESTAMPTZ NOT NULL,
    topic TEXT NOT NULL,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('OWNER', 'USER')),
    can_manage_products BOOLEAN NOT NULL DEFAULT false,
    can_manage_bills BOOLEAN NOT NULL DEFAULT false,
    can_manage_finance BOOLEAN NOT NULL DEFAULT false,
    can_manage_users BOOLEAN NOT NULL DEFAULT false,
    can_manage_settings BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- RLS for new tables (allow authenticated users to access)
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read all" ON public.product_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write all" ON public.product_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read all" ON public.units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write all" ON public.units FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read all" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write all" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- STOCK MOVEMENTS (Append-only)
CREATE POLICY "Allow authenticated read stock_movements" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert stock_movements" ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (actor_user_id = auth.uid()::text);

CREATE POLICY "Allow authenticated read all" ON public.reservations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write all" ON public.reservations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read all" ON public.backorders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write all" ON public.backorders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read all" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write all" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PERMISSIONS
CREATE POLICY "Users can read own permissions" ON public.permissions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "OWNER can select permissions" ON public.permissions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'OWNER'));
CREATE POLICY "OWNER can insert permissions" ON public.permissions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'OWNER'));
CREATE POLICY "OWNER can update permissions" ON public.permissions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'OWNER'));

-- FINANCE TABLE PRIVILEGES: Revoke all from default public/anon/authenticated to ensure strict control
REVOKE ALL PRIVILEGES ON TABLE public.bills FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.bills FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.bills FROM authenticated;

REVOKE ALL PRIVILEGES ON TABLE public.payment_batches FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.payment_batches FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.payment_batches FROM authenticated;

REVOKE ALL PRIVILEGES ON TABLE public.statement_transactions FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.statement_transactions FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.statement_transactions FROM authenticated;

REVOKE ALL PRIVILEGES ON TABLE public.audit_logs FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.audit_logs FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.audit_logs FROM authenticated;

-- GRANT specific minimum privileges to authenticated
GRANT SELECT, INSERT, UPDATE ON TABLE public.bills TO authenticated;
GRANT SELECT ON TABLE public.payment_batches TO authenticated;
GRANT SELECT ON TABLE public.statement_transactions TO authenticated;
GRANT SELECT ON TABLE public.audit_logs TO authenticated;

-- Explicitly ensure service_role has ALL to allow backend operations bypassing RLS
GRANT ALL PRIVILEGES ON TABLE public.bills TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.payment_batches TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.statement_transactions TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.audit_logs TO service_role;
