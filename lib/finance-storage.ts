/**
 * Shared Finance Storage
 *
 * Backed by localStorage key 'app_finance_storage' and Supabase public.statement_transactions table.
 * Single source of truth for financial transactions, cash inflow/outflow, and statement records.
 */

import { loadBills } from '@/lib/bill-storage'
import { createClient } from '@/lib/supabase/client'
import { toSatang, toBaht, addSatang, subtractSatang } from '@/lib/money'

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
  } catch (err: any) {
    console.error('Failed to parse transactions from localStorage:', err)
    return []
  }
}

export const loadStatementTransactions = loadTransactions

export function saveTransactions(txs: StatementTransaction[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txs))
  } catch (err: any) {
    console.error('Failed to save transactions to localStorage:', err)
    throw new Error(`ไม่สามารถบันทึกข้อมูลธุรกรรมลง Storage ได้: ${err?.message || err}`)
  }
}

export function addTransaction(incoming: StatementTransaction): StatementTransaction[] {
  const current = loadTransactions()
  // Calculate new running balance using integer Satang
  const latestSatang = toSatang(current.length > 0 ? current[0].runningBalance : 0)
  const incSatang = toSatang(incoming.incomeAmount)
  const expSatang = toSatang(incoming.expenseAmount)
  const newBalanceSatang = latestSatang + incSatang - expSatang
  const txWithBalance: StatementTransaction = {
    ...incoming,
    runningBalance: toBaht(newBalanceSatang),
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

// ─── Database Row Mapping ──────────────────────────────────────────

export function dbTxToStatementTransaction(row: any): StatementTransaction {
  return {
    id: row.id,
    dateTime: row.date_time,
    refNo: row.ref_no,
    type: row.type || 'INCOME',
    category: row.category || 'ค่าเช่าอุปกรณ์',
    description: row.description || '',
    customerName: row.customer_name || undefined,
    incomeAmount: Number(row.income_amount || 0),
    expenseAmount: Number(row.expense_amount || 0),
    runningBalance: Number(row.running_balance || 0),
    channel: row.channel,
    billId: row.bill_id || undefined,
    billNo: row.bill_no || undefined,
    correlationId: row.correlation_id || undefined,
    isDeposit: !!row.is_deposit,
  }
}

export async function fetchTransactionsFromSupabase(): Promise<StatementTransaction[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('statement_transactions')
    .select('*')
    .order('date_time', { ascending: false })

  if (error) {
    throw new Error(`ไม่สามารถดึงข้อมูลธุรกรรมจาก Supabase ได้: ${error.message}`)
  }

  const mapped = (data || []).map(dbTxToStatementTransaction)
  saveTransactions(mapped)
  return mapped
}

export async function fetchTransactionsForBillFromSupabase(
  billId: string,
  billNo?: string
): Promise<StatementTransaction[]> {
  const supabase = createClient()
  let query = supabase.from('statement_transactions').select('*')
  if (billNo) {
    query = query.or(`bill_id.eq.${billId},bill_no.eq.${billNo}`)
  } else {
    query = query.eq('bill_id', billId)
  }

  const { data, error } = await query.order('date_time', { ascending: true })

  if (error) {
    throw new Error(`ไม่สามารถดึงข้อมูลธุรกรรมของบิล ${billId} จาก Supabase ได้: ${error.message}`)
  }

  return (data || []).map(dbTxToStatementTransaction)
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
  let finalDescription: string | undefined
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
  let totalPaidSatang = 0
  let totalRefundedSatang = 0
  let depositReceivedSatang = 0
  let depositRefundedSatang = 0

  for (const t of txs) {
    const isDep = t.isDeposit || t.category === 'เงินมัดจำ' || t.category === 'คืนเงินมัดจำ'
    if (isDep) {
      if (t.type === 'INCOME') depositReceivedSatang = addSatang(depositReceivedSatang, toSatang(t.incomeAmount))
      if (t.type === 'EXPENSE') depositRefundedSatang = addSatang(depositRefundedSatang, toSatang(t.expenseAmount))
    } else {
      if (t.type === 'INCOME') totalPaidSatang = addSatang(totalPaidSatang, toSatang(t.incomeAmount))
      if (t.type === 'EXPENSE') totalRefundedSatang = addSatang(totalRefundedSatang, toSatang(t.expenseAmount))
    }
  }

  const netPaidSatang = Math.max(0, totalPaidSatang - totalRefundedSatang)
  const netDepositHeldSatang = Math.max(0, depositReceivedSatang - depositRefundedSatang)

  return {
    totalPaid: toBaht(totalPaidSatang),
    totalRefunded: toBaht(totalRefundedSatang),
    netPaid: toBaht(netPaidSatang),
    depositReceived: toBaht(depositReceivedSatang),
    depositRefunded: toBaht(depositRefundedSatang),
    netDepositHeld: toBaht(netDepositHeldSatang),
    transactions: txs,
  }
}
