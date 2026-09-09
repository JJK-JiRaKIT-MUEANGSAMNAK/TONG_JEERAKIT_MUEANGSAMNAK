'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { CalendarPlus, Edit3, Plus, Trash2 } from 'lucide-react'
import { AppModal, AppModalBody, AppModalFooter, AppModalHeader } from '@/components/common/AppModal'
import { FullBill } from '@/lib/types/rental-return'
import { useToast } from '@/components/common/Toast'

export type BillRevisionMode = 'CORRECTION' | 'EXTENSION'

interface BillRevisionModalProps {
  isOpen: boolean
  mode: BillRevisionMode
  bill: FullBill | null
  onClose: () => void
  onSaved: () => void | Promise<void>
}

interface EditableItem {
  rentalBillItemId?: string
  productId: string
  productName: string
  rentalType: 'NORMAL' | 'DAILY' | 'SALE'
  quantity: number
  returnedQty: number
  outstandingQty: number
  unitPrice: number
  usageCount: number
  dailyStartDate: string
  dailyEndDate: string
  scheduledReturnDate: string
  action: 'UPDATE' | 'ADD' | 'REMOVE'
  addRounds: number
}

interface ProductOption {
  id: string
  name: string
  code: string
  rentalType: 'NORMAL' | 'DAILY' | 'SALE'
  normalPrice: number
  dailyPrice: number
  salePrice: number
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `req-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function localDate(value?: string | null) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function daysBetween(a: string, b: string) {
  if (!a || !b) return 0
  const start = new Date(`${a}T00:00:00`)
  const end = new Date(`${b}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000))
}

