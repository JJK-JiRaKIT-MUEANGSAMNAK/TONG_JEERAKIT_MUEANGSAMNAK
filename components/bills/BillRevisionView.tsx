'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  CalendarPlus,
  Edit3,
  Plus,
  Trash2,
  ChevronLeft,
  Calendar,
  Package,
  AlertCircle,
  Save,
  Clock,
  DollarSign,
} from 'lucide-react'
import { FullBill } from '@/lib/types/rental-return'
import { useToast } from '@/components/common/Toast'
import { CustomDatePicker, getLocalDateString, parseLocalDate } from '@/components/common/CustomDatePicker'
import { CustomSelect, SelectOption } from '@/components/common/CustomSelect'
import { NumericInput } from '@/components/common/NumericInput'
import { logger } from '@/lib/utils/logger'
import { loadProducts } from '@/lib/product-storage'
import { useAuth } from '@/lib/contexts/AuthContext'
import { processBillRevisionWorkflow } from '@/lib/bill-workflow-service'

export type BillRevisionMode = 'CORRECTION' | 'EXTENSION'

interface BillRevisionViewProps {
  bill: FullBill
  mode: BillRevisionMode
  onClose: () => void
  onSaved: () => void | Promise<void>
}

interface EditableItem {
  rentalBillItemId?: string
  productId: string
  productName: string
  rentalType: 'NORMAL' | 'DAILY' | 'SALE'
  quantity: number
  returnedQty: number
  outstandingQty: number
  unitPrice: number
  usageCount: number
  dailyStartDate: string
  dailyEndDate: string
  scheduledReturnDate: string
  action: 'UPDATE' | 'ADD' | 'REMOVE'
  addRounds: number
  unitName?: string
}

interface ProductOption {
  id: string
  name: string
  code: string
  rentalType: 'NORMAL' | 'DAILY' | 'SALE'
  normalPrice: number
  dailyPrice: number
  salePrice: number
  unitName?: string
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `req-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function localDate(value?: string | null): string {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  if (!a || !b) return 1
  const start = new Date(`${a}T00:00:00`)
  const end = new Date(`${b}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000)
  return Math.max(1, diffDays)
}

