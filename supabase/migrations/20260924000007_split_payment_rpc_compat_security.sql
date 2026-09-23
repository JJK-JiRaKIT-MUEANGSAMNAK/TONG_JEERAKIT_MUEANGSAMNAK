-- Reconcile the legacy 8-argument split-payment RPC used by the runtime.
-- The secure 6-argument implementation from migration 01 becomes an internal core.
-- Browser-supplied actor fields remain accepted for API compatibility but are ignored.

DO $rename_core$
BEGIN
  IF to_regprocedure('public.process_split_payment_rpc(text,text,text,jsonb,timestamptz,text)') IS NOT NULL
     AND to_regprocedure('public.process_split_payment_rpc_secure(text,text,text,jsonb,timestamptz,text)') IS NULL THEN
    ALTER FUNCTION public.process_split_payment_rpc(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT)
      RENAME TO process_split_payment_rpc_secure;
  END IF;
END;
$rename_core$;

REVOKE ALL ON FUNCTION public.process_split_payment_rpc_secure(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_split_payment_rpc_secure(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.process_split_payment_rpc_secure(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_split_payment_rpc_secure(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.process_split_payment_rpc(
    p_bill_id TEXT,
    p_request_id TEXT,
    p_payload_hash TEXT,
    p_tenders JSONB,
    p_payment_date TIMESTAMPTZ DEFAULT now(),
    p_actor_user_id TEXT DEFAULT NULL,
    p_actor_display_name TEXT DEFAULT NULL,
    p_correlation_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $split_wrapper$
DECLARE
    v_caller_uid UUID;
    v_caller_role TEXT;
BEGIN
    v_caller_uid := auth.uid();
    v_caller_role := auth.role();

    IF v_caller_uid IS NULL AND COALESCE(v_caller_role, '') <> 'service_role' THEN
        RAISE EXCEPTION 'FORBIDDEN: Anonymous users are strictly prohibited';
    END IF;

    -- p_actor_user_id and p_actor_display_name are intentionally ignored.
    -- The secure core resolves actor identity from auth.uid()/service_role.
    RETURN public.process_split_payment_rpc_secure(
        p_bill_id,
        p_request_id,
        p_payload_hash,
        p_tenders,
        p_payment_date,
        p_correlation_id
    );
END;
$split_wrapper$;

REVOKE ALL ON FUNCTION public.process_split_payment_rpc(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_split_payment_rpc(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.process_split_payment_rpc(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_split_payment_rpc(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT, TEXT, TEXT) TO authenticated, service_role;
