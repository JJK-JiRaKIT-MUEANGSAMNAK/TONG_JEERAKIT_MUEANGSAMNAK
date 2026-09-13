'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ShoppingBag,
  UserPlus,
  CalendarPlus,
  RefreshCw,
  CreditCard,
  Users,
  Package,
  FileText,
  ClipboardList,
  ArrowRight,
} from 'lucide-react'
import { Appointment, Product } from '@/lib/types/rental-pos'
import { FullBill } from '@/lib/types/rental-return'
import { NewCustomerModal } from '@/components/customers/NewCustomerModal'
import { StockCountModal } from '@/components/products/StockCountModal'
import { getLocalDateString } from '@/components/common/CustomDatePicker'
import { AddAppointmentModal } from '@/components/appointments/AddAppointmentModal'
import { PaymentTrendChart, DailyPaymentTrend } from '@/components/dashboard/PaymentTrendChart'
import { StockDonutChart } from '@/components/dashboard/StockDonutChart'
import { loadProducts } from '@/lib/product-storage'
import { loadBills } from '@/lib/bill-storage'
import { loadAppointments, addAppointment } from '@/lib/appointment-storage'
import { getTodayFinance, getMonthlyFinance, getDailyPaymentTrends } from '@/lib/finance-storage'
import { addCustomer } from '@/lib/customer-storage'
import {
  computeStockSummary,
  computeRentalOperationalSummary,
  computeFinancialSummary,
} from '@/lib/report-summary-service'
import { getDefaultMinimumStock } from '@/lib/settings-storage'

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [bills, setBills] = useState<FullBill[]>([])
  const [paymentTrend, setPaymentTrend] = useState<DailyPaymentTrend[]>([])
  const [paymentTrendLoading, setPaymentTrendLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [todayFinance, setTodayFinance] = useState({ income: 0, expense: 0, outstanding: 0 })
  const [monthlyFinance, setMonthlyFinance] = useState({ income: 0, expense: 0 })
  // Extra KPIs from central summary service
  const [reservedQty, setReservedQty] = useState(0)
  const [backorderCount, setBackorderCount] = useState(0)
  const [depositHeld, setDepositHeld] = useState(0)
  const [pendingDispatch, setPendingDispatch] = useState(0)

  // Modal states
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false)
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false)
  const [showStockCountModal, setShowStockCountModal] = useState(false)

  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const p = loadProducts()
      const b = loadBills()
      const a = loadAppointments()
      const tf = getTodayFinance()
      const mf = getMonthlyFinance()
      setProducts(p)
      setBills(b)
      setAppointments(a)
      setTodayFinance(tf)
      setMonthlyFinance(mf)

      // Extra KPIs via central report service
      const stock = computeStockSummary()
      const ops = computeRentalOperationalSummary()
      const todayStr = new Date().toISOString().slice(0, 10)
      const todayFin = computeFinancialSummary({ startDate: todayStr, endDate: todayStr })
      setReservedQty(stock.reserved)
      setBackorderCount(ops.backorderPending)
      setDepositHeld(todayFin.depositHeld)
      setPendingDispatch(ops.pendingDispatch)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadPaymentTrend = React.useCallback(async () => {
    setPaymentTrendLoading(true)
    try {
      const trends = getDailyPaymentTrends(7)
      setPaymentTrend(trends)
    } finally {
      setPaymentTrendLoading(false)
    }
  }, [])

  const refreshAll = React.useCallback(() => {
    loadDashboardData()
    loadPaymentTrend()
  }, [loadDashboardData, loadPaymentTrend])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  // Compute Metrics from Real Product Data
  const totalAvailableQty = products.reduce((sum, p) => sum + (p.availableQuantity || 0), 0)
  const totalRentedQty = products.reduce((sum, p) => sum + (p.rentedQuantity || 0), 0)
  const totalDamagedQty = products.reduce((sum, p) => sum + (p.damagedQuantity || 0), 0)
  const totalLostQty = products.reduce((sum, p) => sum + (p.lostQuantity || 0), 0)

  const [defaultMinStock, setDefaultMinStock] = useState<number>(() => getDefaultMinimumStock())
  useEffect(() => {
    const handleSettingsChanged = () => setDefaultMinStock(getDefaultMinimumStock())
    window.addEventListener('app_settings_changed', handleSettingsChanged)
    return () => window.removeEventListener('app_settings_changed', handleSettingsChanged)
  }, [])

  // Low stock products: filtered and sorted by availableQuantity ascending (lowest/most urgent first)
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => defaultMinStock > 0 && (p.availableQuantity || 0) <= defaultMinStock)
      .sort((a, b) => {
        return (a.availableQuantity || 0) - (b.availableQuantity || 0)
      })
  }, [products, defaultMinStock])

  // Bill stats
  const billStats = useMemo(() => {
    const todayStr = getLocalDateString()
    let active = 0
    let partialReturned = 0
    let dueToday = 0
    let overdue = 0

    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)

    bills.forEach((b) => {
      if (b.rentalStatus === 'CLOSED' || b.rentalStatus === 'CANCELLED') return

      if (b.rentalStatus === 'RENTING') active += 1
      if (b.rentalStatus === 'PARTIAL_RETURNED') partialReturned += 1

      if (b.scheduledReturnDate) {
        const sDate = b.scheduledReturnDate.slice(0, 10)
        if (sDate === todayStr) {
          dueToday += 1
        }
        const s = new Date(b.scheduledReturnDate)
        s.setHours(0, 0, 0, 0)
        if (s.getTime() < todayDate.getTime()) {
          overdue += 1
        }
      }
    })

    return { active, partialReturned, dueToday, overdue }
  }, [bills])

  // Today's Work: Appointments today + Bills scheduled to return today + Partial returned bills
  const todayStr = getLocalDateString()
  const todayAppointments = useMemo(() => {
    return appointments.filter((apt) => apt.date === todayStr)
  }, [appointments, todayStr])

  const dueTodayBills = useMemo(() => {
    return bills.filter(
      (b) =>
        b.rentalStatus !== 'CLOSED' &&
        b.rentalStatus !== 'CANCELLED' &&
        b.scheduledReturnDate?.slice(0, 10) === todayStr
    )
  }, [bills, todayStr])

  const partialReturnedBills = useMemo(() => {
    return bills.filter((b) => b.rentalStatus === 'PARTIAL_RETURNED')
  }, [bills])

  // Overdue bills with overdue days
  const overdueBills = useMemo(() => {
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    return bills
      .filter((b) => {
        if (b.rentalStatus === 'CLOSED' || b.rentalStatus === 'CANCELLED' || !b.scheduledReturnDate) return false
        const s = new Date(b.scheduledReturnDate)
        s.setHours(0, 0, 0, 0)
        return s.getTime() < todayDate.getTime()
      })
      .map((b) => {
        const s = new Date(b.scheduledReturnDate!)
        s.setHours(0, 0, 0, 0)
        const overdueDays = Math.max(1, Math.round((todayDate.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)))
        return { ...b, overdueDays }
      })
      .sort((a, b) => b.overdueDays - a.overdueDays)
  }, [bills])

  // Top Debtors
  const topDebtors = useMemo(() => {
    const debtorMap: Record<string, { customerName: string; customerPhone: string; outstanding: number; billCount: number }> = {}
    bills.forEach((b) => {
      if (b.rentalStatus === 'CLOSED' || b.rentalStatus === 'CANCELLED') return
      const out = b.outstandingAmount || 0
      if (out > 0) {
        const key = b.customerName || 'ลูกค้าทั่วไป'
        if (!debtorMap[key]) {
          debtorMap[key] = {
            customerName: key,
            customerPhone: b.customerPhone || '-',
            outstanding: 0,
            billCount: 0,
          }
        }
        debtorMap[key].outstanding += out
        debtorMap[key].billCount += 1
      }
    })
    return Object.values(debtorMap).sort((a, b) => b.outstanding - a.outstanding).slice(0, 5)
  }, [bills])

  return (
    <div className="p-2.5 sm:p-3 md:p-3.5 lg:p-5 xl:p-6 bg-slate-100 dark:bg-slate-900 space-y-2.5 sm:space-y-3 md:space-y-3.5 lg:space-y-5 xl:space-y-6 text-slate-900 dark:text-slate-100 min-w-0 max-w-full overflow-x-hidden">
      {/* Top Header & 7 Quick Action Buttons */}
      <div className="flex flex-col md:flex-col lg:flex-row items-start lg:items-center justify-between gap-2 sm:gap-2.5 lg:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-black text-slate-900 dark:text-slate-100">
            ภาพรวมระบบเช่าอุปกรณ์
          </h2>
        </div>

        {/* 7 Quick Action Buttons - Strictly single-row on tablet portrait & landscape */}
        <div className="flex flex-nowrap items-center gap-1 sm:gap-1.5 md:gap-1 lg:gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar py-0.5">
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
      </div>

      {/* Row 1: 6 KPI Cards - Single row on Tablet Portrait */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="w-7 h-7 sm:w-8 sm:h-8 border-3 sm:border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <span className="ml-3 text-xs sm:text-sm text-slate-500 font-semibold">กำลังโหลดข้อมูล...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-1.5 sm:gap-2 md:gap-1.5 lg:gap-2.5 xl:gap-3">
          {/* 1. รับเงินวันนี้ */}
          <div className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 md:p-1.5 lg:p-3.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs min-w-0">
            <span className="text-[10px] sm:text-[10.5px] md:text-[9.5px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              รับเงินวันนี้
            </span>
            <h3 className="text-sm sm:text-base md:text-xs lg:text-lg xl:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
              ฿{todayFinance.income.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>

          {/* 2. รับเงินเดือนนี้ */}
          <div className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 md:p-1.5 lg:p-3.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs min-w-0">
            <span className="text-[10px] sm:text-[10.5px] md:text-[9.5px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              รับเงินเดือนนี้
            </span>
            <h3 className="text-sm sm:text-base md:text-xs lg:text-lg xl:text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5 truncate">
              ฿{monthlyFinance.income.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>

          {/* 3. ยอดค้างชำระทั้งหมด */}
          <div className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 md:p-1.5 lg:p-3.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs min-w-0">
            <span className="text-[10px] sm:text-[10.5px] md:text-[9.5px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              ยอดค้างชำระทั้งหมด
            </span>
            <h3 className="text-sm sm:text-base md:text-xs lg:text-lg xl:text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 truncate">
              ฿{todayFinance.outstanding.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>

          {/* 4. บิลกำลังเช่า */}
          <div className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 md:p-1.5 lg:p-3.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs min-w-0">
            <span className="text-[10px] sm:text-[10.5px] md:text-[9.5px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              บิลกำลังเช่า
            </span>
            <h3 className="text-sm sm:text-base md:text-xs lg:text-lg xl:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5 truncate">
              {billStats.active.toLocaleString()} บิล
            </h3>
          </div>

          {/* 5. บิลเกินกำหนด */}
          <div className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 md:p-1.5 lg:p-3.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs min-w-0">
            <span className="text-[10px] sm:text-[10.5px] md:text-[9.5px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              บิลเกินกำหนด
            </span>
            <h3 className="text-sm sm:text-base md:text-xs lg:text-lg xl:text-xl font-black text-red-600 dark:text-red-400 mt-0.5 truncate">
              {billStats.overdue.toLocaleString()} บิล
            </h3>
          </div>

          {/* 6. สินค้าพร้อมใช้ */}
          <div className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 md:p-1.5 lg:p-3.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs min-w-0">
            <span className="text-[10px] sm:text-[10.5px] md:text-[9.5px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              สินค้าพร้อมใช้
            </span>
            <h3 className="text-sm sm:text-base md:text-xs lg:text-lg xl:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
              {totalAvailableQty.toLocaleString()} หน่วย
            </h3>
          </div>
        </div>
      )}

      {/* Row 1b: Extra KPI Cards — Reserved / Backorder / Deposit / Pending Dispatch */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 md:gap-1.5 lg:gap-2.5 xl:gap-3">
          {/* Reserved Stock */}
          <div className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 md:p-1.5 lg:p-3.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs min-w-0">
            <span className="text-[10px] sm:text-[10.5px] md:text-[9.5px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              สินค้าจอง
            </span>
            <h3 className="text-sm sm:text-base md:text-xs lg:text-lg xl:text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5 truncate">
              {reservedQty.toLocaleString()} หน่วย
            </h3>
          </div>

          {/* Backorder Pending */}
          <div className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 md:p-1.5 lg:p-3.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs min-w-0">
            <span className="text-[10px] sm:text-[10.5px] md:text-[9.5px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              Backorder รอดำเนินการ
            </span>
            <h3 className="text-sm sm:text-base md:text-xs lg:text-lg xl:text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 truncate">
              {backorderCount.toLocaleString()} รายการ
            </h3>
          </div>

          {/* Deposit Held Today */}
          <div className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 md:p-1.5 lg:p-3.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs min-w-0">
            <span className="text-[10px] sm:text-[10.5px] md:text-[9.5px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              มัดจำค้างอยู่วันนี้
            </span>
            <h3 className="text-sm sm:text-base md:text-xs lg:text-lg xl:text-xl font-black text-teal-600 dark:text-teal-400 mt-0.5 truncate">
              ฿{depositHeld.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>

          {/* Pending Dispatch */}
          <div className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 md:p-1.5 lg:p-3.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs min-w-0">
            <span className="text-[10px] sm:text-[10.5px] md:text-[9.5px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              รอจัดส่ง
            </span>
            <h3 className="text-sm sm:text-base md:text-xs lg:text-lg xl:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5 truncate">
              {pendingDispatch.toLocaleString()} บิล
            </h3>
          </div>
        </div>
      )}

      {/* Row 2: Payment Trend | Inventory Status Donut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 md:gap-3 lg:gap-5 xl:gap-6">
        <PaymentTrendChart
          data={paymentTrend}
          isLoading={paymentTrendLoading}
          onRefresh={loadPaymentTrend}
        />
        <StockDonutChart
          available={totalAvailableQty}
          rented={totalRentedQty}
          reserved={reservedQty}
          damaged={totalDamagedQty}
          lost={totalLostQty}
          totalProducts={products.length}
        />
      </div>

      {/* Row 3: งานส่งและรับคืนสินค้าวันนี้ | ลูกค้าที่มีหนี้ค้างชำระสูงสุด */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 md:gap-3 lg:gap-5 xl:gap-6">
        {/* งานส่งและรับคืนสินค้าวันนี้ */}
        <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 md:p-3.5 lg:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 sm:space-y-2.5 md:space-y-2.5 lg:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 sm:pb-2.5 lg:pb-3">
            <h3 className="font-bold text-xs sm:text-sm md:text-sm lg:text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5 md:gap-2">
              <CalendarPlus className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                งานส่งและรับคืนสินค้าวันนี้ (
                {todayAppointments.length + dueTodayBills.length + partialReturnedBills.length}
                )
              </span>
            </h3>
            <Link
              href="/appointments"
              className="text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>ดูนัดหมายทั้งหมด</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>

          <div className="space-y-1.5 md:space-y-2 lg:space-y-2.5 text-xs max-h-[260px] md:max-h-[260px] lg:max-h-[340px] overflow-y-auto pr-1">
            {todayAppointments.length === 0 &&
            dueTodayBills.length === 0 &&
            partialReturnedBills.length === 0 ? (
              <div className="p-4 sm:p-6 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700/60">
                ไม่มีงานนัดหมายหรืองานรับคืนสินค้าที่ต้องทำในวันนี้
              </div>
            ) : (
              <>
                {/* Due Today Bills */}
                {dueTodayBills.map((b) => (
                  <div
                    key={`due-${b.id}`}
                    className="p-2 sm:p-2.5 md:p-2.5 lg:p-3 rounded-xl border bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 flex justify-between items-center gap-1.5 md:gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold text-[9px] md:text-[9.5px] lg:text-[10px]">
                          ครบกำหนดคืนวันนี้
                        </span>
                        <span className="font-bold text-xs md:text-xs lg:text-sm text-slate-900 dark:text-slate-100">{b.billNo}</span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] md:text-[10px] lg:text-[11px] block mt-0.5 truncate">
                        ลูกค้า: {b.customerName} ({b.customerPhone || '-'})
                      </span>
                    </div>
                    <Link
                      href="/bills"
                      className="h-7 sm:h-7.5 lg:h-8 px-2 sm:px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] md:text-[10px] lg:text-[11px] transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                    >
                      รับคืนสินค้า
                    </Link>
                  </div>
                ))}

                {/* Partial Returned Bills */}
                {partialReturnedBills.map((b) => (
                  <div
                    key={`partial-${b.id}`}
                    className="p-2 sm:p-2.5 md:p-2.5 lg:p-3 rounded-xl border bg-purple-50/60 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900 flex justify-between items-center gap-1.5 md:gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-bold text-[9px] md:text-[9.5px] lg:text-[10px]">
                          คืนบางส่วน (ยังค้าง)
                        </span>
                        <span className="font-bold text-xs md:text-xs lg:text-sm text-slate-900 dark:text-slate-100">{b.billNo}</span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] md:text-[10px] lg:text-[11px] block mt-0.5 truncate">
                        ลูกค้า: {b.customerName} ({b.customerPhone || '-'})
                      </span>
                    </div>
                    <Link
                      href="/bills"
                      className="h-7 sm:h-7.5 lg:h-8 px-2 sm:px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[10px] md:text-[10px] lg:text-[11px] transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                    >
                      รับคืนต่อ
                    </Link>
                  </div>
                ))}

                {/* Appointments Today */}
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={`p-2 sm:p-2.5 md:p-2.5 lg:p-3 rounded-xl border flex justify-between items-center gap-1.5 md:gap-2 ${
                      apt.type === 'DELIVERY'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900'
                        : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold text-[9px] md:text-[9.5px] lg:text-[10px] text-white ${
                            apt.type === 'DELIVERY' ? 'bg-blue-600' : 'bg-emerald-600'
                          }`}
                        >
                          {apt.type === 'DELIVERY' ? 'นัดส่งของ' : 'นัดรับคืน'}
                        </span>
                        <span className="font-bold text-xs md:text-xs lg:text-sm text-slate-900 dark:text-slate-100 truncate">
                          {apt.title}
                        </span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] md:text-[10px] lg:text-[11px] block mt-0.5 truncate">
                        ลูกค้า: {apt.customerName} ({apt.startTime} น.)
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-bold text-[10px] md:text-[10px] lg:text-[11px] shrink-0 ${
                        apt.status === 'DONE'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {apt.status === 'DONE' ? 'เสร็จแล้ว' : 'รอดำเนินการ'}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ลูกค้าที่มีหนี้ค้างชำระสูงสุด (Top Debtors) — ห้ามมียอดค้างรวมซ้ำในกล่องนี้ */}
        <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 md:p-3.5 lg:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 sm:space-y-2.5 md:space-y-2.5 lg:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 sm:pb-2.5 lg:pb-3">
            <h3 className="font-bold text-xs sm:text-sm md:text-sm lg:text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5 md:gap-2">
              <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>ลูกค้าที่มีหนี้ค้างชำระสูงสุด</span>
            </h3>
            <Link
              href="/customers"
              className="text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>ดูลูกค้าทั้งหมด</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>

          <div className="space-y-1.5 md:space-y-2 text-xs max-h-[260px] md:max-h-[260px] lg:max-h-[340px] overflow-y-auto pr-1">
            {topDebtors.length === 0 ? (
              <div className="p-4 sm:p-6 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700/60">
                ไม่มีข้อมูลลูกค้าค้างชำระ
              </div>
            ) : (
              topDebtors.map((d, idx) => (
                <div
                  key={d.customerName + idx}
                  className="p-2 sm:p-2.5 md:p-2.5 lg:p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/60 flex justify-between items-center gap-1.5 md:gap-2"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-black text-[10px] sm:text-[11px] md:text-[10px] lg:text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-xs md:text-xs lg:text-sm text-slate-900 dark:text-slate-100 block truncate">
                        {d.customerName}
                      </span>
                      <span className="text-[9px] md:text-[9.5px] lg:text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                        {d.customerPhone} ({d.billCount} บิล)
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-amber-600 dark:text-amber-400 text-xs md:text-xs lg:text-sm font-mono block">
                      ฿{d.outstanding.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 4: งานที่เลยกำหนดคืน | สินค้าที่ต่ำกว่าจำนวนขั้นต่ำ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 md:gap-3 lg:gap-5 xl:gap-6">
        {/* งานที่เลยกำหนดคืน */}
        <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 md:p-3.5 lg:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 sm:space-y-2.5 md:space-y-2.5 lg:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 sm:pb-2.5 lg:pb-3">
            <h3 className="font-bold text-xs sm:text-sm md:text-sm lg:text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5 md:gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-red-500 shrink-0" />
              <span>งานที่เลยกำหนดคืน ({overdueBills.length})</span>
            </h3>
            <Link
              href="/bills"
              className="text-[11px] sm:text-xs text-red-600 dark:text-red-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>ไปหน้าบิล</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>

          <div className="space-y-1.5 md:space-y-2 lg:space-y-2.5 text-xs max-h-[260px] md:max-h-[260px] lg:max-h-[340px] overflow-y-auto pr-1">
            {overdueBills.length === 0 ? (
              <div className="p-4 sm:p-6 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700/60">
                ไม่มีบิลหรือรายการที่เลยกำหนดคืนในขณะนี้
              </div>
            ) : (
              overdueBills.slice(0, 6).map((b) => (
                <div
                  key={b.id}
                  className="p-2 sm:p-2.5 md:p-2.5 lg:p-3 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex justify-between items-center gap-1.5 md:gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                      <span className="font-black text-xs md:text-xs lg:text-sm text-red-700 dark:text-red-300">{b.billNo}</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[9px] md:text-[9.5px] lg:text-[10px]">
                        เกิน {b.overdueDays} วัน
                      </span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-300 text-[10px] md:text-[10px] lg:text-[11px] block mt-0.5 truncate">
                      ลูกค้า: {b.customerName} ({b.customerPhone || '-'})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span className="font-mono text-red-600 dark:text-red-400 font-black text-xs md:text-xs lg:text-sm">
                      ฿{(b.outstandingAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                    <Link
                      href="/bills"
                      className="h-7 sm:h-7.5 lg:h-8 px-2 sm:px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px] md:text-[10px] lg:text-[11px] transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                    >
                      ติดตามคืน
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* สินค้าที่ต่ำกว่าจำนวนขั้นต่ำ (แสดงสูงสุด 6 รายการ เรียงจากน้อยสุด มีปุ่มดูทั้งหมด) */}
        <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 md:p-3.5 lg:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 sm:space-y-2.5 md:space-y-2.5 lg:space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 sm:pb-2.5 lg:pb-3 shrink-0">
            <h3 className="font-bold text-xs sm:text-sm md:text-sm lg:text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5 md:gap-2">
              <Package className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-red-500 shrink-0" />
              <span>สินค้าที่ต่ำกว่าจำนวนขั้นต่ำ ({lowStockProducts.length})</span>
            </h3>
            <Link
              href="/products"
              className="text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>ดูทั้งหมด ({lowStockProducts.length})</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>

          <div className="space-y-1.5 md:space-y-2 text-xs flex-1 max-h-[260px] md:max-h-[260px] lg:max-h-[340px] overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="p-4 sm:p-6 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700/60">
                สินค้าทุกรายการมีจำนวนคงเหลือเพียงพอ (พร้อมใช้งาน)
              </div>
            ) : (
              lowStockProducts.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="p-2 sm:p-2.5 md:p-2.5 lg:p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex justify-between items-center gap-1.5 md:gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                      <span className="font-bold text-xs md:text-xs lg:text-sm text-slate-900 dark:text-slate-100 truncate">
                        {p.name}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] md:text-[10px] lg:text-[11px] block mt-0.5">
                      ขั้นต่ำ: {defaultMinStock} | คงเหลือพร้อมใช้:{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {p.availableQuantity || 0}
                      </strong>{' '}
                      {p.unit}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 md:px-2 md:py-0.5 lg:px-2.5 lg:py-1 rounded-full font-bold text-[9px] md:text-[9.5px] lg:text-[10px] shrink-0 ${
                      (p.availableQuantity || 0) === 0
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900'
                    }`}
                  >
                    {(p.availableQuantity || 0) === 0 ? 'หมดสต็อก' : 'เหลือน้อย'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      <NewCustomerModal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        onSave={(c) => {
          addCustomer(c)
          setShowNewCustomerModal(false)
          refreshAll()
        }}
      />

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        isOpen={showAddAppointmentModal}
        onClose={() => setShowAddAppointmentModal(false)}
        onSave={(newApt) => {
          addAppointment(newApt)
          setShowAddAppointmentModal(false)
          refreshAll()
        }}
      />

      {/* Centralized Stock Count Modal */}
      <StockCountModal
        isOpen={showStockCountModal}
        onClose={() => {
          setShowStockCountModal(false)
          refreshAll()
        }}
        products={products}
      />
    </div>
  )
}
