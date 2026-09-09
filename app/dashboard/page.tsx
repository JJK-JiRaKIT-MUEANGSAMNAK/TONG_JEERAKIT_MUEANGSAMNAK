'use client'

import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { Appointment, Product } from '@/lib/types/rental-pos'
import { logger } from '@/lib/utils/logger'
import { NewCustomerModal } from '@/components/customers/NewCustomerModal'
import { StockCountModal } from '@/components/products/StockCountModal'
import { getLocalDateString } from '@/components/common/CustomDatePicker'
import { AddAppointmentModal } from '@/components/appointments/AddAppointmentModal'
import { PaymentTrendChart, DailyPaymentTrend } from '@/components/dashboard/PaymentTrendChart'

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [paymentTrend, setPaymentTrend] = useState<DailyPaymentTrend[]>([])
  const [paymentTrendLoading, setPaymentTrendLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [todayFinance, setTodayFinance] = useState({ income: 0, expense: 0, outstanding: 0 })
  const [billStats, setBillStats] = useState({ active: 0, partialReturned: 0, dueToday: 0, overdue: 0 })

  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(false)
  }, [])

  const loadPaymentTrend = React.useCallback(async () => {
    setPaymentTrendLoading(false)
  }, [])

  const refreshAll = React.useCallback(() => {
    loadDashboardData()
    loadPaymentTrend()
  }, [loadDashboardData, loadPaymentTrend])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  // Compute Metrics from Real Product Data
  const totalRentedQty = products.reduce((sum, p) => sum + (p.rentedQuantity || 0), 0)
  const totalDamagedQty = products.reduce((sum, p) => sum + (p.damagedQuantity || 0), 0)
  const totalLostQty = products.reduce((sum, p) => sum + (p.lostQuantity || 0), 0)
  const lowStockProducts = products.filter((p) => p.minimumStock > 0 && (p.availableQuantity || 0) <= p.minimumStock)

  const todayStr = getLocalDateString()
  const todayAppointments = appointments.filter((apt) => apt.date === todayStr)

  // Modal states
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false)
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false)
  const [showStockCountModal, setShowStockCountModal] = useState(false)


  return (
    <div className="p-3 sm:p-4 xl:p-6 bg-slate-100 dark:bg-slate-900 space-y-4 sm:space-y-5 xl:space-y-6">
      {/* Top Header & 7 Quick Action Buttons (ข้อ 4.3) */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            ภาพรวมระบบเช่าอุปกรณ์
          </h2>
        </div>

        {/* 7 Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Link
            href="/pos"
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>เปิด POS</span>
          </Link>
          <button
            onClick={() => setShowNewCustomerModal(true)}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มลูกค้า</span>
          </button>
          <button
            onClick={() => setShowAddAppointmentModal(true)}
            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>เพิ่มนัดหมาย</span>
          </button>
          <Link
            href="/bills"
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>รับคืนสินค้า</span>
          </Link>
          <Link
            href="/bills"
            className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>รับชำระเงิน</span>
          </Link>
          <Link
            href="/quotations"
            className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>สร้างใบเสนอราคา</span>
          </Link>
          <button
            onClick={() => setShowStockCountModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <ClipboardList className="w-4 h-4" />
            <span>ตรวจนับสินค้า</span>
          </button>
        </div>
      </div>

      {/* 11 Summary Cards (ข้อ 4.1) */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <span className="ml-3 text-sm text-slate-500 font-semibold">กำลังโหลดข้อมูล...</span>
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold block">ยอดรับเงินวันนี้</span>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">฿{todayFinance.income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold block">ยอดรายจ่ายวันนี้</span>
          <h3 className="text-xl font-black text-red-600 dark:text-red-400 mt-1">฿{todayFinance.expense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold block">ยอดสุทธิวันนี้</span>
          <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">฿{(todayFinance.income - todayFinance.expense).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold block">ยอดค้างชำระทั้งหมด</span>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">฿{todayFinance.outstanding.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold block">บิลกำลังเช่าอยู่</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{billStats.active} บิล</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold block">บิลคืนบางส่วน</span>
          <h3 className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">{billStats.partialReturned} บิล</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold block">บิลครบกำหนดวันนี้</span>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{billStats.dueToday} บิล</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold block">บิลเกินกำหนดคืน</span>
          <h3 className="text-xl font-black text-red-600 dark:text-red-400 mt-1">{billStats.overdue} บิล</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold block">สินค้าอยู่กับลูกค้า</span>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalRentedQty} หน่วย
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold block">สินค้าชำรุด</span>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalDamagedQty} หน่วย
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold block">สินค้าสูญหาย</span>
          <h3 className="text-xl font-black text-red-600 dark:text-red-400 mt-1">
            {totalLostQty} หน่วย
          </h3>
        </div>
      </div>
      )}

      {/* Main Work Area: 2 Columns (ข้อ 4.2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-6">
        {/* Left Column: Payment Trend Chart + Today Appointments, Delivery & Return Tasks */}
        <div className="min-w-0 space-y-4 xl:space-y-6">
          {/* Payment Trend Chart — 7-day line chart */}
          <PaymentTrendChart
            data={paymentTrend}
            isLoading={paymentTrendLoading}
            onRefresh={loadPaymentTrend}
          />

          <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-blue-600" />
                <span>งานส่งและรับคืนสินค้าวันนี้</span>
              </h3>
              <Link href="/appointments" className="text-xs text-blue-600 hover:underline font-semibold">
                ดูทั้งหมด
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`p-3 rounded-xl border flex justify-between items-center ${apt.type === 'DELIVERY'
                    ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900'
                    : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900'
                    }`}
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      {apt.title}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      ลูกค้า: {apt.customerName} ({apt.startTime} น.)
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] ${apt.status === 'DONE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                      }`}
                  >
                    {apt.status === 'DONE' ? 'เสร็จแล้ว' : 'รอดำเนินการ'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue Bills & Pending QR Payments */}
          {billStats.overdue > 0 && (
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>งานที่เลยกำหนด</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex justify-between items-center">
                <div>
                  <span className="font-bold text-red-900 dark:text-red-300 block">
                    มีบิลเลยกำหนดคืน {billStats.overdue} รายการ
                  </span>
                </div>
                <Link
                  href="/bills"
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold text-[11px]"
                >
                  ติดตามคืน
                </Link>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Right Column: Outstanding Debtors & Low Stock Alerts */}
        <div className="min-w-0 space-y-4 xl:space-y-6">
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <span>ลูกค้าที่มีหนี้ค้างชำระสูงสุด</span>
              </h3>
            </div>

            <div className="text-xs">
              {todayFinance.outstanding === 0 ? (
                <p className="text-slate-400 py-2">ไม่มีข้อมูลลูกค้าค้างชำระ</p>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center font-semibold">
                  <span className="text-slate-900 dark:text-slate-100 font-bold">
                    ยอดค้างชำระทั้งหมด: ฿{todayFinance.outstanding.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                  <Link
                    href="/bills"
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold text-[11px]"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col max-h-[380px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-red-500" />
                <span>สินค้าที่ต่ำกว่าจำนวนขั้นต่ำ ({lowStockProducts.length})</span>
              </h3>
              <Link href="/products" className="text-xs text-blue-600 hover:underline font-semibold shrink-0">
                ไปหน้าสต็อก
              </Link>
            </div>

            <div className="space-y-2 text-xs overflow-y-auto pr-1 flex-1 min-h-0 pt-3">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      {p.name} ({p.code})
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      ขั้นต่ำ: {p.minimumStock} | คงเหลือพร้อมใช้: {p.availableQuantity} {p.unit}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 font-bold text-[11px] shrink-0">
                    เหลือน้อย
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      <NewCustomerModal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        onSave={() => setShowNewCustomerModal(false)}
      />

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        isOpen={showAddAppointmentModal}
        onClose={() => setShowAddAppointmentModal(false)}
        onSave={(newApt) => {
          setAppointments((prev) => [newApt, ...prev])
        }}
      />

      {/* Centralized Stock Count Modal */}
      <StockCountModal
        isOpen={showStockCountModal}
        onClose={() => setShowStockCountModal(false)}
        products={products}
      />
    </div>
  )
}
