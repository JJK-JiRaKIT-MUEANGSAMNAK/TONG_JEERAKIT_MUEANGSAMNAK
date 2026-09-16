import { loadTransactions, StatementTransaction } from '@/lib/finance-storage'
import { loadBills } from '@/lib/bill-storage'
import { loadQuotations } from '@/lib/quotation-storage'
import { loadProducts } from '@/lib/product-storage'
import { loadReservations } from '@/lib/reservation-storage'
import { loadCustomers } from '@/lib/customer-storage'
import { FullBill } from '@/lib/types/rental-return'
import { Product, Quotation } from '@/lib/types/rental-pos'

export interface ReportDateFilter {
  startDate: Date
  endDate: Date
  granularity: 'daily' | 'monthly'
}

export const THAI_MONTH_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
]

export const THAI_MONTH_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

export function toLocalDateString(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatThaiDate(dateStr?: string | null): string {
  if (!dateStr) return '-'
  const clean = dateStr.split('T')[0]
  const parts = clean.split('-')
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10)
    const monthIdx = parseInt(parts[1], 10) - 1
    const yearBE = parseInt(parts[0], 10) + 543
    return `${day} ${THAI_MONTH_SHORT[monthIdx] || ''} ${yearBE}`
  }
  return dateStr
}

export function formatCurrency(amount: number): string {
  return (amount || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatNumber(val: number): string {
  return (val || 0).toLocaleString('th-TH')
}

export function isDateInRange(dateStr: string | undefined | null, start: Date, end: Date): boolean {
  if (!dateStr) return false
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.slice(0, 10)
  const startStr = toLocalDateString(start)
  const endStr = toLocalDateString(end)
  return clean >= startStr && clean <= endStr
}

export function getPreviousPeriod(start: Date, end: Date): { prevStart: Date; prevEnd: Date } {
  const durationMs = end.getTime() - start.getTime()
  const durationDays = Math.max(1, Math.round(durationMs / (24 * 60 * 60 * 1000))) + 1
  const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000)
  const prevStart = new Date(prevEnd.getTime() - (durationDays - 1) * 24 * 60 * 60 * 1000)
  return { prevStart, prevEnd }
}

export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 100)
}

