'use client'

import React, { useState, useEffect } from 'react'
import { Customer, Product } from '@/lib/types/rental-pos'
import {
  Trash2,
  UserPlus,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react'
import { useToast } from '@/components/common/Toast'
import { NewCustomerModal } from '@/components/customers/NewCustomerModal'
import { CalendarPanel } from '@/components/common/CustomDatePicker'
import { CustomSelect, SelectOption } from '@/components/common/CustomSelect'
import { NumericInput } from '@/components/common/NumericInput'
import { CustomerUnifiedSelector } from '@/components/pos/CustomerUnifiedSelector'

export interface CartItem {
  id: string
  product: Product
  rentalType: 'NORMAL' | 'DAILY' | 'SALE'
  quantity: number
  unitPrice: number
  usageCount: number
  billableDays?: number
  lineTotal: number
}

interface CartPanelProps {
  onCheckout: () => void
  customers?: Customer[]
  onAddCustomer?: (newCustomer: Customer) => void
  isQuotationMode?: boolean
  onSaveQuotation?: () => void
}

export function CartPanel({
  onCheckout,
  customers = [],
  onAddCustomer,
  isQuotationMode = false,
  onSaveQuotation
}: CartPanelProps) {
  const { showToast } = useToast()
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState<number>(0)
  const [shippingFee, setShippingFee] = useState<number>(0)
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(0)
  const [shippingAddress, setShippingAddress] = useState<string>('')
  const [headerRentalDate, setHeaderRentalDate] = useState<Date | null>(new Date())
  const [headerReturnDate, setHeaderReturnDate] = useState<Date | null>(new Date())
  const [documentType, setDocumentType] = useState<string>('บิลเช่า')
  const [documentDate, setDocumentDate] = useState<Date | null>(new Date())

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }
  const clearCart = () => {
    setItems([])
    setCustomer(null)
  }

  const subtotal = items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0)
  const tax = subtotal * (taxRate || 0)
  const grandTotal = Math.max(0, subtotal - (discount || 0) + (shippingFee || 0) + (depositAmount || 0) + tax)

  const [customerList, setCustomerList] = useState<Customer[]>(customers)
  
  // Add Customer Modal State
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false)

  // Sequential Date Picker State
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false)
  const [dateStep, setDateStep] = useState<number>(0) // 0=Document, 1=Rental, 2=Return

  // Sync prop changes
  useEffect(() => {
    if (customers.length > 0) {
      setCustomerList(customers)
    }
  }, [customers])

  const handleOpenAddCustomerModal = () => {
    setShowAddCustomerModal(true)
  }

  const vatOptions: SelectOption[] = [
    { value: 0, label: 'ไม่มี VAT (0%)' },
    { value: 0.07, label: 'VAT 7%' },
  ]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
      
      {/* Top Header & Customer Selector & Dates */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isQuotationMode ? (
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {isQuotationMode ? 'รายการใบเสนอราคา' : 'ตะกร้าเช่าสินค้า'}
            </h3>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
            >
              ล้างตะกร้า
            </button>
          )}
        </div>

        {/* 4-Row Cart Header Controls */}
        <div className="space-y-2">
          {/* Row 1: Unified Customer Selector (Full Width) */}
          <div className="w-full">
            <CustomerUnifiedSelector
              selectedCustomer={customer}
              customers={customerList}
              onSelectCustomer={(cust) => {
                if (cust?.isSuspended) {
                  showToast('ลูกค้าถูกระงับสิทธิ์', `ลูกค้า ${cust.customerName} ถูกระงับสิทธิ์ ไม่สามารถทำรายการเช่าได้`, 'ERROR')
                  setCustomer(null)
                  return
                }
                setCustomer(cust)
              }}
            />
          </div>

          {/* Row 2: Shipping Address / Project (Full Width) */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="สถานที่จัดส่ง / โครงการ..."
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Row 3: Document Type (Left) + Add Customer Button (Right) */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1 min-w-0">
              <CustomSelect
                value={documentType}
                onChange={setDocumentType}
                options={[
                  { value: 'บิลเช่า', label: 'บิลเช่า' },
                  { value: 'ใบเสนอราคา', label: 'ใบเสนอราคา' },
                  { value: 'ใบแจ้งหนี้', label: 'ใบแจ้งหนี้' },
                  { value: 'ใบเสร็จรับเงิน', label: 'ใบเสร็จรับเงิน' },
                  { value: 'ใบส่งของ', label: 'ใบส่งของ' },
                ]}
                placeholder="ประเภทเอกสาร"
                align="left"
              />
            </div>
            <button
              type="button"
              onClick={handleOpenAddCustomerModal}
              className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 shrink-0 shadow-sm transition-all whitespace-nowrap"
              title="เพิ่มลูกค้าใหม่"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ เพิ่มลูกค้า</span>
            </button>
          </div>

          {/* Row 4: Date Picker (Full Width) */}
          <div>
            <button
              type="button"
              onClick={() => {
                setDateStep(0)
                setShowDatePicker(true)
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[10px] sm:text-[11px] font-bold flex items-center justify-between shadow-xs hover:border-emerald-500 transition-colors"
            >
              <div className="flex items-center gap-2 flex-wrap min-w-0 leading-tight">
                <span className="text-emerald-600 whitespace-nowrap">📝 {documentDate ? documentDate.toLocaleDateString('th-TH', {day:'2-digit', month:'2-digit'}) : '--/--'}</span>
                <span className="text-blue-600 whitespace-nowrap">🟢 {headerRentalDate ? headerRentalDate.toLocaleDateString('th-TH', {day:'2-digit', month:'2-digit'}) : '--/--'}</span>
                <span className="text-red-600 whitespace-nowrap">🔴 {headerReturnDate ? headerReturnDate.toLocaleDateString('th-TH', {day:'2-digit', month:'2-digit'}) : '--/--'}</span>
              </div>
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">ตะกร้ายังว่างอยู่</p>
            <p className="text-xs text-slate-400 mt-0.5">เลือกสินค้าจากรายการด้านซ้ายเพื่อเพิ่มในตะกร้า</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-start justify-between gap-2 group"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {item.product.product_name}
                  </span>
                  <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    ฿{item.lineTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Calculation detail */}
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {item.rentalType === 'DAILY' ? (
                    <span className="text-blue-600 dark:text-blue-400">
                      ฿{item.unitPrice.toLocaleString('th-TH')} × {item.quantity} {item.product.unit_name || 'ชุด'} × {item.billableDays} วัน
                    </span>
                  ) : item.rentalType === 'NORMAL' ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ฿{item.unitPrice.toLocaleString('th-TH')} × {item.quantity} {item.product.unit_name || 'ชิ้น'} × {item.usageCount} รอบ
                    </span>
                  ) : (
                    <span className="text-purple-600 dark:text-purple-400 font-bold">
                      ฿{item.unitPrice.toLocaleString('th-TH')} × {item.quantity} {item.product.unit_name || 'ชิ้น'} (ขายขาด)
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                title="ลบรายการ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Adjustments & Totals Summary */}
      {items.length > 0 && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 space-y-2.5">
          
          {/* Quick Adjustments: Discount, Shipping, Deposit, VAT */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">ส่วนลด (บาท)</span>
              <NumericInput
                value={discount || ''}
                onChange={(val) => {
                  if (val === '') {
                    setDiscount(0)
                    return
                  }
                  setDiscount(val)
                }}
                defaultValueOnBlur={0}
                min={0}
                placeholder="0"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">ค่าขนส่ง (บาท)</span>
              <NumericInput
                value={shippingFee || ''}
                onChange={(val) => setShippingFee(val === '' ? 0 : val)}
                defaultValueOnBlur={0}
                min={0}
                placeholder="0"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">เงินมัดจำ (บาท)</span>
              <NumericInput
                value={depositAmount || ''}
                onChange={(val) => setDepositAmount(val === '' ? 0 : val)}
                defaultValueOnBlur={0}
                min={0}
                placeholder="0"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Central CustomSelect for VAT */}
            <div>
              <span className="text-slate-500 block mb-0.5">ภาษี VAT</span>
              <CustomSelect
                value={taxRate}
                onChange={(val) => setTaxRate(Number(val))}
                options={vatOptions}
                align="right"
                direction="up"
              />
            </div>

          </div>

          {/* Breakdown summary */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>ยอดสินค้าก่อนหักส่วนลด</span>
              <span className="font-semibold">฿{subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>ส่วนลด</span>
                <span>-฿{discount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {shippingFee > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>ค่าขนส่ง</span>
                <span>+฿{shippingFee.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>ภาษี VAT (7%)</span>
                <span>+฿{tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {depositAmount > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                <span>เงินมัดจำประกันความเสียหาย</span>
                <span>฿{depositAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {isQuotationMode ? 'ยอดรวมใบเสนอราคา' : 'ยอดสุทธิที่ต้องชำระ'}
              </span>
              <span className="font-black text-xl text-blue-600 dark:text-blue-400 whitespace-nowrap">
                ฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-1 grid grid-cols-2 gap-2">
            {isQuotationMode ? (
              <button
                type="button"
                onClick={onSaveQuotation}
                disabled={items.length === 0}
                className="w-full col-span-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>บันทึกใบเสนอราคา</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onCheckout}
                disabled={items.length === 0}
                className="w-full col-span-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>ชำระเงิน</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

      {/* Add New Customer Modal (Enhanced Customer Model with Thai Address & ID Card) */}
      <NewCustomerModal
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onSave={(newC) => {
          if (onAddCustomer) {
            onAddCustomer(newC)
          } else {
            setCustomer(newC)
          }
          showToast('เพิ่มลูกค้าสำเร็จ', `เลือกลูกค้า ${newC.customerName} เข้าสู่ตะกร้าเรียบร้อยแล้ว`, 'SUCCESS')
        }}
      />

      {/* Sequential Date Picker Modal */}
      {showDatePicker && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDatePicker(false)
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 cursor-default"
          >
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {dateStep === 0 && '📝 เลือกวันที่ออกเอกสาร'}
                {dateStep === 1 && '🟢 เลือกวันเริ่มเช่า'}
                {dateStep === 2 && '🔴 เลือกวันที่กำหนดคืน'}
              </h3>
              <p className="text-xs text-slate-500">
                ขั้นตอนที่ {dateStep + 1} จาก 3
              </p>
            </div>
            
            <div className="flex justify-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-inner">
               <CalendarPanel
                 value={dateStep === 0 ? documentDate : dateStep === 1 ? headerRentalDate : headerReturnDate}
                 onChange={(d) => {
                   if (dateStep === 0) {
                     setDocumentDate(d)
                     setHeaderRentalDate(null)
                     setHeaderReturnDate(null)
                     setDateStep(1)
                   } else if (dateStep === 1) {
                     setHeaderRentalDate(d)
                     setHeaderReturnDate(null)
                     setDateStep(2)
                   } else {
                     setHeaderReturnDate(d)
                     setShowDatePicker(false)
                     setDateStep(0)
                   }
                 }}
                 showClear={false}
                 showToday={true}
                 className="shadow-none border-0 p-0 w-full bg-transparent dark:bg-transparent"
               />
            </div>
            
            {/* Actions: Back Button (for Steps 2 & 3) + Cancel Button */}
            <div className="flex items-center gap-2">
              {dateStep > 0 && (
                <button
                  type="button"
                  onClick={() => setDateStep((prev) => (prev > 0 ? prev - 1 : 0))}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  ย้อนกลับ
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className={`${dateStep > 0 ? 'flex-1' : 'w-full'} py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center`}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
