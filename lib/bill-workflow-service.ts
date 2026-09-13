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
import { RentalBill, BillRevisionRecord } from '@/lib/types/rental-pos'
import {
  loadBills,
  saveBills,
  updateBill,
  canHardDeleteBill,
  deleteBill as deleteBillFromStorage,
} from '@/lib/bill-storage'
import {
  recordBillPayment,
  recordExpense,
  getBillFinanceSummary,
  loadTransactions,
  StatementTransaction,
} from '@/lib/finance-storage'
import {
  rentProductStock,
  returnProductStock,
  restoreSaleProductStock,
  adjustProductStockDelta,
  loadProducts,
  getProductAvailability,
  syncProductReservedStock,
} from '@/lib/product-storage'
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
    grandTotal: Number(rawBill.grandTotal || 0),
    outstandingAmount: Number(rawBill.outstandingAmount || Math.max(0, (rawBill.grandTotal || 0) - (rawBill.paidAmount || 0))),
    paymentStatus: rawBill.paymentStatus || 'UNPAID',
    rentalStatus: rawBill.rentalStatus || 'RENTING',
    dispatchStatus: rawBill.dispatchStatus || 'DISPATCHED',
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

  if (dispatchStatus === 'PENDING') {
    // 1. PENDING: Confirm ≠ Dispatch. Reserved ≠ Rented.
    // Do NOT increment rentedQuantity or permanently deduct SALE stock.
    // Create dated ReservationRecord and BackorderRecord if shortage.
    // If incoming bill has a quotationId, check if the quotation already holds ACTIVE reservations
    const quotationReservations = incomingBill.quotationId
      ? getReservationsBySource('QUOTATION', incomingBill.quotationId).filter((r) => r.status === 'ACTIVE')
      : []

    incomingBill.items.forEach((item) => {
      const isSale = item.rentalType === 'SALE'
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
      markQuotationConverted(incomingBill.quotationId, incomingBill.id, correlationId)
    }
  } else {
    // 2. DISPATCHED: Stock is physically handed over.
    incomingBill.items.forEach((item) => {
      const isSale = item.rentalType === 'SALE'
      rentProductStock(item.productId, item.quantity, isSale)
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
      markQuotationConverted(incomingBill.quotationId, incomingBill.id, correlationId)
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
    // Single revenue payment
    const revAmount = Math.max(0, incomingBill.paidAmount - depositAmount)
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
  const targetRentalStatus = hasRentalItems ? 'RENTING' : 'CLOSED'

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
    dispatchStatus: options.dispatchStatus || targetBill.dispatchStatus || 'PENDING',
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
}

/**
 * Dispatch a bill (transitions PENDING -> DISPATCHED).
 * Invariants:
 * - Transitions all active reservations for this bill to DISPATCHED.
 * - If bill originated from Quotation, also dispatches Quotation reservations.
 * - Deducts physical stock: RENT -> increments rentedQuantity, SALE -> deducts totalQuantity.
 * - Syncs product reservedQuantity.
 * - Audits DISPATCH, STOCK_RENT, STOCK_SALE with shared correlationId.
 */
export function dispatchBillWorkflow(options: DispatchBillOptions): {
  bill: FullBill
  correlationId: string
  dispatchedReservations: ReservationRecord[]
} {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'

  const currentBills = loadBills()
  const targetBill = currentBills.find((b) => b.id === options.billId)
  if (!targetBill) {
    throw new Error(`Bill ${options.billId} not found`)
  }
  if (targetBill.dispatchStatus === 'DISPATCHED') {
    throw new Error(`Bill ${targetBill.billNo} is already dispatched`)
  }
  if (targetBill.rentalStatus === 'CANCELLED' || targetBill.rentalStatus === 'VOID') {
    throw new Error(`Cannot dispatch cancelled or voided bill`)
  }

  // 1. Transition reservations to DISPATCHED
  const dispatchedReservations = [
    ...dispatchReservationsBySource('BILL', targetBill.id, correlationId),
    ...(targetBill.quotationId ? dispatchReservationsBySource('QUOTATION', targetBill.quotationId, correlationId) : []),
  ]

  // 2. Deduct physical stock (RENT -> rentedQuantity++, SALE -> totalQuantity--)
  targetBill.items.forEach((item) => {
    const isSale = item.rentalType === 'SALE'
    rentProductStock(item.productId, item.quantity, isSale)
    syncProductReservedStock(item.productId)

    recordAuditLog({
      userId: actorUserId,
      displayName: actorDisplayName,
      action: isSale ? 'STOCK_SALE' : 'STOCK_RENT',
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
  })

  // 3. Update Bill dispatchStatus to DISPATCHED
  const updatedBill: FullBill = {
    ...targetBill,
    dispatchStatus: 'DISPATCHED',
  }

  updateBill(updatedBill)

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'BILL_DISPATCH',
    entityType: 'BILL',
    entityId: updatedBill.id,
    before: { billNo: targetBill.billNo, dispatchStatus: targetBill.dispatchStatus },
    after: { billNo: updatedBill.billNo, dispatchStatus: 'DISPATCHED' },
    correlationId,
  })

  return { bill: updatedBill, correlationId, dispatchedReservations }
}

// ─── 2. SPLIT PAYMENT WORKFLOW ───────────────────────────────────────────────

export interface ProcessSplitPaymentOptions {
  billId: string
  tenders?: SplitTenderInput[]
  splits?: Array<{ channel?: string; paymentMethod?: string; amount: number; referenceNo?: string }>
  actor: ActorInfo
  paymentDate?: string
  correlationId?: string
}

export function processSplitPaymentWorkflow(options: ProcessSplitPaymentOptions): {
  bill: FullBill
  correlationId: string
  transactions: StatementTransaction[]
} {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'

  const currentBills = loadBills()
  const targetBill = currentBills.find((b) => b.id === options.billId)
  if (!targetBill) {
    throw new Error(`Bill ${options.billId} not found`)
  }

  const rawTenders = options.tenders || (options.splits || []).map((s) => ({
    paymentMethod: s.paymentMethod || s.channel || 'เงินสด',
    amount: s.amount,
    referenceNo: s.referenceNo,
  }))
  const validTenders = rawTenders.filter((t) => Number(t.amount || 0) > 0)
  const totalPayment = validTenders.reduce((sum, t) => sum + Number(t.amount || 0), 0)

  if (totalPayment <= 0) {
    throw new Error('Total payment amount must be greater than 0')
  }
  if (totalPayment > (targetBill.outstandingAmount || 0) + 0.001) {
    throw new Error('Payment amount cannot exceed outstanding amount')
  }

  const transactions: StatementTransaction[] = []

  // Create 1 transaction per valid channel
  for (const tender of validTenders) {
    const tx = recordBillPayment({
      billId: targetBill.id,
      billNo: targetBill.billNo,
      amount: Number(tender.amount),
      channel: tender.paymentMethod,
      customerName: targetBill.customerName,
      date: options.paymentDate,
      category: 'ค่าเช่าอุปกรณ์',
      isDeposit: false,
      refNo: tender.referenceNo ? `TX-${targetBill.billNo}-${tender.referenceNo}` : undefined,
      description: `รับชำระเงิน (${tender.paymentMethod}) บิลเลขที่ ${targetBill.billNo}`,
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
        billNo: targetBill.billNo,
        amount: tender.amount,
        channel: tender.paymentMethod,
      },
      correlationId,
    })
  }

  const newPaidAmount = (targetBill.paidAmount || 0) + totalPayment
  const newOutstandingAmount = Math.max(0, (targetBill.outstandingAmount || 0) - totalPayment)
  const newPaymentStatus = newOutstandingAmount <= 0 ? 'PAID' : 'PARTIAL'

  const updatedBill: FullBill = {
    ...targetBill,
    paidAmount: newPaidAmount,
    outstandingAmount: newOutstandingAmount,
    paymentStatus: newPaymentStatus,
  }

  updateBill(updatedBill)

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'BILL_PAYMENT',
    entityType: 'BILL',
    entityId: updatedBill.id,
    before: {
      billNo: targetBill.billNo,
      paidAmount: targetBill.paidAmount,
      outstandingAmount: targetBill.outstandingAmount,
      paymentStatus: targetBill.paymentStatus,
    },
    after: {
      billNo: updatedBill.billNo,
      paidAmount: updatedBill.paidAmount,
      outstandingAmount: updatedBill.outstandingAmount,
      paymentStatus: updatedBill.paymentStatus,
      totalReceived: totalPayment,
      channelCount: validTenders.length,
    },
    correlationId,
  })

  return { bill: updatedBill, correlationId, transactions }
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

export interface ProcessReturnOptions {
  billId: string
  returnNo?: string
  items?: ReturnItemInput[]
  returnItems?: ReturnItemInput[]
  actor: ActorInfo
  collectedAmount?: number
  paymentMethod?: string
  correlationId?: string
}

export function processReturnWorkflow(options: ProcessReturnOptions): {
  bill: FullBill
  correlationId: string
  returnNo: string
} {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'
  const returnNo = options.returnNo || `RT-${Date.now().toString().slice(-6)}`

  const currentBills = loadBills()
  const targetBill = currentBills.find((b) => b.id === options.billId)
  if (!targetBill) {
    throw new Error(`Bill ${options.billId} not found`)
  }

  const returnItemsList = options.items || options.returnItems || []
  const inspectionMap = new Map(returnItemsList.map((it) => [it.rentalBillItemId, it]))

  // 1. Process Stock Return for each item
  for (const it of returnItemsList) {
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

  // 2. Update individual bill items
  let totalRemainingOutstanding = 0
  const updatedItems: FullBillItem[] = targetBill.items.map((billItem) => {
    const insp = inspectionMap.get(billItem.rentalBillItemId)
    if (!insp) {
      totalRemainingOutstanding += billItem.outstandingQty || 0
      return billItem
    }

    const normal = Math.max(0, insp.normalQty || 0)
    const damaged = Math.max(0, insp.damagedQty || 0)
    const lost = Math.max(0, insp.lostQty || 0)
    const sessionReturned = normal + damaged + lost

    const newReturnedQty = (billItem.returnedQty || 0) + normal
    const newDamagedQty = (billItem.damagedQuantity || 0) + damaged
    const newLostQty = (billItem.lostQuantity || 0) + lost
    const newOutstandingQty = Math.max(0, (billItem.outstandingQty || 0) - sessionReturned)

    totalRemainingOutstanding += newOutstandingQty

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

  // 3. Determine Overall Bill Status
  const isFullyReturned = totalRemainingOutstanding === 0
  const nextRentalStatus = isFullyReturned ? 'RETURNED' : 'PARTIAL_RETURNED'

  // 4. Handle any fee collected during return
  if (options.collectedAmount && options.collectedAmount > 0) {
    const feeTx = recordBillPayment({
      billId: targetBill.id,
      billNo: targetBill.billNo,
      amount: options.collectedAmount,
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
      before: null,
      after: {
        billNo: targetBill.billNo,
        amount: options.collectedAmount,
        returnNo,
      },
      correlationId,
    })
  }

  const updatedBill: FullBill = {
    ...targetBill,
    items: updatedItems,
    rentalStatus: nextRentalStatus,
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
    },
    correlationId,
  })

  return { bill: updatedBill, correlationId, returnNo }
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
  items: RevisedItemInput[]
  actor: ActorInfo
  correlationId?: string
}

export function processBillRevisionWorkflow(options: ProcessBillRevisionOptions): {
  bill: FullBill
  correlationId: string
  revisionRecord: BillRevisionRecord
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

  // Active revised items (filter out REMOVE)
  const activeItems = options.items.filter((it) => it.action !== 'REMOVE')

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
      const prodOption = activeItems.find((i) => i.productId === prodId) ||
        originalBill.items.find((i) => i.productId === prodId)
      const isSale = prodOption?.rentalType === 'SALE'

      adjustProductStockDelta(prodId, delta, isSale)
      stockDeltas.push({
        productId: prodId,
        productName: prodOption?.productName || prodId,
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
  const calculatedSubtotal = activeItems.reduce((sum, item) => {
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
  const deposit = Number(originalBill.heldDepositAmount || 0)
  const newGrandTotal = Math.max(0, calculatedSubtotal - discount + shipping) + deposit

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

  // 4. Build Revision Record
  const revisionRecord: BillRevisionRecord = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    revisionNo: (originalBill.revisions?.length || 0) + 1,
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

  // 5. Update Bill with Revision History
  const updatedBill: FullBill = {
    ...originalBill,
    rentalStartDate: options.headerRentalDate || originalBill.rentalStartDate,
    scheduledReturnDate: options.headerReturnDate || originalBill.scheduledReturnDate,
    subtotal: calculatedSubtotal,
    discountAmount: discount,
    shippingFee: shipping,
    grandTotal: newGrandTotal,
    outstandingAmount: newOutstanding,
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

  if (!isDispatched) {
    // Release active reservations and backorders
    releaseReservationsBySource('BILL', targetBill.id, trimmedReason, correlationId)
    if (targetBill.quotationId) {
      releaseReservationsBySource('QUOTATION', targetBill.quotationId, trimmedReason, correlationId)
    }
    cancelBackordersBySource('BILL', targetBill.id, trimmedReason)

    targetBill.items.forEach((item) => {
      syncProductReservedStock(item.productId)

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

  return { bill: updatedBill, correlationId, refundTransaction }
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
  channel: string
  reason: string
  referenceNo?: string
  originalTxId?: string
  actor: ActorInfo
  correlationId?: string
}

export function processPaymentRefundWorkflow(options: ProcessPaymentRefundOptions): {
  bill: FullBill
  correlationId: string
  transaction: StatementTransaction
  refundTx: StatementTransaction
} {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'
  const trimmedReason = options.reason.trim()

  if (!trimmedReason) {
    throw new Error('Reason is required for payment refund')
  }

  const currentBills = loadBills()
  const targetBill = currentBills.find((b) => b.id === options.billId)
  if (!targetBill) {
    throw new Error(`Bill ${options.billId} not found`)
  }

  // Enforce cumulative refund limit
  const summary = getBillFinanceSummary(targetBill.id, targetBill.billNo)
  if (options.amount <= 0 || options.amount > summary.netPaid + 0.001) {
    throw new Error(`Refund amount (${options.amount}) exceeds available net paid revenue of ฿${summary.netPaid}`)
  }

  const tx = recordExpense({
    refNo: options.referenceNo || `PAY-REF-${Date.now().toString().slice(-6)}`,
    amount: options.amount,
    channel: options.channel,
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
    entityId: tx.id,
    before: { billNo: targetBill.billNo, netPaid: summary.netPaid },
    after: {
      refNo: tx.refNo,
      amount: options.amount,
      netPaidRemaining: summary.netPaid - options.amount,
      reason: trimmedReason,
    },
    reason: trimmedReason,
    correlationId,
  })

  const newPaidAmount = Math.max(0, (targetBill.paidAmount || 0) - options.amount)
  const newOutstanding = Math.max(0, targetBill.grandTotal - newPaidAmount)
  const newPaymentStatus = newPaidAmount <= 0 ? 'REFUNDED' : 'REFUND_PARTIAL'

  const updatedBill: FullBill = {
    ...targetBill,
    paidAmount: newPaidAmount,
    outstandingAmount: newOutstanding,
    paymentStatus: newPaymentStatus,
  }

  updateBill(updatedBill)

  recordAuditLog({
    userId: actorUserId,
    displayName: actorDisplayName,
    action: 'BILL_PAYMENT_UPDATE',
    entityType: 'BILL',
    entityId: updatedBill.id,
    before: {
      billNo: targetBill.billNo,
      paidAmount: targetBill.paidAmount,
      outstandingAmount: targetBill.outstandingAmount,
      paymentStatus: targetBill.paymentStatus,
    },
    after: {
      billNo: updatedBill.billNo,
      paidAmount: newPaidAmount,
      outstandingAmount: newOutstanding,
      paymentStatus: newPaymentStatus,
    },
    reason: trimmedReason,
    correlationId,
  })

  return { bill: updatedBill, correlationId, transaction: tx, refundTx: tx }
}

// ─── 8. FULFILL BACKORDER WORKFLOW ───────────────────────────────────────────

export interface FulfillBackorderWorkflowOptions {
  backorderId: string
  allocateQty: number
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
} {
  const correlationId = options.correlationId || generateCorrelationId()
  const actorUserId = options.actor.userId || 'system'
  const actorDisplayName = options.actor.displayName || 'ระบบ'

  if (options.allocateQty <= 0) {
    throw new Error('Allocate quantity must be greater than 0')
  }

  // 1. Fulfill backorder
  const { backorder: updatedBo } = fulfillBackorder(options.backorderId, options.allocateQty)

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
    quantity: options.allocateQty,
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
      allocatedQty: options.allocateQty,
      outstandingQty: updatedBo.outstandingQty,
      status: updatedBo.status,
      reservationId: reservation.id,
    },
    correlationId,
  })

  return { backorder: updatedBo, reservation, correlationId }
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
