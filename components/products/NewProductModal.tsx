'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Settings,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'
import { CustomDatePicker } from '@/components/common/CustomDatePicker'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { NumericInput } from '@/components/common/NumericInput'
import { Product, RentalType } from '@/lib/types/rental-pos'

export interface MasterDataItem {
  id: string
  label: string
  calculation?: string
  code?: string
  isDefault?: boolean
}

export interface ProductRowItem {
  id: string
  name: string
  totalQuantity: number
  price: number
  lossFee: number
  damageFee: number
  quantityAdded: number
  minimumStock: number
}

export interface NewProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (product: Product | Product[]) => void
  targetProduct?: Product | null
  initialTab?: 'EDIT_DETAILS' | 'ADJUST_STOCK'
  onShowToast?: (title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => void
}

const DEFAULT_ROW_COUNT = 3

const DEFAULT_CATEGORIES: MasterDataItem[] = [
  { id: 'cat-1', label: 'แบบคาน' },
  { id: 'cat-2', label: 'แบบเสา' },
  { id: 'cat-3', label: 'นั่งร้าน' },
  { id: 'cat-4', label: 'อุปกรณ์เสริม' },
  { id: 'cat-5', label: 'ทั่วไป' },
]

const DEFAULT_RENTAL_TYPES: MasterDataItem[] = [
  { id: 'rt-1', label: 'ต่อรอบ', code: 'NORMAL', calculation: 'จำนวนสินค้า × ราคาเช่าต่อรอบ × จำนวนรอบ' },
  { id: 'rt-2', label: 'ต่อวัน', code: 'DAILY', calculation: 'จำนวนสินค้า × ราคาเช่าต่อวัน × จำนวนวัน' },
  { id: 'rt-3', label: 'ขายขาด', code: 'SALE', calculation: 'จำนวนสินค้า × ราคาขายต่อชิ้น' },
]

const DEFAULT_UNITS: MasterDataItem[] = [
  { id: 'unit-1', label: 'แผ่น' },
  { id: 'unit-2', label: 'ต้น' },
  { id: 'unit-3', label: 'ชิ้น' },
  { id: 'unit-4', label: 'ชุด' },
  { id: 'unit-5', label: 'ท่อน' },
  { id: 'unit-6', label: 'อัน' },
]

const CALCULATION_OPTIONS = [
  { value: 'จำนวนสินค้า × ราคาเช่าต่อวัน × จำนวนวัน', label: 'จำนวนสินค้า × ราคาเช่าต่อวัน × จำนวนวัน' },
  { value: 'จำนวนสินค้า × ราคาเช่าต่อรอบ × จำนวนรอบ', label: 'จำนวนสินค้า × ราคาเช่าต่อรอบ × จำนวนรอบ' },
  { value: 'จำนวนสินค้า × ราคาเช่าต่อสัปดาห์ × จำนวนสัปดาห์', label: 'จำนวนสินค้า × ราคาเช่าต่อสัปดาห์ × จำนวนสัปดาห์' },
  { value: 'จำนวนสินค้า × ราคาเช่าต่อเดือน × จำนวนเดือน', label: 'จำนวนสินค้า × ราคาเช่าต่อเดือน × จำนวนเดือน' },
  { value: 'จำนวนสินค้า × ราคาขายต่อชิ้น', label: 'จำนวนสินค้า × ราคาขายต่อชิ้น' },
  { value: 'กำหนดเอง', label: 'กำหนดเอง' },
]

