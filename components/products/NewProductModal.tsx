'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Settings,
  Trash2,
  Check,
  X,
  Edit2,
  CheckCircle2,
} from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'
import { CustomDatePicker } from '@/components/common/CustomDatePicker'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { NumericInput } from '@/components/common/NumericInput'
import { Product, RentalType } from '@/lib/types/rental-pos'
import {
  ProductCategoryRule,
  CalculationType,
  CALCULATION_OPTIONS,
  loadCategoryRules,
  addCategoryRule,
  updateCategoryRule,
  deleteCategoryRule,
} from '@/lib/category-rules-storage'

export interface ProductRowItem {
  id: string
  name: string
  categoryId: string
  rentPrice: number | null
  salePrice: number | null
  quantityAdded: number
  addedDate: Date | null
}

export interface NewProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (product: Product | Product[]) => void
  targetProduct?: Product | null
  initialTab?: 'EDIT_DETAILS' | 'ADJUST_STOCK'
  onShowToast?: (title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => void
}

const DEFAULT_ROW_COUNT = 10

const createEmptyRow = (defaultCatId: string, id?: string): ProductRowItem => ({
  id: id || `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  name: '',
  categoryId: defaultCatId,
  rentPrice: null,
  salePrice: null,
  quantityAdded: 0,
  addedDate: new Date(),
})

const createInitialRows = (defaultCatId: string, target?: Product | null, count: number = DEFAULT_ROW_COUNT): ProductRowItem[] => {
  const list: ProductRowItem[] = []
  if (target) {
    list.push({
      id: target.id || 'row-0',
      name: target.name || '',
      categoryId: target.categoryId || target.categoryRuleId || defaultCatId,
      rentPrice: target.rentPrice !== undefined ? target.rentPrice : (target.normalPrice || target.dailyPrice || null),
      salePrice: target.salePrice !== undefined ? target.salePrice : null,
      quantityAdded: target.totalQuantity ?? 0,
      addedDate: target.createdAt ? new Date(target.createdAt) : new Date(),
    })
    return list
  }
  while (list.length < count) {
    list.push(createEmptyRow(defaultCatId, `row-${list.length}-${Date.now()}`))
  }
  return list
}

export function NewProductModal({
  isOpen,
  onClose,
  onSave,
  targetProduct = null,
  onShowToast,
}: NewProductModalProps) {
  // Category Rules state (Single Source of Truth)
  const [categoryRules, setCategoryRules] = useState<ProductCategoryRule[]>([])

  // Product table rows
  const [rows, setRows] = useState<ProductRowItem[]>([])

  // Footer state
  const [isAccessory, setIsAccessory] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Settings screen toggle & state
  const [showSettings, setShowSettings] = useState(false)

  // Settings inline add/edit state
  const [ruleNewName, setRuleNewName] = useState('')
  const [ruleNewCalcType, setRuleNewCalcType] = useState<CalculationType>('PER_ROUND')
  const [ruleNewUnit, setRuleNewUnit] = useState('')
  const [ruleEditId, setRuleEditId] = useState<string | null>(null)
  const [ruleEditName, setRuleEditName] = useState('')
  const [ruleEditCalcType, setRuleEditCalcType] = useState<CalculationType>('PER_ROUND')
  const [ruleEditUnit, setRuleEditUnit] = useState('')
  const [ruleDeleteConfirmId, setRuleDeleteConfirmId] = useState<string | null>(null)

  const showToast = (title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => {
    if (onShowToast) {
      onShowToast(title, message, type)
    }
  }

  // Load category rules and reset form on open
  useEffect(() => {
    if (!isOpen) {
      setShowSettings(false)
      setRuleEditId(null)
      setRuleDeleteConfirmId(null)
      return
    }

    const loadedRules = loadCategoryRules()
    setCategoryRules(loadedRules)
    setShowSettings(false)

    const defaultCatId = loadedRules[0]?.id || 'rule-cat-1'
    setRows(createInitialRows(defaultCatId, targetProduct, DEFAULT_ROW_COUNT))

    if (targetProduct) {
      setIsAccessory(targetProduct.isAccessory ?? (targetProduct.category === 'อุปกรณ์เสริม'))
    } else {
      setIsAccessory(false)
    }
  }, [isOpen, targetProduct])

  // Table Row Handlers
  const handleAddRow = () => {
    const defaultCatId = categoryRules[0]?.id || 'rule-cat-1'
    setRows((prev) => [...prev, createEmptyRow(defaultCatId)])
  }

  const handleRemoveRow = (id: string) => {
    const defaultCatId = categoryRules[0]?.id || 'rule-cat-1'
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id)
      return filtered.length > 0 ? filtered : [createEmptyRow(defaultCatId)]
    })
  }

  const handleUpdateRow = (id: string, field: keyof ProductRowItem, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  // Quick Settings (Category Rules) CRUD Handlers
  const handleRuleAdd = () => {
    const name = ruleNewName.trim()
    const unit = ruleNewUnit.trim()
    if (!name) {
      showToast('กรุณาระบุชื่อหมวดหมู่', 'ชื่อหมวดหมู่ต้องไม่ว่าง', 'ERROR')
      return
    }
    if (!unit) {
      showToast('กรุณาระบุหน่วยนับ', 'หน่วยนับต้องไม่ว่าง', 'ERROR')
      return
    }

    const matchedCalc = CALCULATION_OPTIONS.find((c) => c.type === ruleNewCalcType)
    const calculationLabel = matchedCalc?.label || 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ'

    const updated = addCategoryRule({
      name,
      calculationType: ruleNewCalcType,
      calculationLabel,
      unit,
    })
    setCategoryRules(updated)
    setRuleNewName('')
    setRuleNewUnit('')
    setRuleNewCalcType('PER_ROUND')
    showToast('เพิ่มชุดกฎสินค้าสำเร็จ', `เพิ่ม "${name}" (${unit}) เรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleRuleUpdate = (id: string) => {
    const name = ruleEditName.trim()
    const unit = ruleEditUnit.trim()
    if (!name || !unit) {
      showToast('กรุณากรอกข้อมูลให้ครบ', 'ชื่อหมวดหมู่และหน่วยนับต้องไม่เป็นค่าว่าง', 'ERROR')
      return
    }

    const matchedCalc = CALCULATION_OPTIONS.find((c) => c.type === ruleEditCalcType)
    const calculationLabel = matchedCalc?.label || 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ'

    const updated = updateCategoryRule({
      id,
      name,
      calculationType: ruleEditCalcType,
      calculationLabel,
      unit,
    })
    setCategoryRules(updated)
    setRuleEditId(null)
    setRuleEditName('')
    setRuleEditUnit('')
    showToast('แก้ไขสำเร็จ', `อัปเดต "${name}" เรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleRuleDelete = (id: string) => {
    const updated = deleteCategoryRule(id)
    setCategoryRules(updated)
    setRuleDeleteConfirmId(null)
    showToast('ลบชุดกฎสินค้าสำเร็จ', 'ลบข้อมูลออกจากระบบเรียบร้อยแล้ว', 'SUCCESS')
  }

  // Save Products Handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    const validRows = rows.filter((r) => r.name.trim() !== '')
    if (validRows.length === 0) {
      showToast('กรุณาระบุข้อมูล', 'กรุณาระบุชื่อสินค้าอย่างน้อย 1 รายการ', 'ERROR')
      return
    }

    try {
      setIsSubmitting(true)
      const now = Date.now()

      const createdProducts: Product[] = validRows.map((r, idx) => {
        const matchedRule = categoryRules.find((c) => c.id === r.categoryId) || categoryRules[0]
        const categoryName = matchedRule?.name || 'ทั่วไป'
        const unitName = matchedRule?.unit || 'ชิ้น'
        const calcType = matchedRule?.calculationType || 'PER_ROUND'
        const calcLabel = matchedRule?.calculationLabel || 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ'

        const rentPriceNum = r.rentPrice !== null && r.rentPrice !== undefined && (r.rentPrice as any) !== ''
          ? Number(r.rentPrice)
          : null
        const salePriceNum = r.salePrice !== null && r.salePrice !== undefined && (r.salePrice as any) !== ''
          ? Number(r.salePrice)
          : null

        const totalQty = Number(r.quantityAdded) || 0
        const isTarget = targetProduct && validRows.length === 1

        // When editing existing product, preserve stock counts!
        let finalTotalQuantity = totalQty
        let finalAvailableQuantity = totalQty
        if (isTarget) {
          const qtyDelta = totalQty - (targetProduct.totalQuantity || 0)
          finalTotalQuantity = totalQty
          finalAvailableQuantity = Math.max(0, (targetProduct.availableQuantity || 0) + qtyDelta)
        }

        let rentalTypeVal: RentalType = 'NORMAL'
        if (rentPriceNum != null) {
          rentalTypeVal = calcType === 'PER_DAY' ? 'DAILY' : 'NORMAL'
        } else if (salePriceNum != null) {
          rentalTypeVal = 'SALE'
        }

        const dateStr = r.addedDate ? r.addedDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)

        return {
          id: isTarget ? targetProduct.id : `prod-${now}-${idx}`,
          code: isTarget ? targetProduct.code : `P${String(now).slice(-6)}${validRows.length > 1 ? `-${idx + 1}` : ''}`,
          name: r.name.trim(),
          category: categoryName,
          categoryId: matchedRule?.id,
          categoryRuleId: matchedRule?.id,
          calculationType: calcType,
          calculationLabel: calcLabel,
          unit: unitName,
          unitId: matchedRule?.id,
          rentPrice: rentPriceNum,
          salePrice: salePriceNum,
          normalPrice: rentPriceNum != null ? rentPriceNum : 0,
          dailyPrice: calcType === 'PER_DAY' && rentPriceNum != null ? rentPriceNum : 0,
          rentalType: rentalTypeVal,
          rentalTypeId: matchedRule?.id,
          costPrice: isTarget ? targetProduct.costPrice : 0,
          defaultDamageFee: isTarget ? targetProduct.defaultDamageFee : 0,
          defaultLossFee: isTarget ? targetProduct.defaultLossFee : 0,
          totalQuantity: finalTotalQuantity,
          availableQuantity: finalAvailableQuantity,
          rentedQuantity: isTarget ? (targetProduct.rentedQuantity || 0) : 0,
          damagedQuantity: isTarget ? (targetProduct.damagedQuantity || 0) : 0,
          lostQuantity: isTarget ? (targetProduct.lostQuantity || 0) : 0,
          reservedQuantity: isTarget ? (targetProduct.reservedQuantity || 0) : 0,
          maintenanceQuantity: isTarget ? (targetProduct.maintenanceQuantity || 0) : 0,
          minimumStock: isTarget ? targetProduct.minimumStock : 3,
          status: isTarget ? targetProduct.status : 'ACTIVE',
          isAccessory: isAccessory,
          isChargeable: !isAccessory,
          requiresReturn: rentPriceNum != null,
          createdAt: dateStr,
        }
      })

      if (onSave) {
        if (createdProducts.length === 1) {
          onSave(createdProducts[0])
        } else {
          onSave(createdProducts)
        }
      }

      showToast(
        'บันทึกข้อมูลสินค้าสำเร็จ',
        `บันทึกข้อมูลสินค้า ${createdProducts.length} รายการเรียบร้อยแล้ว`,
        'SUCCESS'
      )
      onClose()
    } catch (err: any) {
      showToast('ไม่สามารถบันทึกสินค้าได้', err?.message || 'โปรดตรวจสอบข้อมูลสินค้า', 'ERROR')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
    >
      {/* Modal Header */}
      <AppModalHeader
        title={showSettings ? 'ตั้งค่าเสริม (ชุดกฎสินค้า: หมวดหมู่ / การคำนวณ / หน่วยนับ)' : targetProduct ? `แก้ไขสินค้า: ${targetProduct.name}` : 'เพิ่มสินค้าใหม่'}
        onClose={onClose}
        className="shrink-0"
        headerActions={
          <button
            type="button"
            onClick={() => setShowSettings((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showSettings
                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/50 dark:border-blue-700 dark:text-blue-300'
                : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
            title="ตั้งค่าเสริม"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>ตั้งค่าเสริม</span>
          </button>
        }
      />

      {/* VIEW 1: SETTINGS VIEW (เมื่อกด [⚙ ตั้งค่าเสริม]) */}
      {showSettings ? (
        <AppModalBody className="p-3 sm:p-4 space-y-3 text-xs">
          {/* Add Category Rule Row: จัด ชื่อหมวดหมู่ / รูปแบบคำนวณ / หน่วยนับ / ปุ่มเพิ่ม แถวเดียวเมื่อพื้นที่พอ จัดแนวตรงตาราง */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="w-full sm:w-36 shrink-0">
              <input
                type="text"
                value={ruleNewName}
                onChange={(e) => setRuleNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleRuleAdd())}
                placeholder="ชื่อหมวดหมู่..."
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="w-full sm:flex-1 min-w-0">
              <CustomSelect
                value={ruleNewCalcType}
                onChange={(val) => setRuleNewCalcType(val as CalculationType)}
                options={CALCULATION_OPTIONS.map((opt) => ({
                  value: opt.type,
                  label: opt.label,
                }))}
              />
            </div>
            <div className="w-full sm:w-24 shrink-0">
              <input
                type="text"
                value={ruleNewUnit}
                onChange={(e) => setRuleNewUnit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleRuleAdd())}
                placeholder="หน่วยนับ..."
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="w-full sm:w-16 shrink-0">
              <button
                type="button"
                onClick={handleRuleAdd}
                disabled={!ruleNewName.trim() || !ruleNewUnit.trim()}
                className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม</span>
              </button>
            </div>
          </div>

          {/* Category Rules Table: ลำดับ | ชื่อหมวดหมู่ | รูปแบบการคำนวณ | หน่วยนับ | จัดการ */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-900">
            <div className="max-h-[50vh] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs shadow-xs">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2 px-2.5 w-10 text-center border-r border-slate-200 dark:border-slate-700">ลำดับ</th>
                    <th className="py-2 px-2.5 w-36 border-r border-slate-200 dark:border-slate-700">ชื่อหมวดหมู่</th>
                    <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700">รูปแบบการคำนวณ</th>
                    <th className="py-2 px-2.5 w-24 text-center border-r border-slate-200 dark:border-slate-700">หน่วยนับ</th>
                    <th className="py-2 px-2 w-16 text-center">จัดการ</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categoryRules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                      ยังไม่มีชุดกฎสินค้า
                    </td>
                  </tr>
                ) : (
                  categoryRules.map((rule, idx) => (
                    <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      {ruleEditId === rule.id ? (
                        <>
                          <td className="py-2 px-3 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2 border-r border-slate-200 dark:border-slate-700">
                            <input
                              type="text"
                              value={ruleEditName}
                              onChange={(e) => setRuleEditName(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold"
                              autoFocus
                            />
                          </td>
                          <td className="py-2 px-2 border-r border-slate-200 dark:border-slate-700">
                            <CustomSelect
                              value={ruleEditCalcType}
                              onChange={(val) => setRuleEditCalcType(val as CalculationType)}
                              options={CALCULATION_OPTIONS.map((opt) => ({
                                value: opt.type,
                                label: opt.label,
                              }))}
                            />
                          </td>
                          <td className="py-2 px-2 border-r border-slate-200 dark:border-slate-700">
                            <input
                              type="text"
                              value={ruleEditUnit}
                              onChange={(e) => setRuleEditUnit(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-center font-semibold"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleRuleUpdate(rule.id)}
                                className="p-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 cursor-pointer"
                                title="บันทึก"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRuleEditId(null)
                                  setRuleEditName('')
                                  setRuleEditUnit('')
                                }}
                                className="p-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 cursor-pointer"
                                title="ยกเลิก"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : ruleDeleteConfirmId === rule.id ? (
                        <>
                          <td className="py-2 px-3 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                            {idx + 1}
                          </td>
                          <td colSpan={3} className="py-2 px-3 text-red-600 dark:text-red-400 font-bold text-xs">
                            ยืนยันลบชุดกฎ &quot;{rule.name}&quot; ({rule.unit}) หรือไม่?
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleRuleDelete(rule.id)}
                                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] cursor-pointer"
                              >
                                ลบ
                              </button>
                              <button
                                type="button"
                                onClick={() => setRuleDeleteConfirmId(null)}
                                className="px-2 py-0.5 rounded border border-slate-300 text-slate-600 font-semibold text-[11px] cursor-pointer"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 px-3 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-extrabold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700">
                            {rule.name}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                            {rule.calculationLabel}
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                              {rule.unit}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setRuleEditId(rule.id)
                                  setRuleEditName(rule.name)
                                  setRuleEditCalcType(rule.calculationType)
                                  setRuleEditUnit(rule.unit)
                                  setRuleDeleteConfirmId(null)
                                }}
                                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title="แก้ไข"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRuleDeleteConfirmId(rule.id)
                                  setRuleEditId(null)
                                }}
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                title="ลบ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </AppModalBody>
      ) : (
        /* VIEW 2: PRODUCT CREATION FORM */
        <form onSubmit={handleSaveProduct} className="flex flex-col min-h-0">
          <AppModalBody className="p-3 sm:p-4 space-y-3">
            {/* ตารางกรอกสินค้าใหม่: ลำดับ | ชื่อสินค้า | หมวดหมู่ | ราคาเช่า | ราคาขาย | จำนวนที่เพิ่ม | วันที่เพิ่ม | จัดการ */}
            <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs shadow-xs">
                    <tr>
                      <th className="px-1.5 py-2 text-center border-b border-slate-200 dark:border-slate-700 w-8">
                        ลำดับ
                      </th>
                      <th className="px-2 py-2 text-left border-b border-slate-200 dark:border-slate-700">
                        ชื่อสินค้า
                      </th>
                      <th className="px-1.5 py-2 text-left border-b border-slate-200 dark:border-slate-700 w-28">
                        หมวดหมู่
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

                        {/* หมวดหมู่ (เลือกแยกต่อแถว) */}
                        <td className="px-1.5 py-1.5 align-middle">
                          <CustomSelect
                            value={row.categoryId}
                            onChange={(val) => handleUpdateRow(row.id, 'categoryId', String(val))}
                            options={categoryRules.map((cr) => ({
                              value: cr.id,
                              label: cr.name,
                            }))}
                          />
                        </td>

                        {/* ราคาเช่า (อิสระ ว่างได้ ห้ามบังคับ 0) */}
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

                        {/* ราคาขาย (อิสระ ว่างได้ ห้ามบังคับ 0) */}
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

                        {/* วันที่เพิ่ม (อยู่ต่อแถว ค่าเริ่มต้นเป็นวันนี้) */}
                        <td className="px-1 py-1.5 text-center align-middle">
                          <CustomDatePicker
                            value={row.addedDate}
                            onChange={(val) => handleUpdateRow(row.id, 'addedDate', val)}
                          />
                        </td>

                        {/* จัดการ: ลบแถว */}
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
          </AppModalBody>

          {/* Modal Footer */}
          <AppModalFooter>
            <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
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

              {/* ขวา: [ยกเลิก] [บันทึกข้อมูลสินค้า] */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ยกเลิก
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
          </AppModalFooter>
        </form>
      )}
    </AppModal>
  )
}
