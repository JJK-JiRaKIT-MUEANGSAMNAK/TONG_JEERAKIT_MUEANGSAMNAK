/**
 * Centralized Bill Workflow Service
 *
 * Single source of truth for all Bill lifecycle mutations:
 * - Creation with Split Payments & Deposit separation
 * - Return Inspection with precise Normal/Damaged/Lost stock updates
 * - Bill Revision with version tracking, stock delta, and refund-due calculations
 * - Safe Cancellation/Void without hard delete or blind stock returns
 * - Deposit & Payment Refunds
 * - Seamless linkage to Audit Service via correlationId
 */

import { FullBill, FullBillItem, ReturnInspectionItem } from '@/lib/types/rental-return'
import { RentalBill, BillRevisionRecord, RentalStatus } from '@/lib/types/rental-pos'
import {
  loadBills,
  saveBills,
  updateBill,
  addBill,
  saveBillToSupabase,
  dbBillToFullBill,
  canHardDeleteBill,
  deleteBill as deleteBillFromStorage,
} from '@/lib/bill-storage'
import {
  recordBillPayment,
  recordExpense,
  getBillFinanceSummary,
  loadTransactions,
  saveTransactions,
  addTransaction,
  StatementTransaction,
} from '@/lib/finance-storage'
import { createClient } from '@/lib/supabase/client'
import {
  toSatang,
  toBaht,
  addSatang,
  subtractSatang,
  multiplySatang,
  calculateDepositSettlement,
} from '@/lib/money'
import {
  calculateFinancialCore,
  calculateRevenueRecognized,
  getBillFinancialCoreSummary,
} from '@/lib/calculation-service'
import {
  rentProductStock,
  returnProductStock,
  restoreSaleProductStock,
  adjustProductStockDelta,
  loadProducts,
  getProductAvailability,
  syncProductReservedStock,
  validateProductMode,
  validateStockInvariants,
  getProductType,
} from '@/lib/product-storage'
import {
  recordStockMovement,
  DomainStockMovement,
} from '@/lib/stock-movement'
import {
  createReservation,
  dispatchReservationsBySource,
  releaseReservationsBySource,
  expireReservation,
  loadReservations,
  updateReservation,
  getReservationsBySource,
  ReservationRecord,
} from '@/lib/reservation-storage'
import {
  createBackorder,
  cancelBackordersBySource,
  fulfillBackorder,
  BackorderRecord,
} from '@/lib/backorder-storage'
import {
  markNotificationActionedByBackorder,
  checkBackordersOnStockIncrease,
} from '@/lib/notification-storage'
import { markQuotationConverted, getQuotationById } from '@/lib/quotation-storage'
import { loadSystemSettings } from '@/lib/settings-storage'
import {
  recordAuditLog,
  generateCorrelationId,
  AuditLogEntry,
} from '@/lib/audit-storage'

export interface ActorInfo {
  userId: string
  displayName: string
}

export interface SplitTenderInput {
  paymentMethod: string
  amount: number
  referenceNo?: string
  cashReceived?: number
}

// ─── 1. CREATE BILL WITH SPLIT PAYMENT & DEPOSIT SEPARATION ───────────────────

export interface CreateBillOptions {
  bill?: FullBill
  billData?: Partial<FullBill>
  splitTenders?: SplitTenderInput[]
  paymentSplits?: Array<{ channel: string; amount: number; referenceNo?: string }>
  depositAmount?: number
  depositChannel?: string
  depositReferenceNo?: string
  actor: ActorInfo
  correlationId?: string
}

