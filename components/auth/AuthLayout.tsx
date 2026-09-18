'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { useStableOrientationHeight } from '@/lib/hooks/useDeviceOrientation'

interface AuthLayoutProps {
  children: React.ReactNode
  brandingTitle?: string
  brandingSubtitle?: string
  brandingIcon?: React.ReactNode
  brandingBadge?: string
  showPinBadge?: boolean
  hideBrandingInPortrait?: boolean
  contentClassName?: string
  formOffset?: number
}

export function AuthLayout({
  children,
  contentClassName = '',
  formOffset = 190,
}: AuthLayoutProps) {
  const { orientation, stableHeight } = useStableOrientationHeight()
  const isLandscape = orientation === 'landscape'

  const formPaddingTop = isLandscape
    ? (stableHeight
        ? `max(1.5rem, ${Math.max(24, Math.round(stableHeight * 0.50 - formOffset))}px)`
        : `max(1.5rem, calc(50dvh - ${formOffset}px))`)
    : (stableHeight
        ? `max(1.5rem, ${Math.max(24, Math.round(stableHeight * 0.29 - formOffset))}px)`
        : `max(1.5rem, calc(29dvh - ${formOffset}px))`)

  // Prevent unwanted window-level scroll shift on iOS Safari when focusing inputs
  useEffect(() => {
    const preventWindowScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0)
      }
    }
    window.addEventListener('scroll', preventWindowScroll)
    return () => window.removeEventListener('scroll', preventWindowScroll)
  }, [])

  return (
    <div
      className={`fixed top-0 left-0 right-0 w-full overflow-hidden overscroll-none bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex z-50 ${
        isLandscape ? 'flex-row' : 'flex-col'
      }`}
      style={{
        height: stableHeight ? `${stableHeight}px` : '100lvh',
      }}
    >
      {/*
        Branding / Logo Area:
        - iPad Landscape: Left 50% (w-1/2 h-full)
        - iPad Portrait: Top 30% (w-full h-[30%] min-h-[160px] max-h-[30%])
        - No floating card or modal
      */}
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-b text-center relative overflow-hidden shrink-0 transition-all ${
          isLandscape
            ? 'w-1/2 h-full bg-gradient-to-br border-r border-slate-200 dark:border-slate-800 px-4 sm:px-8 md:px-12 py-8'
            : 'w-full h-[30%] min-h-[160px] max-h-[30%] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 sm:py-5'
        } from-blue-600/15 via-indigo-500/10 to-transparent`}
      >
        <div className="absolute top-1/4 -left-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-16 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <div className="w-full max-w-sm sm:max-w-md mx-auto flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="JJK JEERAKIT PLASTIC FORMWORK UTTARADIT"
              width={896}
              height={254}
              priority
              unoptimized
              className="w-full h-auto object-contain select-none"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      </div>

      {/*
        Content / Form Area:
        - iPad Landscape: Right 50% (w-1/2 h-full)
        - iPad Portrait: Bottom 70% (w-full h-[70%] flex-1)
        - Form positioned with calibrated padding-top
      */}
      <div
        className={`flex flex-col items-center overflow-y-auto bg-white dark:bg-slate-900 relative min-h-0 ${
          isLandscape
            ? 'w-1/2 h-full px-4 sm:px-8 md:px-12 pb-8'
            : 'w-full h-[70%] flex-1 px-4 sm:px-8 pb-8'
        } ${contentClassName}`}
      >
        <div
          className="w-full flex flex-col items-center"
          style={{ paddingTop: formPaddingTop }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
