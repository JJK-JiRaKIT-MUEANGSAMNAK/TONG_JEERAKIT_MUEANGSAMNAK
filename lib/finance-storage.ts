/**
 * Shared Finance Storage
 *
 * Backed by localStorage key 'app_finance_storage'.
 * Single source of truth for financial transactions, cash inflow/outflow, and statement records.
 */

import { DailyPaymentTrend } from '@/components/dashboard/PaymentTrendChart'
import { loadBills } from '@/lib/bill-storage'

const STORAGE_KEY = 'app_finance_storage'

export interface StatementTransaction {
  id: string
  dateTime: string
  refNo: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  description: string
  customerName?: string
  incomeAmount: number
  expenseAmount: number
  runningBalance: number
  channel: string
  billId?: string
  billNo?: string
  originalTxId?: string
  correlationId?: string
  isDeposit?: boolean
}

export function loadTransactions(): StatementTransaction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as StatementTransaction[]
    }
    return []
  } catch {
    return []
  }
}

export const loadStatementTransactions = loadTransactions

export function saveTransactions(txs: StatementTransaction[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txs))
  } catch {
    // silently ignore quota issues
  }
}

export function addTransaction(incoming: StatementTransaction): StatementTransaction[] {
  const current = loadTransactions()
  // Calculate new running balance: latest balance + (income - expense)
  const latestBalance = current.length > 0 ? current[0].runningBalance : 0
  const netDelta = (incoming.incomeAmount || 0) - (incoming.expenseAmount || 0)
  const txWithBalance: StatementTransaction = {
    ...incoming,
    runningBalance: latestBalance + netDelta,
  }
  const next = [txWithBalance, ...current]
  saveTransactions(next)
  return next
}

export function updateTransaction(updated: StatementTransaction): StatementTransaction[] {
  const current = loadTransactions()
  const next = current.map((t) => (t.id === updated.id ? updated : t))
  saveTransactions(next)
  return next
}

export function deleteTransaction(id: string): StatementTransaction[] {
  const current = loadTransactions()
  const next = current.filter((t) => t.id !== id)
  saveTransactions(next)
  return next
}

export interface RecordBillPaymentParams {
  billId?: string
  billNo: string
  amount: number
  customerName?: string
  channel?: string
  date?: string
  category?: string
  description?: string
  refNo?: string
  correlationId?: string
  isDeposit?: boolean
}

