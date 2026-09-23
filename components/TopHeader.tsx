'use client'

import React, { Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Calendar, Clock } from 'lucide-react'
import { NotificationBell } from '@/components/common/NotificationBell'
import { QuickActionLauncher } from '@/components/common/QuickActionLauncher'
import { AppLockButton } from '@/components/auth/AppLockButton'
import { getPageName } from '@/lib/navigation-meta'
import { useLiveClock } from '@/lib/hooks/useLiveClock'

function TopHeaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { currentDateStr, currentTimeStr } = useLiveClock()

  const isAuthRoute = pathname === '/login' || pathname.startsWith('/auth')
  const pageName = getPageName(pathname, searchParams)

  if (isAuthRoute) return null

  return (
    <header className="hidden xl:flex items-center justify-between px-6 py-3 bg-[#E3E3E3] dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 shadow-sm shrink-0 relative min-h-[56px]">
      {/* Left: Dynamic Menu / Page Title */}
      <div className="flex items-center min-w-0 z-10">
        <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
          {pageName}
        </h1>
      </div>

      {/* Right: Actions (Date & Time + Lock Button + Notification Bell & Quick Action Launcher) */}
      <div className="flex items-center gap-3 shrink-0 z-10">
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 font-semibold shadow-xs">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{currentDateStr || 'กำลังโหลด...'}</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{currentTimeStr}</span>
        </div>

        <AppLockButton variant="header" />
        <NotificationBell />
        <QuickActionLauncher />
      </div>
    </header>
  )
}

export function TopHeader() {
  return (
    <Suspense fallback={null}>
      <TopHeaderContent />
    </Suspense>
  )
}
