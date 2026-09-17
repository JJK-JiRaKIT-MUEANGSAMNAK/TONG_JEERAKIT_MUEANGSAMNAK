'use client'

import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  CircleDollarSign,
  Receipt,
  UserCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  BusinessReportData,
  formatCurrency,
  formatNumber,
  formatThaiDate,
} from '@/lib/report-data'
import { ReportAreaTrendChart } from './ReportCharts'

export function BusinessReportView({ data }: { data: BusinessReportData }) {
  const isRevGrowthPos = data.revenueGrowth >= 0
  const isOrderGrowthPos = data.orderGrowth >= 0

  return (
    <div className="space-y-2">
      {/* ─── 1. TOPIC 4: GROWTH & PERFORMANCE COMPARISON KPIS ──────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Metric 1: การเติบโตของรายได้ (Revenue Growth) */}
        <div
          className={`p-2 rounded-xl border flex flex-col justify-between ${
            isRevGrowthPos
              ? 'border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <CircleDollarSign className="w-3.5 h-3.5 text-emerald-500" />
              รายได้และการเติบโต
            </span>
            <span
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-xs text-[9.5px] font-bold font-mono ${
                isRevGrowthPos
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isRevGrowthPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {data.revenueGrowth >= 0 ? '+' : ''}
              {data.revenueGrowth}%
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-slate-100">
              ฿{formatCurrency(data.currentRevenue)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              ช่วงก่อนหน้า: ฿{formatCurrency(data.previousRevenue)}
            </div>
          </div>
          <div className="text-[9.5px] text-slate-500 font-mono">
            {isRevGrowthPos ? 'รายได้เพิ่มขึ้นจากงวดก่อน' : 'รายได้ลดลงเมื่อเทียบงวดก่อน'}
          </div>
        </div>

        {/* Metric 2: จำนวนออเดอร์ / บิล (Order Volume) */}
        <div className="p-2 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-blue-500" />
              จำนวนบิลคำสั่งซื้อ
            </span>
            <span
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-xs text-[9.5px] font-bold font-mono ${
                isOrderGrowthPos
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-rose-500/10 text-rose-600'
              }`}
            >
              {data.orderGrowth >= 0 ? '+' : ''}
              {data.orderGrowth}%
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-blue-700 dark:text-blue-400">
              {formatNumber(data.currentOrders)}{' '}
              <span className="text-xs font-normal text-slate-500">บิล</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              ช่วงก่อนหน้า: {formatNumber(data.previousOrders)} บิล
            </div>
          </div>
          <div className="text-[9.5px] text-blue-600/80 dark:text-blue-400/80 font-bold">
            ปริมาณการทำธุรกรรม
          </div>
        </div>

        {/* Metric 3: ยอดเฉลี่ยต่อบิล (Average Ticket Size) */}
        <div className="p-2 rounded-xl border border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
              ยอดเฉลี่ยต่อบิล
            </span>
            <span className="px-1.5 py-0.5 rounded-xs text-[9.5px] font-bold font-mono bg-purple-500/10 text-purple-600">
              {data.avgTicketGrowth >= 0 ? '+' : ''}
              {data.avgTicketGrowth}%
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-purple-700 dark:text-purple-400">
              ฿{formatNumber(data.currentAvgTicket)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              ช่วงก่อนหน้า: ฿{formatNumber(data.previousAvgTicket)}
            </div>
          </div>
          <div className="text-[9.5px] text-purple-600/80 dark:text-purple-400/80 font-bold">
            มูลค่าต่อตะกร้าลูกค้า
          </div>
        </div>

        {/* Metric 4: ลูกค้าที่เข้ามาใช้บริการ (Active Customers) */}
        <div className="p-2 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              ลูกค้าที่มีการซื้อ/เช่า
            </span>
            <span className="px-1.5 py-0.5 rounded-xs text-[9.5px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {data.customerGrowth >= 0 ? '+' : ''}
              {data.customerGrowth}%
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-slate-100">
              {formatNumber(data.currentActiveCustomers)}{' '}
              <span className="text-xs font-normal text-slate-500">ราย</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              ช่วงก่อนหน้า: {formatNumber(data.previousActiveCustomers)} ราย
            </div>
          </div>
          <div className="text-[9.5px] text-slate-500 font-bold">
            การกระจายตัวของฐานลูกค้า
          </div>
        </div>
      </div>

      {/* ─── 2. TOPIC 19: REVENUE TREND LINE/AREA CHART ────────────────────── */}
      <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              กราฟแนวโน้มรายได้ (Line / Area รายวัน / รายเดือน)
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">
            วิเคราะห์ทิศทางและยอดขายย้อนหลัง
          </span>
        </div>

        <div className="flex-1 min-h-44">
          <ReportAreaTrendChart
            data={data.revenueTrend}
            series={[
              {
                name: 'รายได้รวม',
                key: 'revenue',
                color: '#10b981',
                gradientId: 'gradBizRev',
              },
            ]}
          />
        </div>
      </div>

      {/* ─── 3. TOPIC 17: TOP CUSTOMERS LEADERBOARD ────────────────────────── */}
      <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              ลูกค้าหลักที่สร้างรายได้สูงสุด (Top Customers Ranking)
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">เรียงตามยอดใช้จ่ายรวม</span>
        </div>

        {data.topCustomers.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center">
            ยังไม่มีข้อมูลลูกค้าที่ทำรายการในช่วงเวลานี้
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.topCustomers.map((c) => (
              <div
                key={c.customerId || c.customerName}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                      c.rank === 1
                        ? 'bg-amber-500 text-white shadow-xs'
                        : c.rank === 2
                        ? 'bg-slate-400 text-white'
                        : c.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    #{c.rank}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                      <span>{c.customerName}</span>
                      {c.tier === 'VIP' && (
                        <span className="px-1 py-0.2 rounded-xs text-[8.5px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {c.companyName || c.customerPhone || 'ลูกค้าบุคคล'}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                    ฿{formatCurrency(c.totalSpend)}
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {c.ordersCount} บิล
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 4. DETAILED CUSTOMER & PERFORMANCE RANKING TABLE ──────────────── */}
      <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              ตารางจัดอันดับลูกค้าและวิเคราะห์ย้อนหลัง ({data.customerRankings.length} รายการ)
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">จัดอันดับตามมูลค่าการใช้บริการ</span>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="overflow-y-auto overflow-x-auto min-h-[320px] max-h-[380px]">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="sticky top-0 z-20 bg-[#E3E3E3] dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 px-2 font-bold whitespace-nowrap text-center">อันดับ</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap">ชื่อลูกค้า</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap">เบอร์โทร</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap">สถานที่ / หน่วยงาน</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap text-center">จำนวนบิล</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap text-right text-emerald-600">
                    ยอดใช้จ่ายรวม
                  </th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap text-right text-amber-600">
                    หนี้ค้างชำระ
                  </th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap">ทำรายการล่าสุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.customerRankings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                      ไม่มีข้อมูลลูกค้าในช่วงเวลานี้
                    </td>
                  </tr>
                ) : (
                  data.customerRankings.map((c) => (
                    <tr key={c.rank} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-1 px-2 text-center font-mono font-bold text-slate-500">
                        #{c.rank}
                      </td>
                      <td className="py-1 px-2 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {c.customerName}
                      </td>
                      <td className="py-1 px-2 font-mono text-slate-500 whitespace-nowrap">
                        {c.phone}
                      </td>
                      <td className="py-1 px-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {c.company}
                      </td>
                      <td className="py-1 px-2 text-center font-mono font-bold">
                        {c.ordersCount}
                      </td>
                      <td className="py-1 px-2 font-mono font-bold text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        ฿{formatCurrency(c.totalSpend)}
                      </td>
                      <td className="py-1 px-2 font-mono font-bold text-right text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {c.outstandingDebt > 0 ? `฿${formatCurrency(c.outstandingDebt)}` : '-'}
                      </td>
                      <td className="py-1 px-2 font-mono text-slate-500 whitespace-nowrap">
                        {formatThaiDate(c.lastOrderDate)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
