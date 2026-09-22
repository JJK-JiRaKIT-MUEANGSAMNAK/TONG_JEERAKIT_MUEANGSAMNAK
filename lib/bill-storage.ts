/**
 * Shared Bill Storage & Adapters
 *
 * Backed by localStorage key 'app_bill_storage' and Supabase public.bills table.
 * Uses FullBill (rental-return.ts) as the Canonical persistence model,
 * with strongly-typed bidirectional adapters to RentalBill (rental-pos.ts).
 * ZERO 'as any' assertions.
 */

import { FullBill, FullBillItem } from '@/lib/types/rental-return'
export type { FullBill, FullBillItem }
import { RentalBill, RentalBillItem, RentalType, RentalStatus, PaymentStatus } from '@/lib/types/rental-pos'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'app_bill_storage'

// ─── Bidirectional Adapters ──────────────────────────────────────────

export function fullBillToRentalBill(full: FullBill): RentalBill {
  const items: RentalBillItem[] = full.items.map((item) => ({
    id: item.rentalBillItemId,
    productId: item.productId,
    productName: item.productName,
    rentalType: (item.rentalType || 'NORMAL') as RentalType,
    quantity: item.quantity,
    unitName: item.unit,
    unitPrice: item.dailyRate,
    usageCount: item.usageCount,
    lineTotal: item.lineTotal ?? item.quantity * item.dailyRate,
    returnedQuantity: item.returnedQty,
    damagedQuantity: 0,
    lostQuantity: 0,
    outstandingQuantity: item.outstandingQty,
    isAccessory: false,
    isChargeable: true,
    requiresReturn: item.requiresReturn,
  }))

  return {
    id: full.id,
    customerId: full.customerId || '',
    customerName: full.customerName,
    customerPhone: full.customerPhone,
    customerAddress: full.customerAddress,
    siteName: full.siteName,
    billNo: full.billNo,
    billDate: full.billDate,
    rentalStartDate: full.rentalStartDate,
    rentalEndDate: full.scheduledReturnDate || full.rentalStartDate,
    subtotal: full.subtotal ?? full.grandTotal,
    discountAmount: full.discountAmount ?? 0,
    shippingFee: full.shippingFee ?? 0,
    depositAmount: full.heldDepositAmount ?? full.paidDepositAmount ?? 0,
    taxAmount: full.taxAmount ?? 0,
    grandTotal: full.grandTotal,
    paidAmount: full.paidAmount,
    outstandingAmount: full.outstandingAmount,
    rentalStatus: full.rentalStatus as RentalStatus,
    paymentStatus: full.paymentStatus as PaymentStatus,
    remark: full.remark,
    quotationId: full.quotationId,
    reservationId: full.reservationId,
    closedAt: full.closedAt,
    cancelledAt: full.cancelledAt,
    cancelReason: full.cancelReason,
    dispatchStatus: full.dispatchStatus,
    refundDueAmount: full.refundDueAmount,
    revisions: full.revisions,
    items,
  }
}

