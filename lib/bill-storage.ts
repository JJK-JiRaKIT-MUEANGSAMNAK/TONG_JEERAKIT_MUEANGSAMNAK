/**
 * Shared Bill Storage & Adapters
 *
 * Backed by localStorage key 'app_bill_storage'.
 * Uses FullBill (rental-return.ts) as the Canonical persistence model,
 * with strongly-typed bidirectional adapters to RentalBill (rental-pos.ts).
 * ZERO 'as any' assertions.
 */

import { FullBill, FullBillItem } from '@/lib/types/rental-return'
export type { FullBill, FullBillItem }
import { RentalBill, RentalBillItem, RentalType, RentalStatus, PaymentStatus } from '@/lib/types/rental-pos'

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
  } catch {
    return []
  }
}

export function saveBills(bills: FullBill[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills))
  } catch {
    // silently ignore quota issues
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