/** Record a payment from bill checkout, return fee, or manual payment */
export function recordBillPayment(
  billIdOrParams: string | RecordBillPaymentParams,
  billNo?: string | number,
  amount?: number | string,
  channel?: string,
  customerName?: string
): StatementTransaction {
  let finalBillId: string | undefined
  let finalBillNo = ''
  let finalAmount = 0
  let finalCustomerName: string | undefined
  let finalChannel = 'โอนเงิน'
  let finalDate: string | undefined
  let finalCategory = 'ค่าเช่าอุปกรณ์'
  let finalDescription: string | undefined
  let finalRefNo: string | undefined
  let finalCorrelationId: string | undefined
  let finalIsDeposit = false

  if (typeof billIdOrParams === 'object') {
    finalBillId = billIdOrParams.billId
    finalBillNo = billIdOrParams.billNo
    finalAmount = billIdOrParams.amount
    finalCustomerName = billIdOrParams.customerName
    finalChannel = billIdOrParams.channel || 'โอนเงิน'
    finalDate = billIdOrParams.date
    finalCategory = billIdOrParams.category || (billIdOrParams.isDeposit ? 'เงินมัดจำ' : 'ค่าเช่าอุปกรณ์')
    finalDescription = billIdOrParams.description
    finalRefNo = billIdOrParams.refNo
    finalCorrelationId = billIdOrParams.correlationId
    finalIsDeposit = !!billIdOrParams.isDeposit
  } else {
    finalBillId = typeof billIdOrParams === 'string' ? billIdOrParams : undefined
    if (typeof amount === 'number') {
      finalBillNo = typeof billNo === 'string' ? billNo : billIdOrParams
      finalAmount = amount
      finalChannel = channel || 'โอนเงิน'
      finalCustomerName = customerName
    } else if (typeof billNo === 'number') {
      finalBillNo = billIdOrParams
      finalAmount = billNo
      finalChannel = typeof amount === 'string' ? amount : 'โอนเงิน'
      finalCustomerName = channel
    } else {
      finalBillNo = billIdOrParams
    }
  }

  const dateTime = finalDate ? new Date(finalDate).toISOString() : new Date().toISOString()
  const tx: StatementTransaction = {
    id: `tx-pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    dateTime,
    refNo: finalRefNo || `TX-${finalBillNo}-${Date.now().toString().slice(-4)}`,
    type: 'INCOME',
    category: finalCategory,
    description: finalDescription || (finalIsDeposit ? `รับเงินมัดจำ บิลเลขที่ ${finalBillNo}` : `รับชำระเงิน บิลเลขที่ ${finalBillNo}`),
    customerName: finalCustomerName,
    incomeAmount: Math.max(0, finalAmount),
    expenseAmount: 0,
    runningBalance: 0,
    channel: finalChannel,
    billId: finalBillId,
    billNo: finalBillNo,
    correlationId: finalCorrelationId,
    isDeposit: finalIsDeposit,
  }
  addTransaction(tx)
  return tx
}

export interface RecordExpenseParams {
  refNo: string
  amount: number
  customerName?: string
  channel?: string
  date?: string
  category?: string
  description?: string
  billId?: string
  billNo?: string
  originalTxId?: string
  correlationId?: string
  isDeposit?: boolean
}

/** Record an expense, deposit refund, or payment refund */
export function recordExpense(
  refNoOrParams: string | RecordExpenseParams,
  amount?: number,
  description?: string,
  category?: string,
  customerName?: string
): StatementTransaction {
  let finalRefNo = ''
  let finalAmount = 0
  let finalCustomerName: string | undefined
  let finalChannel = 'โอนเงิน'
  let finalDate: string | undefined
  let finalCategory = 'คืนเงินมัดจำ'
  let finalDescription = ''
  let finalBillId: string | undefined
  let finalBillNo: string | undefined
  let finalOriginalTxId: string | undefined
  let finalCorrelationId: string | undefined
  let finalIsDeposit = false

  if (typeof refNoOrParams === 'object') {
    finalRefNo = refNoOrParams.refNo
    finalAmount = refNoOrParams.amount
    finalCustomerName = refNoOrParams.customerName
    finalChannel = refNoOrParams.channel || 'โอนเงิน'
    finalDate = refNoOrParams.date
    finalCategory = refNoOrParams.category || (refNoOrParams.isDeposit ? 'คืนเงินมัดจำ' : 'คืนเงินลูกค้า')
    finalDescription = refNoOrParams.description || `คืนเงิน อ้างอิง ${refNoOrParams.refNo}`
    finalBillId = refNoOrParams.billId
    finalBillNo = refNoOrParams.billNo
    finalOriginalTxId = refNoOrParams.originalTxId
    finalCorrelationId = refNoOrParams.correlationId
    finalIsDeposit = !!refNoOrParams.isDeposit
  } else {
    finalRefNo = refNoOrParams
    finalAmount = amount || 0
    finalDescription = description || `คืนเงิน อ้างอิง ${finalRefNo}`
    finalCategory = category || 'คืนเงินมัดจำ'
    finalCustomerName = customerName
  }

  const dateTime = finalDate ? new Date(finalDate).toISOString() : new Date().toISOString()
  const tx: StatementTransaction = {
    id: `tx-exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    dateTime,
    refNo: `TX-${finalRefNo}`,
    type: 'EXPENSE',
    category: finalCategory,
    description: finalDescription,
    customerName: finalCustomerName,
    incomeAmount: 0,
    expenseAmount: Math.max(0, finalAmount),
    runningBalance: 0,
    channel: finalChannel,
    billId: finalBillId,
    billNo: finalBillNo,
    originalTxId: finalOriginalTxId,
    correlationId: finalCorrelationId,
    isDeposit: finalIsDeposit,
  }
  addTransaction(tx)
  return tx
}

