'use client'

import React, { useCallback, useLayoutEffect, useEffect, useRef, useState } from 'react'
import { ModalPortal } from '@/components/common/ModalPortal'

interface A4FitPreviewProps {
  children: React.ReactNode
  printId?: string
  className?: string
  paddingPx?: number
  align?: 'left' | 'center'
}

const MIN_SCALE = 0.12
const MAX_SCALE = 1

/**
 * Central A4 preview surface.
 *
 * The sheet itself always remains a real CSS A4 page (210mm × 297mm).
 * Only the on-screen presentation is scaled to fit the available viewport.
 * Supports Double Click / Double Tap to open Full Preview overlay,
 * and Single Click / Single Tap to close.
 */
export function A4FitPreview({
  children,
  printId = 'pos-print-document',
  className = '',
  paddingPx = 10,
  align = 'center',
}: A4FitPreviewProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [sheetSize, setSheetSize] = useState({ width: 794, height: 1123 })

  // Full Preview State
  const [isFullPreview, setIsFullPreview] = useState(false)
  const [fullScale, setFullScale] = useState(1)
  const lastTapRef = useRef<number>(0)

  const fitSheet = useCallback(() => {
    const viewport = viewportRef.current
    const sheet = sheetRef.current
    if (!viewport || !sheet) return

    const pageWidth = sheet.offsetWidth
    const pageHeight = sheet.offsetHeight
    const availableWidth = Math.max(1, viewport.clientWidth - paddingPx * 2)
    const availableHeight = Math.max(1, viewport.clientHeight - paddingPx * 2)

    if (pageWidth <= 0 || pageHeight <= 0) return

    const nextScale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, availableWidth / pageWidth, availableHeight / pageHeight),
    )

    setSheetSize({ width: pageWidth, height: pageHeight })
    setScale((current) => (Math.abs(current - nextScale) > 0.001 ? nextScale : current))
  }, [paddingPx])

  // Compute Full Preview Scale to fit full viewport perfectly
  const fitFullScreen = useCallback(() => {
    if (typeof window === 'undefined') return
    const padW = window.innerWidth < 640 ? 20 : 48
    const padH = window.innerHeight < 640 ? 32 : 64
    const availableWidth = Math.max(1, window.innerWidth - padW)
    const availableHeight = Math.max(1, window.innerHeight - padH)

    const pageWidth = sheetSize.width || 794
    const pageHeight = sheetSize.height || 1123

    const nextFullScale = Math.max(
      MIN_SCALE,
      Math.min(1.6, availableWidth / pageWidth, availableHeight / pageHeight)
    )

    setFullScale(nextFullScale)
  }, [sheetSize])

  useLayoutEffect(() => {
    fitSheet()

    const viewport = viewportRef.current
    if (!viewport || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(fitSheet)
    observer.observe(viewport)

    window.addEventListener('resize', fitSheet)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', fitSheet)
    }
  }, [fitSheet])

  // Manage Full Preview Resizing & Keyboard events
  useEffect(() => {
    if (!isFullPreview) return

    fitFullScreen()
    const handleResize = () => fitFullScreen()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullPreview(false)
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullPreview, fitFullScreen])

  // Mouse PC Double Click in Normal Mode
  const handleNormalDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFullPreview(true)
  }

  // Touch iPad / Mobile Double Tap in Normal Mode
  const handleNormalTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 320 // ms
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.preventDefault()
      e.stopPropagation()
      setIsFullPreview(true)
      lastTapRef.current = 0
    } else {
      lastTapRef.current = now
    }
  }

  // Single Click / Single Touch in Full Preview Mode to Close
  const handleCloseFullPreview = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setIsFullPreview(false)
  }

  return (
    <>
      <div
        ref={viewportRef}
        className={`pos-a4-fit-viewport relative h-full w-full min-h-0 min-w-0 overflow-hidden ${className}`}
        aria-label="ตัวอย่างเอกสาร A4"
      >
        <div
          className={`absolute inset-0 flex flex-col ${align === 'left' ? 'items-start justify-start' : 'items-center justify-center'} overflow-hidden`}
          style={{
            paddingTop: `${paddingPx}px`,
            paddingBottom: `${paddingPx}px`,
            paddingLeft: `${paddingPx}px`,
            paddingRight: `${paddingPx}px`,
          }}
        >
          <div
            className="pos-a4-fit-stage relative shrink-0 cursor-pointer select-none"
            title="ดับเบิ้ลคลิกเพื่อดูตัวอย่างแบบเต็มจอ (Double-click for Full Preview)"
            onDoubleClick={handleNormalDoubleClick}
            onTouchEnd={handleNormalTouchEnd}
            style={{
              width: `${sheetSize.width * scale}px`,
              height: `${sheetSize.height * scale}px`,
            }}
          >
            <div
              id={printId}
              ref={sheetRef}
              className="pos-a4-fit-sheet absolute left-0 top-0 h-[297mm] w-[210mm] origin-top-left overflow-hidden bg-white shadow-xl ring-1 ring-slate-300/80 rounded-sm"
              style={{ transform: `scale(${scale})` }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Full Preview Modal Overlay */}
      {isFullPreview && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 select-none animate-in fade-in duration-200 overflow-hidden cursor-pointer"
            onClick={handleCloseFullPreview}
            onTouchEnd={handleCloseFullPreview}
            role="dialog"
            aria-modal="true"
            aria-label="ตัวอย่างเอกสาร A4 เต็มจอ"
          >
            {/* Centered A4 Sheet Stage */}
            <div
              className="relative shrink-0 shadow-2xl transition-transform duration-150"
              style={{
                width: `${sheetSize.width * fullScale}px`,
                height: `${sheetSize.height * fullScale}px`,
              }}
              onClick={handleCloseFullPreview}
            >
              <div
                className="absolute left-0 top-0 h-[297mm] w-[210mm] origin-top-left overflow-hidden bg-white shadow-2xl rounded-sm ring-1 ring-slate-400/40 pointer-events-none"
                style={{ transform: `scale(${fullScale})` }}
              >
                {children}
              </div>
            </div>

            {/* Bottom Close Hint */}
            <div className="absolute bottom-4 text-center text-white/90 text-xs font-semibold bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md pointer-events-none shadow-lg border border-white/10">
              คลิกหรือแตะที่ใดก็ได้เพื่อปิด Full Preview (Esc)
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  )
}
