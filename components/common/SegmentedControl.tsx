'use client'

import React from 'react'

export interface SegmentedControlOption<T extends string = string> {
  value: T
  label: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  disabled?: boolean
  activeClassName?: string
  inactiveClassName?: string
}

export interface SegmentedControlProps<T extends string = string> {
  value: T
  options: SegmentedControlOption<T>[]
  onChange: (value: T) => void
  className?: string
  buttonClassName?: string
}

export const SEGMENTED_CONTROL_WRAPPER_CLASSES =
  'inline-flex items-center h-9 p-1 gap-1 rounded-xl bg-slate-200/80 dark:bg-slate-900/90 border border-slate-300/70 dark:border-slate-800 shrink-0 select-none'

export const SEGMENTED_CONTROL_BUTTON_CLASSES =
  'h-7 px-3.5 py-0 rounded-lg text-xs gap-1.5 inline-flex items-center justify-center transition-all cursor-pointer select-none'

export const SEGMENTED_CONTROL_ACTIVE_CLASSES =
  'bg-white dark:bg-slate-800 font-extrabold border border-slate-200/80 dark:border-slate-700 shadow-sm ring-1 ring-black/5 dark:ring-white/10 text-slate-900 dark:text-slate-50'

export const SEGMENTED_CONTROL_INACTIVE_CLASSES =
  'bg-transparent text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/50 dark:hover:bg-slate-800/50'

/**
 * SegmentedControl: Source of truth for system segmented tab buttons
 */
export function SegmentedControl<T extends string = string>({
  value,
  options,
  onChange,
  className = '',
  buttonClassName = '',
}: SegmentedControlProps<T>) {
  return (
    <div className={`${SEGMENTED_CONTROL_WRAPPER_CLASSES} ${className}`.trim()}>
      {options.map((opt) => {
        const isActive = opt.value === value
        const activeClasses = opt.activeClassName || SEGMENTED_CONTROL_ACTIVE_CLASSES
        const inactiveClasses = opt.inactiveClassName || SEGMENTED_CONTROL_INACTIVE_CLASSES

        return (
          <button
            key={opt.value}
            type="button"
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.value)}
            className={`${SEGMENTED_CONTROL_BUTTON_CLASSES} ${
              isActive ? activeClasses : inactiveClasses
            } ${buttonClassName} ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`.trim()}
          >
            {opt.icon && <span className="shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.badge && <span className="shrink-0">{opt.badge}</span>}
          </button>
        )
      })}
    </div>
  )
}
