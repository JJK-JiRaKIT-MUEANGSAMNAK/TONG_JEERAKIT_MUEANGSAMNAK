'use client'

import React from 'react'
import { Product } from '@/lib/types/rental-pos'
import { Clock, RefreshCw, AlertCircle, ShoppingCart } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onClick: (product: Product) => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const available = product.available_qty ?? product.availableQuantity ?? product.totalQuantity ?? 0
  const isOutOfStock = available <= 0
  const minQty = product.minimum_quantity ?? product.minimumStock ?? 0
  const isLowStock = !isOutOfStock && available < minQty

  let borderStyle = 'border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-800 hover:border-emerald-500 hover:shadow-lg'
  if (isOutOfStock) {
    borderStyle = 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 opacity-50 cursor-not-allowed'
  } else if (isLowStock) {
    borderStyle = 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-500 hover:shadow-md'
  }

  const rentalType = product.rental_type ?? product.rentalType ?? 'NORMAL'
  const price = rentalType === 'DAILY'
    ? (product.daily_price ?? product.dailyPrice ?? 0)
    : rentalType === 'SALE'
      ? (product.sale_price ?? product.salePrice ?? 0)
      : (product.normal_price ?? product.normalPrice ?? 0)

  const typeBadge = rentalType === 'DAILY'
    ? {
        classes: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
        icon: <Clock className="w-3 h-3" />,
        label: 'รายวัน',
      }
    : rentalType === 'SALE'
      ? {
          classes: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300',
          icon: <ShoppingCart className="w-3 h-3" />,
          label: 'ขาย',
        }
      : {
          classes: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
          icon: <RefreshCw className="w-3 h-3" />,
          label: 'รายรอบ',
        }

  return (
    <div
      onClick={() => !isOutOfStock && onClick(product)}
      className={`relative group min-h-[132px] rounded-xl p-2.5 md:p-3 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${borderStyle}`}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
            {product.product_code || product.code}
          </span>
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${typeBadge.classes}`}>
            {typeBadge.icon} {typeBadge.label}
          </span>
        </div>

        <h4 className="text-xs md:text-sm font-bold leading-snug text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-2">
          {product.product_name || product.name}
        </h4>
      </div>

      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/50 space-y-1">
        <div className="font-bold text-[10px] md:text-xs whitespace-nowrap">
          {isOutOfStock ? (
            <span className="text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> สินค้าหมด
            </span>
          ) : isLowStock ? (
            <span className="text-amber-600 dark:text-amber-400">
              คงเหลือ {available} {product.unit_name || product.unit || 'ชิ้น'}
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">
              คงเหลือ {available} {product.unit_name || product.unit || 'ชิ้น'}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1 text-xs text-slate-700 dark:text-slate-300">
          <span className="font-semibold">ราคา {price.toLocaleString('th-TH')}</span>
          <span className="text-slate-500 font-medium">/ {product.unit_name || product.unit || 'ชิ้น'}</span>
        </div>
      </div>
    </div>
  )
}
