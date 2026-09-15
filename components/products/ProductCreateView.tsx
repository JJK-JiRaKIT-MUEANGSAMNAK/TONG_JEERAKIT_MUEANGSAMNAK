'use client'

import React, { useState, useMemo } from 'react'
import { Plus, X, ArrowRight, Tag, Scale } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'
import { CustomDatePicker } from '@/components/common/CustomDatePicker'
import { NumericInput } from '@/components/common/NumericInput'
import {
  ProductCategoryItem,
  CategoryCompositeRule,
  ProductCategoryRule,
  CalculationType,
  CALCULATION_OPTIONS,
  loadCompositeRules,
} from '@/lib/category-rules-storage'
import { Unit } from '@/lib/unit-storage'
import { ActionButton } from '@/components/common/ActionButton'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { ProductCreateDraftRow, createInitialDraftRows } from '@/lib/product-draft-types'
export type { ProductCreateDraftRow }
export { createInitialDraftRows }

interface ProductCreateViewProps {
  rows: ProductCreateDraftRow[]
  setRows: React.Dispatch<React.SetStateAction<ProductCreateDraftRow[]>>
  categories?: ProductCategoryItem[]
  compositeRules?: CategoryCompositeRule[]
  categoryRules?: ProductCategoryRule[]
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
  categories: propCategories,
  compositeRules: propCompositeRules,
  categoryRules = [],
  units = [],
  isSubmitting,
  onSubmit,
  onClearDraft,
  onNavigateToSettings,
  onQuickAddCategory,
  onQuickAddUnit,
}: ProductCreateViewProps) {
  // Normalize Categories
  const categoriesList: ProductCategoryItem[] = useMemo(() => {
    if (propCategories && propCategories.length > 0) return propCategories
    if (categoryRules && categoryRules.length > 0) {
      return categoryRules.map((cr) => ({ id: cr.id, name: cr.name }))
    }
    return []
  }, [propCategories, categoryRules])

  // Normalize Composite Rules
  const compositeRulesList: CategoryCompositeRule[] = useMemo(() => {
    if (propCompositeRules) return propCompositeRules
    return loadCompositeRules()
  }, [propCompositeRules])

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
        handleCategoryChange(targetRowIdForCategory, newId)
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
        handleUpdateRow(targetRowIdForUnit, 'unitId', newUnitId)
        handleUpdateRow(targetRowIdForUnit, 'accessoryUnitId', newUnitId)
      }
    }
    setShowQuickAddUnitModal(false)
  }

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: '',
        categoryId: '',
        calculationType: '',
        unitId: '',
        price: null,
        costPrice: null,
        damageFee: null,
        lossFee: null,
        quantityAdded: 0,
        minimumStock: null,
        addedDate: new Date(),
        isAccessory: false,
        accessoryUnitId: '',
      },
    ])
  }

  const handleRemoveRow = (id: string) => {
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id)
      return filtered.length > 0
        ? filtered
        : [
            {
              id: `row-${Date.now()}`,
              name: '',
              categoryId: '',
              calculationType: '',
              unitId: '',
              price: null,
              costPrice: null,
              damageFee: null,
              lossFee: null,
              quantityAdded: 0,
              minimumStock: null,
              addedDate: new Date(),
              isAccessory: false,
              accessoryUnitId: '',
            },
          ]
    })
  }

  const handleUpdateRow = (id: string, field: keyof ProductCreateDraftRow, value: any) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  // When category changes: lookup composite rules by categoryId
  const handleCategoryChange = (rowId: string, categoryId: string) => {
    const matchedRule = compositeRulesList.find((r) => r.categoryId === categoryId)

    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r

        if (matchedRule) {
          const calcType = matchedRule.calculationType
          const unitId = matchedRule.unitId || ''
          const isNoCharge = calcType === 'NO_CHARGE'
          const price = isNoCharge ? 0 : r.price

          return {
            ...r,
            categoryId,
            calculationType: calcType,
            unitId,
            accessoryUnitId: unitId,
            price,
          }
        } else {
          // ถ้าไม่มีข้อมูลประกอบของหมวดนั้น: ห้ามเดา/fallback ค่าอื่น ให้ผู้ใช้เลือกเอง
          return {
            ...r,
            categoryId,
            calculationType: '',
            unitId: '',
            accessoryUnitId: '',
          }
        }
      })
    )
  }

  const handleCalculationTypeChange = (rowId: string, calcType: CalculationType | '') => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r
        const isNoCharge = calcType === 'NO_CHARGE'
        return {
          ...r,
          calculationType: calcType,
          price: isNoCharge ? 0 : r.price,
        }
      })
    )
  }

  const handleUnitChange = (rowId: string, unitId: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r
        return {
          ...r,
          unitId,
          accessoryUnitId: unitId,
        }
      })
    )
  }

  const activeUnits = units.filter((u) => u.isActive)

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <form onSubmit={onSubmit} className="flex flex-col h-full min-h-0">
        {/* Item Rows Area: 2-line row layout per item, fits without horizontal scroll */}
        <div className="flex-1 min-h-0 w-full overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
          {rows.map((row, idx) => {
            const isNoCharge = row.calculationType === 'NO_CHARGE'

            return (
              <div
                key={row.id}
                className="p-2 sm:p-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors flex flex-col gap-1.5"
              >
                {/* Line 1: ลำดับ, ชื่อสินค้า, หมวดหมู่, วิธีคิดเงิน, หน่วยนับ, ลบ */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                  {/* ลำดับ */}
                  <div
                    className="w-8 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs shrink-0 select-none"
                    title="ลำดับ"
                  >
                    {idx + 1}
                  </div>

                  {/* ชื่อสินค้า */}
                  <div className="flex-1 min-w-[180px]">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => handleUpdateRow(row.id, 'name', e.target.value)}
                      placeholder="ระบุชื่อหรือขนาดสินค้า... (เช่น แบบคาน 000x000x000)"
                      className="w-full h-7 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                      title="ชื่อสินค้า"
                    />
                  </div>

                  {/* หมวดหมู่ */}
                  <div className="w-[140px] shrink-0" title="หมวดหมู่">
                    <CustomSelect
                      value={row.categoryId}
                      onChange={(val) => handleCategoryChange(row.id, String(val))}
                      className="w-full"
                      buttonClassName="w-full h-7 px-2 py-0 rounded-lg text-xs font-bold justify-between"
                      options={
                        categoriesList.length > 0
                          ? categoriesList.map((c) => ({
                              value: c.id,
                              label: c.name,
                            }))
                          : [{ value: '', label: 'ยังไม่มีรายการ' }]
                      }
                      placeholder="-- หมวดหมู่ --"
                    />
                  </div>

                  {/* วิธีคิดเงิน */}
                  <div className="w-[120px] shrink-0" title="วิธีคิดเงิน">
                    <CustomSelect
                      value={row.calculationType || ''}
                      onChange={(val) => handleCalculationTypeChange(row.id, val as CalculationType)}
                      className="w-full"
                      buttonClassName="w-full h-7 px-2 py-0 rounded-lg text-xs font-bold justify-between"
                      options={CALCULATION_OPTIONS.map((opt) => ({
                        value: opt.type,
                        label: opt.label,
                      }))}
                      placeholder="-- วิธีคิดเงิน --"
                    />
                  </div>

                  {/* หน่วยนับ */}
                  <div className="w-[100px] shrink-0" title="หน่วย">
                    <CustomSelect
                      value={row.unitId || ''}
                      onChange={(val) => handleUnitChange(row.id, String(val))}
                      className="w-full min-w-0"
                      buttonClassName="w-full h-7 px-1.5 py-0 rounded-lg text-xs font-bold text-center justify-between"
                      options={
                        activeUnits.length > 0
                          ? activeUnits.map((u) => ({
                              value: u.id,
                              label: u.name,
                            }))
                          : [{ value: '', label: '-' }]
                      }
                      placeholder="-- หน่วย --"
                      emptyText="ไม่มีรายการ"
                    />
                  </div>

                  {/* จัดการ (ลบแถว) */}
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    title="จัดการ: ลบแถว"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Line 2: ราคา, ต้นทุน, ค่าชำรุด, ค่าสูญหาย, จำนวนเพิ่ม, วันที่ทำรายการ */}
                <div className="flex items-center gap-1.5 sm:gap-2 pl-0 sm:pl-[38px] flex-wrap sm:flex-nowrap">
                  {/* ราคา: NO_CHARGE ซ่อนช่องราคา และ price = 0 */}
                  {isNoCharge ? (
                    <div
                      className="flex items-center justify-center rounded-lg border border-dashed border-amber-300 dark:border-amber-700/80 bg-amber-50/60 dark:bg-amber-950/40 h-7 w-[105px] shrink-0 text-amber-700 dark:text-amber-300 text-[11px] font-bold select-none"
                      title="ไม่คิดเงิน (ราคา = 0)"
                    >
                      <span>ไม่คิดเงิน</span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 h-7 w-[105px] shrink-0 focus-within:ring-1 focus-within:ring-blue-500"
                      title="ราคา"
                    >
                      <span className="px-1.5 h-full flex items-center bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-[11px] border-r border-slate-200 dark:border-slate-700 shrink-0 select-none">
                        ราคา
                      </span>
                      <NumericInput
                        value={row.price ?? ''}
                        placeholder="0"
                        onChange={(val) => handleUpdateRow(row.id, 'price', val === '' ? null : val)}
                        min={0}
                        allowDecimals={true}
                        className="w-full h-full text-center font-bold text-xs text-blue-600 dark:text-blue-400 focus:outline-none bg-transparent"
                      />
                    </div>
                  )}

                  {/* ต้นทุน */}
                  <div
                    className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 h-7 w-[105px] shrink-0 focus-within:ring-1 focus-within:ring-slate-400"
                    title="ต้นทุน"
                  >
                    <span className="px-1.5 h-full flex items-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px] border-r border-slate-200 dark:border-slate-700 shrink-0 select-none">
                      ต้นทุน
                    </span>
                    <NumericInput
                      value={row.costPrice ?? ''}
                      placeholder="0"
                      onChange={(val) => handleUpdateRow(row.id, 'costPrice', val === '' ? null : val)}
                      min={0}
                      allowDecimals={true}
                      className="w-full h-full text-center font-bold text-xs text-slate-700 dark:text-slate-300 focus:outline-none bg-transparent"
                    />
                  </div>

                  {/* ค่าชำรุด */}
                  <div
                    className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 h-7 w-[105px] shrink-0 focus-within:ring-1 focus-within:ring-amber-500"
                    title="ค่าชำรุด"
                  >
                    <span className="px-1.5 h-full flex items-center bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold text-[11px] border-r border-slate-200 dark:border-slate-700 shrink-0 select-none">
                      ชำรุด
                    </span>
                    <NumericInput
                      value={row.damageFee ?? ''}
                      placeholder="0"
                      onChange={(val) => handleUpdateRow(row.id, 'damageFee', val === '' ? null : val)}
                      min={0}
                      allowDecimals={true}
                      className="w-full h-full text-center font-bold text-xs text-amber-600 dark:text-amber-400 focus:outline-none bg-transparent"
                    />
                  </div>

                  {/* ค่าสูญหาย */}
                  <div
                    className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 h-7 w-[105px] shrink-0 focus-within:ring-1 focus-within:ring-red-500"
                    title="ค่าสูญหาย"
                  >
                    <span className="px-1.5 h-full flex items-center bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold text-[11px] border-r border-slate-200 dark:border-slate-700 shrink-0 select-none">
                      สูญหาย
                    </span>
                    <NumericInput
                      value={row.lossFee ?? ''}
                      placeholder="0"
                      onChange={(val) => handleUpdateRow(row.id, 'lossFee', val === '' ? null : val)}
                      min={0}
                      allowDecimals={true}
                      className="w-full h-full text-center font-bold text-xs text-red-600 dark:text-red-400 focus:outline-none bg-transparent"
                    />
                  </div>

                  {/* จำนวนเพิ่ม */}
                  <div
                    className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 h-7 w-[100px] shrink-0 focus-within:ring-1 focus-within:ring-emerald-500"
                    title="จำนวนเพิ่ม"
                  >
                    <span className="px-1.5 h-full flex items-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border-r border-slate-200 dark:border-slate-700 shrink-0 select-none">
                      เพิ่ม
                    </span>
                    <NumericInput
                      value={row.quantityAdded ? row.quantityAdded : ''}
                      placeholder="0"
                      onChange={(val) =>
                        handleUpdateRow(row.id, 'quantityAdded', val === '' ? 0 : Number(val))
                      }
                      min={0}
                      allowDecimals={false}
                      className="w-full h-full text-center font-bold text-xs text-emerald-600 dark:text-emerald-400 focus:outline-none bg-transparent"
                    />
                  </div>

                  {/* วันที่ทำรายการ */}
                  <div className="w-[140px] shrink-0" title="วันที่ทำรายการ">
                    <CustomDatePicker
                      value={row.addedDate}
                      onChange={(val) => handleUpdateRow(row.id, 'addedDate', val)}
                      showClear={false}
                      className="w-full text-xs"
                      buttonClassName="w-full h-7 px-2 py-0 rounded-lg text-[11px] font-mono justify-between"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Area */}
        <div className="shrink-0 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* ซ้าย: ปุ่ม "เพิ่มแถวสินค้า" และสรุปแถว */}
          <div className="flex items-center gap-3">
            <ActionButton
              type="button"
              onClick={handleAddRow}
              variant="dashed"
              icon={<Plus />}
            >
              เพิ่มแถวสินค้า
            </ActionButton>
            <span className="text-[11px] text-slate-400 font-medium">
              ทั้งหมด {rows.length} แถว (แถวที่ไม่มีชื่อสินค้าจะไม่ถูกบันทึก)
            </span>
          </div>

          {/* ขวา: [ล้างแบบร่าง] [บันทึกข้อมูลสินค้า] */}
          <div className="flex items-center gap-2">
            <ActionButton
              type="button"
              onClick={onClearDraft}
              disabled={isSubmitting}
              variant="outline"
            >
              ล้างแบบร่าง
            </ActionButton>
            <ActionButton
              type="submit"
              disabled={isSubmitting}
              variant="primary"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสินค้า'}
            </ActionButton>
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
                วิธีคิดเงิน
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
            <ActionButton
              type="button"
              onClick={() => setShowQuickAddCategoryModal(false)}
              variant="outline"
            >
              ยกเลิก
            </ActionButton>
            <ActionButton
              type="submit"
              disabled={!quickCatName.trim()}
              variant="primary"
              icon={<Plus />}
            >
              บันทึกและเลือกใช้ทันที
            </ActionButton>
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
              หน่วยนับที่เพิ่มจะสามารถเลือกใช้ได้ทันที
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
            <ActionButton
              type="button"
              onClick={() => setShowQuickAddUnitModal(false)}
              variant="outline"
            >
              ยกเลิก
            </ActionButton>
            <ActionButton
              type="submit"
              disabled={!quickUnitName.trim()}
              variant="primary"
              icon={<Plus />}
            >
              บันทึกและเลือกใช้ทันที
            </ActionButton>
          </AppModalFooter>
        </form>
      </AppModal>
    </div>
  )
}
