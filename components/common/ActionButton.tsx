'use client'

import React from 'react'

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'active' | 'primary' | 'neutral' | 'ghost' | 'dashed' | 'secondary' | 'outline' | 'utility'
  icon?: React.ReactNode
  badge?: React.ReactNode
}

/**
 * Standard Action/Toolbar Button base style
 * Base: px-3.5 py-2 rounded-xl text-xs gap-1.5 whitespace-nowrap icon 16x16
 */
export const ACTION_BUTTON_BASE_CLASSES =
  'h-9 px-3.5 py-0 rounded-xl text-xs gap-1.5 whitespace-nowrap inline-flex items-center justify-center font-bold transition-all cursor-pointer select-none [&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0 disabled:opacity-50 disabled:cursor-not-allowed'

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      variant = 'neutral',
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

    return (
      <button
        ref={ref}
        type={type}
        className={`${ACTION_BUTTON_BASE_CLASSES} ${variantClasses} ${className}`}
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
