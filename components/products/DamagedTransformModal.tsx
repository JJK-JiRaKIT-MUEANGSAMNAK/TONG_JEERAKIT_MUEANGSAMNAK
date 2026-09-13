'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { NumericInput } from '@/components/common/NumericInput'
import { CustomSelect } from '@/components/common/CustomSelect'
import { Product } from '@/lib/types/rental-pos'
import { logger } from '@/lib/utils/logger'
import { Shuffle, AlertTriangle } from 'lucide-react'

export interface DamagedTransformModalProps {
  isOpen: boolean
  onClose: () => void
  sourceProduct: Product | null
  allProducts: Product[]
  onSuccess: (updated: {
    sourceProduct: Product
    targetProduct: Product
    transformedQty: number
  }) => void
  onShowToast: (title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => void
}

export function DamagedTransformModal({
  isOpen,
  onClose,
  sourceProduct,
  allProducts,
  onSuccess,
  onShowToast,
}: DamagedTransformModalProps) {
  const [targetProductId, setTargetProductId] = useState<string>('')
  const [transformQty, setTransformQty] = useState<number>(1)
  const [note, setNote] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Filter selectable target products (exclude source product)
  const targetProductOptions = useMemo(() => {
    if (!sourceProduct) return []
    return allProducts
      .filter((p) => p.id !== sourceProduct.id)
      .map((p) => ({
        value: p.id,
        label: `${p.name} (พร้อมใช้: ${p.availableQuantity} ${p.unit})`,
      }))
  }, [allProducts, sourceProduct])

  // Selected Target Product Object
  const targetProduct = useMemo(() => {
    return allProducts.find((p) => p.id === targetProductId) || null
  }, [allProducts, targetProductId])

  useEffect(() => {
    if (sourceProduct && isOpen) {
      setTransformQty(Math.min(1, sourceProduct.damagedQuantity || 1))
      setNote('')
      const firstTarget = allProducts.find((p) => p.id !== sourceProduct.id)
      setTargetProductId(firstTarget?.id || '')
    }
  }, [sourceProduct, allProducts, isOpen])

  if (!isOpen || !sourceProduct) return null

  const maxTransform = sourceProduct.damagedQuantity || 0
  const isQtyValid = transformQty > 0 && transformQty <= maxTransform
  const isTargetValid = !!targetProductId && targetProductId !== sourceProduct.id

  // Source previews
  const sourceTargetDamaged = Math.max(0, maxTransform - transformQty)
  const sourceTargetTotal = Math.max(0, sourceProduct.totalQuantity - transformQty)

  // Target previews
  const targetNewAvailable = targetProduct ? targetProduct.availableQuantity + transformQty : 0
  const targetNewTotal = targetProduct ? targetProduct.totalQuantity + transformQty : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isQtyValid || !isTargetValid || !targetProduct || isSubmitting) return

