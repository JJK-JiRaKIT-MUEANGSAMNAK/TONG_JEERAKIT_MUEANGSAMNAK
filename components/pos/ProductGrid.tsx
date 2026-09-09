'use client'

import React, { useState, useMemo } from 'react'
import { ProductCard } from './ProductCard'
import { Product } from '@/lib/types/rental-pos'
import { CustomSelect } from '@/components/common/CustomSelect'
import { Search, PackageX } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  onSelectProduct: (product: Product) => void
}

export function ProductGrid({ products = [], onSelectProduct }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
    return cats.map((c) => ({ label: c as string, value: c as string }))
  }, [products])

  const categoryOptions = useMemo(() => [
    { value: 'ALL', label: `ทุกหมวดหมู่ (${products.length})` },
    ...categories.map((c) => {
      const count = products.filter((p) => p.category === c.label).length
      return {
        value: c.label,
        label: count > 0 ? `${c.label} (${count})` : c.label,
      }
    }),
  ], [categories, products])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
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
  }, [products, searchTerm, selectedCategory])

  return (
    <div className="flex flex-col h-full min-h-0 space-y-3">
      {/* Header controls: Search & Category Dropdown */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ รหัสสินค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        {/* Category Dropdown */}
        <div className="w-44 sm:w-52 md:w-56 shrink-0">
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
          <h4 className="font-bold text-slate-700 dark:text-slate-300">ไม่พบรายการสินค้า</h4>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่สินค้า</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-2.5 overflow-y-auto pr-1">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  )
}
