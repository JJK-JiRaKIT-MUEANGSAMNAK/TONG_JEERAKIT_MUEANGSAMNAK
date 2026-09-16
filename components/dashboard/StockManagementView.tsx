'use client'

import React from 'react'
import {
  CheckCircle2,
  Layers,
  AlertTriangle,
  Calendar,
  Clock,
  Package,
  TrendingUp,
} from 'lucide-react'
import { DashboardMetrics } from '@/lib/dashboard-data'
import { DonutChart } from './DashboardCharts'

interface ViewProps {
  metrics: DashboardMetrics
}

export function StockManagementView({ metrics }: ViewProps) {
  const stockTasks = metrics.urgentTasks.filter(
    (t) => t.type === 'BACKORDER_READY' || t.type === 'STOCK_LOW' || t.type === 'DISPATCH_DUE'
  )

  const maxCatCount = Math.max(...metrics.categoryStockData.map((c) => c.total), 1)

  return (
    <div className="space-y-3">
      {/* 1. TOP 4 KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">สต็อกพร้อมใช้</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.availableStock.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">ชิ้น</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">พร้อมส่งมอบหน้าร้าน</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">กำลังเช่า / จองคิว</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {metrics.rentedOrReservedStock.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">ชิ้น</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            เช่า {metrics.rentedStock.toLocaleString()} / จอง {metrics.reservedStock.toLocaleString()}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">ชำรุด / สูญหาย</span>
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {metrics.damagedOrLostStock.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">ชิ้น</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            ชำรุด {metrics.damagedStock.toLocaleString()} / หาย {metrics.lostStock.toLocaleString()}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">การจองสินค้า Active</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {metrics.activeReservationsCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">รายการ</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">รอส่งมอบตามกำหนด</span>
        </div>
      </div>

      {/* 2. MIDDLE ROW: Donut Stock Status + Bar Category Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {/* Donut แสดงสัดส่วนสถานะสต็อก */}
        <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">สัดส่วนสถานะสต็อกทั้งหมด</h3>
            <p className="text-[10px] text-slate-400">โครงสร้างสินค้าพร้อมใช้ เทียบกับสินค้าที่ถูกใช้งาน/ชำรุด</p>
          </div>
          <DonutChart data={metrics.stockDonutData} size={135} />
        </div>

        {/* Bar เปรียบเทียบจำนวนตามหมวดสินค้า */}
        <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">ปริมาณสินค้าตามหมวดหมู่</h3>
            <p className="text-[10px] text-slate-400">การกระจายตัวของสต็อกในแต่ละหมวดหมู่</p>
          </div>
          {metrics.categoryStockData.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">ยังไม่มีข้อมูลหมวดหมู่</div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {metrics.categoryStockData.slice(0, 5).map((cat, idx) => {
                const pct = Math.max(4, Math.round((cat.total / maxCatCount) * 100))
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{cat.category}</span>
                      <span className="font-mono text-slate-500 font-bold">{cat.total.toLocaleString()} ชิ้น</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${(cat.available / Math.max(cat.total, 1)) * pct}%` }}
                        title={`พร้อมใช้ ${cat.available}`}
                      />
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(cat.rented / Math.max(cat.total, 1)) * pct}%` }}
                        title={`กำลังเช่า ${cat.rented}`}
                      />
                      <div
                        className="h-full bg-rose-500"
                        style={{ width: `${(cat.damaged / Math.max(cat.total, 1)) * pct}%` }}
                        title={`ชำรุด ${cat.damaged}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. RANKING: สินค้าที่ถูกเช่า/ใช้งานสูงสุด */}
      <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">สินค้าที่ถูกเช่า/ใช้งานสูงสุด (Top Utilized Products)</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">จากประวัติบิลจริง</span>
        </div>

        {metrics.topRentedProducts.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">ยังไม่มีข้อมูลการเช่าสินค้า</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {metrics.topRentedProducts.map((prod, idx) => (
              <div
                key={prod.id || idx}
                className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-500 font-black text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{prod.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{prod.code || 'CODE'}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono block">
                    {prod.rentalCount.toLocaleString()}
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-bold">ชิ้น</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. FOOTER: รายการงานสต็อกเร่งด่วนด้านล่าง */}
      <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">รายการงานสต็อกเร่งด่วน</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {stockTasks.length > 0 ? `${stockTasks.length} รายการ` : 'สต็อกปกติทุกรายการ'}
          </span>
        </div>

        {stockTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            ไม่มีรายการแจ้งเตือนสต็อกเร่งด่วน สต็อกมีความพร้อมใช้งาน
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-[10.5px] font-bold text-slate-400">
                  <th className="py-1.5 px-2">ประเภทแจ้งเตือน</th>
                  <th className="py-1.5 px-2">หัวข้อ</th>
                  <th className="py-1.5 px-2">รายละเอียด</th>
                  <th className="py-1.5 px-2 text-right">วันที่</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-2 px-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {task.type === 'BACKORDER_READY' ? 'ของเข้าพร้อมส่ง' : task.type === 'STOCK_LOW' ? 'สต็อกต่ำ' : 'ถึงคิวส่งมอบ'}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {task.title}
                    </td>
                    <td className="py-2 px-2 text-slate-500 dark:text-slate-400 truncate max-w-sm">
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
