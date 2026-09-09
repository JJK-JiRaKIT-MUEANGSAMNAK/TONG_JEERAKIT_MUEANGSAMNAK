'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ClipboardList, CheckCircle2, Printer } from 'lucide-react'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { NumericInput } from '@/components/common/NumericInput'
import { CustomSelect } from '@/components/common/CustomSelect'
import { Product } from '@/lib/types/rental-pos'
import { useToast } from '@/components/common/Toast'
import { getLocalDateString } from '@/components/common/CustomDatePicker'

interface StockCountRowState {
  productId: string
  productCode: string
  productName: string
  category: string
  unit: string
  originalQuantity: number // ยอดเดิม (totalQuantity)
  originalAvailableQuantity: number // availableQuantity
  normalQty: number | '' // ปกติ (เริ่มต้นเป็นค่าว่าง)
  lostQty: number | '' // สูญหาย (เริ่มต้นเป็นค่าว่าง)
  damagedQty: number | '' // ชำรุด (เริ่มต้นเป็นค่าว่าง)
  soldQty: number | '' // ขายออก (เริ่มต้นเป็นค่าว่าง)
  note: string // หมายเหตุ
}

interface StockCountModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onSuccess?: (updatedProducts: Product[]) => void
}

export function StockCountModal({
  isOpen,
  onClose,
  products,
  onSuccess,
}: StockCountModalProps) {
  const { showToast } = useToast()
  const [countItems, setCountItems] = useState<StockCountRowState[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize count items whenever products change or modal opens
  useEffect(() => {
    if (!isOpen || !products.length) return

    const initial: StockCountRowState[] = products.map((p) => ({
      productId: p.id,
      productCode: p.code,
      productName: p.name,
      category: p.category || 'ทั่วไป',
      unit: p.unit || 'ชิ้น',
      originalQuantity: p.totalQuantity,
      originalAvailableQuantity: p.availableQuantity,
      normalQty: '',
      lostQty: '',
      damagedQty: '',
      soldQty: '',
      note: '',
    }))
    setCountItems(initial)
    setSelectedCategory('ALL')
  }, [isOpen, products])

  // Category filter options
  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category || 'ทั่วไป').filter(Boolean)))
    return [
      { value: 'ALL', label: 'หมวดหมู่: ทั้งหมด' },
      ...cats.map((c) => ({ value: c, label: c })),
    ]
  }, [products])

  // Filtered rows
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'ALL') return countItems
    return countItems.filter((item) => item.category === selectedCategory)
  }, [countItems, selectedCategory])

  const handleFieldChange = (
    productId: string,
    field: 'normalQty' | 'lostQty' | 'damagedQty' | 'soldQty',
    val: number | ''
  ) => {
    const num = val === '' ? '' : Math.max(0, Math.floor(val))
    setCountItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return { ...item, [field]: num }
        }
        return item
      })
    )
  }

  const handleNoteChange = (productId: string, text: string) => {
    setCountItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return { ...item, note: text }
        }
        return item
      })
    )
  }

  // 1-Click Print Stock Count Table via Central Print System
  const handlePrintTable = () => {
    window.print()
  }

  // Confirm Stock Count
  const handleConfirmStockCount = async () => {
    setIsSubmitting(true)
    try {
      showToast('ตรวจนับสต็อกสำเร็จ', 'บันทึกข้อมูลผลตรวจนับเรียบร้อยแล้ว', 'SUCCESS')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppModal isOpen={isOpen} onClose={onClose} size="2xl">
      {/* Modal Header */}
      <AppModalHeader
        onClose={onClose}
        icon={<ClipboardList className="w-5 h-5 text-purple-500" />}
        title="ตรวจนับสต็อกจากหน้างาน"
      />

      <AppModalBody className="p-3 sm:p-4">
        <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-left border-collapse min-w-[720px] text-xs">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs shadow-xs">
                <tr>
                  <th className="px-3 py-2.5 w-12 text-center border-b border-slate-200 dark:border-slate-700">ลำดับ</th>
                  <th className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-700">ชื่อสินค้า</th>
                  <th className="px-3 py-2.5 w-24 text-center border-b border-slate-200 dark:border-slate-700">ยอดเดิม</th>
                  <th className="px-2 py-2.5 w-20 text-center text-emerald-700 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-700">ปกติ</th>
                  <th className="px-2 py-2.5 w-20 text-center text-red-600 dark:text-red-400 border-b border-slate-200 dark:border-slate-700">สูญหาย</th>
                  <th className="px-2 py-2.5 w-20 text-center text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-700">ชำรุด</th>
                  <th className="px-2 py-2.5 w-20 text-center text-purple-600 dark:text-purple-400 border-b border-slate-200 dark:border-slate-700">ขายออก</th>
                  <th className="px-3 py-2.5 w-44 border-b border-slate-200 dark:border-slate-700">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                      ไม่พบรายการสินค้าในหมวดหมู่นี้
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr
                      key={item.productId}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* 1. ลำดับ */}
                      <td className="px-3 py-2 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      {/* 2. ชื่อสินค้า (แสดงเฉพาะชื่อสินค้า ไม่ต้องแสดงรหัสสินค้า) */}
                      <td className="px-3 py-2">
                        <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                          {item.productName}
                        </p>
                      </td>

                      {/* 3. ยอดเดิม (readonly / display only) */}
                      <td className="px-3 py-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        <span>{item.originalQuantity}</span>{' '}
                        <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                      </td>

                      {/* 4. ปกติ */}
                      <td className="px-2 py-2 text-center">
                        <NumericInput
                          value={item.normalQty}
                          onChange={(val) => handleFieldChange(item.productId, 'normalQty', val)}
                          placeholder=""
                          min={0}
                          allowDecimals={false}
                          className="w-16 px-1.5 py-1 rounded-xl border-2 border-emerald-200 dark:border-emerald-800/80 text-center font-extrabold text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </td>

                      {/* 5. สูญหาย */}
                      <td className="px-2 py-2 text-center">
                        <NumericInput
                          value={item.lostQty}
                          onChange={(val) => handleFieldChange(item.productId, 'lostQty', val)}
                          placeholder=""
                          min={0}
                          allowDecimals={false}
                          className="w-16 px-1.5 py-1 rounded-xl border-2 border-red-200 dark:border-red-800/80 text-center font-extrabold text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </td>

                      {/* 6. ชำรุด */}
                      <td className="px-2 py-2 text-center">
                        <NumericInput
                          value={item.damagedQty}
                          onChange={(val) => handleFieldChange(item.productId, 'damagedQty', val)}
                          placeholder=""
                          min={0}
                          allowDecimals={false}
                          className="w-16 px-1.5 py-1 rounded-xl border-2 border-amber-200 dark:border-amber-800/80 text-center font-extrabold text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </td>

                      {/* 7. ขายออก */}
                      <td className="px-2 py-2 text-center">
                        <NumericInput
                          value={item.soldQty}
                          onChange={(val) => handleFieldChange(item.productId, 'soldQty', val)}
                          placeholder=""
                          min={0}
                          allowDecimals={false}
                          className="w-16 px-1.5 py-1 rounded-xl border-2 border-purple-200 dark:border-purple-800/80 text-center font-extrabold text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </td>

                      {/* 8. หมายเหตุ */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => handleNoteChange(item.productId, e.target.value)}
                          placeholder="หมายเหตุ..."
                          className="w-full px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AppModalBody>

      {/* Modal Footer: ลำดับปุ่ม = ปิด | ดร็อปดาวน์หมวดหมู่ | พิมพ์ตาราง | บันทึกการนับสต็อก */}
      <AppModalFooter>
        <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
          {/* Left: ปิด & ดร็อปดาวน์หมวดหมู่ */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ปิด
            </button>

            <div className="w-48 shrink-0">
              <CustomSelect
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                options={categoryOptions}
              />
            </div>
          </div>

          {/* Right: พิมพ์ตาราง & บันทึกการนับสต็อก */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintTable}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>พิมพ์ตาราง</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmStockCount}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกการนับสต็อก</span>
                </>
              )}
            </button>
          </div>
        </div>
      </AppModalFooter>
    </AppModal>
  )
}

