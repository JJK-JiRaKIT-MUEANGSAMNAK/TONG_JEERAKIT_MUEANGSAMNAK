'use client'

import React from 'react'
import { Lock } from 'lucide-react'
import { useAppLock } from '@/lib/contexts/AppLockContext'

interface AppLockButtonProps {
  variant?: 'header' | 'sidebar' | 'mobile'
  className?: string
}

export function AppLockButton({ variant = 'header', className = '' }: AppLockButtonProps) {
  const { pinEnabled, lockApp } = useAppLock()

  if (!pinEnabled) {
    return null
  }

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={lockApp}
        className={`p-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer ${className}`}
        title="ล็อกระบบ (App Lock)"
        aria-label="ล็อกระบบ"
      >
        <Lock className="w-4 h-4" />
      </button>
    )
  }

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={lockApp}
        className={`p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 shrink-0 cursor-pointer shadow-xs ${className}`}
        title="ล็อกระบบ (App Lock)"
        aria-label="ล็อกระบบ"
      >
        <Lock className="w-4 h-4" />
      </button>
    )
  }

  // Default: 'header'
  return (
    <button
      type="button"
      onClick={lockApp}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-300 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all shadow-xs cursor-pointer ${className}`}
      title="ล็อกระบบชั่วคราวด้วย PIN 6 หลัก"
    >
      <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      <span className="hidden sm:inline">ล็อกระบบ</span>
    </button>
  )
}
