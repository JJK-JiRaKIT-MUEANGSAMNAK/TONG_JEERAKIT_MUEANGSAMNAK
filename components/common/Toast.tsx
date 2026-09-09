'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

interface ToastMessage {
  id: string
  title: string
  message?: string
  type: 'SUCCESS' | 'ERROR' | 'INFO'
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: 'SUCCESS' | 'ERROR' | 'INFO') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((title: string, message?: string, type: 'SUCCESS' | 'ERROR' | 'INFO' = 'SUCCESS') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const newToast: ToastMessage = { id, title, message, type }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 6000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const contextValue = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Notification Floating Container */}
      <div className="fixed inset-x-3 bottom-3 z-50 flex w-auto flex-col gap-2 pointer-events-none sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-full sm:max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3 sm:p-4 rounded-2xl shadow-2xl border flex min-w-0 items-start justify-between gap-2 sm:gap-3 animate-in slide-in-from-bottom duration-200 ${
              t.type === 'SUCCESS'
                ? 'bg-white dark:bg-slate-900 border-emerald-500/40 text-slate-900 dark:text-white'
                : t.type === 'ERROR'
                ? 'bg-white dark:bg-slate-900 border-red-500/40 text-slate-900 dark:text-white'
                : 'bg-white dark:bg-slate-900 border-blue-500/40 text-slate-900 dark:text-white'
            }`}
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
              {t.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />}
              {t.type === 'ERROR' && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" />}
              {t.type === 'INFO' && <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />}
              <div className="min-w-0">
                <h4 className="font-bold text-xs">{t.title}</h4>
                {t.message && <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5">{t.message}</p>}
              </div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
