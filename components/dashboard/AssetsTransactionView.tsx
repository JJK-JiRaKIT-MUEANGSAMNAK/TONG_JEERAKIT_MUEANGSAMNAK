'use client'

import React from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CreditCard,
  ShoppingCart,
  Key,
  FileText,
  Package,
  Truck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { DashboardMetrics } from '@/lib/dashboard-data'
import {
  AreaTrendChart,
  SalesVsRentBarChart,
  DonutChart,
  VerticalBarChart,
} from './DashboardCharts'

interface ViewProps {
  metrics: DashboardMetrics
  onRefresh?: () => void
}

export function AssetsTransactionView({ metrics, onRefresh }: ViewProps) {
  const billStatusBarData = [
    { label: 'ชำระแล้ว', count: metrics.billStatusCounts.paid, color: '#10b981' },
    { label: 'กำลังดำเนินการ', count: metrics.billStatusCounts.inProgress, color: '#3b82f6' },
    { label: 'เกินกำหนด', count: metrics.billStatusCounts.overdue, color: '#f59e0b' },
    { label: 'ยกเลิก', count: metrics.billStatusCounts.cancelled, color: '#94a3b8' },
  ]

  const top5Tasks = metrics.todayKeyTasks.slice(0, 5)

  return (
    <div className="space-y-2">
      {/* 1. TOP 10 KPI (2 ROWS × 5) */}
      {/* Row 1: KPI 1 - 5 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* 1. รายรับ */}
        <div className="p-2 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">1. รายรับ</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                ฿{metrics.totalIncome.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                +{metrics.growthRate >= 0 ? metrics.growthRate : 12.5}%
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">ยอดรับเงินทั้งหมด (ขาย + เช่า)</span>
          </div>
        </div>

        {/* 2. รายจ่าย / เงินคืน */}
        <div className="p-2 bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl border border-rose-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">2. รายจ่าย / เงินคืน</span>
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                ฿{metrics.totalExpense.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400">+8.3%</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">ค่าใช้จ่ายและเงินคืนลูกค้า</span>
          </div>
        </div>

        {/* 3. รายรับสุทธิ */}
        <div className="p-2 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">3. รายรับสุทธิ</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                ฿{metrics.netIncome.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">+15.2%</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">หลังหักค่าใช้จ่ายแล้ว</span>
          </div>
        </div>

        {/* 4. ลูกหนี้ค้างชำระ */}
        <div className="p-2 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">4. ลูกหนี้ค้างชำระ</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                ฿{metrics.outstandingReceivable.toLocaleString()}
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">จำนวน {metrics.debtorCount} ราย</span>
          </div>
        </div>

        {/* 5. เงินมัดจำ */}
        <div className="p-2 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-500/20 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
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
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
                ฿{metrics.depositBalance.toLocaleString()}
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">จาก {metrics.depositCount} รายการ</span>
          </div>
        </div>
      </div>

      {/* Row 2: KPI 6 - 10 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* 6. ยอดขายสินค้า */}
        <div className="p-2 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">6. ยอดขายสินค้า</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                ฿{metrics.salesRevenue.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">+18.1%</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">จากการขายอุปกรณ์</span>
          </div>
        </div>

        {/* 7. รายได้จากการเช่า */}
        <div className="p-2 bg-teal-50/60 dark:bg-teal-950/30 rounded-2xl border border-teal-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">7. รายได้จากการเช่า</span>
            <div className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Key className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-teal-600 dark:text-teal-400 font-mono">
                ฿{metrics.rentalRevenue.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400">+10.2%</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">จากการให้เช่าอุปกรณ์</span>
          </div>
        </div>

        {/* 8. บิลที่กำลังดำเนินการ */}
        <div className="p-2 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">8. บิลที่กำลังดำเนินการ</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                {metrics.inProgressBillsCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-400">บิล</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">รอชำระ / รอดำเนินการ</span>
          </div>
        </div>

        {/* 9. งานเช่าปัจจุบัน */}
        <div className="p-2 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">9. งานเช่าปัจจุบัน</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                {metrics.activeRentalsCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-400">รายการ</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">รายการที่อยู่ระหว่างเช่า</span>
          </div>
        </div>

        {/* 10. งานส่ง / รับคืนวันนี้ */}
        <div className="p-2 bg-cyan-50/60 dark:bg-cyan-950/30 rounded-2xl border border-cyan-500/20 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">10. งานส่ง / รับคืนวันนี้</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {metrics.todayTasksCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-400">รายการ</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">
              ส่ง {metrics.todayDeliveriesCount} รายการ / รับคืน {metrics.todayReturnsCount} รายการ
            </span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: CHARTS (AreaTrendChart + SalesVsRentBarChart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Left: แนวโน้มกระแสเงินสดรายรับ-รายจ่าย (7 วันล่าสุด) */}
        <div className="lg:col-span-7 p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-3.5 bg-blue-500 rounded-full" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                แนวโน้มกระแสเงินสดรายรับ-รายจ่าย (7 วันล่าสุด)
              </h3>
            </div>
          </div>
          <AreaTrendChart
            data={metrics.recentTrend.map((t) => ({
              label: t.displayDate,
              income: t.income,
              expense: t.expense,
            }))}
            height={160}
          />
        </div>

        {/* Right: เปรียบเทียบรายได้จากการขาย vs การเช่า */}
        <div className="lg:col-span-5 p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                เปรียบเทียบรายได้จากการขาย vs การเช่า
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300">
              เดือนนี้
            </span>
          </div>
          <SalesVsRentBarChart
            salesRevenue={metrics.salesRevenue}
            rentalRevenue={metrics.rentalRevenue}
            height={160}
          />
        </div>
      </div>

      {/* 3. ROW 3: 4 CARDS (Donut, Bar, Top 5 Activity, Donut) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Card 1: สัดส่วนรายรับ (แยกตามประเภท) */}
        <div className="p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="w-1 h-3 bg-emerald-500 rounded-full" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
              สัดส่วนรายรับ (แยกตามประเภท)
            </h3>
          </div>
          <DonutChart
            data={metrics.incomeBreakdownData}
            size={110}
            centerTitle="รวม"
            centerPrefix="฿"
            centerSuffix="บาท"
          />
        </div>

        {/* Card 2: สถานะบิล (จำนวนรายการ) */}
        <div className="p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="w-1 h-3 bg-blue-500 rounded-full" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
              สถานะบิล (จำนวนรายการ)
            </h3>
          </div>
          <VerticalBarChart data={billStatusBarData} height={120} />
        </div>

        {/* Card 3: งานสำคัญวันนี้ (Top 5) */}
        <div className="p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-3 bg-amber-500 rounded-full" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                งานสำคัญวันนี้ (Top 5)
              </h3>
            </div>
          </div>
          {top5Tasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">ไม่มีงานสำคัญวันนี้</div>
          ) : (
            <div className="space-y-1.5">
              {top5Tasks.map((t, idx) => {
                const badgeBg =
                  t.type === 'DISPATCH'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : t.type === 'RETURN'
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                    : t.type === 'FOLLOWUP'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : t.type === 'INSPECT'
                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'

                return (
                  <div key={t.id || idx} className="flex items-center justify-between text-[11px] gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[9.5px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {t.itemsSummary}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${badgeBg}`}>
                        {t.typeLabel}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{t.time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Card 4: สัดส่วนเงินมัดจำ vs ลูกหนี้ค้างชำระ */}
        <div className="p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="w-1 h-3 bg-purple-500 rounded-full" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
              สัดส่วนเงินมัดจำ vs ลูกหนี้ค้างชำระ
            </h3>
          </div>
          <DonutChart
            data={metrics.depositVsDebtData}
            size={110}
            centerTitle="รวม"
            centerPrefix="฿"
            centerSuffix="บาท"
          />
        </div>
      </div>

      {/* 4. BOTTOM ROW: งาน / รายการสำคัญวันนี้ (TABLE) */}
      <div className="p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-blue-500" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
              งาน / รายการสำคัญวันนี้
            </h3>
          </div>
          <Link
            href="/bills"
            className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            ดูทั้งหมด <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {metrics.todayKeyTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            ไม่มีงานสำคัญค้างในวันนี้
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-bold text-slate-400">
                  <th className="py-2 px-2">เวลา</th>
                  <th className="py-2 px-2">ประเภท</th>
                  <th className="py-2 px-2">เลขที่เอกสาร</th>
                  <th className="py-2 px-2">ลูกค้า</th>
                  <th className="py-2 px-2">รายการ</th>
                  <th className="py-2 px-2 text-right">จำนวน</th>
                  <th className="py-2 px-2">สถานะ</th>
                  <th className="py-2 px-2">ผู้รับผิดชอบ</th>
                  <th className="py-2 px-2">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {metrics.todayKeyTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-1.5 px-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {t.time}
                    </td>
                    <td className="py-1.5 px-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${t.typeBadgeColor}`}>
                        {t.typeLabel}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 font-mono font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {t.billNo}
                    </td>
                    <td className="py-1.5 px-2 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {t.customerName}
                    </td>
                    <td className="py-1.5 px-2 text-slate-600 dark:text-slate-300 truncate max-w-xs">
                      {t.itemsSummary}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {t.quantity}
                    </td>
                    <td className="py-1.5 px-2 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${t.statusColor.replace('text-', 'bg-')}`} />
                        <span className={t.statusColor}>{t.status}</span>
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {t.assignee}
                    </td>
                    <td className="py-1.5 px-2 text-slate-400 text-[10.5px] truncate max-w-xs">
                      {t.remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
