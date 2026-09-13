import type { CurrentUser, UserRole } from '@/lib/types/rental-pos'

export interface AuthUserLike {
  id: string
  email?: string | null
  email_confirmed_at?: string | null
  user_metadata?: Record<string, unknown> | null
}

/**
 * Builds a normalized CurrentUser object ensuring both `userId` and `displayName`
 * are always populated and consistent across client and server.
 */
export function buildCurrentUser(
  authUser: AuthUserLike,
  profileData?: Record<string, unknown> | null
): CurrentUser {
  const rawRole = (profileData?.role as string) || (authUser.user_metadata?.role as string) || 'USER'
  const resolvedRole: UserRole = rawRole === 'OWNER' ? 'OWNER' : 'USER'

  const firstName =
    (profileData?.first_name as string) ||
    (authUser.user_metadata?.first_name as string) ||
    ''

  const lastName =
    (profileData?.last_name as string) ||
    (authUser.user_metadata?.last_name as string) ||
    ''

  const fullName =
    (profileData?.full_name as string) ||
    (authUser.user_metadata?.full_name as string) ||
    `${firstName} ${lastName}`.trim() ||
    (authUser.email ? authUser.email.split('@')[0] : 'ผู้ใช้งาน')

  const username =
    (profileData?.username as string) ||
    (authUser.user_metadata?.username as string) ||
    (authUser.email ? authUser.email.split('@')[0] : '')

  const displayName =
    fullName ||
    firstName ||
    username ||
    (authUser.email ? authUser.email.split('@')[0] : 'ผู้ใช้งาน')

  return {
    id: authUser.id,
    userId: authUser.id,
    username,
    email: authUser.email || (profileData?.email as string) || '',
    firstName,
    fullName,
    displayName,
    role: resolvedRole,
    businessId: (profileData?.business_id as string) || null,
    emailVerified: Boolean(authUser.email_confirmed_at),
    avatarUrl: (profileData?.avatar_url as string) || (authUser.user_metadata?.avatar_url as string) || null,
  }
}
