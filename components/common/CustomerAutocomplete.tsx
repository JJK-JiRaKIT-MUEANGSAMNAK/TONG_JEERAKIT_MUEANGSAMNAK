'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Search, User, Phone, Check, X, Loader2 } from 'lucide-react'
import { Customer } from '@/lib/types/rental-pos'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { useFloatingPlacement } from '@/lib/hooks/useFloatingPlacement'
import { ModalPortal } from '@/components/common/ModalPortal'
import { logger } from '@/lib/utils/logger'

export interface CustomerAutocompleteProps {
  value?: string // customer ID or customerName
  customerName?: string
  onChange: (customer: Customer | null, customName?: string) => void
  customers?: Customer[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  autoFocus?: boolean
}

export function CustomerAutocomplete({
  value,
  customerName = '',
  onChange,
  customers: externalCustomers,
  placeholder = 'พิมพ์ค้นหาชื่อลูกค้า, บริษัท, เบอร์โทร...',
  disabled = false,
  required = false,
  className = '',
  autoFocus = false,
}: CustomerAutocompleteProps) {
  const [query, setQuery] = useState<string>(customerName || '')
  const [isOpen, setIsOpen] = useState(false)
  const [internalCustomers, setInternalCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)

  const triggerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Use provided customers
  useEffect(() => {
    if (externalCustomers && externalCustomers.length > 0) {
      setInternalCustomers(externalCustomers)
    } else {
      setInternalCustomers([])
    }
  }, [externalCustomers])

  // Synchronize internal query state with prop changes when not focused
  useEffect(() => {
    if (customerName !== undefined) {
      setQuery(customerName)
    }
  }, [customerName])

  const { coords } = useFloatingPlacement(triggerRef, isOpen, {
    align: 'left',
    matchTriggerWidth: true,
    estimatedHeight: 260,
    offset: 4,
  })

  useClickOutside([triggerRef, popoverRef], () => setIsOpen(false), isOpen)

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return internalCustomers.slice(0, 50)

    return internalCustomers
      .filter((c) => {
        const name = (c.customerName || '').toLowerCase()
        const company = (c.companyName || '').toLowerCase()
        const phone = (c.phone || '').toLowerCase()
        const code = (c.customerCode || '').toLowerCase()
        const taxId = (c.taxId || '').toLowerCase()
        const address = (c.address || '').toLowerCase()
        return (
          name.includes(q) ||
          company.includes(q) ||
          phone.includes(q) ||
          code.includes(q) ||
          taxId.includes(q) ||
          address.includes(q)
        )
      })
      .slice(0, 50)
  }, [query, internalCustomers])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setIsOpen(true)
    setHighlightedIndex(-1)
    onChange(null, val)
  }

  const handleSelectCustomer = (cust: Customer) => {
    setQuery(cust.customerName)
    onChange(cust, cust.customerName)
    setIsOpen(false)
  }

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setQuery('')
    onChange(null, '')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      setHighlightedIndex((prev) =>
        prev < filteredCustomers.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCustomers.length - 1
      )
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredCustomers.length) {
        e.preventDefault()
        handleSelectCustomer(filteredCustomers[highlightedIndex])
      }
    }
  }

  return (
    <div ref={triggerRef} className={`relative min-w-0 w-full ${className}`}>
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs transition-all placeholder:text-slate-400 disabled:opacity-50"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />

        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="ล้างข้อมูล"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Results (Portal with Smart Placement) */}
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
              maxHeight: coords.maxHeight ? `${coords.maxHeight}px` : '260px',
              zIndex: 9999,
            }}
            className="overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1 space-y-0.5 text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
          >
            {isLoading ? (
              <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span>กำลังโหลดรายชื่อลูกค้า...</span>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-3 px-3 text-center">
                <p className="text-slate-400 text-[11px] mb-1.5">
                  ไม่พบข้อมูลลูกค้า &quot;<strong className="text-slate-700 dark:text-slate-300">{query}</strong>&quot;
                </p>
                {query.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(null, query.trim())
                      setIsOpen(false)
                    }}
                    className="w-full py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg hover:bg-emerald-100 text-[11px] transition-colors cursor-pointer"
                  >
                    + ใช้ &quot;{query.trim()}&quot; เป็นชื่อบุคคลภายนอก
                  </button>
                )}
              </div>
            ) : (
              filteredCustomers.map((cust, idx) => {
                const isSelected = cust.id === value || cust.customerName === customerName
                const isHighlighted = idx === highlightedIndex

                return (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => handleSelectCustomer(cust)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isHighlighted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                        : isSelected
                        ? 'bg-slate-100 dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold flex items-center gap-1.5 truncate">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.customerName}</span>
                        {cust.companyName && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
                            ({cust.companyName})
                          </span>
                        )}
                        {cust.customerCode && (
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            [{cust.customerCode}]
                          </span>
                        )}
                      </div>
                      {cust.phone && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5 shrink-0" />
                          <span>{cust.phone}</span>
                          {cust.address && (
                            <span className="truncate ml-1 text-slate-400">· {cust.address}</span>
                          )}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />}
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