    setIsSubmitting(true)
    try {
      const updatedSource: Product = {
        ...sourceProduct,
        damagedQuantity: Math.max(0, (sourceProduct.damagedQuantity || 0) - transformQty),
        totalQuantity: Math.max(0, sourceProduct.totalQuantity - transformQty),
      }

      const updatedTarget: Product = {
        ...targetProduct,
        availableQuantity: targetNewAvailable,
        totalQuantity: targetNewTotal,
      }

      onShowToast(
        'ดัดแปลงสินค้าสำเร็จ',
        `ดัดแปลง ${sourceProduct.name} จำนวน ${transformQty} ${sourceProduct.unit} เป็น ${targetProduct.name} เรียบร้อยแล้ว`,
        'SUCCESS'
      )

      onSuccess({
        sourceProduct: updatedSource,
        targetProduct: updatedTarget,
        transformedQty: transformQty,
      })
      onClose()
    } catch (err: any) {
      logger.error('Error transforming damaged stock in modal:', err)
      onShowToast(
        'เกิดข้อผิดพลาด',
        err?.message || 'ไม่สามารถดัดแปลงสินค้าได้',
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
        icon={<Shuffle className="w-5 h-5 text-amber-600" />}
      >
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            ดัดแปลงสินค้าชำรุดเป็นสินค้าอื่น
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            สินค้าต้นทาง: {sourceProduct.name}
          </p>
        </div>
      </AppModalHeader>

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
        <AppModalBody className="space-y-4">
            {/* Source Product Info Card */}
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                สินค้าต้นทาง (Source)
              </span>
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                  {sourceProduct.name}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 font-bold">
                  ชำรุด: {sourceProduct.damagedQuantity} {sourceProduct.unit}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">หมวดหมู่: {sourceProduct.category}</p>
            </div>

            {/* Target Product Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                เลือกสินค้าปลายทาง (Target Product) <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={targetProductId}
                onChange={(val) => setTargetProductId(String(val))}
                options={targetProductOptions}
                placeholder="-- เลือกสินค้าที่ต้องการดัดแปลงเป็น --"
              />
              {!targetProductId && (
                <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>กรุณาเลือกสินค้าปลายทาง</span>
                </p>
              )}
            </div>

            {/* Quantity Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                จำนวนที่ต้องการดัดแปลง ({sourceProduct.unit}) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <NumericInput
                  value={transformQty}
                  onChange={(val) => setTransformQty(val === '' ? 0 : Number(val))}
                  min={1}
                  max={maxTransform}
                  allowDecimals={false}
                  defaultValueOnBlur={1}
                  className="w-full h-10 px-3 text-base font-extrabold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setTransformQty(maxTransform)}
                  className="h-10 px-3 shrink-0 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  ทั้งหมด ({maxTransform})
                </button>
              </div>
              {!isQtyValid && (
                <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ต้องระบุจำนวนระหว่าง 1 ถึง {maxTransform}</span>
                </p>
              )}
            </div>

            {/* Note Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                หมายเหตุ / รายละเอียดการดัดแปลง (ถ้ามี)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ตัดดัดแปลงเป็นขนาดสั้น, ประกอบชุดใหม่"
                className="w-full h-9 px-3 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Real-time Preview Balance */}
            {targetProduct && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  สรุปผลกระทบต่อสต็อกสินค้าทั้งสองรายการ:
                </span>
                
                {/* Source Product Impact */}
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">1. สินค้าต้นทาง ({sourceProduct.name})</span>
                    <span>ตัดออกจากชำรุด</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span>ยอดชำรุด: <span className="line-through text-slate-400">{sourceProduct.damagedQuantity}</span> → <span className="font-bold text-amber-600 dark:text-amber-400">{sourceTargetDamaged}</span></span>
                    <span>ยอดทั้งหมด: <span className="line-through text-slate-400">{sourceProduct.totalQuantity}</span> → <span className="font-bold text-slate-700 dark:text-slate-300">{sourceTargetTotal}</span></span>
                  </div>
                </div>

                {/* Target Product Impact */}
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">2. สินค้าปลายทาง ({targetProduct.name})</span>
                    <span>เพิ่มเข้าสต็อกพร้อมใช้</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span>พร้อมใช้: <span className="text-slate-400">{targetProduct.availableQuantity}</span> → <span className="font-bold text-emerald-600 dark:text-emerald-400">{targetNewAvailable}</span></span>
                    <span>ยอดทั้งหมด: <span className="text-slate-400">{targetProduct.totalQuantity}</span> → <span className="font-bold text-slate-700 dark:text-slate-300">{targetNewTotal}</span></span>
                  </div>
                </div>
              </div>
            )}

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
              disabled={!isQtyValid || !isTargetValid || isSubmitting}
              className={`px-5 py-2 rounded-xl font-bold text-xs text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                !isQtyValid || !isTargetValid || isSubmitting
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-400'
                  : 'bg-amber-600 hover:bg-amber-700 active:scale-98'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการดัดแปลงสินค้า'}</span>
            </button>
          </AppModalFooter>
        </form>
    </AppModal>
  )
}
