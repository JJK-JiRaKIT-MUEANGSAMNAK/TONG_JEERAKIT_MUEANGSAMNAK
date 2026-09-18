'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { buildCurrentUser } from '@/lib/auth-utils'
import { logout } from '@/app/actions/auth'
import type { CurrentUser, UserRole } from '@/lib/types/rental-pos'

export interface AuthContextType {
  user: CurrentUser | null
  session: Session | null
  loading: boolean
  role: UserRole | null
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: null,
  signOut: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  const loadUserProfile = useCallback(async (authUser: User, currentSession: Session | null) => {
    try {
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      const timeoutPromise = new Promise<{ data: null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 3000)
      )

      const result = await Promise.race([profilePromise, timeoutPromise])
      const profile = result?.data ?? null

      const currentUser = buildCurrentUser(authUser, profile)
      setUser(currentUser)
      setRole(currentUser.role)
      setSession(currentSession)
    } catch {
      // Fallback to metadata if profiles table is not accessible yet
      const fallbackUser = buildCurrentUser(authUser, null)
      setUser(fallbackUser)
      setRole(fallbackUser.role)
      setSession(currentSession)
    }
  }, [supabase])

  const refreshUser = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        const { data: sessionData } = await supabase.auth.getSession()
        await loadUserProfile(userData.user, sessionData?.session ?? null)
      } else {
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session?.user) {
          await loadUserProfile(sessionData.session.user, sessionData.session)
        } else {
          setUser(null)
          setRole(null)
          setSession(null)
        }
      }
    } catch {
      setUser(null)
      setRole(null)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [supabase, loadUserProfile])

  useEffect(() => {
    let isMounted = true

    // Initial session load with safety timer
    const initAuth = async () => {
      const safetyTimer = setTimeout(() => {
        if (isMounted) setLoading(false)
      }, 4000)

      try {
        const { data } = await supabase.auth.getSession()
        if (!isMounted) return
        const initialSession: Session | null = data?.session ?? null
        if (initialSession?.user) {
          await loadUserProfile(initialSession.user, initialSession)
        } else {
          const { data: userData } = await supabase.auth.getUser()
          if (!isMounted) return
          if (userData?.user) {
            const { data: sessionData } = await supabase.auth.getSession()
            await loadUserProfile(userData.user, sessionData?.session ?? null)
          } else {
            setUser(null)
            setRole(null)
            setSession(null)
          }
        }
      } catch {
        if (isMounted) {
          setUser(null)
          setRole(null)
          setSession(null)
        }
      } finally {
        clearTimeout(safetyTimer)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, currentSession: Session | null) => {
        if (!isMounted) return
        if (currentSession?.user) {
          await loadUserProfile(currentSession.user, currentSession)
        } else {
          setUser(null)
          setRole(null)
          setSession(null)
        }
        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, loadUserProfile])

  const signOut = useCallback(async () => {
    try {
      await logout()
    } catch {
      // Ignore server action error
    }
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore network errors during signout
    } finally {
      setUser(null)
      setRole(null)
      setSession(null)
      window.location.href = '/login'
    }
  }, [supabase])

  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    session,
    loading,
    role,
    signOut,
    refreshUser,
  }), [user, session, loading, role, signOut, refreshUser])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
