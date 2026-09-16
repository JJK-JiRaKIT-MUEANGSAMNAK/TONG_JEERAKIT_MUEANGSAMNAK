'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Download, Printer } from 'lucide-react'
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
import { CustomDatePicker, getLocalDateString } from '@/components/common/CustomDatePicker'

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
    waiting: number
    accepted: number
    converted: number
    cancelled: number
    rejected: number
    expired: number
    total: number
  }
  daily: Array<{ date: string; income: number; expense: number; net: number }>
  payment_methods: Array<{ method: string; count: number; amount: number }>
  top_products: TopProductStat[]
  top_customers: TopCustomerStat[]
}

type TabType = 'OVERVIEW' | 'FINANCE' | 'STOCK' | 'RENTAL' | 'QUOTATION'

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
      waiting: quot.waiting,
      accepted: quot.accepted,
      converted: quot.converted,
      cancelled: quot.cancelled,
      rejected: quot.rejected,
      expired: quot.expired,
      total: quot.total,
    },
    daily: fin.daily,
    payment_methods: fin.byPaymentMethod,
    top_products: topProducts,
    top_customers: topCustomers,
  }
}

export default function AuthoritativeReports() {
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [endDate, setEndDate] = useState<Date | null>(() => new Date())
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW')
  const [data, setData] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const opts = {
        startDate: startDate ? getLocalDateString(startDate) : undefined,
        endDate: endDate ? getLocalDateString(endDate) : undefined,
      }
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

  useEffect(() => {
    void load()
  }, [load])

  const exportCsv = () => {
    if (!data) return
    const totalPhysical =
      data.inventory.available +
      data.inventory.reserved +
      data.inventory.rented +
      data.inventory.damaged +
      data.inventory.lost

    const rows: string[][] = [
      ['ส่วน', 'รายการ', 'ค่า / รายละเอียด', 'จำนวนเพิ่มเติม'],
      // Finance
      ['การเงิน', 'รับเงินจริง (ไม่รวมมัดจำ)', String(data.finance.payments_received)],
      ['การเงิน', 'คืนเงินลูกค้า', String(data.finance.expense)],
      ['การเงิน', 'รายรับสุทธิ', String(data.finance.net)],
      ['การเงิน', 'รายรับจากการเช่า', String(data.finance.rental_revenue)],
      ['การเงิน', 'รายรับจากการขาย', String(data.finance.sale_revenue)],
      ['การเงิน', 'มัดจำค้างอยู่ (ปัจจุบัน)', String(data.finance.deposit_held)],
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
      ['คลัง', 'สินค้า Active', String(data.inventory.active_products)],
      ['คลัง', 'พร้อมใช้', String(data.inventory.available)],
      ['คลัง', 'กำลังเช่า', String(data.inventory.rented)],
      ['คลัง', 'จอง', String(data.inventory.reserved)],
      ['คลัง', 'ชำรุด', String(data.inventory.damaged)],
      ['คลัง', 'สูญหาย', String(data.inventory.lost)],
      ['คลัง', 'จำนวนทรัพย์สินรวม', String(totalPhysical)],
      [],
      // Rentals
      ['การเช่า', 'กำลังเช่า', String(data.operational.active_rentals)],
      ['การเช่า', 'คืนบางส่วน', String(data.operational.partial_returned)],
      ['การเช่า', 'เกินกำหนด', String(data.operational.overdue)],
      ['การเช่า', 'รอจัดส่ง', String(data.operational.pending_dispatch)],
      ['การเช่า', 'Reservation Active', String(data.operational.reservation_active)],
      ['การเช่า', 'Backorder รอดำเนินการ', String(data.operational.backorder_pending)],
      [],
      // Quotations
      ['ใบเสนอราคา', 'ร่าง (DRAFT)', String(data.quotations.draft)],
      ['ใบเสนอราคา', 'ส่งแล้ว (SENT)', String(data.quotations.sent)],
      ['ใบเสนอราคา', 'รอยืนยัน (WAITING)', String(data.quotations.waiting)],
      ['ใบเสนอราคา', 'ตอบรับแล้ว (ACCEPTED)', String(data.quotations.accepted)],
      ['ใบเสนอราคา', 'เป็นบิลแล้ว (CONVERTED)', String(data.quotations.converted)],
      ['ใบเสนอราคา', 'ยกเลิก (CANCELLED)', String(data.quotations.cancelled)],
      ['ใบเสนอราคา', 'ปฏิเสธ (REJECTED)', String(data.quotations.rejected)],
      ['ใบเสนอราคา', 'หมดอายุ (EXPIRED)', String(data.quotations.expired)],
      ['ใบเสนอราคา', 'รวมทั้งหมด', String(data.quotations.total)],
      [],
      // Top Products
      ['สินค้ายอดสูงสุด', 'รหัสสินค้า', 'ชื่อสินค้า', 'จำนวน', 'ยอดขาย/เช่า'],
      ...data.top_products.map((p) => ['สินค้ายอดสูงสุด', p.productCode, p.productName, String(p.quantity), String(p.billedAmount)]),
      [],
      // Top Customers
      ['ลูกค้ารับชำระสูงสุด', 'รหัสลูกค้า', 'ชื่อลูกค้า', 'ยอดชำระ'],
      ...data.top_customers.map((c) => ['ลูกค้ารับชำระสูงสุด', c.customerId, c.customerName, String(c.receivedAmount)]),
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
    const startStr = startDate ? getLocalDateString(startDate) : 'all'
    const endStr = endDate ? getLocalDateString(endDate) : 'all'
    a.download = `POS_Report_${startStr}_${endStr}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'OVERVIEW', label: 'ภาพรวม' },
    { id: 'FINANCE', label: 'การเงิน' },
    { id: 'STOCK', label: 'สต็อก' },
    { id: 'RENTAL', label: 'การเช่า' },
    { id: 'QUOTATION', label: 'ใบเสนอราคา' },
  ]

  return (
    <div className="h-full min-h-0 flex flex-col overflow-y-auto overflow-x-hidden p-2 bg-slate-100 dark:bg-slate-900 gap-2 text-xs">
      {/* ── Toolbar: Category Tabs + Filters & Actions ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Category Tabs */}
        <div className="h-9 p-1 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center shrink-0">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-7 px-3.5 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 shadow-xs font-bold'
                    : 'bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Right Section: Date Pickers or Current Notice + Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'OVERVIEW' || activeTab === 'FINANCE' ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-32 sm:w-36">
                <CustomDatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="จากวันที่"
                  align="left"
                  showClear={true}
                  buttonClassName="h-9 px-2.5 py-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold hover:border-slate-300 dark:hover:border-slate-600"
                />
              </div>
              <span className="text-slate-400 font-bold text-xs shrink-0">ถึง</span>
              <div className="w-32 sm:w-36">
                <CustomDatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="ถึงวันที่"
                  align="left"
                  showClear={true}
                  buttonClassName="h-9 px-2.5 py-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold hover:border-slate-300 dark:hover:border-slate-600"
                />
              </div>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              ข้อมูลสถานะเป็นข้อมูลปัจจุบัน ไม่เปลี่ยนตามช่วงวันที่
            </span>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={exportCsv}
              disabled={!data}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!data}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-700 text-xs">{error}</div>
      )}

      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-slate-500 font-semibold text-xs">
          กำลังคำนวณรายงาน...
        </div>
      )}

      {!loading && data && (
        <>
          {/* ════════════════════════════════════════════════════════════════════════
              TAB 1: ภาพรวม (Overview)
             ════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-2">
              {/* 4 Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 sm:p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 shadow-xs">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block">
                    รับเงินจริง (ไม่รวมมัดจำ)
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                    {currency.format(data.finance.payments_received)}
                  </h3>
                </div>

                <div className="bg-red-50 dark:bg-red-950/30 p-2.5 sm:p-3 rounded-2xl border border-red-200/60 dark:border-red-900/40 shadow-xs">
                  <span className="text-[11px] text-red-700 dark:text-red-300 font-semibold block">
                    คืนเงินลูกค้า
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-red-600 dark:text-red-400 mt-0.5 font-mono">
                    {currency.format(data.finance.expense)}
                  </h3>
                </div>

                <div
                  className={`p-2.5 sm:p-3 rounded-2xl border shadow-xs ${
                    data.finance.net >= 0
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40'
                      : 'bg-red-50 dark:bg-red-950/30 border-red-200/60 dark:border-red-900/40'
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold block ${
                      data.finance.net >= 0
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    รายรับสุทธิ
                  </span>
                  <h3
                    className={`text-lg sm:text-xl font-black mt-0.5 font-mono ${
                      data.finance.net >= 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {currency.format(data.finance.net)}
                  </h3>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/30 p-2.5 sm:p-3 rounded-2xl border border-purple-200/60 dark:border-purple-900/40 shadow-xs">
                  <span className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold block">
                    จำนวนบิล
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5 font-mono">
                    {data.finance.bill_count.toLocaleString()} บิล
                  </h3>
                </div>
              </div>

              {/* 3 Compact Horizontal Status Strips */}
              <div className="flex flex-col gap-2 shrink-0">
                {/* Strip 1: คลัง */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200 shrink-0">สถานะคลัง (ปัจจุบัน)</span>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                    <span className="text-slate-500">พร้อมใช้: <b className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{data.inventory.available.toLocaleString()}</b></span>
                    <span className="text-slate-500">กำลังเช่า: <b className="text-blue-600 dark:text-blue-400 font-mono font-bold">{data.inventory.rented.toLocaleString()}</b></span>
                    <span className="text-slate-500">จอง: <b className="text-purple-600 dark:text-purple-400 font-mono font-bold">{data.inventory.reserved.toLocaleString()}</b></span>
                    <span className="text-slate-500">ชำรุด: <b className="text-amber-600 dark:text-amber-400 font-mono font-bold">{data.inventory.damaged.toLocaleString()}</b></span>
                    <span className="text-slate-500">สูญหาย: <b className="text-red-600 dark:text-red-400 font-mono font-bold">{data.inventory.lost.toLocaleString()}</b></span>
                  </div>
                </div>

                {/* Strip 2: การเช่า */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200 shrink-0">สถานะการเช่า (ปัจจุบัน)</span>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                    <span className="text-slate-500">กำลังเช่า: <b className="text-blue-600 dark:text-blue-400 font-mono font-bold">{data.operational.active_rentals.toLocaleString()}</b></span>
                    <span className="text-slate-500">คืนบางส่วน: <b className="text-amber-600 dark:text-amber-400 font-mono font-bold">{data.operational.partial_returned.toLocaleString()}</b></span>
                    <span className="text-slate-500">เกินกำหนด: <b className="text-red-600 dark:text-red-400 font-mono font-bold">{data.operational.overdue.toLocaleString()}</b></span>
                    <span className="text-slate-500">รอจัดส่ง: <b className="text-slate-700 dark:text-slate-300 font-mono font-bold">{data.operational.pending_dispatch.toLocaleString()}</b></span>
                    <span className="text-slate-500">จองอยู่: <b className="text-purple-600 dark:text-purple-400 font-mono font-bold">{data.operational.reservation_active.toLocaleString()}</b></span>
                    <span className="text-slate-500">Backorder: <b className="text-amber-600 dark:text-amber-400 font-mono font-bold">{data.operational.backorder_pending.toLocaleString()}</b></span>
                  </div>
                </div>

                {/* Strip 3: ใบเสนอราคา */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200 shrink-0">สถานะใบเสนอราคา</span>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                    <span className="text-slate-500">ร่าง: <b className="text-slate-600 dark:text-slate-400 font-mono font-bold">{data.quotations.draft.toLocaleString()}</b></span>
                    <span className="text-slate-500">ส่งแล้ว: <b className="text-blue-600 dark:text-blue-400 font-mono font-bold">{data.quotations.sent.toLocaleString()}</b></span>
                    <span className="text-slate-500">รอยืนยัน: <b className="text-amber-600 dark:text-amber-400 font-mono font-bold">{data.quotations.waiting.toLocaleString()}</b></span>
                    <span className="text-slate-500">ตอบรับแล้ว: <b className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{data.quotations.accepted.toLocaleString()}</b></span>
                    <span className="text-slate-500">เป็นบิลแล้ว: <b className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{data.quotations.converted.toLocaleString()}</b></span>
                    <span className="text-slate-500">ไม่สำเร็จ: <b className="text-red-600 dark:text-red-400 font-mono font-bold">{(data.quotations.cancelled + data.quotations.rejected + data.quotations.expired).toLocaleString()}</b></span>
                  </div>
                </div>
              </div>

              {/* Top Products & Top Customers Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {/* Top Products */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xs flex flex-col">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs">สินค้ายอดสูงสุด (10 อันดับ)</h3>
                    <span className="text-[11px] text-slate-400 font-mono">Top Products</span>
                  </div>
                  <div className="overflow-x-hidden">
                    {data.top_products.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs italic">ไม่มีรายการในช่วงเวลาที่เลือก</div>
                    ) : (
                      <table className="w-full table-fixed text-xs leading-tight">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold text-[11px]">
                            <th className="py-2 text-left w-[55%]">สินค้า</th>
                            <th className="py-2 text-center w-[15%]">จำนวน</th>
                            <th className="py-2 text-right w-[30%]">ยอดรวม</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {data.top_products.map((p) => (
                            <tr key={p.productId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-1.5 truncate font-medium text-slate-800 dark:text-slate-200" title={`${p.productCode} - ${p.productName}`}>
                                <span className="font-mono text-slate-500 mr-1">{p.productCode}</span> {p.productName}
                              </td>
                              <td className="py-1.5 text-center font-mono text-slate-600 dark:text-slate-400">{p.quantity.toLocaleString()}</td>
                              <td className="py-1.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">{currency.format(p.billedAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Top Customers */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xs flex flex-col">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs">ลูกค้ารับชำระสูงสุด (10 อันดับ)</h3>
                    <span className="text-[11px] text-slate-400 font-mono">Top Customers</span>
                  </div>
                  <div className="overflow-x-hidden">
                    {data.top_customers.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs italic">ไม่มีรายการในช่วงเวลาที่เลือก</div>
                    ) : (
                      <table className="w-full table-fixed text-xs leading-tight">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold text-[11px]">
                            <th className="py-2 text-left w-[65%]">ลูกค้า</th>
                            <th className="py-2 text-right w-[35%]">ยอดชำระ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {data.top_customers.map((c) => (
                            <tr key={c.customerId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-1.5 truncate font-medium text-slate-800 dark:text-slate-200" title={c.customerName}>
                                {c.customerName}
                              </td>
                              <td className="py-1.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{currency.format(c.receivedAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              TAB 2: การเงิน (Finance)
             ════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'FINANCE' && (
            <div className="space-y-2">
              {/* 2-Column Summary Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs">สรุปรายงานการเงิน</h3>
                  <span className="text-[11px] text-slate-400 font-mono">Financial Summary</span>
                </div>
                <div className="overflow-x-hidden">
                  <table className="w-full table-fixed text-xs leading-tight">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold text-[11px]">
                        <th className="py-2 text-left w-[60%]">รายการ</th>
                        <th className="py-2 text-right w-[40%]">จำนวน / ยอดรวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-300">รับเงินจริง (ไม่รวมมัดจำ)</td>
                        <td className="py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {currency.format(data.finance.payments_received)}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-300">คืนเงินลูกค้า</td>
                        <td className="py-2 text-right font-mono font-bold text-red-600 dark:text-red-400">
                          {currency.format(data.finance.expense)}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-300">รายรับสุทธิ</td>
                        <td className={`py-2 text-right font-mono font-bold ${data.finance.net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                          {currency.format(data.finance.net)}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-300">รายรับจากการเช่า</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                          {currency.format(data.finance.rental_revenue)}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-300">รายรับจากการขาย</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                          {currency.format(data.finance.sale_revenue)}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-300">มัดจำค้างอยู่ (ปัจจุบัน)</td>
                        <td className="py-2 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                          {currency.format(data.finance.deposit_held)}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-300">ลูกหนี้คงค้าง</td>
                        <td className="py-2 text-right font-mono font-bold text-orange-600 dark:text-orange-400">
                          {currency.format(data.finance.current_receivable)}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-300">VAT ตามบิล</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                          {currency.format(data.finance.vat_billed)}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-300">จำนวนบิล</td>
                        <td className="py-2 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                          {data.finance.bill_count.toLocaleString()} บิล
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Daily & Payment Methods Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {/* Daily Statement */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xs flex flex-col">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs">รายรับ/รายจ่ายรายวัน</h3>
                    <span className="text-[11px] text-slate-400 font-mono">Daily Breakdown</span>
                  </div>
                  <div className="overflow-x-hidden max-h-80 overflow-y-auto">
                    {data.daily.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs italic">ไม่มีรายการในช่วงเวลาที่เลือก</div>
                    ) : (
                      <table className="w-full table-fixed text-xs leading-tight">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold text-[11px]">
                            <th className="py-2 text-left w-[28%]">วันที่</th>
                            <th className="py-2 text-right w-[24%]">รายรับ</th>
                            <th className="py-2 text-right w-[24%]">รายจ่าย</th>
                            <th className="py-2 text-right w-[24%]">สุทธิ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {data.daily.map((x) => (
                            <tr key={x.date} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-1.5 font-mono text-slate-600 dark:text-slate-400 text-[11px]">{x.date}</td>
                              <td className="py-1.5 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">{currency.format(x.income)}</td>
                              <td className="py-1.5 text-right font-mono font-medium text-red-600 dark:text-red-400">{currency.format(x.expense)}</td>
                              <td className="py-1.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">{currency.format(x.net)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xs flex flex-col">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs">ช่องทางรับชำระ</h3>
                    <span className="text-[11px] text-slate-400 font-mono">Payment Channels</span>
                  </div>
                  <div className="overflow-x-hidden max-h-80 overflow-y-auto">
                    {data.payment_methods.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs italic">ไม่มีรายการ</div>
                    ) : (
                      <table className="w-full table-fixed text-xs leading-tight">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold text-[11px]">
                            <th className="py-2 text-left w-[45%]">ช่องทาง</th>
                            <th className="py-2 text-center w-[20%]">จำนวนครั้ง</th>
                            <th className="py-2 text-right w-[35%]">ยอดรวม</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {data.payment_methods.map((x) => (
                            <tr key={x.method} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-1.5 font-medium text-slate-800 dark:text-slate-200 truncate">{x.method}</td>
                              <td className="py-1.5 text-center font-mono text-slate-600 dark:text-slate-400">{x.count.toLocaleString()}</td>
                              <td className="py-1.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">{currency.format(x.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              TAB 3: สต็อก (Stock)
             ════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'STOCK' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs">สรุปสถานะสินค้า / สต็อกปัจจุบัน</h3>
                <span className="text-[11px] text-slate-400 font-mono">Stock Summary</span>
              </div>
              <div className="overflow-x-hidden">
                <table className="w-full table-fixed text-xs leading-tight">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold text-[11px]">
                      <th className="py-2 text-left w-[60%]">รายการ</th>
                      <th className="py-2 text-right w-[40%]">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">สินค้า Active</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100">{data.inventory.active_products.toLocaleString()} รายการ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">พร้อมใช้</td>
                      <td className="py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{data.inventory.available.toLocaleString()} ชิ้น</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">จอง</td>
                      <td className="py-2 text-right font-mono font-bold text-purple-600 dark:text-purple-400">{data.inventory.reserved.toLocaleString()} ชิ้น</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">กำลังเช่า</td>
                      <td className="py-2 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{data.inventory.rented.toLocaleString()} ชิ้น</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">ชำรุด</td>
                      <td className="py-2 text-right font-mono font-bold text-amber-600 dark:text-amber-400">{data.inventory.damaged.toLocaleString()} ชิ้น</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">สูญหาย</td>
                      <td className="py-2 text-right font-mono font-bold text-red-600 dark:text-red-400">{data.inventory.lost.toLocaleString()} ชิ้น</td>
                    </tr>
                    <tr className="bg-slate-50/80 dark:bg-slate-900/60 font-bold">
                      <td className="py-2 font-bold text-slate-900 dark:text-slate-100">จำนวนทรัพย์สินรวม (totalPhysical)</td>
                      <td className="py-2 text-right font-mono font-black text-slate-900 dark:text-slate-100">
                        {(data.inventory.available + data.inventory.reserved + data.inventory.rented + data.inventory.damaged + data.inventory.lost).toLocaleString()} ชิ้น
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              TAB 4: การเช่า (Rental)
             ════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'RENTAL' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs">สรุปสถานะการเช่าและการดำเนินงาน (ปัจจุบัน)</h3>
                <span className="text-[11px] text-slate-400 font-mono">Rental Operational Status</span>
              </div>
              <div className="overflow-x-hidden">
                <table className="w-full table-fixed text-xs leading-tight">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold text-[11px]">
                      <th className="py-2 text-left w-[60%]">สถานะการดำเนินงาน</th>
                      <th className="py-2 text-right w-[40%]">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">กำลังเช่า</td>
                      <td className="py-2 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{data.operational.active_rentals.toLocaleString()} รายการ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">คืนบางส่วน</td>
                      <td className="py-2 text-right font-mono font-bold text-amber-600 dark:text-amber-400">{data.operational.partial_returned.toLocaleString()} รายการ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">เกินกำหนด</td>
                      <td className="py-2 text-right font-mono font-bold text-red-600 dark:text-red-400">{data.operational.overdue.toLocaleString()} รายการ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">รอจัดส่ง</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200">{data.operational.pending_dispatch.toLocaleString()} รายการ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">Reservation Active</td>
                      <td className="py-2 text-right font-mono font-bold text-purple-600 dark:text-purple-400">{data.operational.reservation_active.toLocaleString()} รายการ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">Backorder รอดำเนินการ</td>
                      <td className="py-2 text-right font-mono font-bold text-amber-600 dark:text-amber-400">{data.operational.backorder_pending.toLocaleString()} รายการ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              TAB 5: ใบเสนอราคา (Quotation)
             ════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'QUOTATION' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs">สรุปสถานะใบเสนอราคาทั้งหมด</h3>
                <span className="text-[11px] text-slate-400 font-mono">Quotation Summary</span>
              </div>
              <div className="overflow-x-hidden">
                <table className="w-full table-fixed text-xs leading-tight">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold text-[11px]">
                      <th className="py-2 text-left w-[60%]">สถานะใบเสนอราคา</th>
                      <th className="py-2 text-right w-[40%]">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">ร่าง (DRAFT)</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-600 dark:text-slate-400">{data.quotations.draft.toLocaleString()} ฉบับ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">ส่งแล้ว (SENT)</td>
                      <td className="py-2 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{data.quotations.sent.toLocaleString()} ฉบับ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">รอยืนยัน (WAITING)</td>
                      <td className="py-2 text-right font-mono font-bold text-amber-600 dark:text-amber-400">{data.quotations.waiting.toLocaleString()} ฉบับ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">ตอบรับแล้ว (ACCEPTED)</td>
                      <td className="py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{data.quotations.accepted.toLocaleString()} ฉบับ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">เป็นบิลแล้ว (CONVERTED)</td>
                      <td className="py-2 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">{data.quotations.converted.toLocaleString()} ฉบับ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">ยกเลิก (CANCELLED)</td>
                      <td className="py-2 text-right font-mono font-bold text-red-600 dark:text-red-400">{data.quotations.cancelled.toLocaleString()} ฉบับ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">ปฏิเสธ (REJECTED)</td>
                      <td className="py-2 text-right font-mono font-bold text-red-600 dark:text-red-400">{data.quotations.rejected.toLocaleString()} ฉบับ</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 font-medium text-slate-700 dark:text-slate-300">หมดอายุ (EXPIRED)</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-500 dark:text-slate-400">{data.quotations.expired.toLocaleString()} ฉบับ</td>
                    </tr>
                    <tr className="bg-slate-50/80 dark:bg-slate-900/60 font-bold">
                      <td className="py-2 font-bold text-slate-900 dark:text-slate-100">รวมทั้งหมด (TOTAL)</td>
                      <td className="py-2 text-right font-mono font-black text-slate-900 dark:text-slate-100">{data.quotations.total.toLocaleString()} ฉบับ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
