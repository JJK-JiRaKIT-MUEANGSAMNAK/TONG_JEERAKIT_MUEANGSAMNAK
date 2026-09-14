'use client'

import React, { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import { CustomSelect } from '@/components/common/CustomSelect'
import {
  ProductCategoryItem,
  CategoryCompositeRule,
  CalculationType,
  CALCULATION_OPTIONS,
  loadCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  loadCompositeRules,
  addCompositeRule,
  updateCompositeRule,
  ProductCategoryRule,
} from '@/lib/category-rules-storage'
import {
  Unit,
  addUnit,
  updateUnit,
  deleteUnit,
} from '@/lib/unit-storage'
import { Product } from '@/lib/types/rental-pos'

interface ProductSettingsViewProps {
  categories?: ProductCategoryItem[]
  setCategories?: React.Dispatch<React.SetStateAction<ProductCategoryItem[]>>
  compositeRules?: CategoryCompositeRule[]
  setCompositeRules?: React.Dispatch<React.SetStateAction<CategoryCompositeRule[]>>
  masterUnits: Unit[]
  setMasterUnits: React.Dispatch<React.SetStateAction<Unit[]>>
  allProducts: Product[]
  onShowToast: (title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => void
  // Backward compatibility props
  categoryRules?: ProductCategoryRule[]
  setCategoryRules?: React.Dispatch<React.SetStateAction<ProductCategoryRule[]>>
}

const PAGE_SIZE = 5

export function ProductSettingsView({
  categories: propCategories,
  setCategories: propSetCategories,
  compositeRules: propCompositeRules,
  setCompositeRules: propSetCompositeRules,
  masterUnits,
  setMasterUnits,
  allProducts,
  onShowToast,
}: ProductSettingsViewProps) {
  // ─── Local State if not passed from parent ────────────────
  const [internalCategories, setInternalCategories] = useState<ProductCategoryItem[]>(() => loadCategories())
  const [internalCompositeRules, setInternalCompositeRules] = useState<CategoryCompositeRule[]>(() => loadCompositeRules())

  const categories = propCategories ?? internalCategories
  const setCategories = propSetCategories ?? setInternalCategories

  const compositeRules = propCompositeRules ?? internalCompositeRules
  const setCompositeRules = propSetCompositeRules ?? setInternalCompositeRules

  // ─── Table 1: Categories State ─────────────────────────────
  const [newCatName, setNewCatName] = useState('')
  const [catEditId, setCatEditId] = useState<string | null>(null)
  const [catEditName, setCatEditName] = useState('')
  const [catDeleteConfirmId, setCatDeleteConfirmId] = useState<string | null>(null)
  const [catPage, setCatPage] = useState(1)

  // ─── Table 2: Units State ──────────────────────────────────
  const [newUnitName, setNewUnitName] = useState('')
  const [unitEditId, setUnitEditId] = useState<string | null>(null)
  const [unitEditName, setUnitEditName] = useState('')
  const [unitDeleteConfirmId, setUnitDeleteConfirmId] = useState<string | null>(null)
  const [unitPage, setUnitPage] = useState(1)

  // ─── Table 3: Composite Rules State ────────────────────────
  const [isAddingCompositeRow, setIsAddingCompositeRow] = useState(false)
  const [newCompCategoryId, setNewCompCategoryId] = useState('')
  const [newCompCalcType, setNewCompCalcType] = useState<CalculationType>('PER_ROUND')
  const [newCompUnitId, setNewCompUnitId] = useState('')

  const [compEditId, setCompEditId] = useState<string | null>(null)
  const [compEditCategoryId, setCompEditCategoryId] = useState('')
  const [compEditCalcType, setCompEditCalcType] = useState<CalculationType>('PER_ROUND')
  const [compEditUnitId, setCompEditUnitId] = useState('')
  const [compPage, setCompPage] = useState(1)

  // ─── Categories Handlers (ตาราง 1) ─────────────────────────
  const handleCategoryAdd = () => {
    const trimmed = newCatName.trim()
    if (!trimmed) {
      onShowToast('กรุณาระบุชื่อหมวดหมู่', 'ชื่อหมวดหมู่ต้องไม่เป็นค่าว่าง', 'ERROR')
      return
    }

    try {
      const updated = addCategory(trimmed)
      setCategories(updated)
      setNewCatName('')
      onShowToast('เพิ่มหมวดหมู่สำเร็จ', `เพิ่มหมวดหมู่ "${trimmed}" เรียบร้อยแล้ว`, 'SUCCESS')
    } catch (err: any) {
      onShowToast('ไม่สามารถเพิ่มหมวดหมู่ได้', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
    }
  }

  const handleCategoryStartEdit = (cat: ProductCategoryItem) => {
    setCatEditId(cat.id)
    setCatEditName(cat.name)
    setCatDeleteConfirmId(null)
  }

  const handleCategorySaveEdit = (id: string) => {
    const trimmed = catEditName.trim()
    if (!trimmed) {
      onShowToast('กรุณาระบุชื่อหมวดหมู่', 'ชื่อหมวดหมู่ต้องไม่เป็นค่าว่าง', 'ERROR')
      return
    }

    try {
      const updated = updateCategory(id, trimmed)
      setCategories(updated)
      setCatEditId(null)
      setCatEditName('')
      onShowToast('แก้ไขหมวดหมู่สำเร็จ', `อัปเดต "${trimmed}" เรียบร้อยแล้ว`, 'SUCCESS')
    } catch (err: any) {
      onShowToast('ไม่สามารถแก้ไขหมวดหมู่ได้', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
    }
  }

  const handleCategoryDelete = (id: string) => {
    try {
      const updated = deleteCategory(id, (targetCat) => {
        // Safe check: used in products or composite rules?
        const usedInProducts = allProducts.some(
          (p) => p.categoryId === targetCat.id || p.category === targetCat.name
        )
        const usedInComposite = compositeRules.some((r) => r.categoryId === targetCat.id)
        return usedInProducts || usedInComposite
      })
      setCategories(updated)
      setCatDeleteConfirmId(null)
      onShowToast('ลบหมวดหมู่สำเร็จ', 'ลบข้อมูลหมวดหมู่ออกจากระบบเรียบร้อยแล้ว', 'SUCCESS')
    } catch (err: any) {
      onShowToast('ไม่สามารถลบหมวดหมู่ได้', err?.message || 'หมวดหมู่นี้กำลังถูกใช้งานอยู่', 'ERROR')
      setCatDeleteConfirmId(null)
    }
  }

  // ─── Units Handlers (ตาราง 2) ──────────────────────────────
  const handleUnitAdd = () => {
    const trimmed = newUnitName.trim()
    if (!trimmed) {
      onShowToast('กรุณาระบุชื่อหน่วยนับ', 'ชื่อหน่วยนับต้องไม่ว่าง', 'ERROR')
      return
    }

    try {
      const updated = addUnit(trimmed)
      setMasterUnits(updated)
      setNewUnitName('')
      onShowToast('เพิ่มหน่วยนับสำเร็จ', `เพิ่มหน่วยนับ "${trimmed}" เรียบร้อยแล้ว`, 'SUCCESS')
    } catch (err: any) {
      onShowToast('ไม่สามารถเพิ่มหน่วยนับได้', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
    }
  }

  const handleUnitStartEdit = (unit: Unit) => {
    setUnitEditId(unit.id)
    setUnitEditName(unit.name)
    setUnitDeleteConfirmId(null)
  }

  const handleUnitSaveEdit = (id: string) => {
    const trimmed = unitEditName.trim()
    if (!trimmed) {
      onShowToast('กรุณาระบุชื่อหน่วยนับ', 'ชื่อหน่วยนับต้องไม่ว่าง', 'ERROR')
      return
    }

    try {
      const updated = updateUnit(id, trimmed)
      setMasterUnits(updated)
      setUnitEditId(null)
      setUnitEditName('')
      onShowToast('แก้ไขหน่วยนับสำเร็จ', `อัปเดตหน่วยนับ "${trimmed}" เรียบร้อยแล้ว`, 'SUCCESS')
    } catch (err: any) {
      onShowToast('ไม่สามารถแก้ไขหน่วยนับได้', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
    }
  }

  const handleUnitDelete = (id: string) => {
    try {
      const updated = deleteUnit(id, (targetUnit) => {
        const usedInProducts = allProducts.some(
          (p) => p.unitId === targetUnit.id || p.unit === targetUnit.name
        )
        const usedInComposite = compositeRules.some((r) => r.unitId === targetUnit.id)
        return usedInProducts || usedInComposite
      })
      setMasterUnits(updated)
      setUnitDeleteConfirmId(null)
      onShowToast('ลบหน่วยนับสำเร็จ', 'ลบหน่วยนับออกจากระบบเรียบร้อยแล้ว', 'SUCCESS')
    } catch (err: any) {
      onShowToast('ไม่สามารถลบหน่วยนับได้', err?.message || 'หน่วยนับนี้กำลังถูกใช้งานอยู่', 'ERROR')
      setUnitDeleteConfirmId(null)
    }
  }

  // ─── Composite Rules Handlers (ตาราง 3) ────────────────────
  const handleStartAddCompositeRow = () => {
    const defaultCatId = categories[0]?.id || ''
    setNewCompCategoryId(defaultCatId)
    setNewCompCalcType('PER_ROUND')
    setNewCompUnitId('')
    setIsAddingCompositeRow(true)
    setCompEditId(null)
  }

  const handleSaveAddCompositeRow = () => {
    if (!newCompCategoryId) {
      onShowToast('กรุณาเลือกหมวดหมู่', 'ต้องเลือกหมวดหมู่สินค้าสำหรับแถวนี้', 'ERROR')
      return
    }

    try {
      const updated = addCompositeRule({
        categoryId: newCompCategoryId,
        calculationType: newCompCalcType,
        unitId: newCompUnitId || undefined,
      })
      setCompositeRules(updated)
      setIsAddingCompositeRow(false)
      onShowToast('เพิ่มข้อมูลประกอบสำเร็จ', 'เพิ่มรายการในตารางประกอบข้อมูลเรียบร้อยแล้ว', 'SUCCESS')
    } catch (err: any) {
      onShowToast('ไม่สามารถเพิ่มข้อมูลประกอบได้', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
    }
  }

  const handleStartEditCompositeRow = (rule: CategoryCompositeRule) => {
    setCompEditId(rule.id)
    setCompEditCategoryId(rule.categoryId)
    setCompEditCalcType(rule.calculationType)
    setCompEditUnitId(rule.unitId || '')
    setIsAddingCompositeRow(false)
  }

  const handleSaveEditCompositeRow = (id: string) => {
    if (!compEditCategoryId) {
      onShowToast('กรุณาเลือกหมวดหมู่', 'ต้องเลือกหมวดหมู่สินค้า', 'ERROR')
      return
    }

    try {
      const updated = updateCompositeRule({
        id,
        categoryId: compEditCategoryId,
        calculationType: compEditCalcType,
        unitId: compEditUnitId || undefined,
      })
      setCompositeRules(updated)
      setCompEditId(null)
      onShowToast('บันทึกข้อมูลประกอบสำเร็จ', 'อัปเดตข้อมูลประกอบเรียบร้อยแล้ว', 'SUCCESS')
    } catch (err: any) {
      onShowToast('ไม่สามารถบันทึกข้อมูลประกอบได้', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
    }
  }

  // ─── Calculation Options Helper ────────────────────────────
  const calcOptions = useMemo(
    () =>
      CALCULATION_OPTIONS.map((opt) => ({
        value: opt.type,
        label: opt.label,
      })),
    []
  )

  const activeUnits = useMemo(() => masterUnits.filter((u) => u.isActive), [masterUnits])

  const unitOptions = useMemo(() => {
    const list: Array<{ value: string; label: string }> = [{ value: '', label: '-- ไม่ระบุ --' }]
    for (const u of activeUnits) {
      list.push({ value: u.id, label: u.name })
    }
    return list
  }, [activeUnits])

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      value: c.id,
      label: c.name,
    }))
  }, [categories])

  const getCategoryName = (id: string) => {
    const found = categories.find((c) => c.id === id)
    return found ? found.name : '-'
  }

  const getCalcLabel = (type: CalculationType) => {
    const found = CALCULATION_OPTIONS.find((c) => c.type === type)
    return found ? found.label : type
  }

  const getUnitName = (id?: string) => {
    if (!id) return '-'
    const found = masterUnits.find((u) => u.id === id)
    return found ? found.name : '-'
  }

  // ─── Pagination Calculations ───────────────────────────────
  const catTotalPages = Math.ceil(categories.length / PAGE_SIZE) || 1
  const paginatedCats = categories.slice((catPage - 1) * PAGE_SIZE, catPage * PAGE_SIZE)
  const catPaddingRows = Math.max(0, PAGE_SIZE - paginatedCats.length)

  const unitTotalPages = Math.ceil(masterUnits.length / PAGE_SIZE) || 1
  const paginatedUnits = masterUnits.slice((unitPage - 1) * PAGE_SIZE, unitPage * PAGE_SIZE)
  const unitPaddingRows = Math.max(0, PAGE_SIZE - paginatedUnits.length)

  const compTotalPages = Math.ceil(compositeRules.length / PAGE_SIZE) || 1
  const paginatedComp = compositeRules.slice((compPage - 1) * PAGE_SIZE, compPage * PAGE_SIZE)
  const compPaddingRows = Math.max(0, PAGE_SIZE - (paginatedComp.length + (isAddingCompositeRow ? 1 : 0)))

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto p-1 text-xs">
      {/* Landscape: 2 columns for Table 1 + Table 2 / Portrait: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ==================================================== */}
        {/* ตารางที่ 1: หมวดหมู่สินค้า */}
        {/* ==================================================== */}
        <div className="flex flex-col">
          {/* Header title */}
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              หมวดหมู่สินค้า
            </h3>
          </div>

          {/* Toolbar เหนือตาราง: [ ชื่อหมวดหมู่ใหม่... ] [ + เพิ่มหมวดหมู่ ] */}
          <div className="flex items-center gap-2 mb-2.5">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCategoryAdd())}
              placeholder="ชื่อหมวดหมู่ใหม่..."
              className="flex-1 min-w-0 h-8 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
            />
            <ActionButton
              type="button"
              onClick={handleCategoryAdd}
              disabled={!newCatName.trim()}
              variant="primary"
              icon={<Plus className="w-3.5 h-3.5" />}
              className="h-8 py-0 px-3 rounded-xl shrink-0"
            >
              เพิ่มหมวดหมู่
            </ActionButton>
          </div>

          {/* Table 1: | ลำดับ | หมวดหมู่ | จัดการ | */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse table-fixed">
                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-2 w-16 text-center border-r border-slate-200 dark:border-slate-700">
                      ลำดับ
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700">
                      หมวดหมู่
                    </th>
                    <th className="py-2.5 px-2 w-24 text-center">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 italic">
                        ยังไม่มีรายการ
                      </td>
                    </tr>
                  ) : (
                    paginatedCats.map((cat, idx) => {
                      const globalIdx = (catPage - 1) * PAGE_SIZE + idx + 1

                      if (catEditId === cat.id) {
                        return (
                          <tr key={cat.id} className="h-10 bg-amber-50/50 dark:bg-amber-950/20">
                            <td className="py-1 px-2 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                              {globalIdx}
                            </td>
                            <td className="py-1 px-2 text-center border-r border-slate-200 dark:border-slate-700">
                              <input
                                type="text"
                                value={catEditName}
                                onChange={(e) => setCatEditName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCategorySaveEdit(cat.id))}
                                className="w-full h-7 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none"
                                autoFocus
                              />
                            </td>
                            <td className="py-1 px-2 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCategorySaveEdit(cat.id)}
                                  className="w-7 h-7 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center transition-colors cursor-pointer"
                                  title="บันทึก"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCatEditId(null)}
                                  className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                                  title="ยกเลิก"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      }

                      if (catDeleteConfirmId === cat.id) {
                        return (
                          <tr key={cat.id} className="h-10 bg-red-50/60 dark:bg-red-950/30">
                            <td colSpan={2} className="py-1 px-3 text-center text-red-600 font-bold text-xs">
                              ยืนยันลบหมวดหมู่ &quot;{cat.name}&quot;?
                            </td>
                            <td className="py-1 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleCategoryDelete(cat.id)}
                                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
                                >
                                  ลบ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCatDeleteConfirmId(null)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-[11px] cursor-pointer transition-colors"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      }

                      return (
                        <tr key={cat.id} className="h-10 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-1 px-2 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                            {globalIdx}
                          </td>
                          <td className="py-1 px-3 text-center font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 truncate">
                            {cat.name}
                          </td>
                          <td className="py-1 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleCategoryStartEdit(cat)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                                title="แก้ไข"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCatDeleteConfirmId(cat.id)
                                  setCatEditId(null)
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                title="ลบ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}

                  {/* Padding slots to strictly keep table height fixed (ห้ามยืดตารางตามจำนวนรายการ) */}
                  {Array.from({ length: catPaddingRows }).map((_, pIdx) => (
                    <tr key={`cat-pad-${pIdx}`} className="h-10 select-none">
                      <td className="py-1 px-2 text-center border-r border-slate-200 dark:border-slate-700 text-transparent">
                        -
                      </td>
                      <td className="py-1 px-3 text-center border-r border-slate-200 dark:border-slate-700 text-transparent">
                        -
                      </td>
                      <td className="py-1 px-2 text-center text-transparent">
                        -
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer: ก่อนหน้า | หน้า X / Y | ถัดไป */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-850">
              <ActionButton
                type="button"
                onClick={() => setCatPage((p) => Math.max(1, p - 1))}
                disabled={catPage <= 1}
                variant="outline"
                className="h-7 px-2.5 py-0 text-xs rounded-lg font-bold"
              >
                ก่อนหน้า
              </ActionButton>
              <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                หน้า {catPage} / {catTotalPages}
              </span>
              <ActionButton
                type="button"
                onClick={() => setCatPage((p) => Math.min(catTotalPages, p + 1))}
                disabled={catPage >= catTotalPages}
                variant="outline"
                className="h-7 px-2.5 py-0 text-xs rounded-lg font-bold"
              >
                ถัดไป
              </ActionButton>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* ตารางที่ 2: หน่วยนับ */}
        {/* ==================================================== */}
        <div className="flex flex-col">
          {/* Header title */}
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              หน่วยนับ
            </h3>
          </div>

          {/* Toolbar เหนือตาราง: [ ชื่อหน่วยนับใหม่... ] [ + เพิ่มหน่วยนับ ] */}
          <div className="flex items-center gap-2 mb-2.5">
            <input
              type="text"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUnitAdd())}
              placeholder="ชื่อหน่วยนับใหม่..."
              className="flex-1 min-w-0 h-8 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
            />
            <ActionButton
              type="button"
              onClick={handleUnitAdd}
              disabled={!newUnitName.trim()}
              variant="primary"
              icon={<Plus className="w-3.5 h-3.5" />}
              className="h-8 py-0 px-3 rounded-xl shrink-0"
            >
              เพิ่มหน่วยนับ
            </ActionButton>
          </div>

          {/* Table 2: | ลำดับ | หน่วยนับ | จัดการ | */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse table-fixed">
                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-2 w-16 text-center border-r border-slate-200 dark:border-slate-700">
                      ลำดับ
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700">
                      หน่วยนับ
                    </th>
                    <th className="py-2.5 px-2 w-24 text-center">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {masterUnits.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 italic">
                        ยังไม่มีรายการ
                      </td>
                    </tr>
                  ) : (
                    paginatedUnits.map((u, idx) => {
                      const globalIdx = (unitPage - 1) * PAGE_SIZE + idx + 1

                      if (unitEditId === u.id) {
                        return (
                          <tr key={u.id} className="h-10 bg-amber-50/50 dark:bg-amber-950/20">
                            <td className="py-1 px-2 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                              {globalIdx}
                            </td>
                            <td className="py-1 px-2 text-center border-r border-slate-200 dark:border-slate-700">
                              <input
                                type="text"
                                value={unitEditName}
                                onChange={(e) => setUnitEditName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUnitSaveEdit(u.id))}
                                className="w-full h-7 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none"
                                autoFocus
                              />
                            </td>
                            <td className="py-1 px-2 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleUnitSaveEdit(u.id)}
                                  className="w-7 h-7 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center transition-colors cursor-pointer"
                                  title="บันทึก"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setUnitEditId(null)}
                                  className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                                  title="ยกเลิก"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      }

                      if (unitDeleteConfirmId === u.id) {
                        return (
                          <tr key={u.id} className="h-10 bg-red-50/60 dark:bg-red-950/30">
                            <td colSpan={2} className="py-1 px-3 text-center text-red-600 font-bold text-xs">
                              ยืนยันลบหน่วยนับ &quot;{u.name}&quot;?
                            </td>
                            <td className="py-1 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUnitDelete(u.id)}
                                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
                                >
                                  ลบ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setUnitDeleteConfirmId(null)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-[11px] cursor-pointer transition-colors"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      }

                      return (
                        <tr key={u.id} className="h-10 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-1 px-2 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                            {globalIdx}
                          </td>
                          <td className="py-1 px-3 text-center font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 truncate">
                            {u.name}
                          </td>
                          <td className="py-1 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUnitStartEdit(u)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                                title="แก้ไข"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setUnitDeleteConfirmId(u.id)
                                  setUnitEditId(null)
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                title="ลบ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}

                  {/* Padding slots to strictly keep table height fixed */}
                  {Array.from({ length: unitPaddingRows }).map((_, pIdx) => (
                    <tr key={`unit-pad-${pIdx}`} className="h-10 select-none">
                      <td className="py-1 px-2 text-center border-r border-slate-200 dark:border-slate-700 text-transparent">
                        -
                      </td>
                      <td className="py-1 px-3 text-center border-r border-slate-200 dark:border-slate-700 text-transparent">
                        -
                      </td>
                      <td className="py-1 px-2 text-center text-transparent">
                        -
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer: ก่อนหน้า | หน้า X / Y | ถัดไป */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-850">
              <ActionButton
                type="button"
                onClick={() => setUnitPage((p) => Math.max(1, p - 1))}
                disabled={unitPage <= 1}
                variant="outline"
                className="h-7 px-2.5 py-0 text-xs rounded-lg font-bold"
              >
                ก่อนหน้า
              </ActionButton>
              <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                หน้า {unitPage} / {unitTotalPages}
              </span>
              <ActionButton
                type="button"
                onClick={() => setUnitPage((p) => Math.min(unitTotalPages, p + 1))}
                disabled={unitPage >= unitTotalPages}
                variant="outline"
                className="h-7 px-2.5 py-0 text-xs rounded-lg font-bold"
              >
                ถัดไป
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* ตารางที่ 3: ตารางประกอบข้อมูล (Full Width Below) */}
      {/* ==================================================== */}
      <div className="flex flex-col mt-2">
        {/* Header title */}
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              ตารางประกอบข้อมูล
            </h3>
            <p className="text-[11px] text-slate-400">
              ข้อมูลช่วย Lookup กำหนดวิธีคิดเงิน รูปแบบการคิดเงิน และหน่วยนับอัตโนมัติตอนเพิ่มสินค้าใหม่
            </p>
          </div>
        </div>

        {/* Table 3: | ลำดับ | หมวดหมู่ | วิธีคิดเงิน | หน่วยนับ | จัดการ | */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse table-fixed min-w-[580px]">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-2 w-16 text-center border-r border-slate-200 dark:border-slate-700">
                    ลำดับ
                  </th>
                  <th className="py-2.5 px-3 w-48 text-center border-r border-slate-200 dark:border-slate-700">
                    หมวดหมู่
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700">
                    วิธีคิดเงิน
                  </th>
                  <th className="py-2.5 px-3 w-40 text-center border-r border-slate-200 dark:border-slate-700">
                    หน่วยนับ
                  </th>
                  <th className="py-2.5 px-2 w-20 text-center">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* แถวสำหรับเพิ่มใหม่ (+ เพิ่มแถว) */}
                {isAddingCompositeRow && (
                  <tr className="h-11 bg-emerald-50/60 dark:bg-emerald-950/20">
                    <td className="py-1 px-2 text-center font-bold text-emerald-600 border-r border-slate-200 dark:border-slate-700">
                      +
                    </td>
                    <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-700">
                      <CustomSelect
                        value={newCompCategoryId}
                        onChange={(val) => setNewCompCategoryId(String(val))}
                        options={categoryOptions}
                        placeholder="-- เลือกหมวดหมู่ --"
                        className="w-full"
                        buttonClassName="h-7 text-xs font-bold justify-between"
                      />
                    </td>
                    <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-700">
                      <CustomSelect
                        value={newCompCalcType}
                        onChange={(val) => setNewCompCalcType(val as CalculationType)}
                        options={calcOptions}
                        className="w-full"
                        buttonClassName="h-7 text-xs font-bold justify-between"
                      />
                    </td>
                    <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-700">
                      <CustomSelect
                        value={newCompUnitId}
                        onChange={(val) => setNewCompUnitId(String(val))}
                        options={unitOptions}
                        placeholder="-- ไม่ระบุ --"
                        className="w-full"
                        buttonClassName="h-7 text-xs font-bold justify-between"
                      />
                    </td>
                    <td className="py-1 px-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSaveAddCompositeRow}
                          className="w-7 h-7 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex items-center justify-center transition-colors cursor-pointer"
                          title="บันทึก"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingCompositeRow(false)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                          title="ยกเลิก"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {compositeRules.length === 0 && !isAddingCompositeRow ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      ยังไม่มีรายการ
                    </td>
                  </tr>
                ) : (
                  paginatedComp.map((rule, idx) => {
                    const globalIdx = (compPage - 1) * PAGE_SIZE + idx + 1

                    if (compEditId === rule.id) {
                      return (
                        <tr key={rule.id} className="h-11 bg-amber-50/50 dark:bg-amber-950/20">
                          <td className="py-1 px-2 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                            {globalIdx}
                          </td>
                          <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-700">
                            <CustomSelect
                              value={compEditCategoryId}
                              onChange={(val) => setCompEditCategoryId(String(val))}
                              options={categoryOptions}
                              placeholder="-- เลือกหมวดหมู่ --"
                              className="w-full"
                              buttonClassName="h-7 text-xs font-bold justify-between"
                            />
                          </td>
                          <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-700">
                            <CustomSelect
                              value={compEditCalcType}
                              onChange={(val) => setCompEditCalcType(val as CalculationType)}
                              options={calcOptions}
                              className="w-full"
                              buttonClassName="h-7 text-xs font-bold justify-between"
                            />
                          </td>
                          <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-700">
                            <CustomSelect
                              value={compEditUnitId}
                              onChange={(val) => setCompEditUnitId(String(val))}
                              options={unitOptions}
                              placeholder="-- ไม่ระบุ --"
                              className="w-full"
                              buttonClassName="h-7 text-xs font-bold justify-between"
                            />
                          </td>
                          <td className="py-1 px-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveEditCompositeRow(rule.id)}
                                className="w-7 h-7 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center transition-colors cursor-pointer"
                                title="บันทึก"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setCompEditId(null)}
                                className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                                title="ยกเลิก"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    }

                    return (
                      <tr key={rule.id} className="h-10 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-1 px-2 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                          {globalIdx}
                        </td>
                        <td className="py-1 px-3 text-center font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 truncate">
                          {getCategoryName(rule.categoryId)}
                        </td>
                        <td className="py-1 px-3 text-center font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                          <span className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] ${
                            rule.calculationType === 'NO_CHARGE'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              : rule.calculationType === 'SALE'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          }`}>
                            {getCalcLabel(rule.calculationType)}
                          </span>
                        </td>
                        <td className="py-1 px-3 text-center font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                          {rule.unitId ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                              {getUnitName(rule.unitId)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-normal">
                              - (เลือกเอง)
                            </span>
                          )}
                        </td>
                        <td className="py-1 px-2 text-center">
                          {/* บันทึกแล้วแสดงเฉพาะปุ่มแก้ไข (ไม่มีปุ่มลบในตารางประกอบ) */}
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleStartEditCompositeRow(rule)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                              title="แก้ไข"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}

                {/* Padding slots to strictly keep table height fixed */}
                {Array.from({ length: compPaddingRows }).map((_, pIdx) => (
                  <tr key={`comp-pad-${pIdx}`} className="h-10 select-none">
                    <td className="py-1 px-2 text-center border-r border-slate-200 dark:border-slate-700 text-transparent">
                      -
                    </td>
                    <td className="py-1 px-3 text-center border-r border-slate-200 dark:border-slate-700 text-transparent">
                      -
                    </td>
                    <td className="py-1 px-3 text-center border-r border-slate-200 dark:border-slate-700 text-transparent">
                      -
                    </td>
                    <td className="py-1 px-3 text-center border-r border-slate-200 dark:border-slate-700 text-transparent">
                      -
                    </td>
                    <td className="py-1 px-2 text-center text-transparent">
                      -
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ท้ายตาราง: [ + เพิ่มแถว ] และ Pagination: ก่อนหน้า | หน้า X / Y | ถัดไป */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-850">
            <div>
              <ActionButton
                type="button"
                onClick={handleStartAddCompositeRow}
                disabled={isAddingCompositeRow || categories.length === 0}
                variant="dashed"
                icon={<Plus className="w-3.5 h-3.5" />}
                className="h-8 py-0 px-3 rounded-xl border-dashed"
              >
                + เพิ่มแถว
              </ActionButton>
            </div>

            <div className="flex items-center gap-2">
              <ActionButton
                type="button"
                onClick={() => setCompPage((p) => Math.max(1, p - 1))}
                disabled={compPage <= 1}
                variant="outline"
                className="h-7 px-2.5 py-0 text-xs rounded-lg font-bold"
              >
                ก่อนหน้า
              </ActionButton>
              <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                หน้า {compPage} / {compTotalPages}
              </span>
              <ActionButton
                type="button"
                onClick={() => setCompPage((p) => Math.min(compTotalPages, p + 1))}
                disabled={compPage >= compTotalPages}
                variant="outline"
                className="h-7 px-2.5 py-0 text-xs rounded-lg font-bold"
              >
                ถัดไป
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
