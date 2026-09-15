'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  ClipboardList,
  Sliders,
  MapPin,
  Edit,
  History,
  User,
  Phone,
  CheckCircle2,
  RotateCcw,
  Shuffle,
  Trash2,
  PackagePlus,
  Settings,
  Layers,
} from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'
import { ActionButton } from '@/components/common/ActionButton'
import { Product, Unit, RentalType } from '@/lib/types/rental-pos'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { useToast } from '@/components/common/Toast'
import { ProductStockCountView } from '@/components/products/ProductStockCountView'
import { NewProductModal, ProductRowItem } from '@/components/products/NewProductModal'
import { DamagedRestoreModal } from '@/components/products/DamagedRestoreModal'
import { DamagedTransformModal } from '@/components/products/DamagedTransformModal'
import { ProductListView } from '@/components/products/ProductListView'
import { ProductCreateView, ProductCreateDraftRow, createInitialDraftRows } from '@/components/products/ProductCreateView'
import { ProductSettingsView } from '@/components/products/ProductSettingsView'
import { logger } from '@/lib/utils/logger'
import { loadProducts as loadStorageProducts, saveProducts as saveStorageProducts, deleteProduct as deleteStorageProduct } from '@/lib/product-storage'
import {
  loadCategories,
  addCategory,
  loadCompositeRules,
  addCompositeRule,
  ProductCategoryItem,
  CategoryCompositeRule,
  loadCategoryRules,
  addCategoryRule,
  ProductCategoryRule,
  CalculationType,
  CALCULATION_OPTIONS,
  CALCULATION_LONG_LABELS,
} from '@/lib/category-rules-storage'
import { loadUnits, addUnit } from '@/lib/unit-storage'
import { NumericInput } from '@/components/common/NumericInput'
import { CustomDatePicker, parseLocalDate, getLocalDateString } from '@/components/common/CustomDatePicker'
import { useAuth } from '@/lib/contexts/AuthContext'
import { recordAuditLog, generateCorrelationId } from '@/lib/audit-storage'
import { getDefaultMinimumStock } from '@/lib/settings-storage'