// Generate time buckets for daily / monthly grouping
export function generateTimeBuckets(
  start: Date,
  end: Date,
  granularity: 'daily' | 'monthly'
): Array<{ key: string; label: string }> {
  const buckets: Array<{ key: string; label: string }> = []

  if (granularity === 'daily') {
    const cur = new Date(start)
    while (cur <= end) {
      const key = toLocalDateString(cur)
      const day = cur.getDate()
      const mIdx = cur.getMonth()
      const label = `${day} ${THAI_MONTH_SHORT[mIdx]}`
      buckets.push({ key, label })
      cur.setDate(cur.getDate() + 1)
    }
  } else {
    // monthly
    const cur = new Date(start.getFullYear(), start.getMonth(), 1)
    const last = new Date(end.getFullYear(), end.getMonth(), 1)
    while (cur <= last) {
      const year = cur.getFullYear()
      const mIdx = cur.getMonth()
      const key = `${year}-${String(mIdx + 1).padStart(2, '0')}`
      const label = `${THAI_MONTH_SHORT[mIdx]} ${year + 543}`
      buckets.push({ key, label })
      cur.setMonth(cur.getMonth() + 1)
    }
  }

  return buckets
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. FINANCE REPORT DATA (Topics 1, 2, 3, 7, 8, 18)
// ─────────────────────────────────────────────────────────────────────────────

export interface FinanceReportData {
  totalIncome: number
  totalExpense: number
  netIncome: number
  incomeCount: number
  expenseCount: number
  // Comparison with previous period
  prevTotalIncome: number
  prevTotalExpense: number
  prevNetIncome: number
  incomeGrowth: number
  expenseGrowth: number
  netIncomeGrowth: number
  // Topic 7: Outstanding Debt
  totalOutstanding: number
  debtorCount: number
  debtorBills: Array<{
    id: string
    billNo: string
    customerName: string
    customerPhone?: string
    billDate: string
    scheduledReturnDate: string
    grandTotal: number
    paidAmount: number
    outstandingAmount: number
    daysOverdue: number
  }>
  // Topic 8: Deposits
  depositReceived: number
  depositRefunded: number
  netDepositChange: number
  currentlyHeldDeposit: number
  activeDepositBillsCount: number
  // Topic 18: Payment Channels
  paymentChannels: Array<{
    channel: string
    amount: number
    count: number
    percentage: number
    color: string
  }>
  // Trend Points for Historical Chart
  trendData: Array<{
    label: string
    income: number
    expense: number
    net: number
  }>
  // Transactions Table
  transactions: StatementTransaction[]
}

const CHANNEL_COLORS: Record<string, string> = {
  โอนเงิน: '#10b981', // emerald
  เงินสด: '#3b82f6', // blue
  บัตรเครดิต: '#8b5cf6', // purple
  'QR Code': '#06b6d4', // cyan
  เช็ค: '#f59e0b', // amber
  อื่นๆ: '#64748b', // slate
}

export function getFinanceReportData(filter: ReportDateFilter): FinanceReportData {
  const allTxs = loadTransactions()
  const allBills = loadBills()
  const { prevStart, prevEnd } = getPreviousPeriod(filter.startDate, filter.endDate)

  // Current period transactions
  const inRangeTxs = allTxs.filter((t) => isDateInRange(t.dateTime, filter.startDate, filter.endDate))
  const prevTxs = allTxs.filter((t) => isDateInRange(t.dateTime, prevStart, prevEnd))

  // Topic 1, 2, 3
  let totalIncome = 0
  let totalExpense = 0
  let incomeCount = 0
  let expenseCount = 0
  let depositReceived = 0
  let depositRefunded = 0

  const channelMap: Record<string, { amount: number; count: number }> = {}

  for (const t of inRangeTxs) {
    const isDep = t.isDeposit || t.category === 'เงินมัดจำ' || t.category === 'คืนเงินมัดจำ'

    if (t.type === 'INCOME') {
      const amt = t.incomeAmount || 0
      totalIncome += amt
      incomeCount++
      if (isDep) depositReceived += amt

      const ch = t.channel || 'โอนเงิน'
      if (!channelMap[ch]) channelMap[ch] = { amount: 0, count: 0 }
      channelMap[ch].amount += amt
      channelMap[ch].count++
    } else if (t.type === 'EXPENSE') {
      const amt = t.expenseAmount || 0
      totalExpense += amt
      expenseCount++
      if (isDep) depositRefunded += amt
    }
  }

  const netIncome = totalIncome - totalExpense

  // Previous period calculations
  let prevTotalIncome = 0
  let prevTotalExpense = 0
  for (const t of prevTxs) {
    if (t.type === 'INCOME') prevTotalIncome += t.incomeAmount || 0
    else if (t.type === 'EXPENSE') prevTotalExpense += t.expenseAmount || 0
  }
  const prevNetIncome = prevTotalIncome - prevTotalExpense

  const incomeGrowth = calculateGrowth(totalIncome, prevTotalIncome)
  const expenseGrowth = calculateGrowth(totalExpense, prevTotalExpense)
  const netIncomeGrowth = calculateGrowth(netIncome, prevNetIncome)

  // Topic 7: Outstanding Debt (ลูกหนี้ค้าง)
  const todayStr = toLocalDateString(new Date())
  const debtorBills: FinanceReportData['debtorBills'] = []
  let totalOutstanding = 0

  for (const b of allBills) {
    if (b.rentalStatus === 'CANCELLED' || b.rentalStatus === 'VOID') continue
    const out = b.outstandingAmount || 0
    if (out > 0) {
      totalOutstanding += out
      const retDate = (b.scheduledReturnDate || b.rentalStartDate || '').split('T')[0]
      const isOverdue = retDate && retDate < todayStr
      let daysOverdue = 0
      if (isOverdue && retDate) {
        const diff = new Date(todayStr).getTime() - new Date(retDate).getTime()
        daysOverdue = Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)))
      }

      debtorBills.push({
        id: b.id,
        billNo: b.billNo,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        billDate: b.billDate,
        scheduledReturnDate: b.scheduledReturnDate,
        grandTotal: b.grandTotal,
        paidAmount: b.paidAmount,
        outstandingAmount: out,
        daysOverdue,
      })
    }
  }
  debtorBills.sort((a, b) => b.outstandingAmount - a.outstandingAmount)

  // Topic 8: Held Deposits across active bills
  let currentlyHeldDeposit = 0
  let activeDepositBillsCount = 0
  for (const b of allBills) {
    if (b.rentalStatus === 'CANCELLED' || b.rentalStatus === 'VOID') continue
    const held = b.heldDepositAmount || 0
    if (held > 0) {
      currentlyHeldDeposit += held
      activeDepositBillsCount++
    }
  }

  // Topic 18: Payment Channels
  const paymentChannels: FinanceReportData['paymentChannels'] = Object.entries(channelMap).map(
    ([channel, val]) => ({
      channel,
      amount: val.amount,
      count: val.count,
      percentage: totalIncome > 0 ? Math.round((val.amount / totalIncome) * 100) : 0,
      color: CHANNEL_COLORS[channel] || '#64748b',
    })
  )
  paymentChannels.sort((a, b) => b.amount - a.amount)

  // Time Series Trend Data
  const buckets = generateTimeBuckets(filter.startDate, filter.endDate, filter.granularity)
  const bucketMap = new Map<string, { income: number; expense: number }>()
  for (const b of buckets) {
    bucketMap.set(b.key, { income: 0, expense: 0 })
  }

  for (const t of inRangeTxs) {
    const clean = t.dateTime.includes('T') ? t.dateTime.split('T')[0] : t.dateTime.slice(0, 10)
    const key = filter.granularity === 'daily' ? clean : clean.slice(0, 7)
    const entry = bucketMap.get(key)
    if (entry) {
      if (t.type === 'INCOME') entry.income += t.incomeAmount || 0
      else if (t.type === 'EXPENSE') entry.expense += t.expenseAmount || 0
    }
  }

  const trendData = buckets.map((b) => {
    const val = bucketMap.get(b.key) || { income: 0, expense: 0 }
    return {
      label: b.label,
      income: val.income,
      expense: val.expense,
      net: val.income - val.expense,
    }
  })

  // Sorted transactions
  const sortedTxs = [...inRangeTxs].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  )

  return {
    totalIncome,
    totalExpense,
    netIncome,
    incomeCount,
    expenseCount,
    prevTotalIncome,
    prevTotalExpense,
    prevNetIncome,
    incomeGrowth,
    expenseGrowth,
    netIncomeGrowth,
    totalOutstanding,
    debtorCount: debtorBills.length,
    debtorBills,
    depositReceived,
    depositRefunded,
    netDepositChange: depositReceived - depositRefunded,
    currentlyHeldDeposit,
    activeDepositBillsCount,
    paymentChannels,
    trendData,
    transactions: sortedTxs,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SALES, RENTAL & DOCUMENTS REPORT DATA (Topics 5, 6, 9, 10, 11)
// ─────────────────────────────────────────────────────────────────────────────

export interface SalesRentalReportData {
  // Topic 5: Sales
  salesRevenue: number
  salesUnits: number
  salesCount: number
  // Topic 6: Rental
  rentalRevenue: number
  rentalCount: number
  // Topic 9: Bills
  totalBillsCount: number
  totalBillsValue: number
  totalBillsPaid: number
  totalBillsOutstanding: number
  billStatusList: Array<{
    status: string
    label: string
    count: number
    amount: number
    color: string
  }>
  // Topic 10: Quotations Funnel
  totalQuotationsCount: number
  totalQuotationsValue: number
  quotationConversionRate: number
  quotationFunnel: Array<{
    stage: 'draft' | 'sent' | 'accepted' | 'converted'
    label: string
    count: number
    value: number
    percentage: number
    color: string
  }>
  // Topic 11: Active Rentals
  activeRentalsCount: number
  overdueRentalsCount: number
  activeRentals: Array<{
    id: string
    billNo: string
    customerName: string
    customerPhone?: string
    rentalStartDate: string
    scheduledReturnDate: string
    isOverdue: boolean
    daysOverdue: number
    itemsCount: number
    depositAmount: number
    grandTotal: number
    rentalStatus: string
  }>
  // Bar Chart: Sales vs Rental trend
  salesVsRentalTrend: Array<{
    label: string
    sales: number
    rental: number
    total: number
  }>
  // Detailed Table
  detailedRecords: Array<{
    id: string
    docNo: string
    type: 'BILL' | 'QUOTATION'
    subType: 'SALE' | 'RENTAL' | 'MIXED'
    date: string
    customerName: string
    customerPhone?: string
    itemsSummary: string
    amount: number
    status: string
  }>
}

export function getSalesRentalReportData(filter: ReportDateFilter): SalesRentalReportData {
  const allBills = loadBills()
  const allQuotations = loadQuotations()
  const todayStr = toLocalDateString(new Date())

  const inRangeBills = allBills.filter(
    (b) =>
      b.rentalStatus !== 'VOID' &&
      isDateInRange(b.billDate || b.rentalStartDate, filter.startDate, filter.endDate)
  )

  const inRangeQuotes = allQuotations.filter((q) =>
    isDateInRange(q.quotationDate, filter.startDate, filter.endDate)
  )

  // Topic 5 & 6: Sales vs Rental breakdown
  let salesRevenue = 0
  let salesUnits = 0
  let salesCount = 0
  let rentalRevenue = 0
  let rentalCount = 0

  let totalBillsValue = 0
  let totalBillsPaid = 0
  let totalBillsOutstanding = 0

  const statusCountMap: Record<string, { count: number; amount: number }> = {
    DRAFT: { count: 0, amount: 0 },
    RENTING: { count: 0, amount: 0 },
    PARTIAL_RETURNED: { count: 0, amount: 0 },
    RETURNED: { count: 0, amount: 0 },
    CLOSED: { count: 0, amount: 0 },
    CANCELLED: { count: 0, amount: 0 },
  }

  for (const b of inRangeBills) {
    totalBillsValue += b.grandTotal || 0
    totalBillsPaid += b.paidAmount || 0
    totalBillsOutstanding += b.outstandingAmount || 0

    const st = b.rentalStatus || 'DRAFT'
    if (statusCountMap[st]) {
      statusCountMap[st].count++
      statusCountMap[st].amount += b.grandTotal || 0
    }

    let hasSale = false
    let hasRental = false

    for (const it of b.items || []) {
      const isSale = it.rentalType === 'SALE' || it.requiresReturn === false
      const lineAmt = it.lineTotal ?? (it.quantity || 0) * (it.dailyRate || 0)

      if (isSale) {
        hasSale = true
        salesRevenue += lineAmt
        salesUnits += it.quantity || 0
      } else {
        hasRental = true
        rentalRevenue += lineAmt
      }
    }

    if (hasSale) salesCount++
    if (hasRental) rentalCount++
  }

  // Bill Status List
  const billStatusList = [
    {
      status: 'RENTING',
      label: 'กำลังเช่า',
      count: (statusCountMap.RENTING?.count || 0) + (statusCountMap.PARTIAL_RETURNED?.count || 0),
      amount: (statusCountMap.RENTING?.amount || 0) + (statusCountMap.PARTIAL_RETURNED?.amount || 0),
      color: '#3b82f6', // blue
    },
    {
      status: 'RETURNED',
      label: 'คืนครบแล้ว / ปิดบิล',
      count: (statusCountMap.RETURNED?.count || 0) + (statusCountMap.CLOSED?.count || 0),
      amount: (statusCountMap.RETURNED?.amount || 0) + (statusCountMap.CLOSED?.amount || 0),
      color: '#10b981', // green
    },
    {
      status: 'DRAFT',
      label: 'ฉบับร่าง',
      count: statusCountMap.DRAFT?.count || 0,
      amount: statusCountMap.DRAFT?.amount || 0,
      color: '#64748b', // slate
    },
    {
      status: 'CANCELLED',
      label: 'ยกเลิก',
      count: statusCountMap.CANCELLED?.count || 0,
      amount: statusCountMap.CANCELLED?.amount || 0,
      color: '#ef4444', // red
    },
  ]

  // Topic 10: Quotations Funnel (ร่าง → ส่ง → ยืนยัน → เป็นบิล)
  let quoteDraft = 0
  let quoteSent = 0
  let quoteAccepted = 0
  let quoteConverted = 0
  let totalQuoteValue = 0

  for (const q of inRangeQuotes) {
    const val = q.grandTotal || 0
    totalQuoteValue += val
    if (q.status === 'DRAFT') quoteDraft++
    else if (q.status === 'SENT' || q.status === 'WAITING') quoteSent++
    else if (q.status === 'ACCEPTED') quoteAccepted++
    else if (q.status === 'CONVERTED') quoteConverted++
  }

  const totalQuotes = inRangeQuotes.length
  const quotationConversionRate = totalQuotes > 0 ? Math.round((quoteConverted / totalQuotes) * 100) : 0

  const quotationFunnel = [
    {
      stage: 'draft' as const,
      label: '1. ร่างใบเสนอราคา',
      count: quoteDraft,
      value: inRangeQuotes.filter((q) => q.status === 'DRAFT').reduce((s, q) => s + (q.grandTotal || 0), 0),
      percentage: totalQuotes > 0 ? Math.round((quoteDraft / totalQuotes) * 100) : 0,
      color: '#64748b', // slate
    },
    {
      stage: 'sent' as const,
      label: '2. ส่งแล้ว / รอพิจารณา',
      count: quoteSent,
      value: inRangeQuotes
        .filter((q) => q.status === 'SENT' || q.status === 'WAITING')
        .reduce((s, q) => s + (q.grandTotal || 0), 0),
      percentage: totalQuotes > 0 ? Math.round((quoteSent / totalQuotes) * 100) : 0,
      color: '#3b82f6', // blue
    },
    {
      stage: 'accepted' as const,
      label: '3. ยืนยัน / อนุมัติ',
      count: quoteAccepted,
      value: inRangeQuotes.filter((q) => q.status === 'ACCEPTED').reduce((s, q) => s + (q.grandTotal || 0), 0),
      percentage: totalQuotes > 0 ? Math.round((quoteAccepted / totalQuotes) * 100) : 0,
      color: '#8b5cf6', // purple
    },
    {
      stage: 'converted' as const,
      label: '4. แปลงเป็นบิลแล้ว',
      count: quoteConverted,
      value: inRangeQuotes.filter((q) => q.status === 'CONVERTED').reduce((s, q) => s + (q.grandTotal || 0), 0),
      percentage: totalQuotes > 0 ? Math.round((quoteConverted / totalQuotes) * 100) : 0,
      color: '#10b981', // green
    },
  ]

  // Topic 11: Active Rentals (Current)
  const activeRentals: SalesRentalReportData['activeRentals'] = []
  let overdueRentalsCount = 0

  for (const b of allBills) {
    if (b.rentalStatus === 'RENTING' || b.rentalStatus === 'PARTIAL_RETURNED') {
      const retDate = (b.scheduledReturnDate || b.rentalStartDate || '').split('T')[0]
      const isOverdue = !!retDate && retDate < todayStr
      let daysOverdue = 0
      if (isOverdue && retDate) {
        overdueRentalsCount++
        const diff = new Date(todayStr).getTime() - new Date(retDate).getTime()
        daysOverdue = Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)))
      }

      activeRentals.push({
        id: b.id,
        billNo: b.billNo,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        rentalStartDate: b.rentalStartDate,
        scheduledReturnDate: b.scheduledReturnDate,
        isOverdue,
        daysOverdue,
        itemsCount: b.items?.length || 0,
        depositAmount: b.heldDepositAmount || 0,
        grandTotal: b.grandTotal,
        rentalStatus: b.rentalStatus,
      })
    }
  }
  activeRentals.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1
    if (!a.isOverdue && b.isOverdue) return 1
    return new Date(a.scheduledReturnDate).getTime() - new Date(b.scheduledReturnDate).getTime()
  })

  // Sales vs Rental Trend
  const buckets = generateTimeBuckets(filter.startDate, filter.endDate, filter.granularity)
  const bucketMap = new Map<string, { sales: number; rental: number }>()
  for (const b of buckets) {
    bucketMap.set(b.key, { sales: 0, rental: 0 })
  }

  for (const b of inRangeBills) {
    const rawDate = b.billDate || b.rentalStartDate || ''
    const clean = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate.slice(0, 10)
    const key = filter.granularity === 'daily' ? clean : clean.slice(0, 7)
    const entry = bucketMap.get(key)
    if (entry) {
      for (const it of b.items || []) {
        const isSale = it.rentalType === 'SALE' || it.requiresReturn === false
        const lineAmt = it.lineTotal ?? (it.quantity || 0) * (it.dailyRate || 0)
        if (isSale) entry.sales += lineAmt
        else entry.rental += lineAmt
      }
    }
  }

  const salesVsRentalTrend = buckets.map((b) => {
    const val = bucketMap.get(b.key) || { sales: 0, rental: 0 }
    return {
      label: b.label,
      sales: val.sales,
      rental: val.rental,
      total: val.sales + val.rental,
    }
  })

  // Detailed Table Records
  const detailedRecords: SalesRentalReportData['detailedRecords'] = []
  for (const b of inRangeBills) {
    const items = b.items || []
    const hasSale = items.some((i) => i.rentalType === 'SALE')
    const hasRent = items.some((i) => i.rentalType !== 'SALE')
    const subType = hasSale && hasRent ? 'MIXED' : hasSale ? 'SALE' : 'RENTAL'
    const itemsSummary = items.map((i) => `${i.productName} (${i.quantity})`).slice(0, 2).join(', ') + (items.length > 2 ? ` +${items.length - 2}` : '')

    detailedRecords.push({
      id: b.id,
      docNo: b.billNo,
      type: 'BILL',
      subType,
      date: b.billDate || b.rentalStartDate,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      itemsSummary: itemsSummary || 'ไม่มีรายการ',
      amount: b.grandTotal,
      status: b.rentalStatus,
    })
  }

  for (const q of inRangeQuotes) {
    const items = q.items || []
    const itemsSummary = items.map((i) => `${i.productName} (${i.quantity})`).slice(0, 2).join(', ') + (items.length > 2 ? ` +${items.length - 2}` : '')

    detailedRecords.push({
      id: q.id,
      docNo: q.quotationNo,
      type: 'QUOTATION',
      subType: 'RENTAL',
      date: q.quotationDate,
      customerName: q.customerName,
      customerPhone: q.phone,
      itemsSummary: itemsSummary || 'ไม่มีรายการ',
      amount: q.grandTotal,
      status: q.status,
    })
  }

  detailedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    salesRevenue,
    salesUnits,
    salesCount,
    rentalRevenue,
    rentalCount,
    totalBillsCount: inRangeBills.length,
    totalBillsValue,
    totalBillsPaid,
    totalBillsOutstanding,
    billStatusList,
    totalQuotationsCount: totalQuotes,
    totalQuotationsValue: totalQuoteValue,
    quotationConversionRate,
    quotationFunnel,
    activeRentalsCount: activeRentals.length,
    overdueRentalsCount,
    activeRentals,
    salesVsRentalTrend,
    detailedRecords,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. OPERATIONS REPORT DATA (Topics 12, 13, 20)
