'use client'

import { useState, useEffect, useCallback, RefObject } from 'react'

export interface UseFloatingPlacementOptions {
  align?: 'left' | 'right' | 'center'
  offset?: number
  minMargin?: number
  estimatedWidth?: number
  estimatedHeight?: number
  matchTriggerWidth?: boolean
  minWidth?: number
}

export interface FloatingCoords {
  top?: number
  bottom?: number
  left: number
  width?: number
  maxHeight?: number
}

export interface FloatingPlacementResult {
  coords: FloatingCoords
  placement: 'top' | 'bottom'
  updatePosition: () => void
}

/**
 * Central hook for smart floating / popover / dropdown placement.
 * Detects trigger rect & viewport boundaries and automatically flips UP or DOWN.
 * Calculates dynamic maxHeight so long lists scroll inside without overflowing.
 */
export function useFloatingPlacement(
  triggerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  options: UseFloatingPlacementOptions = {}
): FloatingPlacementResult {
  const {
    align = 'left',
    offset = 6,
    minMargin = 8,
    estimatedWidth,
    estimatedHeight = 260,
    matchTriggerWidth = false,
    minWidth,
  } = options

  const [coords, setCoords] = useState<FloatingCoords>({ left: minMargin })
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom')

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Available spaces
    const spaceBelow = viewportHeight - rect.bottom - offset - minMargin
    const spaceAbove = rect.top - offset - minMargin

    // Auto-flip decision
    const shouldPlaceTop = spaceBelow < estimatedHeight && spaceAbove > spaceBelow
    const currentPlacement = shouldPlaceTop ? 'top' : 'bottom'
    setPlacement(currentPlacement)

    // Dynamic max-height constraint
    const availableSpace = shouldPlaceTop ? spaceAbove : spaceBelow
    const calculatedMaxHeight = Math.max(100, Math.min(estimatedHeight, availableSpace))

    // Width
    let calculatedWidth = matchTriggerWidth ? rect.width : estimatedWidth
    if (minWidth) {
      calculatedWidth = calculatedWidth ? Math.max(calculatedWidth, minWidth) : minWidth
    }

    // Horizontal alignment
    let left: number
    if (align === 'right') {
      const rightEdge = rect.right
      left = calculatedWidth ? rightEdge - calculatedWidth : rect.left
    } else if (align === 'center') {
      const center = rect.left + rect.width / 2
      left = calculatedWidth ? center - calculatedWidth / 2 : rect.left
    } else {
      left = rect.left
    }

    // Viewport horizontal clamping
    if (calculatedWidth) {
      if (left + calculatedWidth > viewportWidth - minMargin) {
        left = viewportWidth - calculatedWidth - minMargin
      }
    }
    if (left < minMargin) {
      left = minMargin
    }

    if (shouldPlaceTop) {
      setCoords({
        bottom: viewportHeight - rect.top + offset,
        left,
        width: calculatedWidth,
        maxHeight: calculatedMaxHeight,
      })
    } else {
      setCoords({
        top: rect.bottom + offset,
        left,
        width: calculatedWidth,
        maxHeight: calculatedMaxHeight,
      })
    }
  }, [triggerRef, align, offset, minMargin, estimatedWidth, estimatedHeight, matchTriggerWidth, minWidth])

  useEffect(() => {
    if (isOpen) {
      updatePosition()

      const handleScrollOrResize = () => {
        updatePosition()
      }

      window.addEventListener('resize', handleScrollOrResize)
      window.addEventListener('scroll', handleScrollOrResize, true)

      return () => {
        window.removeEventListener('resize', handleScrollOrResize)
        window.removeEventListener('scroll', handleScrollOrResize, true)
      }
    }
  }, [isOpen, updatePosition])

  return { coords, placement, updatePosition }
}
