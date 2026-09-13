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
} from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'
import { Product } from '@/lib/types/rental-pos'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { useToast } from '@/components/common/Toast'
import { StockCountModal } from '@/components/products/StockCountModal'
import { NewProductModal } from '@/components/products/NewProductModal'
import { DamagedRestoreModal } from '@/components/products/DamagedRestoreModal'
import { DamagedTransformModal } from '@/components/products/DamagedTransformModal'
import { logger } from '@/lib/utils/logger'
import { loadProducts as loadStorageProducts, saveProducts as saveStorageProducts, deleteProduct as deleteStorageProduct } from '@/lib/product-storage'
import { loadCategoryRules, ProductCategoryRule } from '@/lib/category-rules-storage'
import { NumericInput } from '@/components/common/NumericInput'
import { CustomDatePicker, parseLocalDate, getLocalDateString } from '@/components/common/CustomDatePicker'
import { useAuth } from '@/lib/contexts/AuthContext'
import { recordAuditLog, generateCorrelationId } from '@/lib/audit-storage'

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

  // Selected Product for detail drawer / history modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeDrawerTab, setActiveDrawerTab] = useState<'CURRENT' | 'HISTORY' | 'OVERVIEW'>('CURRENT')

  // Unified Product & Stock Management Modal State
  const [showManageModal, setShowManageModal] = useState(false)
  const [activeManageTab, setActiveManageTab] = useState<'EDIT_DETAILS' | 'ADJUST_STOCK'>('EDIT_DETAILS')
  const [targetManageProduct, setTargetManageProduct] = useState<Product | null>(null)

  // Damaged Stock Management Modals State
  const [restoreTargetProduct, setRestoreTargetProduct] = useState<Product | null>(null)
  const [transformTargetProduct, setTransformTargetProduct] = useState<Product | null>(null)

  // Stock Count Modal State
  const [showCountModal, setShowCountModal] = useState(false)

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
      (statusFilter === 'LOW_STOCK' && p.minimumStock > 0 && p.availableQuantity <= p.minimumStock) ||
      (statusFilter === 'OUT_OF_STOCK' && p.availableQuantity === 0) ||
      (statusFilter === 'ACTIVE' && p.status === 'ACTIVE')
    return matchesSearch && matchesCat && matchesStatus
  })

  // Pagination for Products Table (10 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const productsPerPage = 10
  const totalProducts = filteredProducts.length
  const totalPages = Math.ceil(totalProducts / productsPerPage) || 1
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  )

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter, activeViewTab])

  // Stock Summary Metrics
  const totalItems = products.reduce((acc, p) => acc + p.totalQuantity, 0)
  const totalAvailable = products.reduce((acc, p) => acc + p.availableQuantity, 0)
  const totalRented = products.reduce((acc, p) => acc + p.rentedQuantity, 0)
  const totalDamaged = products.reduce((acc, p) => acc + p.damagedQuantity, 0)
  const totalLost = products.reduce((acc, p) => acc + p.lostQuantity, 0)
  const lowStockCount = products.filter((p) => p.minimumStock > 0 && p.availableQuantity <= p.minimumStock).length
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
    setShowCountModal(true)
  }

  const openProductHistory = (product: Product, initialTab: 'CURRENT' | 'HISTORY' | 'OVERVIEW' = 'CURRENT') => {
    setSelectedProduct(product)
    setIsEditingInline(false)
    setActiveDrawerTab(initialTab)
  }

  // Category Rules from unified storage
  const [categoryRules, setCategoryRules] = useState<ProductCategoryRule[]>([])

  useEffect(() => {
    setCategoryRules(loadCategoryRules())
  }, [])

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
      {/* Stock Summary Cards */}
      <div className="shrink-0 grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-2.5">
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

      {/* Filter / Search & Action Bar */}
      <div className="shrink-0 p-2 sm:p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 sm:gap-2.5">
        {/* Left / Center Group: Tabs, Search, and Category/Status Filters */}
        <div className="flex flex-wrap sm:flex-nowrap flex-1 min-w-0 items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          {/* View Mode Tabs: สินค้าทั้งหมด / สินค้าชำรุด */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setActiveViewTab('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeViewTab === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              สินค้าทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('DAMAGED')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeViewTab === 'DAMAGED'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <span>สินค้าชำรุด</span>
              {damagedProductsCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold ${
                    activeViewTab === 'DAMAGED'
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {damagedProductsCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative flex-1 min-w-[140px] sm:min-w-[160px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeViewTab === 'DAMAGED' ? 'ค้นหาชื่อสินค้าชำรุด...' : 'ค้นหาชื่อสินค้า...'}
              className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="w-28 sm:w-32 md:w-36 shrink-0">
            <CustomSelect
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(String(val))}
              options={[
                { value: 'ALL', label: 'ทุกหมวดหมู่' },
                ...categories.map((c) => ({ value: c.label, label: c.label })),
              ]}
            />
          </div>

          {activeViewTab === 'ALL' && (
            <div className="w-28 sm:w-32 md:w-36 shrink-0">
              <CustomSelect
                value={statusFilter}
                onChange={(val) => setStatusFilter(String(val))}
                options={[
                  { value: 'ALL', label: 'ทุกสถานะสต็อก' },
                  { value: 'ACTIVE', label: 'สินค้าเปิดใช้งาน' },
                  { value: 'LOW_STOCK', label: 'สต็อกใกล้หมด (เตือน)' },
                  { value: 'OUT_OF_STOCK', label: 'สินค้าหมดคลัง' },
                ]}
              />
            </div>
          )}
        </div>

        {/* Right Group: Count Stock & Add Product Buttons */}
        <div className="flex items-center justify-end gap-2 shrink-0 ml-auto lg:ml-0">
          <button
            type="button"
            onClick={handleOpenStockCount}
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <ClipboardList className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>นับสต็อก</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-sm transition-colors shrink-0 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสินค้าใหม่</span>
          </button>
        </div>
      </div>

      {/* Products Table Area */}
      <div className="flex-1 min-h-0 min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-auto">
          <table className="w-full min-w-[800px] table-auto text-xs text-left border-collapse">
            {activeViewTab === 'DAMAGED' ? (
              <>
                <thead className="sticky top-0 z-10 bg-slate-800 dark:bg-slate-900 text-white font-bold border-b border-slate-700 shadow-xs">
                  <tr>
                    <th className="py-2.5 px-3 min-w-[200px] text-left">ชื่อสินค้า</th>
                    <th className="py-2.5 px-3 w-36 text-left">หมวดหมู่</th>
                    <th className="py-2.5 px-3 w-28 text-center bg-amber-900/80 text-amber-200 font-black">จำนวนชำรุด</th>
                    <th className="py-2.5 px-3 w-28 text-center">พร้อมใช้</th>
                    <th className="py-2.5 px-3 w-28 text-center">กำลังเช่า</th>
                    <th className="py-2.5 px-3 w-44 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors">
                      <td className="py-2.5 px-3 min-w-[200px]">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 truncate" title={p.name}>
                          {p.name}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 w-36">
                        <span className="inline-block max-w-full px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold truncate" title={p.category}>
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 w-28 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black text-xs border border-amber-300 dark:border-amber-800">
                          {p.damagedQuantity} {p.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 w-28 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {p.availableQuantity} {p.unit}
                      </td>
                      <td className="py-2.5 px-3 w-28 text-center font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {p.rentedQuantity} {p.unit}
                      </td>
                      <td className="py-2.5 px-3 w-44 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRestoreTargetProduct(p)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs hover:scale-102"
                            title="นำสินค้าชำรุดกลับมาใช้งานต่อ"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>ใช้งานต่อ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTransformTargetProduct(p)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs hover:scale-102"
                            title="ดัดแปลงสินค้าชำรุดเป็นสินค้าอื่น"
                          >
                            <Shuffle className="w-3 h-3" />
                            <span>ดัดแปลงเป็น...</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span>กำลังโหลดข้อมูลสินค้าจากฐานข้อมูล...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 text-xs italic">
                        ไม่พบรายการสินค้าชำรุดในระบบ
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </>
            ) : (
              <>
                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 shadow-xs">
                  <tr>
                    <th className="py-2.5 px-3 min-w-[180px] text-left">ชื่อสินค้า</th>
                    <th className="py-2.5 px-2.5 w-32 text-left">หมวดหมู่</th>
                    <th className="py-2.5 px-2.5 w-28 text-right">ราคาเช่า</th>
                    <th className="py-2.5 px-2.5 w-24 text-right">ค่าชำรุด</th>
                    <th className="py-2.5 px-2.5 w-24 text-right">ค่าสูญหาย</th>
                    <th className="py-2.5 px-2.5 w-24 text-center">พร้อมใช้</th>
                    <th className="py-2.5 px-2.5 w-24 text-center">ทั้งหมด</th>
                    <th className="py-2.5 px-2.5 w-28 text-center">สถานะ</th>
                    <th className="py-2.5 px-2.5 w-20 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedProducts.map((p) => {
                    const isLow = p.availableQuantity <= p.minimumStock
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 min-w-[180px]">
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 truncate" title={p.name}>
                            {p.name}
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 w-32">
                          <span className="inline-block max-w-full px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold truncate" title={p.category}>
                            {p.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 w-28 text-right font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {p.rentPrice !== undefined && p.rentPrice !== null ? (
                            <span>฿{p.rentPrice.toLocaleString()}{p.calculationType === 'PER_DAY' || p.rentalType === 'DAILY' ? '/วัน' : '/รอบ'}</span>
                          ) : p.salePrice !== undefined && p.salePrice !== null ? (
                            <span className="text-violet-600 dark:text-violet-400">฿{p.salePrice.toLocaleString()} (ขาย)</span>
                          ) : (
                            <span>฿{p.rentalType === 'DAILY' ? `${p.dailyPrice.toLocaleString()}/วัน` : `${p.normalPrice.toLocaleString()}/รอบ`}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 w-24 text-right font-mono text-[11px] text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap">
                          ฿{p.defaultDamageFee.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2.5 w-24 text-right font-mono text-[11px] text-red-600 dark:text-red-400 font-bold whitespace-nowrap">
                          ฿{p.defaultLossFee.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2.5 w-24 text-center font-mono whitespace-nowrap">
                          <span className={`font-extrabold ${p.availableQuantity === 0 ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {p.availableQuantity} {p.unit}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 w-24 text-center font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          <span>{p.totalQuantity} {p.unit}</span>
                        </td>
                        <td className="py-2.5 px-2.5 w-28 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              p.availableQuantity === 0
                                ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                                : isLow
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {p.availableQuantity === 0 ? 'สินค้าหมด' : isLow ? 'สต็อกใกล้หมด' : 'พร้อมใช้'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 w-20 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => openProductHistory(p, 'CURRENT')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="ดูข้อมูลและประวัติการเช่า"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToDelete(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="ลบสินค้า"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span>กำลังโหลดข้อมูลสินค้าจากฐานข้อมูล...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400 text-xs italic">
                        ไม่พบรายการสินค้าที่ตรงกับเงื่อนไขการค้นหา
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </>
            )}
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="shrink-0 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate">
            แสดง {paginatedProducts.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0} ถึง{' '}
            {Math.min(currentPage * productsPerPage, totalProducts)} จากทั้งหมด {totalProducts} รายการ
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-40 font-bold transition-colors"
            >
              ก่อนหน้า
            </button>
            <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-40 font-bold transition-colors"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

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

      {/* Centralized Stock Count Modal */}
      <StockCountModal
        isOpen={showCountModal}
        onClose={() => setShowCountModal(false)}
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
