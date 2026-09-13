import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null
  try {
    cookieStore = await cookies()
  } catch {
    // Running outside of Next.js request context (e.g. unit tests or background jobs)
  }

  const memoryCookies = new Map<string, { value: string; options?: unknown }>()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        if (cookieStore) {
          return cookieStore.getAll()
        }
        return Array.from(memoryCookies.entries()).map(([name, item]) => ({
          name,
          value: item.value,
        }))
      },
      setAll(cookiesToSet) {
        if (cookieStore) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if middleware handles session refresh.
          }
        } else {
          cookiesToSet.forEach(({ name, value, options }) => {
            memoryCookies.set(name, { value, options })
          })
        }
      },
    },
  })
}
