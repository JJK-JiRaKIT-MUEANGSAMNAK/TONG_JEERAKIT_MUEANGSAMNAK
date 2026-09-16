'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { useFloatingPlacement } from '@/lib/hooks/useFloatingPlacement'
import { ModalPortal } from '@/components/common/ModalPortal'

export interface SelectOption {
  value: string | number
  label: string
  sublabel?: string
}

interface CustomSelectProps {
  value: string | number
  onChange: (value: any) => void
  options: SelectOption[]
  placeholder?: string
  align?: 'left' | 'right'
  direction?: 'down' | 'up'
  className?: string
  buttonClassName?: string
  disabled?: boolean
  searchable?: boolean
  emptyText?: string
  hideChevron?: boolean
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '-- เลือกรายการ --',
  align = 'left',
  className = '',
  buttonClassName = '',
  disabled = false,
  searchable = false,
  emptyText = 'ยังไม่มีรายการ',
  hideChevron = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const { coords, placement } = useFloatingPlacement(triggerRef, isOpen, {
    align,
    matchTriggerWidth: true,
    estimatedHeight: 240,
    offset: 4,
  })

  // Find selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value))

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

  const handleSelect = (val: string | number) => {
    onChange(val)
    setSearchTerm('')
    setIsOpen(false)
  }

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter((option) => {
        const query = searchTerm.trim().toLocaleLowerCase()
        return `${option.label} ${option.sublabel || ''}`.toLocaleLowerCase().includes(query)
      })
    : options

  return (
    <div className={`relative inline-block min-w-0 w-full ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => {
          if (!prev) setSearchTerm('')
          return !prev
        })}
        className={`w-full min-w-0 ${buttonClassName ? buttonClassName : 'h-9 px-2.5 py-0 rounded-xl'} border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold flex items-center justify-between gap-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs transition-all text-left ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <span className="truncate flex-1">
          {selectedOption ? (
            <span>
              {selectedOption.label}
              {selectedOption.sublabel && (
                <span className="text-slate-400 font-normal ml-1.5 text-[11px]">
                  ({selectedOption.sublabel})
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 font-normal">
              {options.length === 0 && placeholder === '-- เลือกรายการ --' ? emptyText : placeholder || '\u00A0'}
            </span>
          )}
        </span>
        {!hideChevron && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? (placement === 'top' ? '-rotate-180 text-emerald-500' : 'rotate-180 text-emerald-500') : ''
            }`}
          />
        )}
      </button>

      {/* Popover Dropdown List (Smart Placement via Portal) */}
      {isOpen && (
        <ModalPortal>
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: `${coords.left}px`,
              width: coords.width ? `${coords.width}px` : undefined,
              maxHeight: coords.maxHeight ? `${coords.maxHeight}px` : '240px',
              zIndex: 9999,
            }}
            className="overflow-y-auto no-scrollbar bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1 space-y-0.5 text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
          >
            {searchable && (
              <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 px-1 pb-1.5 border-b border-slate-100 dark:border-slate-700">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    autoFocus
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="พิมพ์ค้นหา..."
                    className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-slate-400 text-center text-[11px]">
                {searchTerm ? 'ไม่พบรายการที่ตรงกับคำค้นหา' : emptyText}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value)
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-bold transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    <span className="truncate flex-1">{opt.label}</span>
                    {opt.sublabel && (
                      <span
                        className={`text-[10px] shrink-0 font-mono ${
                          isSelected ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-400'
                        }`}
                      >
                        {opt.sublabel}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                  </button>
                )
              })
            )}
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
