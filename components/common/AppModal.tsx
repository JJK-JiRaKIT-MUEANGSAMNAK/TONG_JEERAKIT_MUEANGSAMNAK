'use client'

import React, { useEffect, useCallback } from 'react'
import { X, Loader2 } from 'lucide-react'
import { ModalPortal } from '@/components/common/ModalPortal'

export type AppModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

export interface AppModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?: AppModalSize
  isLoading?: boolean
  closeOnBackdropClick?: boolean
  closeOnEsc?: boolean
  className?: string
  contentClassName?: string
}

const sizeClasses: Record<AppModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl',
  full: 'max-w-[95vw]',
}

export function AppModal({
  isOpen,
  onClose,
  children,
  size = 'md',
  isLoading = false,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  className = '',
  contentClassName = '',
}: AppModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose()
      }
    },
    [closeOnEsc, onClose]
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose()
          }
        }}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 ${className}`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            bg-white dark:bg-slate-900
            rounded-2xl sm:rounded-3xl shadow-2xl
            w-full ${sizeClasses[size]}
            max-h-[calc(100dvh-16px)] sm:max-h-[90dvh]
            flex flex-col overflow-hidden
            border border-slate-200 dark:border-slate-800
            relative animate-in zoom-in-95 duration-150
            ${contentClassName}
          `}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 z-50 flex flex-col items-center justify-center backdrop-blur-xs gap-2 rounded-2xl sm:rounded-3xl">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">กำลังประมวลผล...</span>
            </div>
          )}

          {children}
        </div>
      </div>
    </ModalPortal>
  )
}

export interface AppModalHeaderProps {
  children?: React.ReactNode
  title?: string
  icon?: React.ReactNode
  onClose?: () => void
  headerActions?: React.ReactNode
  className?: string
}

export function AppModalHeader({
  children,
  title,
  icon,
  onClose,
  headerActions,
  className = '',
}: AppModalHeaderProps) {
  return (
    <div
      className={`
        shrink-0
        flex items-center justify-between gap-2
        px-4 sm:px-5 py-2.5 sm:py-3
        bg-slate-50 dark:bg-slate-900
        border-b border-slate-200 dark:border-slate-800
        text-left text-slate-900 dark:text-slate-100
        rounded-t-[inherit]
        ${className}
      `}
    >
      <div className="min-w-0 flex-1 flex items-center gap-2">
        {icon && <span className="shrink-0 text-slate-600 dark:text-slate-300">{icon}</span>}
        {title ? (
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
            {title}
          </h3>
        ) : (
          children
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {headerActions}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="
              shrink-0 p-1.5 rounded-full
              text-slate-400
              hover:text-slate-700 dark:hover:text-slate-200
              hover:bg-slate-200 dark:hover:bg-slate-800
              transition-colors cursor-pointer
            "
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export interface AppModalBodyProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function AppModalBody({
  children,
  className = '',
  noPadding = false,
}: AppModalBodyProps) {
  return (
    <div
      className={`
        flex-1 min-h-0 overflow-y-auto
        ${noPadding ? '' : 'p-3.5 sm:px-5 sm:py-3'}
        text-xs text-slate-700 dark:text-slate-300
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export interface AppModalFooterProps {
  children?: React.ReactNode
  onCancel?: () => void
  onConfirm?: () => void
  cancelText?: string
  confirmText?: string
  confirmButtonColor?: 'blue' | 'emerald' | 'red' | 'amber'
  isConfirmDisabled?: boolean
  isConfirmLoading?: boolean
  className?: string
}

const confirmColorClasses = {
  blue: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white',
  red: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white',
  amber: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white',
}

export function AppModalFooter({
  children,
  onCancel,
  onConfirm,
  cancelText = 'ยกเลิก',
  confirmText = 'บันทึก',
  confirmButtonColor = 'emerald',
  isConfirmDisabled = false,
  isConfirmLoading = false,
  className = '',
}: AppModalFooterProps) {
  if (children) {
    return (
      <div
        className={`
          shrink-0 px-4 sm:px-5 py-2 sm:py-2.5
          bg-slate-50/50 dark:bg-slate-900/50
          border-t border-slate-200 dark:border-slate-800
          flex items-center justify-end gap-2
          rounded-b-[inherit]
          ${className}
        `}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={`
        shrink-0 px-4 sm:px-5 py-2 sm:py-2.5
        bg-slate-50/50 dark:bg-slate-900/50
        border-t border-slate-200 dark:border-slate-800
        flex items-center justify-end gap-2
        rounded-b-[inherit]
        ${className}
      `}
    >
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="
            px-3.5 py-1.5 rounded-xl
            border border-slate-300 dark:border-slate-700
            bg-white dark:bg-slate-800
            hover:bg-slate-50 dark:hover:bg-slate-700
            text-slate-700 dark:text-slate-300
            font-bold text-xs transition-colors cursor-pointer
          "
        >
          {cancelText}
        </button>
      )}

      {onConfirm && (
        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirmDisabled || isConfirmLoading}
          className={`
            px-4 py-1.5 rounded-xl
            font-bold text-xs
            shadow-xs transition-all cursor-pointer
            flex items-center gap-1.5
            disabled:opacity-50 disabled:cursor-not-allowed
            ${confirmColorClasses[confirmButtonColor]}
          `}
        >
          {isConfirmLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{confirmText}</span>
        </button>
      )}
    </div>
  )
}