// ─────────────────────────────────────────────────────────────────────────────

export interface ActionItem {
  id: string
  category: 'OVERDUE_RETURN' | 'DEBT_FOLLOWUP' | 'DAMAGED_STOCK' | 'LOST_STOCK' | 'LOW_STOCK' | 'PENDING_QUOTE'
  priority: 'high' | 'medium' | 'info'
  title: string
  refNo: string
  customerName?: string
  customerPhone?: string
  date?: string
  status: string
  suggestedHandler: string
}

export interface OperationsReportData {
  dispatchCount: number
  returnCount: number
  activeReservationsCount: number
  actionItemsCount: number
  // Operations Trend Chart
  operationsTrend: Array<{
    label: string
    dispatches: number
    returns: number
    reservations: number
  }>
  // Topic 13: Reservations
  reservations: Array<{
    id: string
    reservationNo: string
    productName: string
    quantity: number
    customerName: string
    startDate: string
    endDate: string
    sourceType: string
    sourceNo: string
    status: string
  }>
  // Topic 20: Action Items
  actionItems: ActionItem[]
  // Operations History Table
  historyRecords: Array<{
    id: string
    date: string
    event: 'DISPATCH' | 'RETURN' | 'RESERVATION'
    refNo: string
    customerName: string
    itemsCount: number
    handler: string
    status: string
  }>
}

