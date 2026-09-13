/**
 * Report Summary Service
 *
 * Central helper for computing Finance, Stock, Rental-Operational, and Quotation
 * summaries from real domain storage. Used by both Dashboard and Reports pages so
 * every metric is calculated from a single formula.
 *
 * Rules enforced here:
 *  - Deposit ≠ Revenue  (isDeposit transactions tracked separately)
 *  - Refund/Reversal reduces net revenue
 *  - VOID / CANCELLED bills excluded from outstanding receivables
 *  - Reserved stock is NOT mixed with available stock
 *  - No automatic late-fee / penalty calculation
 *  - No mock data
 */

import { loadTransactions, StatementTransaction } from '@/lib/finance-storage'
import { loadBills } from '@/lib/bill-storage'
import { loadProducts } from '@/lib/product-storage'
import { loadReservations } from '@/lib/reservation-storage'
import { loadBackorders } from '@/lib/backorder-storage'
import { loadQuotations } from '@/lib/quotation-storage'

// ─── Finance Summary ─────────────────────────────────────────────────────────

export interface PaymentMethodStat {
  method: string
  count: number
  amount: number
}

export interface FinancialSummary {
  /** Revenue transactions received (INCOME, non-deposit, non-refund) */
  grossReceived: number
  /** Refunds paid out to customers (EXPENSE, non-deposit) */
  refundTotal: number
  /** Net revenue = grossReceived − refundTotal */
  netReceived: number
  /** INCOME on RENT-type bills */
  rentalRevenue: number
  /** INCOME on SALE-type bills */
  saleRevenue: number
  /** Deposit received from customers (INCOME, isDeposit) */
  depositReceived: number
  /** Deposit refunded back to customers (EXPENSE, isDeposit) */
  depositRefunded: number
  /** Deposit still held = depositReceived − depositRefunded */
  depositHeld: number
  /** Outstanding receivable across active bills (not VOID/CANCELLED/CLOSED) */
  outstanding: number
  /** Total transactions in date range */
  txCount: number
  /** Number of unique bills in date range */
  billCount: number
  billsPaid: number
  billsUnpaid: number
  billsVoid: number
  billsCancelled: number
  /** Breakdown by payment channel */
  byPaymentMethod: PaymentMethodStat[]
  /** VAT estimated from active bills (grandTotal − subTotal) in the period */
  vatBilled: number
  /** Daily breakdown: { date, income, expense, net } */
  daily: Array<{ date: string; income: number; expense: number; net: number }>
}

function isDepositTx(t: StatementTransaction): boolean {
  return !!(t.isDeposit || t.category === 'เงินมัดจำ' || t.category === 'คืนเงินมัดจำ')
}

function txDateStr(t: StatementTransaction): string {
  // dateTime is ISO — take first 10 chars for YYYY-MM-DD
  return t.dateTime.slice(0, 10)
}

/**
 * Compute financial summary.
 * @param startDate  YYYY-MM-DD inclusive (filters transaction dateTime)
 * @param endDate    YYYY-MM-DD inclusive
 * If both are omitted, all transactions are included.
 */