export function createBillWorkflow(options: CreateBillOptions): {
  bill: FullBill
  correlationId: string
  transactions: StatementTransaction[]
  reservations?: ReservationRecord[]
  backorders?: BackorderRecord[]
} {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'
  const rawBill = options.bill || (options.billData as FullBill) || {}
  const incomingBill: FullBill = {
    ...rawBill,
    id: rawBill.id || `bill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    billNo: rawBill.billNo || `BILL-${Date.now()}`,
    billDate: rawBill.billDate || new Date().toISOString().slice(0, 10),
    customerName: rawBill.customerName || 'ลูกค้าทั่วไป',
    customerPhone: rawBill.customerPhone || '',
    rentalStartDate: rawBill.rentalStartDate || new Date().toISOString().slice(0, 10),
    scheduledReturnDate: rawBill.scheduledReturnDate || new Date().toISOString().slice(0, 10),
    heldDepositAmount: Number(rawBill.heldDepositAmount || options.depositAmount || rawBill.paidDepositAmount || 0),
    paidDepositAmount: Number(rawBill.paidDepositAmount || options.depositAmount || 0),
    paidAmount: Number(rawBill.paidAmount || 0),
    billAmount: Number(rawBill.billAmount || rawBill.grandTotal || 0),
    grandTotal: Number(rawBill.grandTotal || 0),
    outstandingAmount: Number(rawBill.outstandingAmount !== undefined ? rawBill.outstandingAmount : Math.max(0, (rawBill.grandTotal || 0) - (rawBill.paidAmount || 0))),
    paymentStatus: rawBill.paymentStatus || 'UNPAID',
    rentalStatus: rawBill.dispatchStatus === 'DISPATCHED'
      ? (rawBill.rentalStatus === 'CONFIRMED' ? 'RENTING' : (rawBill.rentalStatus || 'RENTING'))
      : (rawBill.rentalStatus === 'RENTING' ? 'CONFIRMED' : (rawBill.rentalStatus || 'CONFIRMED')),
    dispatchStatus: rawBill.dispatchStatus || 'PENDING',
    deposits: rawBill.deposits || [],
    items: rawBill.items || [],
  }
  const transactions: StatementTransaction[] = []

  if (incomingBill.quotationId) {
    const quote = getQuotationById(incomingBill.quotationId)
    if (quote) {
      if (quote.status === 'CONVERTED') {
        throw new Error(`ใบเสนอราคา ${quote.quotationNo || incomingBill.quotationId} ถูกแปลงเป็นบิลไปแล้ว ไม่สามารถแปลงซ้ำได้`)
      }
      if (!incomingBill.quotationNo) {
        incomingBill.quotationNo = quote.quotationNo
      }
    }
  }

  // Ensure dispatchStatus is set (default PENDING)
  const dispatchStatus = incomingBill.dispatchStatus || 'PENDING'

  const reservations: ReservationRecord[] = []
  const backorders: BackorderRecord[] = []

  const allProds = loadProducts()
  incomingBill.items = incomingBill.items.map((item) => {
    const prod = allProds.find((p) => p.id === item.productId)
    const isSale = item.rentalType === 'SALE' || (item as any).itemType === 'SALE'
    const itemMode: 'RENT' | 'SALE' = isSale ? 'SALE' : 'RENT'
    if (prod) {
      validateProductMode(prod, itemMode)
    }
    const requiresReturn = isSale ? false : (item.requiresReturn !== undefined ? item.requiresReturn : true)
    return {
      ...item,
      itemType: itemMode,
      rentalType: isSale ? 'SALE' : (item.rentalType || 'NORMAL'),
      requiresReturn,
      ...(isSale
        ? {
            orderedQty: item.orderedQty ?? item.quantity,
            reservedQty: item.reservedQty ?? item.quantity,
            deliveredQty: item.deliveredQty ?? 0,
            remainingQty: item.remainingQty ?? item.quantity,
            deliveryStatus: item.deliveryStatus ?? 'PENDING',
          }
        : {}),
    }
  })

  const hasSaleItems = incomingBill.items.some((i) => i.rentalType === 'SALE' || i.itemType === 'SALE')
  if (hasSaleItems && !incomingBill.deliveryStatus) {
    incomingBill.deliveryStatus = 'PENDING'
  }

  if (dispatchStatus === 'PENDING') {
    // 1. PENDING: Confirm ≠ Dispatch. Reserved ≠ Rented.
    // Do NOT increment rentedQuantity or permanently deduct SALE stock.
    // Create dated ReservationRecord and BackorderRecord if shortage.
    // If incoming bill has a quotationId, check if the quotation already holds ACTIVE reservations
    const quotationReservations = incomingBill.quotationId
      ? getReservationsBySource('QUOTATION', incomingBill.quotationId).filter((r) => r.status === 'ACTIVE')
      : []

    incomingBill.items.forEach((item) => {
      const isSale = item.rentalType === 'SALE' || item.itemType === 'SALE'
      const startDate = item.rentalStartDate || incomingBill.rentalStartDate
      const endDate = item.scheduledReturnDate || incomingBill.scheduledReturnDate

      // Check if this product was already reserved under the source quotation
      const matchingQuoteResvs = quotationReservations.filter((r) => r.productId === item.productId)
      const quoteResvQty = matchingQuoteResvs.reduce((sum, r) => sum + r.quantity, 0)

      let neededQty = item.quantity
      if (quoteResvQty > 0) {
        // Adopt the quotation reservation into this bill to avoid duplicate reservation
        const adoptQty = Math.min(neededQty, quoteResvQty)
        let remAdopt = adoptQty

        for (const qr of matchingQuoteResvs) {
          if (remAdopt <= 0) break
          if (qr.quantity <= remAdopt) {
            const adopted: ReservationRecord = {
              ...qr,
              sourceType: 'BILL',
              sourceId: incomingBill.id,
              sourceNo: incomingBill.billNo,
              correlationId,
            }
            updateReservation(adopted)
            reservations.push(adopted)
            remAdopt -= qr.quantity
          } else {
            const adopted: ReservationRecord = {
              ...qr,
              quantity: remAdopt,
              sourceType: 'BILL',
              sourceId: incomingBill.id,
              sourceNo: incomingBill.billNo,
              correlationId,
            }
            updateReservation(adopted)
            reservations.push(adopted)

            const remainingQuoteQty = qr.quantity - remAdopt
            createReservation({
              sourceType: 'QUOTATION',
              sourceId: qr.sourceId,
              sourceNo: qr.sourceNo,
              customerId: qr.customerId,
              customerName: qr.customerName,
              productId: qr.productId,
              productCode: qr.productCode,
              productName: qr.productName,
              itemType: qr.itemType,
              quantity: remainingQuoteQty,
              startDate: qr.startDate,
              endDate: qr.endDate,
              correlationId,
            })
            remAdopt = 0
          }
        }
        neededQty -= adoptQty
      }

      if (neededQty > 0) {
        const avail = getProductAvailability(item.productId, startDate, endDate)
        const availableForRange = avail.availableForRange

        if (availableForRange >= neededQty) {
          const resv = createReservation({
            sourceType: 'BILL',
            sourceId: incomingBill.id,
            sourceNo: incomingBill.billNo,
            customerId: incomingBill.customerId || 'general-customer',
            customerName: incomingBill.customerName,
            productId: item.productId,
            productCode: item.productCode || item.productId,
            productName: item.productName,
            itemType: isSale ? 'SALE' : 'RENT',
            quantity: neededQty,
            startDate,
            endDate,
            correlationId,
          })
          reservations.push(resv)
          /* Reservation handled in db */
        } else {
          const fulfillableQty = Math.max(0, availableForRange)
          const shortageQty = neededQty - fulfillableQty

          if (fulfillableQty > 0) {
            const resv = createReservation({
              sourceType: 'BILL',
              sourceId: incomingBill.id,
              sourceNo: incomingBill.billNo,
              customerId: incomingBill.customerId || 'general-customer',
              customerName: incomingBill.customerName,
              productId: item.productId,
              productCode: item.productCode || item.productId,
              productName: item.productName,
              itemType: isSale ? 'SALE' : 'RENT',
              quantity: fulfillableQty,
              startDate,
              endDate,
              correlationId,
            })
            reservations.push(resv)
            /* Reservation handled in db */
          }

          if (shortageQty > 0) {
            const bo = createBackorder({
              sourceType: 'BILL',
              sourceId: incomingBill.id,
              sourceNo: incomingBill.billNo,
              customerId: incomingBill.customerId || 'general-customer',
              customerName: incomingBill.customerName,
              productId: item.productId,
              productCode: item.productCode || item.productId,
              productName: item.productName,
              itemType: isSale ? 'SALE' : 'RENT',
              requestedQty: item.quantity,
              outstandingQty: shortageQty,
              startDate,
              endDate,
              notes: `สร้างจากบิล ${incomingBill.billNo} (ขอ ${item.quantity}, จองได้ ${item.quantity - shortageQty}, ค้าง ${shortageQty})`,
              correlationId,
            })
            backorders.push(bo)
          }
        }
      }

      syncProductReservedStock(item.productId)

      recordAuditLog({
        userId: actorUserId,
        displayName: actorDisplayName,
        action: 'STOCK_RESERVE',
        entityType: 'STOCK',
        entityId: item.productId,
        before: { productId: item.productId },
        after: {
          quantity: item.quantity,
          billNo: incomingBill.billNo,
          dispatchStatus: 'PENDING',
        },
        correlationId,
      })
    })

    if (incomingBill.quotationId) {
      // markQuotationConverted is called at the end of the function
    }
  } else {
    // 2. DISPATCHED: Stock is physically handed over.
    const rentStockItems = incomingBill.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      isSale: item.rentalType === 'SALE',
    }))
    rentProductStock(rentStockItems)

    incomingBill.items.forEach((item) => {
      const isSale = item.rentalType === 'SALE'
      syncProductReservedStock(item.productId)

      recordAuditLog({
        userId: actorUserId,
        displayName: actorDisplayName,
        action: isSale ? 'STOCK_SALE' : 'STOCK_RENT',
        entityType: 'STOCK',
        entityId: item.productId,
        before: { productId: item.productId },
        after: {
          quantity: item.quantity,
          billNo: incomingBill.billNo,
          dispatchStatus: 'DISPATCHED',
        },
        correlationId,
      })
    })

    if (incomingBill.quotationId) {
      dispatchReservationsBySource('QUOTATION', incomingBill.quotationId, correlationId)
      // markQuotationConverted is called at the end of the function
    }
  }

  // 2. Separate Deposit Transaction
  const depositAmount = Number(incomingBill.heldDepositAmount || incomingBill.paidDepositAmount || options.depositAmount || 0)
  if (depositAmount > 0 && incomingBill.paymentStatus !== 'UNPAID') {
    const depChannel = options.depositChannel || options.splitTenders?.[0]?.paymentMethod || options.paymentSplits?.[0]?.channel || 'โอนเงิน'
    const depTx = recordBillPayment({
      billId: incomingBill.id,
      billNo: incomingBill.billNo,
      amount: depositAmount,
      channel: depChannel,
      customerName: incomingBill.customerName,
      category: 'เงินมัดจำ',
      isDeposit: true,
      refNo: options.depositReferenceNo,
      description: `รับเงินมัดจำ บิลเลขที่ ${incomingBill.billNo}`,
      correlationId,
    })
    transactions.push(depTx)

    recordAuditLog({
      userId: actorUserId,
      displayName: actorDisplayName,
      action: 'DEPOSIT_RECEIVE',
      entityType: 'FINANCE',
      entityId: depTx.id,
      before: null,
      after: {
        billNo: incomingBill.billNo,
        amount: depositAmount,
        category: 'เงินมัดจำ',
        isDeposit: true,
      },
      correlationId,
    })
  }

  // 3. Payment Transactions (Split payment supported: 1 channel = 1 transaction)
  const normalizedSplits = options.splitTenders
    ? options.splitTenders.map((t) => ({ channel: t.paymentMethod, amount: t.amount, referenceNo: t.referenceNo }))
    : options.paymentSplits || []

  if (normalizedSplits.length > 0) {
    const validTenders = normalizedSplits.filter((t) => Number(t.amount || 0) > 0)
    for (const tender of validTenders) {
      const tx = recordBillPayment({
        billId: incomingBill.id,
        billNo: incomingBill.billNo,
        amount: Number(tender.amount),
        channel: tender.channel,
        customerName: incomingBill.customerName,
        category: 'ค่าเช่าอุปกรณ์',
        isDeposit: false,
        refNo: tender.referenceNo ? `TX-${incomingBill.billNo}-${tender.referenceNo}` : undefined,
        description: `รับชำระเงิน (${tender.channel}) บิลเลขที่ ${incomingBill.billNo}`,
        correlationId,
      })
      transactions.push(tx)

      recordAuditLog({
        userId: actorUserId,
        displayName: actorDisplayName,
        action: 'PAYMENT_RECEIVE',
        entityType: 'FINANCE',
        entityId: tx.id,
        before: null,
        after: {
          billNo: incomingBill.billNo,
          amount: tender.amount,
          channel: tender.channel,
        },
        correlationId,
      })
    }
  } else if (incomingBill.paidAmount > 0 && incomingBill.paymentStatus !== 'UNPAID') {
    // Single revenue payment (Financial Core: paidAmount is strictly bill payment without deposit; handle legacy combined)
    let revAmount = incomingBill.paidAmount
    if (depositAmount > 0 && incomingBill.paidAmount > incomingBill.grandTotal && incomingBill.paidAmount === (incomingBill.grandTotal + depositAmount)) {
      revAmount = incomingBill.grandTotal
    }
    if (revAmount > 0) {
      const tx = recordBillPayment({
        billId: incomingBill.id,
        billNo: incomingBill.billNo,
        amount: revAmount,
        channel: 'โอนเงิน',
        customerName: incomingBill.customerName,
        category: 'ค่าเช่าอุปกรณ์',
        isDeposit: false,
        description: `รับชำระเงิน บิลเลขที่ ${incomingBill.billNo}`,
        correlationId,
      })
      transactions.push(tx)

      recordAuditLog({
        userId: actorUserId,
        displayName: actorDisplayName,
        action: 'PAYMENT_RECEIVE',
        entityType: 'FINANCE',
        entityId: tx.id,
        before: null,
        after: {
          billNo: incomingBill.billNo,
          amount: revAmount,
        },
        correlationId,
      })
    }
  }

  // 4. Save Bill
  const finalBill: FullBill = {
    ...incomingBill,
    reservationId: incomingBill.reservationId || (reservations[0]?.id),
    dispatchStatus,
  }

  const currentBills = loadBills()
  saveBills([finalBill, ...currentBills.filter((b) => b.id !== finalBill.id)])
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveBillToSupabase(finalBill).catch((err) =>
      console.error('[Supabase] Failed to sync created bill:', err)
    )
  }

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'BILL_CREATE',
    entityType: 'BILL',
    entityId: finalBill.id,
    before: null,
    after: {
      billNo: finalBill.billNo,
      customerName: finalBill.customerName,
      grandTotal: finalBill.grandTotal,
      paidAmount: finalBill.paidAmount,
      outstandingAmount: finalBill.outstandingAmount,
      rentalStatus: finalBill.rentalStatus,
      paymentStatus: finalBill.paymentStatus,
      dispatchStatus: finalBill.dispatchStatus,
    },
    correlationId,
  })

  if (finalBill.quotationId) {
    markQuotationConverted(finalBill.quotationId, finalBill.id, correlationId)
    recordAuditLog({
      userId: actorUserId,
      displayName: actorDisplayName,
      action: 'QUOTATION_CONVERT_BILL',
      entityType: 'QUOTATION',
      entityId: finalBill.quotationId,
      before: null,
      after: {
        quotationId: finalBill.quotationId,
        quotationNo: finalBill.quotationNo,
        billId: finalBill.id,
        billNo: finalBill.billNo,
      },
      correlationId,
    })
  }

  return { bill: finalBill, correlationId, transactions, reservations, backorders }
}

// ─── 1.05 DRAFT BILL WORKFLOWS ────────────────────────────────────────────────

export interface SaveDraftBillOptions {
  bill?: FullBill
  billData?: Partial<FullBill>
  actor: ActorInfo
  correlationId?: string
}

/**
 * Save or update a bill in DRAFT state.
 * Invariants:
 * - rentalStatus strictly 'DRAFT'.
 * - paymentStatus strictly 'UNPAID'.
 * - dispatchStatus strictly 'PENDING'.
 * - Does NOT create finance transactions.
 * - Does NOT reserve stock or create reservations.
 * - Does NOT alter physical inventory.
 * - Audits BILL_DRAFT_SAVE with correlationId.
 */
export function saveDraftBillWorkflow(options: SaveDraftBillOptions): {
  bill: FullBill
  correlationId: string
} {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'
  const rawBill = options.bill || (options.billData as FullBill) || {}

  const draftBill: FullBill = {
    ...rawBill,
    id: rawBill.id || `bill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    billNo: rawBill.billNo || `BILL-${Date.now()}`,
    billDate: rawBill.billDate || new Date().toISOString().slice(0, 10),
    customerName: rawBill.customerName || 'ลูกค้าทั่วไป',
    customerPhone: rawBill.customerPhone || '',
    rentalStartDate: rawBill.rentalStartDate || new Date().toISOString().slice(0, 10),
    scheduledReturnDate: rawBill.scheduledReturnDate || new Date().toISOString().slice(0, 10),
    rentalStatus: 'DRAFT',
    paymentStatus: 'UNPAID',
    dispatchStatus: 'PENDING',
    paidAmount: 0,
    paidDepositAmount: 0,
    heldDepositAmount: Number(rawBill.heldDepositAmount || rawBill.paidDepositAmount || (rawBill as any).depositAmount || 0),
    grandTotal: Number(rawBill.grandTotal || 0),
    outstandingAmount: Number(rawBill.grandTotal || 0),
    items: rawBill.items || [],
  }

  const currentBills = loadBills()
  saveBills([draftBill, ...currentBills.filter((b) => b.id !== draftBill.id)])
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveBillToSupabase(draftBill).catch((err) =>
      console.error('[Supabase] Failed to sync draft bill:', err)
    )
  }

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'BILL_DRAFT_SAVE',
    entityType: 'BILL',
    entityId: draftBill.id,
    before: null,
    after: {
      billNo: draftBill.billNo,
      customerName: draftBill.customerName,
      grandTotal: draftBill.grandTotal,
      rentalStatus: 'DRAFT',
      paymentStatus: 'UNPAID',
      dispatchStatus: 'PENDING',
      itemCount: draftBill.items.length,
    },
    correlationId,
  })

  return { bill: draftBill, correlationId }
}

export interface ConfirmDraftBillOptions {
  billId: string
  splitTenders?: SplitTenderInput[]
  paymentSplits?: Array<{ channel: string; amount: number; referenceNo?: string }>
  depositAmount?: number
  depositChannel?: string
  depositReferenceNo?: string
  dispatchStatus?: 'PENDING' | 'DISPATCHED'
  actor: ActorInfo
  correlationId?: string
}

/**
 * Confirm an existing DRAFT bill into an active RENTING/CLOSED bill.
 * Invariants:
 * - Operates on the exact same bill ID (no duplicate bill creation).
 * - Transitions rentalStatus from DRAFT -> RENTING (or CLOSED).
 * - Executes stock reservations/dispatch and payments centrally.
 * - Audits BILL_CONFIRM with shared correlationId.
 */
export function confirmDraftBillWorkflow(options: ConfirmDraftBillOptions): {
  bill: FullBill
  correlationId: string
  transactions: StatementTransaction[]
  reservations?: ReservationRecord[]
  backorders?: BackorderRecord[]
} {
  const correlationId = options.correlationId || generateCorrelationId()
  const currentBills = loadBills()
  const targetBill = currentBills.find((b) => b.id === options.billId)
  if (!targetBill) {
    throw new Error(`Bill ${options.billId} not found`)
  }
  if (targetBill.rentalStatus !== 'DRAFT') {
    throw new Error(`Bill ${targetBill.billNo} is not in DRAFT status (current: ${targetBill.rentalStatus})`)
  }

  const hasRentalItems = targetBill.items.some((i) => i.rentalType !== 'SALE' && i.requiresReturn !== false)
  const dispatchStatus = options.dispatchStatus || targetBill.dispatchStatus || 'PENDING'
  const targetRentalStatus: RentalStatus = dispatchStatus === 'DISPATCHED'
    ? (hasRentalItems ? 'RENTING' : 'CLOSED')
    : 'CONFIRMED'

  const normalizedSplits = options.splitTenders
    ? options.splitTenders.map((t) => ({ channel: t.paymentMethod, amount: t.amount, referenceNo: t.referenceNo }))
    : options.paymentSplits || []
  const totalPaidInSplits = normalizedSplits.reduce((sum, s) => sum + Number(s.amount || 0), 0)
  const paidAmount = totalPaidInSplits > 0 ? totalPaidInSplits : (targetBill.paidAmount || 0)
  const heldDeposit = Number(options.depositAmount !== undefined ? options.depositAmount : (targetBill.heldDepositAmount || 0))
  const grandTotal = Number(targetBill.grandTotal || 0)
  const outstandingAmount = Math.max(0, grandTotal - paidAmount)
  const paymentStatus = paidAmount >= grandTotal ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID'

  const billToConfirm: FullBill = {
    ...targetBill,
    rentalStatus: targetRentalStatus,
    dispatchStatus,
    paidAmount,
    heldDepositAmount: heldDeposit,
    paidDepositAmount: heldDeposit,
    outstandingAmount,
    paymentStatus,
  }

  const result = createBillWorkflow({
    bill: billToConfirm,
    splitTenders: options.splitTenders,
    paymentSplits: options.paymentSplits,
    depositAmount: heldDeposit,
    depositChannel: options.depositChannel,
    depositReferenceNo: options.depositReferenceNo,
    actor: options.actor,
    correlationId,
  })

  recordAuditLog({
    userId: options.actor.userId || 'system',
    displayName: options.actor.displayName || 'ระบบ',
    action: 'BILL_CONFIRM',
    entityType: 'BILL',
    entityId: result.bill.id,
    before: { billNo: targetBill.billNo, rentalStatus: 'DRAFT' },
    after: {
      billNo: result.bill.billNo,
      rentalStatus: result.bill.rentalStatus,
      dispatchStatus: result.bill.dispatchStatus,
      paidAmount: result.bill.paidAmount,
    },
    correlationId,
  })

  return result
}


