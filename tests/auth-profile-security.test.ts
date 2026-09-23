import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { buildCurrentUser } from '@/lib/auth-utils'

const MIGRATION_FILENAME = '20260923150637_harden_auth_profile_permissions.sql'
const migrationFilePath = path.resolve(process.cwd(), 'supabase', 'migrations', MIGRATION_FILENAME)

describe('Auth Profile Security Hardening Migration & Privileges', () => {
  const fileExists = fs.existsSync(migrationFilePath)
  const migrationSql = fileExists ? fs.readFileSync(migrationFilePath, 'utf-8') : ''

  it('verifies the harden_auth_profile_permissions migration file exists with CLI timestamp', () => {
    expect(fileExists).toBe(true)
    expect(migrationSql.length).toBeGreaterThan(100)
  })

  describe('1. anon table privileges on public.profiles', () => {
    it('revokes all table-level privileges from anon', () => {
      expect(migrationSql).toMatch(/REVOKE\s+ALL\s+ON\s+TABLE\s+public\.profiles\s+FROM\s+([^\n;]*\b)?anon\b/i)
    })

    it('does not grant any SELECT, INSERT, UPDATE, DELETE, or ALL to anon on public.profiles', () => {
      // Must not contain any GRANT ... ON ... public.profiles TO anon
      const lines = migrationSql.split('\n')
      const anonGrants = lines.filter(line => {
        const trimmed = line.trim()
        if (trimmed.startsWith('--')) return false
        return /GRANT\s+.*\s+ON\s+.*profiles\s+TO\s+.*anon/i.test(trimmed)
      })
      expect(anonGrants).toHaveLength(0)
    })
  })

  describe('2. authenticated SELECT privilege on public.profiles', () => {
    it('grants SELECT on public.profiles to authenticated (governed by RLS)', () => {
      expect(migrationSql).toMatch(/GRANT\s+SELECT\s+ON\s+TABLE\s+public\.profiles\s+TO\s+authenticated/i)
    })
  })

  describe('3. authenticated column-level UPDATE restrictions', () => {
    it('grants UPDATE only on non-security columns (first_name, last_name, display_name, avatar_url)', () => {
      expect(migrationSql).toMatch(
        /GRANT\s+UPDATE\s*\(\s*first_name\s*,\s*last_name\s*,\s*display_name\s*,\s*avatar_url\s*\)\s*ON\s+TABLE\s+public\.profiles\s+TO\s+authenticated/i
      )
    })

    it('ensures no table-level unconstrained UPDATE is granted to authenticated', () => {
      const lines = migrationSql.split('\n')
      const unconstrainedUpdate = lines.filter(line => {
        const trimmed = line.trim()
        if (trimmed.startsWith('--')) return false
        // Matches GRANT UPDATE ON TABLE public.profiles TO authenticated (without column list)
        return /GRANT\s+UPDATE\s+ON\s+TABLE\s+public\.profiles\s+TO\s+.*authenticated/i.test(trimmed)
      })
      expect(unconstrainedUpdate).toHaveLength(0)
    })
  })

  describe('4. Protection of sensitive profile columns against UPDATE', () => {
    const sensitiveColumns = [
      'role',
      'status',
      'is_approved',
      'email',
      'username',
      'id',
      'user_id',
      'created_at',
      'updated_at',
    ]

    sensitiveColumns.forEach(column => {
      it(`does not grant UPDATE on "${column}" to authenticated, anon, or PUBLIC`, () => {
        const lines = migrationSql.split('\n')
        const forbiddenGrants = lines.filter(line => {
          const trimmed = line.trim()
          if (trimmed.startsWith('--')) return false
          const isGrantUpdate = /GRANT\s+UPDATE/i.test(trimmed)
          const targetsDangerousRole = /(authenticated|anon|PUBLIC)/i.test(trimmed)
          const mentionsColumn = new RegExp(`\\b${column}\\b`, 'i').test(trimmed)
          return isGrantUpdate && targetsDangerousRole && mentionsColumn
        })
        expect(forbiddenGrants).toHaveLength(0)
      })
    })
  })

  describe('5. Trigger function handle_new_auth_user_profile hardening', () => {
    it('is SECURITY DEFINER with fixed search_path = public, pg_temp', () => {
      expect(migrationSql).toMatch(/FUNCTION\s+public\.handle_new_auth_user_profile/i)
      expect(migrationSql).toMatch(/SECURITY\s+DEFINER/i)
      expect(migrationSql).toMatch(/SET\s+search_path\s*=\s*public\s*,\s*pg_temp/i)
    })

    it('reads standard profile metadata (email, username, first_name, last_name, display_name)', () => {
      expect(migrationSql).toMatch(/raw_user_meta_data->>'first_name'/i)
      expect(migrationSql).toMatch(/raw_user_meta_data->>'last_name'/i)
      expect(migrationSql).toMatch(/raw_user_meta_data->>'username'/i)
      expect(migrationSql).toMatch(/raw_user_meta_data->>'display_name'/i)
    })

    it('strictly assigns default role "USER" and does NOT read raw_user_meta_data for role', () => {
      expect(migrationSql).not.toMatch(/raw_user_meta_data->>'role'/i)
      expect(migrationSql).toMatch(/'USER'/i)
    })

    it('revokes EXECUTE on handle_new_auth_user_profile from PUBLIC, anon, and authenticated', () => {
      expect(migrationSql).toMatch(/REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.handle_new_auth_user_profile\(\)\s+FROM\s+([^\n;]*\b)?PUBLIC\b/i)
      expect(migrationSql).toMatch(/REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.handle_new_auth_user_profile\(\)\s+FROM\s+([^\n;]*\b)?anon\b/i)
      expect(migrationSql).toMatch(/REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.handle_new_auth_user_profile\(\)\s+FROM\s+([^\n;]*\b)?authenticated\b/i)
    })
  })

  describe('6. Trigger function set_profiles_updated_at search_path & logic', () => {
    it('has fixed search_path = public, pg_temp', () => {
      expect(migrationSql).toMatch(/FUNCTION\s+public\.set_profiles_updated_at/i)
      expect(migrationSql).toMatch(/SET\s+search_path\s*=\s*public\s*,\s*pg_temp/i)
    })

    it('maintains updated_at = now() and RETURN NEW logic', () => {
      expect(migrationSql).toMatch(/NEW\.updated_at\s*=\s*now\(\)/i)
      expect(migrationSql).toMatch(/RETURN\s+NEW/i)
    })
  })

  describe('7. Trigger function set_profiles_updated_at execution permissions', () => {
    it('revokes EXECUTE on set_profiles_updated_at from PUBLIC, anon, and authenticated', () => {
      expect(migrationSql).toMatch(/REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.set_profiles_updated_at\(\)\s+FROM\s+([^\n;]*\b)?PUBLIC\b/i)
      expect(migrationSql).toMatch(/REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.set_profiles_updated_at\(\)\s+FROM\s+([^\n;]*\b)?anon\b/i)
      expect(migrationSql).toMatch(/REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.set_profiles_updated_at\(\)\s+FROM\s+([^\n;]*\b)?authenticated\b/i)
    })
  })

  describe('8. Finance RPC isolation (must NOT be touched)', () => {
    it('strictly does not mention or alter process_split_payment_rpc', () => {
      expect(migrationSql).not.toContain('process_split_payment_rpc')
    })

    it('strictly does not mention or alter process_payment_refund_rpc', () => {
      expect(migrationSql).not.toContain('process_payment_refund_rpc')
    })
  })

  describe('9. Application Role Trust defense-in-depth verification', () => {
    it('ensures buildCurrentUser defaults to USER even if client attempts metadata role spoofing', () => {
      const spoofedAuthUser = {
        id: 'usr-attacker-01',
        email: 'attacker@example.com',
        user_metadata: { role: 'OWNER' },
      }
      // Without profiles.role === 'OWNER', role must strictly be USER
      const user = buildCurrentUser(spoofedAuthUser, { role: 'USER' })
      expect(user.role).toBe('USER')

      // Even if profile is missing entirely
      const userNoProfile = buildCurrentUser(spoofedAuthUser, null)
      expect(userNoProfile.role).toBe('USER')
    })
  })
})
