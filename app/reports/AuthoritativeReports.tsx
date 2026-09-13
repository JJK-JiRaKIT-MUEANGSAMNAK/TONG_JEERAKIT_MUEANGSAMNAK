'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart3, Download, Printer, RefreshCw } from 'lucide-react'
import {
  computeFinancialSummary,
  computeStockSummary,
  computeRentalOperationalSummary,
  computeQuotationSummary,
  computeTopProducts,
  computeTopCustomers,
  FinancialSummary,
  StockSummary,
  RentalOperationalSummary,
  QuotationSummary,
  TopProductStat,
  TopCustomerStat,
} from '@/lib/report-summary-service'

// Keep ReportSummary interface exported for any external consumers
export interface ReportSummary {
  finance: {
    payments_received: number
    income: number
    expense: number
    net: number
    current_receivable: number
    vat_billed: number
    bill_count: number
    deposit_held: number
    rental_revenue: number
    sale_revenue: number
  }
  inventory: {
    active_products: number
    available: number
    rented: number
    reserved: number
    damaged: number
    lost: number
  }
  operational: {
    active_rentals: number
    partial_returned: number
    overdue: number
    pending_dispatch: number
    reservation_active: number
    backorder_pending: number
  }
  quotations: {
    draft: number
    sent: number
    accepted: number
    converted: number
    cancelled: number
  }
  daily: Array<{ date: string; income: number; expense: number; net: number }>
  payment_methods: Array<{ method: string; count: number; amount: number }>
  top_products: TopProductStat[]
  top_customers: TopCustomerStat[]
}

function localDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const currency = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
})

function buildReportSummary(
  fin: FinancialSummary,
  stock: StockSummary,
  ops: RentalOperationalSummary,
  quot: QuotationSummary,
  topProducts: TopProductStat[],
  topCustomers: TopCustomerStat[],
): ReportSummary {
  return {
    finance: {
      payments_received: fin.grossReceived,
      income: fin.grossReceived,
      expense: fin.refundTotal,
      net: fin.netReceived,
      current_receivable: fin.outstanding,
      vat_billed: fin.vatBilled,
      bill_count: fin.billCount,
      deposit_held: fin.depositHeld,
      rental_revenue: fin.rentalRevenue,
      sale_revenue: fin.saleRevenue,
    },
    inventory: {
      active_products: stock.activeProducts,
      available: stock.available,
      rented: stock.rented,
      reserved: stock.reserved,
      damaged: stock.damaged,
      lost: stock.lost,
    },
    operational: {
      active_rentals: ops.activeRentals,
      partial_returned: ops.partialReturned,
      overdue: ops.overdue,
      pending_dispatch: ops.pendingDispatch,
      reservation_active: ops.reservationActive,
      backorder_pending: ops.backorderPending,
    },
    quotations: {
      draft: quot.draft,
      sent: quot.sent,
      accepted: quot.accepted,
      converted: quot.converted,
      cancelled: quot.cancelled,
    },
    daily: fin.daily,
    payment_methods: fin.byPaymentMethod,
    top_products: topProducts,
    top_customers: topCustomers,
  }
}