// ─── 1.1 DISPATCH BILL WORKFLOW ───────────────────────────────────────────────

export interface DispatchBillOptions {
  billId: string
  actor: ActorInfo
  correlationId?: string
  deliveries?: Array<{
    rentalBillItemId: string
    deliveredQty: number
  }>
}

/**
 * Dispatch a bill (transitions PENDING -> DISPATCHED).
 * Invariants:
 * - Idempotent: Repeat calls do not re-deduct physical stock.
 * - Atomic validation: All items checked before any stock mutation.
 * - Transitions active reservations to DISPATCHED.
 * - Deducts physical stock: RENT -> increments rentedQuantity, SALE -> deducts totalQuantity.
 * - Syncs product reservedQuantity and checks non-negative stock invariants.
 * - Supports Partial Sale Delivery.
 * - Mixed bills: Keeps RENT and SALE statuses independent.
 */
export async function dispatchBillWorkflow(options: DispatchBillOptions): Promise<{
  bill: FullBill
  correlationId: string
  dispatchedReservations: ReservationRecord[]
}> {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'

  const currentBills = loadBills()
  const targetBill = currentBills.find((b) => b.id === options.billId)
  if (!targetBill) {
    throw new Error(`Bill ${options.billId} not found`)
  }
  if (targetBill.rentalStatus === 'CANCELLED' || targetBill.rentalStatus === 'VOID') {
    throw new Error(`Cannot dispatch cancelled or voided bill`)
  }

  const hasRentalItems = targetBill.items.some((i) => i.rentalType !== 'SALE' && i.itemType !== 'SALE' && i.requiresReturn !== false)
  const hasSaleItems = targetBill.items.some((i) => i.rentalType === 'SALE' || i.itemType === 'SALE' || i.requiresReturn === false)

  // Idempotency: If already fully dispatched and no partial delivery requested, return existing bill safely
  if (targetBill.dispatchStatus === 'DISPATCHED') {
    const allSaleDone = !hasSaleItems || targetBill.deliveryStatus === 'DELIVERED'
    if (allSaleDone && !options.deliveries) {
      return { bill: targetBill, correlationId, dispatchedReservations: [] }
    }
  }

  // Pre-calculate needed quantities per item and validate before mutating ANY state (Atomic validation)
  const neededByProduct = new Map<string, number>()
  for (const item of targetBill.items) {
    const isSale = item.rentalType === 'SALE' || item.itemType === 'SALE'
    let toDeduct = 0
    if (isSale) {
      const deliv = options.deliveries?.find(
        (d) => d.rentalBillItemId === item.rentalBillItemId || d.rentalBillItemId === (item as any).id
      )
      const ordered = item.orderedQty ?? item.quantity
      const currentDelivered = item.deliveredQty ?? 0
      const remaining = item.remainingQty !== undefined ? item.remainingQty : Math.max(0, ordered - currentDelivered)
      toDeduct = deliv !== undefined ? deliv.deliveredQty : (targetBill.dispatchStatus === 'DISPATCHED' ? 0 : remaining)
      if (deliv && deliv.deliveredQty > remaining) {
        throw new Error(
          `จำนวนส่งมอบ (${deliv.deliveredQty}) เกินจำนวนคงค้างที่ต้องส่ง (${remaining}) สำหรับสินค้า "${item.productName}"`
        )
      }
    } else {
      toDeduct = targetBill.dispatchStatus === 'DISPATCHED' ? 0 : item.quantity
    }
    if (toDeduct > 0) {
      neededByProduct.set(item.productId, (neededByProduct.get(item.productId) || 0) + toDeduct)
    }
  }

  const allProds = loadProducts()
  for (const [prodId, neededQty] of neededByProduct.entries()) {
    const prod = allProds.find((p) => p.id === prodId)
    if (!prod) {
      throw new Error(`ไม่พบข้อมูลสินค้า ID "${prodId}" ในระบบ`)
    }
    const avail = prod.availableQuantity ?? 0
    if (avail < neededQty) {
      throw new Error(
        `สินค้า "${prod.name}" (รหัส: ${prod.code || prod.id}) สต็อกไม่เพียงพอสำหรับการส่งมอบ (ต้องการ ${neededQty}, มีพร้อมใช้ ${avail})`
      )
    }
  }

  // 1. Transition active reservations to DISPATCHED
  const dispatchedReservations = [
    ...dispatchReservationsBySource('BILL', targetBill.id, correlationId),
    ...(targetBill.quotationId ? dispatchReservationsBySource('QUOTATION', targetBill.quotationId, correlationId) : []),
  ]

  // 2. Deduct physical stock & log stock movements
  const updatedItems: FullBillItem[] = []
  for (const item of targetBill.items) {
    const isSale = item.rentalType === 'SALE' || item.itemType === 'SALE'
    if (isSale) {
      const deliv = options.deliveries?.find(
        (d) => d.rentalBillItemId === item.rentalBillItemId || d.rentalBillItemId === (item as any).id
      )
      const ordered = item.orderedQty ?? item.quantity
      const currentDelivered = item.deliveredQty ?? 0
      const remaining = item.remainingQty !== undefined ? item.remainingQty : Math.max(0, ordered - currentDelivered)
      const deliverQty = deliv !== undefined ? deliv.deliveredQty : (targetBill.dispatchStatus === 'DISPATCHED' ? 0 : remaining)

      if (deliverQty > 0) {
        const prodBefore = loadProducts().find((p) => p.id === item.productId)
        rentProductStock(item.productId, deliverQty, true)
        syncProductReservedStock(item.productId)
        const prodAfter = loadProducts().find((p) => p.id === item.productId)
        if (prodAfter) validateStockInvariants(prodAfter)

        await recordStockMovement({
          type: 'SALE',
          productId: item.productId,
          billId: targetBill.id,
          billLineId: item.rentalBillItemId || (item as any).id,
          quantity: deliverQty,
          beforeState: {
            availableQuantity: prodBefore?.availableQuantity,
            totalQuantity: prodBefore?.totalQuantity,
          },
          afterState: {
            availableQuantity: prodAfter?.availableQuantity,
            totalQuantity: prodAfter?.totalQuantity,
          },
          actor: { userId: actorUserId, displayName: actorDisplayName },
          correlationId,
          reason: 'ส่งมอบสินค้าขาย (Sale Delivery)',
        })

        recordAuditLog({
          userId: actorUserId,
          displayName: actorDisplayName,
          action: 'STOCK_SALE',
          entityType: 'STOCK',
          entityId: item.productId,
          before: { productId: item.productId, dispatchStatus: item.deliveryStatus || 'PENDING' },
          after: {
            quantity: deliverQty,
            billNo: targetBill.billNo,
            deliveryStatus: 'DELIVERED',
          },
          correlationId,
        })

        const newDelivered = currentDelivered + deliverQty
        const newRemaining = Math.max(0, ordered - newDelivered)
        const itemDeliveryStatus = newRemaining === 0 ? 'DELIVERED' : 'PARTIAL_DELIVERED'

        updatedItems.push({
          ...item,
          orderedQty: ordered,
          deliveredQty: newDelivered,
          remainingQty: newRemaining,
          deliveryStatus: itemDeliveryStatus,
          status: itemDeliveryStatus === 'DELIVERED' ? 'DELIVERED' : 'PARTIAL_DELIVERED',
        })
        continue
      }
      updatedItems.push(item)
      continue
    } else {
      // RENT item
      if (targetBill.dispatchStatus !== 'DISPATCHED') {
        const prodBefore = loadProducts().find((p) => p.id === item.productId)
        rentProductStock(item.productId, item.quantity, false)
        syncProductReservedStock(item.productId)
        const prodAfter = loadProducts().find((p) => p.id === item.productId)
        if (prodAfter) validateStockInvariants(prodAfter)

        await recordStockMovement({
          type: 'RENT',
          productId: item.productId,
          billId: targetBill.id,
          billLineId: item.rentalBillItemId || (item as any).id,
          quantity: item.quantity,
          beforeState: {
            availableQuantity: prodBefore?.availableQuantity,
            rentedQuantity: prodBefore?.rentedQuantity,
            totalQuantity: prodBefore?.totalQuantity,
          },
          afterState: {
            availableQuantity: prodAfter?.availableQuantity,
            rentedQuantity: prodAfter?.rentedQuantity,
            totalQuantity: prodAfter?.totalQuantity,
          },
          actor: { userId: actorUserId, displayName: actorDisplayName },
          correlationId,
          reason: 'ส่งมอบสินค้าเช่า (Rent Dispatch)',
        })

        recordAuditLog({
          userId: actorUserId,
          displayName: actorDisplayName,
          action: 'STOCK_RENT',
          entityType: 'STOCK',
          entityId: item.productId,
          before: { productId: item.productId, dispatchStatus: 'PENDING' },
          after: {
            quantity: item.quantity,
            billNo: targetBill.billNo,
            dispatchStatus: 'DISPATCHED',
          },
          correlationId,
        })

        updatedItems.push({
          ...item,
          status: 'RENTING',
        })
        continue
      }
      updatedItems.push(item)
      continue
    }
  }

  // 3. Reconcile statuses independently for Mixed Bills
  const rentalItems = updatedItems.filter((i) => i.rentalType !== 'SALE' && i.itemType !== 'SALE' && i.requiresReturn !== false)
  const saleItems = updatedItems.filter((i) => i.rentalType === 'SALE' || i.itemType === 'SALE' || i.requiresReturn === false)

  const hasRental = rentalItems.length > 0
  const hasSale = saleItems.length > 0

  const allSaleDelivered = hasSale && saleItems.every((i) => (i.remainingQty ?? 0) === 0 && (i.deliveredQty ?? 0) >= (i.orderedQty ?? i.quantity))
  const anySaleDelivered = hasSale && saleItems.some((i) => (i.deliveredQty ?? 0) > 0)
  const saleDeliveryStatus = allSaleDelivered ? 'DELIVERED' : (anySaleDelivered ? 'PARTIAL_DELIVERED' : 'PENDING')

  let nextRentalStatus: RentalStatus = targetBill.rentalStatus
  let nextDispatchStatus = targetBill.dispatchStatus

  if (hasRental) {
    nextRentalStatus = 'RENTING'
    nextDispatchStatus = 'DISPATCHED'
  } else {
    // Only SALE items in this bill
    nextDispatchStatus = allSaleDelivered ? 'DISPATCHED' : (anySaleDelivered ? 'PARTIAL_DELIVERED' : 'PENDING')
    nextRentalStatus = allSaleDelivered ? 'CLOSED' : 'CONFIRMED'
  }

  const updatedBill: FullBill = {
    ...targetBill,
    items: updatedItems,
    dispatchStatus: nextDispatchStatus as any,
    deliveryStatus: hasSale ? saleDeliveryStatus : undefined,
    rentalStatus: nextRentalStatus,
  }

  updateBill(updatedBill)

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'BILL_DISPATCH',
    entityType: 'BILL',
    entityId: updatedBill.id,
    before: { billNo: targetBill.billNo, dispatchStatus: targetBill.dispatchStatus, rentalStatus: targetBill.rentalStatus },
    after: { billNo: updatedBill.billNo, dispatchStatus: updatedBill.dispatchStatus, rentalStatus: updatedBill.rentalStatus },
    correlationId,
  })

  return { bill: updatedBill, correlationId, dispatchedReservations }
}

// ─── 2. SPLIT PAYMENT WORKFLOW ───────────────────────────────────────────────

export interface ProcessSplitPaymentOptions {
  billId: string
  requestId?: string
  tenders?: SplitTenderInput[]
  splits?: Array<{ channel?: string; paymentMethod?: string; amount: number; referenceNo?: string }>
  actor: ActorInfo
  paymentDate?: string
  correlationId?: string
}

