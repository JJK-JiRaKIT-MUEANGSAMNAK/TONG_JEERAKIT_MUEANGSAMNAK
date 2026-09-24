'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductGrid } from '@/components/pos/ProductGrid'
import { CartPanel, CartPanelQuotationData } from '@/components/pos/CartPanel'
import { QuantityModal } from '@/components/pos/QuantityModal'
import { Product, Customer, Quotation, QuotationItem } from '@/lib/types/rental-pos'
import { useToast } from '@/components/common/Toast'
import {
  TAB_CONTAINER_CLASSES,
  TAB_BUTTON_BASE_CLASSES,
  TAB_BUTTON_ACTIVE_CLASSES,
  TAB_BUTTON_INACTIVE_CLASSES,
} from '@/components/common/ActionButton'
import { ShoppingBag, Package, FileText, ArrowLeft } from 'lucide-react'
import { loadProducts } from '@/lib/product-storage'
import { loadCustomers, addCustomer as addStorageCustomer } from '@/lib/customer-storage'
import { CartItem } from '@/lib/cart-storage'
import { addQuotation, getQuotationById, generateQuotationNo, mapQuotationToPos } from '@/lib/quotation-storage'
import { loadBillById } from '@/lib/bill-storage'
import { loadSystemSettings } from '@/lib/settings-storage'
import { checkAndExpireReservations } from '@/lib/bill-workflow-service'

function POSContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isQuotationMode = searchParams.get('mode') === 'quotation'
  const quotationId = searchParams.get('quotationId')
  const draftBillId = searchParams.get('draftBillId')
  const { showToast } = useToast()

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedProductMode, setSelectedProductMode] = useState<'RENT' | 'SALE'>('RENT')
  const [customersList, setCustomersList] = useState<Customer[]>([])
  const [productsList, setProductsList] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [mobileTab, setMobileTab] = useState<'PRODUCTS' | 'CART'>('PRODUCTS')
  const [loadedQuotationNo, setLoadedQuotationNo] = useState<string | undefined>(undefined)
  const [quotationValues, setQuotationValues] = useState<{
    discount?: number
    shippingFee?: number
    depositAmount?: number
    taxRate?: number
    shippingAddress?: string
    rentalStartDate?: string
    rentalEndDate?: string
  }>({})

  useEffect(() => {
    try {
      checkAndExpireReservations()
    } catch (e) {
      console.error('Failed to run reservation expiry check on POS mount', e)
    }

    const prods = loadProducts()
    const custs = loadCustomers()
    setProductsList(prods)
    setCustomersList(custs)

    if (quotationId) {
      const quote = getQuotationById(quotationId)
      if (quote) {
        if (quote.status === 'CONVERTED') {
          showToast('ไม่สามารถเปิดใบเสนอราคาได้', `ใบเสนอราคา ${quote.quotationNo} ถูกแปลงเป็นบิลไปแล้ว`, 'ERROR')
          router.push('/quotations')
          return
        }
        const { customer, cartItems: convertedItems, values, quotationNo } = mapQuotationToPos(quote, prods, custs)
        setSelectedCustomer(customer)
        setCartItems(convertedItems)
        setQuotationValues(values)
        setLoadedQuotationNo(quotationNo || quote.quotationNo)

        showToast('โหลดใบเสนอราคาสำเร็จ', `โหลดข้อมูลจากใบเสนอราคา ${quote.quotationNo} เรียบร้อยแล้ว`, 'SUCCESS')
      } else {
        showToast('ไม่พบใบเสนอราคา', `ไม่พบใบเสนอราคาที่มีรหัส ${quotationId}`, 'ERROR')
      }
    } else if (draftBillId) {
      const draftBill = loadBillById(draftBillId)
      if (draftBill && draftBill.rentalStatus === 'DRAFT') {
        const cust = custs.find((c) => c.id === draftBill.customerId) || {
          id: draftBill.customerId || 'draft-customer',
          customerName: draftBill.customerName,
          phone: draftBill.customerPhone,
          address: draftBill.customerAddress,
        }
        setSelectedCustomer(cust)

        const convertedItems: CartItem[] = draftBill.items.map((item, idx) => {
          const matchedProd = prods.find((p) => p.id === item.productId)
          const isSale = item.rentalType === 'SALE'
          const fallbackProduct: Product = {
            id: item.productId,
            code: item.productCode || item.productId,
            name: item.productName,
            category: 'ทั่วไป',
            rentalType: isSale ? 'SALE' : 'NORMAL',
            normalPrice: item.dailyRate,
            dailyPrice: item.dailyRate,
            salePrice: isSale ? item.dailyRate : 0,
            unit: item.unit || 'ชิ้น',
            defaultDamageFee: 0,
            defaultLossFee: 0,
            totalQuantity: 999,
            availableQuantity: 999,
            rentedQuantity: 0,
            reservedQuantity: 0,
            damagedQuantity: 0,
            lostQuantity: 0,
            minimumStock: 0,
            status: 'ACTIVE',
          }

          const baseProduct: Product = matchedProd
            ? {
                ...matchedProd,
                normalPrice: item.dailyRate,
                dailyPrice: item.dailyRate,
                salePrice: isSale ? item.dailyRate : (matchedProd.salePrice ?? item.dailyRate),
              }
            : fallbackProduct

          return {
            id: `cart-${Date.now()}-${idx}`,
            product: baseProduct,
            productId: item.productId,
            productName: item.productName,
            itemType: isSale ? 'SALE' : 'RENT',
            unitName: item.unit || matchedProd?.unit || 'ชิ้น',
            calculationType: matchedProd?.calculationType,
            calculationLabel: matchedProd?.calculationLabel,
            rentalType: (item.rentalType as any) || (isSale ? 'SALE' : 'NORMAL'),
            quantity: item.quantity,
            unitPrice: item.dailyRate,
            usageCount: item.usageCount || 1,
            billableDays: item.usageCount || 1,
            dailyStartDate: item.rentalStartDate,
            dailyEndDate: item.scheduledReturnDate,
            lineTotal: Number(item.lineTotal !== undefined ? item.lineTotal : ((item.quantity || 0) * (item.dailyRate || 0))),
          }
        })

        const sysSettings = loadSystemSettings()
        const defaultVat = (sysSettings.financePayment?.defaultVatPercent ?? 7) / 100

        setCartItems(convertedItems)
        setQuotationValues({
          discount: draftBill.discountAmount || 0,
          shippingFee: draftBill.shippingFee || 0,
          depositAmount: draftBill.heldDepositAmount || draftBill.paidDepositAmount || 0,
          taxRate: (draftBill.taxAmount ?? 0) > 0 ? defaultVat : 0,
          shippingAddress: draftBill.siteName || draftBill.customerAddress || '',
          rentalStartDate: draftBill.rentalStartDate,
          rentalEndDate: draftBill.scheduledReturnDate,
        })
        if (draftBill.quotationNo) {
          setLoadedQuotationNo(draftBill.quotationNo)
        }

        showToast('โหลดแบบร่างสำเร็จ', `โหลดข้อมูลจากแบบร่าง ${draftBill.billNo} เรียบร้อยแล้ว`, 'SUCCESS')
      } else if (draftBill) {
        showToast('บิลไม่ใช่แบบร่าง', `บิล ${draftBill.billNo} ไม่ได้อยู่ในสถานะแบบร่าง (สถานะปัจจุบัน: ${draftBill.rentalStatus})`, 'ERROR')
      } else {
        showToast('ไม่พบแบบร่าง', `ไม่พบแบบร่างที่มีรหัส ${draftBillId}`, 'ERROR')
      }
    }
  }, [quotationId, draftBillId, router, showToast])

  const handleSelectProduct = (product: Product, mode: 'RENT' | 'SALE' = 'RENT') => {
    setSelectedProduct(product)
    setSelectedProductMode(mode)
  }

  const handleAddToCart = (data: {
    product: Product
    rentalType: 'NORMAL' | 'DAILY' | 'SALE'
    quantity: number
    unitPrice: number
    usageCount: number
    dailyStartDate?: Date
    dailyEndDate?: Date
    billableDays?: number
  }) => {
    // STOCK VALIDATION
    const available = data.product.available_qty ?? data.product.availableQuantity ?? data.product.totalQuantity ?? 0
    const currentCartQty = cartItems
      .filter((item) => item.productId === data.product.id)
      .reduce((sum, item) => sum + item.quantity, 0)

    if (currentCartQty + data.quantity > available) {
      showToast(
        'สินค้าไม่เพียงพอ',
        `มีสินค้าในตะกร้าแล้ว ${currentCartQty} และต้องการเพิ่มอีก ${data.quantity} แต่สต็อกพร้อมใช้มีเพียง ${available}`,
        'ERROR'
      )
      return
    }

    const isSale = data.rentalType === 'SALE'
    const days = data.billableDays || 1

    const multiplier = isSale ? 1 : data.rentalType === 'DAILY' ? days : Math.max(1, data.usageCount)
    const lineTotal = data.quantity * data.unitPrice * multiplier

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      product: data.product,
      productId: data.product.id,
      productName: data.product.name,
      itemType: isSale ? 'SALE' : 'RENT',
      unitName: data.product.unit || data.product.unit_name,
      calculationType: data.product.calculationType as any,
      calculationLabel: data.product.calculationLabel,
      rentalType: data.rentalType,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      usageCount: isSale ? 1 : data.usageCount,
      billableDays: isSale ? 1 : days,
      dailyStartDate: !isSale && data.dailyStartDate ? data.dailyStartDate.toISOString().slice(0, 10) : undefined,
      dailyEndDate: !isSale && data.dailyEndDate ? data.dailyEndDate.toISOString().slice(0, 10) : undefined,
      lineTotal,
      requiresReturn: !isSale, // Adding this per MASTER rule C
    }

    setCartItems((prev) => [...prev, newItem])
    setSelectedProduct(null)
    showToast('เพิ่มสินค้าในตะกร้าแล้ว', `${data.product.name} × ${data.quantity}`, 'SUCCESS')
  }

  const handleAddCustomer = async (newCustomer: Customer) => {
    const updated = addStorageCustomer(newCustomer)
    setCustomersList(updated)
    setSelectedCustomer(newCustomer)
    showToast('เพิ่มลูกค้าสำเร็จ', `เพิ่มลูกค้า ${newCustomer.customerName} เรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleCheckout = () => {
    router.push('/pos/checkout')
  }

  const handleSaveQuotation = async (quotationData?: CartPanelQuotationData) => {
    if (cartItems.length === 0) {
      showToast('ไม่สามารถบันทึกได้', 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการก่อนบันทึกใบเสนอราคา', 'ERROR')
      return
    }

    const now = new Date()
    const qDate = quotationData?.documentDate || now.toISOString().slice(0, 10)
    const expiry = new Date(now)
    expiry.setDate(expiry.getDate() + 15)
    const expiryDate = expiry.toISOString().slice(0, 10)

    const existingQuotation = quotationId ? getQuotationById(quotationId) : null
    const id = existingQuotation?.id || `qt-${Date.now()}`
    const quotationNo = existingQuotation?.quotationNo || generateQuotationNo()

    const items: QuotationItem[] = cartItems.map((item, idx) => ({
      id: item.id || `qitem-${Date.now()}-${idx}`,
      productId: item.productId || item.product.id,
      productName: item.productName || item.product.name,
      rentalType: item.rentalType,
      quantity: item.quantity,
      unitName: item.unitName || item.product.unit || 'ชิ้น',
      unitPrice: item.unitPrice,
      usageCountOrDays: item.billableDays || item.usageCount || 1,
      lineTotal: item.lineTotal,
      dailyStartDate: item.dailyStartDate,
      dailyEndDate: item.dailyEndDate,
      isAccessory: item.product.isAccessory || false,
      isChargeable: item.product.isChargeable !== false,
      requiresReturn: item.product.requiresReturn !== false,
    }))

    const subtotal = quotationData?.subtotal ?? cartItems.reduce((sum, it) => sum + (it.lineTotal || 0), 0)
    const discountAmount = quotationData?.discount ?? 0
    const shippingFee = quotationData?.shippingFee ?? 0
    const depositAmount = quotationData?.depositAmount ?? 0
    const taxAmount = quotationData?.tax ?? 0
    const grandTotal = quotationData?.grandTotal ?? Math.max(0, subtotal - discountAmount + shippingFee + depositAmount + taxAmount)

    const newQuotation: Quotation = {
      id,
      quotationNo,
      quotationDate: qDate,
      expiryDate,
      customerId: selectedCustomer?.id || 'general-customer',
      customerName: selectedCustomer?.customerName || 'ลูกค้าทั่วไป',
      phone: selectedCustomer?.phone || '',
      customerAddress: selectedCustomer?.address || quotationData?.shippingAddress || '',
      customerTaxId: selectedCustomer?.taxId || '',
      siteName: quotationData?.shippingAddress || '',
      rentalStartDate: quotationData?.rentalStartDate || qDate,
      rentalEndDate: quotationData?.rentalEndDate || quotationData?.rentalStartDate || qDate,
      items,
      subtotal,
      discountAmount,
      shippingFee,
      depositAmount,
      taxAmount,
      grandTotal,
      status: existingQuotation?.status || 'WAITING',
    }

    addQuotation(newQuotation)

    showToast('บันทึกใบเสนอราคาสำเร็จ', `สร้างใบเสนอราคา ${newQuotation.quotationNo} เรียบร้อยแล้ว`, 'SUCCESS')
    router.push('/quotations')
  }

  const handleExitQuotationMode = () => {
    router.push('/quotations')
  }

  const cartTotalItems = cartItems.reduce((sum, i) => sum + (i.quantity || 0), 0)

  return (
    <div className="h-full p-2 bg-slate-100 dark:bg-[#07111f] flex flex-col gap-2 overflow-hidden min-h-0">
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
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2 overflow-hidden">
        {/* Small Mobile View Toggle (< 768px) */}
        <div className={`md:hidden ${TAB_CONTAINER_CLASSES} w-full`}>
          <button
            onClick={() => setMobileTab('PRODUCTS')}
            className={`flex-1 ${TAB_BUTTON_BASE_CLASSES} ${
              mobileTab === 'PRODUCTS'
                ? TAB_BUTTON_ACTIVE_CLASSES
                : TAB_BUTTON_INACTIVE_CLASSES
            }`}
          >
            <Package className="w-4 h-4" />
            <span>เลือกสินค้า</span>
          </button>
          <button
            onClick={() => setMobileTab('CART')}
            className={`flex-1 ${TAB_BUTTON_BASE_CLASSES} ${
              mobileTab === 'CART'
                ? TAB_BUTTON_ACTIVE_CLASSES
                : TAB_BUTTON_INACTIVE_CLASSES
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
            items={cartItems}
            setItems={setCartItems}
            customer={selectedCustomer}
            setCustomer={setSelectedCustomer}
            onAddCustomer={handleAddCustomer}
            onCheckout={handleCheckout}
            isQuotationMode={isQuotationMode}
            onSaveQuotation={handleSaveQuotation}
            quotationId={quotationId || undefined}
            quotationNo={loadedQuotationNo}
            draftBillId={draftBillId || undefined}
            initialDiscount={quotationValues.discount}
            initialShippingFee={quotationValues.shippingFee}
            initialDepositAmount={quotationValues.depositAmount}
            initialTaxRate={quotationValues.taxRate}
            initialShippingAddress={quotationValues.shippingAddress}
            initialRentalStartDate={quotationValues.rentalStartDate}
            initialRentalEndDate={quotationValues.rentalEndDate}
          />
        </div>
      </div>

      {/* Quantity Modal */}
      {selectedProduct && (
        <QuantityModal
          product={selectedProduct}
          mode={selectedProductMode}
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

