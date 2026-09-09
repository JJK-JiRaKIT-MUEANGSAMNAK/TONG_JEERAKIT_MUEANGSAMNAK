'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Check, X } from 'lucide-react'
import { ModalPortal } from '@/components/common/ModalPortal'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { useFloatingPlacement } from '@/lib/hooks/useFloatingPlacement'

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

export const THAI_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

/**
 * Returns a local date formatted as YYYY-MM-DD using local timezone (Thailand UTC+7 safe)
 * Avoids UTC date reduction from toISOString().split('T')[0] before 07:00 AM.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parses a YYYY-MM-DD string into a local Date instance at local midnight.
 * Prevents UTC timezone shift where new Date('YYYY-MM-DD') evaluates as UTC 00:00:00.
 */
export function parseLocalDate(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const clean = dateStr.trim().split('T')[0]
  const parts = clean.split('-')
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day)
    }
  }
  const fallback = new Date(dateStr)
  return isNaN(fallback.getTime()) ? null : fallback
}

export interface CalendarPanelProps {
  value: Date | null
  onChange: (date: Date | null) => void
  onClose?: () => void
  showClear?: boolean
  showToday?: boolean
  className?: string
}

/**
 * Shared Core Calendar Panel
 * Features standard header: ‹ [สิงหาคม v] [2569 v] › with month & year dropdown selectors,
 * color-coded weekdays, green selected indicator, and quick actions.
 */
export function CalendarPanel({
  value,
  onChange,
  onClose,
  showClear = true,
  showToday = true,
  className = '',
}: CalendarPanelProps) {
  const initialDate = value || new Date()
  const [viewYear, setViewYear] = useState(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth())

  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)

  const monthDropdownRef = useRef<HTMLDivElement>(null)
  const yearDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) {
      setViewYear(value.getFullYear())
      setViewMonth(value.getMonth())
    }
  }, [value])

  // Close header dropdowns on outside click (Mouse & Touch/iPad)
  useClickOutside(monthDropdownRef, () => setIsMonthDropdownOpen(false), isMonthDropdownOpen)
  useClickOutside(yearDropdownRef, () => setIsYearDropdownOpen(false), isYearDropdownOpen)

  // Calculate calendar grid days
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
    setIsMonthDropdownOpen(false)
    setIsYearDropdownOpen(false)
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
    setIsMonthDropdownOpen(false)
    setIsYearDropdownOpen(false)
  }

  const handleSelectDay = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day)
    onChange(selected)
    onClose?.()
  }

  const handleSelectToday = () => {
    const today = new Date()
    onChange(today)
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setIsMonthDropdownOpen(false)
    setIsYearDropdownOpen(false)
    onClose?.()
  }

  const handleClear = () => {
    onChange(null)
    setIsMonthDropdownOpen(false)
    setIsYearDropdownOpen(false)
    onClose?.()
  }

  // Dynamic Year range (e.g. current year - 15 to current year + 15 in BE)
  const currentCE = new Date().getFullYear()
  const yearList = Array.from({ length: 30 }, (_, i) => currentCE - 15 + i)

  return (
    <div className={`w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3.5 text-slate-900 dark:text-slate-100 select-none ${className}`}>
      {/* Header Controls: ‹ [สิงหาคม v] [2569 v] › */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-700/80 pb-2.5 gap-1 relative">
        <button
          type="button"
          onClick={handlePrevMonth}
          title="เดือนก่อนหน้า"
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 font-black text-xs text-slate-800 dark:text-slate-100">
          {/* Month Selector Dropdown */}
          <div ref={monthDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsMonthDropdownOpen((prev) => !prev)
                setIsYearDropdownOpen(false)
              }}
              className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center gap-1 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
            >
              <span>{THAI_MONTHS[viewMonth]}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isMonthDropdownOpen ? 'rotate-180 text-blue-500' : ''}`} />
            </button>

            {isMonthDropdownOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-36 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 text-xs">
                {THAI_MONTHS.map((m, idx) => {
                  const isSelected = idx === viewMonth
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setViewMonth(idx)
                        setIsMonthDropdownOpen(false)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70'
                      }`}
                    >
                      <span>{m}</span>
                      {isSelected && <Check className="w-3 h-3 shrink-0 text-blue-600 dark:text-blue-400 ml-1" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Year Selector Dropdown (พ.ศ.) */}
          <div ref={yearDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsYearDropdownOpen((prev) => !prev)
                setIsMonthDropdownOpen(false)
              }}
              className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono flex items-center gap-1 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
            >
              <span>{viewYear + 543}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isYearDropdownOpen ? 'rotate-180 text-blue-500' : ''}`} />
            </button>

            {isYearDropdownOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-28 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 text-xs font-mono">
                {yearList.map((y) => {
                  const isSelected = y === viewYear
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setViewYear(y)
                        setIsYearDropdownOpen(false)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70'
                      }`}
                    >
                      <span>{y + 543}</span>
                      {isSelected && <Check className="w-3 h-3 shrink-0 text-blue-600 dark:text-blue-400 ml-1" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          title="เดือนถัดไป"
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {THAI_DAYS.map((day, idx) => (
          <span
            key={day}
            className={`text-[11px] font-bold ${
              idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-400'
            }`}
          >
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {/* Empty slots for start of month */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}

        {/* Calendar Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1

          const isSelected =
            value &&
            value.getDate() === day &&
            value.getMonth() === viewMonth &&
            value.getFullYear() === viewYear

          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === viewMonth &&
            new Date().getFullYear() === viewYear

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleSelectDay(day)}
              className={`h-8 w-full rounded-xl font-bold transition-all flex items-center justify-center text-xs cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                  : isToday
                  ? 'border-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Footer Quick Actions */}
      {(showClear || showToday) && (
        <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-slate-100 dark:border-slate-700 text-xs">
          {showClear ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-red-500 font-semibold transition-colors cursor-pointer"
            >
              ล้างข้อมูล
            </button>
          ) : <div />}

          {showToday ? (
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              วันนี้
            </button>
          ) : <div />}
        </div>
      )}
    </div>
  )
}

export interface CustomDatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  align?: 'left' | 'right'
  minDate?: Date
  className?: string
  disabled?: boolean
  showClear?: boolean
}

