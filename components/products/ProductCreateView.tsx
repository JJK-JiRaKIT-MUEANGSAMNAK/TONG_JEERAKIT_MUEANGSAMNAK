'use client'

import React, { useState } from 'react'
import { Plus, X, ArrowRight } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'
import { CustomDatePicker } from '@/components/common/CustomDatePicker'
import { NumericInput } from '@/components/common/NumericInput'
import { ProductCategoryRule, CalculationType, CALCULATION_OPTIONS } from '@/lib/category-rules-storage'
import { ProductRowItem } from '@/components/products/NewProductModal'
import { Unit } from '@/lib/unit-storage'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'

interface ProductCreateViewProps {
  rows: ProductRowItem[]
  setRows: React.Dispatch<React.SetStateAction<ProductRowItem[]>>
  isAccessory: boolean
  setIsAccessory: (val: boolean) => void
  categoryRules: ProductCategoryRule[]
  units?: Unit[]
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onClearDraft: () => void
  onNavigateToSettings?: () => void
  onQuickAddCategory?: (name: string, calcType: CalculationType, unitId: string) => string
}

export function ProductCreateView({
  rows,
  setRows,
  isAccessory,
  setIsAccessory,
  categoryRules,
  units = [],
  isSubmitting,
  onSubmit,
  onClearDraft,
  onNavigateToSettings,
  onQuickAddCategory,
}: ProductCreateViewProps) {
  // Quick Add Category Modal State
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)
  const [targetRowIdForQuickAdd, setTargetRowIdForQuickAdd] = useState<string | null>(null)
  const [quickCatName, setQuickCatName] = useState('')
  const [quickCalcType, setQuickCalcType] = useState<CalculationType>('PER_ROUND')
  const [quickUnitId, setQuickUnitId] = useState('')

  const handleOpenQuickAdd = (rowId?: string) => {
    setTargetRowIdForQuickAdd(rowId || null)
    setQuickCatName('')
    setQuickCalcType('PER_ROUND')
    setQuickUnitId(units[0]?.id || '')
    setShowQuickAddModal(true)
  }

  const handleSaveQuickCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = quickCatName.trim()
    if (!trimmed) return

    if (onQuickAddCategory) {
      const newId = onQuickAddCategory(trimmed, quickCalcType, quickUnitId)
      if (targetRowIdForQuickAdd) {
        handleUpdateRow(targetRowIdForQuickAdd, 'categoryId', newId)
      }
    }
    setShowQuickAddModal(false)
  }
  const handleAddRow = () => {
    const defaultCatId = categoryRules[0]?.id || 'rule-cat-1'
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: '',
        categoryId: defaultCatId,
        rentPrice: null,
        salePrice: null,
        quantityAdded: 0,
        addedDate: new Date(),
      },
    ])
  }

  const handleRemoveRow = (id: string) => {
    const defaultCatId = categoryRules[0]?.id || 'rule-cat-1'
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id)
      return filtered.length > 0
        ? filtered
        : [
            {
              id: `row-${Date.now()}`,
              name: '',
              categoryId: defaultCatId,
              rentPrice: null,
              salePrice: null,
              quantityAdded: 0,
              addedDate: new Date(),
            },
          ]
    })
  }

  const handleUpdateRow = (id: string, field: keyof ProductRowItem, value: any) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <form onSubmit={onSubmit} className="flex flex-col h-full min-h-0">
        {/* Table Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
          <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-x-auto shadow-xs">
            <table className="w-full min-w-[760px] text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs shadow-xs">
                <tr>
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-8">
                    ลำดับ
                  </th>
                  <th className="px-2 py-2 text-left border-b border-slate-200 dark:border-slate-700">
                    ชื่อสินค้า
                  </th>
                  <th className="px-1.5 py-2 text-left border-b border-slate-200 dark:border-slate-700 w-36">
                    <div className="flex items-center justify-between gap-1">
                      <span>หมวดหมู่</span>
                      <button
                        type="button"
                        onClick={() => handleOpenQuickAdd()}
                        title="เพิ่มหมวดหมู่ใหม่"
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold flex items-center gap-0.5 cursor-pointer bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-1.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>เพิ่ม</span>
                      </button>
                    </div>
                  </th>
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-20 whitespace-nowrap text-blue-600 dark:text-blue-400">
                    ราคาเช่า
                  </th>
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-20 whitespace-nowrap text-violet-600 dark:text-violet-400">
                    ราคาขาย
                  </th>
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-16 whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                    จำนวนที่เพิ่ม
                  </th>
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-26 whitespace-nowrap">
                    วันที่เพิ่ม
                  </th>
                  <th className="px-1 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-8">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                {rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* ลำดับ */}
                    <td className="px-1.5 py-1.5 text-center align-middle font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    {/* ชื่อสินค้า */}
                    <td className="px-2 py-1.5 align-middle">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => handleUpdateRow(row.id, 'name', e.target.value)}
                        placeholder="ระบุชื่อหรือขนาดสินค้า..."
                        className="w-full px-2 py-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>

                    {/* หมวดหมู่ */}
                    <td className="px-1.5 py-1.5 align-middle">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 min-w-0">
                          <CustomSelect
                            value={row.categoryId}
                            onChange={(val) => handleUpdateRow(row.id, 'categoryId', String(val))}
                            options={
                              categoryRules.length > 0
                                ? categoryRules.map((cr) => ({
                                    value: cr.id,
                                    label: cr.name,
                                  }))
                                : [{ value: '', label: 'ยังไม่มีรายการ' }]
                            }
                            placeholder={categoryRules.length > 0 ? '-- เลือกหมวดหมู่ --' : 'ยังไม่มีรายการ'}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenQuickAdd(row.id)}
                          title="เพิ่มหมวดหมู่ใหม่ (แบบร่างไม่หาย)"
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-500 hover:text-emerald-600 shrink-0 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* ราคาเช่า */}
                    <td className="px-1 py-1.5 text-center align-middle whitespace-nowrap">
                      <NumericInput
                        value={row.rentPrice ?? ''}
                        placeholder="ไม่ระบุ"
                        onChange={(val) => handleUpdateRow(row.id, 'rentPrice', val === '' ? null : val)}
                        min={0}
                        allowDecimals={true}
                        className="w-full px-1.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* ราคาขาย */}
                    <td className="px-1 py-1.5 text-center align-middle whitespace-nowrap">
                      <NumericInput
                        value={row.salePrice ?? ''}
                        placeholder="ไม่ระบุ"
                        onChange={(val) => handleUpdateRow(row.id, 'salePrice', val === '' ? null : val)}
                        min={0}
                        allowDecimals={true}
                        className="w-full px-1.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-violet-600 dark:text-violet-400 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </td>

                    {/* จำนวนที่เพิ่ม */}
                    <td className="px-1 py-1.5 text-center align-middle whitespace-nowrap">
                      <NumericInput
                        value={row.quantityAdded || ''}
                        placeholder="0"
                        onChange={(val) => handleUpdateRow(row.id, 'quantityAdded', val === '' ? 0 : Number(val))}
                        min={0}
                        allowDecimals={false}
                        className="w-full px-1.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </td>

                    {/* วันที่เพิ่ม */}
                    <td className="px-1 py-1.5 text-center align-middle">
                      <CustomDatePicker
                        value={row.addedDate}
                        onChange={(val) => handleUpdateRow(row.id, 'addedDate', val)}
                      />
                    </td>

                    {/* จัดการ */}
                    <td className="px-1 py-1.5 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors mx-auto flex items-center justify-center cursor-pointer"
                        title="ลบแถว"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Area */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* ซ้าย: checkbox "เป็นอุปกรณ์เสริม" + ปุ่ม "เพิ่มแถวสินค้า" */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAccessory}
                onChange={(e) => setIsAccessory(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <span>เป็นอุปกรณ์เสริม</span>
            </label>

            <button
              type="button"
              onClick={handleAddRow}
              className="px-2.5 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มแถวสินค้า</span>
            </button>
          </div>

          {/* ขวา: [ล้างแบบร่าง] [บันทึกข้อมูลสินค้า] */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearDraft}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ล้างแบบร่าง
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสินค้า'}
            </button>
          </div>
        </div>
      </form>

      {/* Quick Add Category Modal */}
      <AppModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        size="md"
      >
        <AppModalHeader
          title="เพิ่มหมวดหมู่สินค้าใหม่"
          onClose={() => setShowQuickAddModal(false)}
        />
        <form onSubmit={handleSaveQuickCategory}>
          <AppModalBody className="space-y-3.5 p-4 sm:p-5 text-xs">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              หมวดหมู่ที่เพิ่มจะถูกบันทึกและเลือกใช้ได้ทันที ข้อมูลแบบร่างจะไม่สูญหาย
            </p>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                ชื่อหมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={quickCatName}
                onChange={(e) => setQuickCatName(e.target.value)}
                placeholder="ระบุชื่อหมวดหมู่สินค้า..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                รูปแบบการคิดเงิน
              </label>
              <CustomSelect
                value={quickCalcType}
                onChange={(val) => setQuickCalcType(val as CalculationType)}
                options={CALCULATION_OPTIONS.map((opt) => ({
                  value: opt.type,
                  label: opt.label,
                }))}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                หน่วยนับ
              </label>
              <CustomSelect
                value={quickUnitId || units[0]?.id || ''}
                onChange={(val) => setQuickUnitId(String(val))}
                options={
                  units.filter((u) => u.isActive).length > 0
                    ? units
                        .filter((u) => u.isActive)
                        .map((u) => ({
                          value: u.id,
                          label: u.name,
                        }))
                    : [{ value: '', label: 'ยังไม่มีรายการ' }]
                }
                placeholder={units.length > 0 ? '-- เลือกหน่วยนับ --' : 'ยังไม่มีรายการ'}
              />
            </div>

            {onNavigateToSettings && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickAddModal(false)
                    onNavigateToSettings()
                  }}
                  className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>หรือไปจัดการหมวดหมู่และหน่วยนับในแท็บตั้งค่าเสริม</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </AppModalBody>
          <AppModalFooter className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-850 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowQuickAddModal(false)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!quickCatName.trim()}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>บันทึกและเลือกใช้ทันที</span>
            </button>
          </AppModalFooter>
        </form>
      </AppModal>
    </div>
  )
}
