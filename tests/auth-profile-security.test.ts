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

  describe('10. Legacy Signup Trigger & Function neutralization', () => {
    it('1. drops legacy trigger on_auth_user_created on auth.users', () => {
      expect(migrationSql).toMatch(/DROP\s+TRIGGER\s+IF\s+EXISTS\s+on_auth_user_created\s+ON\s+auth\.users/i)
    })

    it('2. ensures no trigger calls legacy handle_new_user()', () => {
      const lines = migrationSql.split('\n')
      const callingLegacy = lines.filter(line => {
        const trimmed = line.trim()
        if (trimmed.startsWith('--')) return false
        return /EXECUTE\s+(FUNCTION|PROCEDURE)\s+.*handle_new_user\b/i.test(trimmed)
      })
      expect(callingLegacy).toHaveLength(0)
    })

    it('3. ensures canonical trigger on_auth_user_created_create_profile calls handle_new_auth_user_profile()', () => {
      expect(migrationSql).toMatch(
        /CREATE\s+TRIGGER\s+on_auth_user_created_create_profile\s+AFTER\s+INSERT\s+ON\s+auth\.users\s+FOR\s+EACH\s+ROW\s+EXECUTE\s+FUNCTION\s+public\.handle_new_auth_user_profile\(\)/i
      )
    })

    it('4. ensures legacy handle_new_user function is dropped', () => {
      expect(migrationSql).toMatch(/DROP\s+FUNCTION\s+IF\s+EXISTS\s+public\.handle_new_user\(\)/i)
    })
  })

  describe('11. Canonical Profile Schema convergence', () => {
    it('5. ensures user_id column is added and backfilled from id', () => {
      expect(migrationSql).toMatch(/ALTER\s+TABLE\s+public\.profiles\s+ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+user_id\s+UUID/i)
      expect(migrationSql).toMatch(/UPDATE\s+public\.profiles\s+SET\s+user_id\s*=\s*id\s+WHERE\s+user_id\s+IS\s+NULL/i)
    })

    it('6. ensures status column is added with DEFAULT "ACTIVE"', () => {
      expect(migrationSql).toMatch(/ALTER\s+TABLE\s+public\.profiles\s+ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+status\s+TEXT\s+DEFAULT\s+'ACTIVE'/i)
    })

    it('7. ensures is_approved column is added with DEFAULT true', () => {
      expect(migrationSql).toMatch(/ALTER\s+TABLE\s+public\.profiles\s+ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+is_approved\s+BOOLEAN\s+DEFAULT\s+true/i)
    })

    it('8. ensures display_name column is added', () => {
      expect(migrationSql).toMatch(/ALTER\s+TABLE\s+public\.profiles\s+ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+display_name\s+TEXT/i)
    })
  })

  describe('12. Canonical Profile Insert logic inside handle_new_auth_user_profile', () => {
    const insertMatch = migrationSql.match(
      /INSERT\s+INTO\s+public\.profiles\s*\(([\s\S]*?)\)\s*VALUES\s*\(([\s\S]*?)\)\s*ON\s+CONFLICT/i
    )
    const columns = insertMatch
      ? insertMatch[1]
          .split(',')
          .map(c => c.trim().toLowerCase())
          .filter(Boolean)
      : []
    const values = insertMatch
      ? insertMatch[2]
          .split(',')
          .map(v => v.trim())
          .filter(Boolean)
      : []

    it('9. canonical insert uses user_id = NEW.id', () => {
      expect(columns).toContain('user_id')
      const userIdIdx = columns.indexOf('user_id')
      expect(values[userIdIdx]).toBe('NEW.id')
    })

    it('10. canonical insert sets role to USER', () => {
      expect(columns).toContain('role')
      const roleIdx = columns.indexOf('role')
      expect(values[roleIdx]).toBe("'USER'")
    })

    it('11. canonical insert does NOT use full_name', () => {
      expect(columns).not.toContain('full_name')
    })

    it('12. canonical insert does NOT use business_id', () => {
      expect(columns).not.toContain('business_id')
    })
  })

  describe('13. Updated-at trigger reconciliation & single canonical trigger', () => {
    it('13. drops legacy trigger on_profile_updated', () => {
      expect(migrationSql).toMatch(/DROP\s+TRIGGER\s+IF\s+EXISTS\s+on_profile_updated\s+ON\s+public\.profiles/i)
    })

    it('14. drops duplicate trigger set_profiles_updated_at', () => {
      expect(migrationSql).toMatch(/DROP\s+TRIGGER\s+IF\s+EXISTS\s+set_profiles_updated_at\s+ON\s+public\.profiles/i)
    })

    it('15. creates single canonical trigger trg_profiles_updated_at on public.profiles', () => {
      expect(migrationSql).toMatch(
        /CREATE\s+TRIGGER\s+trg_profiles_updated_at\s+BEFORE\s+UPDATE\s+ON\s+public\.profiles\s+FOR\s+EACH\s+ROW\s+EXECUTE\s+FUNCTION\s+public\.set_profiles_updated_at\(\)/i
      )

      // Ensure only single canonical CREATE TRIGGER on public.profiles exists
      const profileTriggerMatches = Array.from(
        migrationSql.matchAll(/CREATE\s+TRIGGER\s+(\w+)\s+[^;]*?ON\s+public\.profiles/gi)
      )
      expect(profileTriggerMatches).toHaveLength(1)
      expect(profileTriggerMatches[0][1]).toBe('trg_profiles_updated_at')
    })
  })

  describe('14. Complete absence of Finance RPCs in migration', () => {
    it('16. contains no Finance RPCs (process_split_payment_rpc, process_payment_refund_rpc, etc.)', () => {
      expect(migrationSql).not.toContain('process_split_payment_rpc')
      expect(migrationSql).not.toContain('process_payment_refund_rpc')
      expect(migrationSql).not.toContain('create_finance_entry')
      const lines = migrationSql.split('\n')
      const activeRpcLines = lines.filter(line => {
        const trimmed = line.trim()
        if (trimmed.startsWith('--')) return false
        return /FUNCTION\s+.*finance/i.test(trimmed) || /RPC/i.test(trimmed)
      })
      expect(activeRpcLines).toHaveLength(0)
    })
  })
})
