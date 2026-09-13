'use server'

import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createAdminClient, validateSupabaseAdminConfig } from '@/lib/supabase/admin'

export interface AuthActionResult<T = unknown> {
  success: boolean
  error?: string
  data?: T
}

/**
 * Normalizes username:
 * - strips leading '@'
 * - trims whitespace
 * - converts to lowercase
 */
export async function normalizeUsername(username: string): Promise<string> {
  return username.trim().replace(/^@+/, '').toLowerCase()
}

/**
 * Resolves username to email strictly on the server:
 * 1. Checks Supabase configuration (returns config error if invalid)
 * 2. Normalizes username
 * 3. Uses server admin client to query public.profiles
 * 4. Falls back to direct email if username is already in email format
 * 5. Returns 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' if username is not found
 */
export async function resolveUsernameToEmail(username: string): Promise<{
  success: boolean
  email?: string
  error?: string
}> {
  try {
    const rawUsername = (username || '').trim()
    if (!rawUsername) {
      return {
        success: false,
        error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      }
    }

    // Check Supabase admin configuration
    const configCheck = validateSupabaseAdminConfig()
    if (!configCheck.isValid) {
      return {
        success: false,
        error: configCheck.error || 'การตั้งค่า Supabase ไม่ถูกต้อง กรุณาตรวจสอบ Environment Variables',
      }
    }

    const cleanUsername = await normalizeUsername(rawUsername)

    // Server-side admin client queries public.profiles
    const adminClient = createAdminClient()
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, email, username')
      .ilike('username', cleanUsername)
      .maybeSingle()

    if (profileError) {
      console.error('Supabase profile lookup error:', profileError)
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล Supabase',
      }
    }

    if (profile?.email) {
      return {
        success: true,
        email: profile.email,
      }
    }

    // Fallback if user typed an email address directly into username field
    if (cleanUsername.includes('@')) {
      return {
        success: true,
        email: cleanUsername,
      }
    }

    // Username not found in profiles
    return {
      success: false,
      error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    }
  } catch (err: unknown) {
    console.error('Error resolving username to email:', err)
    const msg = err instanceof Error ? err.message : 'การตั้งค่า Supabase ไม่ถูกต้อง กรุณาตรวจสอบระบบ'
    if (msg.includes('Supabase') || msg.includes('KEY') || msg.includes('URL')) {
      return {
        success: false,
        error: msg,
      }
    }
    return {
      success: false,
      error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    }
  }
}

/**
 * Login with username and password:
 * 1. Checks Supabase configuration (returns config error if invalid)
 * 2. Resolves username to email strictly on the server using admin client
 * 3. Authenticates using Supabase Auth signInWithPassword via SSR client
 * 4. Sets session cookies automatically
 * 5. Returns unified error "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" on any credential failure
 */
export async function loginWithUsername(formData: {
  username: string
  password: string
}): Promise<AuthActionResult> {
  try {
    const rawUsername = formData.username || ''
    const rawPassword = formData.password || ''

    if (!rawUsername.trim() || !rawPassword) {
      return {
        success: false,
        error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      }
    }

    // Check Supabase anon configuration for SSR client
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!anonKey || anonKey.trim() === '' || anonKey.includes('placeholder')) {
      return {
        success: false,
        error: 'การตั้งค่า Supabase Anon Key ไม่ถูกต้อง กรุณาตรวจสอบ NEXT_PUBLIC_SUPABASE_ANON_KEY',
      }
    }

    // 1. Resolve username to email strictly on the server
    const resolveResult = await resolveUsernameToEmail(rawUsername)
    if (!resolveResult.success || !resolveResult.email) {
      return {
        success: false,
        error: resolveResult.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      }
    }

    // 2. Validate password and establish session via SSR client
    let serverClient
    try {
      serverClient = await createServerSupabase()
    } catch (serverClientErr: unknown) {
      console.error('Failed to create server Supabase client:', serverClientErr)
      return {
        success: false,
        error: 'การตั้งค่าระบบ Server Session ไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่าระบบ',
      }
    }

    const { data: signInData, error: signInError } = await serverClient.auth.signInWithPassword({
      email: resolveResult.email,
      password: rawPassword,
    })

    if (signInError) {
      const errMsg = (signInError.message || '').toLowerCase()
      // Differentiate config / API key / infrastructure errors from credential errors
      if (
        signInError.status === 401 ||
        errMsg.includes('api key') ||
        errMsg.includes('jwt') ||
        errMsg.includes('unauthorized') ||
        errMsg.includes('url')
      ) {
        return {
          success: false,
          error: `การตั้งค่า Supabase Auth ไม่ถูกต้อง: ${signInError.message}`,
        }
      }

      // Credential failure (e.g. invalid password)
      return {
        success: false,
        error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      }
    }

    if (!signInData?.session) {
      return {
        success: false,
        error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      }
    }

    return {
      success: true,
      data: {
        userId: signInData.user.id,
        email: signInData.user.email,
      },
    }
  } catch (err: unknown) {
    console.error('Unexpected error in loginWithUsername:', err)
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('Supabase') || msg.includes('KEY') || msg.includes('URL')) {
      return {
        success: false,
        error: msg,
      }
    }
    return {
      success: false,
      error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    }
  }
}

