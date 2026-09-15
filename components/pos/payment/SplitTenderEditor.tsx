'use client'

import React, { useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { NumericInput } from '@/components/common/NumericInput'

export type SplitTenderMethod = 'CASH' | 'TRANSFER' | 'QR' | 'CHEQUE' | 'OTHER'

export interface SplitPaymentTender {
  id: string
  requestId: string
  paymentMethod: SplitTenderMethod
  amount: number
  cashReceived: number
  referenceNo: string
}

interface SplitTenderEditorProps {
  outstandingAmount: number
  tenders: SplitPaymentTender[]
  onChange: (tenders: SplitPaymentTender[]) => void
  createTender: (paymentMethod?: SplitTenderMethod) => SplitPaymentTender
  disabled?: boolean
}

const METHOD_LABELS: Record<SplitTenderMethod, string> = {
  CASH: 'เงินสด',
  TRANSFER: 'โอนเงิน',
  QR: 'PromptPay QR',
  CHEQUE: 'เช็ค',
  OTHER: 'อื่น ๆ',
}

export function SplitTenderEditor({
  outstandingAmount,
  tenders,
  onChange,
  createTender,
  disabled = false,
}: SplitTenderEditorProps) {
  const enabledMethods: SplitTenderMethod[] = useMemo(
    () => ['CASH', 'TRANSFER', 'QR', 'CHEQUE', 'OTHER'],
    []
  )

  const total = useMemo(
    () => tenders.reduce((sum, tender) => sum + Math.max(0, Number(tender.amount) || 0), 0),
    [tenders]
  )
  const remaining = Math.max(0, outstandingAmount - total)
  const overpayment = total > outstandingAmount + 0.001
  const cashInvalid = tenders.some(
    (tender) => tender.paymentMethod === 'CASH' && tender.amount > 0 && tender.cashReceived < tender.amount
  )

  const updateTender = (id: string, patch: Partial<SplitPaymentTender>) => {
    onChange(tenders.map((tender) => (tender.id === id ? { ...tender, ...patch } : tender)))
  }

  const removeTender = (id: string) => {
    if (tenders.length <= 1) return
    onChange(tenders.filter((tender) => tender.id !== id))
  }

  const addTender = () => {
    if (tenders.length >= 8) return
    const usedMethods = new Set(tenders.map((tender) => tender.paymentMethod))
    const nextMethod = enabledMethods.find((method) => !usedMethods.has(method)) || enabledMethods[0]
    onChange([...tenders, createTender(nextMethod)])
  }

  const fillRemaining = (id: string) => {
    const otherTotal = tenders
      .filter((tender) => tender.id !== id)
      .reduce((sum, tender) => sum + Math.max(0, Number(tender.amount) || 0), 0)
    const amount = Math.max(0, outstandingAmount - otherTotal)
    const current = tenders.find((tender) => tender.id === id)
    updateTender(id, {
      amount,
      cashReceived:
        current?.paymentMethod === 'CASH'
          ? Math.max(current.cashReceived || 0, amount)
          : 0,
    })
  }

  return (
    <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50/40 p-2.5 dark:border-blue-900 dark:bg-blue-950/20">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">แบ่งชำระหลายช่องทาง</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">ยอดชำระรวมต้องไม่เกินยอดค้าง เงินสดยื่นเกินได้เพื่อคำนวณเงินทอน</p>
        </div>
        <button
          type="button"
          onClick={addTender}
          disabled={disabled || tenders.length >= 8}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-blue-300 bg-white px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300"
        >
          <Plus className="h-3.5 w-3.5" /> เพิ่มช่องทาง
        </button>
      </div>

      <div className="space-y-1.5">
        {tenders.map((tender, index) => {
          const change = tender.paymentMethod === 'CASH'
            ? Math.max(0, (Number(tender.cashReceived) || 0) - (Number(tender.amount) || 0))
            : 0
          return (
            <div key={tender.id} className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
              <div className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-end gap-1.5">
                <div>
                  <label className="mb-0.5 block text-[10px] font-bold text-slate-500">ช่องทาง</label>
                  <select
                    value={tender.paymentMethod}
                    disabled={disabled}
                    onChange={(e) => {
                      const method = e.target.value as SplitTenderMethod
                      updateTender(tender.id, {
                        paymentMethod: method,
                        cashReceived: method === 'CASH' ? Math.max(tender.cashReceived || 0, tender.amount || 0) : 0,
                        referenceNo: method === 'CASH' ? '' : tender.referenceNo,
                      })
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  >
                    {enabledMethods.map((method) => (
                      <option key={method} value={method}>{METHOD_LABELS[method]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-0.5 flex items-center justify-between gap-1">
                    <label className="text-[10px] font-bold text-slate-500">ยอดชำระ</label>
                    <button
                      type="button"
                      onClick={() => fillRemaining(tender.id)}
                      disabled={disabled}
                      className="text-[10px] font-bold text-blue-600 hover:underline disabled:opacity-50"
                    >
                      ใส่ยอดที่เหลือ
                    </button>
                  </div>
                  <NumericInput
                    value={tender.amount}
                    onChange={(value) => {
                      const amount = value === '' ? 0 : value
                      updateTender(tender.id, {
                        amount,
                        cashReceived:
                          tender.paymentMethod === 'CASH' && tender.cashReceived < amount
                            ? amount
                            : tender.cashReceived,
                      })
                    }}
                    min={0}
                    defaultValueOnBlur={0}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-black tabular-nums dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <button
                  type="button"
                  aria-label={`ลบช่องทาง ${index + 1}`}
                  onClick={() => removeTender(tender.id)}
                  disabled={disabled || tenders.length <= 1}
                  className="mb-0.5 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {tender.paymentMethod === 'CASH' ? (
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="mb-0.5 block text-[10px] font-bold text-slate-500">เงินสดที่รับมา</label>
                    <NumericInput
                      value={tender.cashReceived}
                      onChange={(value) => updateTender(tender.id, { cashReceived: value === '' ? 0 : value })}
                      min={0}
                      defaultValueOnBlur={0}
                      disabled={disabled}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold tabular-nums dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div className="rounded-lg bg-emerald-50 px-2 py-1.5 dark:bg-emerald-950/30">
                    <span className="block text-[10px] font-bold text-slate-500">เงินทอน</span>
                    <span className="text-sm font-black text-emerald-600 tabular-nums">฿{change.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-1.5">
                  <label className="mb-0.5 block text-[10px] font-bold text-slate-500">เลขอ้างอิง (ถ้ามี)</label>
                  <input
                    value={tender.referenceNo}
                    onChange={(e) => updateTender(tender.id, { referenceNo: e.target.value })}
                    disabled={disabled}
                    placeholder="เลขอ้างอิง / สลิป"
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={`grid grid-cols-3 gap-1.5 rounded-lg p-2 text-center ${overpayment || cashInvalid ? 'bg-red-50 dark:bg-red-950/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
        <div>
          <span className="block text-[10px] font-bold text-slate-500">ยอดค้าง</span>
          <span className="text-xs font-black tabular-nums">฿{outstandingAmount.toLocaleString('th-TH')}</span>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-500">ชำระครั้งนี้</span>
          <span className={`text-xs font-black tabular-nums ${overpayment ? 'text-red-600' : 'text-blue-600'}`}>฿{total.toLocaleString('th-TH')}</span>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-500">คงเหลือ</span>
          <span className="text-xs font-black tabular-nums">฿{remaining.toLocaleString('th-TH')}</span>
        </div>
      </div>

      {overpayment && (
        <p className="rounded-lg bg-red-100 px-2 py-1.5 text-[11px] font-bold text-red-700 dark:bg-red-950/50 dark:text-red-300">
          ยอดชำระรวมเกินยอดค้าง — กรุณาลดยอดชำระก่อนบันทึก
        </p>
      )}
      {cashInvalid && (
        <p className="rounded-lg bg-red-100 px-2 py-1.5 text-[11px] font-bold text-red-700 dark:bg-red-950/50 dark:text-red-300">
          เงินสดที่รับมาต้องไม่น้อยกว่ายอดชำระของช่องทางเงินสด
        </p>
      )}
    </div>
  )
}
