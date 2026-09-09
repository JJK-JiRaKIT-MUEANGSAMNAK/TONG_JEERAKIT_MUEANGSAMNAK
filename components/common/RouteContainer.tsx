'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function RouteContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPosRoute = pathname?.startsWith('/pos')

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isPosRoute) {
        document.body.classList.add('pos-route')
        document.body.classList.remove('non-pos-route')
      } else {
        document.body.classList.add('non-pos-route')
        document.body.classList.remove('pos-route')
      }
    }
  }, [isPosRoute])

  return (
    <div
      className={`flex-1 min-h-0 min-w-0 h-full ${
        isPosRoute
          ? 'pos-ui overflow-hidden'
          : 'non-pos-ui overflow-y-auto'
      }`}
    >
      {children}
    </div>
  )
}
