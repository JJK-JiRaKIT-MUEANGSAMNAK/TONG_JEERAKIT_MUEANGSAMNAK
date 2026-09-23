-- Migration: harden_auth_profile_permissions
-- File: 20260923150637_harden_auth_profile_permissions.sql
-- Purpose:
-- 1. Reconcile canonical profile schema:
--    - Ensure user_id, status, is_approved, display_name columns exist
--    - Backfill user_id from id for existing rows
--    - Ensure role default is 'USER' and check constraint supports 'OWNER' and 'USER'
--    - Relax legacy full_name NOT NULL constraint so legacy schema doesn't block inserts
-- 2. Restrict public.profiles privileges:
--    - Revoke table-level privileges from PUBLIC, anon, and authenticated
--    - Grant SELECT to authenticated (protected by RLS)
--    - Grant column-level UPDATE ONLY for: first_name, last_name, display_name, avatar_url
--    - Disallow authenticated updates to: id, user_id, email, username, role, status, is_approved, created_at, updated_at
-- 3. Hardened & canonical trigger function public.handle_new_auth_user_profile():
--    - Neutralize legacy signup flow: DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users
--    - Drop legacy function: DROP FUNCTION IF EXISTS public.handle_new_user()
--    - Maintain SECURITY DEFINER with fixed search_path = public, pg_temp
--    - Insert canonical columns: id, user_id, email, username, first_name, last_name, display_name, avatar_url, role, status, is_approved, created_at, updated_at
--    - user_id = NEW.id, role = 'USER', status = 'ACTIVE', is_approved = true
--    - Strictly exclude legacy full_name, business_id, and metadata role
--    - Ensure single canonical trigger: on_auth_user_created_create_profile ON auth.users
--    - Revoke EXECUTE from PUBLIC, anon, and authenticated
-- 4. Hardened & canonical trigger function public.set_profiles_updated_at():
--    - Fixed search_path = public, pg_temp
--    - Neutralize legacy & duplicate updated_at triggers: on_profile_updated, set_profiles_updated_at, trg_profiles_updated_at
--    - Drop legacy function: DROP FUNCTION IF EXISTS public.handle_profile_updated_at()
--    - Ensure single canonical trigger: trg_profiles_updated_at ON public.profiles
--    - Revoke EXECUTE from PUBLIC, anon, and authenticated
-- 5. Exclude Finance RPCs completely (deferred to finance security batch)

-- ============================================================================
-- 1. Schema compatibility adjustments for public.profiles
-- ============================================================================

-- Ensure canonical columns exist on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Backfill user_id from id for existing rows
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

-- Ensure role default is 'USER'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'USER';

-- Ensure role check constraint allows OWNER and USER
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.profiles'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%role%OWNER%USER%'
    ) THEN
        BEGIN
            ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('OWNER', 'USER'));
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

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

-- Grant SELECT to authenticated (RLS policy controls row visibility)
GRANT SELECT ON TABLE public.profiles TO authenticated;

-- Grant column-level UPDATE on non-sensitive profile fields only
GRANT UPDATE (first_name, last_name, display_name, avatar_url) ON TABLE public.profiles TO authenticated;

-- Preserve full administrative permissions for service_role
GRANT ALL ON TABLE public.profiles TO service_role;

-- ============================================================================
-- 3. Harden signup trigger & function public.handle_new_auth_user_profile()
-- ============================================================================

-- Drop legacy trigger on auth.users if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop legacy function public.handle_new_user() safely
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create or replace canonical signup trigger function
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
        user_id,
        email,
        username,
        first_name,
        last_name,
        display_name,
        avatar_url,
        role,
        status,
        is_approved,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        v_username,
        v_first_name,
        v_last_name,
        v_display_name,
        NEW.raw_user_meta_data->>'avatar_url',
        'USER',
        'ACTIVE',
        true,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
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

-- Ensure canonical signup trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_create_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user_profile();

-- ============================================================================
-- 4. Harden updated_at trigger & function public.set_profiles_updated_at()
-- ============================================================================

-- Drop legacy and duplicate triggers on public.profiles
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;

-- Drop legacy handle_profile_updated_at function if exists
DROP FUNCTION IF EXISTS public.handle_profile_updated_at();

-- Create or replace canonical set_profiles_updated_at function
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

-- Ensure single canonical trigger on public.profiles
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_profiles_updated_at();