export default function AuthoritativeReports() {
  const initial = useMemo(() => {
    const now = new Date()
    return {
      start: localDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: localDate(now),
    }
  }, [])
  const [startDate, setStartDate] = useState(initial.start)
  const [endDate, setEndDate] = useState(initial.end)
  const [data, setData] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const opts = { startDate, endDate }
      const [fin, stock, ops, quot, topProducts, topCustomers] = await Promise.resolve([
        computeFinancialSummary(opts),
        computeStockSummary(),
        computeRentalOperationalSummary(),
        computeQuotationSummary(),
        computeTopProducts({ ...opts, limit: 10 }),
        computeTopCustomers({ ...opts, limit: 10 }),
      ])
      setData(buildReportSummary(fin, stock, ops, quot, topProducts, topCustomers))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ไม่สามารถโหลดรายงานได้')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => { void load() }, [load])

  const exportCsv = () => {
    if (!data) return
    const rows: string[][] = [
      ['ส่วน', 'รายการ', 'ค่า'],
      // Finance
      ['การเงิน', 'รับเงินจริง (ไม่รวมมัดจำ)', String(data.finance.payments_received)],
      ['การเงิน', 'คืนเงินลูกค้า', String(data.finance.expense)],
      ['การเงิน', 'รายรับสุทธิ', String(data.finance.net)],
      ['การเงิน', 'รายรับจากการเช่า', String(data.finance.rental_revenue)],
      ['การเงิน', 'รายรับจากการขาย', String(data.finance.sale_revenue)],
      ['การเงิน', 'มัดจำค้างอยู่', String(data.finance.deposit_held)],
      ['การเงิน', 'ลูกหนี้คงค้าง', String(data.finance.current_receivable)],
      ['การเงิน', 'VAT ตามบิล', String(data.finance.vat_billed)],
      ['การเงิน', 'จำนวนบิล', String(data.finance.bill_count)],
      [],
      // Daily
      ['รายวัน', 'วันที่', 'รายรับ', 'รายจ่าย', 'สุทธิ'],
      ...data.daily.map((x) => ['รายวัน', x.date, String(x.income), String(x.expense), String(x.net)]),
      [],
      // Payment methods
      ['ช่องทางชำระ', 'ช่องทาง', 'จำนวนครั้ง', 'ยอดรวม'],
      ...data.payment_methods.map((x) => ['ช่องทางชำระ', x.method, String(x.count), String(x.amount)]),
      [],
      // Stock
      ['คลัง', 'พร้อมใช้', String(data.inventory.available)],
      ['คลัง', 'กำลังเช่า', String(data.inventory.rented)],
      ['คลัง', 'จอง', String(data.inventory.reserved)],
      ['คลัง', 'ชำรุด', String(data.inventory.damaged)],
      ['คลัง', 'สูญหาย', String(data.inventory.lost)],
    ]
    const csv =
      '\uFEFF' +
      rows
        .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
        .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `POS_Report_${startDate}_${endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full overflow-auto p-4 md:p-6 space-y-5">
      {/* Header & Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" /> รายงาน
          </h1>
          <p className="text-sm text-slate-500">สรุปภาพรวมและสถิติการดำเนินงาน</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs">
            จาก
            <input
              className="mt-1 block rounded border bg-transparent px-2 py-2"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="text-xs">
            ถึง
            <input
              className="mt-1 block rounded border bg-transparent px-2 py-2"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <button
            onClick={() => void load()}
            className="rounded border px-3 py-2 flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" /> รีเฟรช
          </button>
          <button
            onClick={exportCsv}
            disabled={!data}
            className="rounded border px-3 py-2 flex items-center gap-1 disabled:opacity-40"
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          <button
            onClick={() => window.print()}
            disabled={!data}
            className="rounded border px-3 py-2 flex items-center gap-1 disabled:opacity-40"
          >
            <Printer className="h-4 w-4" /> พิมพ์
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>
      )}
      {loading && (
        <div className="rounded-lg border p-8 text-center">กำลังคำนวณรายงานจากฐานข้อมูล...</div>
      )}

      {!loading && data && (
        <>
          {/* ── Finance KPI cards ── */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ['รับเงินจริง (ไม่รวมมัดจำ)', currency.format(data.finance.payments_received), 'text-emerald-700'],
              ['คืนเงินลูกค้า', currency.format(data.finance.expense), 'text-red-600'],
              ['รายรับสุทธิ', currency.format(data.finance.net), 'text-blue-700'],
              ['รายรับจากเช่า', currency.format(data.finance.rental_revenue), 'text-slate-700'],
              ['รายรับจากขาย', currency.format(data.finance.sale_revenue), 'text-slate-700'],
              ['มัดจำค้างอยู่', currency.format(data.finance.deposit_held), 'text-amber-600'],
              ['ลูกหนี้คงค้าง', currency.format(data.finance.current_receivable), 'text-orange-600'],
              ['VAT ตามบิล', currency.format(data.finance.vat_billed), 'text-slate-600'],
              ['จำนวนบิล', String(data.finance.bill_count) + ' บิล', 'text-slate-700'],
              ['สินค้า Active', String(data.inventory.active_products) + ' รายการ', 'text-slate-700'],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4">
                <div className="text-xs text-slate-500">{label}</div>
                <div className={`mt-1 text-xl font-semibold ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* ── Inventory Status ── */}
          <section className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4">
            <h2 className="font-semibold mb-3">สถานะคลังปัจจุบัน</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div>พร้อมใช้ <b className="text-emerald-600">{data.inventory.available}</b></div>
              <div>กำลังเช่า <b className="text-blue-600">{data.inventory.rented}</b></div>
              <div>จอง <b className="text-purple-600">{data.inventory.reserved}</b></div>
              <div>ชำรุด <b className="text-amber-600">{data.inventory.damaged}</b></div>
              <div>สูญหาย <b className="text-red-600">{data.inventory.lost}</b></div>
            </div>
          </section>

          {/* ── Operational Status ── */}
          <section className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4">
            <h2 className="font-semibold mb-3">สถานะการเช่า (ปัจจุบัน)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>กำลังเช่า <b>{data.operational.active_rentals}</b></div>
              <div>คืนบางส่วน <b>{data.operational.partial_returned}</b></div>
              <div>เกินกำหนด <b className="text-red-600">{data.operational.overdue}</b></div>
              <div>รอจัดส่ง <b>{data.operational.pending_dispatch}</b></div>
              <div>Reservation Active <b>{data.operational.reservation_active}</b></div>
              <div>Backorder รอดำเนินการ <b className="text-amber-600">{data.operational.backorder_pending}</b></div>
            </div>
          </section>

          {/* ── Quotation Status ── */}
          <section className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4">
            <h2 className="font-semibold mb-3">สถานะใบเสนอราคา</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div>Draft <b>{data.quotations.draft}</b></div>
              <div>ส่งแล้ว <b>{data.quotations.sent}</b></div>
              <div>อนุมัติแล้ว <b className="text-emerald-600">{data.quotations.accepted}</b></div>
              <div>แปลงเป็นบิล <b className="text-blue-600">{data.quotations.converted}</b></div>
              <div>ยกเลิก <b className="text-red-500">{data.quotations.cancelled}</b></div>
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            {/* Daily breakdown */}
            <section className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4 overflow-auto">
              <h2 className="font-semibold mb-3">รายรับ/รายจ่ายรายวัน</h2>
              {data.daily.length === 0 ? (
                <div className="text-sm text-slate-500">ไม่มีรายการในช่วงเวลาที่เลือก</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">วันที่</th>
                      <th>รายรับ</th>
                      <th>รายจ่าย</th>
                      <th>สุทธิ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily.map((x) => (
                      <tr key={x.date} className="border-b last:border-0">
                        <td className="py-2">{x.date}</td>
                        <td>{currency.format(x.income)}</td>
                        <td>{currency.format(x.expense)}</td>
                        <td>{currency.format(x.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* Payment methods */}
            <section className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4">
              <h2 className="font-semibold mb-3">ช่องทางรับชำระ</h2>
              <div className="space-y-2">
                {data.payment_methods.length === 0 ? (
                  <div className="text-sm text-slate-500">ไม่มีรายการ</div>
                ) : (
                  data.payment_methods.map((x) => (
                    <div key={x.method} className="flex justify-between text-sm">
                      <span>
                        {x.method} ({x.count})
                      </span>
                      <b>{currency.format(x.amount)}</b>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Top Products */}
            <section className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4">
              <h2 className="font-semibold mb-3">สินค้ายอดสูงสุด</h2>
              <div className="space-y-2">
                {data.top_products.length === 0 ? (
                  <div className="text-sm text-slate-500">ไม่มีรายการ</div>
                ) : (
                  data.top_products.map((x) => (
                    <div key={x.productId} className="flex justify-between gap-3 text-sm">
                      <span>
                        {x.productCode} — {x.productName} ({x.quantity})
                      </span>
                      <b>{currency.format(x.billedAmount)}</b>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Top Customers */}
            <section className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4">
              <h2 className="font-semibold mb-3">ลูกค้ารับชำระสูงสุด</h2>
              <div className="space-y-2">
                {data.top_customers.length === 0 ? (
                  <div className="text-sm text-slate-500">ไม่มีรายการ</div>
                ) : (
                  data.top_customers.map((x) => (
                    <div key={x.customerId} className="flex justify-between gap-3 text-sm">
                      <span>{x.customerName}</span>
                      <b>{currency.format(x.receivedAmount)}</b>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
