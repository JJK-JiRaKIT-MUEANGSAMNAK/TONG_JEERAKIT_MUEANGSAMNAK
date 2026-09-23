'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { PinLockScreen } from '@/components/auth/PinLockScreen'

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { session, loading, user } = useAuth()
  const [isPinUnlocked, setIsPinUnlocked] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (user?.id) {
      const unlocked = sessionStorage.getItem(`rental_pos_unlocked_${user.id}`) === 'true'
      setIsPinUnlocked(unlocked)
    } else {
      setIsPinUnlocked(false)
    }
  }, [user?.id])

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(route + '/')
  )

  useEffect(() => {
    if (!loading) {
      if (!session && !isPublicRoute) {
        // Not authenticated on protected route -> redirect to login
        router.replace('/login')
      } else if (session && user && (pathname === '/login' || pathname === '/register')) {
        // Authenticated user on login or register -> redirect to POS
        router.replace('/pos')
      }
    }
  }, [loading, session, user, isPublicRoute, pathname, router])

  // Public routes: render content directly
  if (isPublicRoute) {
    return (
      <div className="flex flex-col xl:flex-row h-full w-full overflow-hidden min-h-0 min-w-0 flex-1">
        {children}
      </div>
    )
  }

  // Protected route: show loading indicator while checking session
  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-100 dark:bg-background flex flex-col items-center justify-center gap-3 z-50">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium tracking-wide">
          กำลังตรวจสอบสิทธิ์เข้าใช้งาน...
        </span>
      </div>
    )
  }

  // Protected route: if unauthenticated, show redirecting state (do not render protected content)
  if (!session) {
    return (
      <div className="fixed inset-0 bg-slate-100 dark:bg-background flex flex-col items-center justify-center gap-3 z-50">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium tracking-wide">
          กำลังพาคุณไปหน้าเข้าสู่ระบบ...
        </span>
      </div>
    )
  }

  // Protected route: authenticated user must pass PIN lock screen first
  if (session && user && !isPinUnlocked && isClient) {
    return (
      <PinLockScreen
        onUnlockSuccess={() => {
          if (user?.id) {
            sessionStorage.setItem(`rental_pos_unlocked_${user.id}`, 'true')
          }
          setIsPinUnlocked(true)
        }}
      />
    )
  }

  // Protected route: session and profile ready -> render app
  return (
    <div className="flex flex-col xl:flex-row h-full w-full overflow-hidden min-h-0 min-w-0 flex-1">
      {children}
    </div>
  )
}