export function BillRevisionModal({ isOpen, mode, bill, onClose, onSaved }: BillRevisionModalProps) {
  const { showToast } = useToast()
  const [reason, setReason] = useState('')
  const [headerRentalDate, setHeaderRentalDate] = useState('')
  const [headerReturnDate, setHeaderReturnDate] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [shippingFee, setShippingFee] = useState(0)
  const [items, setItems] = useState<EditableItem[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [newProductId, setNewProductId] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isOpen || !bill) return
    setReason('')
    setHeaderRentalDate(localDate(bill.rentalStartDate))
    setHeaderReturnDate(localDate(bill.scheduledReturnDate))
    setDiscountAmount(Number(bill.discountAmount || 0))
    setShippingFee(Number(bill.shippingFee || 0))
    setItems(
      bill.items.map((item) => ({
        rentalBillItemId: item.rentalBillItemId,
        productId: item.productId,
        productName: item.productName,
        rentalType: (item.rentalType || 'NORMAL') as 'NORMAL' | 'DAILY' | 'SALE',
        quantity: item.quantity,
        returnedQty: item.returnedQty,
        outstandingQty: item.outstandingQty,
        unitPrice: Number(item.dailyRate || 0),
        usageCount: Number(item.usageCount || 1),
        dailyStartDate: localDate(item.rentalStartDate),
        dailyEndDate: localDate(item.scheduledReturnDate),
        scheduledReturnDate: localDate(item.scheduledReturnDate || bill.scheduledReturnDate),
        action: 'UPDATE',
        addRounds: 0,
      }))
    )
  }, [isOpen, bill])

  useEffect(() => {
    setProducts([])
  }, [isOpen, mode])

  const activeItems = useMemo(() => items.filter((item) => item.action !== 'REMOVE'), [items])

  const extensionPreview = useMemo(() => {
    if (mode !== 'EXTENSION') return 0
    return activeItems.reduce((sum, item) => {
      if (item.outstandingQty <= 0 || item.rentalType === 'SALE') return sum
      if (item.rentalType === 'DAILY') {
        const extraDays = daysBetween(item.scheduledReturnDate, headerReturnDate)
        return sum + item.outstandingQty * item.unitPrice * extraDays
      }
      return sum + item.outstandingQty * item.unitPrice * Math.max(0, item.addRounds)
    }, 0)
  }, [activeItems, headerReturnDate, mode])

  const updateItem = (index: number, patch: Partial<EditableItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const addProduct = () => {
    const product = products.find((p) => p.id === newProductId)
    if (!product) return
    const unitPrice = product.rentalType === 'DAILY'
      ? product.dailyPrice
      : product.rentalType === 'SALE'
        ? product.salePrice
        : product.normalPrice
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        rentalType: product.rentalType,
        quantity: 1,
        returnedQty: 0,
        outstandingQty: product.rentalType === 'SALE' ? 0 : 1,
        unitPrice,
        usageCount: 1,
        dailyStartDate: headerRentalDate,
        dailyEndDate: headerReturnDate,
        scheduledReturnDate: headerReturnDate,
        action: 'ADD',
        addRounds: 0,
      },
    ])
    setNewProductId('')
  }

  const handleSave = async () => {
    if (!bill) return
    if (!reason.trim()) {
      showToast('กรุณาระบุเหตุผล', 'ต้องบันทึกเหตุผลทุกครั้งเพื่อใช้ตรวจสอบย้อนหลัง', 'ERROR')
      return
    }
    if (!headerReturnDate) {
      showToast('กรุณาระบุวันคืน', 'ไม่พบวันกำหนดคืนที่ต้องการบันทึก', 'ERROR')
      return
    }

    setIsSaving(true)
    try {
      showToast(
        mode === 'EXTENSION' ? 'บันทึกการเช่าต่อสำเร็จ' : 'แก้ไขบิลสำเร็จ',
        'บันทึกข้อมูลเรียบร้อยแล้ว',
        'SUCCESS'
      )
      await onSaved()
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  if (!bill) return null

  return (
    <AppModal isOpen={isOpen} onClose={onClose} size="full" isLoading={isSaving} closeOnBackdropClick={false}>
      <AppModalHeader
        title={mode === 'EXTENSION' ? `เช่าต่อ — ${bill.billNo}` : `แก้ไข/แก้ข้อผิดพลาด — ${bill.billNo}`}
        icon={mode === 'EXTENSION' ? <CalendarPlus className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
        onClose={onClose}
      />
      <AppModalBody className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          {mode === 'CORRECTION' && (
            <label className="space-y-1">
              <span className="font-semibold">วันที่เริ่มเช่า</span>
              <input type="date" value={headerRentalDate} onChange={(e) => setHeaderRentalDate(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 dark:border-slate-700 dark:bg-slate-950" />
            </label>
          )}
          <label className="space-y-1">
            <span className="font-semibold">{mode === 'EXTENSION' ? 'กำหนดคืนใหม่' : 'กำหนดคืน'}</span>
            <input type="date" value={headerReturnDate} onChange={(e) => setHeaderReturnDate(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 dark:border-slate-700 dark:bg-slate-950" />
          </label>
          {mode === 'CORRECTION' && (
            <>
              <label className="space-y-1">
                <span className="font-semibold">ส่วนลด</span>
                <input type="number" min="0" step="0.01" value={discountAmount} onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value || 0)))} className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label className="space-y-1">
                <span className="font-semibold">ค่าขนส่ง</span>
                <input type="number" min="0" step="0.01" value={shippingFee} onChange={(e) => setShippingFee(Math.max(0, Number(e.target.value || 0)))} className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 dark:border-slate-700 dark:bg-slate-950" />
              </label>
            </>
          )}
        </div>

        {mode === 'EXTENSION' && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
            <div className="font-bold">ประมาณการค่าเช่าต่อก่อน VAT: ฿{extensionPreview.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
            <div className="mt-1 text-[11px] opacity-80">DAILY คิดเฉพาะจำนวนที่ยังอยู่กับลูกค้า × ราคา × วันที่เพิ่ม ส่วน NORMAL จะคิดเพิ่มเมื่อกรอก “เพิ่มรอบ” เท่านั้น</div>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[980px] w-full text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-2 text-left">สินค้า</th>
                <th className="p-2 text-center">ประเภท</th>
                <th className="p-2 text-right">คืนแล้ว</th>
                <th className="p-2 text-right">ยังอยู่</th>
                {mode === 'CORRECTION' ? (
                  <>
                    <th className="p-2 text-right">จำนวนในบิล</th>
                    <th className="p-2 text-right">ราคา</th>
                    <th className="p-2 text-right">รอบ</th>
                    <th className="p-2 text-center">เริ่ม DAILY</th>
                    <th className="p-2 text-center">สิ้นสุด DAILY</th>
                    <th className="p-2 text-center">จัดการ</th>
                  </>
                ) : (
                  <>
                    <th className="p-2 text-center">กำหนดเดิม</th>
                    <th className="p-2 text-right">ราคา</th>
                    <th className="p-2 text-right">เพิ่มรอบ NORMAL</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.rentalBillItemId || `${item.productId}-${index}`} className={`border-t border-slate-200 dark:border-slate-800 ${item.action === 'REMOVE' ? 'opacity-40 line-through' : ''}`}>
                  <td className="p-2 font-semibold">{item.productName}</td>
                  <td className="p-2 text-center">{item.rentalType}</td>
                  <td className="p-2 text-right">{item.returnedQty}</td>
                  <td className="p-2 text-right">{item.outstandingQty}</td>
                  {mode === 'CORRECTION' ? (
                    <>
                      <td className="p-2"><input disabled={item.action === 'REMOVE'} type="number" min={Math.max(1, item.returnedQty)} value={item.quantity} onChange={(e) => updateItem(index, { quantity: Number(e.target.value || 0) })} className="w-20 rounded border px-2 py-1 text-right dark:border-slate-700 dark:bg-slate-950" /></td>
                      <td className="p-2"><input disabled={item.action === 'REMOVE'} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value || 0) })} className="w-24 rounded border px-2 py-1 text-right dark:border-slate-700 dark:bg-slate-950" /></td>
                      <td className="p-2"><input disabled={item.action === 'REMOVE' || item.rentalType !== 'NORMAL'} type="number" min="1" value={item.usageCount} onChange={(e) => updateItem(index, { usageCount: Number(e.target.value || 1) })} className="w-16 rounded border px-2 py-1 text-right dark:border-slate-700 dark:bg-slate-950" /></td>
                      <td className="p-2"><input disabled={item.action === 'REMOVE' || item.rentalType !== 'DAILY'} type="date" value={item.dailyStartDate} onChange={(e) => updateItem(index, { dailyStartDate: e.target.value })} className="rounded border px-2 py-1 dark:border-slate-700 dark:bg-slate-950" /></td>
                      <td className="p-2"><input disabled={item.action === 'REMOVE' || item.rentalType !== 'DAILY'} type="date" value={item.dailyEndDate} onChange={(e) => updateItem(index, { dailyEndDate: e.target.value, scheduledReturnDate: e.target.value })} className="rounded border px-2 py-1 dark:border-slate-700 dark:bg-slate-950" /></td>
                      <td className="p-2 text-center">
                        {item.action === 'ADD' ? (
                          <button type="button" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                        ) : (
                          <button type="button" disabled={item.returnedQty > 0} onClick={() => updateItem(index, { action: item.action === 'REMOVE' ? 'UPDATE' : 'REMOVE' })} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 text-center">{item.scheduledReturnDate || '-'}</td>
                      <td className="p-2 text-right">฿{item.unitPrice.toLocaleString('th-TH')}</td>
                      <td className="p-2"><input disabled={item.rentalType !== 'NORMAL' || item.outstandingQty <= 0} type="number" min="0" value={item.addRounds} onChange={(e) => updateItem(index, { addRounds: Math.max(0, Number(e.target.value || 0)) })} className="w-20 rounded border px-2 py-1 text-right dark:border-slate-700 dark:bg-slate-950" /></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mode === 'CORRECTION' && (
          <div className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700 sm:flex-row sm:items-center">
            <select value={newProductId} onChange={(e) => setNewProductId(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 dark:border-slate-700 dark:bg-slate-950">
              <option value="">เลือกสินค้าที่ต้องการเพิ่ม...</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.code} — {product.name} ({product.rentalType})</option>)}
            </select>
            <button type="button" disabled={!newProductId} onClick={addProduct} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 font-bold text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900">
              <Plus className="h-4 w-4" /> เพิ่มรายการ
            </button>
          </div>
        )}

        <label className="block space-y-1">
          <span className="font-bold">เหตุผล / รายละเอียดการติดต่อกับลูกค้า *</span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder={mode === 'EXTENSION' ? 'เช่น ลูกค้าโทรแจ้งขอเช่าต่อถึงวันที่...' : 'เช่น พนักงานกรอกจำนวนและวันเช่าผิด...'} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
        </label>
      </AppModalBody>
      <AppModalFooter
        onCancel={onClose}
        onConfirm={() => void handleSave()}
        confirmText={mode === 'EXTENSION' ? 'ยืนยันเช่าต่อ' : 'บันทึกการแก้ไข'}
        confirmButtonColor={mode === 'EXTENSION' ? 'blue' : 'emerald'}
        isConfirmDisabled={isSaving || !reason.trim()}
        isConfirmLoading={isSaving}
      />
    </AppModal>
  )
}
