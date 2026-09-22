-- Migration: Payment Refund & Financial Integrity System (Workset 3)
-- Purpose: Implement atomic RPC transaction for payment refunds, enforcing net paid limits,
-- append-only ledger history, idempotency, and audit logging.

CREATE OR REPLACE FUNCTION public.process_payment_refund_rpc(
    p_bill_id TEXT,
    p_original_tx_id TEXT,
    p_amount NUMERIC(12,2),
    p_channel TEXT DEFAULT NULL,
    p_reason TEXT DEFAULT 'คืนเงินลูกค้า',
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
    -- 1. Validate inputs
    IF p_amount <= 0 THEN
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
    IF p_original_tx_id IS NOT NULL AND p_original_tx_id <> '' THEN
        SELECT * INTO v_orig_tx
        FROM public.statement_transactions
        WHERE id = p_original_tx_id AND bill_id = p_bill_id AND type = 'INCOME';

        IF NOT FOUND THEN
            RAISE EXCEPTION 'ORIGINAL_TX_NOT_FOUND: Original payment transaction % not found for bill %',
                p_original_tx_id, p_bill_id;
        END IF;

        -- Sum prior refunds for this specific transaction
        SELECT COALESCE(SUM(expense_amount), 0) INTO v_total_refunded_for_tx
        FROM public.statement_transactions
        WHERE original_tx_id = p_original_tx_id AND type = 'EXPENSE';

        IF (v_total_refunded_for_tx + p_amount) > (v_orig_tx.income_amount + 0.001) THEN
            RAISE EXCEPTION 'REFUND_EXCEEDS_ORIGINAL_TX: Refund amount % exceeds remaining amount of original payment (% available)',
                p_amount, (v_orig_tx.income_amount - v_total_refunded_for_tx);
        END IF;

        v_channel := COALESCE(p_channel, v_orig_tx.channel, 'โอนเงิน');
    ELSE
        v_channel := COALESCE(p_channel, 'โอนเงิน');
    END IF;

    -- 4. Calculate Net Paid across all service payments for this bill
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

    -- 5. Calculate New Balances
    v_new_paid := GREATEST(0, v_bill.paid_amount - p_amount);
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
        p_actor_user_id,
        p_actor_display_name,
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

GRANT EXECUTE ON FUNCTION public.process_payment_refund_rpc TO authenticated, anon, service_role;
