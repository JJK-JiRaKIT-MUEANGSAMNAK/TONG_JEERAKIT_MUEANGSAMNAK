'use client'

import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  Calendar,
} from 'lucide-react'
import { DashboardMetrics } from '@/lib/dashboard-data'
import { AreaTrendChart, HorizontalBarChart } from './DashboardCharts'

interface ViewProps {
  metrics: DashboardMetrics
}

export function AssetsTransactionView({ metrics }: ViewProps) {
  return (
    <div className="space-y-3">
      {/* 1. TOP ROW: KPI 5 CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* รายรับ */}
        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">รายรับทั้งหมด</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ฿{metrics.totalIncome.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">ยอดรับชำระและเงินเข้า</span>
        </div>

        {/* รายจ่าย / คืนเงิน */}
        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">รายจ่าย / คืนเงิน</span>
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
              ฿{metrics.totalExpense.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">คืนมัดจำและค่าใช้จ่าย</span>
        </div>

        {/* รายรับสุทธิ */}
        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">รายรับสุทธิ</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
              ฿{metrics.netIncome.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">กระแสเงินสดหมุนเวียน</span>
        </div>

        {/* ลูกหนี้ค้างชำระ */}
        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">ลูกหนี้ค้างชำระ</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
              ฿{metrics.outstandingReceivable.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">บิลที่ยังไม่ชำระครบ</span>
        </div>

        {/* เงินมัดจำ */}
        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">เงินมัดจำถือครอง</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
              ฿{metrics.depositBalance.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">มัดจำประกันสินค้า</span>
        </div>
      </div>

      {/* 2. MIDDLE ROW: Line Trend Chart (Left) + Asset Status Bar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* แถวกลางซ้าย: Line/Area แนวโน้มรายรับ-รายจ่ายตามเวลา */}
        <div className="lg:col-span-2 p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">แนวโน้มกระแสเงินสด (7 วันล่าสุด)</h3>
              <p className="text-[10px] text-slate-400">เปรียบเทียบรายรับและรายจ่ายจากการคืนเงิน/ค่าใช้จ่าย</p>
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

        {/* แถวกลางขวา: Bar เปรียบเทียบสถานะสินทรัพย์ */}
        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">สถานะสินทรัพย์ & สต็อกรวม</h3>
            <p className="text-[10px] text-slate-400">การกระจายตัวของจำนวนสินค้าในระบบ</p>
          </div>
          <HorizontalBarChart data={metrics.assetStatusData} />
        </div>
      </div>

      {/* 3. LOWER ROW: 4 Status Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">สต็อกพร้อมใช้</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.availableStock.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">เช่า / จองคิว</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">
              {metrics.rentedOrReservedStock.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">ชำรุด / สูญหาย</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
              {metrics.damagedOrLostStock.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">รายการจอง Active</span>
            <span className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">
              {metrics.activeReservationsCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 4. FOOTER: URGENT TASKS COMPACT TABLE */}
      <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">งานที่ต้องจัดการเร่งด่วน</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {metrics.urgentTasks.length > 0 ? `${metrics.urgentTasks.length} รายการ` : 'ไม่มีงานค้าง'}
          </span>
        </div>

        {metrics.urgentTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            ไม่มีรายการงานด่วนที่ต้องดำเนินการ ทุกอย่างเรียบร้อย
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-[10.5px] font-bold text-slate-400">
                  <th className="py-1.5 px-2">ประเภท</th>
                  <th className="py-1.5 px-2">หัวข้อ</th>
                  <th className="py-1.5 px-2">รายละเอียด</th>
                  <th className="py-1.5 px-2 text-right">เวลา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics.urgentTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-2 px-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {task.type === 'BACKORDER_READY'
                          ? 'สต็อกพร้อม'
                          : task.type === 'RESERVATION_EXPIRING'
                          ? 'จองใกล้หมด'
                          : task.type === 'DISPATCH_DUE'
                          ? 'ถึงกำหนดส่ง'
                          : 'สต็อกต่ำ'}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {task.title}
                    </td>
                    <td className="py-2 px-2 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                      {task.message}
                    </td>
                    <td className="py-2 px-2 text-right text-[10px] font-mono text-slate-400 whitespace-nowrap">
                      {task.createdAt ? task.createdAt.slice(0, 10) : '-'}
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
