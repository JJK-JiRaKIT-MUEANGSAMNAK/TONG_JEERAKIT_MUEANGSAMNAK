import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildCurrentUser } from '@/lib/auth-utils'
import type { CurrentUser } from '@/lib/types/rental-pos'

export { buildCurrentUser } from '@/lib/auth-utils'

/**
 * Server-side central function to read the currently authenticated user.
 * Returns CurrentUser containing `userId` and `displayName`, or null if unauthenticated.
 * Used by Audit Log, Server Actions, Route Handlers, and Server Components.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const serverClient = await createServerSupabase()
    const { data: { user: authUser }, error: userError } = await serverClient.auth.getUser()

    if (userError || !authUser) {
      return null
    }

    let profile = null
    try {
      const adminClient = createAdminClient()
      const { data } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()
      profile = data
    } catch {
      // If admin client or profiles lookup is unavailable, profile is null and role safely defaults to USER
    }

    return buildCurrentUser(authUser, profile)
  } catch {
    return null
  }
}
