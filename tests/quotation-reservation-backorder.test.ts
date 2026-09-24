import { insertStockMovementToSupabase } from '@/lib/repositories/product-repository'
vi.mock('@/lib/repositories/product-repository', async (importOriginal) => {
  const actual = await importOriginal() as any
  return { ...actual, insertStockMovementToSupabase: vi.fn(async () => {}), fetchProductsFromSupabase: vi.fn(() => new Promise(() => {})) }
})
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadProducts,
  saveProducts,
  getProductAvailability,
  updateProductMaster,
  applyStockCountAdjustment,
} from '../lib/product-storage'
import {
  loadBills,
} from '../lib/bill-storage'
import {
  loadQuotations,
  saveQuotations,
  addQuotation,
  confirmQuotationWorkflow,
  cancelQuotationWorkflow,
  getQuotationById,
} from '../lib/quotation-storage'
import {
  loadReservations,
  saveReservations,
  getPeakReservedQuantity,
  getActiveReservationsInRange,
} from '../lib/reservation-storage'
import {
  loadBackorders,
  saveBackorders,
  getPendingBackordersForProduct,
} from '../lib/backorder-storage'
import {
  loadNotifications,
  saveNotifications,
  checkBackordersOnStockIncrease,
} from '../lib/notification-storage'
import {
  createBillWorkflow,
  dispatchBillWorkflow,
  cancelOrVoidBillWorkflow,
  fulfillBackorderWorkflow,
} from '../lib/bill-workflow-service'
import { loadAuditLogs } from '../lib/audit-storage'
import { Product, Quotation } from '../lib/types/rental-pos'
import { FullBill, FullBillItem } from '../lib/types/rental-return'

