import { StatementTransaction } from '@/lib/finance-storage'
import { FullBill } from '@/lib/bill-storage'
import { Product } from '@/lib/types/rental-pos'
import { ReservationRecord } from '@/lib/reservation-storage'
import { ActionableNotification } from '@/lib/notification-storage'

export interface DashboardMetrics {
  // Financial
  totalIncome: number
  totalExpense: number
  netIncome: number
  outstandingReceivable: number
  depositBalance: number

  // Operations & Additional Assets Metrics (Items 6-10)
  salesRevenue: number
  rentalRevenue: number
  inProgressBillsCount: number
  activeRentalsCount: number
  todayTasksCount: number
  todayDeliveriesCount: number
  todayReturnsCount: number

  // Stock
  availableStock: number
  rentedOrReservedStock: number
  rentedStock: number
  reservedStock: number
  damagedOrLostStock: number
  damagedStock: number
  lostStock: number
  activeReservationsCount: number

  // Urgent Notifications
  urgentTasks: ActionableNotification[]

  // Asset Status Breakdown for Bar Chart
  assetStatusData: Array<{ label: string; count: number; color: string }>

  // Time Series (Income & Expense over recent 7 days)
  recentTrend: Array<{
    date: string
    displayDate: string
    income: number
    expense: number
  }>

  // Stock Category Breakdown for Stock View Bar Chart
  categoryStockData: Array<{
    category: string
    total: number
    available: number
    rented: number
    damaged: number
  }>

  // Donut Stock Proportions
  stockDonutData: Array<{
    label: string
    value: number
    color: string
    percentage: number
  }>

  // Top Rented Products
  topRentedProducts: Array<{
    id: string
    code: string
    name: string
    rentalCount: number
    revenue: number
  }>

  // Business Analytics: Monthly/Daily Trend (Recent 6 months or periods)
  monthlyTrend: Array<{
    month: string
    revenue: number
    billsCount: number
  }>

  // Top Customers
  topCustomers: Array<{
    name: string
    phone?: string
    billsCount: number
    totalSpent: number
  }>

  // Payment Channels Breakdown
  paymentChannelsData: Array<{
    channel: string
    label: string
    amount: number
    percentage: number
    color: string
  }>

  // Growth Rate
  growthRate: number
}

const THAI_MONTH_ABBR = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
]