/**
 * Standard Custom DatePicker Component
 * Trigger input button that opens the Standard CalendarPanel via ModalPortal.
 */
export function CustomDatePicker({
  value,
  onChange,
  placeholder = 'เลือกวันที่...',
  align = 'right',
  minDate: _minDate,
  className = '',
  disabled = false,
  showClear = true,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const { coords } = useFloatingPlacement(triggerRef, isOpen, {
    align,
    estimatedWidth: 288,
    estimatedHeight: 330,
    offset: 6,
  })

  // Close on click outside (Mouse & Touch/iPad)
  useClickOutside([triggerRef, popoverRef], () => setIsOpen(false), isOpen)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const formatDateDisplay = (d: Date | null): string => {
    if (!d) return ''
    const dateNum = String(d.getDate()).padStart(2, '0')
    const monthNum = String(d.getMonth() + 1).padStart(2, '0')
    const yearBE = d.getFullYear() + 543
    return `${dateNum}/${monthNum}/${yearBE}`
  }

  return (
    <div className={`relative inline-block min-w-0 w-full ${className}`}>
      {/* Input Button Display */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full min-w-0 px-2 py-1 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[11px] sm:text-xs font-mono font-semibold flex items-center justify-between gap-1 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs transition-all text-left cursor-pointer ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : 'hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <span className={`truncate flex-1 min-w-0 ${value ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-400 font-normal'}`}>
          {value ? formatDateDisplay(value) : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && showClear && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
              className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              title="ล้างวันที่"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <CalendarIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        </div>
      </button>

      {/* Popover Calendar Window */}
      {isOpen && (
        <ModalPortal>
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
            className="animate-in fade-in zoom-in-95 duration-150"
          >
            <CalendarPanel
              value={value}
              onChange={(d) => {
                onChange(d)
                setIsOpen(false)
              }}
              showClear={showClear}
              showToday={true}
            />
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
