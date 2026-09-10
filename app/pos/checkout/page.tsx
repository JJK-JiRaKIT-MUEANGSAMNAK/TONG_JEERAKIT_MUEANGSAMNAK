'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RentalBillTemplate, BillTemplateData } from '@/templates/rental-bill/RentalBillTemplate'
import { A4FitPreview } from '@/components/pos/A4FitPreview'
import {
  ArrowLeft,
  FileCheck,
  CreditCard,
  FileText,
} from 'lucide-react'
import { PaymentMethodSelector } from '@/components/pos/payment/PaymentMethodSelector'
import { PaymentDynamicContent } from '@/components/pos/payment/PaymentDynamicContent'
import { RentalBill, Customer, Product } from '@/lib/types/rental-pos'
import { useToast } from '@/components/common/Toast'
import { PostSavePrintModal } from '@/components/common/PostSavePrintModal'
import { loadActiveCart, clearActiveCart } from '@/lib/cart-storage'
import { addBill } from '@/lib/bill-storage'
import { rentProductStock } from '@/lib/product-storage'
import { recordBillPayment } from '@/lib/finance-storage'
import { FullBill } from '@/lib/types/rental-return'

const safeFormatDateStr = (d?: Date | string | null): string => {
  if (!d) return '-'
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return '-'
    return dt.toISOString().split('T')[0]
  } catch {
    return '-'
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [items, setItems] = useState<Array<{
    product: Product
    quantity: number
    unitPrice: number
    rentalType: 'NORMAL' | 'DAILY' | 'SALE'
    usageCount?: number
    billableDays?: number
    dailyStartDate?: Date | string | null
    dailyEndDate?: Date | string | null
    lineTotal: number
  }>>([])
  const [billDate, setBillDate] = useState<Date | null>(new Date())
  const [headerRentalDate, setHeaderRentalDate] = useState<Date | null>(new Date())
  const [headerReturnDate, setHeaderReturnDate] = useState<Date | null>(null)
  const [discount, setDiscount] = useState<number>(0)
  const [shippingFee, setShippingFee] = useState<number>(0)
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const [documentType, setDocumentType] = useState<string>('บิลเช่า')
  const [shippingAddress, setShippingAddress] = useState<string>('')
  const [remark, setRemark] = useState<string>('')
  const [tax, setTax] = useState<number>(0)

  useEffect(() => {
    const cart = loadActiveCart()
    if (cart) {
      if (cart.customer) setCustomer(cart.customer)
      if (cart.items && cart.items.length > 0) setItems(cart.items)
      if (cart.discount !== undefined) setDiscount(cart.discount)
      if (cart.shippingFee !== undefined) setShippingFee(cart.shippingFee)
      if (cart.depositAmount !== undefined) setDepositAmount(cart.depositAmount)
      if (cart.documentType) setDocumentType(cart.documentType)
      if (cart.shippingAddress) setShippingAddress(cart.shippingAddress)
      if (cart.remark) setRemark(cart.remark)
      if (cart.headerRentalDate) setHeaderRentalDate(new Date(cart.headerRentalDate))
      if (cart.headerReturnDate) setHeaderReturnDate(new Date(cart.headerReturnDate))
      if (cart.tax !== undefined) setTax(cart.tax)
    }
  }, [])

  const subtotal = items.reduce((sum, it) => sum + (it.lineTotal || 0), 0)
  const grandTotal = Math.max(0, subtotal - (discount || 0) + (shippingFee || 0) + (depositAmount || 0) + (tax || 0))

  const clearCart = () => {
    clearActiveCart()
    setItems([])
    setCustomer(null)
  }

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'QR' | 'UNPAID'>('CASH')
  const [receivedCashInput, setReceivedCashInput] = useState<string>('')
  const [bankRef, setBankRef] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [savedBill, setSavedBill] = useState<RentalBill | null>(null)

  // Post-Save Print Confirmation Modal State
  const [postSavePrintModal, setPostSavePrintModal] = useState<{
    isOpen: boolean
    title: string
    description: string
  }>({
    isOpen: false,
    title: '',
    description: '',
  })

  // QR Code State
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isQrLoading, setIsQrLoading] = useState<boolean>(false)
  const [qrError, setQrError] = useState<string | null>(null)

  const promptPayId = ''
  const [mobileTab, setMobileTab] = useState<'PAYMENT' | 'PREVIEW'>('PAYMENT')

  const handleGenerateQR = useCallback(async () => {
    setQrCodeUrl('')
  }, [])

  const receivedCash = receivedCashInput === '' ? grandTotal : (parseFloat(receivedCashInput) || 0)
  const changeAmount = paymentMethod === 'CASH' ? Math.max(0, receivedCash - grandTotal) : 0

  // Format template data for live preview
  const billData: BillTemplateData = {
    documentTitle: documentType || 'บิลเช่า',
    businessName: 'บริษัท อุปกรณ์ก่อสร้างและจัดเลี้ยง ให้เช่า จำกัด',
    businessAddress: '99/9 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
    businessTaxId: '0105560001234',
    businessPhone: '02-123-4567',
    customerName: customer?.customerName || 'ลูกค้าทั่วไป',
    customerAddress: customer?.address,
    customerPhone: customer?.phone,
    customerTaxId: customer?.taxId,
    billNo: `BILL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-DRAFT`,
    billDate: safeFormatDateStr(billDate),
    headerRentalDate: safeFormatDateStr(headerRentalDate),
    headerReturnDate: safeFormatDateStr(headerReturnDate),
    siteName: shippingAddress ? shippingAddress.trim() : undefined,

    items: items.map((i) => ({
      code: i.product.product_code || i.product.code,
      name: i.product.product_name || i.product.name,
      quantity: i.quantity,
      unit: i.product.unit_name || i.product.unit || 'ชิ้น',
      price: i.unitPrice,
      rentalType: i.rentalType,
      usageCount: i.usageCount,
      billableDays: i.billableDays,
      dailyStartDate: safeFormatDateStr(i.dailyStartDate),
      dailyEndDate: safeFormatDateStr(i.dailyEndDate),
      lineTotal: i.lineTotal,
    })),
    subtotal,
    discount: discount || 0,
    shippingFee: shippingFee || 0,
    taxAmount: tax,
    depositAmount: depositAmount || 0,
    grandTotal,
    paidAmount: paymentMethod === 'UNPAID' ? 0 : grandTotal,
    outstandingAmount: paymentMethod === 'UNPAID' ? grandTotal : 0,
    remark: remark || undefined,
  }

  const handleConfirmBill = async () => {
    if (items.length === 0) {
      showToast('ไม่สามารถออกบิลได้', 'ไม่มีรายการสินค้าในตะกร้า', 'ERROR')
      return
    }

    setIsSubmitting(true)
    try {
      const now = new Date()
      const billNo = `BILL-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(1000 + Math.random() * 9000))}`
      const isUnpaid = paymentMethod === 'UNPAID'
      const paid = isUnpaid ? 0 : grandTotal
      const outstanding = isUnpaid ? grandTotal : 0

      const allItemsAreSale = items.length > 0 && items.every((it) => it.rentalType === 'SALE' || it.product.rentalType === 'SALE')

      const newFullBill: FullBill = {
        id: 'bill-' + Date.now(),
        billNo: billNo,
        billDate: now.toISOString().split('T')[0],
        customerId: customer?.id,
        customerName: customer?.customerName || 'ลูกค้าทั่วไป',
        customerPhone: customer?.phone || '-',
        customerAddress: customer?.address || shippingAddress || '-',
        rentalStartDate: headerRentalDate ? safeFormatDateStr(headerRentalDate) : now.toISOString().split('T')[0],
        scheduledReturnDate: headerReturnDate ? safeFormatDateStr(headerReturnDate) : now.toISOString().split('T')[0],
        heldDepositAmount: depositAmount,
        paidDepositAmount: depositAmount,
        deposits: depositAmount > 0 ? [{
          id: `dep-${Date.now()}`,
          amount: depositAmount,
          refundAmount: 0,
          appliedAmount: 0,
          heldAmount: depositAmount,
          status: 'HELD',
          receivedDate: now.toISOString().split('T')[0],
          paymentMethod: isUnpaid ? null : paymentMethod,
          referenceNo: null,
        }] : [],
        subtotal: subtotal,
        discountAmount: discount,
        shippingFee: shippingFee,
        taxAmount: tax,
        grandTotal: grandTotal,
        paidAmount: paid,
        outstandingAmount: outstanding,
        rentalStatus: allItemsAreSale ? 'CLOSED' : 'RENTING',
        paymentStatus: isUnpaid ? 'UNPAID' : 'PAID',
        remark: remark || undefined,
        items: items.map((it, idx) => {
          const isSale = it.rentalType === 'SALE' || it.product.rentalType === 'SALE'
          return {
            rentalBillItemId: `item-${Date.now()}-${idx}`,
            productId: it.product.id,
            productCode: it.product.code,
            productName: it.product.name,
            quantity: it.quantity,
            returnedQty: 0,
            outstandingQty: isSale ? 0 : it.quantity,
            dailyRate: it.unitPrice,
            unit: it.product.unit || 'ชิ้น',
            defaultRepairFee: it.product.defaultDamageFee || 0,
            defaultReplacementFee: it.product.defaultLossFee || 0,
            requiresReturn: isSale ? false : (it.product.requiresReturn ?? true),
            rentalStartDate: headerRentalDate ? safeFormatDateStr(headerRentalDate) : now.toISOString().split('T')[0],
            scheduledReturnDate: headerReturnDate ? safeFormatDateStr(headerReturnDate) : now.toISOString().split('T')[0],
            rentalType: it.rentalType,
            usageCount: it.usageCount,
            lineTotal: it.lineTotal,
            status: isSale ? ('COMPLETED' as const) : ('RENTING' as const),
          }
        }),
      }

      addBill(newFullBill)

      items.forEach((it) => {
        rentProductStock(it.product.id, it.quantity, it.rentalType === 'SALE' || it.product.rentalType === 'SALE')
      })

      if (!isUnpaid && grandTotal > 0) {
        recordBillPayment(newFullBill.id, newFullBill.billNo, grandTotal, paymentMethod, newFullBill.customerName)
      }

      clearCart()

      const billTitle = allItemsAreSale ? 'บันทึกการขายสำเร็จ' : 'บันทึกบิลเช่าสำเร็จ'
      const billDesc = allItemsAreSale
        ? `บันทึกข้อมูลบิลขาย ${billNo} เรียบร้อยแล้ว\nต้องการพิมพ์ใบเสร็จรับเงิน / ใบส่งของหรือไม่?`
        : `บันทึกข้อมูลบิลเช่า ${billNo} เรียบร้อยแล้ว\nต้องการพิมพ์สัญญาเช่า / ใบส่งของหรือไม่?`

      showToast(billTitle, `เลขที่บิล: ${billNo}`, 'SUCCESS')
      setPostSavePrintModal({
        isOpen: true,
        title: billTitle,
        description: billDesc,
      })
    } catch (err) {
      console.error('Failed to confirm bill:', err)
      showToast('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกบิลได้', 'ERROR')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/pos')
  }

  return (
    <div className="pos-checkout-print-root flex h-full min-h-0 w-full flex-1 flex-col bg-slate-100 p-2 sm:p-2.5 dark:bg-slate-900 md:grid md:h-full md:max-h-full md:min-h-0 md:grid-cols-[minmax(0,58fr)_minmax(300px,42fr)] lg:grid-cols-[minmax(0,60fr)_minmax(340px,40fr)] md:gap-2.5 md:overflow-hidden lg:gap-3 lg:p-3">
      {/* Mobile View Switcher (< md screens) */}
      <div className="md:hidden flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 mb-1.5">
        <button
          type="button"
          onClick={() => setMobileTab('PAYMENT')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'PAYMENT'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>ฟอร์มชำระเงิน</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('PREVIEW')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'PREVIEW'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>ดูตัวอย่างบิล A4</span>
        </button>
      </div>

      {/* Left: real A4 preview. The A4 sheet never scrolls; it is scaled to fit available space. */}
      <div className={`h-full min-h-0 w-full flex-1 overflow-hidden flex-col bg-slate-100/60 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-slate-800 ${
        mobileTab === 'PREVIEW' ? 'flex' : 'hidden md:flex'
      }`}>
        <div className="flex-1 min-h-0 w-full h-full overflow-hidden">
          <A4FitPreview
            paddingPx={1}
            className="h-full w-full"
            align="center"
          >
            <RentalBillTemplate data={billData} />
          </A4FitPreview>
        </div>
      </div>

      {/* Right Column - Payment Panel */}
      <div className={`mt-0 flex min-h-0 min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800 md:mt-0 md:h-full md:p-3.5 lg:p-4 ${
        mobileTab === 'PAYMENT' ? 'flex flex-1' : 'hidden md:flex'
      }`}>
        
        <div className="flex min-h-0 flex-1 flex-col space-y-2 sm:space-y-2.5 overflow-hidden">
          {/* Header */}
          <div className="flex shrink-0 min-w-0 items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-700">
            <Link
              href="/pos"
              className="flex shrink-0 items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">ย้อนกลับไป POS</span>
            </Link>
            <h3 className="shrink-0 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-base">
              ชำระเงินปิดเช่า
            </h3>
          </div>

          {/* Amount Due Card */}
          <div className="shrink-0 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-2.5 sm:p-3 text-white shadow-lg lg:p-3.5">
            <span className="text-[11px] sm:text-xs text-blue-100 block font-medium">ยอดสุทธิที่ต้องรับชำระ</span>
            <span className="whitespace-nowrap text-2xl sm:text-3xl font-black tracking-tight block">
              ฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
            {customer && (
              <div className="mt-1.5 pt-1.5 border-t border-blue-400/30 text-xs text-blue-100 flex items-center justify-between gap-2 min-w-0">
                <span className="truncate min-w-0">ลูกค้า: {customer.customerName}</span>
                <span className="shrink-0 font-mono text-[11px]">{customer.phone}</span>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
          />

          {/* Dynamic Inputs per Method */}
          <PaymentDynamicContent
            paymentMethod={paymentMethod}
            targetAmount={grandTotal}
            receivedCashInput={receivedCashInput}
            onReceivedCashInputChange={setReceivedCashInput}
            changeAmount={changeAmount}
            bankRef={bankRef}
            onBankRefChange={setBankRef}
            qrCodeUrl={qrCodeUrl}
            isQrLoading={isQrLoading}
            qrError={qrError}
            onRetryQr={handleGenerateQR}
            promptPayId={promptPayId}
          />
        </div>

        {/* Action Buttons Group (Confirm, Cancel) */}
        <div className="flex shrink-0 flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={handleConfirmBill}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 sm:py-3 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 min-h-[44px] cursor-pointer"
          >
            <FileCheck className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap">{isSubmitting ? 'กำลังบันทึกบิล...' : 'ยืนยันออกบิลเช่า'}</span>
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="w-full rounded-xl bg-slate-100 dark:bg-slate-700/80 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.99] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all min-h-[36px] cursor-pointer"
          >
            <span className="whitespace-nowrap">ยกเลิก</span>
          </button>
        </div>

      </div>

      {/* Post-Save Print Confirmation Modal */}
      <PostSavePrintModal
        isOpen={postSavePrintModal.isOpen}
        title={postSavePrintModal.title}
        description={postSavePrintModal.description}
        onPrint={() => {
          window.print()
          clearCart()
          setPostSavePrintModal({ isOpen: false, title: '', description: '' })
          router.push('/pos')
        }}
        onClose={() => {
          clearCart()
          setPostSavePrintModal({ isOpen: false, title: '', description: '' })
          router.push('/pos')
        }}
      />

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html,
          body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
          }

          body * {
            visibility: hidden !important;
          }

          #pos-print-document,
          #pos-print-document * {
            visibility: visible !important;
          }

          #pos-print-document {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            transform: none !important;
            transform-origin: top left !important;
            overflow: hidden !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pos-a4-fit-stage {
            width: 210mm !important;
            height: 297mm !important;
          }

          .pos-a4-fit-viewport {
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  )
}


