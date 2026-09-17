'use client'

import React from 'react'

export interface WorkspaceShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
}

/**
 * WorkspaceShell: Source of truth for workspace layout
 * Standard classes: p-2 gap-2 w-full flex-1 min-w-0 min-h-0
 */
export function WorkspaceShell({
  children,
  className = '',
  ...props
}: WorkspaceShellProps) {
  return (
    <div
      className={`w-full flex-1 min-w-0 min-h-0 p-2 gap-2 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}