export interface ProcessSplitPaymentResult {
  bill: FullBill
  correlationId: string
  transactions: StatementTransaction[]
  batchId?: string
  receiptNo?: string
  tenders?: SplitTenderInput[]
  isIdempotentReplay?: boolean
}

export async function processSplitPaymentWorkflow(
  options: ProcessSplitPaymentOptions
): Promise<ProcessSplitPaymentResult> {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'
  const requestId = options.requestId || generateCorrelationId()

  const rawTenders = options.tenders || (options.splits || []).map((s) => ({
    paymentMethod: s.paymentMethod || s.channel || 'เงินสด',
    amount: s.amount,
    referenceNo: s.referenceNo,
    cashReceived: s.amount,
  }))
  const validTenders = rawTenders.filter((t) => Number(t.amount || 0) > 0)
  const totalPayment = validTenders.reduce((sum, t) => sum + Number(t.amount || 0), 0)

  if (totalPayment <= 0) {
    throw new Error('Total payment amount must be greater than 0')
  }

  // Create deterministic payload hash for idempotency comparison
  const payloadHash = JSON.stringify({
    billId: options.billId,
    tenders: validTenders
      .map((t) => ({
        method: t.paymentMethod,
        amount: Number(t.amount),
        ref: t.referenceNo || '',
      }))
      .sort((a, b) => a.method.localeCompare(b.method)),
  })

  const supabase = createClient()
  const { data, error } = await supabase.rpc('process_split_payment_rpc', {
    p_bill_id: options.billId,
    p_request_id: requestId,
    p_payload_hash: payloadHash,
    p_tenders: validTenders.map((t) => ({
      paymentMethod: t.paymentMethod,
      amount: Number(t.amount),
      referenceNo: t.referenceNo || '',
      cashReceived: Number(t.cashReceived || t.amount),
    })),
    p_payment_date: options.paymentDate ? new Date(options.paymentDate).toISOString() : new Date().toISOString(),
    p_actor_user_id: actorUserId,
    p_actor_display_name: actorDisplayName,
    p_correlation_id: correlationId,
  })

  if (error) {
    // Strictly throw error - do not silently fallback to localStorage
    throw new Error(`การรับชำระเงินล้มเหลว: ${error.message}`)
  }

  if (!data || data.status === 'ERROR') {
    throw new Error(`การรับชำระเงินล้มเหลว: ${data?.message || 'ไม่สามารถประมวลผลธุรกรรมได้'}`)
  }

  const updatedBill = dbBillToFullBill(data.bill)
  const transactions: StatementTransaction[] = Array.isArray(data.transactions)
    ? data.transactions.map((tx: any) => ({
        id: tx.id,
        dateTime: options.paymentDate || new Date().toISOString(),
        refNo: tx.refNo || tx.ref_no || `TX-${updatedBill.billNo}`,
        type: 'INCOME' as const,
        category: 'ค่าเช่าอุปกรณ์',
        description: `รับชำระเงิน (${tx.channel}) บิลเลขที่ ${updatedBill.billNo}`,
        customerName: updatedBill.customerName,
        incomeAmount: Number(tx.amount || tx.income_amount || 0),
        expenseAmount: 0,
        runningBalance: 0,
        channel: tx.channel,
        billId: updatedBill.id,
        billNo: updatedBill.billNo,
        correlationId,
        isDeposit: false,
      }))
    : []

  // Update local memory cache with confirmed DB data
  updateBill(updatedBill)
  for (const tx of transactions) {
    addTransaction(tx)
  }

  return {
    bill: updatedBill,
    correlationId,
    transactions,
    batchId: data.batch_id,
    receiptNo: data.receipt_no,
    tenders: validTenders,
    isIdempotentReplay: data.status === 'IDEMPOTENT_REPLAY',
  }
}

export async function fetchLatestPaymentBatch(billId: string): Promise<{
  paymentNo: string
  receiptNo: string
  totalAmount: number
  outstandingAfter: number
  paidAmountAfter: number
  tenders: SplitTenderInput[]
} | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payment_batches')
    .select('*')
    .eq('bill_id', billId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  return {
    paymentNo: data.id,
    receiptNo: data.receipt_no,
    totalAmount: Number(data.total_amount || 0),
    outstandingAfter: Number(data.outstanding_after || 0),
    paidAmountAfter: Number(data.paid_amount_after || 0),
    tenders: Array.isArray(data.tenders) ? data.tenders : [],
  }
}

// ─── 3. RETURN WORKFLOW (NORMAL, DAMAGED, LOST) ──────────────────────────────

export interface ReturnItemInput {
  rentalBillItemId: string
  productId: string
  normalQty: number
  damagedQty: number
  lostQty: number
  repairFeePerUnit?: number
  replacementFeePerUnit?: number
  note?: string
}

export interface ReturnDamageChargeInput {
  rentalBillItemId: string
  productId?: string
  damageCharge?: number
  lossCharge?: number
  damagedQty?: number
  repairFeePerUnit?: number
  actualDamageCharge?: number
  lostQty?: number
  replacementFeePerUnit?: number
  actualLossCharge?: number
  reason?: string
}

export interface ProcessReturnOptions {
  billId: string
  returnNo?: string
  items?: ReturnItemInput[]
  returnItems?: ReturnItemInput[]
  returnLines?: ReturnItemInput[]
  actualDamageCharges?: ReturnDamageChargeInput[]
  deductFromDeposit?: boolean
  isConfirmed?: boolean
  actor: ActorInfo
  collectedAmount?: number
  paymentMethod?: string
  correlationId?: string
}

