'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart3, Download, Printer, RefreshCw } from 'lucide-react'
export interface ReportSummary {
  finance: {
    payments_received: number
    income: number
    expense: number
    net: number
    current_receivable: number
    vat_billed: number
    bill_count: number
  }
  inventory: {
    active_products: number
    available: number
    rented: number
    reserved: number
    damaged: number
    lost: number
  }
  daily: Array<{
    date: string
    income: number
    expense: number
    net: number
  }>
  payment_methods: Array<{
    method: string
    count: number
    amount: number
  }>
  top_products: Array<{
    product_id: string
    product_code: string
    product_name: string
    quantity: number
    billed_amount: number
  }>
  top_customers: Array<{
    customer_id: string
    customer_name: string
    received_amount: number
  }>
}

function localDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const currency = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 })

export default function AuthoritativeReports() {
  const initial = useMemo(() => {
    const now = new Date()
    return { start: localDate(new Date(now.getFullYear(), now.getMonth(), 1)), end: localDate(now) }
  }, [])
  const [startDate, setStartDate] = useState(initial.start)
  const [endDate, setEndDate] = useState(initial.end)
  const [data, setData] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(false)
    setError(null)
  }, [])

  useEffect(() => { void load() }, [load])

  const exportCsv = () => {
    if (!data) return
    const rows = [
      ['วันที่', 'รายรับ', 'รายจ่าย', 'สุทธิ'],
      ...data.daily.map((x) => [x.date, String(x.income), String(x.expense), String(x.net)]),
    ]
    const csv = '\uFEFF' + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `POS_Report_${startDate}_${endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const cards = data ? [
    ['รับเงินจริง', currency.format(data.finance.payments_received)],
    ['รายรับ Ledger', currency.format(data.finance.income)],
    ['รายจ่าย Ledger', currency.format(data.finance.expense)],
    ['สุทธิ', currency.format(data.finance.net)],
    ['ลูกหนี้คงค้าง', currency.format(data.finance.current_receivable)],
    ['VAT ตามบิล', currency.format(data.finance.vat_billed)],
    ['จำนวนบิล', String(data.finance.bill_count)],
    ['สินค้า Active', String(data.inventory.active_products)],
  ] : []

  return (
    <div className="h-full overflow-auto p-4 md:p-6 space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6" /> รายงาน</h1>
          <p className="text-sm text-slate-500">สรุปภาพรวมและสถิติการดำเนินงาน</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs">จาก<input className="mt-1 block rounded border bg-transparent px-2 py-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
          <label className="text-xs">ถึง<input className="mt-1 block rounded border bg-transparent px-2 py-2" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
          <button onClick={() => void load()} className="rounded border px-3 py-2 flex items-center gap-1"><RefreshCw className="h-4 w-4" /> รีเฟรช</button>
          <button onClick={exportCsv} disabled={!data} className="rounded border px-3 py-2 flex items-center gap-1 disabled:opacity-40"><Download className="h-4 w-4" /> CSV</button>
          <button onClick={() => window.print()} disabled={!data} className="rounded border px-3 py-2 flex items-center gap-1 disabled:opacity-40"><Printer className="h-4 w-4" /> พิมพ์</button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>}
      {loading && <div className="rounded-lg border p-8 text-center">กำลังคำนวณรายงานจากฐานข้อมูล...</div>}

      {!loading && data && <>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map(([label, value]) => <div key={label} className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div></div>)}
        </div>

        <section className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4">
          <h2 className="font-semibold mb-3">สถานะคลังปัจจุบัน</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div>พร้อมใช้ <b>{data.inventory.available}</b></div>
            <div>กำลังเช่า <b>{data.inventory.rented}</b></div>
            <div>จอง <b>{data.inventory.reserved}</b></div>
            <div>ชำรุด <b>{data.inventory.damaged}</b></div>
            <div>สูญหาย <b>{data.inventory.lost}</b></div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4 overflow-auto">
            <h2 className="font-semibold mb-3">รายรับ/รายจ่ายรายวัน</h2>
            <table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">วันที่</th><th>รายรับ</th><th>รายจ่าย</th><th>สุทธิ</th></tr></thead><tbody>
              {data.daily.map((x) => <tr key={x.date} className="border-b last:border-0"><td className="py-2">{x.date}</td><td>{currency.format(x.income)}</td><td>{currency.format(x.expense)}</td><td>{currency.format(x.net)}</td></tr>)}
            </tbody></table>
          </section>

          <section className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4">
            <h2 className="font-semibold mb-3">ช่องทางรับชำระ</h2>
            <div className="space-y-2">{data.payment_methods.length === 0 ? <div className="text-sm text-slate-500">ไม่มีรายการ</div> : data.payment_methods.map((x) => <div key={x.method} className="flex justify-between text-sm"><span>{x.method} ({x.count})</span><b>{currency.format(x.amount)}</b></div>)}</div>
          </section>

          <section className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4">
            <h2 className="font-semibold mb-3">สินค้ายอดสูงสุด</h2>
            <div className="space-y-2">{data.top_products.map((x) => <div key={x.product_id} className="flex justify-between gap-3 text-sm"><span>{x.product_code} — {x.product_name} ({x.quantity})</span><b>{currency.format(x.billed_amount)}</b></div>)}</div>
          </section>

          <section className="rounded-xl border bg-white/70 dark:bg-slate-900/60 p-4">
            <h2 className="font-semibold mb-3">ลูกค้ารับชำระสูงสุด</h2>
            <div className="space-y-2">{data.top_customers.map((x) => <div key={x.customer_id} className="flex justify-between gap-3 text-sm"><span>{x.customer_name}</span><b>{currency.format(x.received_amount)}</b></div>)}</div>
          </section>
        </div>
      </>}
    </div>
  )
}
