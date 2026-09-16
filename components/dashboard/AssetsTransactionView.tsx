'use client'

import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertTriangle,
  ShoppingBag,
  Receipt,
  FileText,
  Layers,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { DashboardMetrics } from '@/lib/dashboard-data'
import { AreaTrendChart } from './DashboardCharts'

interface ViewProps {
  metrics: DashboardMetrics
  onRefresh?: () => void
}

export function AssetsTransactionView({ metrics, onRefresh }: ViewProps) {
  return (
    <div className="space-y-2">
      {/* 1. TOP ROW: KPI 1 - 5 (การเงิน) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* 1. รายรับ */}
        <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">1. รายรับ</span>
            <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-0.5">
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ฿{metrics.totalIncome.toLocaleString()}
            </span>
          </div>
          <span className="text-[9.5px] text-slate-400 block truncate">ยอดเงินเข้าทั้งหมด</span>
        </div>

        {/* 2. รายจ่าย / เงินคืน */}
        <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">2. รายจ่าย / เงินคืน</span>
            <div className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-0.5">
            <span className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
              ฿{metrics.totalExpense.toLocaleString()}
            </span>
          </div>
          <span className="text-[9.5px] text-slate-400 block truncate">คืนมัดจำและค่าใช้จ่าย</span>
        </div>

        {/* 3. รายรับสุทธิ */}
        <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">3. รายรับสุทธิ</span>
            <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <DollarSign className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-0.5">
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
              ฿{metrics.netIncome.toLocaleString()}
            </span>
          </div>
          <span className="text-[9.5px] text-slate-400 block truncate">กระแสเงินสดหมุนเวียน</span>
        </div>

        {/* 4. ลูกหนี้ค้างชำระ */}
        <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">4. ลูกหนี้ค้างชำระ</span>
            <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-0.5">
            <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
              ฿{metrics.outstandingReceivable.toLocaleString()}
            </span>
          </div>
          <span className="text-[9.5px] text-slate-400 block truncate">บิลที่ยังไม่ชำระครบ</span>
        </div>

        {/* 5. เงินมัดจำ + ปุ่ม Refresh มุมขวาบน */}
        <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">5. เงินมัดจำ</span>
            <div className="flex items-center gap-1">
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="รีเฟรชข้อมูล"
                  aria-label="รีเฟรชข้อมูล"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
              <div className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <CreditCard className="w-3 h-3" />
              </div>
            </div>
          </div>
          <div className="mt-0.5">
            <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
              ฿{metrics.depositBalance.toLocaleString()}
            </span>
          </div>
          <span className="text-[9.5px] text-slate-400 block truncate">เงินมัดจำถือครอง</span>
        </div>
      </div>

      {/* 2. SECOND ROW: KPI 6 - 10 (ยอดขาย, รายได้เช่า, บิลดำเนินการ, งานเช่า, งานวันนี้) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* 6. ยอดขายสินค้า */}
        <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">6. ยอดขายสินค้า</span>
            <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShoppingBag className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-0.5">
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ฿{metrics.salesRevenue.toLocaleString()}
            </span>
          </div>
          <span className="text-[9.5px] text-slate-400 block truncate">ขายขาดและอุปกรณ์</span>
        </div>

        {/* 7. รายได้จากการเช่า */}
        <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">7. รายได้จากการเช่า</span>
            <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Receipt className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-0.5">
            <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
              ฿{metrics.rentalRevenue.toLocaleString()}
            </span>
          </div>
          <span className="text-[9.5px] text-slate-400 block truncate">ค่าเช่าสินค้าทั้งหมด</span>
        </div>

        {/* 8. บิลที่กำลังดำเนินการ */}
        <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">8. บิลกำลังดำเนินการ</span>
            <div className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <FileText className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {metrics.inProgressBillsCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">บิล</span>
          </div>
          <span className="text-[9.5px] text-slate-400 block truncate">อยู่ระหว่างเช่า/ส่งมอบ</span>
        </div>

        {/* 9. งานเช่าปัจจุบัน */}
        <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">9. งานเช่าปัจจุบัน</span>
            <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Layers className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
              {metrics.activeRentalsCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">รายการ</span>
          </div>
          <span className="text-[9.5px] text-slate-400 block truncate">สินค้าที่ลูกค้าถือครอง</span>
        </div>

        {/* 10. งานส่ง / รับคืนวันนี้ */}
        <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">10. งานส่ง/รับคืนวันนี้</span>
            <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
              {metrics.todayTasksCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">รายการ</span>
          </div>
          <span className="text-[9.5px] text-slate-400 block truncate">
            ส่ง {metrics.todayDeliveriesCount} • รับคืน {metrics.todayReturnsCount}
          </span>
        </div>
      </div>

      {/* 3. THIRD ROW: กราฟรายรับ/รายจ่าย (แสดงข้อ 1 - 3) */}
      <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
              แนวโน้มกระแสเงินสดรายรับ-รายจ่าย (7 วันล่าสุด)
            </h3>
            <p className="text-[10px] text-slate-400">
              วิเคราะห์รายรับ รายจ่าย และรายรับสุทธิตามช่วงเวลา
            </p>
          </div>
        </div>
        <AreaTrendChart
          data={metrics.recentTrend.map((t) => ({
            label: t.displayDate,
            income: t.income,
            expense: t.expense,
          }))}
          height={140}
        />
      </div>
    </div>
  )
}
