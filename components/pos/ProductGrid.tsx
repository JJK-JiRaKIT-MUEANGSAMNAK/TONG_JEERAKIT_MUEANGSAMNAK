'use client'

import React, { useState, useMemo } from 'react'
import { ProductCard } from './ProductCard'
import { Product } from '@/lib/types/rental-pos'
import { CustomSelect } from '@/components/common/CustomSelect'
import { Search, PackageX, RefreshCw, ShoppingCart } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  onSelectProduct: (product: Product, mode?: 'RENT' | 'SALE') => void
  currentMode?: 'RENT' | 'SALE'
  onModeChange?: (mode: 'RENT' | 'SALE') => void
}

export function ProductGrid({
  products = [],
  onSelectProduct,
  currentMode,
  onModeChange,
}: ProductGridProps) {
  const [internalMode, setInternalMode] = useState<'RENT' | 'SALE'>('RENT')
  const posMode = currentMode ?? internalMode

  const handleSetMode = (m: 'RENT' | 'SALE') => {
    setInternalMode(m)
    if (onModeChange) onModeChange(m)
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  // Filter products by mode first
  const modeProducts = useMemo(() => {
    return products.filter((p) => {
      if (posMode === 'RENT') {
        if (p.rentPrice !== undefined && p.rentPrice !== null) {
          return p.rentPrice > 0
        }
        return (p.normalPrice > 0 || p.dailyPrice > 0) && p.rentalType !== 'SALE'
      } else {
        if (p.salePrice !== undefined && p.salePrice !== null) {
          return p.salePrice > 0
        }
        return p.rentalType === 'SALE'
      }
    })
  }, [products, posMode])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(modeProducts.map((p) => p.category).filter(Boolean)))
    return cats.map((c) => ({ label: c as string, value: c as string }))
  }, [modeProducts])

  const categoryOptions = useMemo(() => [
    { value: 'ALL', label: `ทุกหมวดหมู่ (${modeProducts.length})` },
    ...categories.map((c) => {
      const count = modeProducts.filter((p) => p.category === c.label).length
      return {
        value: c.label,
        label: count > 0 ? `${c.label} (${count})` : c.label,
      }
    }),
  ], [categories, modeProducts])

  const filteredProducts = useMemo(() => {
    return modeProducts.filter((p) => {
      const name = p.product_name || p.name || ''
      const code = p.product_code || p.code || ''
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        selectedCategory === 'ALL' ||
        p.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [modeProducts, searchTerm, selectedCategory])

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 max-w-full space-y-3 overflow-hidden">
      {/* Header controls: Mode Switcher + Search & Category Dropdown */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 min-w-0 max-w-full">
        {/* Mode Toggle: [ เช่า ] [ ขาย ] */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => handleSetMode('RENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              posMode === 'RENT'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>เช่าสินค้า</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetMode('SALE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              posMode === 'SALE'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>ขายสินค้า</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[140px] max-w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={posMode === 'RENT' ? 'ค้นหาสินค้าสำหรับเช่า...' : 'ค้นหาสินค้าสำหรับขาย...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        {/* Category Dropdown */}
        <div className="w-full sm:w-44 min-w-0 max-w-full sm:shrink-0 flex-1 sm:flex-initial">
          <CustomSelect
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(String(val))}
            options={categoryOptions}
            placeholder="ทุกหมวดหมู่"
          />
        </div>
      </div>

      {/* Grid view */}
      {filteredProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <PackageX className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300">
            {posMode === 'RENT' ? 'ไม่พบสินค้าสำหรับเช่า' : 'ไม่พบสินค้าสำหรับขาย'}
          </h4>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่สินค้า</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-2.5 overflow-y-auto overflow-x-hidden no-scrollbar pr-0.5 pb-2 content-start">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              mode={posMode}
              onClick={() => onSelectProduct(product, posMode)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
