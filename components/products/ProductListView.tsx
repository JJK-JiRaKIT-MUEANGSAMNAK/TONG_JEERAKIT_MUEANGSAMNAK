'use client'

import React, { useEffect } from 'react'
import {
  Search,
  RotateCcw,
  Shuffle,
  History,
  Trash2,
} from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'
import { ActionButton } from '@/components/common/ActionButton'
import { Product } from '@/lib/types/rental-pos'
import { useAutoFitPageSize } from '@/lib/hooks/useAutoFitPageSize'

interface ProductListViewProps {
  products: Product[]
  paginatedProducts?: Product[]
  isLoading: boolean
  searchTerm: string
  setSearchTerm: (term: string) => void
  categoryFilter: string
  setCategoryFilter: (cat: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  activeViewTab: 'ALL' | 'DAMAGED'
  setActiveViewTab: (tab: 'ALL' | 'DAMAGED') => void
  categories: { id: string; label: string }[]
  damagedProductsCount: number
  currentPage?: number
  totalPages?: number
  totalProducts?: number
  productsPerPage?: number
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>
  defaultMinStock?: number
  onRestoreDamaged: (product: Product) => void
  onTransformDamaged: (product: Product) => void
  onOpenHistory: (product: Product) => void
  onDeleteProduct: (product: Product) => void
}

export function ProductListView({
  products,
  isLoading,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  activeViewTab,
  setActiveViewTab,
  categories,
  damagedProductsCount,
  defaultMinStock = 2,
  onRestoreDamaged,
  onTransformDamaged,
  onOpenHistory,
  onDeleteProduct,
}: ProductListViewProps) {
  const autoFit = useAutoFitPageSize({
    totalItems: products.length,
    activeKey: activeViewTab,
    defaultRowHeight: 38,
    defaultHeaderHeight: 36,
  })

  // Reset to page 1 on filter changes
  useEffect(() => {
    autoFit.setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter, activeViewTab])

  const effectivePaginatedProducts = products.slice(autoFit.startIndex, autoFit.endIndex)
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* View Mode Tabs: สินค้าทั้งหมด / สินค้าชำรุด */}
          <div className="inline-flex items-center bg-slate-200/80 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-300/70 dark:border-slate-800 shrink-0 h-9 gap-1">
            <button
              type="button"
              onClick={() => setActiveViewTab('ALL')}
              className={`h-7 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 ${
                activeViewTab === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200/80 dark:border-slate-700 font-extrabold ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>สินค้าทั้งหมด</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('DAMAGED')}
              className={`h-7 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 ${
                activeViewTab === 'DAMAGED'
                  ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-sm border border-amber-200/80 dark:border-amber-800/80 font-extrabold ring-1 ring-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-300/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>สินค้าชำรุด</span>
              {damagedProductsCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold ${
                    activeViewTab === 'DAMAGED'
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60'
                      : 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {damagedProductsCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative min-w-[180px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeViewTab === 'DAMAGED' ? 'ค้นหาชื่อสินค้าชำรุด...' : 'ค้นหาชื่อสินค้า...'}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="w-auto min-w-[130px] shrink-0">
            <CustomSelect
              buttonClassName="h-9 px-2.5 rounded-xl"
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(String(val))}
              options={[
                { value: 'ALL', label: 'ทุกหมวดหมู่' },
                ...categories.map((c) => ({ value: c.label, label: c.label })),
              ]}
            />
          </div>

          {activeViewTab === 'ALL' && (
            <div className="w-auto min-w-[140px] shrink-0">
              <CustomSelect
                buttonClassName="h-9 px-2.5 rounded-xl"
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
      </div>

      {/* Products Table Area */}
      <div
        ref={autoFit.containerRef}
        className="flex-1 min-h-0 min-w-0 flex flex-col justify-between overflow-hidden"
      >
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <table className="w-full text-xs text-left border-collapse table-fixed">
            {activeViewTab === 'DAMAGED' ? (
              <>
                <thead className="sticky top-0 z-10 bg-slate-800 dark:bg-slate-950 text-slate-100 font-bold border-b border-slate-700 shadow-xs text-xs">
                  <tr>
                    <th className="py-2 px-2 text-left whitespace-nowrap">ชื่อสินค้า</th>
                    <th className="py-2 px-2 w-28 text-left whitespace-nowrap">หมวดหมู่</th>
                    <th className="py-2 px-2 w-24 text-center whitespace-nowrap bg-amber-900/90 text-amber-200 font-black">จำนวนชำรุด</th>
                    <th className="py-2 px-2 w-20 text-center whitespace-nowrap">พร้อมใช้</th>
                    <th className="py-2 px-2 w-20 text-center whitespace-nowrap">กำลังเช่า</th>
                    <th className="py-2 px-2 w-32 text-center whitespace-nowrap">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {effectivePaginatedProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors">
                      <td className="py-1.5 px-2 min-w-0">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 truncate" title={p.name}>
                          {p.name}
                        </div>
                      </td>
                      <td className="py-1.5 px-2 w-28">
                        <span className="inline-block max-w-full px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold truncate" title={p.category}>
                          {p.category}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 w-24 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black text-xs border border-amber-300 dark:border-amber-800">
                          {p.damagedQuantity} {p.unit}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 w-20 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {p.availableQuantity} {p.unit}
                      </td>
                      <td className="py-1.5 px-2 w-20 text-center font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {p.rentedQuantity} {p.unit}
                      </td>
                      <td className="py-1.5 px-2 w-32 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onRestoreDamaged(p)}
                            className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs hover:scale-102 cursor-pointer"
                            title="นำสินค้าชำรุดกลับมาใช้งานต่อ"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>ใช้งานต่อ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onTransformDamaged(p)}
                            className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs hover:scale-102 cursor-pointer"
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
                    <tr data-empty-row="true">
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span>กำลังโหลดข้อมูลสินค้าจากฐานข้อมูล...</span>
                        </div>
                      </td>
                    </tr>
                  ) : effectivePaginatedProducts.length === 0 ? (
                    <tr data-empty-row="true">
                      <td colSpan={6} className="text-center py-10 text-slate-400 text-xs italic">
                        ไม่พบรายการสินค้าชำรุดในระบบ
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </>
            ) : (
              <>
                <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 shadow-xs text-xs">
                  <tr>
                    <th className="py-2 px-2 text-left whitespace-nowrap">ชื่อสินค้า</th>
                    <th className="py-2 px-2 w-28 text-left whitespace-nowrap">หมวดหมู่</th>
                    <th className="py-2 px-2 w-24 text-right whitespace-nowrap">ราคาเช่า</th>
                    <th className="py-2 px-2 w-20 text-right whitespace-nowrap">ค่าชำรุด</th>
                    <th className="py-2 px-2 w-20 text-right whitespace-nowrap">ค่าสูญหาย</th>
                    <th className="py-2 px-2 w-20 text-center whitespace-nowrap">พร้อมใช้</th>
                    <th className="py-2 px-2 w-20 text-center whitespace-nowrap">ทั้งหมด</th>
                    <th className="py-2 px-2 w-24 text-center whitespace-nowrap">สถานะ</th>
                    <th className="py-2 px-2 w-14 text-center whitespace-nowrap">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {effectivePaginatedProducts.map((p) => {
                    const isLow = defaultMinStock > 0 && p.availableQuantity <= defaultMinStock
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-1.5 px-2 min-w-0">
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 truncate" title={p.name}>
                            {p.name}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 w-28">
                          <span className="inline-block max-w-full px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold truncate" title={p.category}>
                            {p.category}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 w-24 text-right font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {p.rentPrice !== undefined && p.rentPrice !== null ? (
                            <span>฿{p.rentPrice.toLocaleString()}{p.calculationType === 'PER_DAY' || p.rentalType === 'DAILY' ? '/วัน' : '/รอบ'}</span>
                          ) : p.salePrice !== undefined && p.salePrice !== null ? (
                            <span className="text-violet-600 dark:text-violet-400">฿{p.salePrice.toLocaleString()} (ขาย)</span>
                          ) : (
                            <span>฿{p.rentalType === 'DAILY' ? `${p.dailyPrice.toLocaleString()}/วัน` : `${p.normalPrice.toLocaleString()}/รอบ`}</span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 w-20 text-right font-mono text-[11px] text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap">
                          ฿{p.defaultDamageFee.toLocaleString()}
                        </td>
                        <td className="py-1.5 px-2 w-20 text-right font-mono text-[11px] text-red-600 dark:text-red-400 font-bold whitespace-nowrap">
                          ฿{p.defaultLossFee.toLocaleString()}
                        </td>
                        <td className="py-1.5 px-2 w-20 text-center font-mono whitespace-nowrap">
                          <span className={`font-extrabold ${p.availableQuantity === 0 ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {p.availableQuantity} {p.unit}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 w-20 text-center font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          <span>{p.totalQuantity} {p.unit}</span>
                        </td>
                        <td className="py-1.5 px-2 w-24 text-center whitespace-nowrap">
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
                        <td className="py-1.5 px-2 w-14 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenHistory(p)}
                              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="ดูข้อมูลและประวัติการเช่า"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteProduct(p)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
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
                    <tr data-empty-row="true">
                      <td colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span>กำลังโหลดข้อมูลสินค้าจากฐานข้อมูล...</span>
                        </div>
                      </td>
                    </tr>
                  ) : effectivePaginatedProducts.length === 0 ? (
                    <tr data-empty-row="true">
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
        <div className="shrink-0 p-2 bg-slate-100/70 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate">
            {products.length > 0 ? (
              <span>
                แสดง {autoFit.startIndex + 1} ถึง {autoFit.endIndex} จากทั้งหมด {products.length} รายการ
              </span>
            ) : (
              <span>0 รายการ</span>
            )}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => autoFit.setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={autoFit.currentPage <= 1}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-40 font-bold transition-colors cursor-pointer"
            >
              ก่อนหน้า
            </button>
            <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
              {autoFit.currentPage} / {autoFit.totalPages}
            </span>
            <button
              type="button"
              onClick={() => autoFit.setCurrentPage((p) => Math.min(autoFit.totalPages, p + 1))}
              disabled={autoFit.currentPage >= autoFit.totalPages}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-40 font-bold transition-colors cursor-pointer"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
