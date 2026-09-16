'use client'

import React from 'react'
import {
  TrendingUp,
  Award,
  Users,
  CreditCard,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { DashboardMetrics } from '@/lib/dashboard-data'
import { SingleAreaTrendChart, DonutChart } from './DashboardCharts'

interface ViewProps {
  metrics: DashboardMetrics
}

export function BusinessAnalyticsView({ metrics }: ViewProps) {
  const maxRevenueProduct = Math.max(...metrics.topRentedProducts.map((p) => p.revenue), 1)

  return (
    <div className="space-y-3">
      {/* 1. TOP GROWTH / KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">การเติบโตของธุรกิจ</span>
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                metrics.growthRate >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {metrics.growthRate >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`text-xl font-black font-mono ${
                metrics.growthRate >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {metrics.growthRate >= 0 ? `+${metrics.growthRate}%` : `${metrics.growthRate}%`}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">เทียบรายรับเดือนก่อนหน้า</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">รายรับรวมตลอดกาล</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ฿{metrics.totalIncome.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">เงินสด & โอนรวม</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">ลูกค้าทั้งหมดในระบบ</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {metrics.topCustomers.length.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">ราย</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">ลูกค้าที่มีธุรกรรมจริง</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">สินค้าทำเงินสูงสุด</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1 truncate">
            <span className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">
              {metrics.topRentedProducts[0]?.name || 'ยังไม่มีข้อมูล'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            ฿{(metrics.topRentedProducts[0]?.revenue || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2. MIDDLE ROW: Line Trend (Left) + Bar Top Revenue Products (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {/* Line/Area แนวโน้มรายรับรายเดือน */}
        <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">แนวโน้มรายรับรายเดือน (6 เดือนล่าสุด)</h3>
              <p className="text-[10px] text-slate-400">ประเมินทิศทางรายได้และการเติบโต</p>
            </div>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <SingleAreaTrendChart
            data={metrics.monthlyTrend.map((m) => ({
              label: m.month,
              value: m.revenue,
            }))}
            height={160}
            strokeColor="#3b82f6"
            gradId="businessTrendGrad"
          />
        </div>

        {/* Bar สินค้าทำเงินสูงสุด */}
        <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">สินค้าทำเงินสูงสุด (Top Revenue Products)</h3>
            <p className="text-[10px] text-slate-400">อันดับสินค้าสร้างรายได้รวมสูงสุด</p>
          </div>
          {metrics.topRentedProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">ยังไม่มีข้อมูลรายได้สินค้า</div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {metrics.topRentedProducts.slice(0, 5).map((p, idx) => {
                const pct = Math.max(5, Math.round((p.revenue / maxRevenueProduct) * 100))
                return (
                  <div key={p.id || idx} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{p.name}</span>
                      </div>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                        ฿{p.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. LOWER ROW: Ranking ลูกค้าหลัก + Donut ช่องทางรับเงิน */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {/* Ranking ลูกค้าหลัก */}
        <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">ลูกค้าหลัก (Top Customers)</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">ยอดใช้จ่ายสะสม</span>
          </div>

          {metrics.topCustomers.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">ยังไม่มีข้อมูลลูกค้า</div>
          ) : (
            <div className="space-y-1.5">
              {metrics.topCustomers.slice(0, 5).map((cust, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-500 font-black text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{cust.name}</p>
                      <p className="text-[10px] text-slate-400">{cust.billsCount} รายการบิล</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 font-mono">
                      ฿{cust.totalSpent.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Donut ช่องทางรับเงิน */}
        <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">สัดส่วนช่องทางรับเงิน (Payment Channels)</h3>
              <p className="text-[10px] text-slate-400">จำแนกตามเงินสด โอนเงิน บัตรเครดิต</p>
            </div>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>

          {metrics.paymentChannelsData.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">ยังไม่มีข้อมูลช่องทางชำระเงิน</div>
          ) : (
            <DonutChart
              data={metrics.paymentChannelsData.map((c) => ({
                label: c.label,
                value: c.amount,
                color: c.color,
                percentage: c.percentage,
              }))}
              size={135}
            />
          )}
        </div>
      </div>
    </div>
  )
}
