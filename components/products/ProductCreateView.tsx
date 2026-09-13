'use client'

import React, { useState } from 'react'
import { Plus, X, ArrowRight, Tag, Scale } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'
import { CustomDatePicker } from '@/components/common/CustomDatePicker'
import { NumericInput } from '@/components/common/NumericInput'
import { ProductCategoryRule, CalculationType, CALCULATION_OPTIONS } from '@/lib/category-rules-storage'
import { Unit } from '@/lib/unit-storage'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { ProductCreateDraftRow, createInitialDraftRows } from '@/lib/product-draft-types'
export type { ProductCreateDraftRow }
export { createInitialDraftRows }


interface ProductCreateViewProps {
  rows: ProductCreateDraftRow[]
  setRows: React.Dispatch<React.SetStateAction<ProductCreateDraftRow[]>>
  categoryRules: ProductCategoryRule[]
  units?: Unit[]
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onClearDraft: () => void
  onNavigateToSettings?: () => void
  onQuickAddCategory?: (name: string, calcType: CalculationType, unitId: string) => string
  onQuickAddUnit?: (name: string) => string
}

export function ProductCreateView({
  rows,
  setRows,
  categoryRules,
  units = [],
  isSubmitting,
  onSubmit,
  onClearDraft,
  onNavigateToSettings,
  onQuickAddCategory,
  onQuickAddUnit,
}: ProductCreateViewProps) {
  // Quick Add Category Modal State
  const [showQuickAddCategoryModal, setShowQuickAddCategoryModal] = useState(false)
  const [targetRowIdForCategory, setTargetRowIdForCategory] = useState<string | null>(null)
  const [quickCatName, setQuickCatName] = useState('')
  const [quickCalcType, setQuickCalcType] = useState<CalculationType>('PER_ROUND')
  const [quickCatUnitId, setQuickCatUnitId] = useState('')

  // Quick Add Unit Modal State
  const [showQuickAddUnitModal, setShowQuickAddUnitModal] = useState(false)
  const [targetRowIdForUnit, setTargetRowIdForUnit] = useState<string | null>(null)
  const [quickUnitName, setQuickUnitName] = useState('')

  const handleOpenQuickAddCategory = (rowId?: string) => {
    setTargetRowIdForCategory(rowId || null)
    setQuickCatName('')
    setQuickCalcType('PER_ROUND')
    setQuickCatUnitId(units[0]?.id || '')
    setShowQuickAddCategoryModal(true)
  }

  const handleSaveQuickCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = quickCatName.trim()
    if (!trimmed) return

    if (onQuickAddCategory) {
      const newId = onQuickAddCategory(trimmed, quickCalcType, quickCatUnitId)
      if (targetRowIdForCategory) {
        handleUpdateRow(targetRowIdForCategory, 'categoryId', newId)
      }
    }
    setShowQuickAddCategoryModal(false)
  }

  const handleOpenQuickAddUnit = (rowId?: string) => {
    setTargetRowIdForUnit(rowId || null)
    setQuickUnitName('')
    setShowQuickAddUnitModal(true)
  }

  const handleSaveQuickUnit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = quickUnitName.trim()
    if (!trimmed) return

    if (onQuickAddUnit) {
      const newUnitId = onQuickAddUnit(trimmed)
      if (targetRowIdForUnit && newUnitId) {
        handleUpdateRow(targetRowIdForUnit, 'accessoryUnitId', newUnitId)
      }
    }
    setShowQuickAddUnitModal(false)
  }

  const handleAddRow = () => {
    const defaultCatId = categoryRules[0]?.id || 'rule-cat-1'
    const defaultUnitId = units[0]?.id || ''
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: '',
        isAccessory: false,
        categoryId: defaultCatId,
        accessoryUnitId: defaultUnitId,
        price: null,
        costPrice: null,
        damageFee: null,
        lossFee: null,
        quantityAdded: 0,
        minimumStock: null,
        addedDate: new Date(),
      },
    ])
  }

  const handleRemoveRow = (id: string) => {
    const defaultCatId = categoryRules[0]?.id || 'rule-cat-1'
    const defaultUnitId = units[0]?.id || ''
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id)
      return filtered.length > 0
        ? filtered
        : [
            {
              id: `row-${Date.now()}`,
              name: '',
              isAccessory: false,
              categoryId: defaultCatId,
              accessoryUnitId: defaultUnitId,
              price: null,
              costPrice: null,
              damageFee: null,
              lossFee: null,
              quantityAdded: 0,
              minimumStock: null,
              addedDate: new Date(),
            },
          ]
    })
  }

  const handleUpdateRow = (id: string, field: keyof ProductCreateDraftRow, value: any) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const handleToggleAccessory = (id: string, checked: boolean) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        let newUnitId = r.accessoryUnitId
        if (checked && !newUnitId) {
          const matchedRule = categoryRules.find((c) => c.id === r.categoryId)
          newUnitId = matchedRule?.unitId || units[0]?.id || ''
        }
        return {
          ...r,
          isAccessory: checked,
          accessoryUnitId: newUnitId,
        }
      })
    )
  }

  const activeUnits = units.filter((u) => u.isActive)

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <form onSubmit={onSubmit} className="flex flex-col h-full min-h-0">
        {/* Table Area: Scrollable horizontally only inside this container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
          <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-x-auto shadow-xs">
            <table className="w-full min-w-[1300px] text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs shadow-xs">
                <tr>
                  {/* 1. ลำดับ */}
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-12 shrink-0">
                    ลำดับ
                  </th>

                  {/* 2. ชื่อสินค้า */}
                  <th className="px-2 py-2 text-left border-b border-slate-200 dark:border-slate-700 min-w-[190px]">
                    ชื่อสินค้า
                  </th>

                  {/* 3. อุปกรณ์เสริม */}
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-20 whitespace-nowrap text-blue-600 dark:text-blue-400">
                    อุปกรณ์เสริม
                  </th>

                  {/* 4. หมวดหมู่ */}
                  <th className="px-1.5 py-2 text-left border-b border-slate-200 dark:border-slate-700 min-w-[180px]">
                    <div className="flex items-center justify-between gap-1">
                      <span>หมวดหมู่</span>
                      <button
                        type="button"
                        onClick={() => handleOpenQuickAddCategory()}
                        title="เพิ่มหมวดหมู่ใหม่"
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold flex items-center gap-0.5 cursor-pointer bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-1.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>เพิ่ม</span>
                      </button>
                    </div>
                  </th>

                  {/* 5. หน่วยนับอุปกรณ์เสริม */}
                  <th className="px-1.5 py-2 text-left border-b border-slate-200 dark:border-slate-700 min-w-[170px]">
                    <div className="flex items-center justify-between gap-1">
                      <span>หน่วยนับอุปกรณ์เสริม</span>
                      <button
                        type="button"
                        onClick={() => handleOpenQuickAddUnit()}
                        title="เพิ่มหน่วยนับใหม่"
                        className="text-[10px] text-purple-600 dark:text-purple-400 hover:text-purple-700 font-bold flex items-center gap-0.5 cursor-pointer bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 px-1.5 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800/60 transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>เพิ่ม</span>
                      </button>
                    </div>
                  </th>

                  {/* 6. ราคา */}
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-24 whitespace-nowrap text-blue-600 dark:text-blue-400">
                    ราคา
                  </th>

                  {/* 7. ต้นทุน/หน่วย */}
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-24 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    ต้นทุน/หน่วย
                  </th>

                  {/* 8. ค่าชำรุด */}
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-24 whitespace-nowrap text-amber-600 dark:text-amber-400">
                    ค่าชำรุด
                  </th>

                  {/* 9. ค่าสูญหาย */}
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-24 whitespace-nowrap text-red-600 dark:text-red-400">
                    ค่าสูญหาย
                  </th>

                  {/* 10. จำนวนเพิ่ม */}
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-20 whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                    จำนวนเพิ่ม
                  </th>

                  {/* 11. สต็อกขั้นต่ำ */}
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-20 whitespace-nowrap text-purple-600 dark:text-purple-400">
                    สต็อกขั้นต่ำ
                  </th>

                  {/* 12. วันที่ทำรายการ */}
                  <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-28 whitespace-nowrap">
                    วันที่ทำรายการ
                  </th>

                  {/* 13. จัดการ */}
                  <th className="px-1 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-10 shrink-0">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                {rows.map((row, idx) => {
                  const matchedRule = categoryRules.find((c) => c.id === row.categoryId)
                  const calcType = matchedRule?.calculationType || 'PER_ROUND'

                  const pricePlaceholder =
                    calcType === 'SALE'
                      ? 'ราคาขาย'
                      : calcType === 'PER_DAY'
                      ? 'ราคา/วัน'
                      : 'ราคา/รอบ'

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* 1. ลำดับ */}
                      <td className="px-1.5 py-1.5 text-center align-middle font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* 2. ชื่อสินค้า */}
                      <td className="px-2 py-1.5 align-middle">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleUpdateRow(row.id, 'name', e.target.value)}
                          placeholder="ระบุชื่อหรือขนาดสินค้า..."
                          className="w-full px-2 py-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>

                      {/* 3. อุปกรณ์เสริม (Checkbox รายแถว) */}
                      <td className="px-1.5 py-1.5 text-center align-middle">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={row.isAccessory}
                            onChange={(e) => handleToggleAccessory(row.id, e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                            title="ติ๊กเพื่อกำหนดเป็นอุปกรณ์เสริมและเปิดเลือกหน่วยนับเอง"
                          />
                        </div>
                      </td>

                      {/* 4. หมวดหมู่ */}
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
                                      sublabel:
                                        cr.calculationType === 'SALE'
                                          ? 'ขาย'
                                          : cr.calculationType === 'PER_DAY'
                                          ? 'เช่า/วัน'
                                          : 'เช่า/รอบ',
                                    }))
                                  : [{ value: '', label: 'ยังไม่มีรายการ' }]
                              }
                              placeholder={categoryRules.length > 0 ? '-- เลือกหมวดหมู่ --' : 'ยังไม่มีรายการ'}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenQuickAddCategory(row.id)}
                            title="เพิ่มหมวดหมู่ใหม่"
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-500 hover:text-emerald-600 shrink-0 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* 5. หน่วยนับอุปกรณ์เสริม */}
                      <td className="px-1.5 py-1.5 align-middle">
                        {!row.isAccessory ? (
                          <div
                            className="px-2.5 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-center truncate select-none text-[11px]"
                            title={`ใช้หน่วยนับหลักตามหมวดหมู่: ${matchedRule?.unit || '-'}`}
                          >
                            <span className="font-bold">{matchedRule?.unit || '-'}</span>
                            <span className="text-[10px] text-slate-400 ml-1 font-normal">(ตามหมวด)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="flex-1 min-w-0">
                              <CustomSelect
                                value={row.accessoryUnitId || ''}
                                onChange={(val) => handleUpdateRow(row.id, 'accessoryUnitId', String(val))}
                                options={
                                  activeUnits.length > 0
                                    ? activeUnits.map((u) => ({
                                        value: u.id,
                                        label: u.name,
                                      }))
                                    : [{ value: '', label: 'ยังไม่มีรายการ' }]
                                }
                                placeholder={activeUnits.length > 0 ? '-- เลือกหน่วยนับ --' : 'ยังไม่มีรายการ'}
                                emptyText="ยังไม่มีรายการ"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenQuickAddUnit(row.id)}
                              title="เพิ่มหน่วยนับใหม่"
                              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-500 hover:text-purple-600 shrink-0 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 6. ราคา (ช่องเดียว ปรับตามรูปแบบคิดเงิน) */}
                      <td className="px-1 py-1.5 text-center align-middle whitespace-nowrap">
                        <div className="relative">
                          <NumericInput
                            value={row.price ?? ''}
                            placeholder={pricePlaceholder}
                            onChange={(val) => handleUpdateRow(row.id, 'price', val === '' ? null : val)}
                            min={0}
                            allowDecimals={true}
                            className="w-full px-1.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </td>

                      {/* 7. ต้นทุน/หน่วย */}
                      <td className="px-1 py-1.5 text-center align-middle whitespace-nowrap">
                        <NumericInput
                          value={row.costPrice ?? ''}
                          placeholder="0.00"
                          onChange={(val) => handleUpdateRow(row.id, 'costPrice', val === '' ? null : val)}
                          min={0}
                          allowDecimals={true}
                          className="w-full px-1.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                        />
                      </td>

                      {/* 8. ค่าชำรุด */}
                      <td className="px-1 py-1.5 text-center align-middle whitespace-nowrap">
                        <NumericInput
                          value={row.damageFee ?? ''}
                          placeholder="0.00"
                          onChange={(val) => handleUpdateRow(row.id, 'damageFee', val === '' ? null : val)}
                          min={0}
                          allowDecimals={true}
                          className="w-full px-1.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </td>

                      {/* 9. ค่าสูญหาย */}
                      <td className="px-1 py-1.5 text-center align-middle whitespace-nowrap">
                        <NumericInput
                          value={row.lossFee ?? ''}
                          placeholder="0.00"
                          onChange={(val) => handleUpdateRow(row.id, 'lossFee', val === '' ? null : val)}
                          min={0}
                          allowDecimals={true}
                          className="w-full px-1.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                      </td>

                      {/* 10. จำนวนเพิ่ม */}
                      <td className="px-1 py-1.5 text-center align-middle whitespace-nowrap">
                        <NumericInput
                          value={row.quantityAdded || ''}
                          placeholder="0"
                          onChange={(val) =>
                            handleUpdateRow(row.id, 'quantityAdded', val === '' ? 0 : Number(val))
                          }
                          min={0}
                          allowDecimals={false}
                          className="w-full px-1.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </td>

                      {/* 11. สต็อกขั้นต่ำ */}
                      <td className="px-1 py-1.5 text-center align-middle whitespace-nowrap">
                        <NumericInput
                          value={row.minimumStock ?? ''}
                          placeholder="3"
                          onChange={(val) => handleUpdateRow(row.id, 'minimumStock', val === '' ? null : val)}
                          min={0}
                          allowDecimals={false}
                          className="w-full px-1.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-purple-600 dark:text-purple-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </td>

                      {/* 12. วันที่ทำรายการ */}
                      <td className="px-1 py-1.5 text-center align-middle">
                        <CustomDatePicker
                          value={row.addedDate}
                          onChange={(val) => handleUpdateRow(row.id, 'addedDate', val)}
                        />
                      </td>

                      {/* 13. จัดการ */}
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Area */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* ซ้าย: ปุ่ม "เพิ่มแถวสินค้า" และสรุปแถว */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddRow}
              className="px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มแถวสินค้า</span>
            </button>
            <span className="text-[11px] text-slate-400 font-medium">
              ทั้งหมด {rows.length} แถว (แถวที่ไม่มีชื่อสินค้าจะไม่ถูกบันทึก)
            </span>
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
        isOpen={showQuickAddCategoryModal}
        onClose={() => setShowQuickAddCategoryModal(false)}
        size="md"
      >
        <AppModalHeader
          title="เพิ่มหมวดหมู่สินค้าใหม่"
          icon={<Tag className="w-4 h-4 text-emerald-600" />}
          onClose={() => setShowQuickAddCategoryModal(false)}
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
                value={quickCatUnitId || units[0]?.id || ''}
                onChange={(val) => setQuickCatUnitId(String(val))}
                options={
                  activeUnits.length > 0
                    ? activeUnits.map((u) => ({
                        value: u.id,
                        label: u.name,
                      }))
                    : [{ value: '', label: 'ยังไม่มีรายการ' }]
                }
                placeholder={activeUnits.length > 0 ? '-- เลือกหน่วยนับ --' : 'ยังไม่มีรายการ'}
                emptyText="ยังไม่มีรายการ"
              />
            </div>

            {onNavigateToSettings && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickAddCategoryModal(false)
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
              onClick={() => setShowQuickAddCategoryModal(false)}
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

      {/* Quick Add Unit Modal */}
      <AppModal
        isOpen={showQuickAddUnitModal}
        onClose={() => setShowQuickAddUnitModal(false)}
        size="sm"
      >
        <AppModalHeader
          title="เพิ่มหน่วยนับใหม่"
          icon={<Scale className="w-4 h-4 text-purple-600" />}
          onClose={() => setShowQuickAddUnitModal(false)}
        />
        <form onSubmit={handleSaveQuickUnit}>
          <AppModalBody className="space-y-3.5 p-4 sm:p-5 text-xs">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              หน่วยนับที่เพิ่มจะสามารถเลือกใช้กับอุปกรณ์เสริมในแถวนี้ได้ทันที
            </p>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                ชื่อหน่วยนับ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={quickUnitName}
                onChange={(e) => setQuickUnitName(e.target.value)}
                placeholder="เช่น ชิ้น, ตัว, แผ่น, ลัง, มัด..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {onNavigateToSettings && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickAddUnitModal(false)
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
              onClick={() => setShowQuickAddUnitModal(false)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!quickUnitName.trim()}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
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