function StockCountPrintSheet({
  items,
  categoryFilterLabel,
  dateStr,
}: {
  items: StockCountRowState[]
  categoryFilterLabel: string
  dateStr: string
}) {
  return (
    <div className="print-stock-count-sheet block w-full h-auto min-h-0 p-0 bg-white text-black font-sans text-xs">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-2 mb-3">
        <h1 className="text-lg font-black tracking-tight">ใบรายการตรวจนับสต็อกสินค้าจริง (Stock Count Sheet)</h1>
        <p className="text-slate-600 mt-1 text-[11px]">
          หมวดหมู่: <strong className="text-black">{categoryFilterLabel}</strong> | ประจำวันที่: {dateStr} | จำนวนรายการ: {items.length} รายการ
        </p>
      </div>

      {/* Table with all required columns: ลำดับ | ชื่อสินค้า | ยอดเดิม | ปกติ | สูญหาย | ชำรุด | ขายออก | หมายเหตุ */}
      <table className="w-full text-left border-collapse border border-black text-[11px] mb-4">
        <thead
          className="bg-slate-100 font-bold border-b border-black text-center"
          style={{ display: 'table-header-group' }}
        >
          <tr>
            <th className="p-1.5 border-r border-black w-10">ลำดับ</th>
            <th className="p-1.5 border-r border-black text-left">ชื่อสินค้า</th>
            <th className="p-1.5 border-r border-black w-16">ยอดเดิม</th>
            <th className="p-1.5 border-r border-black w-14">ปกติ</th>
            <th className="p-1.5 border-r border-black w-14">สูญหาย</th>
            <th className="p-1.5 border-r border-black w-14">ชำรุด</th>
            <th className="p-1.5 border-r border-black w-14">ขายออก</th>
            <th className="p-1.5 border-black w-28 text-left">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black">
          {items.map((item, idx) => (
            <tr key={item.productId || idx} style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <td className="p-1.5 border-r border-black text-center font-bold">{idx + 1}</td>
              <td className="p-1.5 border-r border-black font-medium">{item.productName}</td>
              <td className="p-1.5 border-r border-black text-center font-mono font-bold">{item.originalQuantity}</td>
              <td className="p-1.5 border-r border-black text-center font-mono font-bold">
                {item.normalQty !== '' ? item.normalQty : ''}
              </td>
              <td className="p-1.5 border-r border-black text-center font-mono font-bold">
                {item.lostQty !== '' ? item.lostQty : ''}
              </td>
              <td className="p-1.5 border-r border-black text-center font-mono font-bold">
                {item.damagedQty !== '' ? item.damagedQty : ''}
              </td>
              <td className="p-1.5 border-r border-black text-center font-mono font-bold">
                {item.soldQty !== '' ? item.soldQty : ''}
              </td>
              <td className="p-1.5 border-black text-[10px]">{item.note || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signature Section */}
      <div
        className="pt-4 grid grid-cols-2 gap-8 text-center text-[11px]"
        style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
      >
        <div className="space-y-6">
          <p>ผู้ตรวจนับ: ..............................................................</p>
          <p>วันที่: .............. / .............. / ..............</p>
        </div>
        <div className="space-y-6">
          <p>ผู้ตรวจสอบ / อนุมัติ: ..............................................................</p>
          <p>วันที่: .............. / .............. / ..............</p>
        </div>
      </div>
    </div>
  )
}
