-- Migration: Split Payment System & Financial Ledger (Workset 2)
-- Purpose: Setup tables, constraints, sequences, and atomic RPC transaction for split payments.

-- 1. Sequences for human-readable, collision-proof receipt & batch numbers
CREATE SEQUENCE IF NOT EXISTS public.receipt_no_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.payment_batch_seq START 1;

-- 2. Bills Table
CREATE TABLE IF NOT EXISTS public.bills (
    id TEXT PRIMARY KEY,
    bill_no TEXT UNIQUE NOT NULL,
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    site_name TEXT,
    rental_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    scheduled_return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    actual_return_date DATE,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    outstanding_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    held_deposit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_deposit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    rental_status TEXT NOT NULL DEFAULT 'RENTING',
    payment_status TEXT NOT NULL DEFAULT 'UNPAID',
    dispatch_status TEXT NOT NULL DEFAULT 'DISPATCHED',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    deposits JSONB NOT NULL DEFAULT '[]'::jsonb,
    remark TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Payment Batches Table (For atomic batch & Idempotency)
CREATE TABLE IF NOT EXISTS public.payment_batches (
    id TEXT PRIMARY KEY,
    request_id TEXT UNIQUE NOT NULL,
    payload_hash TEXT NOT NULL,
    bill_id TEXT NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    bill_no TEXT NOT NULL,
    receipt_no TEXT UNIQUE NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    outstanding_after NUMERIC(12,2) NOT NULL,
    paid_amount_after NUMERIC(12,2) NOT NULL,
    tenders JSONB NOT NULL,
    actor_user_id TEXT NOT NULL,
    actor_display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Statement Transactions Table (Financial Ledger)
CREATE TABLE IF NOT EXISTS public.statement_transactions (
    id TEXT PRIMARY KEY,
    batch_id TEXT REFERENCES public.payment_batches(id) ON DELETE CASCADE,
    date_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    ref_no TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INCOME',
    category TEXT NOT NULL DEFAULT 'ค่าเช่าอุปกรณ์',
    description TEXT NOT NULL,
    customer_name TEXT,
    income_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    expense_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    running_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    channel TEXT NOT NULL,
    bill_id TEXT REFERENCES public.bills(id) ON DELETE CASCADE,
    bill_no TEXT NOT NULL,
    correlation_id TEXT,
    is_deposit BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    correlation_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance and lookup
CREATE INDEX IF NOT EXISTS idx_bills_status ON public.bills(rental_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_batches_bill_id ON public.payment_batches(bill_id);
CREATE INDEX IF NOT EXISTS idx_payment_batches_request_id ON public.payment_batches(request_id);
CREATE INDEX IF NOT EXISTS idx_statement_transactions_bill_id ON public.statement_transactions(bill_id);
CREATE INDEX IF NOT EXISTS idx_statement_transactions_batch_id ON public.statement_transactions(batch_id);

-- Enable RLS on all financial tables
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statement_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Authenticated users & anon have access for this business POS
DROP POLICY IF EXISTS "Allow authenticated bills read" ON public.bills;
CREATE POLICY "Allow authenticated bills read" ON public.bills FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "Allow authenticated bills write" ON public.bills;
CREATE POLICY "Allow authenticated bills write" ON public.bills FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated payment_batches read" ON public.payment_batches;
CREATE POLICY "Allow authenticated payment_batches read" ON public.payment_batches FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "Allow authenticated payment_batches write" ON public.payment_batches;
CREATE POLICY "Allow authenticated payment_batches write" ON public.payment_batches FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated statement_transactions read" ON public.statement_transactions;
CREATE POLICY "Allow authenticated statement_transactions read" ON public.statement_transactions FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "Allow authenticated statement_transactions write" ON public.statement_transactions;
CREATE POLICY "Allow authenticated statement_transactions write" ON public.statement_transactions FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated audit_logs read" ON public.audit_logs;
CREATE POLICY "Allow authenticated audit_logs read" ON public.audit_logs FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "Allow authenticated audit_logs write" ON public.audit_logs FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 6. Atomic RPC Function: process_split_payment_rpc
CREATE OR REPLACE FUNCTION public.process_split_payment_rpc(
    p_bill_id TEXT,
    p_request_id TEXT,
    p_payload_hash TEXT,
    p_tenders JSONB,
    p_payment_date TIMESTAMPTZ DEFAULT now(),
    p_actor_user_id TEXT DEFAULT 'system',
    p_actor_display_name TEXT DEFAULT 'ระบบ',
    p_correlation_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
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
    -- 1. Idempotency Check on p_request_id
    SELECT * INTO v_existing_batch
    FROM public.payment_batches
    WHERE request_id = p_request_id;

    IF FOUND THEN
        -- If payload matches exactly -> Return existing result without re-charging
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
            -- Request ID reused with different payload -> REJECT
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
        p_actor_user_id,
        p_actor_display_name,
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
                p_actor_user_id,
                p_actor_display_name,
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
        p_actor_user_id,
        p_actor_display_name,
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

GRANT EXECUTE ON FUNCTION public.process_split_payment_rpc TO authenticated, anon, service_role;