export async function processReturnWorkflow(options: ProcessReturnOptions): Promise<{
  bill: FullBill
  correlationId: string
  returnNo: string
  totalDamageCharges: number
  totalDamageFee: number
  depositApplied: number
  depositRefund: number
  depositRefundDue: number
  additionalAmountDue: number
}> {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'
  const returnNo = options.returnNo || `RT-${Date.now().toString().slice(-6)}`

  const currentBills = loadBills()
  const targetBill = currentBills.find((b) => b.id === options.billId)
  if (!targetBill) {
    throw new Error(`Bill ${options.billId} not found`)
  }

  // Return MUST happen only after actual dispatch
  if (targetBill.dispatchStatus === 'PENDING') {
    throw new Error(`ไม่สามารถรับคืนสินค้าได้เนื่องจากบิล ${targetBill.billNo} ยังไม่ได้ทำการส่งมอบสินค้า (Dispatch)`)
  }

  const returnItemsList = options.items || options.returnItems || options.returnLines || []
  const inspectionMap = new Map(returnItemsList.map((it) => [it.rentalBillItemId, it]))
  const allMasterProducts = loadProducts()

  // Pre-validate return quantities against outstandingQty before mutating ANY stock
  for (const it of returnItemsList) {
    const billItem = targetBill.items.find(
      (bi) => bi.rentalBillItemId === it.rentalBillItemId || (bi as any).id === it.rentalBillItemId
    )
    if (!billItem) {
      throw new Error(`ไม่พบรายการสินค้า ID "${it.rentalBillItemId}" ในบิล ${targetBill.billNo}`)
    }
    const normal = Math.max(0, it.normalQty || 0)
    const damaged = Math.max(0, it.damagedQty || 0)
    const lost = Math.max(0, it.lostQty || 0)
    const totalReturned = normal + damaged + lost
    if (totalReturned > billItem.outstandingQty) {
      throw new Error(
        `จำนวนรับคืน (${totalReturned}) เกินจำนวนคงค้างที่ต้องคืน (${billItem.outstandingQty}) สำหรับสินค้า "${billItem.productName}"`
      )
    }
  }

  // 1. Process Stock Return for each item
  for (const it of returnItemsList) {
    const billItem = targetBill.items.find((bi) => bi.rentalBillItemId === it.rentalBillItemId || (bi as any).id === it.rentalBillItemId)
    const prodId = it.productId || billItem?.productId
    if (!it.productId && prodId) {
      it.productId = prodId
    }

    const normal = Math.max(0, it.normalQty || 0)
    const damaged = Math.max(0, it.damagedQty || 0)
    const lost = Math.max(0, it.lostQty || 0)
    const totalReturned = normal + damaged + lost

    if (totalReturned > 0 && it.productId) {
      const allProdsBefore = loadProducts()
      const pBefore = allProdsBefore.find((p) => p.id === it.productId)

      returnProductStock(it.productId, normal, damaged, lost)

      const allProdsAfter = loadProducts()
      const pAfter = allProdsAfter.find((p) => p.id === it.productId)
      if (pAfter) validateStockInvariants(pAfter)

      if (normal > 0) {
        await recordStockMovement({
          type: 'RETURN',
          productId: it.productId,
          billId: targetBill.id,
          billLineId: it.rentalBillItemId,
          quantity: normal,
          beforeState: { availableQuantity: pBefore?.availableQuantity, rentedQuantity: pBefore?.rentedQuantity },
          afterState: { availableQuantity: pAfter?.availableQuantity, rentedQuantity: pAfter?.rentedQuantity },
          actor: { userId: actorUserId, displayName: actorDisplayName },
          correlationId,
          reason: 'รับคืนสินค้าสภาพปกติ (Return Normal)',
        })
      }

      if (damaged > 0) {
        await recordStockMovement({
          type: 'DAMAGE',
          productId: it.productId,
          billId: targetBill.id,
          billLineId: it.rentalBillItemId,
          quantity: damaged,
          beforeState: { damagedQuantity: pBefore?.damagedQuantity, rentedQuantity: pBefore?.rentedQuantity },
          afterState: { damagedQuantity: pAfter?.damagedQuantity, rentedQuantity: pAfter?.rentedQuantity },
          actor: { userId: actorUserId, displayName: actorDisplayName },
          correlationId,
          reason: 'รับคืนสินค้าสภาพชำรุด (Return Damaged)',
        })
      }

      if (lost > 0) {
        await recordStockMovement({
          type: 'LOST',
          productId: it.productId,
          billId: targetBill.id,
          billLineId: it.rentalBillItemId,
          quantity: lost,
          beforeState: { lostQuantity: pBefore?.lostQuantity, totalQuantity: pBefore?.totalQuantity },
          afterState: { lostQuantity: pAfter?.lostQuantity, totalQuantity: pAfter?.totalQuantity },
          actor: { userId: actorUserId, displayName: actorDisplayName },
          correlationId,
          reason: 'ตัดจำหน่ายสินค้าสูญหาย (Lost Write-off)',
        })
      }

      recordAuditLog({
        userId: actorUserId,
        displayName: actorDisplayName,
        action: 'STOCK_RETURN',
        entityType: 'STOCK',
        entityId: it.productId,
        before: {
          available: pBefore?.availableQuantity,
          rented: pBefore?.rentedQuantity,
          damaged: pBefore?.damagedQuantity,
          lost: pBefore?.lostQuantity,
        },
        after: {
          available: pAfter?.availableQuantity,
          rented: pAfter?.rentedQuantity,
          damaged: pAfter?.damagedQuantity,
          lost: pAfter?.lostQuantity,
          returnNo,
          normalQty: normal,
          damagedQty: damaged,
          lostQty: lost,
        },
        correlationId,
      })
    }
  }

  // 2. Update Bill Items Status and Quantities
  const updatedItems: FullBillItem[] = targetBill.items.map((billItem) => {
    const insp = inspectionMap.get(billItem.rentalBillItemId) || inspectionMap.get((billItem as any).id)
    if (!insp) {
      return billItem
    }

    const normal = Math.max(0, insp.normalQty || 0)
    const damaged = Math.max(0, insp.damagedQty || 0)
    const lost = Math.max(0, insp.lostQty || 0)
    const sessionReturned = normal + damaged + lost

    // Cumulative returnedQty maintains invariant: returnedQty + outstandingQty = dispatched quantity
    const newReturnedQty = (billItem.returnedQty || 0) + sessionReturned
    const newDamagedQty = (billItem.damagedQuantity || 0) + damaged
    const newLostQty = (billItem.lostQuantity || 0) + lost
    const newOutstandingQty = Math.max(0, (billItem.outstandingQty || 0) - sessionReturned)

    let itemStatus = billItem.status
    if (newOutstandingQty === 0) {
      itemStatus = 'RETURNED'
    } else if (newReturnedQty > 0 || newDamagedQty > 0 || newLostQty > 0) {
      itemStatus = 'PARTIAL_RETURNED'
    }

    return {
      ...billItem,
      returnedQty: newReturnedQty,
      damagedQuantity: newDamagedQty,
      lostQuantity: newLostQty,
      outstandingQty: newOutstandingQty,
      status: itemStatus,
    }
  })

  // 3. Determine Overall Bill Status (Evaluate rental items only)
  const rentalItems = updatedItems.filter((i) => i.rentalType !== 'SALE' && i.itemType !== 'SALE' && i.requiresReturn !== false)
  const totalRemainingOutstanding = rentalItems.reduce((sum, i) => sum + (i.outstandingQty || 0), 0)
  const isFullyReturned = rentalItems.every((i) => (i.outstandingQty || 0) === 0)
  const anyReturned = rentalItems.some((i) => (i.returnedQty || 0) > 0)
  const nextRentalStatus = isFullyReturned ? 'RETURNED' : (anyReturned ? 'PARTIAL_RETURNED' : targetBill.rentalStatus)

  // 4. Calculate Damage / Loss Fees using Money Core in Satang
  let totalDamageSatang = 0
  let totalDefaultSatang = 0

  for (const it of returnItemsList) {
    const chargeOverride = options.actualDamageCharges?.find(
      (c) => c.rentalBillItemId === it.rentalBillItemId || (it.productId && c.productId === it.productId)
    )
    const masterProd = allMasterProducts.find((p) => p.id === it.productId)

    const defaultRepairFee = Number(masterProd?.defaultDamageFee ?? masterProd?.defaultRepairFee ?? 0)
    const defaultLossFee = Number(masterProd?.defaultLossFee ?? masterProd?.defaultReplacementFee ?? 0)

    let repairFee = 0
    let lossFee = 0

    const damagedQty = Math.max(0, it.damagedQty || 0)
    const lostQty = Math.max(0, it.lostQty || 0)

    if (chargeOverride) {
      if (chargeOverride.actualDamageCharge !== undefined) {
        repairFee = damagedQty > 0 ? Number(chargeOverride.actualDamageCharge) / damagedQty : 0
      } else {
        repairFee = Number(chargeOverride.damageCharge ?? chargeOverride.repairFeePerUnit ?? defaultRepairFee)
      }

      if (chargeOverride.actualLossCharge !== undefined) {
        lossFee = lostQty > 0 ? Number(chargeOverride.actualLossCharge) / lostQty : 0
      } else {
        lossFee = Number(chargeOverride.lossCharge ?? chargeOverride.replacementFeePerUnit ?? defaultLossFee)
      }
    } else {
      repairFee = it.repairFeePerUnit !== undefined && it.repairFeePerUnit > 0
        ? it.repairFeePerUnit
        : defaultRepairFee

      lossFee = it.replacementFeePerUnit !== undefined && it.replacementFeePerUnit > 0
        ? it.replacementFeePerUnit
        : defaultLossFee
    }

    const itemDamageSatang = multiplySatang(toSatang(repairFee), damagedQty)
    const itemLossSatang = multiplySatang(toSatang(lossFee), lostQty)
    const itemDefaultDamageSatang = multiplySatang(toSatang(defaultRepairFee), damagedQty)
    const itemDefaultLossSatang = multiplySatang(toSatang(defaultLossFee), lostQty)

    totalDamageSatang = addSatang(totalDamageSatang, itemDamageSatang, itemLossSatang)
    totalDefaultSatang = addSatang(totalDefaultSatang, itemDefaultDamageSatang, itemDefaultLossSatang)

    if (itemDamageSatang > 0) {
      recordAuditLog({
        userId: actorUserId,
        displayName: actorDisplayName,
        action: 'DAMAGE_CHARGE',
        entityType: 'FINANCE',
        entityId: it.rentalBillItemId,
        billId: targetBill.id,
        before: null,
        after: {
          billId: targetBill.id,
          billNo: targetBill.billNo,
          productId: it.productId,
          productName: (it as any).productName || masterProd?.name || targetBill.items?.find((i: any) => i.id === it.rentalBillItemId)?.productName || '',
          quantity: damagedQty,
          defaultAmount: toBaht(itemDefaultDamageSatang),
          actualAmount: toBaht(itemDamageSatang),
          returnNo,
        },
        reason: 'บันทึกค่าปรับสินค้าชำรุด',
        correlationId,
      })
    }

    if (itemLossSatang > 0) {
      recordAuditLog({
        userId: actorUserId,
        displayName: actorDisplayName,
        action: 'LOSS_CHARGE',
        entityType: 'FINANCE',
        entityId: it.rentalBillItemId,
        billId: targetBill.id,
        before: null,
        after: {
          billId: targetBill.id,
          billNo: targetBill.billNo,
          productId: it.productId,
          productName: (it as any).productName || masterProd?.name || targetBill.items?.find((i: any) => i.id === it.rentalBillItemId)?.productName || '',
          quantity: lostQty,
          defaultAmount: toBaht(itemDefaultLossSatang),
          actualAmount: toBaht(itemLossSatang),
          returnNo,
        },
        reason: 'บันทึกค่าปรับสินค้าสูญหาย',
        correlationId,
      })
    }
  }

  const totalDamageFee = toBaht(totalDamageSatang)
  const totalDefaultCompensation = toBaht(totalDefaultSatang)

  // 5. Deposit Settlement strictly using Money Core
  const heldDepositBefore = Number(targetBill.heldDepositAmount || 0)
  let depositApplied = 0
  let depositRefundDue = 0
  let additionalAmountDue = 0
  let heldDepositAfter = heldDepositBefore
  let updatedDeposits = targetBill.deposits || []

  // Deposit is applied ONLY when explicitly confirmed by user
  if (options.deductFromDeposit && totalDamageFee > 0) {
    const settlement = calculateDepositSettlement(heldDepositBefore, totalDamageFee)
    depositApplied = settlement.appliedDeposit
    depositRefundDue = settlement.refundDue
    additionalAmountDue = settlement.balanceDue
    heldDepositAfter = toBaht(Math.max(0, subtractSatang(toSatang(heldDepositBefore), toSatang(depositApplied))))

    recordAuditLog({
      userId: actorUserId,
      displayName: actorDisplayName,
      action: 'DEPOSIT_APPLY',
      entityType: 'FINANCE',
      entityId: targetBill.id,
      billId: targetBill.id,
      before: { billNo: targetBill.billNo, heldDeposit: heldDepositBefore },
      after: {
        billId: targetBill.id,
        billNo: targetBill.billNo,
        defaultAmount: totalDefaultCompensation,
        actualAmount: totalDamageFee,
        depositHeld: heldDepositBefore,
        depositApplied,
        refundDue: depositRefundDue,
        balanceDue: additionalAmountDue,
        returnNo,
      },
      reason: 'หักเงินมัดจำชำระค่าเสียหายตามการยืนยันของผู้ใช้',
      correlationId,
    })

    if (depositApplied > 0) {
      recordBillPayment({
        billId: targetBill.id,
        billNo: targetBill.billNo,
        amount: depositApplied,
        channel: 'หักจากเงินมัดจำ',
        customerName: targetBill.customerName,
        category: 'หักมัดจำชำระค่าเสียหาย',
        isDeposit: false,
        refNo: `TX-DEP-SETTLE-${returnNo}`,
        description: `หักชำระค่าเสียหายจากเงินมัดจำ ใบคืน ${returnNo}`,
        correlationId,
      })
    }

    if (depositRefundDue > 0) {
      recordExpense({
        billId: targetBill.id,
        billNo: targetBill.billNo,
        amount: depositRefundDue,
        channel: options.paymentMethod || 'โอนเงิน',
        category: 'คืนเงินมัดจำ',
        isDeposit: true,
        refNo: `TX-DEP-REFUND-${returnNo}`,
        description: `คืนเงินมัดจำส่วนที่เหลือ ใบคืน ${returnNo}`,
        correlationId,
      })

      recordAuditLog({
        userId: actorUserId,
        displayName: actorDisplayName,
        action: 'DEPOSIT_REFUND',
        entityType: 'FINANCE',
        entityId: targetBill.id,
        billId: targetBill.id,
        before: { billNo: targetBill.billNo, heldDeposit: heldDepositBefore },
        after: {
          billId: targetBill.id,
          billNo: targetBill.billNo,
          defaultAmount: totalDefaultCompensation,
          actualAmount: totalDamageFee,
          depositHeld: heldDepositBefore,
          depositApplied,
          refundDue: depositRefundDue,
          balanceDue: additionalAmountDue,
          returnNo,
        },
        reason: 'คืนเงินมัดจำส่วนที่เหลือจากการหักชำระค่าเสียหาย',
        correlationId,
      })
      heldDepositAfter = 0
    }

    updatedDeposits = (targetBill.deposits || []).map((dep) => ({
      ...dep,
      heldAmount: heldDepositAfter,
      appliedAmount: toBaht(addSatang(toSatang(dep.appliedAmount || 0), toSatang(depositApplied))),
      refundAmount: toBaht(addSatang(toSatang(dep.refundAmount || 0), toSatang(depositRefundDue))),
      status: (heldDepositAfter === 0 ? 'SETTLED' : dep.status) as any,
    }))
  } else if (!options.deductFromDeposit && totalDamageFee > 0) {
    additionalAmountDue = totalDamageFee
  }

  // 6. Handle any extra fee collected during return (cash / transfer / etc.)
  let extraCollected = 0
  if (options.collectedAmount && options.collectedAmount > 0) {
    extraCollected = options.collectedAmount
    const feeTx = recordBillPayment({
      billId: targetBill.id,
      billNo: targetBill.billNo,
      amount: extraCollected,
      channel: options.paymentMethod || 'เงินสด',
      customerName: targetBill.customerName,
      category: 'ค่าปรับ/ค่าชำรุด',
      isDeposit: false,
      refNo: `TX-RET-${returnNo}`,
      description: `รับชำระค่าปรับ/ชำรุด ใบคืนเลขที่ ${returnNo}`,
      correlationId,
    })

    recordAuditLog({
      userId: actorUserId,
      displayName: actorDisplayName,
      action: 'PAYMENT_RECEIVE',
      entityType: 'FINANCE',
      entityId: feeTx.id,
      billId: targetBill.id,
      before: null,
      after: {
        billNo: targetBill.billNo,
        amount: extraCollected,
        returnNo,
      },
      correlationId,
    })
  }

  // 7. Calculate final financial figures on the bill using Central Financial Core
  const newGrandTotal = toBaht(addSatang(toSatang(targetBill.grandTotal || 0), toSatang(totalDamageFee)))
  const newBillAmount = newGrandTotal

  // Strictly reconcile Net Paid from transaction history
  const finSummary = getBillFinanceSummary(targetBill.id, targetBill.billNo)
  const newPaidAmount = finSummary.netPaid
  const newOutstanding = toBaht(Math.max(0, subtractSatang(toSatang(newGrandTotal), toSatang(newPaidAmount))))

  const updatedBill: FullBill = {
    ...targetBill,
    items: updatedItems,
    rentalStatus: nextRentalStatus,
    grandTotal: newGrandTotal,
    billAmount: newBillAmount,
    paidAmount: newPaidAmount,
    outstandingAmount: newOutstanding,
    heldDepositAmount: heldDepositAfter,
    depositApplied: toBaht(addSatang(toSatang(targetBill.depositApplied || 0), toSatang(depositApplied))),
    refundDueAmount: toBaht(addSatang(toSatang(targetBill.refundDueAmount || 0), toSatang(depositRefundDue))),
    paymentStatus: newOutstanding <= 0 ? 'PAID' : (newPaidAmount > 0 ? 'PARTIAL' : 'UNPAID'),
    deposits: updatedDeposits,
  }

  updateBill(updatedBill)

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'BILL_RETURN',
    entityType: 'BILL',
    entityId: updatedBill.id,
    before: {
      billNo: targetBill.billNo,
      rentalStatus: targetBill.rentalStatus,
    },
    after: {
      billNo: updatedBill.billNo,
      rentalStatus: nextRentalStatus,
      returnNo,
      remainingOutstanding: totalRemainingOutstanding,
      isFullyReturned,
      totalDamageFee,
      depositApplied,
      depositRefundDue,
      additionalAmountDue,
    },
    correlationId,
  })

  return {
    bill: updatedBill,
    correlationId,
    returnNo,
    totalDamageCharges: totalDamageFee,
    totalDamageFee,
    depositApplied,
    depositRefund: depositRefundDue,
    depositRefundDue,
    additionalAmountDue,
  }
}

// ─── 4. BILL REVISION WORKFLOW ───────────────────────────────────────────────

export interface RevisedItemInput {
  rentalBillItemId?: string
  productId: string
  productName: string
  rentalType: 'NORMAL' | 'DAILY' | 'SALE'
  quantity: number
  returnedQty?: number
  outstandingQty?: number
  unitPrice: number
  usageCount?: number
  dailyStartDate?: string
  dailyEndDate?: string
  scheduledReturnDate?: string
  action?: 'UPDATE' | 'ADD' | 'REMOVE'
  addRounds?: number
  unitName?: string
}