export function BillRevisionView({ bill, mode, onClose, onSaved }: BillRevisionViewProps) {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [headerRentalDate, setHeaderRentalDate] = useState<string>('')
  const [headerReturnDate, setHeaderReturnDate] = useState<string>('')
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [shippingFee, setShippingFee] = useState<number>(0)
  const [items, setItems] = useState<EditableItem[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  // Initialize data from bill
  useEffect(() => {
    if (!bill) return
    setReason('')
    setHeaderRentalDate(localDate(bill.rentalStartDate) || getLocalDateString(new Date()))
    setHeaderReturnDate(localDate(bill.scheduledReturnDate) || getLocalDateString(new Date()))
    setDiscountAmount(Number(bill.discountAmount || 0))
    setShippingFee(Number(bill.shippingFee || 0))
    setItems(
      bill.items.map((item) => ({
        rentalBillItemId: item.rentalBillItemId,
        productId: item.productId,
        productName: item.productName,
        rentalType: (item.rentalType || 'NORMAL') as 'NORMAL' | 'DAILY' | 'SALE',
        quantity: item.quantity,
        returnedQty: item.returnedQty,
        outstandingQty: item.outstandingQty,
        unitPrice: Number(item.dailyRate || 0),
        usageCount: Number(item.usageCount || 1),
        dailyStartDate: localDate(item.rentalStartDate) || localDate(bill.rentalStartDate) || getLocalDateString(new Date()),
        dailyEndDate: localDate(item.scheduledReturnDate) || localDate(bill.scheduledReturnDate) || getLocalDateString(new Date()),
        scheduledReturnDate: localDate(item.scheduledReturnDate || bill.scheduledReturnDate) || getLocalDateString(new Date()),
        action: 'UPDATE',
        addRounds: 0,
        unitName: item.unit || 'ชิ้น',
      }))
    )
  }, [bill, mode])

  // Load product list for combobox
  useEffect(() => {
    const list = loadProducts()
    setProducts(
      list.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        rentalType: p.rentalType,
        normalPrice: p.normalPrice,
        dailyPrice: p.dailyPrice,
        salePrice: p.salePrice ?? 0,
        unitName: p.unit,
      }))
    )
  }, [])

  // Product select options (showing ONLY product name as requested)
  const productSelectOptions: SelectOption[] = useMemo(() => {
    return products.map((p) => ({
      value: p.id,
      label: p.name,
    }))
  }, [products])

  const activeItems = useMemo(() => items.filter((item) => item.action !== 'REMOVE'), [items])

  // Live Subtotal Calculation
  const calculatedSubtotal = useMemo(() => {
    return activeItems.reduce((sum, item) => {
      if (item.rentalType === 'DAILY') {
        const days = daysBetween(item.dailyStartDate, item.dailyEndDate)
        return sum + item.quantity * item.unitPrice * days
      }
      if (item.rentalType === 'SALE') {
        return sum + item.quantity * item.unitPrice
      }
      // NORMAL rental
      return sum + item.quantity * item.unitPrice * (item.usageCount || 1)
    }, 0)
  }, [activeItems])

  const calculatedGrandTotal = useMemo(() => {
    const sub = Math.max(0, calculatedSubtotal - (discountAmount || 0) + (shippingFee || 0))
    return sub + (bill?.heldDepositAmount || 0)
  }, [calculatedSubtotal, discountAmount, shippingFee, bill])

  const updateItem = (index: number, patch: Partial<EditableItem>) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        const updated = { ...item, ...patch }

        // If returnedQty or outstandingQty changed, keep quantity synchronized
        if (patch.returnedQty !== undefined || patch.outstandingQty !== undefined) {
          const ret = patch.returnedQty !== undefined ? patch.returnedQty : item.returnedQty
          const out = patch.outstandingQty !== undefined ? patch.outstandingQty : item.outstandingQty
          updated.quantity = Math.max(1, ret + out)
        }

        // If quantity changed directly, update outstandingQty
        if (patch.quantity !== undefined && patch.outstandingQty === undefined) {
          updated.outstandingQty = Math.max(0, patch.quantity - (item.returnedQty || 0))
        }

        return updated
      })
    )
  }

  const addProduct = () => {
    if (!selectedProductId) return
    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return
    const unitPrice =
      product.rentalType === 'DAILY'
        ? product.dailyPrice
        : product.rentalType === 'SALE'
          ? product.salePrice
          : product.normalPrice

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        rentalType: product.rentalType,
        quantity: 1,
        returnedQty: 0,
        outstandingQty: product.rentalType === 'SALE' ? 0 : 1,
        unitPrice,
        usageCount: 1,
        dailyStartDate: headerRentalDate || getLocalDateString(new Date()),
        dailyEndDate: headerReturnDate || getLocalDateString(new Date()),
        scheduledReturnDate: headerReturnDate || getLocalDateString(new Date()),
        action: 'ADD',
        addRounds: 0,
        unitName: product.unitName || 'ชิ้น',
      },
    ])
    setSelectedProductId('')
  }

  const handleSave = async () => {
    if (!bill) return
    if (!reason.trim()) {
      showToast('กรุณาระบุเหตุผล', 'ต้องบันทึกเหตุผลทุกครั้งเพื่อใช้ตรวจสอบย้อนหลัง', 'ERROR')
      return
    }
    if (!headerReturnDate) {
      showToast('กรุณาระบุวันกำหนดคืน', 'ไม่พบวันกำหนดคืนที่ต้องการบันทึก', 'ERROR')
      return
    }

    setIsSaving(true)
    try {
      processBillRevisionWorkflow({
        billId: bill.id,
        mode,
        reason,
        headerRentalDate,
        headerReturnDate,
        discountAmount,
        shippingFee,
        items,
        actor: {
          userId: user?.userId || 'system',
          displayName: user?.displayName || 'ระบบ',
        },
      })

      showToast(
        mode === 'EXTENSION' ? 'บันทึกการเช่าต่อสำเร็จ' : 'แก้ไขบิลสำเร็จ',
        'บันทึกข้อมูลและประวัติการแก้ไขเรียบร้อยแล้ว',
        'SUCCESS'
      )
      await onSaved()
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการแก้ไขบิล', err?.message || 'ไม่สามารถบันทึกการแก้ไขบิลได้', 'ERROR')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* 1. Header Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">กลับ</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`p-2 rounded-xl text-white shrink-0 ${
                mode === 'EXTENSION' ? 'bg-cyan-600' : 'bg-violet-600'
              }`}
            >
              {mode === 'EXTENSION' ? <CalendarPlus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                <span>{mode === 'EXTENSION' ? 'เช่าต่อ / เพิ่มสินค้า' : 'แก้ไขบิลเช่า'}</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-black">{bill.billNo}</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                ลูกค้า: <strong className="text-slate-800 dark:text-slate-200">{bill.customerName}</strong> {bill.customerPhone ? `(${bill.customerPhone})` : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={isSaving || !reason.trim()}
            onClick={() => void handleSave()}
            className={`px-4 py-1.5 rounded-xl font-extrabold text-xs text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'EXTENSION'
                ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'กำลังบันทึก...' : mode === 'EXTENSION' ? 'ยืนยันเช่าต่อ' : 'บันทึกการแก้ไข'}</span>
          </button>
        </div>
      </div>

      {/* 2. Workspace Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-1.5 sm:p-2 md:p-2.5 space-y-2">
        {/* Top Info & Dates Card: Always 4 fields in 1 single row */}
        <div className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {/* Header Rental Date (Calendar Popover) */}
            <div className="space-y-1 min-w-0">
              <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 truncate">
                <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">วันที่เริ่มเช่า</span>
              </label>
              <CustomDatePicker
                value={parseLocalDate(headerRentalDate)}
                onChange={(val) => setHeaderRentalDate(val ? getLocalDateString(val) : '')}
                className="w-full text-xs"
              />
              <span className="text-[10px] text-slate-400 block truncate">* ไม่นำไปคำนวณเงิน</span>
            </div>

            {/* Header Return Date (Calendar Popover) */}
            <div className="space-y-1 min-w-0">
              <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 truncate">
                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">กำหนดคืน</span>
              </label>
              <CustomDatePicker
                value={parseLocalDate(headerReturnDate)}
                onChange={(val) => setHeaderReturnDate(val ? getLocalDateString(val) : '')}
                className="w-full text-xs"
              />
              <span className="text-[10px] text-slate-400 block truncate">* ไม่นำไปคำนวณเงิน</span>
            </div>

            {/* Discount Amount */}
            <div className="space-y-1 min-w-0">
              <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 truncate">
                <DollarSign className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">ส่วนลด (บาท)</span>
              </label>
              <NumericInput
                min={0}
                allowDecimals={true}
                value={discountAmount === 0 ? '' : discountAmount}
                defaultValueOnBlur={0}
                onChange={(val) => setDiscountAmount(val === '' ? 0 : Number(val))}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-xs font-mono font-bold text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-0"
              />
            </div>

            {/* Shipping Fee */}
            <div className="space-y-1 min-w-0">
              <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 truncate">
                <Package className="w-3 h-3 text-cyan-500 shrink-0" />
                <span className="truncate">ค่าขนส่ง (บาท)</span>
              </label>
              <NumericInput
                min={0}
                allowDecimals={true}
                value={shippingFee === 0 ? '' : shippingFee}
                defaultValueOnBlur={0}
                onChange={(val) => setShippingFee(val === '' ? 0 : Number(val))}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-xs font-mono font-bold text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-0"
              />
            </div>
          </div>
        </div>

        {/* Product Search & Add Toolbar */}
        <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 min-w-0">
            <CustomSelect
              value={selectedProductId}
              onChange={(val) => setSelectedProductId(String(val))}
              options={productSelectOptions}
              placeholder="-- พิมพ์ค้นหาหรือเลือกสินค้าที่ต้องการเพิ่ม --"
              searchable={true}
              className="w-full"
            />
          </div>
          <button
            type="button"
            disabled={!selectedProductId}
            onClick={addProduct}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสินค้าในบิล</span>
          </button>
        </div>

        {/* Items Table Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col">
          <div className="overflow-y-auto">
            <table className="w-full text-left border-collapse text-[10.5px] leading-tight">
              <colgroup>
                <col className="w-auto" /> {/* สินค้า */}
                <col className="w-[52px] sm:w-[60px]" />  {/* คืนแล้ว */}
                <col className="w-[52px] sm:w-[60px]" />  {/* กำลังเช่า */}
                <col className="w-[52px] sm:w-[60px]" />  {/* จำนวนในบิล */}
                <col className="w-[64px] sm:w-[76px]" />  {/* ราคาต่อหน่วย */}
                <col className="w-[96px] sm:w-[115px]" /> {/* วันที่เช่า */}
                <col className="w-[96px] sm:w-[115px]" /> {/* วันที่กำหนดคืน */}
                <col className="w-[40px] sm:w-[48px]" />  {/* รอบ */}
                <col className="w-[38px] sm:w-[44px]" />  {/* จัดการ */}
              </colgroup>
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-1.5 py-1.5 whitespace-nowrap">รายการสินค้า</th>
                  <th className="px-1 py-1.5 text-right whitespace-nowrap">คืนแล้ว</th>
                  <th className="px-1 py-1.5 text-right whitespace-nowrap">กำลังเช่า</th>
                  <th className="px-1 py-1.5 text-right whitespace-nowrap">จำนวน</th>
                  <th className="px-1 py-1.5 text-right whitespace-nowrap">ราคา/หน่วย</th>
                  <th className="px-1 py-1.5 text-center whitespace-nowrap">วันที่เช่า</th>
                  <th className="px-1 py-1.5 text-center whitespace-nowrap">กำหนดคืน</th>
                  <th className="px-1 py-1.5 text-center whitespace-nowrap">รอบ</th>
                  <th className="px-1 py-1.5 text-center whitespace-nowrap">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {items.map((item, index) => {
                  const isRemoved = item.action === 'REMOVE'
                  const isDaily = item.rentalType === 'DAILY'
                  const isNormal = item.rentalType === 'NORMAL'

                  return (
                    <tr
                      key={item.rentalBillItemId || `${item.productId}-${index}`}
                      className={`transition-colors ${
                        isRemoved
                          ? 'bg-red-50/40 dark:bg-red-950/20 opacity-50 line-through'
                          : item.action === 'ADD'
                            ? 'bg-emerald-50/30 dark:bg-emerald-950/20'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/30'
                      }`}
                    >
                      {/* Product Name */}
                      <td className="px-1.5 py-1 font-bold text-slate-900 dark:text-slate-100 overflow-hidden">
                        <div className="truncate">{item.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5 truncate">
                          <span
                            className={`px-1 py-0.2 rounded font-bold text-[10px] shrink-0 ${
                              isDaily
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : item.rentalType === 'SALE'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                            }`}
                          >
                            {isDaily ? 'รายวัน' : item.rentalType === 'SALE' ? 'ขายขาด' : 'ตามรอบ'}
                          </span>
                          <span className="truncate">หน่วย: {item.unitName || 'ชิ้น'}</span>
                        </div>
                      </td>

                      {/* Returned Qty (Editable, snug fit) */}
                      <td className="px-1 py-1">
                        <NumericInput
                          disabled={isRemoved}
                          min={0}
                          allowDecimals={false}
                          value={item.returnedQty === 0 ? '' : item.returnedQty}
                          defaultValueOnBlur={0}
                          onChange={(val) =>
                            updateItem(index, { returnedQty: val === '' ? 0 : Number(val) })
                          }
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-1 py-1 text-right font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 min-w-0"
                        />
                      </td>

                      {/* Outstanding Qty / กำลังเช่า (Editable, snug fit) */}
                      <td className="px-1 py-1">
                        <NumericInput
                          disabled={isRemoved}
                          min={0}
                          allowDecimals={false}
                          value={item.outstandingQty === 0 ? '' : item.outstandingQty}
                          defaultValueOnBlur={0}
                          onChange={(val) =>
                            updateItem(index, { outstandingQty: val === '' ? 0 : Number(val) })
                          }
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-1 py-1 text-right font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 min-w-0"
                        />
                      </td>

                      {/* Total Quantity in Bill */}
                      <td className="px-1 py-1">
                        <NumericInput
                          disabled={isRemoved}
                          min={1}
                          allowDecimals={false}
                          value={item.quantity}
                          defaultValueOnBlur={1}
                          onChange={(val) => {
                            if (val !== '') {
                              updateItem(index, { quantity: Math.max(1, Number(val)) })
                            }
                          }}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-1 py-1 text-right font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 min-w-0"
                        />
                      </td>

                      {/* Unit Price */}
                      <td className="px-1 py-1">
                        <NumericInput
                          disabled={isRemoved}
                          min={0}
                          allowDecimals={true}
                          value={item.unitPrice === 0 ? '' : item.unitPrice}
                          defaultValueOnBlur={0}
                          onChange={(val) =>
                            updateItem(index, { unitPrice: val === '' ? 0 : Number(val) })
                          }
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-1 py-1 text-right font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 min-w-0"
                        />
                      </td>

                      {/* Daily Start Date (Calendar Popover - Editable ONLY for DAILY) */}
                      <td className="px-1 py-1">
                        {isDaily && !isRemoved ? (
                          <CustomDatePicker
                            value={parseLocalDate(item.dailyStartDate)}
                            onChange={(val) =>
                              updateItem(index, { dailyStartDate: val ? getLocalDateString(val) : '' })
                            }
                            className="w-full text-xs"
                          />
                        ) : (
                          <span className="text-slate-400 font-mono text-center block">-</span>
                        )}
                      </td>

                      {/* Daily End Date (Calendar Popover - Editable ONLY for DAILY) */}
                      <td className="px-1 py-1">
                        {isDaily && !isRemoved ? (
                          <CustomDatePicker
                            value={parseLocalDate(item.dailyEndDate)}
                            onChange={(val) =>
                              updateItem(index, {
                                dailyEndDate: val ? getLocalDateString(val) : '',
                                scheduledReturnDate: val ? getLocalDateString(val) : '',
                              })
                            }
                            className="w-full text-xs"
                          />
                        ) : (
                          <span className="text-slate-400 font-mono text-center block">-</span>
                        )}
                      </td>

                      {/* Usage Count / รอบ (For NORMAL items) */}
                      <td className="px-1 py-1 text-center">
                        {isNormal && !isRemoved ? (
                          <NumericInput
                            disabled={isRemoved}
                            min={1}
                            allowDecimals={false}
                            value={item.usageCount || 1}
                            defaultValueOnBlur={1}
                            onChange={(val) => {
                              if (val !== '') {
                                updateItem(index, { usageCount: Math.max(1, Number(val)) })
                              }
                            }}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-1 py-1 text-center font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none min-w-0"
                          />
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Action: Remove / Restore */}
                      <td className="px-1 py-1 text-center">
                        {item.action === 'ADD' ? (
                          <button
                            type="button"
                            onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                            className="p-1 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                            title="ลบรายการที่เพิ่ม"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(index, { action: item.action === 'REMOVE' ? 'UPDATE' : 'REMOVE' })
                            }
                            className={`p-1 rounded-lg cursor-pointer ${
                              isRemoved
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
                            }`}
                            title={isRemoved ? 'นำรายการกลับมา' : 'ทำเครื่องหมายลบรายการ'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reason Card & Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Reason Input */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>เหตุผล / บันทึกการแก้ไขบิล *</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder={
                mode === 'EXTENSION'
                  ? 'ระบุเหตุผล เช่น ลูกค้าโทรแจ้งขอเช่าต่อถึงวันที่... หรือเพิ่มรายการสินค้า...'
                  : 'ระบุเหตุผล เช่น แก้ไขจำนวนสินค้าและวันเช่าให้ตรงตามหน้างาน...'
              }
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Financial Recalculation Summary */}
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>ค่าเช่าคำนวณใหม่:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  ฿{calculatedSubtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>ส่วนลด:</span>
                <span className="font-mono font-bold text-red-500">
                  -฿{(discountAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>ค่าขนส่ง:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  +฿{(shippingFee || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700/60 pt-2 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">ยอดรวมสุทธิใหม่:</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  ฿{calculatedGrandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>ชำระแล้วเดิม:</span>
                <span className="font-mono font-bold text-emerald-600">
                  ฿{(bill.paidAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {calculatedGrandTotal < (bill.paidAmount || 0) ? (
                <div className="flex justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                  <span>ต้องคืนเงินลูกค้า:</span>
                  <span className="font-mono font-black">
                    ฿{((bill.paidAmount || 0) - calculatedGrandTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between text-[11px] font-bold text-red-600 dark:text-red-400">
                  <span>ยอดค้างชำระใหม่:</span>
                  <span className="font-mono font-black">
                    ฿{Math.max(0, calculatedGrandTotal - (bill.paidAmount || 0)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
