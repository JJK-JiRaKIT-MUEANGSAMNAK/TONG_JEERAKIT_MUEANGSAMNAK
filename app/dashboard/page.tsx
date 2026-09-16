'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  UserPlus,
  CalendarPlus,
  RefreshCw,
  CreditCard,
  FileText,
  ClipboardList,
} from 'lucide-react'
import { NewCustomerModal } from '@/components/customers/NewCustomerModal'
import { StockCountModal } from '@/components/products/StockCountModal'
import { AddAppointmentModal } from '@/components/appointments/AddAppointmentModal'
import { loadProducts } from '@/lib/product-storage'
import { addAppointment } from '@/lib/appointment-storage'
import { addCustomer } from '@/lib/customer-storage'

export default function DashboardPage() {
  // Modal states
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false)
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false)
  const [showStockCountModal, setShowStockCountModal] = useState(false)

  return (
    <div className="p-2.5 sm:p-3 md:p-3.5 lg:p-5 xl:p-6 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-w-0 max-w-full overflow-x-hidden">
      {/* 7 Quick Action Buttons - Strictly single-row on tablet portrait & landscape */}
      <div className="flex flex-nowrap items-center gap-1 sm:gap-1.5 md:gap-1 lg:gap-2 w-full overflow-x-auto no-scrollbar py-0.5">
        <Link
          href="/pos"
          className="h-8 sm:h-8 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-2 lg:px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] sm:text-[10.5px] md:text-[11px] lg:text-xs flex items-center gap-1 sm:gap-1 lg:gap-1.5 shadow-2xs transition-all hover:scale-[1.02] shrink-0 whitespace-nowrap cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0" />
          <span>เปิด POS</span>
        </Link>
        <button
          type="button"
          onClick={() => setShowNewCustomerModal(true)}
          className="h-8 sm:h-8 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-2 lg:px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] sm:text-[10.5px] md:text-[11px] lg:text-xs flex items-center gap-1 sm:gap-1 lg:gap-1.5 shadow-2xs transition-all shrink-0 whitespace-nowrap cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0" />
          <span>เพิ่มลูกค้า</span>
        </button>
        <button
          type="button"
          onClick={() => setShowAddAppointmentModal(true)}
          className="h-8 sm:h-8 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-2 lg:px-3 rounded-xl bg-purple-600 hover:purple-700 text-white font-bold text-[10px] sm:text-[10.5px] md:text-[11px] lg:text-xs flex items-center gap-1 sm:gap-1 lg:gap-1.5 shadow-2xs transition-all shrink-0 whitespace-nowrap cursor-pointer"
        >
          <CalendarPlus className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0" />
          <span>เพิ่มนัดหมาย</span>
        </button>
        <Link
          href="/bills"
          className="h-8 sm:h-8 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-2 lg:px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] sm:text-[10.5px] md:text-[11px] lg:text-xs flex items-center gap-1 sm:gap-1 lg:gap-1.5 shadow-2xs transition-all shrink-0 whitespace-nowrap cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0" />
          <span>รับคืนสินค้า</span>
        </Link>
        <Link
          href="/bills"
          className="h-8 sm:h-8 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-2 lg:px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] sm:text-[10.5px] md:text-[11px] lg:text-xs flex items-center gap-1 sm:gap-1 lg:gap-1.5 shadow-2xs transition-all shrink-0 whitespace-nowrap cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0" />
          <span>รับชำระเงิน</span>
        </Link>
        <Link
          href="/quotations"
          className="h-8 sm:h-8 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-2 lg:px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] sm:text-[10.5px] md:text-[11px] lg:text-xs flex items-center gap-1 sm:gap-1 lg:gap-1.5 shadow-2xs transition-all shrink-0 whitespace-nowrap cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0" />
          <span>ใบเสนอราคา</span>
        </Link>
        <button
          type="button"
          onClick={() => setShowStockCountModal(true)}
          className="h-8 sm:h-8 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-2 lg:px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] sm:text-[10.5px] md:text-[11px] lg:text-xs flex items-center gap-1 sm:gap-1 lg:gap-1.5 shadow-2xs transition-all shrink-0 whitespace-nowrap cursor-pointer"
        >
          <ClipboardList className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0" />
          <span>ตรวจนับสินค้า</span>
        </button>
      </div>

      {/* New Customer Modal */}
      <NewCustomerModal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        onSave={(c) => {
          addCustomer(c)
          setShowNewCustomerModal(false)
        }}
      />

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        isOpen={showAddAppointmentModal}
        onClose={() => setShowAddAppointmentModal(false)}
        onSave={(newApt) => {
          addAppointment(newApt)
          setShowAddAppointmentModal(false)
        }}
      />

      {/* Centralized Stock Count Modal */}
      {showStockCountModal && (
        <StockCountModal
          isOpen={showStockCountModal}
          onClose={() => setShowStockCountModal(false)}
          products={loadProducts()}
        />
      )}
    </div>
  )
}
