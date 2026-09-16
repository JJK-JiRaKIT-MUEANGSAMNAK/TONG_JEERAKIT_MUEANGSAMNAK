'use client'

import React from 'react'
import {
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  Wrench,
  Boxes,
} from 'lucide-react'
import {
  StockReportData,
  formatCurrency,
  formatNumber,
} from '@/lib/report-data'
import { ReportDonutChart, ReportBarChart } from './ReportCharts'

export function StockReportView({ data }: { data: StockReportData }) {
  return (
    <div className="space-y-2">
      {/* ─── 1. INVENTORY STATUS KPIS (Topic 14 & 15) ──────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {/* KPI 1: สต็อกทั้งหมด */}
        <div className="p-2.5 rounded-xl border border-slate-300/70 bg-slate-100/70 dark:bg-slate-800/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5 text-slate-500" />
              สินค้าทั้งหมด
            </span>
            <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {data.totalSkuCount} SKU
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-slate-800 dark:text-slate-100">
              {formatNumber(data.totalStock)}{' '}
              <span className="text-xs font-normal text-slate-400">ชิ้น</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              จำนวนชิ้นรวมทุกสถานะ
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 font-bold">
            สินทรัพย์รวมในระบบ
          </div>
        </div>

        {/* KPI 2: สต็อกพร้อมใช้ (Available - Green) */}
        <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              พร้อมใช้งาน
            </span>
            <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {data.totalStock > 0 ? Math.round((data.availableStock / data.totalStock) * 100) : 0}%
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
              {formatNumber(data.availableStock)}{' '}
              <span className="text-xs font-normal text-emerald-600/70">ชิ้น</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              อยู่ในคลัง พร้อมปล่อยเช่า
            </div>
          </div>
          <div className="text-[9.5px] text-emerald-600/80 dark:text-emerald-400/80 font-bold">
            สต็อกสภาพสมบูรณ์
          </div>
        </div>

        {/* KPI 3: กำลังเช่า (Rented - Blue) */}
        <div className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              กำลังถูกเช่า
            </span>
            <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {data.utilizationRate}% ใช้จริง
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-blue-700 dark:text-blue-400">
              {formatNumber(data.rentedStock)}{' '}
              <span className="text-xs font-normal text-blue-600/70">ชิ้น</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              อยู่กับลูกค้านอกร้าน
            </div>
          </div>
          <div className="text-[9.5px] text-blue-600/80 dark:text-blue-400/80 font-bold">
            อัตราการใช้งานสินทรัพย์
          </div>
        </div>

        {/* KPI 4: ชำรุด (Damaged - Red - Topic 15) */}
        <div className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-rose-500" />
              ชำรุดรอซ่อม
            </span>
            <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
              {data.damagedItems.length} รายการ
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-rose-700 dark:text-rose-400">
              {formatNumber(data.damagedStock)}{' '}
              <span className="text-xs font-normal text-rose-600/70">ชิ้น</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              ประเมินค่าซ่อม ฿{formatNumber(data.totalDamagedCost)}
            </div>
          </div>
          <div className="text-[9.5px] text-rose-600/80 dark:text-rose-400/80 font-bold">
            รอช่างเทคนิคตรวจสอบ
          </div>
        </div>

        {/* KPI 5: สูญหาย (Lost - Orange - Topic 15) */}
        <div className="col-span-2 md:col-span-1 p-2.5 rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-amber-500" />
              สูญหาย
            </span>
            <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {data.lostItems.length} รายการ
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-amber-700 dark:text-amber-400">
              {formatNumber(data.lostStock)}{' '}
              <span className="text-xs font-normal text-amber-600/70">ชิ้น</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              มูลค่าเสียหาย ฿{formatNumber(data.totalLostCost)}
            </div>
          </div>
          <div className="text-[9.5px] text-amber-600/80 dark:text-amber-400/80 font-bold">
            รอเคลมหรือตัดจำหน่าย
          </div>
        </div>
      </div>

      {/* ─── 2. DONUT สัดส่วนสถานะ & BAR การใช้ตามหมวดหมู่ ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Donut Chart: สัดส่วนสถานะสต็อก (Left 1 col) */}
        <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                สัดส่วนสถานะสต็อก
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              {data.totalStock.toLocaleString()} ชิ้น
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center py-1">
            <ReportDonutChart
              data={data.statusProportions}
              size={120}
              centerTitle="สต็อกรวม"
              centerSuffix="ชิ้น"
            />
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-1.5 flex justify-between">
            <span>อัตราพร้อมใช้งาน:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {data.totalStock > 0 ? Math.round((data.availableStock / data.totalStock) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Bar Chart: การกระจายสต็อกตามหมวด (Right 2 cols) */}
        <div className="lg:col-span-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                การกระจายและการใช้งานสต็อกตามหมวดหมู่
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">จำนวนชิ้น</span>
          </div>

          <div className="flex-1 min-h-40">
            <ReportBarChart
              data={data.categoryUsage.slice(0, 8)}
              xKey="category"
              series={[
                { name: 'พร้อมใช้', key: 'available', color: '#10b981' },
                { name: 'กำลังเช่า', key: 'rented', color: '#3b82f6' },
                { name: 'ชำรุด/หาย', key: 'damaged', color: '#ef4444' },
              ]}
              valuePrefix=""
            />
          </div>
        </div>
      </div>

      {/* ─── 3. TOPIC 15: ประวัติชำรุด / สูญหาย & TOPIC 16: สินค้าทำเงิน ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* รายการชำรุด / สูญหาย (Topic 15) */}
        <div className="p-2.5 rounded-xl border border-rose-500/20 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                บันทึกสินค้าชำรุดและสูญหาย
              </h3>
            </div>
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">
              ความเสียหายรวม ฿{formatNumber(data.totalDamagedCost + data.totalLostCost)}
            </span>
          </div>

          {data.damagedItems.length === 0 && data.lostItems.length === 0 ? (
            <div className="text-xs text-slate-400 py-8 text-center">
              ไม่มีสินค้าชำรุดหรือสูญหายในระบบ
            </div>
          ) : (
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-1 px-1.5 font-bold">รหัส</th>
                    <th className="py-1 px-1.5 font-bold">ชื่อสินค้า</th>
                    <th className="py-1 px-1.5 font-bold text-center">สถานะ</th>
                    <th className="py-1 px-1.5 font-bold text-center">จำนวน</th>
                    <th className="py-1 px-1.5 font-bold text-right">ค่าเสียหาย/ซ่อม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {data.damagedItems.map((d) => (
                    <tr key={`dam-${d.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-1 px-1.5 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {d.code}
                      </td>
                      <td className="py-1 px-1.5 truncate max-w-[130px] text-slate-700 dark:text-slate-300">
                        {d.name}
                      </td>
                      <td className="py-1 px-1.5 text-center">
                        <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          ชำรุด
                        </span>
                      </td>
                      <td className="py-1 px-1.5 text-center font-mono font-bold text-rose-600">
                        {d.quantity} {d.unit}
                      </td>
                      <td className="py-1 px-1.5 text-right font-mono text-slate-700 dark:text-slate-300">
                        ฿{formatNumber(d.estimatedFee)}
                      </td>
                    </tr>
                  ))}
                  {data.lostItems.map((l) => (
                    <tr key={`lost-${l.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-1 px-1.5 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {l.code}
                      </td>
                      <td className="py-1 px-1.5 truncate max-w-[130px] text-slate-700 dark:text-slate-300">
                        {l.name}
                      </td>
                      <td className="py-1 px-1.5 text-center">
                        <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          สูญหาย
                        </span>
                      </td>
                      <td className="py-1 px-1.5 text-center font-mono font-bold text-amber-600">
                        {l.quantity} {l.unit}
                      </td>
                      <td className="py-1 px-1.5 text-right font-mono text-slate-700 dark:text-slate-300">
                        ฿{formatNumber(l.estimatedLoss)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* สินค้าทำเงินสูงสุด (Top / Bottom Products) */}
        <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                สินค้าทำเงินสูงสุด (Top Revenue)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">เรียงตามรายได้</span>
          </div>

          <div className="overflow-x-auto max-h-56">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-1 px-1.5 font-bold">อันดับ</th>
                  <th className="py-1 px-1.5 font-bold">ชื่อสินค้า</th>
                  <th className="py-1 px-1.5 font-bold text-center">หมวดหมู่</th>
                  <th className="py-1 px-1.5 font-bold text-center">เช่า/ขาย</th>
                  <th className="py-1 px-1.5 font-bold text-right text-emerald-600">รายได้รวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.topProducts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-1 px-1.5 text-center font-mono font-bold text-slate-500">
                      #{idx + 1}
                    </td>
                    <td className="py-1 px-1.5 truncate max-w-[130px] font-bold text-slate-800 dark:text-slate-200">
                      {p.name}
                    </td>
                    <td className="py-1 px-1.5 text-center text-slate-500">
                      <span className="px-1.5 py-0.2 rounded-xs text-[9px] bg-slate-100 dark:bg-slate-800">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-1 px-1.5 text-center font-mono">
                      {p.rentCount} ครั้ง
                    </td>
                    <td className="py-1 px-1.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      ฿{formatCurrency(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── 4. DETAILED PRODUCT INVENTORY TABLE ───────────────────────────── */}
      <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              ตารางรายละเอียดสินค้าและสต็อกทั้งหมด ({data.productsTable.length} รายการ)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">ข้อมูลสถานะตามจริง</span>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-1.5 px-2 font-bold whitespace-nowrap">รหัส</th>
                <th className="py-1.5 px-2 font-bold whitespace-nowrap">ชื่อสินค้า</th>
                <th className="py-1.5 px-2 font-bold whitespace-nowrap">หมวดหมู่</th>
                <th className="py-1.5 px-2 font-bold whitespace-nowrap text-center">ทั้งหมด</th>
                <th className="py-1.5 px-2 font-bold whitespace-nowrap text-center text-emerald-600">
                  พร้อมใช้
                </th>
                <th className="py-1.5 px-2 font-bold whitespace-nowrap text-center text-blue-600">
                  กำลังเช่า
                </th>
                <th className="py-1.5 px-2 font-bold whitespace-nowrap text-center text-rose-600">
                  ชำรุด
                </th>
                <th className="py-1.5 px-2 font-bold whitespace-nowrap text-center text-amber-600">
                  สูญหาย
                </th>
                <th className="py-1.5 px-2 font-bold whitespace-nowrap text-right">ค่าเช่า/วัน</th>
                <th className="py-1.5 px-2 font-bold whitespace-nowrap text-right text-emerald-600">
                  รายได้สะสม
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {data.productsTable.slice(0, 50).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-1 px-2 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {p.code}
                  </td>
                  <td className="py-1 px-2 font-bold text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                    {p.name}
                  </td>
                  <td className="py-1 px-2 text-slate-500 whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded-md text-[9.5px] bg-slate-100 dark:bg-slate-800">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-1 px-2 text-center font-mono font-bold whitespace-nowrap">
                    {p.totalQuantity}
                  </td>
                  <td className="py-1 px-2 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {p.availableQuantity}
                  </td>
                  <td className="py-1 px-2 text-center font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {p.rentedQuantity}
                  </td>
                  <td className="py-1 px-2 text-center font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    {p.damagedQuantity}
                  </td>
                  <td className="py-1 px-2 text-center font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    {p.lostQuantity}
                  </td>
                  <td className="py-1 px-2 text-right font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    ฿{formatNumber(p.rentPrice)}
                  </td>
                  <td className="py-1 px-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    ฿{formatCurrency(p.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
