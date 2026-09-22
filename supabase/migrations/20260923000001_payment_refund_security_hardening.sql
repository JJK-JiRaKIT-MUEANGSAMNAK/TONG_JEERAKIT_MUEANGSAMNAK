-- Migration: 20260923000001_payment_refund_security_hardening.sql
-- Purpose: Harden process_payment_refund_rpc security and integrity:
-- 1. SECURITY DEFINER with safe search_path = public, pg_temp
-- 2. Authenticated user enforcement via auth.uid() (NEVER trust browser-supplied actor ID)
-- 3. Strictly revoke EXECUTE from anon and public, grant only to authenticated and service_role
-- 4. Reconcile Net Paid strictly from append-only statement_transactions (not trusting cached bill.paid_amount)
-- 5. Inherit original payment channel, validate limits, atomic bill updates, and immutable audit logs.

CREATE OR REPLACE FUNCTION public.process_payment_refund_rpc(
    p_bill_id TEXT,
    p_original_tx_id TEXT,
    p_amount NUMERIC(12,2),
    p_channel TEXT DEFAULT NULL,
    p_reason TEXT DEFAULT 'คืนเงินลูกค้า',
    p_actor_user_id TEXT DEFAULT NULL,
    p_actor_display_name TEXT DEFAULT NULL,
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
    v_orig_tx RECORD;
    v_net_paid NUMERIC(12,2) := 0;
    v_total_refunded_for_tx NUMERIC(12,2) := 0;
    v_new_paid NUMERIC(12,2);
    v_new_outstanding NUMERIC(12,2);
    v_new_payment_status TEXT;
    v_tx_id TEXT;
    v_ref_no TEXT;
    v_channel TEXT;
    v_correlation_id TEXT := COALESCE(p_correlation_id, gen_random_uuid()::text);
    v_date_str TEXT;
BEGIN
    -- 0. Identity & Permission Verification
    -- Check caller identity: MUST be authenticated user or service_role
    v_caller_uid := auth.uid();
    
    IF v_caller_uid IS NOT NULL THEN
        -- Caller is an authenticated user: NEVER trust browser-supplied actor ID
        v_actor_user_id := v_caller_uid::text;
        
        -- Look up verified display name from public.profiles
        SELECT full_name INTO v_actor_display_name
        FROM public.profiles
        WHERE id = v_caller_uid;
        
        IF v_actor_display_name IS NULL OR trim(v_actor_display_name) = '' THEN
            v_actor_display_name := COALESCE(
                current_setting('request.jwt.claim.name', true),
                p_actor_display_name,
                'เจ้าหน้าที่'
            );
        END IF;
    ELSIF current_user = 'service_role' OR auth.role() = 'service_role' THEN
        -- Service role execution (e.g. backend worker / admin CLI)
        v_actor_user_id := COALESCE(p_actor_user_id, 'service_role');
        v_actor_display_name := COALESCE(p_actor_display_name, 'ระบบ (Service Role)');
    ELSE
        -- Anon or unauthenticated caller: strictly blocked!
        RAISE EXCEPTION 'FORBIDDEN: Anonymous users are strictly prohibited from executing payment refunds';
    END IF;

    -- 1. Validate inputs
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'INVALID_AMOUNT: Refund amount must be greater than 0';
    END IF;

    IF p_reason IS NULL OR trim(p_reason) = '' THEN
        RAISE EXCEPTION 'REASON_REQUIRED: Reason is strictly required for refund';
    END IF;

    -- 2. Row Lock Bill FOR UPDATE
    SELECT * INTO v_bill
    FROM public.bills
    WHERE id = p_bill_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BILL_NOT_FOUND: Bill with id % does not exist', p_bill_id;
    END IF;

    -- 3. Validate Original Payment Transaction
    IF p_original_tx_id IS NOT NULL AND trim(p_original_tx_id) <> '' THEN
        SELECT * INTO v_orig_tx
        FROM public.statement_transactions
        WHERE id = p_original_tx_id AND bill_id = p_bill_id AND type = 'INCOME' AND is_deposit = false;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'ORIGINAL_TX_NOT_FOUND: Original payment transaction % not found for bill %',
                p_original_tx_id, p_bill_id;
        END IF;

        -- Sum prior refunds for this specific transaction
        SELECT COALESCE(SUM(expense_amount), 0) INTO v_total_refunded_for_tx
        FROM public.statement_transactions
        WHERE original_tx_id = p_original_tx_id AND type = 'EXPENSE' AND is_deposit = false;

        IF (v_total_refunded_for_tx + p_amount) > (v_orig_tx.income_amount + 0.001) THEN
            RAISE EXCEPTION 'REFUND_EXCEEDS_ORIGINAL_TX: Refund amount % exceeds remaining amount of original payment (% available)',
                p_amount, (v_orig_tx.income_amount - v_total_refunded_for_tx);
        END IF;

        -- Default refund channel = original transaction channel
        v_channel := COALESCE(p_channel, v_orig_tx.channel, 'โอนเงิน');
    ELSE
        v_channel := COALESCE(p_channel, 'โอนเงิน');
    END IF;

    -- 4. Calculate Net Paid across all service payments for this bill from Transaction History
    SELECT COALESCE(
        SUM(CASE WHEN type = 'INCOME' THEN income_amount ELSE 0 END) -
        SUM(CASE WHEN type = 'EXPENSE' THEN expense_amount ELSE 0 END),
        0
    ) INTO v_net_paid
    FROM public.statement_transactions
    WHERE bill_id = p_bill_id AND is_deposit = false;

    IF p_amount > (v_net_paid + 0.001) THEN
        RAISE EXCEPTION 'REFUND_EXCEEDS_NET_PAID: Refund amount % exceeds net paid amount %',
            p_amount, v_net_paid;
    END IF;

    -- 5. Calculate New Balances based on transaction history (NOT relying on bill.paid_amount as truth)
    v_new_paid := GREATEST(0, v_net_paid - p_amount);
    v_new_outstanding := GREATEST(0, v_bill.grand_total - v_new_paid);
    v_new_payment_status := CASE WHEN v_new_paid <= 0 THEN 'REFUNDED' ELSE 'REFUND_PARTIAL' END;

    -- 6. Generate Collision-Proof Identifiers
    v_date_str := to_char(now(), 'YYYYMMDD');
    v_tx_id := 'tx-ref-' || gen_random_uuid()::text;
    v_ref_no := 'REF-' || v_bill.bill_no || '-' || lpad(nextval('public.receipt_no_seq')::text, 4, '0');

    -- 7. Insert Statement Transaction (Append-only)
    INSERT INTO public.statement_transactions (
        id,
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
        original_tx_id,
        correlation_id,
        is_deposit,
        created_at
    ) VALUES (
        v_tx_id,
        now(),
        v_ref_no,
        'EXPENSE',
        'คืนเงินลูกค้า',
        'คืนเงินรับชำระ บิลเลขที่ ' || v_bill.bill_no || ': ' || p_reason,
        v_bill.customer_name,
        0,
        p_amount,
        0,
        v_channel,
        v_bill.id,
        v_bill.bill_no,
        p_original_tx_id,
        v_correlation_id,
        false,
        now()
    );

    -- 8. Update Bill
    UPDATE public.bills
    SET paid_amount = v_new_paid,
        outstanding_amount = v_new_outstanding,
        payment_status = v_new_payment_status,
        updated_at = now()
    WHERE id = p_bill_id;

    -- 9. Audit Log
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
        'PAYMENT_REFUND',
        'FINANCE',
        v_tx_id,
        jsonb_build_object(
            'billNo', v_bill.bill_no,
            'paidAmount', v_bill.paid_amount,
            'netPaid', v_net_paid
        ),
        jsonb_build_object(
            'billNo', v_bill.bill_no,
            'amount', p_amount,
            'paidAmount', v_new_paid,
            'outstandingAmount', v_new_outstanding,
            'paymentStatus', v_new_payment_status,
            'channel', v_channel,
            'reason', p_reason,
            'originalTxId', p_original_tx_id
        ),
        v_correlation_id,
        now()
    );

    -- 10. Fetch Updated Bill
    SELECT * INTO v_bill FROM public.bills WHERE id = p_bill_id;

    RETURN jsonb_build_object(
        'status', 'SUCCESS',
        'refund_tx_id', v_tx_id,
        'ref_no', v_ref_no,
        'amount', p_amount,
        'channel', v_channel,
        'paid_amount_after', v_new_paid,
        'outstanding_after', v_new_outstanding,
        'bill', to_jsonb(v_bill)
    );
END;
$$;

-- Security Hardening: Strictly REVOKE from anon and PUBLIC, GRANT only to authenticated and service_role
REVOKE ALL ON FUNCTION public.process_payment_refund_rpc(TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_payment_refund_rpc(TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.process_payment_refund_rpc(TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
