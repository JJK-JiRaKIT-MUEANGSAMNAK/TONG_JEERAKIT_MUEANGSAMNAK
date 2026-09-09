'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductGrid } from '@/components/pos/ProductGrid'
import { CartPanel } from '@/components/pos/CartPanel'
import { QuantityModal } from '@/components/pos/QuantityModal'
import { Product, Customer } from '@/lib/types/rental-pos'
import { useToast } from '@/components/common/Toast'
import { ShoppingBag, Package, FileText, ArrowLeft } from 'lucide-react'

function POSContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isQuotationMode = searchParams.get('mode') === 'quotation'
  const { showToast } = useToast()

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [customersList, setCustomersList] = useState<Customer[]>([])
  const [productsList, setProductsList] = useState<Product[]>([])
  const [mobileTab, setMobileTab] = useState<'PRODUCTS' | 'CART'>('PRODUCTS')

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
  }

  const handleAddToCart = (_data: {
    product: Product
    rentalType: 'NORMAL' | 'DAILY' | 'SALE'
    quantity: number
    unitPrice: number
    usageCount: number
    dailyStartDate?: Date
    dailyEndDate?: Date
  }) => {
    setSelectedProduct(null)
  }

  const handleAddCustomer = async (newCustomer: Customer) => {
    setCustomersList((prev) => [newCustomer, ...prev])
    showToast('เพิ่มลูกค้าสำเร็จ', `เพิ่มลูกค้า ${newCustomer.customerName} เรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleCheckout = () => {
    router.push('/pos/checkout')
  }

  const handleSaveQuotation = async () => {
    showToast('บันทึกใบเสนอราคาสำเร็จ', 'สร้างใบเสนอราคาเรียบร้อยแล้ว', 'SUCCESS')
    router.push('/quotations')
  }

  const handleExitQuotationMode = () => {
    router.push('/quotations')
  }

  const cartTotalItems = 0

  return (
    <div className="h-full p-2.5 sm:p-3 md:p-4 bg-slate-100 dark:bg-[#07111f] flex flex-col gap-2.5 md:gap-3 overflow-hidden min-h-0">
      {/* Quotation Mode Top Notification Banner */}
      {isQuotationMode && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 px-3 py-1.5 rounded-xl flex items-center justify-between gap-2 text-xs shrink-0 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-extrabold text-amber-900 dark:text-amber-200 truncate">
              📋 โหมดสร้างใบเสนอราคา (ไม่ตัดสต็อก / ไม่จองสินค้า)
            </span>
          </div>
          <button
            onClick={handleExitQuotationMode}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg border border-slate-300 dark:border-slate-600 flex items-center gap-1 text-[11px] shrink-0 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าใบเสนอราคา</span>
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2.5 md:gap-3 overflow-hidden">
        {/* Small Mobile View Toggle (< 768px) */}
        <div className="md:hidden flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
          <button
            onClick={() => setMobileTab('PRODUCTS')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'PRODUCTS'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>เลือกสินค้า</span>
          </button>
          <button
            onClick={() => setMobileTab('CART')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'CART'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {isQuotationMode ? 'รายการใบเสนอราคา' : 'ตะกร้าสินค้า'} ({cartTotalItems})
            </span>
          </button>
        </div>

        {/* Left Column - Product Grid */}
        <div
          className={`flex-1 min-w-0 h-full min-h-0 ${
            mobileTab === 'PRODUCTS' ? 'block' : 'hidden md:block'
          }`}
        >
          <ProductGrid products={productsList} onSelectProduct={handleSelectProduct} />
        </div>

        {/* Right Column - Cart Panel */}
        <div
          className={`w-full md:w-[280px] xl:w-[320px] 2xl:w-[360px] h-full shrink-0 ${
            mobileTab === 'CART' ? 'block' : 'hidden md:block'
          }`}
        >
          <CartPanel
            customers={customersList}
            onAddCustomer={handleAddCustomer}
            onCheckout={handleCheckout}
            isQuotationMode={isQuotationMode}
            onSaveQuotation={handleSaveQuotation}
          />
        </div>
      </div>

      {/* Quantity Modal */}
      {selectedProduct && (
        <QuantityModal
          product={selectedProduct}
          onAdd={handleAddToCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}

export default function POSPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center text-slate-500 font-bold text-xs">
          กำลังโหลดหน้า POS...
        </div>
      }
    >
      <POSContent />
    </Suspense>
  )
}

