'use client'

import React from 'react'

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'active' | 'primary' | 'neutral' | 'ghost' | 'dashed' | 'secondary' | 'outline' | 'utility' | 'danger' | 'info'
  size?: 'sm' | 'md'
  icon?: React.ReactNode
  badge?: React.ReactNode
}

/**
 * Standard Action/Toolbar Button base style
 * Base: px-3.5 py-0 rounded-xl text-xs gap-1.5 whitespace-nowrap icon 16x16
 */
export const ACTION_BUTTON_BASE_CLASSES =
  'h-9 px-3.5 py-0 rounded-xl text-xs gap-1.5 whitespace-nowrap inline-flex items-center justify-center font-bold transition-all cursor-pointer select-none [&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0 disabled:opacity-50 disabled:cursor-not-allowed'

export const ACTION_BUTTON_SM_CLASSES =
  'h-7 px-3 py-0 rounded-lg text-xs gap-1.5 whitespace-nowrap inline-flex items-center justify-center font-bold transition-all cursor-pointer select-none [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:shrink-0 disabled:opacity-50 disabled:cursor-not-allowed'

export const TAB_CONTAINER_CLASSES =
  'h-9 p-1 gap-1 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 border border-slate-300/60 dark:border-slate-600/60 inline-flex items-center shrink-0 overflow-x-auto no-scrollbar'

export const TAB_BUTTON_BASE_CLASSES =
  'h-7 px-3.5 py-0 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap select-none shrink-0'

export const TAB_BUTTON_ACTIVE_CLASSES =
  'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/80 dark:border-slate-600/80'

export const TAB_BUTTON_INACTIVE_CLASSES =
  'bg-transparent border border-transparent text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/40'

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      variant = 'neutral',
      size = 'md',
      icon,
      badge,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    let variantClasses = ''
    switch (variant) {
      case 'active':
        variantClasses = 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
        break
      case 'primary':
        variantClasses = 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
        break
      case 'danger':
        variantClasses = 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
        break
      case 'info':
        variantClasses = 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
        break
      case 'neutral':
        variantClasses =
          'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs'
        break
      case 'ghost':
      case 'utility':
        variantClasses =
          'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80'
        break
      case 'dashed':
      case 'secondary':
        variantClasses =
          'border border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
        break
      case 'outline':
        variantClasses =
          'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        break
    }

    const baseClasses = size === 'sm' ? ACTION_BUTTON_SM_CLASSES : ACTION_BUTTON_BASE_CLASSES

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {icon}
        {children && <span>{children}</span>}
        {badge}
      </button>
    )
  }
)

ActionButton.displayName = 'ActionButton'
