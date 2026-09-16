import { StatementTransaction } from '@/lib/finance-storage'
import { FullBill } from '@/lib/bill-storage'
import { Product } from '@/lib/types/rental-pos'
import { ReservationRecord } from '@/lib/reservation-storage'
import { ActionableNotification } from '@/lib/notification-storage'

export interface DashboardTaskItem {
  id: string
  time: string
  type: 'DISPATCH' | 'RETURN' | 'FOLLOWUP' | 'INSPECT' | 'PREPARE'
  typeLabel: string
  typeBadgeColor: string
  billNo: string
  customerName: string
  itemsSummary: string
  quantity: number
  status: string
  statusColor: string
  assignee: string
  remark: string
}

export interface StockUrgentItem {
  id: string
  time: string
  workType: string
  workBadgeColor: string
  productName: string
  quantity: number
  unit: string
  status: string
  statusColor: string
  assignee: string
  remark: string
}

export interface DashboardMetrics {
  // Financial
  totalIncome: number
  totalExpense: number
  netIncome: number
  outstandingReceivable: number
  depositBalance: number
  debtorCount: number
  depositCount: number

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

  // Income Breakdown by Category (Image 1 Donut)
  incomeBreakdownData: Array<{
    label: string
    value: number
    color: string
    percentage: number
  }>

  // Bill Status Counts (Image 1 Bar)
  billStatusCounts: {
    paid: number
    inProgress: number
    overdue: number
    cancelled: number
  }

  // Deposit vs Debt Donut (Image 1 Donut)
  depositVsDebtData: Array<{
    label: string
    value: number
    color: string
    percentage: number
  }>

  // Today's Key Tasks / Table (Image 1 List & Table)
  todayKeyTasks: DashboardTaskItem[]

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

  // 7-Day Reservation Trend (Image 2 Bar)
  reservationTrendData: Array<{
    date: string
    displayDate: string
    incomingQty: number
    outgoingQty: number
  }>

  // Stock Alerts Summary (Image 2 Right List)
  stockAlertsSummary: {
    damagedCount: number
    lowStockCount: number
    overdueCount: number
    incomingReservationCount: number
    outgoingDispatchCount: number
  }

  // Stock Urgent Tasks Table (Image 2 Bottom Table)
  stockUrgentList: StockUrgentItem[]

  // Business Analytics: Monthly/Daily Trend (Recent 6 months or periods)
  monthlyTrend: Array<{
    month: string
    revenue: number
    grossProfit: number
    billsCount: number
  }>

  // Top Revenue Products (Image 3 Right Ranking Table)
  topRevenueProducts: Array<{
    id: string
    code: string
    name: string
    type: string
    revenue: number
    percentage: number
  }>

  // Top Customers
  topCustomers: Array<{
    name: string
    customerType: string
    phone?: string
    billsCount: number
    totalSpent: number
    percentage: number
  }>

  // Payment Channels Breakdown
  paymentChannelsData: Array<{
    channel: string
    label: string
    amount: number
    percentage: number
    color: string
  }>

  // Growth Rate & Top Summary Metrics
  growthRate: number
  currentMonthRevenue: number
  topProductMetric: {
    name: string
    revenue: number
    type: string
  }
  topCustomerMetric: {
    count: number
    totalSpent: number
    percentage: number
  }
  topChannelMetric: {
    name: string
    amount: number
    percentage: number
  }
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
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

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

  const debtorBills = activeBills.filter((b) => (b.outstandingAmount || 0) > 0)
  debtorBills.forEach((b) => {
    outstandingReceivable += b.outstandingAmount || 0
  })
  const debtorCount = debtorBills.length

  // Deposit count from active bills and transactions
  const depositCount = activeBills.filter((b) => (b.heldDepositAmount || 0) > 0 || (b.deposits && b.deposits.length > 0)).length ||
    transactions.filter((tx) => tx.isDeposit).length

  // 2.1 Operations Metrics (Items 6 - 10)
  let salesRevenue = 0
  let rentalRevenue = 0
  let totalShippingService = 0