export function rentalBillToFullBill(rental: RentalBill): FullBill {
  const items: FullBillItem[] = rental.items.map((item) => {
    let status: FullBillItem['status'] = 'RENTING'
    if (item.rentalType === 'SALE' || item.requiresReturn === false) {
      status = 'COMPLETED'
    } else if (item.returnedQuantity >= item.quantity) {
      status = 'RETURNED'
    } else if (item.returnedQuantity > 0) {
      status = 'PARTIAL_RETURNED'
    }

    return {
      rentalBillItemId: item.id || `rbi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: item.productId,
      productCode: '',
      productName: item.productName,
      quantity: item.quantity,
      returnedQty: item.returnedQuantity,
      outstandingQty: item.outstandingQuantity,
      damagedQuantity: item.damagedQuantity || 0,
      lostQuantity: item.lostQuantity || 0,
      dailyRate: item.unitPrice,
      unit: item.unitName || 'ชิ้น',
      defaultRepairFee: 0,
      defaultReplacementFee: 0,
      requiresReturn: item.requiresReturn ?? true,
      rentalStartDate: rental.rentalStartDate,
      scheduledReturnDate: rental.rentalEndDate,
      rentalType: item.rentalType,
      usageCount: item.usageCount,
      lineTotal: item.lineTotal,
      status,
    }
  })

  let rentalStatus: FullBill['rentalStatus'] = 'RENTING'
  if (rental.rentalStatus === 'DRAFT') rentalStatus = 'DRAFT'
  else if (rental.rentalStatus === 'CLOSED') rentalStatus = 'CLOSED'
  else if (rental.rentalStatus === 'CANCELLED') rentalStatus = 'CANCELLED'
  else if (rental.rentalStatus === 'VOID') rentalStatus = 'VOID'
  else if (rental.rentalStatus === 'RETURNED') rentalStatus = 'RETURNED'
  else if (rental.rentalStatus === 'PARTIAL_RETURNED') rentalStatus = 'PARTIAL_RETURNED'

  let paymentStatus: FullBill['paymentStatus'] = 'UNPAID'
  if (rental.paymentStatus === 'PAID') paymentStatus = 'PAID'
  else if (rental.paymentStatus === 'PARTIAL') paymentStatus = 'PARTIAL'
  else if (rental.paymentStatus === 'REFUND_PARTIAL') paymentStatus = 'REFUND_PARTIAL'
  else if (rental.paymentStatus === 'REFUNDED') paymentStatus = 'REFUNDED'

  return {
    id: rental.id,
    customerId: rental.customerId,
    customerName: rental.customerName,
    customerPhone: rental.customerPhone || '',
    customerAddress: rental.customerAddress,
    siteName: rental.siteName,
    billNo: rental.billNo,
    billDate: rental.billDate,
    rentalStartDate: rental.rentalStartDate,
    scheduledReturnDate: rental.rentalEndDate,
    heldDepositAmount: rental.depositAmount || 0,
    paidDepositAmount: rental.depositAmount || 0,
    deposits: [],
    subtotal: rental.subtotal,
    discountAmount: rental.discountAmount,
    shippingFee: rental.shippingFee,
    taxAmount: rental.taxAmount,
    grandTotal: rental.grandTotal,
    paidAmount: rental.paidAmount,
    outstandingAmount: rental.outstandingAmount,
    rentalStatus,
    paymentStatus,
    dispatchStatus: rental.dispatchStatus,
    refundDueAmount: rental.refundDueAmount,
    revisions: rental.revisions,
    items,
    quotationId: rental.quotationId,
    reservationId: rental.reservationId,
    closedAt: rental.closedAt,
    cancelledAt: rental.cancelledAt,
    cancelReason: rental.cancelReason,
    remark: rental.remark,
  }
}

// ─── Database Row Mapping ──────────────────────────────────────────

export function dbBillToFullBill(row: any): FullBill {
  return {
    id: row.id,
    customerId: row.customer_id,
    billNo: row.bill_no,
    billDate: row.bill_date,
    customerName: row.customer_name,
    customerPhone: row.customer_phone || '',
    customerAddress: row.customer_address || undefined,
    siteName: row.site_name || undefined,
    rentalStartDate: row.rental_start_date,
    scheduledReturnDate: row.scheduled_return_date,
    actualReturnDate: row.actual_return_date || undefined,
    heldDepositAmount: Number(row.held_deposit_amount || 0),
    paidDepositAmount: Number(row.paid_deposit_amount || 0),
    deposits: Array.isArray(row.deposits) ? row.deposits : [],
    subtotal: Number(row.subtotal || 0),
    discountAmount: Number(row.discount_amount || 0),
    shippingFee: Number(row.shipping_fee || 0),
    taxAmount: Number(row.tax_amount || 0),
    grandTotal: Number(row.grand_total || 0),
    paidAmount: Number(row.paid_amount || 0),
    outstandingAmount: Number(row.outstanding_amount || 0),
    rentalStatus: row.rental_status,
    paymentStatus: row.payment_status,
    dispatchStatus: row.dispatch_status,
    items: Array.isArray(row.items) ? row.items : [],
    remark: row.remark || undefined,
  }
}

export function fullBillToDbBill(bill: FullBill): Record<string, any> {
  return {
    id: bill.id,
    bill_no: bill.billNo,
    bill_date: bill.billDate || new Date().toISOString().slice(0, 10),
    customer_id: bill.customerId || null,
    customer_name: bill.customerName,
    customer_phone: bill.customerPhone || null,
    customer_address: bill.customerAddress || null,
    site_name: bill.siteName || null,
    rental_start_date: bill.rentalStartDate || new Date().toISOString().slice(0, 10),
    scheduled_return_date: bill.scheduledReturnDate || new Date().toISOString().slice(0, 10),
    actual_return_date: bill.actualReturnDate || null,
    subtotal: bill.subtotal ?? bill.grandTotal,
    discount_amount: bill.discountAmount ?? 0,
    shipping_fee: bill.shippingFee ?? 0,
    tax_amount: bill.taxAmount ?? 0,
    grand_total: bill.grandTotal,
    paid_amount: bill.paidAmount,
    outstanding_amount: bill.outstandingAmount,
    held_deposit_amount: bill.heldDepositAmount ?? 0,
    paid_deposit_amount: bill.paidDepositAmount ?? 0,
    rental_status: bill.rentalStatus,
    payment_status: bill.paymentStatus,
    dispatch_status: bill.dispatchStatus || 'DISPATCHED',
    items: bill.items || [],
    deposits: bill.deposits || [],
    remark: bill.remark || null,
    updated_at: new Date().toISOString(),
  }
}

// ─── CRUD Operations ──────────────────────────────────────────────────

export function loadBills(): FullBill[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as FullBill[]
    }
    return []
  } catch (err: any) {
    console.error('Failed to parse bills from localStorage:', err)
    return []
  }
}

export function saveBills(bills: FullBill[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills))
  } catch (err: any) {
    console.error('Failed to save bills to localStorage:', err)
    throw new Error(`ไม่สามารถบันทึกข้อมูลบิลลง Storage ได้: ${err?.message || err}`)
  }
}

export function addBill(incoming: FullBill): FullBill[] {
  const current = loadBills()
  const exists = current.some((b) => b.id === incoming.id)
  const next = exists
    ? current.map((b) => (b.id === incoming.id ? incoming : b))
    : [incoming, ...current]
  saveBills(next)
  return next
}

export function updateBill(updated: FullBill): FullBill[] {
  const current = loadBills()
  const next = current.map((b) => (b.id === updated.id ? updated : b))
  saveBills(next)
  return next
}

// ─── Supabase Async Operations ────────────────────────────────────────

export async function fetchBillsFromSupabase(): Promise<FullBill[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`ไม่สามารถดึงข้อมูลบิลจาก Supabase ได้: ${error.message}`)
  }

  const mapped = (data || []).map(dbBillToFullBill)
  saveBills(mapped)
  return mapped
}

export async function fetchBillByIdFromSupabase(id: string): Promise<FullBill | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`ไม่สามารถดึงข้อมูลบิล ${id} จาก Supabase ได้: ${error.message}`)
  }

  if (!data) return null
  const bill = dbBillToFullBill(data)
  // Update local cache
  const current = loadBills()
  const next = current.some((b) => b.id === bill.id)
    ? current.map((b) => (b.id === bill.id ? bill : b))
    : [bill, ...current]
  saveBills(next)
  return bill
}

export async function saveBillToSupabase(bill: FullBill): Promise<FullBill> {
  const supabase = createClient()
  const dbRecord = fullBillToDbBill(bill)
  const { data, error } = await supabase
    .from('bills')
    .upsert(dbRecord)
    .select('*')
    .single()

  if (error) {
    throw new Error(`ไม่สามารถบันทึกบิล ${bill.billNo} ลง Supabase ได้: ${error.message}`)
  }

  const saved = dbBillToFullBill(data)
  updateBill(saved)
  return saved
}

/** Check if a bill is strictly a draft with zero payment and zero stock movement */
export function canHardDeleteBill(bill: FullBill | RentalBill): boolean {
  if (bill.rentalStatus !== 'DRAFT') return false
  if ((bill.paidAmount || 0) > 0) return false
  const paidDep = 'paidDepositAmount' in bill ? bill.paidDepositAmount : (bill.depositAmount || 0)
  if ((paidDep || 0) > 0) return false
  if (bill.dispatchStatus === 'DISPATCHED') return false
  const items = bill.items || []
  const hasItemMovement = items.some(
    (i: any) =>
      (i.returnedQty || i.returnedQuantity || 0) > 0 ||
      (i.damagedQuantity || 0) > 0 ||
      (i.lostQuantity || 0) > 0
  )
  if (hasItemMovement) return false
  return true
}

export function loadBillById(id: string): FullBill | undefined {
  return loadBills().find((b) => b.id === id)
}

export function deleteBill(id: string): FullBill[] {
  const current = loadBills()
  const target = current.find((b) => b.id === id)
  if (target && !canHardDeleteBill(target)) {
    throw new Error(
      `Cannot hard delete confirmed or transactional bill ${target.billNo}. Confirmed bills must use VOID or CANCELLED lifecycle.`
    )
  }
  const next = current.filter((b) => b.id !== id)
  saveBills(next)
  return next
}

export function loadRentalBills(): RentalBill[] {
  return loadBills().map(fullBillToRentalBill)
}
