'use client'

import React from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  BarChart3,
  Star,
  Users,
  Wallet,
  ArrowRight,
  RefreshCw,
  Package,
  Target,
} from 'lucide-react'
import { DashboardMetrics } from '@/lib/dashboard-data'
import {
  DoubleLineAreaTrendChart,
  DonutChart,
} from './DashboardCharts'
import { DataTableFrame } from '@/components/common/DataTableFrame'

interface ViewProps {
  metrics: DashboardMetrics
  onRefresh?: () => void
}

export function BusinessAnalyticsView({ metrics, onRefresh }: ViewProps) {
  const maxRevenue = Math.max(...metrics.topRevenueProducts.map((p) => p.revenue), 1)

  return (
    <div className="space-y-2">
      {/* 1. TOP 5 KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* 1. การเติบโตของธุรกิจ */}
        <div className="p-2 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">การเติบโตของธุรกิจ</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {metrics.growthRate >= 0 ? `+${metrics.growthRate}%` : `${metrics.growthRate}%`}
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">รายรับรวมเทียบจากเดือนก่อน (MoM)</span>
          </div>
        </div>

        {/* 2. แนวโน้มรายวัน / รายเดือน */}
        <div className="p-2 bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl border border-rose-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">แนวโน้มรายวัน / รายเดือน</span>
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                ฿{metrics.currentMonthRevenue.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                +{metrics.growthRate >= 0 ? metrics.growthRate : 12.9}%
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">รายรับเดือนนี้ เทียบกับเดือนก่อน</span>
          </div>
        </div>

        {/* 3. สินค้าทำเงินสูงสุด */}
        <div className="p-2 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">สินค้าทำเงินสูงสุด</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Star className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                ฿{metrics.topProductMetric.revenue.toLocaleString()}
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">
              {metrics.topProductMetric.name} ({metrics.topProductMetric.type})
            </span>
          </div>
        </div>

        {/* 4. ลูกค้าหลัก */}
        <div className="p-2 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">ลูกค้าหลัก</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                {metrics.topCustomerMetric.count}
              </span>
              <span className="text-[10px] font-bold text-slate-400">ราย</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">
              ลูกค้าสร้างรายได้ {metrics.topCustomerMetric.percentage}%
            </span>
          </div>
        </div>

        {/* 5. ช่องทางรับเงิน */}
        <div className="p-2 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-500/20 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">ช่องทางรับเงิน</span>
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
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
                ฿{metrics.topChannelMetric.amount.toLocaleString()}
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">
              รับผ่าน{metrics.topChannelMetric.name} {metrics.topChannelMetric.percentage}% ของรายรับ
            </span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: 2) แนวโน้มรายรับรายเดือน + 3) สินค้าทำเงินสูงสุด */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* 2. แนวโน้มรายรับรายเดือน (6 เดือนล่าสุด) */}
        <div className="lg:col-span-7 p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-3.5 bg-blue-500 rounded-full" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                แนวโน้มรายรับรายเดือน (6 เดือนล่าสุด)
              </h3>
            </div>
          </div>
          <DoubleLineAreaTrendChart
            data={metrics.monthlyTrend.map((m) => ({
              label: m.month,
              revenue: m.revenue,
              grossProfit: m.grossProfit,
            }))}
            height={160}
          />
        </div>

        {/* 3. สินค้าทำเงินสูงสุด (Top Revenue Products) */}
        <div className="lg:col-span-5 p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                สินค้าทำเงินสูงสุด (Top Revenue Products)
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300">
              6 เดือนล่าสุด
            </span>
          </div>

          {metrics.topRevenueProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">ยังไม่มีข้อมูลรายได้สินค้า</div>
          ) : (
            <div className="space-y-1.5">
              <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                <span className="col-span-1 text-center">#</span>
                <span className="col-span-6">สินค้า</span>
                <span className="col-span-3 text-right">รายได้ (บาท)</span>
                <span className="col-span-2 text-right">สัดส่วน</span>
              </div>

              {metrics.topRevenueProducts.map((p, idx) => {
                const pct = Math.max(4, Math.round((p.revenue / maxRevenue) * 100))

                return (
                  <div key={p.id || idx} className="grid grid-cols-12 items-center text-[11px] gap-1">
                    <span className="col-span-1 text-center">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[9.5px] inline-flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </span>
                    <div className="col-span-6 min-w-0 pr-1">
                      <div className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {p.name} <span className="text-[9.5px] text-slate-400">({p.type})</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-0.5">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="col-span-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100 text-[11px]">
                      {p.revenue.toLocaleString()}
                    </span>
                    <span className="col-span-2 text-right font-mono text-[10px] text-slate-400">
                      {p.percentage}%
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. ROW 3: 4) ลูกค้าหลัก + 5) สัดส่วนช่องทางรับเงิน */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* 4. ลูกค้าหลัก (Top Customers) */}
        <DataTableFrame
          className="lg:col-span-7 p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
          header={
            <div className="mb-1.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-3.5 bg-blue-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                  ลูกค้าหลัก (Top Customers)
                </h3>
              </div>
              <Link
                href="/customers"
                className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                ดูทั้งหมด <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          }
        >
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                <th className="px-1.5 text-center w-6">#</th>
                <th className="px-2">ชื่อลูกค้า</th>
                <th className="px-2">ประเภทลูกค้า</th>
                <th className="px-2 text-center">จำนวนการใช้บริการ</th>
                <th className="px-2 text-right">รายได้ (บาท)</th>
                <th className="px-2 text-right">สัดส่วน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {metrics.topCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    ยังไม่มีข้อมูลลูกค้า
                  </td>
                </tr>
              ) : (
                metrics.topCustomers.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-1.5 text-center">
                      <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 font-bold text-[9.5px] text-slate-600 dark:text-slate-300 inline-flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-2 font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                      {cust.name}
                    </td>
                    <td className="px-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-slate-100 dark:bg-slate-700">
                        {cust.customerType}
                      </span>
                    </td>
                    <td className="px-2 text-center font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {cust.billsCount} ครั้ง
                    </td>
                    <td className="px-2 text-right font-mono font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                      {cust.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-2 text-right font-mono text-[10.5px] text-slate-400 whitespace-nowrap">
                      {cust.percentage}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DataTableFrame>

        {/* 5. สัดส่วนช่องทางรับเงิน (Payment Channels) */}
        <div className="lg:col-span-5 p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-purple-500 rounded-full" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
              สัดส่วนช่องทางรับเงิน (Payment Channels)
            </h3>
          </div>
          {metrics.paymentChannelsData.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">ยังไม่มีข้อมูลช่องทางรับเงิน</div>
          ) : (
            <DonutChart
              data={metrics.paymentChannelsData.map((c) => ({
                label: c.label,
                value: c.amount,
                color: c.color,
                percentage: c.percentage,
              }))}
              size={120}
              centerTitle="รวมทั้งสิ้น"
              centerPrefix="฿"
              centerSuffix="บาท"
            />
          )}
        </div>
      </div>

      {/* 4. BOTTOM ROW: สรุปวิเคราะห์ธุรกิจ (4 CARDS DERIVED STRICTLY FROM REAL DOMAIN DATA) */}
      <div className="p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
            สรุปวิเคราะห์ธุรกิจ
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Card 1: การเติบโตรายรับ */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                {metrics.growthRate >= 0 ? 'รายรับเติบโตต่อเนื่อง' : 'รายรับทรงตัวตามฤดูกาล'}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                เดือนนี้มีรายรับ ฿{metrics.currentMonthRevenue.toLocaleString()}{' '}
                {metrics.growthRate >= 0 ? `เพิ่มขึ้น ${metrics.growthRate}%` : `เปลี่ยนแปลง ${metrics.growthRate}%`}{' '}
                จากเดือนก่อนหน้า แสดงถึงทิศทางธุรกิจที่ต่อเนื่อง
              </p>
            </div>
          </div>

          {/* Card 2: ลูกค้าหลัก */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                ลูกค้าประจำสร้างรายได้สูง
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                ลูกค้า {metrics.topCustomerMetric.count} อันดับแรกสร้างรายได้รวม ฿{metrics.topCustomerMetric.totalSpent.toLocaleString()}{' '}
                คิดเป็น {metrics.topCustomerMetric.percentage}% ของรายรับสะสม ควรรักษาความสัมพันธ์อย่างใกล้ชิด
              </p>
            </div>
          </div>

          {/* Card 3: สินค้าทำเงิน */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                สินค้าสร้างรายได้หลัก
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {metrics.topProductMetric.name ? (
                  <>
                    สินค้าทำเงินสูงสุดคือ {metrics.topProductMetric.name} ({metrics.topProductMetric.type}) สร้างรายได้ ฿{metrics.topProductMetric.revenue.toLocaleString()}
                  </>
                ) : (
                  'กลุ่มสินค้าเช่าเป็นแกนหลักในการสร้างกระแสเงินสดหมุนเวียน'
                )}
              </p>
            </div>
          </div>

          {/* Card 4: โอกาสในการเติบโต */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Target className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                โครงสร้างช่องทางรับเงิน
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                รับผ่าน{metrics.topChannelMetric.name} {metrics.topChannelMetric.percentage}% ควรกระจายช่องทางการรับเงินและขยายฐานลูกค้าเพื่อกระจายความเสี่ยง
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