export default function ProductsPage() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).map((c) => ({ id: c, label: c }))
  const [isLoading, setIsLoading] = useState(false)

  // Product Delete State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const loadProducts = React.useCallback(async () => {
    setProducts(loadStorageProducts())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [activeViewTab, setActiveViewTab] = useState<'ALL' | 'DAMAGED'>('ALL')

  // Main 4-Tab Workspace State
  const [activeMainTab, setActiveMainTab] = useState<'LIST' | 'ADD' | 'SETTINGS' | 'COUNT'>('LIST')

  // Master Units, Categories & Composite Rules
  const [masterUnits, setMasterUnits] = useState<Unit[]>([])
  const [productCategories, setProductCategories] = useState<ProductCategoryItem[]>([])
  const [compositeRules, setCompositeRules] = useState<CategoryCompositeRule[]>([])
  const [categoryRules, setCategoryRules] = useState<ProductCategoryRule[]>([])

  useEffect(() => {
    setMasterUnits(loadUnits())
    setProductCategories(loadCategories())
    setCompositeRules(loadCompositeRules())
    setCategoryRules(loadCategoryRules())
  }, [])

  const [defaultMinStock, setDefaultMinStock] = useState<number>(() => getDefaultMinimumStock())

  useEffect(() => {
    const handleSettingsChanged = () => setDefaultMinStock(getDefaultMinimumStock())
    window.addEventListener('app_settings_changed', handleSettingsChanged)
    return () => window.removeEventListener('app_settings_changed', handleSettingsChanged)
  }, [])

  // Persistent Draft State for ADD Tab (Survives tab switches!)
  const [createDraftRows, setCreateDraftRows] = useState<ProductCreateDraftRow[]>([])
  const [isCreatingSubmitting, setIsCreatingSubmitting] = useState(false)

  // Initialize draft rows (10 rows) if empty once category rules & units load
  useEffect(() => {
    if (createDraftRows.length === 0 && (categoryRules.length > 0 || masterUnits.length > 0)) {
      setCreateDraftRows(createInitialDraftRows('', ''))
    }
  }, [categoryRules, masterUnits, createDraftRows.length])

  // Clear draft helper
  const handleClearDraft = () => {
    setCreateDraftRows(createInitialDraftRows('', ''))
    showToast('ล้างแบบร่างเรียบร้อย', 'รีเซ็ตข้อมูลในแบบฟอร์มเพิ่มสินค้าแล้ว', 'INFO')
  }

  // Submit handler for ADD Tab
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isCreatingSubmitting) return

    const validRows = createDraftRows.filter((r) => r.name.trim() !== '')
    if (validRows.length === 0) {
      showToast('กรุณาระบุข้อมูล', 'กรุณาระบุชื่อสินค้าอย่างน้อย 1 รายการ', 'ERROR')
      return
    }

    try {
      setIsCreatingSubmitting(true)
      const now = Date.now()

      const createdProducts: Product[] = validRows.map((r, idx) => {
        const matchedCat = productCategories.find((c) => c.id === r.categoryId)
        const categoryName = matchedCat?.name || r.categoryId || 'ทั่วไป'
        const calcType = (r.calculationType || 'PER_ROUND') as CalculationType
        const calcLabel = CALCULATION_LONG_LABELS[calcType] || 'ต่อรอบ'

        // Determine Unit: lookup from masterUnits by r.unitId or fallback
        const matchedUnit = masterUnits.find((u) => u.id === r.unitId) || masterUnits[0]
        const finalUnitName = matchedUnit?.name || 'ชิ้น'
        const finalUnitId = matchedUnit?.id

        // Single Price field mapping based on calculationType
        const priceNum =
          r.price !== null && r.price !== undefined && (r.price as any) !== ''
            ? Number(r.price)
            : null

        let rentPriceNum: number | null = null
        let salePriceNum: number | null = null
        let normalPriceNum = 0
        let dailyPriceNum = 0
        let rentalTypeVal: RentalType = 'NORMAL'
        let isChargeableVal = true
        let requiresReturnVal = true

        if (calcType === 'NO_CHARGE') {
          rentPriceNum = 0
          salePriceNum = null
          normalPriceNum = 0
          dailyPriceNum = 0
          rentalTypeVal = 'NORMAL'
          isChargeableVal = false
          requiresReturnVal = true
        } else if (calcType === 'SALE') {
          salePriceNum = priceNum
          rentalTypeVal = 'SALE'
          isChargeableVal = true
          requiresReturnVal = false
        } else if (calcType === 'PER_DAY') {
          rentPriceNum = priceNum
          dailyPriceNum = priceNum != null ? priceNum : 0
          normalPriceNum = priceNum != null ? priceNum : 0
          rentalTypeVal = 'DAILY'
          isChargeableVal = true
          requiresReturnVal = true
        } else {
          // PER_ROUND or default
          rentPriceNum = priceNum
          normalPriceNum = priceNum != null ? priceNum : 0
          dailyPriceNum = priceNum != null ? priceNum : 0
          rentalTypeVal = 'NORMAL'
          isChargeableVal = true
          requiresReturnVal = true
        }

        const totalQty = Number(r.quantityAdded) || 0
        const costPriceNum = r.costPrice != null ? Number(r.costPrice) : 0
        const damageFeeNum = r.damageFee != null ? Number(r.damageFee) : 0
        const lossFeeNum = r.lossFee != null ? Number(r.lossFee) : 0
        const minStockNum = defaultMinStock

        const dateStr = r.addedDate
          ? r.addedDate.toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10)

        return {
          id: `prod-${now}-${idx}`,
          code: `P${String(now).slice(-6)}${validRows.length > 1 ? `-${idx + 1}` : ''}`,
          name: r.name.trim(),
          category: categoryName,
          categoryId: matchedCat?.id,
          categoryRuleId: matchedCat?.id,
          calculationType: calcType,
          calculationLabel: calcLabel,
          unit: finalUnitName,
          unitId: finalUnitId,
          rentPrice: rentPriceNum,
          salePrice: salePriceNum,
          normalPrice: normalPriceNum,
          dailyPrice: dailyPriceNum,
          rentalType: rentalTypeVal,
          rentalTypeId: matchedCat?.id,
          costPrice: costPriceNum,
          defaultDamageFee: damageFeeNum,
          defaultLossFee: lossFeeNum,
          totalQuantity: totalQty,
          availableQuantity: totalQty,
          rentedQuantity: 0,
          damagedQuantity: 0,
          lostQuantity: 0,
          reservedQuantity: 0,
          maintenanceQuantity: 0,
          minimumStock: minStockNum,
          status: 'ACTIVE',
          isAccessory: r.isAccessory ?? false,
          isChargeable: isChargeableVal,
          requiresReturn: requiresReturnVal,
          createdAt: dateStr,
        }
      })

      const correlationId = generateCorrelationId()
      const actorUserId = user?.userId || 'system'
      const actorDisplayName = user?.displayName || 'ระบบ'

      setProducts((prev) => {
        const next = [...createdProducts, ...prev]
        saveStorageProducts(next)
        return next
      })

      createdProducts.forEach((item) => {
        recordAuditLog({
          userId: actorUserId,
          displayName: actorDisplayName,
          action: 'PRODUCT_CREATE',
          entityType: 'PRODUCT',
          entityId: item.id,
          before: null,
          after: { code: item.code, name: item.name, totalQuantity: item.totalQuantity },
          correlationId,
        })
      })

      showToast(
        'บันทึกข้อมูลสินค้าสำเร็จ',
        `บันทึกข้อมูลสินค้า ${createdProducts.length} รายการเรียบร้อยแล้ว`,
        'SUCCESS'
      )

      // Reset Draft to 10 rows after success
      setCreateDraftRows(createInitialDraftRows('', ''))

      // Return to LIST view
      setActiveMainTab('LIST')
    } catch (err: any) {
      showToast('ไม่สามารถบันทึกสินค้าได้', err?.message || 'โปรดตรวจสอบข้อมูลสินค้า', 'ERROR')
    } finally {
      setIsCreatingSubmitting(false)
    }
  }

  // Quick Add Unit from Create View
  const handleQuickAddUnit = (name: string): string => {
    try {
      const updated = addUnit(name)
      setMasterUnits(updated)
      showToast('เพิ่มหน่วยนับสำเร็จ', `เพิ่มหน่วยนับ "${name}" เรียบร้อยแล้ว`, 'SUCCESS')
      const newUnit = updated.find((u) => u.name === name)
      return newUnit?.id || updated[updated.length - 1]?.id
    } catch (err: any) {
      showToast('ไม่สามารถเพิ่มหน่วยนับได้', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
      return ''
    }
  }

  // Quick Add Category from Create View
  const handleQuickAddCategory = (name: string, calcType: CalculationType, unitId: string): string => {
    try {
      const updatedCats = addCategory(name)
      setProductCategories(updatedCats)
      const newCat = updatedCats.find((c) => c.name === name)
      const newCatId = newCat?.id || updatedCats[updatedCats.length - 1]?.id

      if (newCatId) {
        const updatedComp = addCompositeRule({
          categoryId: newCatId,
          calculationType: calcType,
          unitId: unitId || undefined,
        })
        setCompositeRules(updatedComp)
      }

      showToast('เพิ่มหมวดหมู่สำเร็จ', `เพิ่มหมวดหมู่ "${name}" เรียบร้อยแล้ว`, 'SUCCESS')
      return newCatId || ''
    } catch (err: any) {
      showToast('ไม่สามารถเพิ่มหมวดหมู่ได้', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
      return ''
    }
  }

  // Selected Product for detail drawer / history modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeDrawerTab, setActiveDrawerTab] = useState<'CURRENT' | 'HISTORY' | 'OVERVIEW'>('CURRENT')

  // Unified Product & Stock Management Modal State (kept for direct Edit if needed)
  const [showManageModal, setShowManageModal] = useState(false)
  const [activeManageTab, setActiveManageTab] = useState<'EDIT_DETAILS' | 'ADJUST_STOCK'>('EDIT_DETAILS')
  const [targetManageProduct, setTargetManageProduct] = useState<Product | null>(null)

  // Damaged Stock Management Modals State
  const [restoreTargetProduct, setRestoreTargetProduct] = useState<Product | null>(null)
  const [transformTargetProduct, setTransformTargetProduct] = useState<Product | null>(null)


  // Delete product confirmation handler
  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return
    const trimmedReason = deleteReason.trim()
    if (!trimmedReason) {
      showToast('กรุณาระบุเหตุผล', 'จำเป็นต้องระบุเหตุผลในการลบหรือระงับสินค้า', 'ERROR')
      return
    }

    setIsDeleting(true)
    try {
      const correlationId = generateCorrelationId()
      const actorUserId = user?.userId || 'system'
      const actorDisplayName = user?.displayName || 'ระบบ'

      const updated = deleteStorageProduct(productToDelete.id)
      setProducts(updated)

      recordAuditLog({
        userId: actorUserId,
        displayName: actorDisplayName,
        action: 'PRODUCT_DELETE',
        entityType: 'PRODUCT',
        entityId: productToDelete.id,
        before: {
          code: productToDelete.code,
          name: productToDelete.name,
          category: productToDelete.category,
          totalQuantity: productToDelete.totalQuantity,
          availableQuantity: productToDelete.availableQuantity,
          rentedQuantity: productToDelete.rentedQuantity,
        },
        after: null,
        reason: trimmedReason,
        correlationId,
      })

      showToast('ลบสินค้าสำเร็จ', `ลบรายการ "${productToDelete.name}" เรียบร้อยแล้ว`, 'SUCCESS')
      setDeleteReason('')
      setProductToDelete(null)
    } catch (err: any) {
      logger.error('Failed to delete product:', err)
      showToast('ไม่สามารถลบสินค้าได้', err?.message || 'เกิดข้อผิดพลาดในการลบสินค้า', 'ERROR')
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtered Products (Search by product name only, no product code)
  const filteredProducts = products.filter((p) => {
    if (activeViewTab === 'DAMAGED' && p.damagedQuantity <= 0) {
      return false
    }
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'LOW_STOCK' && defaultMinStock > 0 && p.availableQuantity <= defaultMinStock) ||
      (statusFilter === 'OUT_OF_STOCK' && p.availableQuantity === 0) ||
      (statusFilter === 'ACTIVE' && p.status === 'ACTIVE')
    return matchesSearch && matchesCat && matchesStatus
  })

  // Stock Summary Metrics
  const totalItems = products.reduce((acc, p) => acc + p.totalQuantity, 0)
  const totalAvailable = products.reduce((acc, p) => acc + p.availableQuantity, 0)
  const totalRented = products.reduce((acc, p) => acc + p.rentedQuantity, 0)
  const totalDamaged = products.reduce((acc, p) => acc + p.damagedQuantity, 0)
  const totalLost = products.reduce((acc, p) => acc + p.lostQuantity, 0)
  const lowStockCount = products.filter((p) => defaultMinStock > 0 && p.availableQuantity <= defaultMinStock).length
  const damagedProductsCount = products.filter((p) => p.damagedQuantity > 0).length

  // Handlers
  const handleOpenAdd = () => {
    setTargetManageProduct(null)
    setActiveManageTab('EDIT_DETAILS')
    setShowManageModal(true)
  }

  const handleOpenManageProduct = (product: Product, initialTab: 'EDIT_DETAILS' | 'ADJUST_STOCK' = 'EDIT_DETAILS') => {
    setTargetManageProduct(product)
    setActiveManageTab(initialTab)
    setShowManageModal(true)
  }

  // Stock Count Handlers
  const handleOpenStockCount = () => {
    setActiveMainTab('COUNT')
  }

  const openProductHistory = (product: Product, initialTab: 'CURRENT' | 'HISTORY' | 'OVERVIEW' = 'CURRENT') => {
    setSelectedProduct(product)
    setIsEditingInline(false)
    setActiveDrawerTab(initialTab)
  }


  // Inline Edit State inside selectedProduct modal
  const [isEditingInline, setIsEditingInline] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    categoryRuleId: '',
    category: '',
    calculationType: 'PER_ROUND' as string,
    calculationLabel: '',
    unit: '',
    rentPrice: '' as string,
    salePrice: '' as string,
    createdAt: '',
  })

  const startInlineEdit = (p: Product) => {
    const rules = loadCategoryRules()
    setCategoryRules(rules)
    const matched = rules.find((r) => r.id === p.categoryRuleId || r.name === p.category)
    setEditForm({
      name: p.name,
      categoryRuleId: matched ? matched.id : p.categoryRuleId || '',
      category: matched ? matched.name : p.category,
      calculationType: matched ? matched.calculationType : (p.calculationType || (p.rentalType === 'DAILY' ? 'PER_DAY' : 'PER_ROUND')),
      calculationLabel: matched ? matched.calculationLabel : (p.calculationLabel || (p.rentalType === 'DAILY' ? 'คำนวณตามวันใช้งานจริง' : 'คำนวณเหมาต่อรอบ/ครั้ง')),
      unit: matched ? (matched.unit || matched.unitName || '') : p.unit,
      rentPrice: p.rentPrice !== undefined && p.rentPrice !== null ? String(p.rentPrice) : '',
      salePrice: p.salePrice !== undefined && p.salePrice !== null ? String(p.salePrice) : '',
      createdAt: p.createdAt || (p as any).created_at || getLocalDateString(new Date()),
    })
    setIsEditingInline(true)
  }

  const handleSaveInlineEdit = () => {
    if (!selectedProduct) return
    if (!editForm.name.trim()) {
      showToast('กรุณาระบุชื่อสินค้า', 'ชื่อสินค้าต้องไม่เว้นว่าง', 'ERROR')
      return
    }
    if (!editForm.category.trim()) {
      showToast('กรุณาเลือกหมวดหมู่', 'จำเป็นต้องระบุหมวดหมู่สินค้า', 'ERROR')
      return
    }

    const rentVal = editForm.rentPrice !== '' ? Number(editForm.rentPrice) : null
    const saleVal = editForm.salePrice !== '' ? Number(editForm.salePrice) : null

    const updated: Product = {
      ...selectedProduct,
      name: editForm.name.trim(),
      category: editForm.category,
      categoryRuleId: editForm.categoryRuleId,
      calculationType: editForm.calculationType,
      calculationLabel: editForm.calculationLabel,
      unit: editForm.unit || selectedProduct.unit,
      rentPrice: rentVal,
      salePrice: saleVal,
      rentalType: editForm.calculationType === 'PER_DAY' ? 'DAILY' : 'NORMAL',
      normalPrice: rentVal ?? selectedProduct.normalPrice,
      dailyPrice: rentVal ?? selectedProduct.dailyPrice,
      createdAt: editForm.createdAt,
    }

    const next = products.map((p) => (p.id === updated.id ? updated : p))
    saveStorageProducts(next)
    setProducts(next)
    setSelectedProduct(updated)
    setIsEditingInline(false)

    const correlationId = generateCorrelationId()
    const actorUserId = user?.userId || 'system'
    const actorDisplayName = user?.displayName || 'ระบบ'

    recordAuditLog({
      userId: actorUserId,
      displayName: actorDisplayName,
      action: 'PRODUCT_UPDATE',
      entityType: 'PRODUCT',
      entityId: updated.id,
      before: {
        name: selectedProduct.name,
        category: selectedProduct.category,
        rentPrice: selectedProduct.rentPrice,
        salePrice: selectedProduct.salePrice,
        unit: selectedProduct.unit,
      },
      after: {
        name: updated.name,
        category: updated.category,
        rentPrice: updated.rentPrice,
        salePrice: updated.salePrice,
        unit: updated.unit,
      },
      correlationId,
    })

    showToast('บันทึกสำเร็จ', `อัปเดตข้อมูลสินค้า "${updated.name}" เรียบร้อยแล้ว`, 'SUCCESS')
  }

  return (
    <div className="h-full min-h-0 min-w-0 flex flex-col overflow-hidden p-2.5 sm:p-3 md:p-4 gap-2.5 sm:gap-3">
      {/* AREA 1: สรุปภาพรวม + เมนูนำทางหลัก */}
      <div className="shrink-0 flex flex-col gap-2 sm:gap-2.5">
        {/* Stock Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-2.5">
          <div
            onClick={() => setActiveViewTab('ALL')}
            className={`p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-2xl border shadow-xs cursor-pointer transition-all ${
              activeViewTab === 'ALL'
                ? 'border-slate-800 dark:border-slate-400 ring-2 ring-slate-400/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            <span className="text-[11px] text-slate-500 font-semibold block">สต็อกรวม</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5 block">{totalItems.toLocaleString()}</span>
          </div>
          <div className="p-2.5 sm:p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 shadow-xs">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block">พร้อมให้เช่า</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{totalAvailable.toLocaleString()}</span>
          </div>
          <div className="p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 shadow-xs">
            <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold block">อยู่ระหว่างเช่า</span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5 block">{totalRented.toLocaleString()}</span>
          </div>
          <div
            onClick={() => setActiveViewTab('DAMAGED')}
            className={`p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border shadow-xs cursor-pointer transition-all ${
              activeViewTab === 'DAMAGED'
                ? 'border-amber-500 ring-2 ring-amber-500/30'
                : 'border-amber-200/60 dark:border-amber-900/40 hover:border-amber-400'
            }`}
          >
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold block">ชำรุด</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{totalDamaged.toLocaleString()}</span>
          </div>
          <div className="p-2.5 sm:p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200/60 dark:border-red-900/40 shadow-xs">
            <span className="text-[11px] text-red-700 dark:text-red-300 font-semibold block">สูญหาย</span>
            <span className="text-lg font-black text-red-600 dark:text-red-400 mt-0.5 block">{totalLost.toLocaleString()}</span>
          </div>
          <div className="p-2.5 sm:p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200/60 dark:border-purple-900/40 shadow-xs">
            <span className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold block">สินค้าใกล้หมด</span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5 block">{lowStockCount.toLocaleString()}</span>
          </div>
        </div>

        {/* แถบปุ่มแท็บหลัก [ รายการสินค้า | เพิ่มสินค้า | ตั้งค่าเสริม | นับสต็อก ] */}
        <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5 overflow-x-auto max-w-full shrink-0">
          <ActionButton
            onClick={() => setActiveMainTab('LIST')}
            variant={activeMainTab === 'LIST' ? 'active' : 'ghost'}
            icon={<Layers className="text-blue-600 dark:text-blue-400" />}
            badge={
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold">
                {products.length}
              </span>
            }
          >
            รายการสินค้า
          </ActionButton>

          <ActionButton
            onClick={() => setActiveMainTab('ADD')}
            variant={activeMainTab === 'ADD' ? 'primary' : 'ghost'}
            className={activeMainTab !== 'ADD' ? 'hover:text-emerald-600 dark:hover:text-emerald-400' : ''}
            icon={<PackagePlus />}
            badge={
              createDraftRows.some((r) => r.name.trim() !== '') ? (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="มีแบบร่างค้างอยู่" />
              ) : undefined
            }
          >
            เพิ่มสินค้า
          </ActionButton>

          <ActionButton
            onClick={() => setActiveMainTab('SETTINGS')}
            variant={activeMainTab === 'SETTINGS' ? 'active' : 'ghost'}
            icon={<Settings className="text-purple-600 dark:text-purple-400" />}
          >
            ตั้งค่าเสริม
          </ActionButton>

          <ActionButton
            onClick={() => setActiveMainTab('COUNT')}
            variant={activeMainTab === 'COUNT' ? 'active' : 'ghost'}
            icon={<ClipboardList className="text-purple-600 dark:text-purple-400" />}
          >
            นับสต็อก
          </ActionButton>
        </div>
      </div>

      {/* AREA 2: พื้นที่ทำงานของแท็บที่เลือก */}
      {activeMainTab === 'LIST' && (
        <ProductListView
          products={filteredProducts}
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          activeViewTab={activeViewTab}
          setActiveViewTab={setActiveViewTab}
          categories={categories}
          damagedProductsCount={damagedProductsCount}
          defaultMinStock={defaultMinStock}
          onRestoreDamaged={(p) => setRestoreTargetProduct(p)}
          onTransformDamaged={(p) => setTransformTargetProduct(p)}
          onOpenHistory={(p) => openProductHistory(p, 'CURRENT')}
          onDeleteProduct={(p) => setProductToDelete(p)}
        />
      )}

      {activeMainTab === 'ADD' && (
        <ProductCreateView
          rows={createDraftRows}
          setRows={setCreateDraftRows}
          categories={productCategories}
          compositeRules={compositeRules}
          categoryRules={categoryRules}
          units={masterUnits}
          isSubmitting={isCreatingSubmitting}
          onSubmit={handleCreateSubmit}
          onClearDraft={handleClearDraft}
          onNavigateToSettings={() => setActiveMainTab('SETTINGS')}
          onQuickAddCategory={handleQuickAddCategory}
          onQuickAddUnit={handleQuickAddUnit}
        />
      )}

      {activeMainTab === 'SETTINGS' && (
        <ProductSettingsView
          categories={productCategories}
          setCategories={setProductCategories}
          compositeRules={compositeRules}
          setCompositeRules={setCompositeRules}
          categoryRules={categoryRules}
          setCategoryRules={setCategoryRules}
          masterUnits={masterUnits}
          setMasterUnits={setMasterUnits}
          allProducts={products}
          onShowToast={(title, msg, type) => showToast(title, msg, type)}
        />
      )}

      {activeMainTab === 'COUNT' && (
        <ProductStockCountView
          products={products}
          onSuccess={(updated) => {
            saveStorageProducts(updated)
            setProducts(updated)
            const correlationId = generateCorrelationId()
            const actorUserId = user?.userId || 'system'
            const actorDisplayName = user?.displayName || 'ระบบ'
            recordAuditLog({
              userId: actorUserId,
              displayName: actorDisplayName,
              action: 'STOCK_COUNT_UPDATE',
              entityType: 'STOCK',
              entityId: 'ALL_PRODUCTS',
              before: { totalProducts: products.length },
              after: { totalProducts: updated.length },
              correlationId,
            })
          }}
          onNavigateToList={() => setActiveMainTab('LIST')}
        />
      )}

      {/* Centralized New / Manage Product Modal */}
      <NewProductModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        targetProduct={targetManageProduct}
        initialTab={activeManageTab}
        onSave={(saved) => {
          const correlationId = generateCorrelationId()
          const actorUserId = user?.userId || 'system'
          const actorDisplayName = user?.displayName || 'ระบบ'

          if (Array.isArray(saved)) {
            setProducts((prev) => {
              const savedIds = new Set(saved.map((s) => s.id))
              const next = [...saved, ...prev.filter((p) => !savedIds.has(p.id))]
              saveStorageProducts(next)
              return next
            })
            saved.forEach((item) => {
              recordAuditLog({
                userId: actorUserId,
                displayName: actorDisplayName,
                action: 'PRODUCT_CREATE',
                entityType: 'PRODUCT',
                entityId: item.id,
                before: null,
                after: { code: item.code, name: item.name, totalQuantity: item.totalQuantity },
                correlationId,
              })
            })
          } else {
            setProducts((prev) => {
              const exists = prev.some((p) => p.id === saved.id)
              let next: Product[]
              if (exists) {
                next = prev.map((p) => (p.id === saved.id ? saved : p))
              } else {
                next = [saved, ...prev]
              }
              saveStorageProducts(next)
              return next
            })
            setSelectedProduct((prev) => (prev && prev.id === saved.id ? saved : prev))
            recordAuditLog({
              userId: actorUserId,
              displayName: actorDisplayName,
              action: 'PRODUCT_UPDATE',
              entityType: 'PRODUCT',
              entityId: saved.id,
              before: targetManageProduct ? { name: targetManageProduct.name, totalQuantity: targetManageProduct.totalQuantity } : null,
              after: { name: saved.name, totalQuantity: saved.totalQuantity },
              correlationId,
            })
          }
        }}
        onShowToast={(title, msg, type) => showToast(title, msg, type)}
      />

      {/* Damaged Restore Modal */}
      <DamagedRestoreModal
        isOpen={!!restoreTargetProduct}
        onClose={() => setRestoreTargetProduct(null)}
        product={restoreTargetProduct}
        onSuccess={({ product: updatedP }) => {
          setProducts((prev) => {
            const next = prev.map((p) => (p.id === updatedP.id ? updatedP : p))
            saveStorageProducts(next)
            return next
          })
          if (selectedProduct?.id === updatedP.id) {
            setSelectedProduct(updatedP)
          }
        }}
        onShowToast={(title, msg, type) => showToast(title, msg, type)}
      />

      {/* Damaged Transform Modal */}
      <DamagedTransformModal
        isOpen={!!transformTargetProduct}
        onClose={() => setTransformTargetProduct(null)}
        sourceProduct={transformTargetProduct}
        allProducts={products}
        onSuccess={({ sourceProduct: updatedSource, targetProduct: updatedTarget }) => {
          setProducts((prev) => {
            const next = prev.map((p) => {
              if (p.id === updatedSource.id) return updatedSource
              if (p.id === updatedTarget.id) return updatedTarget
              return p
            })
            saveStorageProducts(next)
            return next
          })
          if (selectedProduct?.id === updatedSource.id) setSelectedProduct(updatedSource)
          if (selectedProduct?.id === updatedTarget.id) setSelectedProduct(updatedTarget)
        }}
        onShowToast={(title, msg, type) => showToast(title, msg, type)}
      />

      {/* PRODUCT RENTAL HISTORY & ACTIVE HOLDERS MODAL */}
      <AppModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        size="xl"
      >
        {selectedProduct && (
          <>
            <AppModalHeader
              onClose={() => {
                setSelectedProduct(null)
                setIsEditingInline(false)
              }}
              title="ข้อมูลสินค้า"
            />

            <AppModalBody className="p-0 space-y-0">
              {/* Paper-head style Product Info Card & Inline Edit Form */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80">
                {!isEditingInline ? (
                  /* Display Mode: Paper-head card */
                  <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
                            {selectedProduct.category}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            หน่วยนับ: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedProduct.unit}</strong>
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 pt-0.5">
                          {selectedProduct.name}
                        </h3>
                      </div>

                      {/* Edit Button (Pencil Icon) */}
                      <button
                        type="button"
                        onClick={() => startInlineEdit(selectedProduct)}
                        className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 hover:border-amber-300 transition-colors cursor-pointer shrink-0"
                        title="แก้ไขข้อมูลสินค้า"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
                      {/* ราคาเช่า */}
                      {selectedProduct.rentPrice !== undefined && selectedProduct.rentPrice !== null && selectedProduct.rentPrice > 0 && (
                        <div className="space-y-0.5">
                          <span className="text-slate-400 block text-[11px] font-medium">ราคาเช่า</span>
                          <span className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
                            ฿{selectedProduct.rentPrice.toLocaleString('th-TH')}
                          </span>
                        </div>
                      )}
                      {/* ราคาขาย */}
                      {selectedProduct.salePrice !== undefined && selectedProduct.salePrice !== null && selectedProduct.salePrice > 0 && (
                        <div className="space-y-0.5">
                          <span className="text-slate-400 block text-[11px] font-medium">ราคาขาย</span>
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            ฿{selectedProduct.salePrice.toLocaleString('th-TH')}
                          </span>
                        </div>
                      )}
                      {/* วันที่เพิ่มสินค้า */}
                      {(selectedProduct.createdAt || (selectedProduct as any).created_at) && (
                        <div className="space-y-0.5">
                          <span className="text-slate-400 block text-[11px] font-medium">วันที่เพิ่มสินค้า</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                            {selectedProduct.createdAt || (selectedProduct as any).created_at}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Edit Mode: Inline Form */
                  <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border-2 border-amber-400 dark:border-amber-500 shadow-md space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Edit className="w-4 h-4" />
                        <span>แก้ไขข้อมูลสินค้า</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

                      {/* ชื่อสินค้า */}
                      <div>
                        <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                          ชื่อสินค้า <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="ชื่อสินค้า..."
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      {/* หมวดหมู่ (Dropdown from Category Rules) */}
                      <div>
                        <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                          หมวดหมู่ <span className="text-red-500">*</span>
                        </label>
                        <CustomSelect
                          value={editForm.category}
                          onChange={(val) => {
                            const chosen = categoryRules.find((r) => r.name === val)
                            if (chosen) {
                              setEditForm((prev) => ({
                                ...prev,
                                categoryRuleId: chosen.id,
                                category: chosen.name,
                                calculationType: chosen.calculationType,
                                calculationLabel: chosen.calculationLabel,
                                unit: chosen.unit || chosen.unitName || '',
                              }))
                            } else {
                              setEditForm((prev) => ({ ...prev, category: String(val) }))
                            }
                          }}
                          options={categoryRules.map((r) => ({ value: r.name, label: r.name }))}
                          placeholder="เลือกหมวดหมู่"
                        />
                      </div>

                      {/* ราคาเช่า */}
                      <div>
                        <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                          ราคาเช่า (฿) <span className="text-slate-400 font-normal">(เว้นว่างได้)</span>
                        </label>
                        <NumericInput
                          value={editForm.rentPrice}
                          onChange={(val) => setEditForm((prev) => ({ ...prev, rentPrice: val === '' ? '' : String(val) }))}
                          placeholder="เว้นว่างได้ถ้าไม่ให้เช่า"
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      {/* ราคาขาย */}
                      <div>
                        <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                          ราคาขาย (฿) <span className="text-slate-400 font-normal">(เว้นว่างได้)</span>
                        </label>
                        <NumericInput
                          value={editForm.salePrice}
                          onChange={(val) => setEditForm((prev) => ({ ...prev, salePrice: val === '' ? '' : String(val) }))}
                          placeholder="เว้นว่างได้ถ้าไม่ขาย"
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      {/* วันที่เพิ่มสินค้า */}
                      <div>
                        <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">วันที่เพิ่มสินค้า</label>
                        <CustomDatePicker
                          value={parseLocalDate(editForm.createdAt)}
                          onChange={(d) => setEditForm((prev) => ({ ...prev, createdAt: d ? getLocalDateString(d) : '' }))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsEditingInline(false)}
                        className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveInlineEdit}
                        className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-colors cursor-pointer"
                      >
                        บันทึก
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Tabs inside Drawer */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 pt-3 text-xs font-bold gap-4">
                <button
                  onClick={() => setActiveDrawerTab('CURRENT')}
                  className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${activeDrawerTab === 'CURRENT'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>ปัจจุบันสินค้าอยู่กับใครบ้าง ({selectedProduct.siteLocations?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveDrawerTab('HISTORY')}
                  className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${activeDrawerTab === 'HISTORY'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <History className="w-4 h-4 text-indigo-500" />
                  <span>ประวัติการเช่าทั้งหมด</span>
                </button>

                <button
                  onClick={() => setActiveDrawerTab('OVERVIEW')}
                  className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${activeDrawerTab === 'OVERVIEW'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <Sliders className="w-4 h-4 text-purple-500" />
                  <span>สถานะสต็อก</span>
                </button>
              </div>

              {/* Tab Body Contents */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

                {/* TAB 1: ปัจจุบันสินค้าอยู่กับใครบ้าง */}
                {activeDrawerTab === 'CURRENT' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>รายการลูกค้าที่เช่าสินค้าอยู่ในขณะนี้ (Active Rented Customers)</span>
                      </h4>
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold">
                        รวม {selectedProduct.rentedQuantity} {selectedProduct.unit}
                      </span>
                    </div>

                    {selectedProduct.siteLocations && selectedProduct.siteLocations.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProduct.siteLocations.map((loc, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-black text-slate-900 dark:text-slate-100 text-sm block">
                                  👤 {loc.customerName}
                                </span>
                                {loc.phone && (
                                  <p className="text-emerald-600 font-mono flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3" />
                                    <span>{loc.phone}</span>
                                  </p>
                                )}
                              </div>
                              <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-sm">
                                {loc.quantity} {selectedProduct.unit}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                              <div>
                                <span className="text-slate-400 block font-semibold">📍 หน้างาน / สถานที่</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{loc.siteName}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold">🧾 เลขที่บิลอ้างอิง</span>
                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{loc.billNo}</span>
                              </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-[11px]">
                              <span className="text-slate-500 font-mono">
                                📅 เริ่มเช่า: {loc.startDate || '2026-08-01'}
                              </span>
                              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                ⏰ กำหนดคืน: {loc.returnDate}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                        <p className="font-bold text-slate-700 dark:text-slate-300">ไม่มีสินค้าถูกเช่าอยู่ในขณะนี้</p>
                        <p className="text-slate-400 text-[11px] mt-0.5">สินค้าทั้งหมดพร้อมให้บริการในคลัง</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: ประวัติการเช่าทั้งหมด (Rental Ledger) */}
                {activeDrawerTab === 'HISTORY' && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-500" />
                      <span>สมุดบันทึกประวัติการเช่าทั้งหมด (Rental History Ledger)</span>
                    </h4>

                    {selectedProduct.rentalHistory && selectedProduct.rentalHistory.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProduct.rentalHistory.map((rh) => (
                          <div
                            key={rh.id}
                            className="p-3.5 rounded-2xl border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">
                                  {rh.customerName}
                                </span>
                                {rh.phone && <span className="text-slate-500 font-mono text-[11px]">📞 {rh.phone}</span>}
                              </div>

                              <span
                                className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${rh.status === 'ACTIVE'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : rh.status === 'OVERDUE'
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  }`}
                              >
                                {rh.status === 'ACTIVE'
                                  ? '🔵 กำลังเช่า'
                                  : rh.status === 'OVERDUE'
                                    ? '🔴 เกินกำหนดคืน'
                                    : '✓ คืนแล้ว'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700 font-mono">
                              <span>🧾 {rh.billNo}</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {rh.quantity} {selectedProduct.unit}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-500 space-y-0.5 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono">
                              <p>📅 ช่วงเวลาเช่า: {rh.rentalStartDate} ถึง {rh.returnDate}</p>
                              <p className="truncate">📍 สถานที่: {rh.siteName}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-center py-8">ไม่มีประวัติการเช่าในระบบ</p>
                    )}
                  </div>
                )}

                {/* TAB 3: สถานะสต็อก */}
                {activeDrawerTab === 'OVERVIEW' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 border-b pb-1">รายละเอียดสถานะสต็อกในคลัง</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <span className="text-slate-400 block text-[11px]">จำนวนรวมทั้งหมด</span>
                        <span className="font-black text-lg">{selectedProduct.totalQuantity} {selectedProduct.unit}</span>
                      </div>
                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                        <span className="text-emerald-700 dark:text-emerald-300 block font-semibold text-[11px]">พร้อมให้เช่า</span>
                        <span className="font-black text-lg text-emerald-600">{selectedProduct.availableQuantity} {selectedProduct.unit}</span>
                      </div>
                      <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
                        <span className="text-blue-700 dark:text-blue-300 block font-semibold text-[11px]">อยู่ระหว่างเช่า</span>
                        <span className="font-black text-lg text-blue-600">{selectedProduct.rentedQuantity} {selectedProduct.unit}</span>
                      </div>
                      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                        <span className="text-amber-700 dark:text-amber-300 block font-semibold text-[11px]">ชำรุด / สูญหาย</span>
                        <span className="font-black text-lg text-amber-600">{selectedProduct.damagedQuantity + selectedProduct.lostQuantity} {selectedProduct.unit}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">ข้อมูลราคาและค่าธรรมเนียม</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {selectedProduct.rentPrice !== undefined && selectedProduct.rentPrice !== null ? (
                          <p className="text-slate-500">ราคาเช่า: <span className="font-bold text-blue-600">฿{selectedProduct.rentPrice.toLocaleString()}</span></p>
                        ) : (
                          <p className="text-slate-500">ราคาเช่าปกติ: <span className="font-bold text-blue-600">฿{selectedProduct.normalPrice.toLocaleString()}</span></p>
                        )}
                        {selectedProduct.salePrice !== undefined && selectedProduct.salePrice !== null && (
                          <p className="text-slate-500">ราคาขาย: <span className="font-bold text-emerald-600">฿{selectedProduct.salePrice.toLocaleString()}</span></p>
                        )}
                        <p className="text-slate-500">ค่าชำรุดตั้งต้น: <span className="font-bold text-amber-600">฿{selectedProduct.defaultDamageFee.toLocaleString()}</span></p>
                        <p className="text-slate-500">ค่าสูญหายตั้งต้น: <span className="font-bold text-red-600">฿{selectedProduct.defaultLossFee.toLocaleString()}</span></p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </AppModalBody>

            {/* Modal Footer */}
            <AppModalFooter>
              <button
                onClick={() => {
                  setSelectedProduct(null)
                  setIsEditingInline(false)
                }}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </AppModalFooter>
          </>
        )}
      </AppModal>

      {/* Delete Product Confirmation Modal */}
      <AppModal
        isOpen={!!productToDelete}
        onClose={() => {
          if (!isDeleting) setProductToDelete(null)
        }}
        size="sm"
      >
        <AppModalHeader
          title="ยืนยันการลบสินค้า"
          icon={<Trash2 className="w-5 h-5 text-red-600" />}
          onClose={() => {
            if (!isDeleting) setProductToDelete(null)
          }}
        />
        <AppModalBody className="space-y-3 text-xs py-3">
          <p className="text-slate-700 dark:text-slate-300">
            คุณต้องการลบสินค้า <strong className="text-slate-900 dark:text-slate-100 font-bold">&quot;{productToDelete?.name}&quot;</strong> ออกจากระบบหรือไม่?
          </p>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>เหตุผลในการลบ/ระงับสินค้า (จำเป็น)</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="ระบุเหตุผล เช่น สินค้าชำรุดจำหน่ายออก, สินค้าเลิกจำหน่าย..."
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-[11px] leading-relaxed">
            * ข้อมูลสินค้าจะถูกลบออกจากฐานข้อมูล และไม่สามารถเรียกคืนได้
          </div>
        </AppModalBody>
        <AppModalFooter
          onCancel={() => {
            setDeleteReason('')
            setProductToDelete(null)
          }}
          cancelText="ยกเลิก"
          onConfirm={handleConfirmDeleteProduct}
          confirmText={isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
          confirmButtonColor="red"
          isConfirmDisabled={isDeleting || !deleteReason.trim()}
          isConfirmLoading={isDeleting}
        />
      </AppModal>

    </div>
  )
}