export function computeFinancialSummary(options: {
  startDate?: string
  endDate?: string
} = {}): FinancialSummary {
  const { startDate, endDate } = options
  const allTxs = loadTransactions()
  const allBills = loadBills()

  // Filter transactions by date range
  const txs = allTxs.filter((t) => {
    const d = txDateStr(t)
    if (startDate && d < startDate) return false
    if (endDate && d > endDate) return false
    return true
  })

  let grossReceived = 0
  let refundTotal = 0
  let rentalRevenue = 0
  let saleRevenue = 0
  let depositReceived = 0
  let depositRefunded = 0

  const methodMap: Record<string, { count: number; amount: number }> = {}

  // Build daily map
  const dailyMap: Record<string, { income: number; expense: number }> = {}

  for (const t of txs) {
    const isDep = isDepositTx(t)
    const d = txDateStr(t)
    if (!dailyMap[d]) dailyMap[d] = { income: 0, expense: 0 }

    if (t.type === 'INCOME') {
      if (isDep) {
        depositReceived += t.incomeAmount || 0
      } else {
        grossReceived += t.incomeAmount || 0
        dailyMap[d].income += t.incomeAmount || 0
        // Attribute revenue to RENT or SALE by category
        if (t.category === 'ค่าขาย' || t.category === 'ขายสินค้า') {
          saleRevenue += t.incomeAmount || 0
        } else {
          rentalRevenue += t.incomeAmount || 0
        }
        // Payment method breakdown
        const ch = t.channel || 'อื่นๆ'
        if (!methodMap[ch]) methodMap[ch] = { count: 0, amount: 0 }
        methodMap[ch].count += 1
        methodMap[ch].amount += t.incomeAmount || 0
      }
    } else if (t.type === 'EXPENSE') {
      if (isDep) {
        depositRefunded += t.expenseAmount || 0
      } else {
        refundTotal += t.expenseAmount || 0
        dailyMap[d].expense += t.expenseAmount || 0
      }
    }
  }

  // Bill stats: count unique bills whose creation date falls in range (or no range)
  const billIds = new Set(txs.filter((t) => t.billId).map((t) => t.billId!))
  let billsPaid = 0
  let billsUnpaid = 0
  let billsVoid = 0
  let billsCancelled = 0
  let vatBilled = 0

  // Outstanding from active bills (not date-filtered — always current state)
  // VOID is a rentalStatus, not paymentStatus
  const outstanding = allBills.reduce((sum, b) => {
    if (
      b.rentalStatus === 'CLOSED' ||
      b.rentalStatus === 'CANCELLED' ||
      b.rentalStatus === 'VOID'
    )
      return sum
    return sum + (b.outstandingAmount || 0)
  }, 0)

  // Bill-level counters — scoped to bills that appear in the filtered transactions
  for (const b of allBills) {
    if (!billIds.has(b.id)) continue
    const ps = b.paymentStatus
    const rs = b.rentalStatus
    if (rs === 'VOID') billsVoid += 1
    else if (rs === 'CANCELLED') billsCancelled += 1
    else if (ps === 'PAID') billsPaid += 1
    else billsUnpaid += 1

    if (rs !== 'CANCELLED' && rs !== 'VOID') {
      const vat = (b.taxAmount || 0)
      vatBilled += vat
    }
  }

  const byPaymentMethod: PaymentMethodStat[] = Object.entries(methodMap)
    .map(([method, s]) => ({ method, count: s.count, amount: s.amount }))
    .sort((a, b) => b.amount - a.amount)

  // Build sorted daily array
  const daily = Object.entries(dailyMap)
    .map(([date, v]) => ({ date, income: v.income, expense: v.expense, net: v.income - v.expense }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    grossReceived,
    refundTotal,
    netReceived: Math.max(0, grossReceived - refundTotal),
    rentalRevenue,
    saleRevenue,
    depositReceived,
    depositRefunded,
    depositHeld: Math.max(0, depositReceived - depositRefunded),
    outstanding,
    txCount: txs.length,
    billCount: billIds.size,
    billsPaid,
    billsUnpaid,
    billsVoid,
    billsCancelled,
    byPaymentMethod,
    vatBilled,
    daily,
  }
}

// ─── Stock Summary ────────────────────────────────────────────────────────────

export interface StockSummary {
  /** Number of active (non-deleted) products */
  activeProducts: number
  /** Sum of availableQuantity across all active products */
  available: number
  /** Sum of reservedQuantity (held for reservations) — NOT counted as available */
  reserved: number
  /** Sum of rentedQuantity (currently out with customers) */
  rented: number
  /** Sum of damagedQuantity */
  damaged: number
  /** Sum of lostQuantity */
  lost: number
  /** Physical total = available + reserved + rented + damaged + lost */
  totalPhysical: number
}

export function computeStockSummary(): StockSummary {
  const products = loadProducts()
  let available = 0
  let reserved = 0
  let rented = 0
  let damaged = 0
  let lost = 0

  for (const p of products) {
    available += p.availableQuantity || 0
    reserved += p.reservedQuantity || 0
    rented += p.rentedQuantity || 0
    damaged += p.damagedQuantity || 0
    lost += p.lostQuantity || 0
  }

  return {
    activeProducts: products.length,
    available,
    reserved,
    rented,
    damaged,
    lost,
    totalPhysical: available + reserved + rented + damaged + lost,
  }
}

// ─── Rental Operational Summary ───────────────────────────────────────────────

export interface RentalOperationalSummary {
  /** Bills with rentalStatus === 'RENTING' */
  activeRentals: number
  /** Bills with rentalStatus === 'PARTIAL_RETURNED' */
  partialReturned: number
  /** Bills with rentalStatus === 'RENTING' or 'PARTIAL_RETURNED' whose scheduledReturnDate < today */
  overdue: number
  /** Bills with rentalStatus === 'PENDING_DISPATCH' (awaiting dispatch) */
  pendingDispatch: number
  /** Reservations with status === 'ACTIVE' */
  reservationActive: number
  /** Reservations with status === 'DISPATCHED' */
  reservationDispatched: number
  /** Reservations with status === 'EXPIRED' */
  reservationExpired: number
  /** Backorders with status === 'PENDING' or 'READY' */
  backorderPending: number
}

export function computeRentalOperationalSummary(): RentalOperationalSummary {
  const bills = loadBills()
  const reservations = loadReservations()
  const backorders = loadBackorders()

  const todayMs = new Date(new Date().toDateString()).getTime()

  let activeRentals = 0
  let partialReturned = 0
  let overdue = 0
  let pendingDispatch = 0

  for (const b of bills) {
    const rs = b.rentalStatus
    if (rs === 'CLOSED' || rs === 'CANCELLED') continue

    if (rs === 'RENTING') activeRentals += 1
    if (rs === 'PARTIAL_RETURNED') partialReturned += 1
    // dispatchStatus tracks whether a confirmed bill is waiting to be physically dispatched
    if (b.dispatchStatus === 'PENDING') pendingDispatch += 1

    if ((rs === 'RENTING' || rs === 'PARTIAL_RETURNED') && b.scheduledReturnDate) {
      const returnMs = new Date(b.scheduledReturnDate.slice(0, 10)).getTime()
      if (returnMs < todayMs) overdue += 1
    }
  }

  const reservationActive = reservations.filter((r) => r.status === 'ACTIVE').length
  const reservationDispatched = reservations.filter((r) => r.status === 'DISPATCHED').length
  const reservationExpired = reservations.filter((r) => r.status === 'EXPIRED').length
  const backorderPending = backorders.filter(
    (b) => b.status === 'PENDING' || b.status === 'READY'
  ).length

  return {
    activeRentals,
    partialReturned,
    overdue,
    pendingDispatch,
    reservationActive,
    reservationDispatched,
    reservationExpired,
    backorderPending,
  }
}

// ─── Quotation Summary ────────────────────────────────────────────────────────

export interface QuotationSummary {
  draft: number
  sent: number
  accepted: number
  converted: number
  cancelled: number
  total: number
}

export function computeQuotationSummary(): QuotationSummary {
  const qs = loadQuotations()
  const draft = qs.filter((q) => q.status === 'DRAFT').length
  const sent = qs.filter((q) => q.status === 'SENT').length
  const accepted = qs.filter((q) => q.status === 'ACCEPTED' || q.status === 'WAITING').length
  const converted = qs.filter((q) => q.status === 'CONVERTED').length
  const cancelled = qs.filter((q) => q.status === 'CANCELLED' || q.status === 'REJECTED' || q.status === 'EXPIRED').length
  return { draft, sent, accepted, converted, cancelled, total: qs.length }
}

// ─── Top Products (by billed revenue in date range) ──────────────────────────

export interface TopProductStat {
  productId: string
  productCode: string
  productName: string
  quantity: number
  billedAmount: number
}

/**
 * Summarise which products appear most in bills whose first transaction
 * falls within the date range. Revenue is drawn from Finance transactions
 * linked to bills; quantity is read from bill line items.
 */
export function computeTopProducts(options: {
  startDate?: string
  endDate?: string
  limit?: number
} = {}): TopProductStat[] {
  const { startDate, endDate, limit = 10 } = options
  const allBills = loadBills()
  const allTxs = loadTransactions()

  // Find billIds that have transactions in the date range
  const billIdsInRange = new Set(
    allTxs
      .filter((t) => {
        const d = txDateStr(t)
        if (startDate && d < startDate) return false
        if (endDate && d > endDate) return false
        return t.billId && !isDepositTx(t) && t.type === 'INCOME'
      })
      .map((t) => t.billId!)
  )

  const productMap: Record<string, TopProductStat> = {}

  for (const bill of allBills) {
    if (!billIdsInRange.has(bill.id)) continue
    if (bill.rentalStatus === 'CANCELLED' || bill.rentalStatus === 'VOID') continue

    const items = bill.items || []
    for (const item of items) {
      const pid = item.productId
      if (!pid) continue
      if (!productMap[pid]) {
        productMap[pid] = {
          productId: pid,
          productCode: item.productCode || '',
          productName: item.productName || '',
          quantity: 0,
          billedAmount: 0,
        }
      }
      productMap[pid].quantity += item.quantity || 0
      // lineTotal is pre-computed; fall back to dailyRate × quantity
      productMap[pid].billedAmount += item.lineTotal ?? (item.dailyRate || 0) * (item.quantity || 0)
    }
  }

  return Object.values(productMap)
    .sort((a, b) => b.billedAmount - a.billedAmount)
    .slice(0, limit)
}

// ─── Top Customers (by amount received) ─────────────────────────────────────

export interface TopCustomerStat {
  customerId: string
  customerName: string
  receivedAmount: number
}

export function computeTopCustomers(options: {
  startDate?: string
  endDate?: string
  limit?: number
} = {}): TopCustomerStat[] {
  const { startDate, endDate, limit = 10 } = options
  const txs = loadTransactions().filter((t) => {
    if (isDepositTx(t) || t.type !== 'INCOME') return false
    const d = txDateStr(t)
    if (startDate && d < startDate) return false
    if (endDate && d > endDate) return false
    return true
  })

  const bills = loadBills()
  const billMap: Record<string, { customerId: string; customerName: string }> = {}
  for (const b of bills) billMap[b.id] = { customerId: b.customerId || '', customerName: b.customerName || 'ลูกค้าทั่วไป' }

  const custMap: Record<string, TopCustomerStat> = {}
  for (const t of txs) {
    const billInfo = t.billId ? billMap[t.billId] : null
    const name = t.customerName || billInfo?.customerName || 'ลูกค้าทั่วไป'
    const cid = billInfo?.customerId || name
    if (!custMap[cid]) custMap[cid] = { customerId: cid, customerName: name, receivedAmount: 0 }
    custMap[cid].receivedAmount += t.incomeAmount || 0
  }

  return Object.values(custMap)
    .sort((a, b) => b.receivedAmount - a.receivedAmount)
    .slice(0, limit)
}