export interface ProcessBillRevisionOptions {
  billId: string
  mode: 'CORRECTION' | 'EXTENSION' | string
  reason: string
  headerRentalDate?: string
  headerReturnDate?: string
  discountAmount?: number
  shippingFee?: number
  items?: RevisedItemInput[]
  newSubtotal?: number
  newGrandTotal?: number
  extensionDays?: number
  extensionFee?: number
  actor: ActorInfo
  correlationId?: string
}

export function processBillRevisionWorkflow(options: ProcessBillRevisionOptions): {
  bill: FullBill
  correlationId: string
  revisionRecord: BillRevisionRecord
  originalBill?: FullBill
  extensionBill?: FullBill
} {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'
  const trimmedReason = options.reason.trim()

  if (!trimmedReason) {
    throw new Error('Reason is strictly required for bill revision')
  }

  const currentBills = loadBills()
  const originalBill = currentBills.find((b) => b.id === options.billId)
  if (!originalBill) {
    throw new Error(`Bill ${options.billId} not found`)
  }

  // 1. Calculate Stock Deltas & apply stock adjustments
  const stockDeltas: Array<{ productId: string; productName: string; quantityDelta: number }> = []

  const rawItems: RevisedItemInput[] = options.items || (originalBill.items ? originalBill.items.map((it) => ({
    rentalBillItemId: it.rentalBillItemId,
    productId: it.productId,
    productName: it.productName,
    rentalType: (it.rentalType as any) || 'NORMAL',
    quantity: it.quantity,
    returnedQty: it.returnedQty,
    outstandingQty: it.outstandingQty,
    unitPrice: it.dailyRate || 0,
    unitName: it.unit,
    dailyStartDate: it.rentalStartDate,
    dailyEndDate: it.scheduledReturnDate,
    usageCount: it.usageCount || 1,
    action: 'UPDATE' as const,
  })) : [])

  // Active revised items (filter out REMOVE)
  const activeItems = rawItems.filter((it) => it.action !== 'REMOVE')

  // Map original quantities
  const originalItemQtyMap = new Map<string, number>()
  originalBill.items.forEach((it) => {
    originalItemQtyMap.set(it.productId, (originalItemQtyMap.get(it.productId) || 0) + it.quantity)
  })

  // Map revised quantities
  const revisedItemQtyMap = new Map<string, number>()
  activeItems.forEach((it) => {
    revisedItemQtyMap.set(it.productId, (revisedItemQtyMap.get(it.productId) || 0) + it.quantity)
  })

  // Calculate delta for each product
  const allProductIds = new Set([...originalItemQtyMap.keys(), ...revisedItemQtyMap.keys()])
  for (const prodId of allProductIds) {
    const oldQty = originalItemQtyMap.get(prodId) || 0
    const newQty = revisedItemQtyMap.get(prodId) || 0
    const delta = newQty - oldQty // positive = more rented/sold; negative = fewer

    if (delta !== 0) {
      adjustProductStockDelta(prodId, delta)
      const p = loadProducts().find((prod) => prod.id === prodId)
      stockDeltas.push({
        productId: prodId,
        productName: p?.name || prodId,
        quantityDelta: delta,
      })

      recordAuditLog({
        userId: actorUserId,
        displayName: actorDisplayName,
        action: 'STOCK_REVISION',
        entityType: 'STOCK',
        entityId: prodId,
        before: { billNo: originalBill.billNo, quantity: oldQty },
        after: { billNo: originalBill.billNo, quantity: newQty, quantityDelta: delta },
        reason: trimmedReason,
        correlationId,
      })
    }
  }

  // 2. Calculate Financial Recalculation
  const calculatedSubtotal = options.newSubtotal !== undefined
    ? options.newSubtotal
    : options.extensionFee !== undefined
      ? options.extensionFee
      : activeItems.reduce((sum, item) => {
          if (item.rentalType === 'DAILY') {
            const d1 = new Date(item.dailyStartDate || options.headerRentalDate || '2026-01-01')
            const d2 = new Date(item.dailyEndDate || options.headerReturnDate || '2026-01-01')
            const days = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000))
            return sum + item.quantity * item.unitPrice * days
          }
          if (item.rentalType === 'SALE') {
            return sum + item.quantity * item.unitPrice
          }
          return sum + item.quantity * item.unitPrice * (item.usageCount || 1)
        }, 0)

  const discount = options.discountAmount !== undefined ? options.discountAmount : (originalBill.discountAmount || 0)
  const shipping = options.shippingFee !== undefined ? options.shippingFee : (originalBill.shippingFee || 0)
  // Grand total strictly EXCLUDES deposit!
  const newGrandTotal = options.newGrandTotal !== undefined
    ? options.newGrandTotal
    : options.extensionFee !== undefined
      ? options.extensionFee
      : Math.max(0, calculatedSubtotal - discount + shipping)

  const oldGrandTotal = originalBill.grandTotal
  const oldPaidAmount = originalBill.paidAmount || 0
  const grandTotalDelta = newGrandTotal - oldGrandTotal

  // If new total is less than paid amount, calculate refund-due (DO NOT delete payments!)
  let newOutstanding = 0
  let refundDue = 0
  let paymentStatus = originalBill.paymentStatus

  if (newGrandTotal > oldPaidAmount) {
    newOutstanding = newGrandTotal - oldPaidAmount
    refundDue = 0
    paymentStatus = oldPaidAmount > 0 ? 'PARTIAL' : 'UNPAID'
  } else if (newGrandTotal < oldPaidAmount) {
    newOutstanding = 0
    refundDue = oldPaidAmount - newGrandTotal
    paymentStatus = 'PAID'
  } else {
    newOutstanding = 0
    refundDue = 0
    paymentStatus = 'PAID'
  }

  // 3. Build Revised Items
  const finalBillItems: FullBillItem[] = activeItems.map((it, idx) => {
    const existing = originalBill.items.find((orig) => orig.rentalBillItemId === it.rentalBillItemId)
    const returned = existing ? (existing.returnedQty || 0) : 0
    const damaged = existing ? (existing.damagedQuantity || 0) : 0
    const lost = existing ? (existing.lostQuantity || 0) : 0
    const outstanding = it.rentalType === 'SALE' ? 0 : Math.max(0, it.quantity - (returned + damaged + lost))

    let lineTotal = it.quantity * it.unitPrice
    if (it.rentalType === 'DAILY') {
      const d1 = new Date(it.dailyStartDate || options.headerRentalDate || '2026-01-01')
      const d2 = new Date(it.dailyEndDate || options.headerReturnDate || '2026-01-01')
      const days = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000))
      lineTotal = it.quantity * it.unitPrice * days
    } else if (it.rentalType === 'NORMAL') {
      lineTotal = it.quantity * it.unitPrice * (it.usageCount || 1)
    }

    return {
      rentalBillItemId: it.rentalBillItemId || `rbi-${Date.now()}-${idx}`,
      productId: it.productId,
      productCode: existing?.productCode || '',
      productName: it.productName,
      quantity: it.quantity,
      returnedQty: returned,
      damagedQuantity: damaged,
      lostQuantity: lost,
      outstandingQty: outstanding,
      dailyRate: it.unitPrice,
      unit: it.unitName || existing?.unit || 'ชิ้น',
      defaultRepairFee: existing?.defaultRepairFee || 0,
      defaultReplacementFee: existing?.defaultReplacementFee || 0,
      requiresReturn: it.rentalType !== 'SALE',
      rentalStartDate: it.dailyStartDate || options.headerRentalDate || originalBill.rentalStartDate,
      scheduledReturnDate: it.dailyEndDate || options.headerReturnDate || originalBill.scheduledReturnDate,
      rentalType: it.rentalType,
      usageCount: it.usageCount,
      lineTotal,
      status: outstanding === 0 ? 'RETURNED' : returned > 0 ? 'PARTIAL_RETURNED' : 'RENTING',
    }
  })

  // 4. Handle EXTENSION vs CORRECTION mode
  const revNo = (originalBill.revisions?.length || 0) + 1

  if (options.mode === 'EXTENSION') {
    // Mode: EXTENSION -> Do NOT overwrite original bill!
    // Original bill becomes EXTENDED. Create new linked extension bill.
    const extBillNo = `${originalBill.billNo}-EXT${revNo}`
    const extBillId = `bill-ext-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    const extensionBill: FullBill = {
      id: extBillId,
      billNo: extBillNo,
      billDate: new Date().toISOString().slice(0, 10),
      customerId: originalBill.customerId,
      customerName: originalBill.customerName,
      customerPhone: originalBill.customerPhone,
      customerAddress: originalBill.customerAddress,
      siteName: originalBill.siteName,
      originalBillId: originalBill.id,
      parentBillId: originalBill.id,
      rentalStartDate: options.headerRentalDate || originalBill.scheduledReturnDate,
      scheduledReturnDate: options.headerReturnDate || originalBill.scheduledReturnDate,
      rentalStatus: 'RENTING',
      dispatchStatus: 'DISPATCHED',
      subtotal: calculatedSubtotal,
      discountAmount: discount,
      shippingFee: shipping,
      billAmount: newGrandTotal,
      grandTotal: newGrandTotal,
      paidAmount: 0,
      outstandingAmount: newGrandTotal,
      paymentStatus: 'UNPAID',
      heldDepositAmount: 0,
      paidDepositAmount: 0,
      deposits: [],
      items: finalBillItems,
      remark: [originalBill.remark, `ต่อสัญญาจากบิล ${originalBill.billNo}: ${trimmedReason}`].filter(Boolean).join(' | '),
    }

    const revisionRecord: BillRevisionRecord = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      revisionNo: revNo,
      timestamp: new Date().toISOString(),
      userId: actorUserId,
      displayName: actorDisplayName,
      reason: trimmedReason,
      mode: 'EXTENSION',
      before: {
        grandTotal: originalBill.grandTotal,
        subtotal: originalBill.subtotal,
        paidAmount: originalBill.paidAmount,
        outstandingAmount: originalBill.outstandingAmount,
        items: originalBill.items,
      },
      after: {
        grandTotal: originalBill.grandTotal,
        subtotal: originalBill.subtotal,
        paidAmount: originalBill.paidAmount,
        outstandingAmount: originalBill.outstandingAmount,
        items: originalBill.items,
        extensionBillNo: extBillNo,
        extensionBillId: extBillId,
      } as any,
      stockDeltas,
      financialDelta: {
        grandTotalDelta: 0,
        outstandingDelta: 0,
        refundDueDelta: 0,
      },
      correlationId,
    }

    const updatedOriginalBill: FullBill = {
      ...originalBill,
      rentalStatus: 'EXTENDED',
      revisions: [...(originalBill.revisions || []), revisionRecord],
    }

    updateBill(updatedOriginalBill)
    addBill(extensionBill)

    recordAuditLog({
      userId: actorUserId,
      displayName: actorDisplayName,
      action: 'BILL_EXTENSION',
      entityType: 'BILL',
      entityId: extensionBill.id,
      before: { originalBillNo: originalBill.billNo, rentalStatus: originalBill.rentalStatus },
      after: {
        extensionBillNo: extBillNo,
        originalBillNo: originalBill.billNo,
        rentalStatus: 'RENTING',
        originalStatusAfter: 'EXTENDED',
      },
      correlationId,
    })

    return {
      bill: extensionBill,
      originalBill: updatedOriginalBill,
      correlationId,
      revisionRecord,
      extensionBill,
    }
  }

  // Default: Mode CORRECTION / REVISION on existing bill
  const revisionRecord: BillRevisionRecord = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    revisionNo: revNo,
    timestamp: new Date().toISOString(),
    userId: actorUserId,
    displayName: actorDisplayName,
    reason: trimmedReason,
    mode: options.mode,
    before: {
      grandTotal: oldGrandTotal,
      subtotal: originalBill.subtotal,
      paidAmount: oldPaidAmount,
      outstandingAmount: originalBill.outstandingAmount,
      items: originalBill.items,
    },
    after: {
      grandTotal: newGrandTotal,
      subtotal: calculatedSubtotal,
      paidAmount: oldPaidAmount,
      outstandingAmount: newOutstanding,
      items: finalBillItems,
    },
    stockDeltas,
    financialDelta: {
      grandTotalDelta,
      outstandingDelta: newOutstanding - (originalBill.outstandingAmount || 0),
      refundDueDelta: refundDue,
    },
    correlationId,
  }

  // Update Bill with Revision History
  const updatedBill: FullBill = {
    ...originalBill,
    rentalStartDate: options.headerRentalDate || originalBill.rentalStartDate,
    scheduledReturnDate: options.headerReturnDate || originalBill.scheduledReturnDate,
    subtotal: calculatedSubtotal,
    discountAmount: discount,
    shippingFee: shipping,
    billAmount: newGrandTotal,
    grandTotal: newGrandTotal,
    outstandingAmount: newOutstanding,
    refundDue: refundDue,
    refundDueAmount: refundDue,
    paymentStatus,
    items: finalBillItems,
    revisions: [...(originalBill.revisions || []), revisionRecord],
    remark: [originalBill.remark, `แก้ไขบิล: ${trimmedReason}`].filter(Boolean).join(' | '),
  }

  updateBill(updatedBill)

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'BILL_REVISION',
    entityType: 'BILL',
    entityId: updatedBill.id,
    before: {
      billNo: originalBill.billNo,
      grandTotal: oldGrandTotal,
      outstandingAmount: originalBill.outstandingAmount,
      paymentStatus: originalBill.paymentStatus,
    },
    after: {
      billNo: updatedBill.billNo,
      grandTotal: newGrandTotal,
      outstandingAmount: newOutstanding,
      refundDueAmount: refundDue,
      paymentStatus,
      revisionNo: revisionRecord.revisionNo,
    },
    reason: trimmedReason,
    correlationId,
  })

  return { bill: updatedBill, correlationId, revisionRecord }
}

// ─── 5. CANCEL / VOID BILL WORKFLOW ──────────────────────────────────────────

export interface CancelBillOptions {
  billId: string
  reason: string
  actor: ActorInfo
  actionType?: 'CANCEL' | 'VOID'
  correlationId?: string
}

export function cancelOrVoidBillWorkflow(options: CancelBillOptions): {
  bill: FullBill
  correlationId: string
  refundTransaction?: StatementTransaction
  releasedReservations?: ReservationRecord[]
} {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'
  const trimmedReason = options.reason.trim()
  const actionType = options.actionType || 'CANCEL'

  if (!trimmedReason) {
    throw new Error('Reason is required for cancelling or voiding a bill')
  }

  const currentBills = loadBills()
  const targetBill = currentBills.find((b) => b.id === options.billId)
  if (!targetBill) {
    throw new Error(`Bill ${options.billId} not found`)
  }

  // Dispatch Check:
  // "ถ้ายังไม่ Dispatch/ส่งมอบ: Cancel แล้วสามารถ Release Reservation/คืน Stock ที่ถูกกันไว้ได้"
  // "ถ้าสินค้าถูกส่งหรือปล่อยเช่าแล้ว: ห้าม Cancel แล้วเพิ่ม Available กลับทันที"
  // "Void เพียงอย่างเดียวห้ามทำให้สินค้าที่อยู่กับลูกค้ากลับ Available"
  const isDispatched = targetBill.dispatchStatus === 'DISPATCHED'
  let releasedReservations: ReservationRecord[] = []

  if (!isDispatched) {
    // Release active reservations and backorders
    const billResvs = releaseReservationsBySource('BILL', targetBill.id, trimmedReason, correlationId)
    const quoteResvs = targetBill.quotationId
      ? releaseReservationsBySource('QUOTATION', targetBill.quotationId, trimmedReason, correlationId)
      : []
    releasedReservations = [...billResvs, ...quoteResvs]
    cancelBackordersBySource('BILL', targetBill.id, trimmedReason)

    targetBill.items.forEach((item) => {
      syncProductReservedStock(item.productId)

      /* Reservation release handled in db */

      recordAuditLog({
        userId: actorUserId,
        displayName: actorDisplayName,
        action: 'STOCK_RELEASE',
        entityType: 'STOCK',
        entityId: item.productId,
        before: { billNo: targetBill.billNo, quantity: item.quantity },
        after: { status: 'RELEASED', dispatchStatus: 'PENDING' },
        reason: trimmedReason,
        correlationId,
      })
    })
  }

  // Handle existing payments: DO NOT delete original payments! Create refund/reversal transaction
  let refundTransaction: StatementTransaction | undefined
  const paid = targetBill.paidAmount || 0
  if (paid > 0) {
    refundTransaction = recordExpense({
      refNo: `REFUND-${targetBill.billNo}`,
      amount: paid,
      customerName: targetBill.customerName,
      billId: targetBill.id,
      billNo: targetBill.billNo,
      category: 'คืนเงินยกเลิกบิล',
      description: `คืนเงินจากการยกเลิกบิล ${targetBill.billNo}: ${trimmedReason}`,
      correlationId,
      isDeposit: false,
    })

    recordAuditLog({
      userId: actorUserId,
      displayName: actorDisplayName,
      action: 'PAYMENT_REFUND',
      entityType: 'FINANCE',
      entityId: refundTransaction.id,
      before: { billNo: targetBill.billNo, paidAmount: paid },
      after: {
        refNo: refundTransaction.refNo,
        refundAmount: paid,
        reason: trimmedReason,
      },
      reason: trimmedReason,
      correlationId,
    })
  }

  // Handle deposit refund if held
  const heldDeposit = targetBill.heldDepositAmount || 0
  if (heldDeposit > 0) {
    const depRefundTx = recordExpense({
      refNo: `DEP-REFUND-${targetBill.billNo}`,
      amount: heldDeposit,
      customerName: targetBill.customerName,
      billId: targetBill.id,
      billNo: targetBill.billNo,
      category: 'คืนเงินมัดจำ',
      description: `คืนมัดจำจากการยกเลิกบิล ${targetBill.billNo}: ${trimmedReason}`,
      correlationId,
      isDeposit: true,
    })

    recordAuditLog({
      userId: actorUserId,
      displayName: actorDisplayName,
      action: 'DEPOSIT_REFUND',
      entityType: 'FINANCE',
      entityId: depRefundTx.id,
      before: { billNo: targetBill.billNo, heldDepositAmount: heldDeposit },
      after: {
        refNo: depRefundTx.refNo,
        refundAmount: heldDeposit,
      },
      reason: trimmedReason,
      correlationId,
    })
  }

  const nextRentalStatus = actionType === 'VOID' ? 'VOID' : 'CANCELLED'
  const nextPaymentStatus = paid > 0 ? 'REFUNDED' : targetBill.paymentStatus

  const updatedBill: FullBill = {
    ...targetBill,
    rentalStatus: nextRentalStatus,
    paymentStatus: nextPaymentStatus,
    cancelledAt: new Date().toISOString(),
    cancelReason: trimmedReason,
    outstandingAmount: 0,
    heldDepositAmount: 0,
    depositRefunded: (targetBill.depositRefunded || 0) + heldDeposit,
    remark: [targetBill.remark, `${actionType === 'VOID' ? 'โมฆะ' : 'ยกเลิก'}บิล: ${trimmedReason}`].filter(Boolean).join(' | '),
  }

  updateBill(updatedBill)

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: actionType === 'VOID' ? 'BILL_VOID' : 'BILL_CANCEL',
    entityType: 'BILL',
    entityId: updatedBill.id,
    before: {
      billNo: targetBill.billNo,
      rentalStatus: targetBill.rentalStatus,
      paymentStatus: targetBill.paymentStatus,
      grandTotal: targetBill.grandTotal,
      paidAmount: targetBill.paidAmount,
    },
    after: {
      billNo: updatedBill.billNo,
      rentalStatus: nextRentalStatus,
      paymentStatus: nextPaymentStatus,
      cancelReason: trimmedReason,
      stockRestored: !isDispatched,
    },
    reason: trimmedReason,
    correlationId,
  })

  return { bill: updatedBill, correlationId, refundTransaction, releasedReservations }
}

// ─── 6. DEPOSIT REFUND WORKFLOW ──────────────────────────────────────────────

export interface ProcessDepositRefundOptions {
  billId: string
  amount: number
  channel: string
  referenceNo?: string
  note?: string
  depositId?: string
  actor: ActorInfo
  correlationId?: string
}

export function processDepositRefundWorkflow(options: ProcessDepositRefundOptions): {
  bill: FullBill
  correlationId: string
  transaction: StatementTransaction
  refundTx: StatementTransaction
} {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'

  const currentBills = loadBills()
  const targetBill = currentBills.find((b) => b.id === options.billId)
  if (!targetBill) {
    throw new Error(`Bill ${options.billId} not found`)
  }

  const currentHeld = targetBill.heldDepositAmount || 0
  if (options.amount <= 0 || options.amount > currentHeld) {
    throw new Error(`Refund amount (${options.amount}) exceeds held deposit (฿${currentHeld})`)
  }

  const tx = recordExpense({
    refNo: options.referenceNo || `DEP-REF-${Date.now().toString().slice(-6)}`,
    amount: options.amount,
    channel: options.channel,
    customerName: targetBill.customerName,
    category: 'คืนเงินมัดจำ',
    description: options.note || `คืนเงินมัดจำ บิลเลขที่ ${targetBill.billNo}`,
    billId: targetBill.id,
    billNo: targetBill.billNo,
    isDeposit: true,
    correlationId,
  })

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'DEPOSIT_REFUND',
    entityType: 'FINANCE',
    entityId: tx.id,
    before: { billNo: targetBill.billNo, heldDepositAmount: currentHeld },
    after: {
      refNo: tx.refNo,
      amount: options.amount,
      remainingHeld: currentHeld - options.amount,
    },
    correlationId,
  })

  // Update deposits array if matching deposit exists
  const updatedDeposits = (targetBill.deposits || []).map((dep) => {
    if (options.depositId && dep.id === options.depositId) {
      const newHeld = Math.max(0, dep.heldAmount - options.amount)
      return {
        ...dep,
        heldAmount: newHeld,
        refundAmount: (dep.refundAmount || 0) + options.amount,
        status: newHeld <= 0 ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      }
    }
    return dep
  })

  const newHeld = Math.max(0, currentHeld - options.amount)
  const updatedBill: FullBill = {
    ...targetBill,
    heldDepositAmount: newHeld,
    depositRefunded: (targetBill.depositRefunded || 0) + options.amount,
    deposits: updatedDeposits,
  }

  updateBill(updatedBill)

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'BILL_DEPOSIT_UPDATE',
    entityType: 'BILL',
    entityId: updatedBill.id,
    before: { billNo: targetBill.billNo, heldDepositAmount: currentHeld },
    after: { billNo: updatedBill.billNo, heldDepositAmount: newHeld, refunded: options.amount },
    correlationId,
  })

  return { bill: updatedBill, correlationId, transaction: tx, refundTx: tx }
}

// ─── 7. PAYMENT REFUND WORKFLOW ──────────────────────────────────────────────

export interface ProcessPaymentRefundOptions {
  billId: string
  amount: number
  channel?: string
  reason: string
  referenceNo?: string
  originalTxId?: string
  actor: ActorInfo
  correlationId?: string
}

export interface ProcessPaymentRefundResult {
  bill: FullBill
  correlationId: string
  transaction: StatementTransaction
  refundTx: StatementTransaction
}

export function processPaymentRefundWorkflow(
  options: ProcessPaymentRefundOptions
): ProcessPaymentRefundResult & PromiseLike<ProcessPaymentRefundResult> {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'
  const trimmedReason = options.reason?.trim()

  if (options.amount <= 0) {
    throw new Error('INVALID_AMOUNT: Refund amount must be greater than 0')
  }

  if (!trimmedReason) {
    throw new Error('REASON_REQUIRED: Reason is strictly required for payment refund')
  }

  const currentBills = loadBills()
  const targetBill = currentBills.find((b) => b.id === options.billId)
  if (!targetBill) {
    throw new Error(`Bill ${options.billId} not found`)
  }

  // Enforce cumulative refund limit using Money Core in Satang
  const summary = getBillFinanceSummary(targetBill.id, targetBill.billNo)
  const refundAmountSatang = toSatang(options.amount)
  const netPaidSatang = toSatang(summary.netPaid)

  if (refundAmountSatang > netPaidSatang) {
    throw new Error(
      `Refund amount (${options.amount}) exceeds available net paid revenue of ฿${summary.netPaid}`
    )
  }

  let effectiveChannel = options.channel

  // Validate original transaction if provided
  if (options.originalTxId) {
    const origTx = summary.transactions.find(
      (t) => t.id === options.originalTxId && t.type === 'INCOME' && !t.isDeposit
    )
    if (!origTx) {
      throw new Error(
        `ORIGINAL_TX_NOT_FOUND: Original payment transaction ${options.originalTxId} not found for bill ${targetBill.billNo}`
      )
    }

    const priorRefundsSatang = summary.transactions
      .filter((t) => t.originalTxId === options.originalTxId && t.type === 'EXPENSE' && !t.isDeposit)
      .reduce((sum, t) => addSatang(sum, toSatang(t.expenseAmount)), 0)

    const origAmountSatang = toSatang(origTx.incomeAmount)
    if (addSatang(priorRefundsSatang, refundAmountSatang) > origAmountSatang) {
      const remainingBaht = toBaht(Math.max(0, origAmountSatang - priorRefundsSatang))
      throw new Error(
        `REFUND_EXCEEDS_ORIGINAL_TX: Refund amount (${options.amount}) exceeds remaining amount of original payment (฿${remainingBaht} available)`
      )
    }

    if (!effectiveChannel) {
      effectiveChannel = origTx.channel
    }
  }

  effectiveChannel = effectiveChannel || 'โอนเงิน'

  // Pre-calculate local fallback state using Satang integer math
  const newNetPaidSatang = Math.max(0, subtractSatang(netPaidSatang, refundAmountSatang))
  const newPaidAmount = toBaht(newNetPaidSatang)
  const newOutstanding = toBaht(Math.max(0, subtractSatang(toSatang(targetBill.grandTotal), newNetPaidSatang)))
  const newPaymentStatus = newPaidAmount <= 0 ? 'REFUNDED' : 'REFUND_PARTIAL'

  // Create local transaction
  const localTx = recordExpense({
    refNo: options.referenceNo || `PAY-REF-${Date.now().toString().slice(-6)}`,
    amount: options.amount,
    channel: effectiveChannel,
    customerName: targetBill.customerName,
    category: 'คืนเงินลูกค้า',
    description: `คืนเงินรับชำระ บิลเลขที่ ${targetBill.billNo}: ${trimmedReason}`,
    billId: targetBill.id,
    billNo: targetBill.billNo,
    originalTxId: options.originalTxId,
    isDeposit: false,
    correlationId,
  })

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'PAYMENT_REFUND',
    entityType: 'FINANCE',
    entityId: localTx.id,
    billId: targetBill.id,
    before: { billNo: targetBill.billNo, netPaid: summary.netPaid },
    after: {
      refNo: localTx.refNo,
      amount: options.amount,
      netPaidRemaining: newPaidAmount,
      reason: trimmedReason,
      originalTxId: options.originalTxId,
      channel: effectiveChannel,
    },
    reason: trimmedReason,
    correlationId,
  })

  const localUpdatedBill: FullBill = {
    ...targetBill,
    paidAmount: newPaidAmount,
    outstandingAmount: newOutstanding,
    paymentStatus: newPaymentStatus,
  }
  updateBill(localUpdatedBill)

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'BILL_PAYMENT_UPDATE',
    entityType: 'BILL',
    entityId: localUpdatedBill.id,
    billId: targetBill.id,
    before: {
      billNo: targetBill.billNo,
      paidAmount: targetBill.paidAmount,
      outstandingAmount: targetBill.outstandingAmount,
      paymentStatus: targetBill.paymentStatus,
    },
    after: {
      billNo: localUpdatedBill.billNo,
      paidAmount: newPaidAmount,
      outstandingAmount: newOutstanding,
      paymentStatus: newPaymentStatus,
    },
    reason: trimmedReason,
    correlationId,
  })

  const localResult: ProcessPaymentRefundResult = {
    bill: localUpdatedBill,
    correlationId,
    transaction: localTx,
    refundTx: localTx,
  }

  // Primary Database RPC execution when running with Supabase backend
  const supabase = createClient()
  const rpcPromise = (async (): Promise<ProcessPaymentRefundResult> => {
    try {
      const { data, error } = await supabase.rpc('process_payment_refund_rpc', {
        p_bill_id: targetBill.id,
        p_original_tx_id: options.originalTxId || null,
        p_amount: options.amount,
        p_channel: effectiveChannel,
        p_reason: trimmedReason,
        p_actor_user_id: actorUserId,
        p_actor_display_name: actorDisplayName,
        p_correlation_id: correlationId,
      })

      if (error) {
        if (error.message.includes('FORBIDDEN') || error.message.includes('REFUND_EXCEEDS')) {
          throw new Error(error.message)
        }
        return localResult
      }

      if (data && data.status === 'SUCCESS') {
        const dbBill = data.bill ? dbBillToFullBill(data.bill) : localUpdatedBill
        const dbTx: StatementTransaction = {
          id: data.refund_tx_id || localTx.id,
          dateTime: new Date().toISOString(),
          refNo: data.ref_no || localTx.refNo,
          type: 'EXPENSE',
          category: 'คืนเงินลูกค้า',
          description: `คืนเงินรับชำระ บิลเลขที่ ${targetBill.billNo}: ${trimmedReason}`,
          customerName: targetBill.customerName,
          incomeAmount: 0,
          expenseAmount: Number(data.amount || options.amount),
          runningBalance: 0,
          channel: data.channel || effectiveChannel,
          billId: targetBill.id,
          billNo: targetBill.billNo,
          originalTxId: options.originalTxId,
          correlationId,
          isDeposit: false,
        }

        // Reconcile local storage using authoritative DB result (prevent duplicate transactions)
        const allTxs = loadTransactions().filter((t) => t.id !== localTx.id && t.id !== dbTx.id)
        saveTransactions([dbTx, ...allTxs])
        updateBill(dbBill)

        return {
          bill: dbBill,
          correlationId,
          transaction: dbTx,
          refundTx: dbTx,
        }
      }

      return localResult
    } catch (err: any) {
      if (err?.message?.includes('FORBIDDEN') || err?.message?.includes('REFUND_EXCEEDS')) {
        throw err
      }
      return localResult
    }
  })()

  // Return hybrid result that works synchronously and as a Thenable
  return Object.assign(localResult, {
    then<TResult1 = ProcessPaymentRefundResult, TResult2 = never>(
      onfulfilled?: ((value: ProcessPaymentRefundResult) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
      return rpcPromise.then(onfulfilled, onrejected)
    },
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
    ): Promise<ProcessPaymentRefundResult | TResult> {
      return rpcPromise.catch(onrejected)
    },
    finally(onfinally?: (() => void) | null): Promise<ProcessPaymentRefundResult> {
      return rpcPromise.finally(onfinally)
    },
  })
}

// ─── 8. FULFILL BACKORDER WORKFLOW ───────────────────────────────────────────

export interface FulfillBackorderWorkflowOptions {
  backorderId: string
  allocateQty?: number
  allocatedQty?: number
  notificationId?: string
  actor: ActorInfo
  correlationId?: string
}

/**
 * Explicit user-confirmed backorder allocation.
 * Invariants:
 * - NEVER auto-allocates silently.
 * - Deducts outstanding backorder quantity.
 * - Creates an ACTIVE Reservation for the allocated quantity.
 * - Synchronizes product reserved stock.
 * - Marks actionable notification as ACTIONED.
 * - Audits BACKORDER_ALLOCATE with shared correlationId.
 */
export function fulfillBackorderWorkflow(options: FulfillBackorderWorkflowOptions): {
  backorder: BackorderRecord
  reservation: ReservationRecord
  correlationId: string
  fulfilledBackorder?: BackorderRecord
  newReservation?: ReservationRecord
} {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'
  const qtyToAllocate = Number(options.allocateQty ?? options.allocatedQty ?? 0)

  if (qtyToAllocate <= 0) {
    throw new Error('Allocate quantity must be greater than 0')
  }

  // 1. Fulfill backorder
  const { backorder: updatedBo } = fulfillBackorder(options.backorderId, qtyToAllocate)

  // 2. Create Active Reservation for allocated quantity
  const reservation = createReservation({
    sourceType: updatedBo.sourceType,
    sourceId: updatedBo.sourceId,
    sourceNo: updatedBo.sourceNo,
    customerId: updatedBo.customerId,
    customerName: updatedBo.customerName,
    productId: updatedBo.productId,
    productCode: updatedBo.productCode,
    productName: updatedBo.productName,
    itemType: updatedBo.itemType,
    quantity: qtyToAllocate,
    startDate: updatedBo.startDate || new Date().toISOString().slice(0, 10),
    endDate: updatedBo.endDate || new Date().toISOString().slice(0, 10),
    correlationId,
  })

  // 3. Sync product reserved stock
  syncProductReservedStock(updatedBo.productId)

  // 4. Mark notifications as ACTIONED
  markNotificationActionedByBackorder(updatedBo.id, actorDisplayName)

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'BACKORDER_ALLOCATE',
    entityType: 'BACKORDER',
    entityId: updatedBo.id,
    before: { backorderNo: updatedBo.backorderNo, status: 'READY' },
    after: {
      backorderNo: updatedBo.backorderNo,
      allocatedQty: qtyToAllocate,
      outstandingQty: updatedBo.outstandingQty,
      status: updatedBo.status,
      reservationId: reservation.id,
    },
    correlationId,
  })

  return {
    backorder: updatedBo,
    reservation,
    correlationId,
    fulfilledBackorder: updatedBo,
    newReservation: reservation,
  }
}

// ─── 9. RESERVATION EXPIRY WORKFLOW ──────────────────────────────────────────

export interface ExpireReservationsResult {
  expiredReservations: ReservationRecord[]
  correlationId: string
}

/**
 * Check and expire reservations based on centralized settings policy.
 * Invariants:
 * - NEVER expires DISPATCHED reservations (they are physically with customer).
 * - Only ACTIVE reservations can expire.
 * - Policies supported:
 *    - UNTIL_START_DATE: expires if today > startDate (start date has passed).
 *    - DAYS_LIMIT: expires if days since createdAt >= reservationExpiryDaysLimit.
 *    - MANUAL: no automatic expiry.
 * - Synchronizes product reserved quantity upon expiry.
 * - Triggers backorder readiness check if available stock increases.
 * - Audits RESERVATION_EXPIRE with shared correlationId.
 */
export function checkAndExpireReservations(
  currentDate?: string,
  actor?: ActorInfo,
  correlationId?: string
): ExpireReservationsResult {
  const corrId = correlationId || generateCorrelationId()
  const actorUserId = actor?.userId || 'system'
  const actorDisplayName = actor?.displayName || 'ระบบ'

  const settings = loadSystemSettings()
  const policy = settings.rentalBilling?.reservationExpiryPolicy || 'UNTIL_START_DATE'
  if (policy === 'MANUAL') {
    return { expiredReservations: [], correlationId: corrId }
  }

  const todayStr = currentDate || new Date().toISOString().slice(0, 10)
  const allReservations = loadReservations()
  const expired: ReservationRecord[] = []
  const affectedProductIds = new Set<string>()

  for (const resv of allReservations) {
    // INVARIANT: DISPATCHED reservations can NEVER expire!
    if (resv.status !== 'ACTIVE') continue

    let shouldExpire = false
    if (policy === 'UNTIL_START_DATE') {
      if (resv.startDate && todayStr >= resv.startDate) {
        shouldExpire = true
      }
    } else if (policy === 'DAYS_LIMIT') {
      const daysLimit = settings.rentalBilling?.reservationExpiryDays ?? 3
      const createdDateStr = resv.createdAt ? resv.createdAt.slice(0, 10) : todayStr
      const createdTime = new Date(createdDateStr).getTime()
      const compareTime = new Date(todayStr).getTime()
      const diffDays = (compareTime - createdTime) / (1000 * 60 * 60 * 24)
      if (diffDays >= daysLimit) {
        shouldExpire = true
      }
    }

    if (shouldExpire) {
      const updated = expireReservation(resv.id, `EXPIRED_BY_POLICY_${policy}`, corrId)
      if (updated) {
        expired.push(updated)
        affectedProductIds.add(resv.productId)

        recordAuditLog({
          userId: actorUserId,
          displayName: actorDisplayName,
          action: 'RESERVATION_EXPIRE',
          entityType: 'RESERVATION',
          entityId: resv.id,
          before: { status: 'ACTIVE', reservationNo: resv.reservationNo },
          after: { status: 'EXPIRED', reservationNo: resv.reservationNo, policy },
          correlationId: corrId,
        })
      }
    }
  }

  // Sync reserved stock for all affected products and check if backorders can be notified
  for (const prodId of Array.from(affectedProductIds)) {
    syncProductReservedStock(prodId)
    const avail = getProductAvailability(prodId)
    if (avail.availableForRange > 0) {
      checkBackordersOnStockIncrease(prodId, avail.availableForRange, { userId: actorUserId, displayName: actorDisplayName }, corrId)
    }
  }

  return { expiredReservations: expired, correlationId: corrId }
}

