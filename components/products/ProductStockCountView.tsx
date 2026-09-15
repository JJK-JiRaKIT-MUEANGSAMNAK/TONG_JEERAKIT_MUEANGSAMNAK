'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  ClipboardList,
  CheckCircle2,
  Printer,
  Search,
  RotateCcw,
  Package,
} from 'lucide-react'
import { NumericInput } from '@/components/common/NumericInput'
import { CustomSelect } from '@/components/common/CustomSelect'
import { Product } from '@/lib/types/rental-pos'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/lib/contexts/AuthContext'
import { applyStockCountAdjustment, loadProducts } from '@/lib/product-storage'

export interface StockCountRowState {
  productId: string
  productCode: string
  productName: string
  category: string
  unit: string
  originalQuantity: number
  originalAvailableQuantity: number
  normalQty: number | ''
  lostQty: number | ''
  damagedQty: number | ''
  soldQty: number | ''
  note: string
}

interface ProductStockCountViewProps {
  products: Product[]
  onSuccess?: (updatedProducts: Product[]) => void
  onNavigateToList?: () => void
}

export function ProductStockCountView({
  products,
  onSuccess,
  onNavigateToList,
}: ProductStockCountViewProps) {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [countItems, setCountItems] = useState<StockCountRowState[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize count items whenever products change
  useEffect(() => {
    if (!products.length) {
      setCountItems([])
      return
    }

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
  }, [products])

  // Category filter options
  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category || 'ทั่วไป').filter(Boolean)))
    return [
      { value: 'ALL', label: 'หมวดหมู่: ทั้งหมด' },
      ...cats.map((c) => ({ value: c, label: c })),
    ]
  }, [products])

  // Filtered rows by category and search term
  const filteredItems = useMemo(() => {
    return countItems.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory
      const matchSearch =
        searchTerm.trim() === '' ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        item.productCode.toLowerCase().includes(searchTerm.toLowerCase().trim())
      return matchCat && matchSearch
    })
  }, [countItems, selectedCategory, searchTerm])

  // Count modified items
  const modifiedItems = useMemo(() => {
    return countItems.filter(
      (i) => i.normalQty !== '' || i.damagedQty !== '' || i.lostQty !== '' || i.soldQty !== ''
    )
  }, [countItems])

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

  // Clear all entered counts
  const handleClearAll = () => {
    setCountItems((prev) =>
      prev.map((item) => ({
        ...item,
        normalQty: '',
        lostQty: '',
        damagedQty: '',
        soldQty: '',
        note: '',
      }))
    )
    showToast('ล้างข้อมูลแล้ว', 'ล้างค่าที่กรอกในตารางตรวจนับทั้งหมดเรียบร้อย', 'INFO')
  }

  // Print Stock Count Table via browser print
  const handlePrintTable = () => {
    window.print()
  }

  // Confirm Stock Count
  const handleConfirmStockCount = async () => {
    setIsSubmitting(true)
    try {
      const actor = {
        userId: user?.userId || 'system',
        displayName: user?.displayName || 'ระบบ',
      }

      if (modifiedItems.length === 0) {
        showToast('ไม่มีรายการแก้ไข', 'กรุณากรอกผลการตรวจนับอย่างน้อย 1 รายการก่อนบันทึก', 'INFO')
        return
      }

      let updatedList = loadProducts()
      for (const item of modifiedItems) {
        updatedList = applyStockCountAdjustment(
          item.productId,
          {
            normalQty: item.normalQty === '' ? undefined : Number(item.normalQty),
            damagedQty: item.damagedQty === '' ? undefined : Number(item.damagedQty),
            lostQty: item.lostQty === '' ? undefined : Number(item.lostQty),
            soldQty: item.soldQty === '' ? undefined : Number(item.soldQty),
          },
          item.note || 'ตรวจนับสต็อกจากหน้างาน',
          actor
        )
      }

      if (onSuccess) {
        onSuccess(updatedList)
      }

      showToast(
        'ตรวจนับสต็อกสำเร็จ',
        `บันทึกผลตรวจนับ ${modifiedItems.length} รายการ และบันทึกประวัติ Audit แล้ว`,
        'SUCCESS'
      )
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถบันทึกผลตรวจนับได้', 'ERROR')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentDateStr = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-2.5 sm:p-3 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          {/* Search Box */}
          <div className="relative min-w-[140px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อสินค้าที่ต้องการนับ..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-40 sm:w-48 shrink-0">
            <CustomSelect
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              options={categoryOptions}
            />
          </div>
        </div>

        {/* Action Buttons: Clear, Print, Save */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {modifiedItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>ล้างค่า</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintTable}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span>พิมพ์ตารางตรวจนับ</span>
          </button>

          <button
            type="button"
            onClick={handleConfirmStockCount}
            disabled={isSubmitting || modifiedItems.length === 0}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap ${
              modifiedItems.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            {isSubmitting ? (
              <span>กำลังบันทึก...</span>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>บันทึกการนับสต็อก</span>
                {modifiedItems.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono font-black">
                    {modifiedItems.length}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Stock Count Table Card Content */}
      <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full text-left border-collapse table-fixed text-xs">
            <colgroup>
              <col className="w-9 sm:w-10" />
              <col className="w-auto" />
              <col className="w-14 sm:w-16" />
              <col className="w-14 sm:w-16" />
              <col className="w-14 sm:w-16" />
              <col className="w-14 sm:w-16" />
              <col className="w-14 sm:w-16" />
              <col className="w-24 sm:w-36" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 shadow-xs">
              <tr>
                <th className="w-9 sm:w-10 py-2.5 px-2 text-center whitespace-nowrap">ลำดับ</th>
                <th className="py-2.5 px-3 text-left whitespace-nowrap">ชื่อสินค้า</th>
                <th className="w-14 sm:w-16 py-2.5 px-1.5 text-center whitespace-nowrap">ยอดเดิม</th>
                <th className="w-14 sm:w-16 py-2.5 px-1 text-center text-emerald-600 dark:text-emerald-400 whitespace-nowrap">ปกติ</th>
                <th className="w-14 sm:w-16 py-2.5 px-1 text-center text-red-600 dark:text-red-400 whitespace-nowrap">สูญหาย</th>
                <th className="w-14 sm:w-16 py-2.5 px-1 text-center text-amber-600 dark:text-amber-400 whitespace-nowrap">ชำรุด</th>
                <th className="w-14 sm:w-16 py-2.5 px-1 text-center text-purple-600 dark:text-purple-400 whitespace-nowrap">ขายออก</th>
                <th className="w-24 sm:w-36 py-2.5 px-3 text-left whitespace-nowrap">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2 opacity-60" />
                    <p className="font-bold text-sm">ไม่พบรายการสินค้าที่ค้นหา</p>
                    <p className="text-xs text-slate-400 mt-0.5">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr
                    key={item.productId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* 1. ลำดับ */}
                    <td className="px-1 py-1.5 text-center font-bold text-slate-500 whitespace-nowrap">
                      {idx + 1}
                    </td>

                    {/* 2. ชื่อสินค้า (แสดงบรรทัดเดียว) */}
                    <td className="px-2 py-1.5 min-w-0">
                      <span
                        className="font-extrabold text-slate-900 dark:text-slate-100 text-xs truncate block whitespace-nowrap"
                        title={item.productName}
                      >
                        {item.productName}
                      </span>
                    </td>

                    {/* 3. ยอดเดิม (บรรทัดเดียว) */}
                    <td className="px-1 py-1.5 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                        {item.originalQuantity}
                      </span>{' '}
                      <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                    </td>

                    {/* 4. ปกติ */}
                    <td className="px-0.5 py-1.5 text-center">
                      <NumericInput
                        value={item.normalQty}
                        onChange={(val) => handleFieldChange(item.productId, 'normalQty', val)}
                        placeholder=""
                        min={0}
                        allowDecimals={false}
                        className="w-full max-w-[50px] mx-auto px-1 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 text-center font-extrabold text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 focus:outline-none focus:ring-1.5 focus:ring-emerald-400"
                      />
                    </td>

                    {/* 5. สูญหาย */}
                    <td className="px-0.5 py-1.5 text-center">
                      <NumericInput
                        value={item.lostQty}
                        onChange={(val) => handleFieldChange(item.productId, 'lostQty', val)}
                        placeholder=""
                        min={0}
                        allowDecimals={false}
                        className="w-full max-w-[50px] mx-auto px-1 py-1 rounded-lg border border-red-300 dark:border-red-800 text-center font-extrabold text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 focus:outline-none focus:ring-1.5 focus:ring-red-400"
                      />
                    </td>

                    {/* 6. ชำรุด */}
                    <td className="px-0.5 py-1.5 text-center">
                      <NumericInput
                        value={item.damagedQty}
                        onChange={(val) => handleFieldChange(item.productId, 'damagedQty', val)}
                        placeholder=""
                        min={0}
                        allowDecimals={false}
                        className="w-full max-w-[50px] mx-auto px-1 py-1 rounded-lg border border-amber-300 dark:border-amber-800 text-center font-extrabold text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-1.5 focus:ring-amber-400"
                      />
                    </td>

                    {/* 7. ขายออก */}
                    <td className="px-0.5 py-1.5 text-center">
                      <NumericInput
                        value={item.soldQty}
                        onChange={(val) => handleFieldChange(item.productId, 'soldQty', val)}
                        placeholder=""
                        min={0}
                        allowDecimals={false}
                        className="w-full max-w-[50px] mx-auto px-1 py-1 rounded-lg border border-purple-300 dark:border-purple-800 text-center font-extrabold text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 focus:outline-none focus:ring-1.5 focus:ring-purple-400"
                      />
                    </td>

                    {/* 8. หมายเหตุ */}
                    <td className="px-1.5 py-1.5">
                      <input
                        type="text"
                        value={item.note}
                        onChange={(e) => handleNoteChange(item.productId, e.target.value)}
                        placeholder="หมายเหตุ..."
                        className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1.5 focus:ring-purple-500"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Workspace Footer Bar */}
        <div className="shrink-0 px-3 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            แสดง {filteredItems.length} รายการ {modifiedItems.length > 0 && (
              <span className="text-purple-600 dark:text-purple-400 font-bold ml-1">
                (มีการกรอกผลตรวจนับแล้ว {modifiedItems.length} รายการ)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleConfirmStockCount}
              disabled={isSubmitting || modifiedItems.length === 0}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap ${
                modifiedItems.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>บันทึกการนับสต็อก</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Printable Stock Count Sheet for window.print() */}
      <div className="hidden print:block print-document-target">
        <StockCountPrintSheet
          items={filteredItems}
          categoryFilterLabel={
            categoryOptions.find((o) => o.value === selectedCategory)?.label || selectedCategory
          }
          dateStr={currentDateStr}
        />
      </div>
    </div>
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

      {/* Table with all required columns */}
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