export function getOperationsReportData(filter: ReportDateFilter): OperationsReportData {
  const allBills = loadBills()
  const allReservations = loadReservations()
  const allProducts = loadProducts()
  const allQuotations = loadQuotations()
  const todayStr = toLocalDateString(new Date())

  // Topic 12: Dispatch & Return counts in period
  let dispatchCount = 0
  let returnCount = 0

  const buckets = generateTimeBuckets(filter.startDate, filter.endDate, filter.granularity)
  const bucketMap = new Map<string, { dispatches: number; returns: number; reservations: number }>()
  for (const b of buckets) {
    bucketMap.set(b.key, { dispatches: 0, returns: 0, reservations: 0 })
  }

  const historyRecords: OperationsReportData['historyRecords'] = []

  for (const b of allBills) {
    if (b.rentalStatus === 'VOID' || b.rentalStatus === 'CANCELLED') continue

    // Dispatch check
    const dispDate = b.rentalStartDate
    if (isDateInRange(dispDate, filter.startDate, filter.endDate)) {
      dispatchCount++
      const clean = dispDate.includes('T') ? dispDate.split('T')[0] : dispDate.slice(0, 10)
      const key = filter.granularity === 'daily' ? clean : clean.slice(0, 7)
      const entry = bucketMap.get(key)
      if (entry) entry.dispatches++

      historyRecords.push({
        id: `disp-${b.id}`,
        date: dispDate,
        event: 'DISPATCH',
        refNo: b.billNo,
        customerName: b.customerName,
        itemsCount: b.items?.length || 0,
        handler: 'เจ้าหน้าที่จัดส่ง / มอบสินค้า',
        status: b.dispatchStatus === 'DISPATCHED' ? 'ส่งมอบแล้ว' : 'รอส่งมอบ',
      })
    }

    // Return check
    const retDate = b.actualReturnDate || (b.rentalStatus === 'RETURNED' || b.rentalStatus === 'CLOSED' ? b.scheduledReturnDate : null)
    if (retDate && isDateInRange(retDate, filter.startDate, filter.endDate)) {
      returnCount++
      const clean = retDate.includes('T') ? retDate.split('T')[0] : retDate.slice(0, 10)
      const key = filter.granularity === 'daily' ? clean : clean.slice(0, 7)
      const entry = bucketMap.get(key)
      if (entry) entry.returns++

      historyRecords.push({
        id: `ret-${b.id}`,
        date: retDate,
        event: 'RETURN',
        refNo: b.billNo,
        customerName: b.customerName,
        itemsCount: b.items?.reduce((s, i) => s + (i.returnedQty || 0), 0) || 0,
        handler: 'เจ้าหน้าที่ตรวจรับสินค้าคืน',
        status: 'รับคืนแล้ว',
      })
    }
  }

  // Topic 13: Reservations
  const inRangeReservations = allReservations.filter((r) =>
    r.status === 'ACTIVE' || isDateInRange(r.startDate || r.createdAt, filter.startDate, filter.endDate)
  )

  for (const r of allReservations) {
    if (isDateInRange(r.startDate || r.createdAt, filter.startDate, filter.endDate)) {
      const clean = (r.startDate || r.createdAt).split('T')[0]
      const key = filter.granularity === 'daily' ? clean : clean.slice(0, 7)
      const entry = bucketMap.get(key)
      if (entry) entry.reservations++
    }
  }

  const reservations = inRangeReservations.map((r) => ({
    id: r.id,
    reservationNo: r.reservationNo,
    productName: r.productName,
    quantity: r.quantity,
    customerName: r.customerName,
    startDate: r.startDate,
    endDate: r.endDate,
    sourceType: r.sourceType === 'QUOTATION' ? 'ใบเสนอราคา' : 'บิลเช่า',
    sourceNo: r.sourceNo,
    status: r.status,
  }))

  // Topic 20: Action Items (งาน / จุดที่ต้องจัดการ)
  const actionItems: ActionItem[] = []

  // 1. Overdue Rentals
  for (const b of allBills) {
    if (b.rentalStatus === 'RENTING' || b.rentalStatus === 'PARTIAL_RETURNED') {
      const retDate = (b.scheduledReturnDate || b.rentalStartDate || '').split('T')[0]
      if (retDate && retDate < todayStr) {
        actionItems.push({
          id: `act-overdue-${b.id}`,
          category: 'OVERDUE_RETURN',
          priority: 'high',
          title: `งานเช่าเกินกำหนดส่งคืน (${retDate})`,
          refNo: b.billNo,
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          date: retDate,
          status: 'เกินกำหนด',
          suggestedHandler: 'ฝ่ายรับคืน / ติดตามลูกค้า',
        })
      }
    }
  }

  // 2. Unpaid Debt follow-up
  for (const b of allBills) {
    if (b.rentalStatus !== 'VOID' && b.rentalStatus !== 'CANCELLED' && (b.outstandingAmount || 0) > 0) {
      actionItems.push({
        id: `act-debt-${b.id}`,
        category: 'DEBT_FOLLOWUP',
        priority: 'medium',
        title: `มียอดค้างชำระ ฿${formatCurrency(b.outstandingAmount)}`,
        refNo: b.billNo,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        date: b.billDate,
        status: 'ค้างชำระ',
        suggestedHandler: 'ฝ่ายบัญชี / การเงิน',
      })
    }
  }

  // 3. Damaged / Lost products
  for (const p of allProducts) {
    if ((p.damagedQuantity || 0) > 0) {
      actionItems.push({
        id: `act-dam-${p.id}`,
        category: 'DAMAGED_STOCK',
        priority: 'high',
        title: `สินค้าชำรุด ${p.damagedQuantity} ${p.unit || 'ชิ้น'} รอส่งซ่อม`,
        refNo: p.code,
        customerName: p.name,
        status: 'รอซ่อม',
        suggestedHandler: 'ฝ่ายคลังสินค้า / ช่างเทคนิค',
      })
    }
    if ((p.lostQuantity || 0) > 0) {
      actionItems.push({
        id: `act-lost-${p.id}`,
        category: 'LOST_STOCK',
        priority: 'medium',
        title: `สินค้าสูญหาย ${p.lostQuantity} ${p.unit || 'ชิ้น'} รอตัดบัญชี`,
        refNo: p.code,
        customerName: p.name,
        status: 'สูญหาย',
        suggestedHandler: 'ฝ่ายบัญชี / สต็อก',
      })
    }
    if ((p.availableQuantity || 0) <= (p.minimumStock || 0) && (p.totalQuantity || 0) > 0) {
      actionItems.push({
        id: `act-low-${p.id}`,
        category: 'LOW_STOCK',
        priority: 'medium',
        title: `สต็อกต่ำกว่าเกณฑ์ เหลือ ${p.availableQuantity}/${p.totalQuantity} ${p.unit || 'ชิ้น'}`,
        refNo: p.code,
        customerName: p.name,
        status: 'สต็อกต่ำ',
        suggestedHandler: 'ฝ่ายจัดซื้อ / สต็อก',
      })
    }
  }

  // 4. Pending Quotations
  for (const q of allQuotations) {
    if (q.status === 'SENT' || q.status === 'WAITING') {
      actionItems.push({
        id: `act-quote-${q.id}`,
        category: 'PENDING_QUOTE',
        priority: 'info',
        title: `ใบเสนอราคารอการยืนยัน ยอด ฿${formatCurrency(q.grandTotal)}`,
        refNo: q.quotationNo,
        customerName: q.customerName,
        customerPhone: q.phone,
        date: q.quotationDate,
        status: 'รอการตอบรับ',
        suggestedHandler: 'ฝ่ายขาย / ประสานงาน',
      })
    }
  }

  // Sort action items: high > medium > info
  const priorityRank = { high: 0, medium: 1, info: 2 }
  actionItems.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])

  // Trend mapping
  const operationsTrend = buckets.map((b) => {
    const val = bucketMap.get(b.key) || { dispatches: 0, returns: 0, reservations: 0 }
    return {
      label: b.label,
      dispatches: val.dispatches,
      returns: val.returns,
      reservations: val.reservations,
    }
  })

  historyRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    dispatchCount,
    returnCount,
    activeReservationsCount: reservations.filter((r) => r.status === 'ACTIVE').length,
    actionItemsCount: actionItems.length,
    operationsTrend,
    reservations,
    actionItems,
    historyRecords,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STOCK & PRODUCTS REPORT DATA (Topics 14, 15, 16)
