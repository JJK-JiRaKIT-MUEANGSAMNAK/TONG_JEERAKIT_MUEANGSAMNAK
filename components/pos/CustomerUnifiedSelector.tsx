'use client'

import React, { useState, useRef, useMemo } from 'react'
import { Search, User, UserCheck, X, AlertCircle } from 'lucide-react'
import { Customer } from '@/lib/types/rental-pos'
import { useClickOutside } from '@/lib/hooks/useClickOutside'

interface CustomerUnifiedSelectorProps {
  selectedCustomer: Customer | null
  customers: Customer[]
  onSelectCustomer: (customer: Customer | null) => void
  onOpenNewCustomerModal?: () => void
  disabled?: boolean
}

export function CustomerUnifiedSelector({
  selectedCustomer,
  customers,
  onSelectCustomer,
  disabled = false,
}: CustomerUnifiedSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useClickOutside([containerRef], () => setIsOpen(false), isOpen)

  // Filter matching customers
  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return customers.slice(0, 15)
    return customers.filter((c) => {
      const name = (c.customerName || '').toLowerCase()
      const phone = (c.phone || '').toLowerCase()
      const company = (c.companyName || '').toLowerCase()
      return name.includes(query) || phone.includes(query) || company.includes(query)
    }).slice(0, 15)
  }, [customers, searchTerm])

  const handleSelectExisting = (cust: Customer) => {
    if (cust.isSuspended) return
    onSelectCustomer(cust)
    setSearchTerm('')
    setIsOpen(false)
  }

  const handleSelectGuest = (name: string) => {
    const cleanName = name.trim()
    if (!cleanName) return
    const guestCustomer: Customer = {
      id: '',
      customerName: cleanName,
      phone: '',
      address: '',
      taxId: '',
      status: 'ACTIVE',
    }
    onSelectCustomer(guestCustomer)
    setSearchTerm('')
    setIsOpen(false)
  }

  const handleClear = () => {
    onSelectCustomer(null)
    setSearchTerm('')
    if (inputRef.current) inputRef.current.focus()
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {selectedCustomer ? (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 text-xs shadow-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {selectedCustomer.id ? (
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <User className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <div className="truncate min-w-0">
              <span className="font-bold">{selectedCustomer.customerName}</span>
              {selectedCustomer.phone && (
                <span className="text-slate-500 text-[11px] ml-1.5 font-mono">({selectedCustomer.phone})</span>
              )}
              {!selectedCustomer.id && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                  ลูกค้าทั่วไป (Guest)
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
            title="เปลี่ยนลูกค้า"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            placeholder="ค้นหาชื่อ / เบอร์โทร หรือพิมพ์ชื่อลูกค้าทั่วไป..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (!isOpen) setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Dropdown Options */}
      {isOpen && !selectedCustomer && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl py-1 text-xs">
          {filteredCustomers.length > 0 ? (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                เลือกลูกค้าในระบบ ({filteredCustomers.length})
              </div>
              {filteredCustomers.map((cust) => (
                <button
                  key={cust.id}
                  type="button"
                  disabled={cust.isSuspended}
                  onClick={() => handleSelectExisting(cust)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    cust.isSuspended ? 'opacity-50 cursor-not-allowed bg-red-50/50 dark:bg-red-950/20' : 'cursor-pointer'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                      <span>{cust.customerName}</span>
                      {cust.isSuspended && (
                        <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" /> ระงับสิทธิ์
                        </span>
                      )}
                    </div>
                    {(cust.phone || cust.address) && (
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {cust.phone && <span className="font-mono mr-2">{cust.phone}</span>}
                        {cust.address && <span>{cust.address}</span>}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {/* Guest customer option if search term is entered */}
          {searchTerm.trim().length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-700 p-1.5">
              <button
                type="button"
                onClick={() => handleSelectGuest(searchTerm)}
                className="w-full px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 font-bold flex items-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer text-left"
              >
                <User className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">
                  ใช้ &ldquo;<span className="underline">{searchTerm.trim()}</span>&rdquo; เป็นลูกค้าทั่วไป (Guest)
                </span>
              </button>
            </div>
          )}

          {filteredCustomers.length === 0 && !searchTerm.trim() && (
            <div className="px-3 py-4 text-center text-slate-400">
              ไม่มีข้อมูลลูกค้า
            </div>
          )}
        </div>
      )}
    </div>
  )
}
