'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface UseAutoFitPageSizeOptions {
  /** Approximate/default row height in pixels (default: 40) */
  defaultRowHeight?: number
  /** Approximate/default table header height in pixels (default: 40) */
  defaultHeaderHeight?: number
  /** Extra vertical offset to deduct (padding, borders, etc.) */
  extraOffset?: number
  /** Minimum page size (default: 1) */
  minPageSize?: number
  /** Initial fallback page size before measurement (default: 8) */
  initialPageSize?: number
  /** Total number of items */
  totalItems: number
  /** Optional dependency key to re-bind ResizeObserver when tab or visibility changes */
  activeKey?: any
}

export interface UseAutoFitPageSizeResult {
  containerRef: React.RefObject<HTMLDivElement>
  pageSize: number
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
  startIndex: number
  endIndex: number
}

/**
 * Hook to automatically calculate the page size of a table based on actual available viewport height.
 * Uses ResizeObserver to recalculate on resize, fullscreen, or orientation change.
 */
export function useAutoFitPageSize({
  defaultRowHeight = 40,
  defaultHeaderHeight = 40,
  extraOffset = 0,
  minPageSize = 1,
  initialPageSize = 8,
  totalItems,
  activeKey,
}: UseAutoFitPageSizeOptions): UseAutoFitPageSizeResult {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pageSize, setPageSize] = useState<number>(initialPageSize)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const calculatePageSize = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const containerHeight = container.clientHeight
    if (containerHeight <= 0) return

    // Find thead if present
    const thead = container.querySelector('thead')
    const headerHeight = thead ? thead.offsetHeight : defaultHeaderHeight

    // Find first tr in tbody if present to measure actual row height (ignore empty state rows)
    const firstRow = container.querySelector<HTMLTableRowElement>('tbody tr:not([data-empty-row])')
    const actualRowHeight =
      firstRow && firstRow.offsetHeight > 0 ? firstRow.offsetHeight : defaultRowHeight

    const availableHeight = containerHeight - headerHeight - extraOffset
    if (availableHeight <= 0) return

    const calculated = Math.max(minPageSize, Math.floor(availableHeight / actualRowHeight))

    setPageSize((prev) => (prev !== calculated ? calculated : prev))
  }, [defaultRowHeight, defaultHeaderHeight, extraOffset, minPageSize])

  useEffect(() => {
    calculatePageSize()

    const container = containerRef.current
    if (!container) return

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        calculatePageSize()
      })
      observer.observe(container)
    }

    const handleResize = () => {
      calculatePageSize()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      if (observer) {
        observer.disconnect()
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [calculatePageSize, activeKey])

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Keep currentPage valid when totalPages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    } else if (currentPage < 1) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  return {
    containerRef,
    pageSize,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    endIndex,
  }
}