export function computeDashboardMetrics(
  transactions: StatementTransaction[],
  bills: FullBill[],
  products: Product[],
  reservations: ReservationRecord[],
  notifications: ActionableNotification[]
): DashboardMetrics {
  // 1. Finance Metrics from finance-storage
  let totalIncome = 0
  let totalExpense = 0
  let depositBalance = 0

  transactions.forEach((tx) => {
    totalIncome += tx.incomeAmount || 0
    totalExpense += tx.expenseAmount || 0
    if (tx.isDeposit) {
      depositBalance += (tx.incomeAmount || 0) - (tx.expenseAmount || 0)
    }
  })
  const netIncome = totalIncome - totalExpense

  // 2. Active Bills Receivable (ห้ามนับ DRAFT / CANCELLED / VOID)
  let outstandingReceivable = 0
  const activeBills = bills.filter((b) => {
    const s = b.rentalStatus
    return s !== 'DRAFT' && s !== 'CANCELLED' && s !== 'VOID'
  })

  activeBills.forEach((b) => {
    outstandingReceivable += b.outstandingAmount || 0
  })

  // 2.1 Additional Operations Metrics (Items 6 - 10)
  let salesRevenue = 0
  let rentalRevenue = 0
  activeBills.forEach((b) => {
    b.items.forEach((it) => {
      const amount = it.lineTotal ?? ((it.quantity || 0) * (it.dailyRate || 0))
      if (it.rentalType === 'SALE' || it.requiresReturn === false) {
        salesRevenue += amount
      } else {
        rentalRevenue += amount
      }
    })
  })

  // 8. บิลที่กำลังดำเนินการ
  const inProgressBills = activeBills.filter(
    (b) => b.rentalStatus === 'RENTING' || b.rentalStatus === 'PARTIAL_RETURNED'
  )
  const inProgressBillsCount = inProgressBills.length

  // 9. งานเช่าปัจจุบัน
  let activeRentalsCount = 0
  activeBills.forEach((b) => {
    b.items.forEach((it) => {
      if (it.status === 'RENTING' || it.status === 'PARTIAL_RETURNED') {
        activeRentalsCount += 1
      }
    })
  })
  if (activeRentalsCount === 0 && inProgressBillsCount > 0) {
    inProgressBills.forEach((b) => {
      b.items.forEach((it) => {
        if (it.requiresReturn !== false && it.rentalType !== 'SALE') {
          activeRentalsCount += 1
        }
      })
    })
  }

  // 10. งานส่ง / รับคืนวันนี้
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayDeliveriesCount = activeBills.filter((b) => {
    const isTodayStart = b.rentalStartDate ? b.rentalStartDate.slice(0, 10) === todayStr : false
    return isTodayStart && b.dispatchStatus !== 'DISPATCHED'
  }).length

  const todayReturnsCount = activeBills.filter((b) => {
    const isTodayReturn = b.scheduledReturnDate ? b.scheduledReturnDate.slice(0, 10) === todayStr : false
    return isTodayReturn && (b.rentalStatus === 'RENTING' || b.rentalStatus === 'PARTIAL_RETURNED')
  }).length

  const todayTasksCount = todayDeliveriesCount + todayReturnsCount

  // 3. Stock Metrics from Products
  let availableStock = 0
  let rentedStock = 0
  let damagedStock = 0
  let lostStock = 0

  products.forEach((p) => {
    availableStock += p.availableQuantity || 0
    rentedStock += p.rentedQuantity || 0
    damagedStock += p.damagedQuantity || 0
    lostStock += p.lostQuantity || 0
  })

  // 4. Reservations
  const activeReservations = reservations.filter((r) => r.status === 'ACTIVE')
  const activeReservationsCount = activeReservations.length
  const totalReservedQuantity = activeReservations.reduce((sum, r) => sum + (r.quantity || 0), 0)

  const rentedOrReservedStock = rentedStock + totalReservedQuantity
  const damagedOrLostStock = damagedStock + lostStock

  // 5. Urgent Tasks from notifications (UNREAD or READ, not ACTIONED or DISMISSED)
  const urgentTasks = notifications
    .filter((n) => n.status === 'UNREAD' || n.status === 'READ')
    .slice(0, 8)

  // 6. Asset Status Data for Bar Comparison
  const assetStatusData = [
    { label: 'พร้อมให้เช่า', count: availableStock, color: '#10b981' },
    { label: 'กำลังเช่า', count: rentedStock, color: '#3b82f6' },
    { label: 'จองคิว', count: totalReservedQuantity, color: '#8b5cf6' },
    { label: 'ชำรุด', count: damagedStock, color: '#f59e0b' },
    { label: 'สูญหาย', count: lostStock, color: '#ef4444' },
  ]

  // 7. Recent 7 Days Income & Expense Trend
  const last7Days: string[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    last7Days.push(d.toISOString().slice(0, 10))
  }

  const trendMap: Record<string, { income: number; expense: number }> = {}
  last7Days.forEach((dateStr) => {
    trendMap[dateStr] = { income: 0, expense: 0 }
  })

  transactions.forEach((tx) => {
    const dateStr = tx.dateTime ? tx.dateTime.slice(0, 10) : ''
    if (trendMap[dateStr]) {
      trendMap[dateStr].income += tx.incomeAmount || 0
      trendMap[dateStr].expense += tx.expenseAmount || 0
    }
  })

  const recentTrend = last7Days.map((dateStr) => {
    const parts = dateStr.split('-')
    const day = parseInt(parts[2], 10)
    const month = parseInt(parts[1], 10) - 1
    const displayDate = `${day} ${THAI_MONTH_ABBR[month] || ''}`
    return {
      date: dateStr,
      displayDate,
      income: trendMap[dateStr].income,
      expense: trendMap[dateStr].expense,
    }
  })

  // 8. Stock Categories Breakdown
  const catMap: Record<string, { total: number; available: number; rented: number; damaged: number }> = {}
  products.forEach((p) => {
    const cat = p.category || 'ทั่วไป'
    if (!catMap[cat]) {
      catMap[cat] = { total: 0, available: 0, rented: 0, damaged: 0 }
    }
    catMap[cat].total += p.totalQuantity || 0
    catMap[cat].available += p.availableQuantity || 0
    catMap[cat].rented += p.rentedQuantity || 0
    catMap[cat].damaged += (p.damagedQuantity || 0) + (p.lostQuantity || 0)
  })

  const categoryStockData = Object.entries(catMap).map(([category, data]) => ({
    category,
    ...data,
  }))

  // 9. Stock Donut Proportions
  const totalStockSum = availableStock + rentedStock + totalReservedQuantity + damagedStock + lostStock
  const stockDonutData = [
    {
      label: 'พร้อมใช้',
      value: availableStock,
      color: '#10b981', // green
      percentage: totalStockSum > 0 ? Math.round((availableStock / totalStockSum) * 100) : 0,
    },
    {
      label: 'กำลังเช่า',
      value: rentedStock,
      color: '#3b82f6', // blue
      percentage: totalStockSum > 0 ? Math.round((rentedStock / totalStockSum) * 100) : 0,
    },
    {
      label: 'จองคิว',
      value: totalReservedQuantity,
      color: '#8b5cf6', // purple
      percentage: totalStockSum > 0 ? Math.round((totalReservedQuantity / totalStockSum) * 100) : 0,
    },
    {
      label: 'ชำรุด/สูญหาย',
      value: damagedOrLostStock,
      color: '#ef4444', // red
      percentage: totalStockSum > 0 ? Math.round((damagedOrLostStock / totalStockSum) * 100) : 0,
    },
  ]

  // 10. Top Products from Active Bills items
  const productAgg: Record<string, { id: string; code: string; name: string; rentalCount: number; revenue: number }> = {}
  activeBills.forEach((b) => {
    b.items.forEach((it) => {
      const pid = it.productId || it.productName
      if (!productAgg[pid]) {
        productAgg[pid] = {
          id: it.productId,
          code: it.productCode || '',
          name: it.productName,
          rentalCount: 0,
          revenue: 0,
        }
      }
      productAgg[pid].rentalCount += it.quantity || 0
      productAgg[pid].revenue += it.lineTotal || ((it.quantity || 0) * (it.dailyRate || 0))
    })
  })

  const topRentedProducts = Object.values(productAgg)
    .sort((a, b) => b.rentalCount - a.rentalCount)
    .slice(0, 6)

  // 11. Top Customers from Active Bills
  const custAgg: Record<string, { name: string; phone?: string; billsCount: number; totalSpent: number }> = {}
  activeBills.forEach((b) => {
    const cname = b.customerName || 'ลูกค้าทั่วไป'
    if (!custAgg[cname]) {
      custAgg[cname] = {
        name: cname,
        phone: b.customerPhone,
        billsCount: 0,
        totalSpent: 0,
      }
    }
    custAgg[cname].billsCount += 1
    custAgg[cname].totalSpent += b.paidAmount || b.grandTotal || 0
  })

  const topCustomers = Object.values(custAgg)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 6)

  // 12. Payment Channels Breakdown from finance-storage
  const channelMap: Record<string, number> = {}
  let totalChannelIncome = 0

  transactions.forEach((tx) => {
    if (tx.type === 'INCOME' && tx.incomeAmount > 0) {
      const ch = tx.channel || 'เงินสด'
      channelMap[ch] = (channelMap[ch] || 0) + tx.incomeAmount
      totalChannelIncome += tx.incomeAmount
    }
  })

  const CHANNEL_COLOR_PALETTE = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899']
  const paymentChannelsData = Object.entries(channelMap).map(([channel, amount], idx) => ({
    channel,
    label: channel === 'CASH' ? 'เงินสด' : channel === 'TRANSFER' ? 'โอนเงิน' : channel === 'CREDIT_CARD' ? 'บัตรเครดิต' : channel,
    amount,
    percentage: totalChannelIncome > 0 ? Math.round((amount / totalChannelIncome) * 100) : 0,
    color: CHANNEL_COLOR_PALETTE[idx % CHANNEL_COLOR_PALETTE.length],
  }))

  // 13. Monthly Revenue Trend (Last 6 Months)
  const monthlyMap: Record<string, { revenue: number; billsCount: number }> = {}
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = { revenue: 0, billsCount: 0 }
  }

  activeBills.forEach((b) => {
    const bDate = b.billDate ? b.billDate.slice(0, 7) : ''
    if (monthlyMap[bDate]) {
      monthlyMap[bDate].revenue += b.paidAmount || 0
      monthlyMap[bDate].billsCount += 1
    }
  })

  const monthlyTrend = Object.entries(monthlyMap).map(([mKey, val]) => {
    const [yearStr, monthStr] = mKey.split('-')
    const monthIdx = parseInt(monthStr, 10) - 1
    const yearBE = parseInt(yearStr, 10) + 543
    return {
      month: `${THAI_MONTH_ABBR[monthIdx]} ${String(yearBE).slice(-2)}`,
      revenue: val.revenue,
      billsCount: val.billsCount,
    }
  })

  // 14. Growth Rate Calculation (Compare this month vs last month)
  let growthRate = 0
  const monthlyKeys = Object.keys(monthlyMap)
  if (monthlyKeys.length >= 2) {
    const currentMonthRev = monthlyMap[monthlyKeys[monthlyKeys.length - 1]].revenue
    const prevMonthRev = monthlyMap[monthlyKeys[monthlyKeys.length - 2]].revenue
    if (prevMonthRev > 0) {
      growthRate = Math.round(((currentMonthRev - prevMonthRev) / prevMonthRev) * 100)
    } else if (currentMonthRev > 0) {
      growthRate = 100
    }
  }

  return {
    totalIncome,
    totalExpense,
    netIncome,
    outstandingReceivable,
    depositBalance,
    salesRevenue,
    rentalRevenue,
    inProgressBillsCount,
    activeRentalsCount,
    todayTasksCount,
    todayDeliveriesCount,
    todayReturnsCount,
    availableStock,
    rentedOrReservedStock,
    rentedStock,
    reservedStock: totalReservedQuantity,
    damagedOrLostStock,
    damagedStock,
    lostStock,
    activeReservationsCount,
    urgentTasks,
    assetStatusData,
    recentTrend,
    categoryStockData,
    stockDonutData,
    topRentedProducts,
    monthlyTrend,
    topCustomers,
    paymentChannelsData,
    growthRate,
  }
}