// ─────────────────────────────────────────────────────────────────────────────

export interface StockReportData {
  totalStock: number
  availableStock: number
  rentedStock: number
  damagedStock: number
  lostStock: number
  utilizationRate: number
  totalSkuCount: number
  // Donut chart status
  statusProportions: Array<{
    label: string
    value: number
    color: string
    percentage: number
  }>
  // Category usage bar chart
  categoryUsage: Array<{
    category: string
    total: number
    available: number
    rented: number
    damaged: number
    lost: number
  }>
  // Damaged / Lost summary
  damagedItems: Array<{
    id: string
    code: string
    name: string
    category: string
    quantity: number
    unit: string
    estimatedFee: number
  }>
  lostItems: Array<{
    id: string
    code: string
    name: string
    category: string
    quantity: number
    unit: string
    estimatedLoss: number
  }>
  totalDamagedCost: number
  totalLostCost: number
  // Top & Bottom Products
  topProducts: Array<{
    id: string
    code: string
    name: string
    category: string
    revenue: number
    rentCount: number
    available: number
    total: number
  }>
  bottomProducts: Array<{
    id: string
    code: string
    name: string
    category: string
    revenue: number
    rentCount: number
    available: number
    total: number
  }>
  // Detailed Product Table
  productsTable: Array<{
    id: string
    code: string
    name: string
    category: string
    totalQuantity: number
    availableQuantity: number
    rentedQuantity: number
    damagedQuantity: number
    lostQuantity: number
    unit: string
    rentPrice: number
    salePrice: number
    revenue: number
    status: string
  }>
}

