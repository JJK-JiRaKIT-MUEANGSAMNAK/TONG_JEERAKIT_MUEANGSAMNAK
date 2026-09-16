'use client'

import React from 'react'
import {
  ShoppingBag,
  Clock,
  Receipt,
  FileText,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
} from 'lucide-react'
import {
  SalesRentalReportData,
  formatCurrency,
  formatNumber,
  formatThaiDate,
} from '@/lib/report-data'
import { ReportBarChart, ReportFunnel } from './ReportCharts'

export function SalesRentalReportView({ data }: { data: SalesRentalReportData }) {
  return (
    <div className="space-y-2">
      {/* ─── 1. KPI SUMMARY CARDS (Topics 5, 6, 9, 10, 11) ─────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {/* Topic 5: ยอดขายสินค้า (Product Sales) */}
        <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
              ยอดขายสินค้า
            </span>
            <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {formatNumber(data.salesUnits)} ชิ้น
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
              ฿{formatCurrency(data.salesRevenue)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              จากบิลขาย {formatNumber(data.salesCount)} รายการ
            </div>
          </div>
          <div className="text-[9.5px] text-emerald-600/80 dark:text-emerald-400/80 font-bold">
            ขายขาด & อุปกรณ์สิ้นเปลือง
          </div>
        </div>

        {/* Topic 6: รายได้จากการเช่า (Rental Revenue) */}
        <div className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              รายได้จากการเช่า
            </span>
            <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {formatNumber(data.rentalCount)} งาน
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-blue-700 dark:text-blue-400">
              ฿{formatCurrency(data.rentalRevenue)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              ค่าเช่าอุปกรณ์ในงวด
            </div>
          </div>
          <div className="text-[9.5px] text-blue-600/80 dark:text-blue-400/80 font-bold">
            บริการให้เช่าเครื่องมือ/กล้อง
          </div>
        </div>

        {/* Topic 9: บิลทั้งหมด (Bills) */}
        <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              บิลทั้งหมด
            </span>
            <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {formatNumber(data.totalBillsCount)} ฉบับ
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-slate-800 dark:text-slate-100">
              ฿{formatCurrency(data.totalBillsValue)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between">
              <span>ชำระแล้ว: ฿{formatNumber(data.totalBillsPaid)}</span>
            </div>
          </div>
          <div className="text-[9.5px] text-amber-600 dark:text-amber-400 font-mono">
            ค้างชำระ: ฿{formatNumber(data.totalBillsOutstanding)}
          </div>
        </div>

        {/* Topic 10: ใบเสนอราคา (Quotations) */}
        <div className="p-2.5 rounded-xl border border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              ใบเสนอราคา
            </span>
            <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
              {data.quotationConversionRate}% แปลงบิล
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-purple-700 dark:text-purple-400">
              ฿{formatCurrency(data.totalQuotationsValue)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              ออกทั้งหมด {formatNumber(data.totalQuotationsCount)} ใบ
            </div>
          </div>
          <div className="text-[9.5px] text-purple-600/80 dark:text-purple-400/80 font-bold">
            อัตราความสำเร็จ (Conversion)
          </div>
        </div>

        {/* Topic 11: งานเช่าปัจจุบัน (Active Rentals) */}
        <div className="col-span-2 md:col-span-1 p-2.5 rounded-xl border border-blue-500/20 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-500" />
              งานเช่าปัจจุบัน
            </span>
            {data.overdueRentalsCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> เกิน {data.overdueRentalsCount}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                ปกติ
              </span>
            )}
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-blue-600 dark:text-blue-400">
              {formatNumber(data.activeRentalsCount)}{' '}
              <span className="text-xs font-normal text-slate-400">สัญญา</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              อยู่ระหว่างเช่าจริงนอกร้าน
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 font-bold">
            ติดตามสถานะและรับคืน
          </div>
        </div>
      </div>

      {/* ─── 2. CHARTS: BAR ขาย VS เช่า & สรุปสถานะบิล ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Bar Chart: ขาย vs เช่าตามช่วงเวลา (Left 2 cols) */}
        <div className="lg:col-span-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Bar เปรียบเทียบ ยอดขายสินค้า vs รายได้จากการเช่า
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">ตามช่วงเวลา</span>
          </div>

          <div className="flex-1 min-h-40">
            <ReportBarChart
              data={data.salesVsRentalTrend}
              series={[
                { name: 'ขายสินค้า', key: 'sales', color: '#10b981' },
                { name: 'การเช่า', key: 'rental', color: '#3b82f6' },
              ]}
            />
          </div>
        </div>

        {/* สถานะบิล (Right 1 col - Topic 9) */}
        <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                สถานะบิลในงวด
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">รวม {data.totalBillsCount} บิล</span>
          </div>

          <div className="space-y-1.5 my-1">
            {data.billStatusList.map((st) => (
              <div
                key={st.status}
                className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: st.color }}
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {st.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {st.count} รายการ
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black font-mono text-slate-800 dark:text-slate-100">
                    ฿{formatCurrency(st.amount)}
                  </div>
                  <div className="text-[9px] text-slate-400">
                    {data.totalBillsValue > 0
                      ? Math.round((st.amount / data.totalBillsValue) * 100)
                      : 0}
                    %
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10.5px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span className="font-medium">รับชำระแล้วทั้งหมด:</span>
            <span className="font-bold font-mono">฿{formatCurrency(data.totalBillsPaid)}</span>
          </div>
        </div>
      </div>

      {/* ─── 3. TOPIC 10: ใบเสนอราคา FUNNEL (ร่าง → ส่ง → ยืนยัน → เป็นบิล) ── */}
      <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-purple-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              ท่อส่งเอกสารใบเสนอราคา (ร่าง → ส่งแล้ว → ยืนยัน → เป็นบิล)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 font-mono">
            อัตราความสำเร็จรวม: {data.quotationConversionRate}%
          </span>
        </div>

        <ReportFunnel steps={data.quotationFunnel} />
      </div>

      {/* ─── 4. TOPIC 11: ประวัติและงานเช่าปัจจุบัน (Active Rentals) ───────── */}
      <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              งานเช่าปัจจุบันที่กำลังดำเนินการ ({data.activeRentals.length} งาน)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            {data.overdueRentalsCount > 0 ? (
              <span className="text-rose-500 font-bold">
                ⚠️ มีงานเกินกำหนด {data.overdueRentalsCount} งาน
              </span>
            ) : (
              'ทุกสัญญาอยู่ในกำหนด'
            )}
          </span>
        </div>

        {data.activeRentals.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center">
            ขณะนี้ไม่มีสินค้าที่อยู่ระหว่างเช่านอกร้าน
          </div>
        ) : (
          <div className="overflow-x-auto max-h-56">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-1 px-1.5 font-bold">เลขที่บิล</th>
                  <th className="py-1 px-1.5 font-bold">ลูกค้า</th>
                  <th className="py-1 px-1.5 font-bold whitespace-nowrap">วันที่เริ่ม</th>
                  <th className="py-1 px-1.5 font-bold whitespace-nowrap">กำหนดคืน</th>
                  <th className="py-1 px-1.5 font-bold text-center">รายการ</th>
                  <th className="py-1 px-1.5 font-bold text-right">มัดจำ</th>
                  <th className="py-1 px-1.5 font-bold text-right">ยอดรวม</th>
                  <th className="py-1 px-1.5 font-bold text-center">สถานะกำหนด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.activeRentals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-1 px-1.5 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {r.billNo}
                    </td>
                    <td className="py-1 px-1.5 max-w-[130px] truncate text-slate-700 dark:text-slate-300">
                      <div>{r.customerName}</div>
                      {r.customerPhone && (
                        <div className="text-[9.5px] text-slate-400 font-mono">
                          {r.customerPhone}
                        </div>
                      )}
                    </td>
                    <td className="py-1 px-1.5 font-mono text-slate-500 whitespace-nowrap">
                      {formatThaiDate(r.rentalStartDate)}
                    </td>
                    <td className="py-1 px-1.5 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {formatThaiDate(r.scheduledReturnDate)}
                    </td>
                    <td className="py-1 px-1.5 text-center font-mono">
                      {r.itemsCount} ชิ้น
                    </td>
                    <td className="py-1 px-1.5 font-mono text-right text-purple-600 dark:text-purple-400 whitespace-nowrap">
                      ฿{formatNumber(r.depositAmount)}
                    </td>
                    <td className="py-1 px-1.5 font-mono font-bold text-right text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      ฿{formatCurrency(r.grandTotal)}
                    </td>
                    <td className="py-1 px-1.5 text-center whitespace-nowrap">
                      {r.isOverdue ? (
                        <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          เกินกำหนด {r.daysOverdue} วัน
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          กำลังเช่า
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── 5. DETAILED DOCUMENTS TABLE ─────────────────────────────────── */}
      <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              ตารางรายละเอียดบิลและใบเสนอราคา ({data.detailedRecords.length} ฉบับ)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">เรียงตามวันที่ล่าสุด</span>
        </div>

        {data.detailedRecords.length === 0 ? (
          <div className="text-xs text-slate-400 py-8 text-center">
            ยังไม่มีข้อมูลเอกสารในช่วงเวลานี้
          </div>
        ) : (
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-1.5 px-2 font-bold whitespace-nowrap">วันที่</th>
                  <th className="py-1.5 px-2 font-bold whitespace-nowrap">เลขที่เอกสาร</th>
                  <th className="py-1.5 px-2 font-bold whitespace-nowrap">ประเภท</th>
                  <th className="py-1.5 px-2 font-bold whitespace-nowrap">ลูกค้า</th>
                  <th className="py-1.5 px-2 font-bold">รายการสินค้า</th>
                  <th className="py-1.5 px-2 font-bold whitespace-nowrap text-right">ยอดรวม</th>
                  <th className="py-1.5 px-2 font-bold whitespace-nowrap text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.detailedRecords.slice(0, 50).map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-1 px-2 font-mono text-slate-500 whitespace-nowrap">
                      {formatThaiDate(doc.date)}
                    </td>
                    <td className="py-1 px-2 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {doc.docNo}
                    </td>
                    <td className="py-1 px-2 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold ${
                          doc.type === 'BILL'
                            ? doc.subType === 'SALE'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-blue-500/10 text-blue-600'
                            : 'bg-purple-500/10 text-purple-600'
                        }`}
                      >
                        {doc.type === 'BILL'
                          ? doc.subType === 'SALE'
                            ? 'บิลขาย'
                            : 'บิลเช่า'
                          : 'ใบเสนอราคา'}
                      </span>
                    </td>
                    <td className="py-1 px-2 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <div>{doc.customerName}</div>
                      {doc.customerPhone && (
                        <div className="text-[9px] text-slate-400 font-mono">
                          {doc.customerPhone}
                        </div>
                      )}
                    </td>
                    <td className="py-1 px-2 max-w-[220px] truncate text-slate-600 dark:text-slate-400">
                      {doc.itemsSummary}
                    </td>
                    <td className="py-1 px-2 font-mono font-bold text-right text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      ฿{formatCurrency(doc.amount)}
                    </td>
                    <td className="py-1 px-2 text-center whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {doc.status}
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
