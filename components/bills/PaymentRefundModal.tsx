'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AppModal, AppModalBody, AppModalFooter, AppModalHeader } from '@/components/common/AppModal'
import { NumericInput } from '@/components/common/NumericInput'

export type RefundMethod = 'CASH' | 'TRANSFER' | 'QR' | 'CHEQUE' | 'OTHER'

export interface RefundablePayment {
  id: string
  paymentNo?: string
  paymentMethod: string
  paidAmount: number
  refundableAmount: number
  paymentDate: string
  referenceNo?: string
}

interface PaymentRefundModalProps {
  isOpen: boolean
  rentalBillId: string
  billNo: string
  onClose: () => void
  onSuccess: (message: string) => void | Promise<void>
}

const today = () => new Date().toISOString().slice(0, 10)

export function PaymentRefundModal({ isOpen, rentalBillId, billNo, onClose, onSuccess }: PaymentRefundModalProps) {
  const [payments, setPayments] = useState<RefundablePayment[]>([])
  const [paymentId, setPaymentId] = useState('')
  const [amount, setAmount] = useState(0)
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('CASH')
  const [refundDate, setRefundDate] = useState(today())
  const [referenceNo, setReferenceNo] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selected = useMemo(() => payments.find((payment) => payment.id === paymentId) || null, [payments, paymentId])

  useEffect(() => {
    if (!isOpen || !rentalBillId) return
    setLoading(false)
    setError('')
    setPayments([])
  }, [isOpen, rentalBillId])

  const choosePayment = (id: string) => {
    setPaymentId(id)
    const row = payments.find((payment) => payment.id === id)
    setAmount(row?.refundableAmount || 0)
    if (row && ['CASH', 'TRANSFER', 'QR', 'CHEQUE', 'OTHER'].includes(row.paymentMethod)) {
      setRefundMethod(row.paymentMethod as RefundMethod)
    }
  }

  const submit = async () => {
    if (!selected) return setError('กรุณาเลือกรายการรับชำระที่ต้องการคืนเงิน')
    if (amount <= 0 || amount > selected.refundableAmount + 0.001) {
      return setError(`ยอดคืนเงินต้องอยู่ระหว่าง 0.01 ถึง ${selected.refundableAmount.toLocaleString('th-TH')} บาท`)
    }
    if (!reason.trim()) return setError('กรุณาระบุเหตุผลการคืนเงิน')

    setSaving(true)
    setError('')
    try {
      await onSuccess(`คืนเงินจำนวน ฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} สำเร็จ`)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppModal isOpen={isOpen} onClose={saving ? () => {} : onClose} size="lg">
      <AppModalHeader title={`คืนเงินจากรายการรับชำระ — ${billNo}`} onClose={saving ? undefined : onClose} />
      <AppModalBody>
        <div className="space-y-3 text-xs">
          {loading ? (
            <div className="py-8 text-center text-slate-500">กำลังโหลดรายการรับชำระ...</div>
          ) : payments.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
              ไม่มีรายการรับชำระที่ยังมียอดคืนได้
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">รายการรับชำระ</label>
                <select value={paymentId} onChange={(event) => choosePayment(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                  {payments.map((payment) => (
                    <option key={payment.id} value={payment.id}>
                      {payment.paymentNo} · {payment.paymentMethod} · คืนได้ ฿{payment.refundableAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">ยอดคืนเงิน (บาท)</label>
                  <NumericInput value={amount} min={0} max={selected?.refundableAmount || 0} onChange={(value) => setAmount(value === '' ? 0 : Number(value))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold dark:border-slate-700 dark:bg-slate-900" />
                  <div className="mt-1 text-[10px] text-slate-500">คืนได้สูงสุด ฿{(selected?.refundableAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">วันที่คืนเงิน</label>
                  <input type="date" value={refundDate} onChange={(event) => setRefundDate(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">ช่องทางคืนเงิน</label>
                  <select value={refundMethod} onChange={(event) => setRefundMethod(event.target.value as RefundMethod)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                    <option value="CASH">เงินสด</option>
                    <option value="TRANSFER">โอนเงิน</option>
                    <option value="QR">QR</option>
                    <option value="CHEQUE">เช็ค</option>
                    <option value="OTHER">อื่น ๆ</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">เลขอ้างอิง</label>
                  <input value={referenceNo} onChange={(event) => setReferenceNo(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="ถ้ามี" />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">เหตุผลการคืนเงิน *</label>
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="ระบุเหตุผลเพื่อเก็บ Audit Trail" />
              </div>
            </>
          )}

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
        </div>
      </AppModalBody>
      <AppModalFooter>
        <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200">ยกเลิก</button>
        <button type="button" onClick={submit} disabled={saving || loading || !selected} className="rounded-xl bg-red-600 px-4 py-2 font-extrabold text-white hover:bg-red-700 disabled:opacity-50">{saving ? 'กำลังคืนเงิน...' : 'ยืนยันคืนเงิน'}</button>
      </AppModalFooter>
    </AppModal>
  )
}