/**
 * Register user:
 * 1. Normalizes fields
 * 2. Checks username uniqueness (case-insensitive)
 * 3. Signs up with Supabase Auth
 * 4. Ensures profile row is created and linked to Auth user ID
 * 5. Fails safely if registration or profile creation fails
 */
export async function registerUser(formData: {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
}): Promise<AuthActionResult> {
  const adminClient = createAdminClient()
  let newlyCreatedUserId: string | null = null

  try {
    const firstName = (formData.firstName || '').trim()
    const lastName = (formData.lastName || '').trim()
    const rawEmail = (formData.email || '').trim()
    const rawUsername = (formData.username || '').trim()
    const password = formData.password || ''

    if (!firstName || !lastName || !rawEmail || !rawUsername || !password) {
      return {
        success: false,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
      }
    }

    const cleanUsername = rawUsername.replace(/^@+/, '').toLowerCase()
    const cleanEmail = rawEmail.toLowerCase()
    const fullName = `${firstName} ${lastName}`.trim()

    // Validation
    if (cleanUsername.length < 3) {
      return {
        success: false,
        error: 'ชื่อผู้ใช้งานต้องมีความยาวอย่างน้อย 3 ตัวอักษร',
      }
    }

    if (password.length < 8) {
      return {
        success: false,
        error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
      }
    }

    // Check if username already exists in profiles
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle()

    if (existingProfile) {
      return {
        success: false,
        error: 'ชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น',
      }
    }

    // Call Supabase Auth signUp
    const serverClient = await createServerSupabase()
    const { data: signUpData, error: signUpError } = await serverClient.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          username: cleanUsername,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          role: 'USER',
        },
      },
    })

    if (signUpError || !signUpData.user) {
      return {
        success: false,
        error: signUpError?.message || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง',
      }
    }

    // Detect if this is an existing user to prevent deleting existing accounts.
    // In Supabase Auth, existing users returned during signUp have an empty identities array: identities: []
    const userCreatedAt = signUpData.user.created_at ? new Date(signUpData.user.created_at).getTime() : NaN
    const isExistingUser =
      (Array.isArray(signUpData.user.identities) && signUpData.user.identities.length === 0) ||
      (!isNaN(userCreatedAt) && Date.now() - userCreatedAt > 120000)

    if (!isExistingUser) {
      newlyCreatedUserId = signUpData.user.id
    }

    // Ensure profile row is created and linked to auth.users id
    const userId = signUpData.user.id
    const { error: insertProfileError } = await adminClient
      .from('profiles')
      .upsert({
        id: userId,
        username: cleanUsername,
        email: cleanEmail,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        role: 'USER',
        business_id: null,
      })

    if (insertProfileError) {
      // Rollback newly created Auth user if profile creation failed
      if (newlyCreatedUserId) {
        try {
          await adminClient.auth.admin.deleteUser(newlyCreatedUserId)
        } catch (deleteError) {
          console.error('Failed to rollback auth user:', deleteError)
        }
      }

      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการสร้างโปรไฟล์ผู้ใช้ กรุณาลองใหม่อีกครั้ง',
      }
    }

    return {
      success: true,
    }
  } catch (err: unknown) {
    if (newlyCreatedUserId) {
      try {
        await adminClient.auth.admin.deleteUser(newlyCreatedUserId)
      } catch (deleteError) {
        console.error('Failed to rollback auth user on exception:', deleteError)
      }
    }

    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Re-export getCurrentUser for Server Actions and server modules
 */
export async function getCurrentUser() {
  const { getCurrentUser: getAuthUser } = await import('@/lib/auth')
  return getAuthUser()
}

/**
 * Server action to sign out and clear SSR session cookies
 */
export async function logout(): Promise<AuthActionResult> {
  try {
    const serverClient = await createServerSupabase()
    await serverClient.auth.signOut()
    return {
      success: true,
    }
  } catch {
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการออกจากระบบ',
    }
  }
}

