/**
 * Shared Bill Storage & Adapters
 *
 * Source of truth: Supabase PostgreSQL public.bills table with in-memory cache.
 * Uses FullBill (rental-return.ts) as the Canonical persistence model,
 * with strongly-typed bidirectional adapters to RentalBill (rental-pos.ts).
 * ZERO 'as any' assertions.
 * LocalStorage fallback for business data is strictly forbidden.
 */

import { FullBill, FullBillItem } from '@/lib/types/rental-return'
export type { FullBill, FullBillItem }
import { RentalBill, RentalBillItem, RentalType, RentalStatus, PaymentStatus } from '@/lib/types/rental-pos'
import { createClient } from '@/lib/supabase/client'

// In-memory cache for fast synchronous access by UI components
let _cachedBills: FullBill[] | null = null

export function setCachedBills(bills: FullBill[]): void {
  _cachedBills = bills
}

// ─── Bidirectional Adapters ──────────────────────────────────────────

export function fullBillToRentalBill(full: FullBill): RentalBill {
  const items: RentalBillItem[] = (full.items || []).map((item) => ({
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
    billAmount: full.billAmount ?? full.grandTotal,
    grandTotal: full.grandTotal,
    paidAmount: full.paidAmount,
    outstandingAmount: full.outstandingAmount,
    rentalStatus: full.rentalStatus as RentalStatus,
    paymentStatus: full.paymentStatus as PaymentStatus,
    remark: full.remark,
    quotationId: full.quotationId,
    quotationNo: full.quotationNo,
    reservationId: full.reservationId,
    originalBillId: full.originalBillId,
    parentBillId: full.parentBillId,
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
  const items: FullBillItem[] = (rental.items || []).map((item) => {
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

  const rentalStatus: RentalStatus = rental.rentalStatus || 'CONFIRMED'

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
    billAmount: rental.billAmount ?? rental.grandTotal,
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
    quotationNo: rental.quotationNo,
    reservationId: rental.reservationId,
    originalBillId: rental.originalBillId,
    parentBillId: rental.parentBillId,
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
    billAmount: Number(row.bill_amount !== undefined && row.bill_amount !== null ? row.bill_amount : (row.grand_total || 0)),
    grandTotal: Number(row.grand_total || 0),
    paidAmount: Number(row.paid_amount || 0),
    outstandingAmount: Number(row.outstanding_amount || 0),
    rentalStatus: row.rental_status,
    paymentStatus: row.payment_status,
    dispatchStatus: row.dispatch_status,
    deliveryStatus: row.delivery_status || undefined,
    items: Array.isArray(row.items) ? row.items : [],
    remark: row.remark || undefined,
    quotationId: row.quotation_id || undefined,
    quotationNo: row.quotation_no || undefined,
    reservationId: row.reservation_id || undefined,
    originalBillId: row.original_bill_id || undefined,
    parentBillId: row.parent_bill_id || undefined,
    closedAt: row.closed_at || undefined,
    cancelledAt: row.cancelled_at || undefined,
    cancelReason: row.cancel_reason || undefined,
    refundDueAmount: Number(row.refund_due || 0),
    revisions: Array.isArray(row.revisions) ? row.revisions : undefined,
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
    bill_amount: bill.billAmount ?? bill.grandTotal,
    grand_total: bill.grandTotal,
    paid_amount: bill.paidAmount,
    outstanding_amount: bill.outstandingAmount,
    held_deposit_amount: bill.heldDepositAmount ?? 0,
    paid_deposit_amount: bill.paidDepositAmount ?? 0,
    rental_status: bill.rentalStatus,
    payment_status: bill.paymentStatus,
    dispatch_status: bill.dispatchStatus || 'PENDING',
    delivery_status: bill.deliveryStatus || 'PENDING',
    quotation_id: bill.quotationId || null,
    quotation_no: bill.quotationNo || null,
    reservation_id: bill.reservationId || null,
    original_bill_id: bill.originalBillId || null,
    parent_bill_id: bill.parentBillId || null,
    closed_at: bill.closedAt || null,
    cancelled_at: bill.cancelledAt || null,
    cancel_reason: bill.cancelReason || null,
    refund_due: bill.refundDueAmount ?? 0,
    items: bill.items || [],
    deposits: bill.deposits || [],
    revisions: bill.revisions || [],
    remark: bill.remark || null,
    updated_at: new Date().toISOString(),
  }
}

// ─── In-Memory Cache CRUD (Supabase-backed Single Source of Truth) ─────

const STORAGE_KEY = 'app_bill_storage'

export function loadBills(): FullBill[] {
  if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === null) {
        _cachedBills = []
        return []
      }
      return JSON.parse(raw) as FullBill[]
    } catch {
      return []
    }
  }
  return _cachedBills || []
}

export function saveBills(bills: FullBill[]): void {
  _cachedBills = bills
  if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bills))
    } catch {}
  }
}

export function addBill(incoming: FullBill): FullBill[] {
  const current = loadBills()
  const exists = current.some((b) => b.id === incoming.id)
  const next = exists
    ? current.map((b) => (b.id === incoming.id ? incoming : b))
    : [incoming, ...current]
  saveBills(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveBillToSupabase(incoming).catch((err) =>
      console.error('[Supabase] Failed to sync added bill:', err)
    )
  }
  return next
}

export function updateBill(updated: FullBill): FullBill[] {
  const current = loadBills()
  const next = current.map((b) => (b.id === updated.id ? updated : b))
  saveBills(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveBillToSupabase(updated).catch((err) =>
      console.error('[Supabase] Failed to sync updated bill:', err)
    )
  }
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
  const current = loadBills()
  const next = current.some((b) => b.id === saved.id)
    ? current.map((b) => (b.id === saved.id ? saved : b))
    : [saved, ...current]
  saveBills(next)
  return saved
}

export async function deleteBillFromSupabase(id: string): Promise<void> {
  const current = loadBills()
  const target = current.find((b) => b.id === id)
  if (target && !canHardDeleteBill(target)) {
    throw new Error(
      `Cannot hard delete confirmed or transactional bill ${target.billNo}. Confirmed bills must use VOID or CANCELLED lifecycle.`
    )
  }
  const supabase = createClient()
  const { error } = await supabase.from('bills').delete().eq('id', id)
  if (error) {
    throw new Error(`ไม่สามารถลบบิลจาก Supabase ได้: ${error.message}`)
  }
  const next = current.filter((b) => b.id !== id)
  saveBills(next)
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
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    deleteBillFromSupabase(id).catch((err) =>
      console.error('[Supabase] Failed to delete bill from Supabase:', err)
    )
  }
  return next
}

export function loadRentalBills(): RentalBill[] {
  return loadBills().map(fullBillToRentalBill)
}
