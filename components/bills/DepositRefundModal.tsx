'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { AppModal, AppModalBody, AppModalFooter, AppModalHeader } from '@/components/common/AppModal'
import { FullBill } from '@/lib/types/rental-return'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/lib/contexts/AuthContext'
import { processDepositRefundWorkflow } from '@/lib/bill-workflow-service'

interface DepositRefundModalProps {
  isOpen: boolean
  bill: FullBill | null
  onClose: () => void
  onSaved: () => void | Promise<void>
}

export function DepositRefundModal({ isOpen, bill, onClose, onSaved }: DepositRefundModalProps) {
  const { showToast } = useToast()
  const { user } = useAuth()
  const refundableDeposits = useMemo(
    () => (bill?.deposits || []).filter((deposit) => deposit.heldAmount > 0),
    [bill]
  )
  const [depositId, setDepositId] = useState('')
  const [amount, setAmount] = useState(0)
  const [method, setMethod] = useState<'CASH' | 'TRANSFER' | 'QR' | 'CHEQUE' | 'OTHER'>('CASH')
  const [referenceNo, setReferenceNo] = useState('')
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const selectedDeposit = refundableDeposits.find((deposit) => deposit.id === depositId)

  useEffect(() => {
    if (!isOpen) return
    const first = refundableDeposits[0]
    setDepositId(first?.id || '')
    setAmount(first?.heldAmount || 0)
    setMethod('CASH')
    setReferenceNo('')
    setNote('')
  }, [isOpen, refundableDeposits])

  useEffect(() => {
    if (selectedDeposit && amount > selectedDeposit.heldAmount) {
      setAmount(selectedDeposit.heldAmount)
    }
  }, [selectedDeposit, amount])

  const handleSave = async () => {
    if (!bill || !selectedDeposit) return
    if (amount <= 0 || amount > selectedDeposit.heldAmount) {
      showToast('จำนวนเงินไม่ถูกต้อง', `คืนได้สูงสุด ฿${selectedDeposit.heldAmount.toLocaleString('th-TH')}`, 'ERROR')
      return
    }

    setIsSaving(true)
    try {
      processDepositRefundWorkflow({
        billId: bill.id,
        amount,
        channel: method,
        referenceNo,
        note,
        depositId: selectedDeposit.id,
        actor: {
          userId: user?.userId || 'system',
          displayName: user?.displayName || 'ระบบ',
        },
      })
      showToast('คืนเงินมัดจำสำเร็จ', `คืนเงิน ฿${amount.toLocaleString('th-TH')} เรียบร้อยแล้ว`, 'SUCCESS')
      await onSaved()
      onClose()
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการคืนเงินมัดจำ', err?.message || 'ไม่สามารถคืนเงินมัดจำได้', 'ERROR')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppModal isOpen={isOpen} onClose={onClose} size="md" isLoading={isSaving} closeOnBackdropClick={false}>
      <AppModalHeader title={`คืนเงินมัดจำ${bill ? ` — ${bill.billNo}` : ''}`} icon={<RotateCcw className="h-4 w-4" />} onClose={onClose} />
      <AppModalBody className="space-y-3">
        {!bill || refundableDeposits.length === 0 ? (
          <div className="rounded-xl bg-slate-100 p-4 text-center font-semibold text-slate-500 dark:bg-slate-800">บิลนี้ไม่มีเงินมัดจำคงเหลือให้คืน</div>
        ) : (
          <>
            <label className="block space-y-1">
              <span className="font-semibold">รายการมัดจำ</span>
              <select
                value={depositId}
                onChange={(e) => {
                  const id = e.target.value
                  setDepositId(id)
                  const dep = refundableDeposits.find((row) => row.id === id)
                  setAmount(dep?.heldAmount || 0)
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              >
                {refundableDeposits.map((deposit) => (
                  <option key={deposit.id} value={deposit.id}>
                    รับ {deposit.receivedDate || '-'} — คงเหลือ ฿{deposit.heldAmount.toLocaleString('th-TH')}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="font-semibold">จำนวนเงินที่คืน</span>
                <input type="number" min="0.01" max={selectedDeposit?.heldAmount || 0} step="0.01" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value || 0)))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-right dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label className="block space-y-1">
                <span className="font-semibold">ช่องทางคืนเงิน</span>
                <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
                  <option value="CASH">เงินสด</option>
                  <option value="TRANSFER">โอนเงิน</option>
                  <option value="QR">QR</option>
                  <option value="CHEQUE">เช็ค</option>
                  <option value="OTHER">อื่น ๆ</option>
                </select>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="font-semibold">เลขอ้างอิง (ถ้ามี)</span>
              <input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <label className="block space-y-1">
              <span className="font-semibold">หมายเหตุ</span>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น คืนมัดจำหลังตรวจรับสินค้าครบ" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
            </label>
          </>
        )}
      </AppModalBody>
      <AppModalFooter
        onCancel={onClose}
        onConfirm={() => void handleSave()}
        confirmText="ยืนยันคืนเงินมัดจำ"
        confirmButtonColor="amber"
        isConfirmDisabled={!bill || !selectedDeposit || amount <= 0 || isSaving}
        isConfirmLoading={isSaving}
      />
    </AppModal>
  )
}