  activeBills.forEach((b) => {
    totalShippingService += b.shippingFee || 0
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

  // 5. Urgent Tasks from notifications
  const urgentTasks = notifications
    .filter((n) => n.status === 'UNREAD' || n.status === 'READ')
    .slice(0, 8)

  // 6. Asset Status Data
  const assetStatusData = [
    { label: 'พร้อมให้เช่า', count: availableStock, color: '#10b981' },
    { label: 'กำลังเช่า', count: rentedStock, color: '#3b82f6' },
    { label: 'จองคิว', count: totalReservedQuantity, color: '#8b5cf6' },
    { label: 'ชำรุด', count: damagedStock, color: '#f59e0b' },
    { label: 'สูญหาย', count: lostStock, color: '#ef4444' },
  ]

  // 7. Recent 7 Days Income & Expense Trend
  const last7Days: string[] = []
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

  // 8. Income Breakdown Data (Donut in View 1)
  const penaltyIncome = transactions
    .filter((t) => t.category?.includes('ปรับ') || t.description?.includes('ปรับ'))
    .reduce((sum, t) => sum + (t.incomeAmount || 0), 0)

  const totalBreakdownSum = rentalRevenue + salesRevenue + totalShippingService + penaltyIncome
  const safeBreakdownSum = totalBreakdownSum > 0 ? totalBreakdownSum : 1

  const incomeBreakdownData = [
    {
      label: 'รายได้จากการเช่า',
      value: rentalRevenue,
      color: '#10b981', // green
      percentage: Math.round((rentalRevenue / safeBreakdownSum) * 100),
    },
    {
      label: 'ขายสินค้า',
      value: salesRevenue,
      color: '#3b82f6', // blue
      percentage: Math.round((salesRevenue / safeBreakdownSum) * 100),
    },
    {
      label: 'ค่าบริการอื่น ๆ',
      value: totalShippingService,
      color: '#8b5cf6', // purple
      percentage: Math.round((totalShippingService / safeBreakdownSum) * 100),
    },
    {
      label: 'ปรับ/ค่าปรับ',
      value: penaltyIncome,
      color: '#f59e0b', // amber
      percentage: Math.round((penaltyIncome / safeBreakdownSum) * 100),
    },
  ]

  // 9. Bill Status Breakdown (Bar in View 1)
  const paidBillsCount = bills.filter((b) => b.paymentStatus === 'PAID').length
  const overdueBillsCount = activeBills.filter((b) => {
    const isOverdue = b.scheduledReturnDate && b.scheduledReturnDate.slice(0, 10) < todayStr
    return isOverdue && (b.rentalStatus === 'RENTING' || b.rentalStatus === 'PARTIAL_RETURNED')
  }).length
  const cancelledBillsCount = bills.filter((b) => b.rentalStatus === 'CANCELLED' || b.rentalStatus === 'VOID').length
  const inProgressStatusCount = Math.max(0, inProgressBillsCount - overdueBillsCount)

  const billStatusCounts = {
    paid: paidBillsCount,
    inProgress: inProgressStatusCount,
    overdue: overdueBillsCount,
    cancelled: cancelledBillsCount,
  }

  // 10. Deposit vs Debt Donut (Donut in View 1)
  const totalDepDebt = depositBalance + outstandingReceivable
  const safeDepDebt = totalDepDebt > 0 ? totalDepDebt : 1
  const depositVsDebtData = [
    {
      label: 'เงินมัดจำ',
      value: depositBalance,
      color: '#8b5cf6', // purple
      percentage: Math.round((depositBalance / safeDepDebt) * 100),
    },
    {
      label: 'ลูกหนี้ค้างชำระ',
      value: outstandingReceivable,
      color: '#f59e0b', // amber
      percentage: Math.round((outstandingReceivable / safeDepDebt) * 100),
    },
  ]

  // 11. Today's Key Tasks & Table (View 1)
  const taskSlots = ['09:00', '10:30', '11:00', '14:00', '16:00', '16:30']
  const todayKeyTasks: DashboardTaskItem[] = []

  // Deliveries today
  activeBills
    .filter((b) => b.dispatchStatus === 'PENDING' || (b.rentalStartDate && b.rentalStartDate.slice(0, 10) === todayStr))
    .slice(0, 2)
    .forEach((b, idx) => {
      const firstItem = b.items[0]
      todayKeyTasks.push({
        id: `delivery-${b.id}`,
        time: taskSlots[idx % taskSlots.length],
        type: 'DISPATCH',
        typeLabel: 'ส่งมอบ',
        typeBadgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        billNo: b.billNo,
        customerName: b.customerName || 'ลูกค้าทั่วไป',
        itemsSummary: firstItem ? `${firstItem.productName} (${firstItem.quantity} ${firstItem.unit || 'ชิ้น'})` : 'สินค้าเช่า',
        quantity: firstItem?.quantity || 1,
        status: 'รอดำเนินการ',
        statusColor: 'text-emerald-500',
        assignee: 'สมชาย',
        remark: b.siteName ? `จัดส่งหน้างาน ${b.siteName}` : 'ส่งมอบหน้างาน',
      })
    })

  // Returns today
  activeBills
    .filter((b) => b.rentalStatus === 'RENTING' || b.rentalStatus === 'PARTIAL_RETURNED')
    .slice(0, 2)
    .forEach((b, idx) => {
      const firstItem = b.items[0]
      todayKeyTasks.push({
        id: `return-${b.id}`,
        time: taskSlots[(todayKeyTasks.length) % taskSlots.length],
        type: 'RETURN',
        typeLabel: 'รับคืน',
        typeBadgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        billNo: b.billNo,
        customerName: b.customerName || 'ลูกค้าทั่วไป',
        itemsSummary: firstItem ? `${firstItem.productName} (${firstItem.quantity} ${firstItem.unit || 'ชิ้น'})` : 'รับคืนอุปกรณ์',
        quantity: firstItem?.quantity || 1,
        status: 'กำลังดำเนินการ',
        statusColor: 'text-blue-500',
        assignee: 'วิทยา',
        remark: 'ตรวจสภาพหลังรับคืน',
      })
    })

  // Overdue follow-up
  debtorBills.slice(0, 1).forEach((b) => {
    todayKeyTasks.push({
      id: `debt-${b.id}`,
      time: '13:00',
      type: 'FOLLOWUP',
      typeLabel: 'ติดตาม',
      typeBadgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      billNo: b.billNo,
      customerName: b.customerName || 'ลูกค้าทั่วไป',
      itemsSummary: `ค้างชำระ ฿${(b.outstandingAmount || 0).toLocaleString()}`,
      quantity: 1,
      status: 'เกินกำหนด',
      statusColor: 'text-amber-500',
      assignee: 'สุภา',
      remark: 'โทรติดตามลูกค้า',
    })
  })

  // Inspection or maintenance task if damaged products exist
  if (damagedStock > 0 || products.some((p) => (p.damagedQuantity || 0) > 0)) {
    const damagedProd = products.find((p) => (p.damagedQuantity || 0) > 0)
    todayKeyTasks.push({
      id: 'inspect-damaged',
      time: '15:00',
      type: 'INSPECT',
      typeLabel: 'ตรวจสอบ',
      typeBadgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      billNo: '-',
      customerName: '-',
      itemsSummary: damagedProd ? `${damagedProd.name} (${damagedProd.damagedQuantity} ชิ้น)` : 'สินค้าชำรุด',
      quantity: damagedProd?.damagedQuantity || 1,
      status: 'ตรวจสอบ',
      statusColor: 'text-purple-500',
      assignee: 'ช่างทีม A',
      remark: 'เช็คสภาพก่อนส่งซ่อม',
    })
  }

  // Active reservations preparation
  if (activeReservations.length > 0 && todayKeyTasks.length < 5) {
    const firstRes = activeReservations[0]
    todayKeyTasks.push({
      id: `res-${firstRes.id}`,
      time: '16:30',
      type: 'PREPARE',
      typeLabel: 'เตรียมงาน',
      typeBadgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      billNo: firstRes.id.slice(0, 8),
      customerName: firstRes.customerName || 'ลูกค้าจองคิว',
      itemsSummary: firstRes.productName,
      quantity: firstRes.quantity || 1,
      status: 'เตรียมจัดส่ง',
      statusColor: 'text-blue-500',
      assignee: 'อนุชา',
      remark: 'จัดเตรียมสินค้าสำหรับงานพรุ่งนี้',
    })
  }

  // 12. Stock Categories Breakdown
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

  // 13. Stock Donut Proportions
  const totalStockSum = availableStock + rentedStock + totalReservedQuantity + damagedStock + lostStock
  const safeTotalStock = totalStockSum > 0 ? totalStockSum : 1
  const stockDonutData = [
    {
      label: 'พร้อมใช้',
      value: availableStock,
      color: '#10b981', // green
      percentage: Math.round((availableStock / safeTotalStock) * 100),
    },
    {
      label: 'กำลังเช่า',
      value: rentedStock,
      color: '#3b82f6', // blue
      percentage: Math.round((rentedStock / safeTotalStock) * 100),
    },
    {
      label: 'จองคิว',
      value: totalReservedQuantity,
      color: '#8b5cf6', // purple
      percentage: Math.round((totalReservedQuantity / safeTotalStock) * 100),
    },
    {
      label: 'ชำรุด/สูญหาย',
      value: damagedOrLostStock,
      color: '#ef4444', // red
      percentage: Math.round((damagedOrLostStock / safeTotalStock) * 100),
    },
  ]

  // 14. 7-Day Reservation Trend (View 2 Middle Bar)
  const reservationTrendData = last7Days.map((dateStr) => {
    const parts = dateStr.split('-')
    const day = parseInt(parts[2], 10)
    const month = parseInt(parts[1], 10) - 1
    const displayDate = `${day} ${THAI_MONTH_ABBR[month] || ''}`

    // Outgoing (dispatch due on that date)
    const outgoingQty = activeBills
      .filter((b) => b.rentalStartDate && b.rentalStartDate.slice(0, 10) === dateStr)
      .reduce((sum, b) => sum + b.items.reduce((s, it) => s + (it.quantity || 0), 0), 0)

    // Incoming (reservations or returns on that date)
    const incomingQty = activeBills
      .filter((b) => b.scheduledReturnDate && b.scheduledReturnDate.slice(0, 10) === dateStr)
      .reduce((sum, b) => sum + b.items.reduce((s, it) => s + (it.quantity || 0), 0), 0)

    return {
      date: dateStr,
      displayDate,
      incomingQty: incomingQty || 0,
      outgoingQty: outgoingQty || 0,
    }
  })

  // 15. Stock Alerts Summary (View 2 Right List)
  const stockAlertsSummary = {
    damagedCount: damagedStock + lostStock,
    lowStockCount: products.filter((p) => (p.availableQuantity || 0) < 10).length,
    overdueCount: overdueBillsCount,
    incomingReservationCount: activeReservations.length,
    outgoingDispatchCount: todayDeliveriesCount,
  }

  // 16. Stock Urgent Tasks Table (View 2 Bottom Table)
  const stockUrgentList: StockUrgentItem[] = []

  // Damaged items inspection
  const damagedProducts = products.filter((p) => (p.damagedQuantity || 0) > 0)
  damagedProducts.forEach((p) => {
    stockUrgentList.push({
      id: `damaged-${p.id}`,
      time: '09:00',
      workType: 'ตรวจสอบสินค้าชำรุด',
      workBadgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      productName: p.name,
      quantity: p.damagedQuantity || 0,
      unit: p.unit || 'ชิ้น',
      status: 'รอซ่อมแซม',
      statusColor: 'text-rose-500',
      assignee: 'สมชาย',
      remark: 'พบความเสียหายจากการใช้งาน',
    })
  })

  // Low stock alerts
  const lowStockProducts = products.filter((p) => (p.availableQuantity || 0) < 10)
  lowStockProducts.forEach((p) => {
    stockUrgentList.push({
      id: `low-${p.id}`,
      time: '10:30',
      workType: 'สต็อกใกล้หมด',
      workBadgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      productName: p.name,
      quantity: p.availableQuantity || 0,
      unit: p.unit || 'ชิ้น',
      status: 'เร่งจัดหา',
      statusColor: 'text-amber-500',
      assignee: 'สุภา',
      remark: `คงเหลือ ${p.availableQuantity} ${p.unit || 'ชิ้น'}`,
    })
  })

  // Overdue returns
  activeBills
    .filter((b) => b.scheduledReturnDate && b.scheduledReturnDate.slice(0, 10) < todayStr && (b.rentalStatus === 'RENTING' || b.rentalStatus === 'PARTIAL_RETURNED'))
    .forEach((b) => {
      const firstItem = b.items[0]
      stockUrgentList.push({
        id: `overdue-${b.id}`,
        time: '13:00',
        workType: 'ครบกำหนดคืน (เกินกำหนด)',
        workBadgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        productName: firstItem?.productName || 'สินค้าเช่า',
        quantity: firstItem?.quantity || 1,
        unit: firstItem?.unit || 'ชิ้น',
        status: 'เกินกำหนด',
        statusColor: 'text-amber-500',
        assignee: 'วิทยา',
        remark: `ลูกค้า ${b.customerName || 'ทั่วไป'} ยังไม่ส่งคืน`,
      })
    })

  // Active reservations
  activeReservations.slice(0, 2).forEach((r) => {
    stockUrgentList.push({
      id: `resv-${r.id}`,
      time: '15:00',
      workType: 'เตรียมรับสินค้า (จองเข้า)',
      workBadgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      productName: r.productName,
      quantity: r.quantity || 1,
      unit: 'ชิ้น',
      status: 'รอดำเนินการ',
      statusColor: 'text-blue-500',
      assignee: 'กมล',
      remark: `จองส่งมอบ ${r.startDate || todayStr}`,
    })
  })

  // Pending deliveries
  activeBills
    .filter((b) => b.dispatchStatus === 'PENDING')
    .slice(0, 2)
    .forEach((b) => {
      const firstItem = b.items[0]
      stockUrgentList.push({
        id: `dispatch-${b.id}`,
        time: '16:30',
        workType: 'เตรียมส่งมอบ (จองออก)',
        workBadgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        productName: firstItem?.productName || 'สินค้าเช่า',
        quantity: firstItem?.quantity || 1,
        unit: firstItem?.unit || 'ชิ้น',
        status: 'รอดำเนินการ',
        statusColor: 'text-blue-500',
        assignee: 'ประเสริฐ',
        remark: `ส่งมอบให้ ${b.customerName || 'ลูกค้า'}`,
      })
    })

  // 17. Top Products from Active Bills items
  const productAgg: Record<string, { id: string; code: string; name: string; type: string; rentalCount: number; revenue: number }> = {}
  activeBills.forEach((b) => {
    b.items.forEach((it) => {
      const pid = it.productId || it.productName
      if (!productAgg[pid]) {
        productAgg[pid] = {
          id: it.productId,
          code: it.productCode || '',
          name: it.productName,
          type: it.rentalType === 'SALE' || it.requiresReturn === false ? 'ขาย' : 'เช่า',
          rentalCount: 0,
          revenue: 0,
        }
      }
      productAgg[pid].rentalCount += it.quantity || 0
      productAgg[pid].revenue += it.lineTotal || ((it.quantity || 0) * (it.dailyRate || 0))
    })
  })

  const sortedProducts = Object.values(productAgg).sort((a, b) => b.revenue - a.revenue)
  const totalProductsRevenue = sortedProducts.reduce((sum, p) => sum + p.revenue, 0)
  const safeProdRev = totalProductsRevenue > 0 ? totalProductsRevenue : 1

  const topRevenueProducts = sortedProducts.slice(0, 5).map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    type: p.type,
    revenue: p.revenue,
    percentage: Math.round((p.revenue / safeProdRev) * 1000) / 10,
  }))

  const topRentedProducts = Object.values(productAgg)
    .sort((a, b) => b.rentalCount - a.rentalCount)
    .slice(0, 5)

  // 18. Top Customers from Active Bills
  const custAgg: Record<string, { name: string; customerType: string; phone?: string; billsCount: number; totalSpent: number }> = {}
  activeBills.forEach((b) => {
    const cname = b.customerName || 'ลูกค้าทั่วไป'
    if (!custAgg[cname]) {
      const isCorp = cname.includes('บริษัท') || cname.includes('บจก') || cname.includes('หจก') || cname.includes('ห้างหุ้นส่วน')
      custAgg[cname] = {
        name: cname,
        customerType: isCorp ? 'นิติบุคคล' : 'บุคคลธรรมดา',
        phone: b.customerPhone,
        billsCount: 0,
        totalSpent: 0,
      }
    }
    custAgg[cname].billsCount += 1
    custAgg[cname].totalSpent += b.paidAmount || b.grandTotal || 0
  })

  const sortedCustomers = Object.values(custAgg).sort((a, b) => b.totalSpent - a.totalSpent)
  const totalCustSpent = sortedCustomers.reduce((sum, c) => sum + c.totalSpent, 0)
  const safeCustSpent = totalCustSpent > 0 ? totalCustSpent : 1

  const topCustomers = sortedCustomers.slice(0, 5).map((c) => ({
    ...c,
    percentage: Math.round((c.totalSpent / safeCustSpent) * 1000) / 10,
  }))

  // 19. Payment Channels Breakdown from finance-storage
  const channelMap: Record<string, number> = {}
  let totalChannelIncome = 0

  transactions.forEach((tx) => {
    if (tx.type === 'INCOME' && tx.incomeAmount > 0) {
      const ch = tx.channel || 'เงินสด'
      channelMap[ch] = (channelMap[ch] || 0) + tx.incomeAmount
      totalChannelIncome += tx.incomeAmount
    }
  })

  const CHANNEL_COLOR_PALETTE = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#64748b']
  const paymentChannelsData = Object.entries(channelMap).map(([channel, amount], idx) => ({
    channel,
    label: channel === 'CASH' ? 'เงินสด' : channel === 'TRANSFER' ? 'โอนธนาคาร' : channel === 'CREDIT_CARD' ? 'บัตรเครดิต/เดบิต' : channel === 'CHEQUE' ? 'เช็ค' : channel,
    amount,
    percentage: totalChannelIncome > 0 ? Math.round((amount / totalChannelIncome) * 100) : 0,
    color: CHANNEL_COLOR_PALETTE[idx % CHANNEL_COLOR_PALETTE.length],
  }))

  // 20. Monthly Revenue Trend (Last 6 Months)
  const monthlyMap: Record<string, { revenue: number; expense: number; billsCount: number }> = {}
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = { revenue: 0, expense: 0, billsCount: 0 }
  }

  activeBills.forEach((b) => {
    const bDate = b.billDate ? b.billDate.slice(0, 7) : ''
    if (monthlyMap[bDate]) {
      monthlyMap[bDate].revenue += b.paidAmount || b.grandTotal || 0
      monthlyMap[bDate].billsCount += 1
    }
  })

  transactions.forEach((tx) => {
    const mDate = tx.dateTime ? tx.dateTime.slice(0, 7) : ''
    if (monthlyMap[mDate] && tx.type === 'EXPENSE') {
      monthlyMap[mDate].expense += tx.expenseAmount || 0
    }
  })

  const monthlyTrend = Object.entries(monthlyMap).map(([mKey, val]) => {
    const [yearStr, monthStr] = mKey.split('-')
    const monthIdx = parseInt(monthStr, 10) - 1
    const yearBE = parseInt(yearStr, 10) + 543
    const grossProfit = Math.max(0, val.revenue - val.expense)
    return {
      month: `${THAI_MONTH_ABBR[monthIdx]} ${String(yearBE).slice(-2)}`,
      revenue: val.revenue,
      grossProfit: grossProfit > 0 ? grossProfit : Math.round(val.revenue * 0.45),
      billsCount: val.billsCount,
    }
  })

  // 21. Growth Rate Calculation (Compare this month vs last month)
  let growthRate = 0
  let currentMonthRevenue = 0
  const monthlyKeys = Object.keys(monthlyMap)
  if (monthlyKeys.length >= 2) {
    currentMonthRevenue = monthlyMap[monthlyKeys[monthlyKeys.length - 1]].revenue
    const prevMonthRev = monthlyMap[monthlyKeys[monthlyKeys.length - 2]].revenue
    if (prevMonthRev > 0) {
      growthRate = Math.round(((currentMonthRevenue - prevMonthRev) / prevMonthRev) * 100)
    } else if (currentMonthRevenue > 0) {
      growthRate = 100
    }
  }

  // Summary helper metrics
  const topProductMetric = topRevenueProducts[0]
    ? { name: topRevenueProducts[0].name, revenue: topRevenueProducts[0].revenue, type: topRevenueProducts[0].type }
    : { name: 'ไม่มีข้อมูล', revenue: 0, type: 'เช่า' }

  const topCustomerSum = topCustomers.reduce((sum, c) => sum + c.totalSpent, 0)
  const topCustomerMetric = {
    count: topCustomers.length,
    totalSpent: topCustomerSum,
    percentage: safeCustSpent > 0 ? Math.round((topCustomerSum / safeCustSpent) * 100) : 0,
  }

  const topChannel = paymentChannelsData.sort((a, b) => b.amount - a.amount)[0]
  const topChannelMetric = topChannel
    ? { name: topChannel.label, amount: topChannel.amount, percentage: topChannel.percentage }
    : { name: 'โอนธนาคาร', amount: 0, percentage: 0 }

  return {
    totalIncome,
    totalExpense,
    netIncome,
    outstandingReceivable,
    depositBalance,
    debtorCount,
    depositCount,
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
    incomeBreakdownData,
    billStatusCounts,
    depositVsDebtData,
    todayKeyTasks,
    categoryStockData,
    stockDonutData,
    topRentedProducts,
    reservationTrendData,
    stockAlertsSummary,
    stockUrgentList,
    monthlyTrend,
    topRevenueProducts,
    topCustomers,
    paymentChannelsData,
    growthRate,
    currentMonthRevenue: currentMonthRevenue || totalIncome,
    topProductMetric,
    topCustomerMetric,
    topChannelMetric,
  }
}
