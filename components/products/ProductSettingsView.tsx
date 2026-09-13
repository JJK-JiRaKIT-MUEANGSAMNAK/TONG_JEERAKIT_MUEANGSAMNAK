'use client'

import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Check, X, Tag, Scale } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'
import {
  ProductCategoryRule,
  CalculationType,
  CALCULATION_OPTIONS,
  addCategoryRule,
  updateCategoryRule,
  deleteCategoryRule,
} from '@/lib/category-rules-storage'
import {
  Unit,
  addUnit,
  updateUnit,
  deleteUnit,
} from '@/lib/unit-storage'
import { Product } from '@/lib/types/rental-pos'

interface ProductSettingsViewProps {
  categoryRules: ProductCategoryRule[]
  setCategoryRules: React.Dispatch<React.SetStateAction<ProductCategoryRule[]>>
  masterUnits: Unit[]
  setMasterUnits: React.Dispatch<React.SetStateAction<Unit[]>>
  allProducts: Product[]
  onShowToast: (title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => void
}

export function ProductSettingsView({
  categoryRules,
  setCategoryRules,
  masterUnits,
  setMasterUnits,
  allProducts,
  onShowToast,
}: ProductSettingsViewProps) {
  // Category Rules Form State
  const [ruleNewName, setRuleNewName] = useState('')
  const [ruleNewCalcType, setRuleNewCalcType] = useState<CalculationType>('PER_ROUND')
  const [ruleNewUnitId, setRuleNewUnitId] = useState<string>(masterUnits[0]?.id || 'unit-4')

  const [ruleEditId, setRuleEditId] = useState<string | null>(null)
  const [ruleEditName, setRuleEditName] = useState('')
  const [ruleEditCalcType, setRuleEditCalcType] = useState<CalculationType>('PER_ROUND')
  const [ruleEditUnitId, setRuleEditUnitId] = useState<string>('')
  const [ruleDeleteConfirmId, setRuleDeleteConfirmId] = useState<string | null>(null)

  // Master Units Form State
  const [unitNewName, setUnitNewName] = useState('')
  const [unitEditId, setUnitEditId] = useState<string | null>(null)
  const [unitEditName, setUnitEditName] = useState('')
  const [unitDeleteConfirmId, setUnitDeleteConfirmId] = useState<string | null>(null)

  // ─── Category Rules Handlers ──────────────────────────
  const handleRuleAdd = () => {
    const name = ruleNewName.trim()
    if (!name) {
      onShowToast('กรุณาระบุชื่อหมวดหมู่', 'ชื่อหมวดหมู่ต้องไม่เป็นค่าว่าง', 'ERROR')
      return
    }

    const matchedUnit = masterUnits.find((u) => u.id === ruleNewUnitId) || masterUnits[0]
    const unitName = matchedUnit?.name || 'ชิ้น'

    const matchedCalc = CALCULATION_OPTIONS.find((c) => c.type === ruleNewCalcType)
    const calculationLabel = matchedCalc?.label || 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ'

    const updated = addCategoryRule({
      name,
      calculationType: ruleNewCalcType,
      calculationLabel,
      unit: unitName,
      unitId: matchedUnit?.id,
    })
    setCategoryRules(updated)
    setRuleNewName('')
    setRuleNewCalcType('PER_ROUND')
    onShowToast('เพิ่มหมวดหมู่สำเร็จ', `เพิ่ม "${name}" (${unitName}) เรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleRuleUpdate = (id: string) => {
    const name = ruleEditName.trim()
    if (!name) {
      onShowToast('กรุณาระบุชื่อหมวดหมู่', 'ชื่อหมวดหมู่ต้องไม่เป็นค่าว่าง', 'ERROR')
      return
    }

    const matchedUnit = masterUnits.find((u) => u.id === ruleEditUnitId) || masterUnits[0]
    const unitName = matchedUnit?.name || 'ชิ้น'

    const matchedCalc = CALCULATION_OPTIONS.find((c) => c.type === ruleEditCalcType)
    const calculationLabel = matchedCalc?.label || 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ'

    const updated = updateCategoryRule({
      id,
      name,
      calculationType: ruleEditCalcType,
      calculationLabel,
      unit: unitName,
      unitId: matchedUnit?.id,
    })
    setCategoryRules(updated)
    setRuleEditId(null)
    setRuleEditName('')
    onShowToast('แก้ไขหมวดหมู่สำเร็จ', `อัปเดต "${name}" เรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleRuleDelete = (id: string) => {
    // Check if in use by products
    const ruleToDelete = categoryRules.find((r) => r.id === id)
    if (ruleToDelete) {
      const inUse = allProducts.some(
        (p) => p.categoryId === id || p.categoryRuleId === id || p.category === ruleToDelete.name
      )
      if (inUse) {
        onShowToast(
          'ไม่สามารถลบได้',
          `หมวดหมู่ "${ruleToDelete.name}" มีสินค้าที่ใช้งานอยู่ กรุณาย้ายสินค้าก่อนลบ`,
          'ERROR'
        )
        setRuleDeleteConfirmId(null)
        return
      }
    }

    const updated = deleteCategoryRule(id)
    setCategoryRules(updated)
    setRuleDeleteConfirmId(null)
    onShowToast('ลบหมวดหมู่สำเร็จ', 'ลบข้อมูลหมวดหมู่ออกจากระบบเรียบร้อยแล้ว', 'SUCCESS')
  }

  // ─── Master Units Handlers ────────────────────────────
  const handleUnitAdd = () => {
    const name = unitNewName.trim()
    if (!name) {
      onShowToast('กรุณาระบุชื่อหน่วยนับ', 'ชื่อหน่วยนับต้องไม่ว่าง', 'ERROR')
      return
    }

    try {
      const updated = addUnit(name)
      setMasterUnits(updated)
      setUnitNewName('')
      onShowToast('เพิ่มหน่วยนับสำเร็จ', `เพิ่มหน่วยนับ "${name}" เรียบร้อยแล้ว`, 'SUCCESS')
    } catch (err: any) {
      onShowToast('ไม่สามารถเพิ่มหน่วยนับได้', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
    }
  }

  const handleUnitUpdate = (id: string) => {
    const name = unitEditName.trim()
    if (!name) {
      onShowToast('กรุณาระบุชื่อหน่วยนับ', 'ชื่อหน่วยนับต้องไม่ว่าง', 'ERROR')
      return
    }

    try {
      const updated = updateUnit(id, name)
      setMasterUnits(updated)
      setUnitEditId(null)
      setUnitEditName('')
      onShowToast('แก้ไขหน่วยนับสำเร็จ', `อัปเดตหน่วยนับ "${name}" เรียบร้อยแล้ว`, 'SUCCESS')
    } catch (err: any) {
      onShowToast('ไม่สามารถแก้ไขหน่วยนับได้', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
    }
  }

  const handleUnitDelete = (id: string) => {
    try {
      const updated = deleteUnit(id, (targetUnit) => {
        // Safe check: unit used in category rules or products?
        const usedInRules = categoryRules.some(
          (r) => r.unitId === targetUnit.id || r.unit === targetUnit.name
        )
        const usedInProducts = allProducts.some(
          (p) => p.unitId === targetUnit.id || p.unit === targetUnit.name
        )
        return usedInRules || usedInProducts
      })
      setMasterUnits(updated)
      setUnitDeleteConfirmId(null)
      onShowToast('ลบหน่วยนับสำเร็จ', 'ลบหน่วยนับออกจากระบบเรียบร้อยแล้ว', 'SUCCESS')
    } catch (err: any) {
      onShowToast('ไม่สามารถลบหน่วยนับได้', err?.message || 'หน่วยนับนี้กำลังถูกใช้งานอยู่', 'ERROR')
      setUnitDeleteConfirmId(null)
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto p-1 text-xs">
      {/* ส่วนที่ 1: หมวดหมู่สินค้า */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                หมวดหมู่สินค้า
              </h3>
              <p className="text-[11px] text-slate-400">
                กำหนดหมวดหมู่สินค้า รูปแบบการคิดเงิน และหน่วยนับ
              </p>
            </div>
          </div>
        </div>

        {/* Add Category Form */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="w-full sm:w-44 shrink-0">
            <input
              type="text"
              value={ruleNewName}
              onChange={(e) => setRuleNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleRuleAdd())}
              placeholder="ชื่อหมวดหมู่ใหม่..."
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
          <div className="w-full sm:w-48 shrink-0 flex items-center gap-1.5">
            <div className="flex-1 min-w-0">
              <CustomSelect
                value={ruleNewUnitId || masterUnits[0]?.id || ''}
                onChange={(val) => setRuleNewUnitId(String(val))}
                options={
                  masterUnits.filter((u) => u.isActive).length > 0
                    ? masterUnits
                        .filter((u) => u.isActive)
                        .map((u) => ({
                          value: u.id,
                          label: u.name,
                        }))
                    : [{ value: '', label: 'ยังไม่มีรายการ' }]
                }
                placeholder={masterUnits.length > 0 ? '-- เลือกหน่วยนับ --' : 'ยังไม่มีรายการ'}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('section-units')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              title="ไปเพิ่มหน่วยนับด้านล่าง"
              className="px-2 py-2 rounded-xl border border-dashed border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">เพิ่มหน่วยนับ</span>
            </button>
          </div>
          <div className="w-full sm:w-28 shrink-0">
            <button
              type="button"
              onClick={handleRuleAdd}
              disabled={!ruleNewName.trim() || masterUnits.length === 0}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มหมวดหมู่</span>
            </button>
          </div>
        </div>

        {/* Categories Table */}
        <div className="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full min-w-[620px] text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 px-2.5 w-12 text-center border-r border-slate-200 dark:border-slate-700">
                  ลำดับ
                </th>
                <th className="py-2 px-3 w-44 border-r border-slate-200 dark:border-slate-700">
                  ชื่อหมวดหมู่
                </th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">
                  รูปแบบการคิดเงิน
                </th>
                <th className="py-2 px-3 w-32 text-center border-r border-slate-200 dark:border-slate-700">
                  หน่วยนับ
                </th>
                <th className="py-2 px-2 w-20 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoryRules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                    ยังไม่มีรายการ
                  </td>
                </tr>
              ) : (
                categoryRules.map((rule, idx) => (
                  <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    {ruleEditId === rule.id ? (
                      <>
                        <td className="py-2 px-2 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
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
                          <CustomSelect
                            value={ruleEditUnitId}
                            onChange={(val) => setRuleEditUnitId(String(val))}
                            options={
                              masterUnits.filter((u) => u.isActive).length > 0
                                ? masterUnits
                                    .filter((u) => u.isActive)
                                    .map((u) => ({
                                      value: u.id,
                                      label: u.name,
                                    }))
                                : [{ value: '', label: 'ยังไม่มีรายการ' }]
                            }
                            placeholder={masterUnits.length > 0 ? '-- เลือกหน่วยนับ --' : 'ยังไม่มีรายการ'}
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRuleUpdate(rule.id)}
                              className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                              title="บันทึก"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRuleEditId(null)}
                              className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="ยกเลิก"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : ruleDeleteConfirmId === rule.id ? (
                      <>
                        <td colSpan={4} className="py-2 px-3 text-red-600 font-bold">
                          ยืนยันลบหมวดหมู่ &quot;{rule.name}&quot; หรือไม่?
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRuleDelete(rule.id)}
                              className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer"
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
                        <td className="py-2 px-2 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-extrabold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700">
                          {rule.name}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                          {rule.calculationLabel}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
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
                                const matchedUnit = masterUnits.find(
                                  (u) => u.id === rule.unitId || u.name === rule.unit
                                )
                                setRuleEditUnitId(matchedUnit?.id || masterUnits[0]?.id || '')
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

      {/* ส่วนที่ 2: หน่วยนับ */}
      <div
        id="section-units"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                หน่วยนับ
              </h3>
              <p className="text-[11px] text-slate-400">
                จัดการหน่วยนับสำหรับสินค้าและหมวดหมู่ เช่น ชิ้น, ตัว, แผ่น, ชุด
              </p>
            </div>
          </div>
        </div>

        {/* Add Unit Row */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="w-full sm:w-72 shrink-0">
            <input
              type="text"
              value={unitNewName}
              onChange={(e) => setUnitNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUnitAdd())}
              placeholder="ชื่อหน่วยนับใหม่ (เช่น แผ่น, ตัว, ลัง)..."
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div className="w-full sm:w-28 shrink-0">
            <button
              type="button"
              onClick={handleUnitAdd}
              disabled={!unitNewName.trim()}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มหน่วยนับ</span>
            </button>
          </div>
        </div>

        {/* Units Table: ลำดับ | ชื่อหน่วยนับ | จัดการ */}
        <div className="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full min-w-[360px] text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 px-2.5 w-12 text-center border-r border-slate-200 dark:border-slate-700">
                  ลำดับ
                </th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">
                  ชื่อหน่วยนับ
                </th>
                <th className="py-2 px-2 w-24 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {masterUnits.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-slate-400 italic">
                    ยังไม่มีรายการ
                  </td>
                </tr>
              ) : (
                masterUnits.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    {unitEditId === u.id ? (
                      <>
                        <td className="py-2 px-2 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-2 border-r border-slate-200 dark:border-slate-700">
                          <input
                            type="text"
                            value={unitEditName}
                            onChange={(e) => setUnitEditName(e.target.value)}
                            className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold"
                            autoFocus
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUnitUpdate(u.id)}
                              className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                              title="บันทึก"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setUnitEditId(null)}
                              className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="ยกเลิก"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : unitDeleteConfirmId === u.id ? (
                      <>
                        <td colSpan={2} className="py-2 px-3 text-red-600 font-bold">
                          ยืนยันลบหน่วยนับ &quot;{u.name}&quot; หรือไม่?
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUnitDelete(u.id)}
                              className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              ลบ
                            </button>
                            <button
                              type="button"
                              onClick={() => setUnitDeleteConfirmId(null)}
                              className="px-2 py-0.5 rounded border border-slate-300 text-slate-600 font-semibold text-[11px] cursor-pointer"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-2 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-extrabold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700">
                          {u.name}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setUnitEditId(u.id)
                                setUnitEditName(u.name)
                                setUnitDeleteConfirmId(null)
                              }}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
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
    </div>
  )
}
