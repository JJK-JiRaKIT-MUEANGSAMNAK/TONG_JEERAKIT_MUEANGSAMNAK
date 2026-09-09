'use client'

import React, { useState, useEffect } from 'react'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { NumericInput } from '@/components/common/NumericInput'
import { Product } from '@/lib/types/rental-pos'
import { logger } from '@/lib/utils/logger'
import { RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react'

export interface DamagedRestoreModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSuccess: (updated: { product: Product; restoredQty: number }) => void
  onShowToast: (title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => void
}

export function DamagedRestoreModal({
  isOpen,
  onClose,
  product,
  onSuccess,
  onShowToast,
}: DamagedRestoreModalProps) {
  const [restoreQty, setRestoreQty] = useState<number>(1)
  const [note, setNote] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    if (product && isOpen) {
      setRestoreQty(Math.min(1, product.damagedQuantity || 1))
      setNote('')
    }
  }, [product, isOpen])

  if (!isOpen || !product) return null

  const maxRestore = product.damagedQuantity || 0
  const isQtyValid = restoreQty > 0 && restoreQty <= maxRestore
  const targetAvailable = product.availableQuantity + restoreQty
  const targetDamaged = Math.max(0, maxRestore - restoreQty)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isQtyValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      const updatedProduct: Product = {
        ...product,
        availableQuantity: targetAvailable,
        damagedQuantity: targetDamaged,
        totalQuantity: product.totalQuantity,
      }

      onShowToast(
        'นำสินค้ากลับมาใช้งานต่อสำเร็จ',
        `นำ ${product.name} จำนวน ${restoreQty} ${product.unit} กลับเข้าสต็อกพร้อมใช้เรียบร้อยแล้ว`,
        'SUCCESS'
      )

      onSuccess({ product: updatedProduct, restoredQty: restoreQty })
      onClose()
    } catch (err: any) {
      logger.error('Error restoring damaged stock in modal:', err)
      onShowToast(
        'เกิดข้อผิดพลาด',
        err?.message || 'ไม่สามารถนำสินค้ากลับมาใช้งานต่อได้',
        'ERROR'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppModal isOpen={isOpen} onClose={onClose} size="md">
      <AppModalHeader
        onClose={onClose}
        icon={<RotateCcw className="w-5 h-5 text-emerald-600" />}
      >
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            นำสินค้าชำรุดกลับมาใช้งานต่อ
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            รหัส: {product.code} | {product.name}
          </p>
        </div>
      </AppModalHeader>

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
        <AppModalBody className="space-y-4">
            {/* Product Summary Info Card */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">รายการสินค้า:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{product.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                  <span className="block text-[10px] text-amber-700 dark:text-amber-300 font-semibold">ชำรุดปัจจุบัน</span>
                  <span className="block text-base font-black text-amber-600 dark:text-amber-400">
                    {product.damagedQuantity} <span className="text-[10px] font-normal">{product.unit}</span>
                  </span>
                </div>
                <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="block text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">พร้อมใช้ปัจจุบัน</span>
                  <span className="block text-base font-black text-emerald-600 dark:text-emerald-400">
                    {product.availableQuantity} <span className="text-[10px] font-normal">{product.unit}</span>
                  </span>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                  <span className="block text-[10px] text-blue-700 dark:text-blue-300 font-semibold">กำลังเช่าอยู่</span>
                  <span className="block text-base font-black text-blue-600 dark:text-blue-400">
                    {product.rentedQuantity} <span className="text-[10px] font-normal">{product.unit}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                จำนวนที่ต้องการนำกลับมาใช้งานต่อ ({product.unit}) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <NumericInput
                  value={restoreQty}
                  onChange={(val) => setRestoreQty(val === '' ? 0 : Number(val))}
                  min={1}
                  max={maxRestore}
                  allowDecimals={false}
                  defaultValueOnBlur={1}
                  className="w-full h-10 px-3 text-base font-extrabold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setRestoreQty(maxRestore)}
                  className="h-10 px-3 shrink-0 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  ทั้งหมด ({maxRestore})
                </button>
              </div>
              {!isQtyValid && (
                <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ต้องระบุจำนวนระหว่าง 1 ถึง {maxRestore}</span>
                </p>
              )}
            </div>

            {/* Note Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                หมายเหตุ / ผลการซ่อม (ถ้ามี)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ซ่อมแซมเรียบร้อยแล้ว, ตรวจสอบแล้วสภาพสมบูรณ์"
                className="w-full h-9 px-3 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Real-time Preview Balance */}
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/40 space-y-2">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                สรุปผลการปรับยอดสต็อก:
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">สินค้าชำรุด (ลดลง)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-slate-500 line-through">{product.damagedQuantity}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{targetDamaged}</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">พร้อมให้เช่า (เพิ่มขึ้น)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-slate-500">{product.availableQuantity}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{targetAvailable}</span>
                  </div>
                </div>
              </div>
            </div>
          </AppModalBody>

          {/* Bottom Actions */}
          <AppModalFooter>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!isQtyValid || isSubmitting}
              className={`px-5 py-2 rounded-xl font-bold text-xs text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                !isQtyValid || isSubmitting
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันนำกลับมาใช้งานต่อ'}</span>
            </button>
          </AppModalFooter>
        </form>
    </AppModal>
  )
}
