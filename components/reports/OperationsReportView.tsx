'use client'

import React from 'react'
import {
  Truck,
  RotateCcw,
  CalendarClock,
  AlertOctagon,
  UserCheck,
  CheckCircle,
  Clock,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import {
  OperationsReportData,
  formatNumber,
  formatThaiDate,
} from '@/lib/report-data'
import { ReportBarChart } from './ReportCharts'

export function OperationsReportView({ data }: { data: OperationsReportData }) {
  return (
    <div className="space-y-2">
      {/* ─── 1. KPI SUMMARY CARDS (Topics 12, 13, 20) ──────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* KPI 1: งานส่งมอบ (Dispatches) */}
        <div className="p-2 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-500" />
              งานส่งมอบสินค้า
            </span>
            <span className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CheckCircle className="w-3 h-3" />
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-blue-700 dark:text-blue-400">
              {formatNumber(data.dispatchCount)}{' '}
              <span className="text-xs font-normal text-slate-400">งาน</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              ส่งมอบให้ลูกค้าในงวด
            </div>
          </div>
          <div className="text-[9.5px] text-blue-600/80 dark:text-blue-400/80 font-bold">
            ปล่อยอุปกรณ์ออกจากคลัง
          </div>
        </div>

        {/* KPI 2: งานรับคืน (Returns) */}
        <div className="p-2 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
              งานรับคืนสินค้า
            </span>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-3 h-3" />
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
              {formatNumber(data.returnCount)}{' '}
              <span className="text-xs font-normal text-slate-400">งาน</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              ตรวจรับอุปกรณ์กลับเข้าคลัง
            </div>
          </div>
          <div className="text-[9.5px] text-emerald-600/80 dark:text-emerald-400/80 font-bold">
            ตรวจเช็คความสมบูรณ์
          </div>
        </div>

        {/* KPI 3: การจองสินค้า (Reservations - Topic 13) */}
        <div className="p-2 rounded-xl border border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1">
              <CalendarClock className="w-3.5 h-3.5 text-purple-500" />
              การจองสินค้า
            </span>
            <span className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Clock className="w-3 h-3" />
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-purple-700 dark:text-purple-400">
              {formatNumber(data.activeReservationsCount)}{' '}
              <span className="text-xs font-normal text-slate-400">รายการ</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              จองล่วงหน้ารอส่งมอบ
            </div>
          </div>
          <div className="text-[9.5px] text-purple-600/80 dark:text-purple-400/80 font-bold">
            ล็อคสต็อกอัตโนมัติ
          </div>
        </div>

        {/* KPI 4: งาน / จุดที่ต้องจัดการ (Action Items - Topic 20) */}
        <div className="p-2 rounded-xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
              งานที่ต้องจัดการ
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold ${
                data.actionItemsCount > 0
                  ? 'bg-rose-500 text-white'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {data.actionItemsCount} จุด
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-rose-600 dark:text-rose-400">
              {formatNumber(data.actionItemsCount)}{' '}
              <span className="text-xs font-normal text-slate-400">ภารกิจ</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              เกินกำหนด / หนี้ค้าง / ซ่อมแซม
            </div>
          </div>
          <div className="text-[9.5px] text-rose-600/80 dark:text-rose-400/80 font-bold">
            {data.actionItemsCount > 0 ? 'ต้องการการติดตามด่วน' : 'ไม่มีงานค้าง'}
          </div>
        </div>
      </div>

      {/* ─── 2. OPERATIONS VOLUME TREND & RESERVATIONS ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* กราฟจำนวนงานตามวัน/เดือน */}
        <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                กราฟจำนวนงานปฏิบัติการ (ส่งมอบ / รับคืน / จอง)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">ตามช่วงเวลา</span>
          </div>

          <div className="flex-1 min-h-40">
            <ReportBarChart
              data={data.operationsTrend}
              series={[
                { name: 'ส่งมอบ', key: 'dispatches', color: '#3b82f6' },
                { name: 'รับคืน', key: 'returns', color: '#10b981' },
                { name: 'การจอง', key: 'reservations', color: '#8b5cf6' },
              ]}
              valuePrefix=""
            />
          </div>
        </div>

        {/* รายการการจองสินค้า (Topic 13) */}
        <div className="p-2 rounded-xl border border-purple-500/20 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-purple-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                การจองสินค้าล่วงหน้า ({data.reservations.length} รายการ)
              </h3>
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
              รอส่งมอบ
            </span>
          </div>

          {data.reservations.length === 0 ? (
            <div className="text-xs text-slate-400 py-8 text-center">
              ไม่มีรายการจองสินค้าล่วงหน้าในขณะนี้
            </div>
          ) : (
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-[#E3E3E3] dark:bg-slate-800 font-bold">
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 px-1.5 font-bold">เลขที่จอง</th>
                    <th className="py-2 px-1.5 font-bold">สินค้า</th>
                    <th className="py-2 px-1.5 font-bold text-center">จำนวน</th>
                    <th className="py-2 px-1.5 font-bold">ลูกค้า</th>
                    <th className="py-2 px-1.5 font-bold whitespace-nowrap">ช่วงวันที่</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {data.reservations.slice(0, 10).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-1 px-1.5 font-mono font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                        {r.reservationNo}
                      </td>
                      <td className="py-1 px-1.5 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                        {r.productName}
                      </td>
                      <td className="py-1 px-1.5 text-center font-mono font-bold">
                        {r.quantity}
                      </td>
                      <td className="py-1 px-1.5 text-slate-600 dark:text-slate-300 truncate max-w-[100px]">
                        {r.customerName}
                      </td>
                      <td className="py-1 px-1.5 font-mono text-[9.5px] text-slate-500 whitespace-nowrap">
                        {formatThaiDate(r.startDate)} - {formatThaiDate(r.endDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10.5px] text-purple-800 dark:text-purple-300 flex justify-between mt-1">
            <span>สถานะระบบจอง:</span>
            <span className="font-bold">ระบบตรวจสอบวันชนอัตโนมัติ</span>
          </div>
        </div>
      </div>

      {/* ─── 3. TOPIC 20: งาน / จุดที่ต้องจัดการ (Action Items) ─────────────── */}
      <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              งานและจุดที่ต้องจัดการ (Action Items Checklist)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            จำแนกตามความเร่งด่วนและผู้รับผิดชอบ
          </span>
        </div>

        {data.actionItems.length === 0 ? (
          <div className="text-xs text-emerald-600 dark:text-emerald-400 py-6 text-center font-bold">
            🎉 ยอดเยี่ยม! ไม่มีงานค้างหรือจุดที่ต้องจัดการในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
            {data.actionItems.map((item) => {
              const badgeClass =
                item.priority === 'high'
                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  : item.priority === 'medium'
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  : 'bg-blue-500/10 text-blue-600 border-blue-500/20'

              return (
                <div
                  key={item.id}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold border ${badgeClass}`}
                      >
                        {item.priority === 'high'
                          ? 'ด่วนมาก'
                          : item.priority === 'medium'
                          ? 'ปานกลาง'
                          : 'แจ้งเตือน'}
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                        {item.refNo}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {item.title}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-400">
                      {item.customerName && <span>ลูกค้า: {item.customerName}</span>}
                      {item.customerPhone && (
                        <span className="font-mono">({item.customerPhone})</span>
                      )}
                      {item.date && <span>กำหนด: {formatThaiDate(item.date)}</span>}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                      <UserCheck className="w-3 h-3 text-emerald-500" />
                      {item.suggestedHandler}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── 4. OPERATIONS HISTORY & TIMELINE TABLE ───────────────────────── */}
      <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              รายการงานปฏิบัติการย้อนหลัง ({data.historyRecords.length} งาน)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">เรียงตามวันที่ล่าสุด</span>
        </div>

        {data.historyRecords.length === 0 ? (
          <div className="text-xs text-slate-400 py-8 text-center">
            ไม่มีประวัติงานปฏิบัติการในช่วงเวลานี้
          </div>
        ) : (
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="sticky top-0 bg-[#E3E3E3] dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 px-2 font-bold whitespace-nowrap">วันที่</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap">ประเภทงาน</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap">เลขอ้างอิง</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap">ลูกค้า</th>
                  <th className="py-2 px-2 font-bold text-center">จำนวนชิ้น</th>
                  <th className="py-2 px-2 font-bold">ผู้รับผิดชอบ</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.historyRecords.slice(0, 50).map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-1 px-2 font-mono text-slate-500 whitespace-nowrap">
                      {formatThaiDate(h.date)}
                    </td>
                    <td className="py-1 px-2 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold ${
                          h.event === 'DISPATCH'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {h.event === 'DISPATCH' ? 'ส่งมอบสินค้า' : 'รับคืนสินค้า'}
                      </span>
                    </td>
                    <td className="py-1 px-2 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {h.refNo}
                    </td>
                    <td className="py-1 px-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {h.customerName}
                    </td>
                    <td className="py-1 px-2 text-center font-mono font-bold">
                      {h.itemsCount}
                    </td>
                    <td className="py-1 px-2 text-slate-600 dark:text-slate-400">
                      {h.handler}
                    </td>
                    <td className="py-1 px-2 text-center whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {h.status}
                      </span>
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
