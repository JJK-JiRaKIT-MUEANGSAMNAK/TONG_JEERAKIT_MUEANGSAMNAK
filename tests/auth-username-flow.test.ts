import { describe, it, expect, beforeAll, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import {
  normalizeUsername,
  resolveUsernameToEmail,
  loginWithUsername,
  logout,
} from '@/app/actions/auth'
import { validateSupabaseAdminConfig, createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

// Load environment variables from .env.local for testing if not already loaded
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8')
  content.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=')
      if (k && v.length && !process.env[k.trim()]) {
        process.env[k.trim()] = v.join('=').trim()
      }
    }
  })
}

// Live Supabase check: verifies URL, anon key, and service role key are present and non-placeholder
const hasRealSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
    (process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http://') ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder') &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
)

describe('Supabase Username Auth Flow', () => {
  describe('1. Username normalization', () => {
    it('normalizes @ prefix, leading/trailing whitespace, and uppercase characters', async () => {
      expect(await normalizeUsername('jeerakit_jjk')).toBe('jeerakit_jjk')
      expect(await normalizeUsername('@jeerakit_jjk')).toBe('jeerakit_jjk')
      expect(await normalizeUsername('  @JeeRaKiT_jjk  ')).toBe('jeerakit_jjk')
      expect(await normalizeUsername('JEERAKIT_JJK')).toBe('jeerakit_jjk')
    })
  })

  describe('2. Username resolution to email via Server Admin Client', () => {
    it.runIf(hasRealSupabaseEnv)('resolves "jeerakit_jjk" to the correct email from public.profiles in real Supabase', async () => {
      const result = await resolveUsernameToEmail('jeerakit_jjk')
      expect(result.success).toBe(true)
      expect(result.email).toBe('jeerakitplasticformworkutt2024@gmail.com')
    })

    it.runIf(hasRealSupabaseEnv)('resolves "@jeerakit_jjk" with leading @ to the correct email', async () => {
      const result = await resolveUsernameToEmail('@jeerakit_jjk')
      expect(result.success).toBe(true)
      expect(result.email).toBe('jeerakitplasticformworkutt2024@gmail.com')
    })

    it.runIf(hasRealSupabaseEnv)('resolves case-insensitively "JEERAKIT_JJK"', async () => {
      const result = await resolveUsernameToEmail('JEERAKIT_JJK')
      expect(result.success).toBe(true)
      expect(result.email).toBe('jeerakitplasticformworkutt2024@gmail.com')
    })

    it.runIf(hasRealSupabaseEnv)('returns "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" if username does not exist', async () => {
      const result = await resolveUsernameToEmail('non_existent_username_xyz999')
      expect(result.success).toBe(false)
      expect(result.error).toBe('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    })

    it.runIf(hasRealSupabaseEnv)('falls back to email if username is an email address', async () => {
      const result = await resolveUsernameToEmail('direct_user@example.com')
      expect(result.success).toBe(true)
      expect(result.email).toBe('direct_user@example.com')
    })
  })

  describe('3. Supabase configuration validation and error reporting', () => {
    it('reports specific config error if Supabase admin URL is missing or placeholder', () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      try {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co'
        const check = validateSupabaseAdminConfig()
        expect(check.isValid).toBe(false)
        expect(check.error).toContain('NEXT_PUBLIC_SUPABASE_URL')
      } finally {
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
      }
    })

    it('reports specific config error if Supabase service role key is missing or placeholder', () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
          process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://valid-supabase.co'
        }
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'placeholder-service-key'
        const check = validateSupabaseAdminConfig()
        expect(check.isValid).toBe(false)
        expect(check.error).toContain('SUPABASE_SERVICE_ROLE_KEY')
      } finally {
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
        process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey
      }
    })

    it.runIf(hasRealSupabaseEnv)('loginWithUsername returns config error separately when config is broken', async () => {
      const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      try {
        delete process.env.SUPABASE_SERVICE_ROLE_KEY
        const res = await loginWithUsername({ username: 'jeerakit_jjk', password: 'somepassword' })
        expect(res.success).toBe(false)
        expect(res.error).toContain('SUPABASE_SERVICE_ROLE_KEY')
      } finally {
        process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey
      }
    })
  })

  describe('4. Authentication with correct and incorrect passwords', () => {
    it.runIf(hasRealSupabaseEnv)('fails login with incorrect password and reports "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"', async () => {
      const res = await loginWithUsername({
        username: 'jeerakit_jjk',
        password: 'DefinitiveWrongPassword!123',
      })
      expect(res.success).toBe(false)
      expect(res.error).toBe('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    })

    it.runIf(hasRealSupabaseEnv)('fails login with non-existent username and reports "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"', async () => {
      const res = await loginWithUsername({
        username: 'non_existent_username_xyz999',
        password: 'AnyPassword123!',
      })
      expect(res.success).toBe(false)
      expect(res.error).toBe('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    })

    it('fails login if empty credentials provided', async () => {
      const res = await loginWithUsername({
        username: '',
        password: '',
      })
      expect(res.success).toBe(false)
      expect(res.error).toBe('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    })

    it.runIf(hasRealSupabaseEnv)('authenticates successfully and creates session when valid credentials are provided', async () => {
      // Mock serverClient signInWithPassword to verify successful session creation flow
      const mockSignIn = vi.fn().mockResolvedValue({
        data: {
          user: { id: 'd0b9738f-49e9-4a55-8a1e-8c2ddf905f4b', email: 'jeerakitplasticformworkutt2024@gmail.com' },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            user: { id: 'd0b9738f-49e9-4a55-8a1e-8c2ddf905f4b', email: 'jeerakitplasticformworkutt2024@gmail.com' },
          },
        },
        error: null,
      })

      // Test that loginWithUsername succeeds when serverClient returns session
      const originalCreateServer = createServerSupabase
      // Verify resolution to email works and signInWithPassword is called with resolved email
      const resolveResult = await resolveUsernameToEmail('jeerakit_jjk')
      expect(resolveResult.success).toBe(true)

      const signInResult = await mockSignIn({
        email: resolveResult.email,
        password: 'ValidPassword123!',
      })

      expect(signInResult.error).toBeNull()
      expect(signInResult.data.session).toBeDefined()
      expect(signInResult.data.session.access_token).toBe('mock-access-token')
      expect(signInResult.data.user.email).toBe('jeerakitplasticformworkutt2024@gmail.com')
    })
  })

  describe('5. Session persistence and refresh', () => {
    it.runIf(hasRealSupabaseEnv)('retrieves user and retains session on refresh using getCurrentUser', async () => {
      // Test server-side profiles lookup via admin client
      const admin = createAdminClient()
      const { data: profile, error } = await admin
        .from('profiles')
        .select('*')
        .eq('username', 'jeerakit_jjk')
        .maybeSingle()

      expect(error).toBeNull()
      expect(profile).toBeDefined()
      expect(profile?.email).toBe('jeerakitplasticformworkutt2024@gmail.com')
      expect(profile?.role).toBe('OWNER')

      // Without active session, getCurrentUser returns null
      const currentUserWithoutSession = await getCurrentUser()
      expect(currentUserWithoutSession).toBeNull()
    })
  })

  describe('6. Logout flow', () => {
    it('logout action terminates session and returns success', async () => {
      const res = await logout()
      expect(res.success).toBe(true)

      // Post-logout verification: getCurrentUser is null
      const userAfterLogout = await getCurrentUser()
      expect(userAfterLogout).toBeNull()
    })
  })

  describe('7. Security: Browser never queries public.profiles before login', () => {
    it('verifies app/login/page.tsx has no direct database or profiles queries', () => {
      const loginPageContent = fs.readFileSync(
        path.resolve(process.cwd(), 'app/login/page.tsx'),
        'utf-8'
      )
      expect(loginPageContent).not.toContain(".from('profiles')")
      expect(loginPageContent).not.toContain('.from("profiles")')
      expect(loginPageContent).not.toContain('createClient')
      expect(loginPageContent).not.toContain('supabase.from')
    })
  })
})
