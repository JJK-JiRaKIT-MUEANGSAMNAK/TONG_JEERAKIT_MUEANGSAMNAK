-- Migration: harden_auth_profile_permissions
-- File: 20260923150637_harden_auth_profile_permissions.sql
-- Purpose:
-- 1. Restrict public.profiles privileges:
--    - Revoke table-level privileges from PUBLIC, anon, and authenticated
--    - Grant SELECT to authenticated (protected by RLS profiles_select_own)
--    - Grant column-level UPDATE ONLY for: first_name, last_name, display_name, avatar_url
--    - Disallow authenticated updates to: id, user_id, email, username, role, status, is_approved, created_at, updated_at
-- 2. Harden trigger function public.handle_new_auth_user_profile():
--    - Maintain SECURITY DEFINER with fixed search_path = public, pg_temp
--    - Extract: email, username, first_name, last_name, display_name
--    - Maintain role = 'USER' default (never trust metadata.role)
--    - Revoke EXECUTE from PUBLIC, anon, and authenticated
-- 3. Harden trigger function public.set_profiles_updated_at():
--    - Set fixed search_path = public, pg_temp
--    - Update new.updated_at = now() and return new
--    - Revoke EXECUTE from PUBLIC, anon, and authenticated
-- 4. Exclude Finance RPCs completely (deferred to finance security batch)

-- ============================================================================
-- 1. Schema compatibility adjustments for public.profiles
-- ============================================================================

-- Ensure display_name column exists on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Ensure full_name column from early schemas does not block inserts if missing
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;
    END IF;
END $$;

-- Enable Row Level Security (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. Table-level privilege hardening on public.profiles
-- ============================================================================

-- Revoke all wide table privileges from anon, authenticated, and PUBLIC
REVOKE ALL ON TABLE public.profiles FROM PUBLIC;
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.profiles FROM authenticated;

-- Grant SELECT to authenticated (RLS policy profiles_select_own controls row visibility)
GRANT SELECT ON TABLE public.profiles TO authenticated;

-- Grant column-level UPDATE on non-sensitive profile fields only
GRANT UPDATE (first_name, last_name, display_name, avatar_url) ON TABLE public.profiles TO authenticated;

-- Preserve full administrative permissions for service_role
GRANT ALL ON TABLE public.profiles TO service_role;

-- ============================================================================
-- 3. Harden trigger function public.handle_new_auth_user_profile()
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_first_name TEXT;
    v_last_name TEXT;
    v_display_name TEXT;
    v_username TEXT;
BEGIN
    v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    v_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    v_username := LOWER(COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)));
    v_display_name := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NULLIF(TRIM(v_first_name || ' ' || v_last_name), ''),
        v_username,
        SPLIT_PART(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (
        id,
        username,
        email,
        first_name,
        last_name,
        display_name,
        role,
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        v_username,
        NEW.email,
        v_first_name,
        v_last_name,
        v_display_name,
        'USER',
        NEW.raw_user_meta_data->>'avatar_url',
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = now();
    RETURN NEW;
END;
$$;

-- Revoke direct execution of handle_new_auth_user_profile from PUBLIC, anon, and authenticated
REVOKE ALL ON FUNCTION public.handle_new_auth_user_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_auth_user_profile() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_auth_user_profile() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_auth_user_profile() TO service_role;

-- ============================================================================
-- 4. Harden trigger function public.set_profiles_updated_at()
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Revoke direct execution of set_profiles_updated_at from PUBLIC, anon, and authenticated
REVOKE ALL ON FUNCTION public.set_profiles_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_profiles_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.set_profiles_updated_at() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.set_profiles_updated_at() TO service_role;

-- Ensure trigger exists on public.profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_profiles_updated_at();
