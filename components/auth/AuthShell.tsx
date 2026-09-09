'use client'

import React from 'react'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col xl:flex-row h-full w-full overflow-hidden min-h-0 min-w-0 flex-1">
      {children}
    </div>
  )
}