/** Get transactions associated with a bill */
export function getTransactionsForBill(billId: string, billNo?: string): StatementTransaction[] {
  const all = loadTransactions()
  return all.filter((t) => (t.billId && t.billId === billId) || (billNo && (t.billNo === billNo || t.refNo?.includes(billNo))))
}

/** Get summary of actual money received vs refunded for a bill */
export function getBillFinanceSummary(billId: string, billNo?: string): {
  totalPaid: number
  totalRefunded: number
  netPaid: number
  depositReceived: number
  depositRefunded: number
  netDepositHeld: number
  transactions: StatementTransaction[]
} {
  const txs = getTransactionsForBill(billId, billNo)
  let totalPaid = 0
  let totalRefunded = 0
  let depositReceived = 0
  let depositRefunded = 0

  for (const t of txs) {
    const isDep = t.isDeposit || t.category === 'เงินมัดจำ' || t.category === 'คืนเงินมัดจำ'
    if (isDep) {
      if (t.type === 'INCOME') depositReceived += t.incomeAmount || 0
      if (t.type === 'EXPENSE') depositRefunded += t.expenseAmount || 0
    } else {
      if (t.type === 'INCOME') totalPaid += t.incomeAmount || 0
      if (t.type === 'EXPENSE') totalRefunded += t.expenseAmount || 0
    }
  }

  return {
    totalPaid,
    totalRefunded,
    netPaid: Math.max(0, totalPaid - totalRefunded),
    depositReceived,
    depositRefunded,
    netDepositHeld: Math.max(0, depositReceived - depositRefunded),
    transactions: txs,
  }
}

/** Get today's real income, expense, and total outstanding debt (excluding deposits from revenue) */
export function getTodayFinance(): { income: number; expense: number; outstanding: number } {
  const todayStr = new Date().toISOString().slice(0, 10)
  const txs = loadTransactions()
  let income = 0
  let expense = 0

  for (const t of txs) {
    if (t.dateTime.slice(0, 10) === todayStr) {
      const isDep = t.isDeposit || t.category === 'เงินมัดจำ' || t.category === 'คืนเงินมัดจำ'
      if (!isDep) {
        if (t.type === 'INCOME') income += t.incomeAmount || 0
        if (t.type === 'EXPENSE') expense += t.expenseAmount || 0
      }
    }
  }

  // Calculate real outstanding amount from active bills
  const bills = loadBills()
  const outstanding = bills.reduce((sum, b) => {
    if (b.rentalStatus === 'CLOSED' || b.rentalStatus === 'CANCELLED' || b.rentalStatus === 'VOID') return sum
    return sum + (b.outstandingAmount || 0)
  }, 0)

  return { income, expense, outstanding }
}

/** Get this month's real income and expense (excluding deposits from revenue) */
export function getMonthlyFinance(): { income: number; expense: number } {
  const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const txs = loadTransactions()
  let income = 0
  let expense = 0

  for (const t of txs) {
    if (t.dateTime.slice(0, 7) === thisMonth) {
      const isDep = t.isDeposit || t.category === 'เงินมัดจำ' || t.category === 'คืนเงินมัดจำ'
      if (!isDep) {
        if (t.type === 'INCOME') income += t.incomeAmount || 0
        if (t.type === 'EXPENSE') expense += t.expenseAmount || 0
      }
    }
  }

  return { income, expense }
}

const THAI_DAY_LABELS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

/** Get 7-day payment trend from real income transactions (excluding deposits) */
export function getDailyPaymentTrends(days: number = 7): DailyPaymentTrend[] {
  const txs = loadTransactions().filter((t) => t.type === 'INCOME' && !t.isDeposit && t.category !== 'เงินมัดจำ')
  const result: DailyPaymentTrend[] = []

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)

    const dayOfWeek = d.getDay()
    const dayLabel = THAI_DAY_LABELS[dayOfWeek]
    const fullThaiDate = `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`

    // Sum income for this date
    const dayTxs = txs.filter((t) => t.dateTime.slice(0, 10) === dateStr)
    const amount = dayTxs.reduce((sum, t) => sum + (t.incomeAmount || 0), 0)
    const billCount = dayTxs.length

    result.push({
      date: dateStr,
      dayLabel,
      amount,
      billCount,
      fullThaiDate,
    })
  }

  return result
}
