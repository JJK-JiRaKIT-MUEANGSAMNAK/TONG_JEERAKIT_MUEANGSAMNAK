import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function validateSupabaseAdminConfig(): { isValid: boolean; error?: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || supabaseUrl.trim() === '' || supabaseUrl.includes('placeholder')) {
    return {
      isValid: false,
      error: 'การตั้งค่า Supabase URL ไม่ถูกต้อง กรุณาตรวจสอบ NEXT_PUBLIC_SUPABASE_URL',
    }
  }

  try {
    const parsed = new URL(supabaseUrl)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        isValid: false,
        error: 'รูปแบบ Supabase URL ไม่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)',
      }
    }
  } catch {
    return {
      isValid: false,
      error: 'รูปแบบ Supabase URL ไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่า',
    }
  }

  if (!serviceRoleKey || serviceRoleKey.trim() === '' || serviceRoleKey.includes('placeholder')) {
    return {
      isValid: false,
      error: 'การตั้งค่า Supabase Service Role Key ไม่ถูกต้อง กรุณาตรวจสอบ SUPABASE_SERVICE_ROLE_KEY',
    }
  }

  return { isValid: true }
}

export function createAdminClient() {
  const config = validateSupabaseAdminConfig()
  if (!config.isValid) {
    throw new Error(config.error || 'Supabase admin configuration is invalid')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

