'use client'

import React from 'react'
import { X } from 'lucide-react'

type ModalHeaderInset =
  | 'none'
  | 'p6'
  | 'responsive'

interface ModalHeaderProps {
  children: React.ReactNode
  onClose: () => void
  inset?: ModalHeaderInset
}

const insetClasses:
Record<ModalHeaderInset, string> = {
  none: '',
  p6: '-mx-6 -mt-6',
  responsive:
    '-mx-4 -mt-4 sm:-mx-5 sm:-mt-5',
}

export function ModalHeader({
  children,
  onClose,
  inset = 'none',
}: ModalHeaderProps) {
  return (
    <div
      className={`
        shrink-0
        flex items-center justify-between gap-3
        px-6 py-4
        bg-slate-50 dark:bg-slate-900
        border-b border-slate-200 dark:border-slate-800
        text-left text-slate-900 dark:text-slate-100
        rounded-t-[inherit]

        [&_h3]:text-base
        [&_h3]:font-extrabold
        [&_h3]:text-slate-900
        dark:[&_h3]:text-slate-100

        [&_h4]:text-base
        [&_h4]:font-extrabold
        [&_h4]:text-slate-900
        dark:[&_h4]:text-slate-100

        ${insetClasses[inset]}
      `}
    >
      <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
        {children}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="ปิดหน้าต่าง"
        className="
          shrink-0 p-2 rounded-full
          text-slate-400
          hover:text-slate-700
          dark:hover:text-slate-200
          hover:bg-slate-200
          dark:hover:bg-slate-800
          transition-colors
        "
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