function buildFullBillItem(
  overrides: Partial<FullBillItem> & { productId: string; productName: string; quantity: number }
): FullBillItem {
  const { productId, productName, quantity, ...rest } = overrides
  return {
    rentalBillItemId: rest.rentalBillItemId || `rbi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    productCode: rest.productCode || productId,
    returnedQty: rest.returnedQty || 0,
    outstandingQty: rest.outstandingQty !== undefined ? rest.outstandingQty : quantity,
    dailyRate: rest.dailyRate || 50,
    unit: rest.unit || 'ชุด',
    defaultRepairFee: rest.defaultRepairFee || 0,
    defaultReplacementFee: rest.defaultReplacementFee || 0,
    requiresReturn: rest.requiresReturn !== undefined ? rest.requiresReturn : true,
    rentalStartDate: rest.rentalStartDate || '2026-09-15',
    scheduledReturnDate: rest.scheduledReturnDate || '2026-09-20',
    rentalType: rest.rentalType || 'NORMAL',
    lineTotal: rest.lineTotal || 500,
    status: rest.status || 'RENTING',
    ...rest,
    productId,
    productName,
    quantity,
  }
}

function buildFullBill(
  overrides: Partial<FullBill> & { id: string; billNo: string; items: FullBillItem[] }
): FullBill {
  const { id, billNo, items, ...rest } = overrides
  return {
    id,
    billNo,
    billDate: rest.billDate || '2026-09-12',
    customerName: rest.customerName || 'ลูกค้าทดสอบ',
    customerPhone: rest.customerPhone || '0812345678',
    rentalStartDate: rest.rentalStartDate || '2026-09-15',
    scheduledReturnDate: rest.scheduledReturnDate || '2026-09-20',
    heldDepositAmount: rest.heldDepositAmount || 0,
    paidDepositAmount: rest.paidDepositAmount || 0,
    deposits: rest.deposits || [],
    grandTotal: rest.grandTotal || 1000,
    paidAmount: rest.paidAmount || 1000,
    outstandingAmount: rest.outstandingAmount || 0,
    rentalStatus: rest.rentalStatus || 'RENTING',
    paymentStatus: rest.paymentStatus || 'PAID',
    dispatchStatus: rest.dispatchStatus || 'PENDING',
    items,
    ...rest,
  }
}

// In-memory localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})
Object.defineProperty(globalThis, 'window', {
  value: globalThis,
  writable: true,
})

describe('Quotation -> POS/Bill -> Reservation -> Dispatch -> Backorder -> Notification Integration Test Suite', () => {
  const actor = {
    userId: 'user-manager-01',
    displayName: 'ผู้จัดการสาขา',
  }

  const testProductRent: Product = {
    id: 'prod-scaffold-01',
    code: 'SCF-001',
    name: 'นั่งร้าน 1.70ม.',
    category: 'นั่งร้าน',
    unit: 'ชุด',
    rentalType: 'NORMAL',
    normalPrice: 50,
    dailyPrice: 50,
    salePrice: 1500,
    totalQuantity: 10,
    availableQuantity: 10,
    rentedQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    reservedQuantity: 0,
    minimumStock: 2,
    status: 'ACTIVE',
    defaultDamageFee: 200,
    defaultLossFee: 1500,
  }

  const testProductSale: Product = {
    id: 'prod-hardware-02',
    code: 'NUT-001',
    name: 'น็อตยึดนั่งร้าน',
    category: 'อุปกรณ์เสริม',
    unit: 'ตัว',
    rentalType: 'SALE',
    normalPrice: 0,
    dailyPrice: 0,
    salePrice: 25,
    totalQuantity: 50,
    availableQuantity: 50,
    rentedQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    reservedQuantity: 0,
    minimumStock: 10,
    status: 'ACTIVE',
    defaultDamageFee: 0,
    defaultLossFee: 0,
  }

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    saveProducts([
      JSON.parse(JSON.stringify(testProductRent)),
      JSON.parse(JSON.stringify(testProductSale)),
    ])
    saveQuotations([])
    saveReservations([])
    saveBackorders([])
    saveNotifications([])
  })

  // 1. Save Quotation -> Refresh -> still present
  it('1. Save Quotation -> Refresh -> still present in persistence without data loss', async () => {
    const quotation: Quotation = {
      id: 'qt-2026-001',
      quotationNo: 'QT-20260912-0001',
      quotationDate: '2026-09-12',
      expiryDate: '2026-09-27',
      customerId: 'cust-01',
      customerName: 'บริษัท คอนสตรัคชั่น จำกัด',
      phone: '0811112222',
      customerAddress: 'กทม.',
      rentalStartDate: '2026-09-20',
      rentalEndDate: '2026-09-25',
      items: [
        {
          id: 'qti-1',
          productId: testProductRent.id,
          productName: testProductRent.name,
          rentalType: 'NORMAL',
          quantity: 5,
          unitName: 'ชุด',
          unitPrice: 50,
          usageCountOrDays: 5,
          lineTotal: 1250,
        },
      ],
      subtotal: 1250,
      discountAmount: 0,
      shippingFee: 200,
      depositAmount: 500,
      taxAmount: 0,
      grandTotal: 1950,
      status: 'WAITING',
    }

    addQuotation(quotation)

    // Simulate reloading fresh from storage
    const reloaded = loadQuotations()
    expect(reloaded.length).toBe(1)
    expect(reloaded[0].id).toBe('qt-2026-001')
    expect(reloaded[0].quotationNo).toBe('QT-20260912-0001')
    expect(reloaded[0].items[0].quantity).toBe(5)
    expect(reloaded[0].items[0].unitPrice).toBe(50)
  })

  // 2. Quotation before Confirm -> Stock does not change
  it('2. Quotation before Confirm (DRAFT/WAITING) -> Stock does NOT change, no reservations or finance', async () => {
    const quote: Quotation = {
      id: 'qt-2026-002',
      quotationNo: 'QT-20260912-0002',
      quotationDate: '2026-09-12',
      expiryDate: '2026-09-27',
      customerId: 'cust-02',
      customerName: 'นายมานะ ตั้งใจ',
      rentalStartDate: '2026-09-20',
      rentalEndDate: '2026-09-25',
      items: [
        {
          id: 'qti-2',
          productId: testProductRent.id,
          productName: testProductRent.name,
          rentalType: 'NORMAL',
          quantity: 8,
          unitName: 'ชุด',
          unitPrice: 50,
          usageCountOrDays: 5,
          lineTotal: 2000,
        },
      ],
      subtotal: 2000,
      discountAmount: 0,
      shippingFee: 0,
      depositAmount: 0,
      taxAmount: 0,
      grandTotal: 2000,
      status: 'WAITING',
    }

    addQuotation(quote)

    // Stock must be completely untouched
    const prod = loadProducts().find((p) => p.id === testProductRent.id)!
    expect(prod.totalQuantity).toBe(10)
    expect(prod.availableQuantity).toBe(10)
    expect(prod.rentedQuantity).toBe(0)
    expect(prod.reservedQuantity || 0).toBe(0)

    // Zero reservations exist
    const reservations = loadReservations()
    expect(reservations.length).toBe(0)
  })

  // 3. Confirm RENT -> Reserved increases, Rented does NOT increase
  it('3. Confirm RENT Quotation (0 reservations) -> Bill Creation reserves stock (Confirm ≠ Dispatch)', async () => {
    const quote: Quotation = {
      id: 'qt-2026-003',
      quotationNo: 'QT-20260912-0003',
      quotationDate: '2026-09-12',
      expiryDate: '2026-09-27',
      customerId: 'cust-03',
      customerName: 'นายสมบัติ เจริญ',
      rentalStartDate: '2026-09-20',
      rentalEndDate: '2026-09-25',
      items: [
        {
          id: 'qti-3',
          productId: testProductRent.id,
          productName: testProductRent.name,
          rentalType: 'NORMAL',
          quantity: 4,
          unitName: 'ชุด',
          unitPrice: 50,
          usageCountOrDays: 5,
          lineTotal: 1000,
        },
      ],
      subtotal: 1000,
      discountAmount: 0,
      shippingFee: 0,
      depositAmount: 0,
      taxAmount: 0,
      grandTotal: 1000,
      status: 'WAITING',
    }
    addQuotation(quote)

    // Invariant 13 & 14: Confirm Quotation -> Status ACCEPTED, 0 reservations, 0 backorders
    const confirmRes = confirmQuotationWorkflow(quote.id, actor)
    expect(confirmRes.quotation.status).toBe('ACCEPTED')
    expect(confirmRes.reservations.length).toBe(0)
    expect(confirmRes.backorders.length).toBe(0)

    let prod = loadProducts().find((p) => p.id === testProductRent.id)!
    expect(prod.rentedQuantity).toBe(0)
    expect(prod.reservedQuantity || 0).toBe(0)

    // Invariant 15 & 16: Convert quotation to Bill -> complete data transferred, reservations created
    const bill: FullBill = buildFullBill({
      id: 'bill-from-qt-003',
      billNo: 'BILL-20260912-0003',
      quotationId: quote.id,
      quotationNo: quote.quotationNo,
      customerName: quote.customerName,
      customerPhone: '0812345678',
      rentalStartDate: quote.rentalStartDate,
      scheduledReturnDate: quote.rentalEndDate,
      dispatchStatus: 'PENDING',
      rentalStatus: 'CONFIRMED',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-3',
          productId: testProductRent.id,
          productCode: testProductRent.code,
          productName: testProductRent.name,
          quantity: 4,
          rentalStartDate: quote.rentalStartDate,
          scheduledReturnDate: quote.rentalEndDate,
        }),
      ],
    })

    const billResult = createBillWorkflow({ bill, actor })
    expect(billResult.bill.rentalStatus).toBe('CONFIRMED')
    expect(billResult.reservations?.length).toBe(1)
    expect(billResult.reservations?.[0].quantity).toBe(4)

    prod = loadProducts().find((p) => p.id === testProductRent.id)!
    expect(prod.rentedQuantity).toBe(0)
    expect(prod.reservedQuantity).toBe(4)

    // Dated availability for this range is 10 - 4 = 6
    const avail = getProductAvailability(testProductRent.id, '2026-09-20', '2026-09-25')
    expect(avail.availableForRange).toBe(6)
  })

  // 4. Dispatch RENT -> Reserved decreases, Rented increases
  it('4. Dispatch RENT -> Reserved decreases, Rented increases', async () => {
    // Create bill with dispatchStatus = PENDING
    const bill: FullBill = buildFullBill({
      id: 'bill-rent-004',
      billNo: 'BILL-20260912-0004',
      customerName: 'นางสาววิภา สุขใจ',
      rentalStartDate: '2026-09-15',
      scheduledReturnDate: '2026-09-20',
      grandTotal: 1000,
      paidAmount: 1000,
      dispatchStatus: 'PENDING',
      rentalStatus: 'RENTING',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-4',
          productId: testProductRent.id,
          productCode: testProductRent.code,
          productName: testProductRent.name,
          quantity: 6,
          returnedQty: 0,
          outstandingQty: 6,
          dailyRate: 50,
          unit: 'ชุด',
          requiresReturn: true,
          rentalStartDate: '2026-09-15',
          scheduledReturnDate: '2026-09-20',
          rentalType: 'NORMAL',
          lineTotal: 1000,
          status: 'RENTING',
        }),
      ],
    })

    createBillWorkflow({ bill, actor })

    let prod = loadProducts().find((p) => p.id === testProductRent.id)!
    expect(prod.reservedQuantity).toBe(6)
    expect(prod.rentedQuantity).toBe(0)

    // Now Dispatch the bill
    const dispatchRes = await dispatchBillWorkflow({ billId: bill.id, actor })
    expect(dispatchRes.bill.dispatchStatus).toBe('DISPATCHED')

    prod = loadProducts().find((p) => p.id === testProductRent.id)!
    expect(prod.reservedQuantity).toBe(0)
    expect(prod.rentedQuantity).toBe(6)
    expect(prod.availableQuantity).toBe(4)
  })

  // 5. Confirm SALE -> Reserved increases, Stock not permanently sold yet
  it('5. Confirm SALE -> Stock is reserved, totalQuantity NOT permanently deducted before dispatch', async () => {
    const bill: FullBill = buildFullBill({
      id: 'bill-sale-005',
      billNo: 'BILL-20260912-0005',
      customerName: 'นายประสิทธิ์ การช่าง',
      rentalStartDate: '2026-09-12',
      scheduledReturnDate: '2026-09-12',
      grandTotal: 250,
      paidAmount: 250,
      dispatchStatus: 'PENDING',
      rentalStatus: 'CLOSED',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-5',
          productId: testProductSale.id,
          productCode: testProductSale.code,
          productName: testProductSale.name,
          quantity: 10,
          returnedQty: 0,
          outstandingQty: 0,
          dailyRate: 25,
          unit: 'ตัว',
          requiresReturn: false,
          rentalStartDate: '2026-09-12',
          scheduledReturnDate: '2026-09-12',
          rentalType: 'SALE',
          lineTotal: 250,
          status: 'COMPLETED',
        }),
      ],
    })

    createBillWorkflow({ bill, actor })

    const prod = loadProducts().find((p) => p.id === testProductSale.id)!
    // Confirm SALE before dispatch: totalQuantity must still be 50!
    expect(prod.totalQuantity).toBe(50)
    expect(prod.reservedQuantity).toBe(10)
  })

  // 6. Dispatch SALE -> Reserved decreases, Stock permanently deducted
  it('6. Dispatch SALE -> Reserved decreases, totalQuantity permanently deducted', async () => {
    const bill: FullBill = buildFullBill({
      id: 'bill-sale-006',
      billNo: 'BILL-20260912-0006',
      customerName: 'นายประสิทธิ์ การช่าง',
      rentalStartDate: '2026-09-12',
      scheduledReturnDate: '2026-09-12',
      grandTotal: 250,
      paidAmount: 250,
      dispatchStatus: 'PENDING',
      rentalStatus: 'CLOSED',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-6',
          productId: testProductSale.id,
          productCode: testProductSale.code,
          productName: testProductSale.name,
          quantity: 10,
          returnedQty: 0,
          outstandingQty: 0,
          dailyRate: 25,
          unit: 'ตัว',
          requiresReturn: false,
          rentalStartDate: '2026-09-12',
          scheduledReturnDate: '2026-09-12',
          rentalType: 'SALE',
          lineTotal: 250,
          status: 'COMPLETED',
        }),
      ],
    })
    createBillWorkflow({ bill, actor })

    await dispatchBillWorkflow({ billId: bill.id, actor })

    const prod = loadProducts().find((p) => p.id === testProductSale.id)!
    expect(prod.reservedQuantity).toBe(0)
    expect(prod.totalQuantity).toBe(40) // 50 - 10 = 40 permanently deducted
    expect(prod.availableQuantity).toBe(40)
  })

  // 7. RENT non-overlapping dates -> both can reserve
  it('7. RENT non-overlapping dates -> both orders can reserve full physical stock', async () => {
    // Total physical stock is 10
    // Order 1: 10 units for 2026-10-01 to 2026-10-05
    const b1: FullBill = buildFullBill({
      id: 'bill-overlap-1',
      billNo: 'BILL-OCT-01',
      customerName: 'ลูกค้ารอบที่ 1',
      rentalStartDate: '2026-10-01',
      scheduledReturnDate: '2026-10-05',
      dispatchStatus: 'PENDING',
      rentalStatus: 'CONFIRMED',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-oct-1',
          productId: testProductRent.id,
          productName: testProductRent.name,
          quantity: 10,
          rentalStartDate: '2026-10-01',
          scheduledReturnDate: '2026-10-05',
        }),
      ],
    })
    const res1 = createBillWorkflow({ bill: b1, actor })
    expect(res1.reservations?.length).toBe(1)
    expect(res1.reservations?.[0].quantity).toBe(10)
    expect(res1.backorders?.length || 0).toBe(0)

    // Order 2: 10 units for 2026-10-10 to 2026-10-15 (Non-overlapping with Order 1!)
    const b2: FullBill = buildFullBill({
      id: 'bill-overlap-2',
      billNo: 'BILL-OCT-02',
      customerName: 'ลูกค้ารอบที่ 2',
      rentalStartDate: '2026-10-10',
      scheduledReturnDate: '2026-10-15',
      dispatchStatus: 'PENDING',
      rentalStatus: 'CONFIRMED',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-oct-2',
          productId: testProductRent.id,
          productName: testProductRent.name,
          quantity: 10,
          rentalStartDate: '2026-10-10',
          scheduledReturnDate: '2026-10-15',
        }),
      ],
    })
    const res2 = createBillWorkflow({ bill: b2, actor })
    // Non-overlapping date range allows reserving full physical stock for both!
    expect(res2.reservations?.length).toBe(1)
    expect(res2.reservations?.[0].quantity).toBe(10)
    expect(res2.backorders?.length || 0).toBe(0)
  })

  // 8. RENT overlapping dates with insufficient stock -> Backorder
  it('8. RENT overlapping dates with insufficient stock -> splits into Reservation and Backorder', async () => {
    // Total stock = 10
    // Order 1: 8 units from 2026-10-01 to 2026-10-06
    const b1: FullBill = buildFullBill({
      id: 'bill-overlap-a',
      billNo: 'BILL-OCT-A',
      customerName: 'ลูกค้ารายแรก',
      rentalStartDate: '2026-10-01',
      scheduledReturnDate: '2026-10-06',
      dispatchStatus: 'PENDING',
      rentalStatus: 'CONFIRMED',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-oct-a',
          productId: testProductRent.id,
          productName: testProductRent.name,
          quantity: 8,
          rentalStartDate: '2026-10-01',
          scheduledReturnDate: '2026-10-06',
        }),
      ],
    })
    createBillWorkflow({ bill: b1, actor })

    // Order 2: 5 units from 2026-10-03 to 2026-10-08 (Overlaps Order 1!)
    // Overlapping available is 10 - 8 = 2
    const b2: FullBill = buildFullBill({
      id: 'bill-overlap-b',
      billNo: 'BILL-OCT-B',
      customerName: 'ลูกค้ารายที่สอง',
      rentalStartDate: '2026-10-03',
      scheduledReturnDate: '2026-10-08',
      dispatchStatus: 'PENDING',
      rentalStatus: 'CONFIRMED',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-oct-b',
          productId: testProductRent.id,
          productName: testProductRent.name,
          quantity: 5,
          rentalStartDate: '2026-10-03',
          scheduledReturnDate: '2026-10-08',
        }),
      ],
    })
    const res2 = createBillWorkflow({ bill: b2, actor })

    // Available for range was 2 -> Reserved 2, Backorder 3
    expect(res2.reservations?.length).toBe(1)
    expect(res2.reservations?.[0].quantity).toBe(2)
    expect(res2.backorders?.length).toBe(1)
    expect(res2.backorders?.[0].requestedQty).toBe(5)
    expect(res2.backorders?.[0].outstandingQty).toBe(3)
  })

  // 9. Request 8 have 5 -> Reserve 5, Backorder 3, Stock not negative
  it('9. Request 8 have 5 -> Reserve 5, Backorder 3, available stock is never negative', async () => {
    // Set initial stock to 5
    saveProducts([
      {
        ...testProductRent,
        totalQuantity: 5,
        availableQuantity: 5,
      },
    ])

    const b: FullBill = buildFullBill({
      id: 'bill-split-009',
      billNo: 'BILL-SPLIT-009',
      customerName: 'ลูกค้าสั่งเกินสต็อก',
      rentalStartDate: '2026-09-15',
      scheduledReturnDate: '2026-09-20',
      dispatchStatus: 'PENDING',
      rentalStatus: 'CONFIRMED',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-split-9',
          productId: testProductRent.id,
          productName: testProductRent.name,
          quantity: 8,
          rentalStartDate: '2026-09-15',
          scheduledReturnDate: '2026-09-20',
        }),
      ],
    })

    const result = createBillWorkflow({ bill: b, actor })
    expect(result.reservations?.[0].quantity).toBe(5)
    expect(result.backorders?.[0].outstandingQty).toBe(3)

    // Check invariants
    const avail = getProductAvailability(testProductRent.id, '2026-09-15', '2026-09-20')
    expect(avail.availableForRange).toBe(0) // Exactly 0, NEVER negative!
    expect(avail.available).toBeGreaterThanOrEqual(0)
  })

  // 10. Stock in -> Backorder detected and Actionable Notification created
  it('10. Stock increase -> FIFO pending Backorder detected and Actionable Notification created without auto-allocation', async () => {
    // Setup pending backorder of 3 units
    saveProducts([
      {
        ...testProductRent,
        totalQuantity: 0,
        availableQuantity: 0,
      },
    ])

    const b: FullBill = buildFullBill({
      id: 'bill-bo-10',
      billNo: 'BILL-BO-010',
      customerName: 'คุณสมชาย รอของ',
      rentalStartDate: '2026-09-15',
      scheduledReturnDate: '2026-09-20',
      dispatchStatus: 'PENDING',
      rentalStatus: 'CONFIRMED',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-bo-10',
          productId: testProductRent.id,
          productName: testProductRent.name,
          quantity: 3,
          rentalStartDate: '2026-09-15',
          scheduledReturnDate: '2026-09-20',
        }),
      ],
    })

    const confRes = createBillWorkflow({ bill: b, actor })
    const boId = confRes.backorders?.[0].id!
    expect(confRes.backorders?.[0].outstandingQty).toBe(3)

    // Stock increase: new physical stock arrives (count adjustment adds 5 units)
    applyStockCountAdjustment(
      testProductRent.id,
      { normalQty: 5 },
      'รับสินค้าล็อตใหม่เข้าคลัง',
      actor
    )

    // Notification created
    const notifications = loadNotifications()
    expect(notifications.length).toBe(1)
    expect(notifications[0].type).toBe('BACKORDER_READY')
    expect(notifications[0].data.backorderId).toBe(boId)
    expect(notifications[0].data.readyQty).toBe(3)
    expect(notifications[0].data.customerName).toBe('คุณสมชาย รอของ')

    // INVARIANT: Stock is NOT auto-allocated! Backorder outstanding is STILL 3 until user confirms
    const pendingBos = getPendingBackordersForProduct(testProductRent.id)
    expect(pendingBos[0].outstandingQty).toBe(3)
    expect(pendingBos[0].status).toBe('READY')
  })

  // 11. User confirms Fulfill -> Backorder decreases, Reservation increases
  it('11. User explicitly confirms Fulfill -> Backorder decreases, Reservation increases, notification ACTIONED', async () => {
    saveProducts([
      {
        ...testProductRent,
        totalQuantity: 0,
        availableQuantity: 0,
      },
    ])

    const b: FullBill = buildFullBill({
      id: 'bill-bo-11',
      billNo: 'BILL-BO-011',
      customerName: 'คุณสมชาย รอของ',
      rentalStartDate: '2026-09-15',
      scheduledReturnDate: '2026-09-20',
      dispatchStatus: 'PENDING',
      rentalStatus: 'CONFIRMED',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-bo-11',
          productId: testProductRent.id,
          productName: testProductRent.name,
          quantity: 3,
          rentalStartDate: '2026-09-15',
          scheduledReturnDate: '2026-09-20',
        }),
      ],
    })

    const confRes = createBillWorkflow({ bill: b, actor })
    const boId = confRes.backorders?.[0].id!

    // Restock 5
    applyStockCountAdjustment(testProductRent.id, { normalQty: 5 }, 'เติมสต็อก', actor)

    const notifs = loadNotifications()
    const notifId = notifs[0].id

    // User explicitly confirms fulfillment
    const fulfillRes = fulfillBackorderWorkflow({
      backorderId: boId,
      notificationId: notifId,
      allocatedQty: 3,
      actor,
    })

    expect(fulfillRes.fulfilledBackorder!.outstandingQty).toBe(0)
    expect(fulfillRes.fulfilledBackorder!.status).toBe('FULFILLED')
    expect(fulfillRes.newReservation!.quantity).toBe(3)
    expect(fulfillRes.newReservation!.status).toBe('ACTIVE')

    // Notification marked ACTIONED
    const updatedNotifs = loadNotifications()
    expect(updatedNotifs.find((n) => n.id === notifId)?.status).toBe('ACTIONED')

    // Product reserved stock is synchronized
    const prod = loadProducts().find((p) => p.id === testProductRent.id)!
    expect(prod.reservedQuantity).toBe(3)
  })

  // 12. Cancel before Dispatch -> Reservation released
  it('12. Cancel before Dispatch -> Reservation released, history preserved', async () => {
    const bill: FullBill = buildFullBill({
      id: 'bill-cancel-12',
      billNo: 'BILL-CANCEL-012',
      customerName: 'นายเปลี่ยนใจ ไม่เอา',
      rentalStartDate: '2026-09-20',
      scheduledReturnDate: '2026-09-25',
      dispatchStatus: 'PENDING',
      rentalStatus: 'CONFIRMED',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-cancel-12',
          productId: testProductRent.id,
          productName: testProductRent.name,
          quantity: 4,
          rentalStartDate: '2026-09-20',
          scheduledReturnDate: '2026-09-25',
        }),
      ],
    })

    createBillWorkflow({ bill, actor })
    let prod = loadProducts().find((p) => p.id === testProductRent.id)!
    expect(prod.reservedQuantity).toBe(4)

    // Cancel bill before dispatch
    const cancelRes = cancelOrVoidBillWorkflow({
      billId: bill.id,
      reason: 'ลูกค้าแจ้งยกเลิกงานก่อสร้าง',
      actor,
    })
    expect(cancelRes.bill.rentalStatus).toBe('CANCELLED')
    expect(cancelRes.releasedReservations![0].status).toBe('RELEASED')
    expect(cancelRes.releasedReservations![0].releaseReason).toBe('ลูกค้าแจ้งยกเลิกงานก่อสร้าง')

    // Reserved stock back to 0
    prod = loadProducts().find((p) => p.id === testProductRent.id)!
    expect(prod.reservedQuantity).toBe(0)
  })

  // 13. Void after Dispatch -> Stock not returned to available
  it('13. Void after Dispatch -> Stock is NOT returned to available (must go through return inspection)', async () => {
    const bill: FullBill = buildFullBill({
      id: 'bill-void-13',
      billNo: 'BILL-20260912-0013',
      customerName: 'นายสุเทพ รุ่งเรือง',
      rentalStartDate: '2026-09-12',
      scheduledReturnDate: '2026-09-15',
      grandTotal: 500,
      paidAmount: 500,
      dispatchStatus: 'DISPATCHED', // Already physically with customer!
      rentalStatus: 'RENTING',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-13',
          productId: testProductRent.id,
          productCode: testProductRent.code,
          productName: testProductRent.name,
          quantity: 4,
          returnedQty: 0,
          outstandingQty: 4,
          dailyRate: 50,
          unit: 'ชุด',
          requiresReturn: true,
          rentalStartDate: '2026-09-12',
          scheduledReturnDate: '2026-09-15',
          rentalType: 'NORMAL',
          lineTotal: 500,
          status: 'RENTING',
        }),
      ],
    })
    createBillWorkflow({ bill, actor })

    let prod = loadProducts().find((p) => p.id === testProductRent.id)!
    expect(prod.availableQuantity).toBe(6) // 10 - 4 = 6
    expect(prod.rentedQuantity).toBe(4)

    // Void the bill
    cancelOrVoidBillWorkflow({
      billId: bill.id,
      reason: 'บิลผิดพลาด โมฆะบิล',
      actor,
      actionType: 'VOID',
    })

    // INVARIANT: Dispatched stock does NOT magically return to available!
    prod = loadProducts().find((p) => p.id === testProductRent.id)!
    expect(prod.availableQuantity).toBe(6) // Still 6!
    expect(prod.rentedQuantity).toBe(4)    // Still 4 with customer until Return inspection
  })

  // 14. Edit Product name/price -> Stock quantities unchanged
  it('14. Edit Product name, price, category, unit -> Stock quantities are strictly preserved', async () => {
    // Current stock: total 10, available 6, rented 4, reserved 2
    saveProducts([
      {
        ...testProductRent,
        totalQuantity: 10,
        availableQuantity: 6,
        rentedQuantity: 4,
        reservedQuantity: 2,
        damagedQuantity: 0,
        lostQuantity: 0,
      },
    ])

    // Edit product master attributes
    const updatedMaster: Product = {
      ...testProductRent,
      name: 'นั่งร้าน 1.70ม. (เกรด A พิเศษ)',
      normalPrice: 75,
      unit: 'โครง',
      category: 'นั่งร้านเหล็กหนา',
      // Attemped change or form defaults:
      totalQuantity: 999,
      availableQuantity: 999,
    }

    updateProductMaster(updatedMaster, actor)

    const saved = loadProducts().find((p) => p.id === testProductRent.id)!
    expect(saved.name).toBe('นั่งร้าน 1.70ม. (เกรด A พิเศษ)')
    expect(saved.normalPrice).toBe(75)
    expect(saved.unit).toBe('โครง')
    expect(saved.category).toBe('นั่งร้านเหล็กหนา')
    // Crucial: Stock counts must NEVER be overwritten by master edit!
    expect(saved.totalQuantity).toBe(10)
    expect(saved.availableQuantity).toBe(6)
    expect(saved.rentedQuantity).toBe(4)
    expect(saved.reservedQuantity).toBe(2)
  })

  // 15. Stock Count -> Persists with before/after/reason/Audit
  it('15. Stock Count -> Persists actual counts, calculates totals, and logs before/after audit with reason', async () => {
    applyStockCountAdjustment(
      testProductRent.id,
      {
        normalQty: 8,
        damagedQty: 1,
        lostQty: 1,
      },
      'ตรวจนับสต็อกสิ้นเดือน กันยายน',
      actor
    )

    const prod = loadProducts().find((p) => p.id === testProductRent.id)!
    expect(prod.availableQuantity).toBe(8)
    expect(prod.damagedQuantity).toBe(1)
    expect(prod.lostQuantity).toBe(1)
    expect(prod.totalQuantity).toBe(10) // 8 normal + 1 damaged + 1 lost = 10

    // Verify audit log entry
    const auditLogs = loadAuditLogs()
    const countAudit = auditLogs.find((l) => l.action === 'STOCK_COUNT_ADJUSTMENT' && l.entityId === testProductRent.id)
    expect(countAudit).toBeDefined()
    expect(countAudit?.reason).toBe('ตรวจนับสต็อกสิ้นเดือน กันยายน')
    expect((countAudit?.before as any)?.availableQuantity).toBe(10)
    expect((countAudit?.after as any)?.availableQuantity).toBe(8)
    expect((countAudit?.after as any)?.damagedQuantity).toBe(1)
  })

  // 16. Refresh -> Bill, Reservation, Backorder, Notification, Stock consistent
  it('16. Reload simulation: Bill, Reservation, Backorder, Notification, Stock are consistent', async () => {
    // Available = 3
    saveProducts([{ ...testProductRent, totalQuantity: 3, availableQuantity: 3 }])

    const bill: FullBill = buildFullBill({
      id: 'bill-rel-16',
      billNo: 'BILL-REL-016',
      customerName: 'บริษัท ทดสอบ สตอเรจ',
      rentalStartDate: '2026-09-20',
      scheduledReturnDate: '2026-09-25',
      dispatchStatus: 'PENDING',
      rentalStatus: 'CONFIRMED',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-rel-16',
          productId: testProductRent.id,
          productName: testProductRent.name,
          quantity: 5,
          rentalStartDate: '2026-09-20',
          scheduledReturnDate: '2026-09-25',
        }),
      ],
    })

    createBillWorkflow({ bill, actor })

    // Reload from storage
    const reloadedBills = loadBills()
    const reloadedResvs = loadReservations()
    const reloadedBos = loadBackorders()
    const reloadedProds = loadProducts()

    expect(reloadedBills.find((b) => b.id === 'bill-rel-16')?.rentalStatus).toBe('CONFIRMED')
    expect(reloadedResvs.some((r) => r.sourceId === 'bill-rel-16' && r.quantity === 3)).toBe(true)
    expect(reloadedBos.some((b) => b.sourceId === 'bill-rel-16' && b.outstandingQty === 2)).toBe(true)
    const prod = reloadedProds.find((p) => p.id === testProductRent.id)!
    expect(prod.reservedQuantity).toBe(3)
  })

  // 17. Audit correlation across Confirm -> Reserve -> Dispatch
  it('17. Shared correlationId links Confirm, Reservation, Dispatch, and Stock audit entries', async () => {
    const bill: FullBill = buildFullBill({
      id: 'bill-audit-17',
      billNo: 'BILL-20260912-0017',
      customerName: 'นายธนา วงศ์สวัสดิ์',
      rentalStartDate: '2026-09-15',
      scheduledReturnDate: '2026-09-20',
      grandTotal: 500,
      paidAmount: 500,
      dispatchStatus: 'PENDING',
      rentalStatus: 'RENTING',
      items: [
        buildFullBillItem({
          rentalBillItemId: 'rbi-17',
          productId: testProductRent.id,
          productCode: testProductRent.code,
          productName: testProductRent.name,
          quantity: 5,
          returnedQty: 0,
          outstandingQty: 5,
          dailyRate: 50,
          unit: 'ชุด',
          requiresReturn: true,
          rentalStartDate: '2026-09-15',
          scheduledReturnDate: '2026-09-20',
          rentalType: 'NORMAL',
          lineTotal: 500,
          status: 'RENTING',
        }),
      ],
    })

    // Create bill (Pending)
    const createRes = createBillWorkflow({ bill, actor })
    const sharedCorrelationId = createRes.correlationId

    // Dispatch bill
    await dispatchBillWorkflow({
      billId: bill.id,
      actor,
      correlationId: sharedCorrelationId,
    })

    // Inspect audit logs for sharedCorrelationId
    const matchingAudits = loadAuditLogs().filter((l) => l.correlationId === sharedCorrelationId)
    const actions = matchingAudits.map((l) => l.action)

    expect(actions).toContain('BILL_CREATE')
    expect(actions).toContain('STOCK_RESERVE')
    expect(actions).toContain('BILL_DISPATCH')
    expect(actions).toContain('STOCK_RENT')
  })
})


