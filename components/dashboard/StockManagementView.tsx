'use client'

import React from 'react'
import Link from 'next/link'
import {
  Boxes,
  Truck,
  AlertTriangle,
  Calendar,
  AlertOctagon,
  ArrowRight,
  RefreshCw,
  Clock,
  Info,
} from 'lucide-react'
import { DashboardMetrics } from '@/lib/dashboard-data'
import {
  DonutChart,
  CategoryHorizontalBarChart,
  GroupedBarChart,
} from './DashboardCharts'
import { DataTableFrame } from '@/components/common/DataTableFrame'

interface ViewProps {
  metrics: DashboardMetrics
  onRefresh?: () => void
}

export function StockManagementView({ metrics, onRefresh }: ViewProps) {
  const urgentCount = metrics.stockUrgentList.length

  return (
    <div className="space-y-2">
      {/* 1. TOP ROW: 5 KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* 1. สต็อกพร้อมใช้ */}
        <div className="p-2 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">สต็อกพร้อมใช้</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {metrics.availableStock.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">+12.5%</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">จากสัปดาห์ที่ผ่านมา</span>
          </div>
        </div>

        {/* 2. สินค้าที่กำลังเช่า / จอง */}
        <div className="p-2 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">สินค้าที่กำลังเช่า / จอง</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                {metrics.rentedOrReservedStock.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">+8.3%</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">อยู่ระหว่างการใช้งาน</span>
          </div>
        </div>

        {/* 3. สินค้าชำรุด / สูญหาย */}
        <div className="p-2 bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl border border-rose-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">สินค้าชำรุด / สูญหาย</span>
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                {metrics.damagedOrLostStock.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400">+33.3%</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">ต้องตรวจสอบ / ซ่อมแซม</span>
          </div>
        </div>

        {/* 4. การจองสินค้า */}
        <div className="p-2 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">การจองสินค้า</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
                {metrics.activeReservationsCount.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400">+15.2%</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">รายการรอรับ/รอจ่ายออก</span>
          </div>
        </div>

        {/* 5. งานที่ต้องจัดการเร่งด่วน */}
        <div className="p-2 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-500/20 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">งานที่ต้องจัดการเร่งด่วน</span>
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
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                {urgentCount.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">+50.0%</span>
            </div>
            <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">ต้องดำเนินการทันที</span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: Donut สัดส่วนสถานะสต็อก + Bar ปริมาณสินค้าตามหมวดหมู่ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Left: สัดส่วนสถานะสต็อกทั้งหมด */}
        <div className="lg:col-span-5 p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                สัดส่วนสถานะสต็อกทั้งหมด
              </h3>
            </div>
            <p className="text-[9.5px] text-slate-400 mt-0.5">
              ภาพรวมสถานะของสินค้าคงเหลือทั้งหมดในระบบ
            </p>
          </div>
          <DonutChart
            data={metrics.stockDonutData}
            size={120}
            centerTitle="รวมทั้งหมด"
            centerSuffix="รายการ"
          />
        </div>

        {/* Right: ปริมาณสินค้าตามหมวดหมู่ */}
        <div className="lg:col-span-7 p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-3.5 bg-blue-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                  ปริมาณสินค้าตามหมวดหมู่
                </h3>
              </div>
              <p className="text-[9.5px] text-slate-400 mt-0.5">
                จำนวนสินค้าทั้งหมด แยกตามประเภทหมวดหมู่
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300">
              จำนวนทั้งหมด
            </span>
          </div>
          {metrics.categoryStockData.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">ยังไม่มีข้อมูลหมวดหมู่</div>
          ) : (
            <CategoryHorizontalBarChart data={metrics.categoryStockData} />
          )}
        </div>
      </div>

      {/* 3. ROW 3: 3 CARDS (สินค้าที่ถูกเช่า/ใช้งานสูงสุด, การจองสินค้าแยกตามช่วงเวลา, แจ้งเตือนสต็อกต่ำ/เร่งด่วน) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Card 1: สินค้าที่ถูกเช่า/ใช้งานสูงสุด */}
        <div className="p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-3 bg-amber-500 rounded-full" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                สินค้าที่ถูกเช่า/ใช้งานสูงสุด
              </h3>
            </div>
            <Link
              href="/products"
              className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              ดูทั้งหมด <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {metrics.topRentedProducts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">ยังไม่มีข้อมูลการเช่า</div>
          ) : (
            <div className="space-y-1.5">
              {metrics.topRentedProducts.map((p, idx) => (
                <div key={p.id || idx} className="flex items-center justify-between text-[11px] gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 font-bold text-[9.5px] text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {p.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100 shrink-0">
                    {p.rentalCount} ครั้ง
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: การจองสินค้าแยกตามช่วงเวลา */}
        <div className="p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-3 bg-purple-500 rounded-full" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                การจองสินค้าแยกตามช่วงเวลา
              </h3>
            </div>
            <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold">
              7 วันล่าสุด
            </span>
          </div>
          <GroupedBarChart
            data={metrics.reservationTrendData.map((d) => ({
              label: d.displayDate,
              val1: d.incomingQty,
              val2: d.outgoingQty,
            }))}
            label1="จองเข้า (รับในอนาคต)"
            color1="#8b5cf6"
            label2="จองออก (รอส่งมอบ)"
            color2="#3b82f6"
            height={130}
          />
        </div>

        {/* Card 3: แจ้งเตือนสต็อกต่ำ / เร่งด่วน */}
        <div className="p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-3 bg-rose-500 rounded-full" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                แจ้งเตือนสต็อกต่ำ / เร่งด่วน
              </h3>
            </div>
            <Link
              href="/products"
              className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              ดูทั้งหมด <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {/* 1. สินค้าชำรุด (รอซ่อม) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-200 truncate">สินค้าชำรุด (รอซ่อม)</span>
              </div>
              <span className="font-mono font-black text-rose-600 dark:text-rose-400 shrink-0">
                {metrics.stockAlertsSummary.damagedCount}
              </span>
            </div>

            {/* 2. สต็อกใกล้หมด */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-200 truncate">สต็อกใกล้หมด (ต่ำกว่า 10 หน่วย)</span>
              </div>
              <span className="font-mono font-black text-amber-600 dark:text-amber-400 shrink-0">
                {metrics.stockAlertsSummary.lowStockCount}
              </span>
            </div>

            {/* 3. ครบกำหนดคืน (เกินกำหนด) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-200 truncate">ครบกำหนดคืน (เกินกำหนด)</span>
              </div>
              <span className="font-mono font-black text-amber-600 dark:text-amber-400 shrink-0">
                {metrics.stockAlertsSummary.overdueCount}
              </span>
            </div>

            {/* 4. รายการจองรอรับเข้า */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-200 truncate">รายการจองรอรับเข้า</span>
              </div>
              <span className="font-mono font-black text-purple-600 dark:text-purple-400 shrink-0">
                {metrics.stockAlertsSummary.incomingReservationCount}
              </span>
            </div>

            {/* 5. รายการรอส่งมอบ */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-200 truncate">รายการรอส่งมอบ</span>
              </div>
              <span className="font-mono font-black text-blue-600 dark:text-blue-400 shrink-0">
                {metrics.stockAlertsSummary.outgoingDispatchCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ROW: รายการงานสต็อกเร่งด่วน (TABLE) */}
      <DataTableFrame
        className="p-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
        header={
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                รายการงานสต็อกเร่งด่วน
              </h3>
            </div>
            <Link
              href="/products"
              className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        }
      >
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
              <th className="px-2">เวลา</th>
              <th className="px-2">งาน</th>
              <th className="px-2">สินค้า</th>
              <th className="px-2 text-right">จำนวน</th>
              <th className="px-2">สถานะ</th>
              <th className="px-2">ผู้รับผิดชอบ</th>
              <th className="px-2">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {metrics.stockUrgentList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                  ไม่มีรายการงานสต็อกเร่งด่วน สต็อกพร้อมใช้งาน
                </td>
              </tr>
            ) : (
              metrics.stockUrgentList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {item.time}
                  </td>
                  <td className="px-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${item.workBadgeColor}`}>
                      {item.workType}
                    </span>
                  </td>
                  <td className="px-2 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {item.productName}
                  </td>
                  <td className="px-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.statusColor.replace('text-', 'bg-')}`} />
                      <span className={item.statusColor}>{item.status}</span>
                    </span>
                  </td>
                  <td className="px-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {item.assignee}
                  </td>
                  <td className="px-2 text-slate-400 text-[10.5px] truncate max-w-xs">
                    {item.remark}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTableFrame>
    </div>
  )
}
