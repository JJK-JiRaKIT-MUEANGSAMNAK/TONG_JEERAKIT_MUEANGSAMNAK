'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useAppLock } from '@/lib/contexts/AppLockContext'
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
  const { session, loading: authLoading, user } = useAuth()
  const { pinEnabled, isLocked, loading: appLockLoading, unlockApp } = useAppLock()

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(route + '/')
  )

  useEffect(() => {
    if (!authLoading) {
      if (!session && !isPublicRoute) {
        // Not authenticated on protected route -> redirect to login
        router.replace('/login')
      } else if (session && user && (pathname === '/login' || pathname === '/register')) {
        // Authenticated user on login or register -> redirect to POS
        router.replace('/pos')
      }
    }
  }, [authLoading, session, user, isPublicRoute, pathname, router])

  // Public routes: render content directly
  if (isPublicRoute) {
    return (
      <div className="flex flex-col xl:flex-row h-full w-full overflow-hidden min-h-0 min-w-0 flex-1">
        {children}
      </div>
    )
  }

  // Protected route: show loading indicator while checking session or app lock
  if (authLoading || appLockLoading) {
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

  // Protected route: show PinLockScreen ONLY if PIN is enabled AND the app is locked
  if (session && user && pinEnabled && isLocked) {
    return (
      <PinLockScreen
        onUnlockSuccess={unlockApp}
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
