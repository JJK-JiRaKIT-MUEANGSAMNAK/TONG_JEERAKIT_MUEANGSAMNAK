'use client'

import React, { useState } from 'react'
import { Calendar, AlertTriangle, Layers, ShoppingCart } from 'lucide-react'
import { Product } from '@/lib/types/rental-pos'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { CustomDatePicker, getLocalDateString } from '@/components/common/CustomDatePicker'
import { NumericInput } from '@/components/common/NumericInput'

export type CartRentalType = 'NORMAL' | 'DAILY' | 'SALE'

export function calculateBillableDays(startStr: string, endStr: string, mode: string = 'START_DATE_IS_DAY_ONE'): number {
  if (!startStr || !endStr) return 1
  const start = new Date(startStr)
  const end = new Date(endStr)
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (mode === 'START_DATE_IS_DAY_ONE') {
    return Math.max(1, diffDays + 1)
  }
  return Math.max(1, diffDays)
}

interface QuantityModalProps {
  product: Product
  onAdd: (itemData: {
    product: Product
    rentalType: CartRentalType
    quantity: number
    unitPrice: number
    usageCount: number
    dailyStartDate?: Date
    dailyEndDate?: Date
  }) => void
  onClose: () => void
}

export function QuantityModal({ product, onAdd, onClose }: QuantityModalProps) {
  const defaultDays = 1
  const calculationMode = 'START_DATE_IS_DAY_ONE'

  const rentalType = product.rental_type ?? product.rentalType ?? 'NORMAL'
  const normalPrice = product.normal_price ?? product.normalPrice ?? 0
  const dailyPrice = product.daily_price ?? product.dailyPrice ?? 0
  const salePrice = product.sale_price ?? product.salePrice ?? 0
  const available = product.available_qty ?? product.availableQuantity ?? product.totalQuantity ?? 0
  const productName = product.product_name || product.name || ''
  const productCode = product.product_code || product.code || ''
  const unitName = product.unit_name || product.unit || 'ชิ้น'

  const [selectedQty, setSelectedQty] = useState<number | null>(1)
  const [pendingConfirm, setPendingConfirm] = useState<boolean>(false)
  const [inputQty, setInputQty] = useState<number | ''>(1)
  const [unitPrice, setUnitPrice] = useState<number | ''>(
    rentalType === 'DAILY'
      ? dailyPrice
      : rentalType === 'SALE'
        ? salePrice
        : normalPrice
  )
  const [usageCount, setUsageCount] = useState<number | ''>(1)

  const today = new Date()
  const defaultEnd = new Date()
  defaultEnd.setDate(today.getDate() + Math.max(0, defaultDays - 1))

  const [startDate, setStartDate] = useState<string>(getLocalDateString(today))
  const [endDate, setEndDate] = useState<string>(getLocalDateString(defaultEnd))

  const billableDays = rentalType === 'DAILY'
    ? calculateBillableDays(startDate, endDate, calculationMode)
    : 1

  const numericQtyForWarning = typeof inputQty === 'number' ? inputQty : 0
  const isOverAvailable = numericQtyForWarning > available

  const handleNumberButtonClick = (num: number) => {
    if (selectedQty === num && pendingConfirm) {
      submitItem(num)
    } else {
      setSelectedQty(num)
      setInputQty(num)
      setPendingConfirm(true)
    }
  }

  const submitItem = (qtyToUse?: number | '') => {
    const finalQty =
      typeof qtyToUse === 'number' && qtyToUse > 0
        ? qtyToUse
        : Math.max(1, typeof inputQty === 'number' ? inputQty : (parseInt(String(inputQty), 10) || 1))

    if (finalQty <= 0) return

    const finalPrice = Math.max(
      0,
      typeof unitPrice === 'number' ? unitPrice : (parseFloat(String(unitPrice)) || 0)
    )
    const finalUsage = Math.max(
      1,
      typeof usageCount === 'number' ? usageCount : (parseInt(String(usageCount), 10) || 1)
    )

    onAdd({
      product,
      rentalType,
      quantity: finalQty,
      unitPrice: finalPrice,
      usageCount: rentalType === 'NORMAL' ? finalUsage : 1,
      dailyStartDate: rentalType === 'DAILY' ? new Date(startDate) : undefined,
      dailyEndDate: rentalType === 'DAILY' ? new Date(endDate) : undefined,
    })
    onClose()
  }

  const previewAmount = (
    (typeof unitPrice === 'number' ? unitPrice : (parseFloat(String(unitPrice)) || 0)) *
    (typeof inputQty === 'number' ? inputQty : (parseInt(String(inputQty), 10) || 0)) *
    (rentalType === 'DAILY'
      ? billableDays
      : rentalType === 'NORMAL'
        ? (typeof usageCount === 'number' ? usageCount : (parseInt(String(usageCount), 10) || 1))
        : 1)
  )

  return (
    <AppModal isOpen={true} onClose={onClose} size="md">
      <AppModalHeader
        onClose={onClose}
        icon={rentalType === 'SALE'
          ? <ShoppingCart className="w-5 h-5 text-violet-600" />
          : <Layers className="w-5 h-5 text-blue-600" />}
      >
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
            {productName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            รหัส: {productCode} | สต็อกพร้อมใช้: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{available} {unitName}</span>
          </p>
        </div>
      </AppModalHeader>

      <AppModalBody className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              ราคาต่อหน่วยในรายการนี้ (บาท)
            </label>
            <NumericInput
              value={unitPrice}
              onChange={(val) => setUnitPrice(val)}
              defaultValueOnBlur={0}
              min={0}
              allowDecimals={true}
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-500">เปลี่ยนราคาตรงนี้มีผลเฉพาะรายการ/บิลนี้ ไม่แก้ราคา Master</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              จำนวนที่ต้องการ
            </label>
            <NumericInput
              value={inputQty}
              onChange={(val) => {
                setInputQty(val)
                setSelectedQty(typeof val === 'number' && val <= 50 ? val : null)
                setPendingConfirm(false)
              }}
              defaultValueOnBlur={1}
              min={1}
              allowDecimals={false}
              placeholder="1"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {isOverAvailable && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>จำนวนที่เลือก ({inputQty || 0}) มากกว่าสต็อกพร้อมใช้งาน ({available}) ระบบฐานข้อมูลจะไม่อนุญาตให้สต็อกติดลบ</span>
          </div>
        )}

        {rentalType === 'NORMAL' && (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              จำนวนรอบการใช้งาน
            </label>
            <NumericInput
              value={usageCount}
              onChange={(val) => setUsageCount(val)}
              defaultValueOnBlur={1}
              min={1}
              allowDecimals={false}
              placeholder="1"
              className="w-full sm:w-1/2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        )}

        {rentalType === 'DAILY' && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>กำหนดช่วงวันที่เช่า</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-500 block mb-1">วันเริ่มเช่า</span>
                <CustomDatePicker
                  value={startDate ? new Date(startDate) : null}
                  onChange={(d) => setStartDate(d ? getLocalDateString(d) : '')}
                  align="left"
                  placeholder="วัน/เดือน/ปี"
                />
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">วันสิ้นสุดเช่า</span>
                <CustomDatePicker
                  value={endDate ? new Date(endDate) : null}
                  onChange={(d) => setEndDate(d ? getLocalDateString(d) : '')}
                  align="right"
                  placeholder="วัน/เดือน/ปี"
                />
              </div>
            </div>
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-900">
              ระยะเวลา: <span className="font-bold text-sm">{billableDays} วัน</span> ({startDate} ถึง {endDate})
            </div>
          </div>
        )}

        {rentalType === 'SALE' && (
          <div className="flex items-start gap-2.5 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs text-violet-800 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-200">
            <ShoppingCart className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">รายการขาย — ไม่ต้องคืนสินค้า</p>
              <p className="mt-0.5">คิดราคา = จำนวน × ราคาต่อหน่วย และเมื่อบันทึกบิลสำเร็จจะตัดสต็อกออกถาวร</p>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              เลือกจำนวนแบบเร็ว (1-50) — <span className="text-blue-600 dark:text-blue-400">กดครั้งที่ 2 เพื่อยืนยันทันที</span>
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 max-h-44 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
            {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedQty === num
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumberButtonClick(num)}
                  className={`py-1.5 rounded-lg font-bold text-xs transition-all duration-150 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500 shadow-md scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {num}
                </button>
              )
            })}
          </div>
        </div>
      </AppModalBody>

      <AppModalFooter>
        <div className="flex-1 flex items-center justify-between w-full">
          <div className="text-xs">
            <span className="text-slate-500 dark:text-slate-400">ราคารวม: </span>
            <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
              {previewAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => submitItem(inputQty)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              เพิ่มลงตะกร้า
            </button>
          </div>
        </div>
      </AppModalFooter>
    </AppModal>
  )
}