export function getStockReportData(filter: ReportDateFilter): StockReportData {
  const allProducts = loadProducts()
  const allBills = loadBills()

  // Calculate revenue earned by each product in the period
  const productRevenueMap = new Map<string, { revenue: number; rentCount: number }>()

  const inRangeBills = allBills.filter(
    (b) =>
      b.rentalStatus !== 'VOID' &&
      isDateInRange(b.billDate || b.rentalStartDate, filter.startDate, filter.endDate)
  )

  for (const b of inRangeBills) {
    for (const it of b.items || []) {
      const pid = it.productId
      if (!pid) continue
      const lineAmt = it.lineTotal ?? (it.quantity || 0) * (it.dailyRate || 0)
      const cur = productRevenueMap.get(pid) || { revenue: 0, rentCount: 0 }
      cur.revenue += lineAmt
      cur.rentCount += it.quantity || 1
      productRevenueMap.set(pid, cur)
    }
  }

  let totalStock = 0
  let availableStock = 0
  let rentedStock = 0
  let damagedStock = 0
  let lostStock = 0

  const catMap = new Map<
    string,
    { total: number; available: number; rented: number; damaged: number; lost: number }
  >()

  const damagedItems: StockReportData['damagedItems'] = []
  const lostItems: StockReportData['lostItems'] = []
  let totalDamagedCost = 0
  let totalLostCost = 0

  const productsTable: StockReportData['productsTable'] = []

  for (const p of allProducts) {
    const tot = p.totalQuantity || 0
    const avail = p.availableQuantity || 0
    const rent = p.rentedQuantity || 0
    const dam = p.damagedQuantity || 0
    const lost = p.lostQuantity || 0

    totalStock += tot
    availableStock += avail
    rentedStock += rent
    damagedStock += dam
    lostStock += lost

    // Category aggregation
    const cat = p.category || 'อื่นๆ'
    const catEntry = catMap.get(cat) || { total: 0, available: 0, rented: 0, damaged: 0, lost: 0 }
    catEntry.total += tot
    catEntry.available += avail
    catEntry.rented += rent
    catEntry.damaged += dam
    catEntry.lost += lost
    catMap.set(cat, catEntry)

    // Damaged / Lost checks
    if (dam > 0) {
      const fee = dam * (p.defaultDamageFee || 100)
      totalDamagedCost += fee
      damagedItems.push({
        id: p.id,
        code: p.code,
        name: p.name,
        category: cat,
        quantity: dam,
        unit: p.unit || 'ชิ้น',
        estimatedFee: fee,
      })
    }
    if (lost > 0) {
      const loss = lost * (p.defaultLossFee || p.salePrice || 500)
      totalLostCost += loss
      lostItems.push({
        id: p.id,
        code: p.code,
        name: p.name,
        category: cat,
        quantity: lost,
        unit: p.unit || 'ชิ้น',
        estimatedLoss: loss,
      })
    }

    const revInfo = productRevenueMap.get(p.id) || { revenue: 0, rentCount: 0 }

    productsTable.push({
      id: p.id,
      code: p.code,
      name: p.name,
      category: cat,
      totalQuantity: tot,
      availableQuantity: avail,
      rentedQuantity: rent,
      damagedQuantity: dam,
      lostQuantity: lost,
      unit: p.unit || 'ชิ้น',
      rentPrice: p.normalPrice || (p.rentPrice as any) || 0,
      salePrice: p.salePrice || 0,
      revenue: revInfo.revenue,
      status: p.status,
    })
  }

  const utilizationRate = totalStock > 0 ? Math.round((rentedStock / totalStock) * 100) : 0

  // Status proportions Donut
  const statusProportions = [
    {
      label: 'พร้อมใช้งาน',
      value: availableStock,
      color: '#10b981', // green
      percentage: totalStock > 0 ? Math.round((availableStock / totalStock) * 100) : 0,
    },
    {
      label: 'กำลังเช่า',
      value: rentedStock,
      color: '#3b82f6', // blue
      percentage: totalStock > 0 ? Math.round((rentedStock / totalStock) * 100) : 0,
    },
    {
      label: 'ชำรุดรอซ่อม',
      value: damagedStock,
      color: '#ef4444', // red
      percentage: totalStock > 0 ? Math.round((damagedStock / totalStock) * 100) : 0,
    },
    {
      label: 'สูญหาย',
      value: lostStock,
      color: '#f59e0b', // orange
      percentage: totalStock > 0 ? Math.round((lostStock / totalStock) * 100) : 0,
    },
  ]

  // Category usage Bar
  const categoryUsage = Array.from(catMap.entries()).map(([category, vals]) => ({
    category,
    ...vals,
  }))
  categoryUsage.sort((a, b) => b.total - a.total)

  // Top / Bottom Products
  const sortedByRev = [...productsTable].sort((a, b) => b.revenue - a.revenue)
  const topProducts = sortedByRev.slice(0, 5).map((p) => {
    const revInfo = productRevenueMap.get(p.id) || { revenue: 0, rentCount: 0 }
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      category: p.category,
      revenue: p.revenue,
      rentCount: revInfo.rentCount,
      available: p.availableQuantity,
      total: p.totalQuantity,
    }
  })

  const bottomProducts = sortedByRev
    .slice(-5)
    .reverse()
    .map((p) => {
      const revInfo = productRevenueMap.get(p.id) || { revenue: 0, rentCount: 0 }
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        category: p.category,
        revenue: p.revenue,
        rentCount: revInfo.rentCount,
        available: p.availableQuantity,
        total: p.totalQuantity,
      }
    })

  return {
    totalStock,
    availableStock,
    rentedStock,
    damagedStock,
    lostStock,
    utilizationRate,
    totalSkuCount: allProducts.length,
    statusProportions,
    categoryUsage,
    damagedItems,
    lostItems,
    totalDamagedCost,
    totalLostCost,
    topProducts,
    bottomProducts,
    productsTable,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. BUSINESS ANALYTICS REPORT DATA (Topics 4, 17, 19)
// ─────────────────────────────────────────────────────────────────────────────

export interface BusinessReportData {
  // Topic 4: Growth
  currentRevenue: number
  previousRevenue: number
  revenueGrowth: number

  currentOrders: number
  previousOrders: number
  orderGrowth: number

  currentAvgTicket: number
  previousAvgTicket: number
  avgTicketGrowth: number

  currentActiveCustomers: number
  previousActiveCustomers: number
  customerGrowth: number

  // Topic 17: Top Customers
  topCustomers: Array<{
    rank: number
    customerId: string
    customerName: string
    customerPhone?: string
    companyName?: string
    totalSpend: number
    ordersCount: number
    outstandingDebt: number
    lastOrderDate: string
    tier: 'VIP' | 'Regular' | 'New'
  }>

  // Topic 19: Revenue Trend Chart
  revenueTrend: Array<{
    label: string
    revenue: number
    orders: number
  }>

  // Detailed Ranking Table
  customerRankings: Array<{
    rank: number
    customerName: string
    phone: string
    company: string
    totalSpend: number
    ordersCount: number
    outstandingDebt: number
    firstOrderDate: string
    lastOrderDate: string
  }>
}

export function getBusinessReportData(filter: ReportDateFilter): BusinessReportData {
  const allBills = loadBills()
  const allCustomers = loadCustomers()
  const { prevStart, prevEnd } = getPreviousPeriod(filter.startDate, filter.endDate)

  // Bills in range
  const curBills = allBills.filter(
    (b) =>
      b.rentalStatus !== 'VOID' &&
      b.rentalStatus !== 'CANCELLED' &&
      isDateInRange(b.billDate || b.rentalStartDate, filter.startDate, filter.endDate)
  )

  const prevBills = allBills.filter(
    (b) =>
      b.rentalStatus !== 'VOID' &&
      b.rentalStatus !== 'CANCELLED' &&
      isDateInRange(b.billDate || b.rentalStartDate, prevStart, prevEnd)
  )

  // Current Metrics
  const currentRevenue = curBills.reduce((s, b) => s + (b.grandTotal || 0), 0)
  const currentOrders = curBills.length
  const currentAvgTicket = currentOrders > 0 ? Math.round(currentRevenue / currentOrders) : 0
  const curCustomerIds = new Set(curBills.map((b) => b.customerId || b.customerName).filter(Boolean))
  const currentActiveCustomers = curCustomerIds.size

  // Previous Metrics
  const previousRevenue = prevBills.reduce((s, b) => s + (b.grandTotal || 0), 0)
  const previousOrders = prevBills.length
  const previousAvgTicket = previousOrders > 0 ? Math.round(previousRevenue / previousOrders) : 0
  const prevCustomerIds = new Set(prevBills.map((b) => b.customerId || b.customerName).filter(Boolean))
  const previousActiveCustomers = prevCustomerIds.size

  // Growth percentages
  const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue)
  const orderGrowth = calculateGrowth(currentOrders, previousOrders)
  const avgTicketGrowth = calculateGrowth(currentAvgTicket, previousAvgTicket)
  const customerGrowth = calculateGrowth(currentActiveCustomers, previousActiveCustomers)

  // Topic 17: Customer Aggregation
  const customerStatsMap = new Map<
    string,
    {
      customerId: string
      customerName: string
      customerPhone?: string
      companyName?: string
      totalSpend: number
      ordersCount: number
      outstandingDebt: number
      firstOrderDate: string
      lastOrderDate: string
    }
  >()

  for (const b of curBills) {
    const key = b.customerId || b.customerName || 'Unknown'
    const cur = customerStatsMap.get(key) || {
      customerId: b.customerId || '',
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      companyName: b.siteName,
      totalSpend: 0,
      ordersCount: 0,
      outstandingDebt: 0,
      firstOrderDate: b.billDate || b.rentalStartDate || '',
      lastOrderDate: b.billDate || b.rentalStartDate || '',
    }

    cur.totalSpend += b.grandTotal || 0
    cur.ordersCount++
    cur.outstandingDebt += b.outstandingAmount || 0

    const date = b.billDate || b.rentalStartDate || ''
    if (date) {
      if (!cur.firstOrderDate || date < cur.firstOrderDate) cur.firstOrderDate = date
      if (!cur.lastOrderDate || date > cur.lastOrderDate) cur.lastOrderDate = date
    }

    customerStatsMap.set(key, cur)
  }

  // Cross-reference with Customer Storage for company/phone
  for (const c of allCustomers) {
    const cur = customerStatsMap.get(c.id) || customerStatsMap.get(c.customerName)
    if (cur) {
      if (!cur.companyName && c.companyName) cur.companyName = c.companyName
      if (!cur.customerPhone && c.phone) cur.customerPhone = c.phone
    }
  }

  const customerList = Array.from(customerStatsMap.values())
  customerList.sort((a, b) => b.totalSpend - a.totalSpend)

  const topCustomers: BusinessReportData['topCustomers'] = customerList.slice(0, 10).map((c, idx) => {
    let tier: 'VIP' | 'Regular' | 'New' = 'Regular'
    if (c.totalSpend >= 50000 || c.ordersCount >= 5) tier = 'VIP'
    else if (c.ordersCount === 1) tier = 'New'

    return {
      rank: idx + 1,
      customerId: c.customerId,
      customerName: c.customerName,
      customerPhone: c.customerPhone,
      companyName: c.companyName,
      totalSpend: c.totalSpend,
      ordersCount: c.ordersCount,
      outstandingDebt: c.outstandingDebt,
      lastOrderDate: c.lastOrderDate,
      tier,
    }
  })

  const customerRankings: BusinessReportData['customerRankings'] = customerList.map((c, idx) => ({
    rank: idx + 1,
    customerName: c.customerName,
    phone: c.customerPhone || '-',
    company: c.companyName || '-',
    totalSpend: c.totalSpend,
    ordersCount: c.ordersCount,
    outstandingDebt: c.outstandingDebt,
    firstOrderDate: c.firstOrderDate,
    lastOrderDate: c.lastOrderDate,
  }))

  // Topic 19: Revenue Trend Chart
  const buckets = generateTimeBuckets(filter.startDate, filter.endDate, filter.granularity)
  const bucketMap = new Map<string, { revenue: number; orders: number }>()
  for (const b of buckets) {
    bucketMap.set(b.key, { revenue: 0, orders: 0 })
  }

  for (const b of curBills) {
    const rawDate = b.billDate || b.rentalStartDate || ''
    const clean = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate.slice(0, 10)
    const key = filter.granularity === 'daily' ? clean : clean.slice(0, 7)
    const entry = bucketMap.get(key)
    if (entry) {
      entry.revenue += b.grandTotal || 0
      entry.orders++
    }
  }

  const revenueTrend = buckets.map((b) => {
    const val = bucketMap.get(b.key) || { revenue: 0, orders: 0 }
    return {
      label: b.label,
      revenue: val.revenue,
      orders: val.orders,
    }
  })

  return {
    currentRevenue,
    previousRevenue,
    revenueGrowth,
    currentOrders,
    previousOrders,
    orderGrowth,
    currentAvgTicket,
    previousAvgTicket,
    avgTicketGrowth,
    currentActiveCustomers,
    previousActiveCustomers,
    customerGrowth,
    topCustomers,
    revenueTrend,
    customerRankings,
  }
}