const createEmptyRow = (id?: string): ProductRowItem => ({
  id: id || `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  name: '',
  totalQuantity: 0,
  price: 0,
  lossFee: 0,
  damageFee: 0,
  quantityAdded: 0,
  minimumStock: 3,
})

const createInitialRows = (target?: Product | null, count: number = DEFAULT_ROW_COUNT): ProductRowItem[] => {
  const list: ProductRowItem[] = []
  if (target) {
    list.push({
      id: target.id || 'row-0',
      name: target.name || '',
      totalQuantity: target.totalQuantity ?? 0,
      price:
        target.rentalType === 'DAILY'
          ? target.dailyPrice
          : target.rentalType === 'SALE'
          ? (target.salePrice ?? 0)
          : target.normalPrice,
      lossFee: target.defaultLossFee ?? 0,
      damageFee: target.defaultDamageFee ?? 0,
      quantityAdded: 0,
      minimumStock: target.minimumStock ?? 3,
    })
    return list
  }
  while (list.length < count) {
    list.push(createEmptyRow(`row-${list.length}-${Date.now()}`))
  }
  return list
}

const loadMasterData = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T) : fallback
  } catch {
    return fallback
  }
}

const saveMasterData = (key: string, data: any) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export function NewProductModal({
  isOpen,
  onClose,
  onSave,
  targetProduct = null,
  onShowToast,
}: NewProductModalProps) {
  // Master data state
  const [categories, setCategories] = useState<MasterDataItem[]>(DEFAULT_CATEGORIES)
  const [rentalTypes, setRentalTypes] = useState<MasterDataItem[]>(DEFAULT_RENTAL_TYPES)
  const [units, setUnits] = useState<MasterDataItem[]>(DEFAULT_UNITS)

  // Top Row Form State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedRentalTypeId, setSelectedRentalTypeId] = useState<string>('')
  const [selectedUnitId, setSelectedUnitId] = useState<string>('')
  const [transactionDate, setTransactionDate] = useState<Date | null>(() => new Date())

  // Table rows (pre-populated to fill height)
  const [rows, setRows] = useState<ProductRowItem[]>(() => createInitialRows(null, DEFAULT_ROW_COUNT))

  // Footer state
  const [isAccessory, setIsAccessory] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Settings screen toggle & sub-states
  const [showSettings, setShowSettings] = useState(false)
  const [settingsSubTab, setSettingsSubTab] = useState<'CATEGORY' | 'RENTAL_TYPE' | 'UNIT'>('CATEGORY')
  const [settingsPage, setSettingsPage] = useState<number>(1)
  const itemsPerPage = 5

  // Inline edit/add state for master items
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editItemBuffer, setEditItemBuffer] = useState<{ label: string; calculation: string }>({
    label: '',
    calculation: '',
  })
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [addItemBuffer, setAddItemBuffer] = useState<{ label: string; calculation: string }>({
    label: '',
    calculation: 'จำนวนสินค้า × ราคาเช่าต่อรอบ × จำนวนรอบ',
  })

  const showToast = (title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => {
    if (onShowToast) {
      onShowToast(title, message, type)
    }
  }

  // Initialize or reset on open / targetProduct change
  useEffect(() => {
    if (!isOpen) {
      setShowSettings(false)
      setEditingItemId(null)
      setIsAddingItem(false)
      return
    }

    const initialCats = loadMasterData('pos_master_categories', DEFAULT_CATEGORIES)
    const initialRts = loadMasterData('pos_master_rental_types', DEFAULT_RENTAL_TYPES)
    const initialUnits = loadMasterData('pos_master_units', DEFAULT_UNITS)

    setCategories(initialCats)
    setRentalTypes(initialRts)
    setUnits(initialUnits)
    setShowSettings(false)
    setTransactionDate(new Date())

    if (targetProduct) {
      const isAcc = targetProduct.isAccessory ?? (targetProduct.category === 'อุปกรณ์เสริม')
      setIsAccessory(isAcc)

      const matchedCat = initialCats.find(
        (c) => c.id === targetProduct.categoryId || c.label === targetProduct.category
      )
      const matchedRt = initialRts.find(
        (rt) => rt.id === targetProduct.rentalTypeId || rt.code === targetProduct.rentalType || rt.label === targetProduct.rentalType
      )
      const matchedUnit = initialUnits.find(
        (u) => u.id === targetProduct.unitId || u.label === targetProduct.unit
      )

      setSelectedCategoryId(matchedCat?.id || initialCats[0]?.id || '')
      setSelectedRentalTypeId(matchedRt?.id || initialRts[0]?.id || '')
      setSelectedUnitId(matchedUnit?.id || initialUnits[0]?.id || '')

      setRows(createInitialRows(targetProduct, DEFAULT_ROW_COUNT))
    } else {
      setIsAccessory(false)
      setSelectedCategoryId(initialCats[0]?.id || '')
      setSelectedRentalTypeId(initialRts[0]?.id || '')
      setSelectedUnitId(initialUnits[0]?.id || '')
      setRows(createInitialRows(null, DEFAULT_ROW_COUNT))
    }
  }, [isOpen, targetProduct])

  // Table Row Handlers
  const handleRemoveRow = (id: string) => {
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id)
      return filtered.length > 0 ? filtered : [createEmptyRow()]
    })
  }

  const handleUpdateRow = (id: string, field: keyof ProductRowItem, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  // Master Items Handlers (Inline Edit & Add)
  const handleStartAddItem = () => {
    setEditingItemId(null)
    setAddItemBuffer({
      label: '',
      calculation: 'จำนวนสินค้า × ราคาเช่าต่อรอบ × จำนวนรอบ',
    })
    setIsAddingItem(true)
    setSettingsPage(1)
  }

  const handleStartEditItem = (item: MasterDataItem) => {
    setIsAddingItem(false)
    setEditingItemId(item.id)
    setEditItemBuffer({
      label: item.label,
      calculation: item.calculation || 'จำนวนสินค้า × ราคาเช่าต่อรอบ × จำนวนรอบ',
    })
  }

  const handleCancelInline = () => {
    setEditingItemId(null)
    setIsAddingItem(false)
  }

  const handleSaveNewItem = () => {
    const trimmed = addItemBuffer.label.trim()
    if (!trimmed) {
      showToast('กรุณาระบุชื่อ', 'ชื่อรายการต้องไม่เป็นค่าว่าง', 'ERROR')
      return
    }

    const typeName =
      settingsSubTab === 'CATEGORY'
        ? 'หมวดหมู่'
        : settingsSubTab === 'RENTAL_TYPE'
        ? 'รูปแบบการเช่า'
        : 'หน่วยนับ'

    if (settingsSubTab === 'CATEGORY') {
      const next = [{ id: 'cat-' + Date.now(), label: trimmed }, ...categories]
      setCategories(next)
      saveMasterData('pos_master_categories', next)
    } else if (settingsSubTab === 'RENTAL_TYPE') {
      const next = [
        {
          id: 'rt-' + Date.now(),
          label: trimmed,
          calculation: addItemBuffer.calculation || 'จำนวนสินค้า × ราคาเช่าต่อรอบ × จำนวนรอบ',
          code: 'NORMAL',
        },
        ...rentalTypes,
      ]
      setRentalTypes(next)
      saveMasterData('pos_master_rental_types', next)
    } else if (settingsSubTab === 'UNIT') {
      const next = [{ id: 'unit-' + Date.now(), label: trimmed }, ...units]
      setUnits(next)
      saveMasterData('pos_master_units', next)
    }

    setIsAddingItem(false)
    setAddItemBuffer({ label: '', calculation: 'จำนวนสินค้า × ราคาเช่าต่อรอบ × จำนวนรอบ' })
    showToast(`เพิ่ม${typeName}สำเร็จ`, `บันทึก "${trimmed}" เข้าสู่ระบบเรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleSaveEditItem = () => {
    if (!editingItemId) return
    const trimmed = editItemBuffer.label.trim()
    if (!trimmed) {
      showToast('กรุณาระบุชื่อ', 'ชื่อรายการต้องไม่เป็นค่าว่าง', 'ERROR')
      return
    }

    const typeName =
      settingsSubTab === 'CATEGORY'
        ? 'หมวดหมู่'
        : settingsSubTab === 'RENTAL_TYPE'
        ? 'รูปแบบการเช่า'
        : 'หน่วยนับ'

    if (settingsSubTab === 'CATEGORY') {
      const next = categories.map((c) => (c.id === editingItemId ? { ...c, label: trimmed } : c))
      setCategories(next)
      saveMasterData('pos_master_categories', next)
    } else if (settingsSubTab === 'RENTAL_TYPE') {
      const next = rentalTypes.map((r) =>
        r.id === editingItemId ? { ...r, label: trimmed, calculation: editItemBuffer.calculation } : r
      )
      setRentalTypes(next)
      saveMasterData('pos_master_rental_types', next)
    } else if (settingsSubTab === 'UNIT') {
      const next = units.map((u) => (u.id === editingItemId ? { ...u, label: trimmed } : u))
      setUnits(next)
      saveMasterData('pos_master_units', next)
    }

    setEditingItemId(null)
    showToast(`แก้ไข${typeName}สำเร็จ`, `อัปเดตข้อมูลเป็น "${trimmed}" เรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleDeleteMasterItem = (type: 'CATEGORY' | 'RENTAL_TYPE' | 'UNIT', item: MasterDataItem) => {
    const typeName = type === 'CATEGORY' ? 'หมวดหมู่' : type === 'RENTAL_TYPE' ? 'รูปแบบการเช่า' : 'หน่วยนับ'
    if (confirm(`คุณต้องการลบ${typeName} "${item.label}" ใช่หรือไม่?`)) {
      if (type === 'CATEGORY') {
        const next = categories.filter((c) => c.id !== item.id)
        setCategories(next)
        saveMasterData('pos_master_categories', next)
        if (selectedCategoryId === item.id && next[0]) setSelectedCategoryId(next[0].id)
      } else if (type === 'RENTAL_TYPE') {
        const next = rentalTypes.filter((r) => r.id !== item.id)
        setRentalTypes(next)
        saveMasterData('pos_master_rental_types', next)
        if (selectedRentalTypeId === item.id && next[0]) setSelectedRentalTypeId(next[0].id)
      } else if (type === 'UNIT') {
        const next = units.filter((u) => u.id !== item.id)
        setUnits(next)
        saveMasterData('pos_master_units', next)
        if (selectedUnitId === item.id && next[0]) setSelectedUnitId(next[0].id)
      }
      if (editingItemId === item.id) {
        setEditingItemId(null)
      }
      showToast(`ลบ${typeName}สำเร็จ`, `ทำการลบ "${item.label}" เรียบร้อยแล้ว`, 'SUCCESS')
    }
  }

  // Save Products Handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    const validRows = rows.filter((r) => r.name.trim() !== '')
    if (validRows.length === 0) {
      showToast('กรุณาระบุข้อมูล', 'กรุณาระบุชื่อหรือขนาดสินค้าอย่างน้อย 1 รายการ', 'ERROR')
      return
    }

    try {
      setIsSubmitting(true)
      const selectedCat = categories.find((c) => c.id === selectedCategoryId)
      const selectedRt = rentalTypes.find((rt) => rt.id === selectedRentalTypeId)
      const selectedU = units.find((u) => u.id === selectedUnitId)

      const rentalTypeVal: RentalType = (selectedRt?.code || 'NORMAL') as RentalType
      const categoryName = selectedCat?.label || 'ทั่วไป'
      const unitName = selectedU?.label || 'ชิ้น'
      const now = Date.now()

      const createdProducts: Product[] = validRows.map((r, idx) => {
        const priceVal = Number(r.price) || 0
        const totalQty = Number(r.totalQuantity) || Number(r.quantityAdded) || 0
        const isTarget = targetProduct && validRows.length === 1

        return {
          id: isTarget ? targetProduct.id : `prod-${now}-${idx}`,
          code: isTarget ? targetProduct.code : `P${String(now).slice(-6)}${validRows.length > 1 ? `-${idx + 1}` : ''}`,
          name: r.name.trim(),
          category: categoryName,
          categoryId: selectedCat?.id,
          rentalType: rentalTypeVal,
          rentalTypeId: selectedRt?.id,
          unit: unitName,
          unitId: selectedU?.id,
          normalPrice: rentalTypeVal === 'NORMAL' ? priceVal : 0,
          dailyPrice: rentalTypeVal === 'DAILY' ? priceVal : 0,
          salePrice: rentalTypeVal === 'SALE' ? priceVal : 0,
          costPrice: isTarget ? targetProduct.costPrice : 0,
          defaultDamageFee: Number(r.damageFee) || 0,
          defaultLossFee: Number(r.lossFee) || 0,
          totalQuantity: totalQty,
          availableQuantity: totalQty,
          rentedQuantity: isTarget ? targetProduct.rentedQuantity : 0,
          damagedQuantity: isTarget ? targetProduct.damagedQuantity : 0,
          lostQuantity: isTarget ? targetProduct.lostQuantity : 0,
          minimumStock: Number(r.minimumStock) || 0,
          status: isTarget ? targetProduct.status : 'ACTIVE',
          isAccessory: isAccessory,
          isChargeable: !isAccessory,
          requiresReturn: rentalTypeVal !== 'SALE',
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

  // Master Data Pagination
  const currentSettingsItems =
    settingsSubTab === 'CATEGORY'
      ? categories.slice((settingsPage - 1) * itemsPerPage, settingsPage * itemsPerPage)
      : settingsSubTab === 'RENTAL_TYPE'
      ? rentalTypes.slice((settingsPage - 1) * itemsPerPage, settingsPage * itemsPerPage)
      : units.slice((settingsPage - 1) * itemsPerPage, settingsPage * itemsPerPage)

  const totalSettingsItems =
    settingsSubTab === 'CATEGORY'
      ? categories.length
      : settingsSubTab === 'RENTAL_TYPE'
      ? rentalTypes.length
      : units.length

  const totalSettingsPages = Math.ceil(totalSettingsItems / itemsPerPage) || 1

  if (!isOpen) return null

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
    >
      {/* Modal Header: เพิ่มสินค้าใหม่ [⚙ ตั้งค่าเสริม] [X] */}
      <AppModalHeader
        title={showSettings ? 'ตั้งค่าเสริม (หมวดหมู่ / รูปแบบการเช่า / หน่วยนับ)' : targetProduct ? `แก้ไขสินค้า: ${targetProduct.name}` : 'เพิ่มสินค้าใหม่'}
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
        <AppModalBody className="p-4 sm:p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 font-bold text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับสู่หน้าเพิ่มสินค้า</span>
              </button>
            </div>
            <span className="text-slate-400 text-[11px]">จัดการข้อมูลตัวเลือกหลักที่ใช้ในระบบ</span>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs font-bold gap-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setSettingsSubTab('CATEGORY'); setSettingsPage(1); handleCancelInline(); }}
              className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                settingsSubTab === 'CATEGORY'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold border border-slate-200 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              หมวดหมู่
            </button>
            <button
              type="button"
              onClick={() => { setSettingsSubTab('RENTAL_TYPE'); setSettingsPage(1); handleCancelInline(); }}
              className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                settingsSubTab === 'RENTAL_TYPE'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold border border-slate-200 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              รูปแบบการเช่า
            </button>
            <button
              type="button"
              onClick={() => { setSettingsSubTab('UNIT'); setSettingsPage(1); handleCancelInline(); }}
              className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                settingsSubTab === 'UNIT'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold border border-slate-200 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              หน่วยนับ
            </button>
          </div>

          {/* Section Header & Add Button */}
          <div className="flex items-center justify-between">
            <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
              {settingsSubTab === 'CATEGORY' && 'จัดการหมวดหมู่'}
              {settingsSubTab === 'RENTAL_TYPE' && 'จัดการรูปแบบการเช่า'}
              {settingsSubTab === 'UNIT' && 'จัดการหน่วยนับ'}
            </h5>
            <button
              type="button"
              onClick={handleStartAddItem}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1 transition-colors text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {settingsSubTab === 'CATEGORY' && 'เพิ่มหมวดหมู่'}
                {settingsSubTab === 'RENTAL_TYPE' && 'เพิ่มรูปแบบการเช่า'}
                {settingsSubTab === 'UNIT' && 'เพิ่มหน่วยนับ'}
              </span>
            </button>
          </div>

          {/* Master Items Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 px-3 w-14 text-center border-r border-slate-200 dark:border-slate-700">ลำดับ</th>
                  <th className="py-2 px-3 w-44 border-r border-slate-200 dark:border-slate-700">ชื่อหมวดหมู่</th>
                  <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">รูปแบบการคำนวณ</th>
                  <th className="py-2 px-3 w-28 text-center border-r border-slate-200 dark:border-slate-700">หน่วยนับ</th>
                  <th className="py-2 px-2 w-28 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60 bg-white dark:bg-slate-900">
                {/* Temporary Editable Row for Inline Add */}
                {isAddingItem && (
                  <tr className="bg-blue-50/60 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-900/50 animate-in fade-in duration-150">
                    <td className="py-2 px-3 text-center border-r border-slate-200 dark:border-slate-700">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                        ใหม่
                      </span>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">
                      {settingsSubTab === 'CATEGORY' || settingsSubTab === 'RENTAL_TYPE' ? (
                        <input
                          type="text"
                          value={addItemBuffer.label}
                          onChange={(e) => setAddItemBuffer((prev) => ({ ...prev, label: e.target.value }))}
                          placeholder={settingsSubTab === 'CATEGORY' ? 'ระบุชื่อหมวดหมู่...' : 'ระบุชื่อรูปแบบการเช่า...'}
                          autoFocus
                          className="w-full px-2.5 py-1 rounded-lg border border-blue-400 dark:border-blue-500 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleSaveNewItem()
                            } else if (e.key === 'Escape') {
                              e.preventDefault()
                              handleCancelInline()
                            }
                          }}
                        />
                      ) : (
                        <span className="text-slate-400 text-center block">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">
                      {settingsSubTab === 'RENTAL_TYPE' ? (
                        <CustomSelect
                          value={addItemBuffer.calculation}
                          onChange={(val) => setAddItemBuffer((prev) => ({ ...prev, calculation: String(val) }))}
                          options={CALCULATION_OPTIONS}
                        />
                      ) : (
                        <span className="text-slate-400 text-center block">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">
                      {settingsSubTab === 'UNIT' ? (
                        <input
                          type="text"
                          value={addItemBuffer.label}
                          onChange={(e) => setAddItemBuffer((prev) => ({ ...prev, label: e.target.value }))}
                          placeholder="ระบุชื่อหน่วยนับ..."
                          autoFocus
                          className="w-full px-2.5 py-1 rounded-lg border border-blue-400 dark:border-blue-500 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleSaveNewItem()
                            } else if (e.key === 'Escape') {
                              e.preventDefault()
                              handleCancelInline()
                            }
                          }}
                        />
                      ) : (
                        <span className="text-slate-400 text-center block">-</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={handleSaveNewItem}
                          title="บันทึก"
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>บันทึก</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelInline}
                          title="ยกเลิก"
                          className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>ยกเลิก</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {currentSettingsItems.length === 0 && !isAddingItem ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                      ยังไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  currentSettingsItems.map((item, idx) => {
                    const globalIndex = (settingsPage - 1) * itemsPerPage + idx + 1
                    const isEditing = editingItemId === item.id

                    if (isEditing) {
                      return (
                        <tr key={item.id} className="bg-amber-50/40 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40">
                          <td className="py-2 px-3 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700">
                            {globalIndex}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">
                            {settingsSubTab === 'CATEGORY' || settingsSubTab === 'RENTAL_TYPE' ? (
                              <input
                                type="text"
                                value={editItemBuffer.label}
                                onChange={(e) => setEditItemBuffer((prev) => ({ ...prev, label: e.target.value }))}
                                autoFocus
                                className="w-full px-2.5 py-1 rounded-lg border border-amber-400 dark:border-amber-500 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleSaveEditItem()
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault()
                                    handleCancelInline()
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-slate-400 text-center block">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">
                            {settingsSubTab === 'RENTAL_TYPE' ? (
                              <CustomSelect
                                value={editItemBuffer.calculation}
                                onChange={(val) => setEditItemBuffer((prev) => ({ ...prev, calculation: String(val) }))}
                                options={CALCULATION_OPTIONS}
                              />
                            ) : (
                              <span className="text-slate-400 text-center block">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">
                            {settingsSubTab === 'UNIT' ? (
                              <input
                                type="text"
                                value={editItemBuffer.label}
                                onChange={(e) => setEditItemBuffer((prev) => ({ ...prev, label: e.target.value }))}
                                autoFocus
                                className="w-full px-2.5 py-1 rounded-lg border border-amber-400 dark:border-amber-500 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleSaveEditItem()
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault()
                                    handleCancelInline()
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-slate-400 text-center block">-</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={handleSaveEditItem}
                                title="บันทึก"
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>บันทึก</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelInline}
                                title="ยกเลิก"
                                className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                                <span>ยกเลิก</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    }

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700">
                          {globalIndex}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 truncate border-r border-slate-200 dark:border-slate-700">
                          {settingsSubTab === 'CATEGORY' || settingsSubTab === 'RENTAL_TYPE' ? item.label : '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px] truncate border-r border-slate-200 dark:border-slate-700">
                          {settingsSubTab === 'RENTAL_TYPE' ? (item.calculation || 'จำนวนสินค้า × ราคาเช่าต่อรอบ × จำนวนรอบ') : '-'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 text-center truncate border-r border-slate-200 dark:border-slate-700">
                          {settingsSubTab === 'UNIT' ? item.label : '-'}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditItem(item)}
                              title="แก้ไข"
                              className="p-1 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMasterItem(settingsSubTab, item)}
                              title="ลบ"
                              className="p-1 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 text-slate-700 dark:text-slate-300 hover:text-red-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 font-medium text-[11px]">
                แสดง {totalSettingsItems > 0 ? (settingsPage - 1) * itemsPerPage + 1 : 0} - {Math.min(settingsPage * itemsPerPage, totalSettingsItems)} จาก {totalSettingsItems} รายการ
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSettingsPage((p) => Math.max(1, p - 1))}
                  disabled={settingsPage === 1}
                  className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalSettingsPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setSettingsPage(pg)}
                    className={`px-2 py-0.5 rounded-lg border font-bold text-xs transition-colors cursor-pointer ${
                      pg === settingsPage
                        ? 'border-slate-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-white'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSettingsPage((p) => Math.min(totalSettingsPages, p + 1))}
                  disabled={settingsPage === totalSettingsPages || totalSettingsPages === 0}
                  className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </AppModalBody>
      ) : (
        /* VIEW 2: PRODUCT CREATION FORM */
        <form onSubmit={handleSaveProduct} className="flex flex-col min-h-0">
          <AppModalBody className="p-3 sm:p-4 space-y-3">
            {/* แถวบน: [หมวดหมู่] [รูปแบบการเช่า] [หน่วยนับ] [วันที่ทำรายการ] - อยู่แถวเดียวเสมอ ห้ามแตกบรรทัด */}
            <div className="grid grid-cols-4 gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 shrink-0">
              <div className="min-w-0">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 truncate">
                  หมวดหมู่
                </label>
                <CustomSelect
                  value={selectedCategoryId}
                  onChange={(val) => setSelectedCategoryId(String(val))}
                  options={categories.map((c) => ({ value: c.id, label: c.label }))}
                />
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 truncate">
                  รูปแบบการเช่า
                </label>
                <CustomSelect
                  value={selectedRentalTypeId}
                  onChange={(val) => setSelectedRentalTypeId(String(val))}
                  options={rentalTypes.map((rt) => ({ value: rt.id, label: rt.label }))}
                />
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 truncate">
                  หน่วยนับ
                </label>
                <CustomSelect
                  value={selectedUnitId}
                  onChange={(val) => setSelectedUnitId(String(val))}
                  options={units.map((u) => ({ value: u.id, label: u.label }))}
                />
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 truncate">
                  วันที่ทำรายการ
                </label>
                <CustomDatePicker
                  value={transactionDate}
                  onChange={(val) => setTransactionDate(val)}
                />
              </div>
            </div>

            {/* ตาราง: | ชื่อ/ขนาด | ยอดรวม | ราคาเช่า | สูญหาย | ชำรุด | จำนวนที่เพิ่ม | เกณฑ์เตือนขั้นต่ำ | จัดการ | */}
            <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[720px] text-xs">
                  <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs shadow-xs">
                    <tr>
                      {/* ชื่อ/ขนาด ใช้เกณฑ์ 230px */}
                      <th className="px-3 py-2.5 text-left border-b border-slate-200 dark:border-slate-700 min-w-[230px]">
                        ชื่อ/ขนาด
                      </th>
                      <th className="px-2 py-2.5 text-center border-b border-slate-200 dark:border-slate-700 w-20 sm:w-24">
                        ยอดรวม
                      </th>
                      <th className="px-2 py-2.5 text-center border-b border-slate-200 dark:border-slate-700 w-20 sm:w-24">
                        ราคาเช่า
                      </th>
                      <th className="px-2 py-2.5 text-center text-red-600 dark:text-red-400 border-b border-slate-200 dark:border-slate-700 w-20 sm:w-24">
                        สูญหาย
                      </th>
                      <th className="px-2 py-2.5 text-center text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-700 w-20 sm:w-24">
                        ชำรุด
                      </th>
                      <th className="px-2 py-2.5 text-center text-emerald-700 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-700 w-24 sm:w-28">
                        จำนวนที่เพิ่ม
                      </th>
                      <th className="px-2 py-2.5 text-center border-b border-slate-200 dark:border-slate-700 w-24 sm:w-28">
                        เกณฑ์เตือนขั้นต่ำ
                      </th>
                      <th className="px-2 py-2.5 text-center border-b border-slate-200 dark:border-slate-700 w-12 sm:w-14">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className="h-11 sm:h-12 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* ชื่อ/ขนาด */}
                        <td className="px-3 py-1.5 align-middle">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleUpdateRow(row.id, 'name', e.target.value)}
                            placeholder="ระบุชื่อหรือขนาดสินค้า..."
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </td>

                        {/* ยอดรวม */}
                        <td className="px-2 py-1.5 text-center align-middle">
                          <NumericInput
                            value={row.totalQuantity || ''}
                            placeholder="0"
                            onChange={(val) => handleUpdateRow(row.id, 'totalQuantity', val === '' ? 0 : val)}
                            min={0}
                            allowDecimals={false}
                            className="w-full px-1.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </td>

                        {/* ราคาเช่า */}
                        <td className="px-2 py-1.5 text-center align-middle">
                          <NumericInput
                            value={row.price || ''}
                            placeholder="0"
                            onChange={(val) => handleUpdateRow(row.id, 'price', val === '' ? 0 : val)}
                            min={0}
                            className="w-full px-1.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>

                        {/* สูญหาย */}
                        <td className="px-2 py-1.5 text-center align-middle">
                          <NumericInput
                            value={row.lossFee || ''}
                            placeholder="0"
                            onChange={(val) => handleUpdateRow(row.id, 'lossFee', val === '' ? 0 : val)}
                            min={0}
                            className="w-full px-1.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
                          />
                        </td>

                        {/* ชำรุด */}
                        <td className="px-2 py-1.5 text-center align-middle">
                          <NumericInput
                            value={row.damageFee || ''}
                            placeholder="0"
                            onChange={(val) => handleUpdateRow(row.id, 'damageFee', val === '' ? 0 : val)}
                            min={0}
                            className="w-full px-1.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </td>

                        {/* จำนวนที่เพิ่ม */}
                        <td className="px-2 py-1.5 text-center align-middle">
                          <NumericInput
                            value={row.quantityAdded || ''}
                            placeholder="0"
                            onChange={(val) => {
                              const num = val === '' ? 0 : Number(val)
                              handleUpdateRow(row.id, 'quantityAdded', num)
                              if (row.totalQuantity === 0 && num > 0) {
                                handleUpdateRow(row.id, 'totalQuantity', num)
                              }
                            }}
                            min={0}
                            allowDecimals={false}
                            className="w-full px-1.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </td>

                        {/* เกณฑ์เตือนขั้นต่ำ */}
                        <td className="px-2 py-1.5 text-center align-middle">
                          <NumericInput
                            value={row.minimumStock || ''}
                            placeholder="3"
                            onChange={(val) => handleUpdateRow(row.id, 'minimumStock', val === '' ? 0 : val)}
                            min={0}
                            allowDecimals={false}
                            className="w-full px-1.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </td>

                        {/* จัดการ: มีแค่ปุ่ม X สำหรับลบแถว */}
                        <td className="px-2 py-1.5 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors mx-auto flex items-center justify-center cursor-pointer"
                            title="ลบแถว"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AppModalBody>

          {/* Modal Footer: มีเส้นแบ่งด้านบน | ซ้าย: เป็นอุปกรณ์เสริม | ขวา: [ยกเลิก] [บันทึกข้อมูลสินค้า] */}
          <AppModalFooter>
            <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
              {/* ซ้าย: checkbox "เป็นอุปกรณ์เสริม" */}
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAccessory}
                  onChange={(e) => setIsAccessory(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <span>เป็นอุปกรณ์เสริม</span>
              </label>

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
