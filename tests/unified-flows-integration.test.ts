import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadProducts,
  saveProducts,
  getProductAvailability,
} from '../lib/product-storage'
import {
  loadQuotations,
  saveQuotations,
  addQuotation,
  confirmQuotationWorkflow,
  mapQuotationToPos,
  getQuotationById,
} from '../lib/quotation-storage'
import {
  loadReservations,
  saveReservations,
  createReservation,
} from '../lib/reservation-storage'
import {
  loadBackorders,
  saveBackorders,
  createBackorder,
} from '../lib/backorder-storage'
import {
  loadNotifications,
  saveNotifications,
  checkBackordersOnStockIncrease,
} from '../lib/notification-storage'
import {
  createBillWorkflow,
  saveDraftBillWorkflow,
  confirmDraftBillWorkflow,
  checkAndExpireReservations,
  fulfillBackorderWorkflow,
} from '../lib/bill-workflow-service'
import {
  loadBills,
  saveBills,
  deleteBill,
  canHardDeleteBill,
  FullBill,
  FullBillItem,
} from '../lib/bill-storage'
import {
  loadSystemSettings,
  saveSystemSettings,
  resetSystemSettings,
} from '../lib/settings-storage'
import {
  calculateBillTotals,
  roundMoney,
  evaluateLateReturn,
} from '../lib/calculation-service'
import { loadAuditLogs, generateCorrelationId } from '../lib/audit-storage'
import { loadStatementTransactions } from '../lib/finance-storage'
import { Product, Quotation } from '../lib/types/rental-pos'

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

function buildFullBillItem(
  overrides: Partial<FullBillItem> & { productId: string; productName: string; quantity: number }
): FullBillItem {
  const { productId, productName, quantity, ...rest } = overrides
  return {
    rentalBillItemId: rest.rentalBillItemId || `rbi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    productCode: rest.productCode || productId,
    returnedQty: rest.returnedQty || 0,
    outstandingQty: rest.outstandingQty !== undefined ? rest.outstandingQty : quantity,
    dailyRate: rest.dailyRate || 100,
    unit: rest.unit || 'ชุด',
    defaultRepairFee: rest.defaultRepairFee || 0,
    defaultReplacementFee: rest.defaultReplacementFee || 0,
    requiresReturn: rest.requiresReturn !== undefined ? rest.requiresReturn : true,
    rentalStartDate: rest.rentalStartDate || '2026-09-15',
    scheduledReturnDate: rest.scheduledReturnDate || '2026-09-20',
    rentalType: rest.rentalType || 'NORMAL',
    lineTotal: rest.lineTotal || (rest.dailyRate || 100) * quantity,
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
    customerName: rest.customerName || 'สมชาย สายเปย์',
    customerPhone: rest.customerPhone || '0812345678',
    customerAddress: rest.customerAddress || '123 ถ.สุขุมวิท กทม.',
    rentalStartDate: rest.rentalStartDate || '2026-09-15',
    scheduledReturnDate: rest.scheduledReturnDate || '2026-09-20',
    heldDepositAmount: rest.heldDepositAmount !== undefined ? rest.heldDepositAmount : 0,
    paidDepositAmount: rest.paidDepositAmount !== undefined ? rest.paidDepositAmount : 0,
    deposits: rest.deposits || [],
    subtotal: rest.subtotal !== undefined ? rest.subtotal : 1000,
    grandTotal: rest.grandTotal !== undefined ? rest.grandTotal : 1000,
    paidAmount: rest.paidAmount !== undefined ? rest.paidAmount : 0,
    outstandingAmount: rest.outstandingAmount !== undefined ? rest.outstandingAmount : 1000,
    rentalStatus: rest.rentalStatus || 'RENTING',
    paymentStatus: rest.paymentStatus || 'UNPAID',
    dispatchStatus: rest.dispatchStatus || 'PENDING',
    items,
    ...rest,
  }
}

describe('Unified Flows & System Integrations (18 Critical Invariants)', () => {
  const testProduct: Product = {
    id: 'prod-suit-1',
    code: 'SUIT-001',
    name: 'ชุดสูททักซิโด้ สีดำ',
    category: 'สูท',
    unit: 'ชุด',
    rentalType: 'NORMAL',
    normalPrice: 500,
    dailyPrice: 500,
    rentPrice: 500,
    salePrice: 2500,
    totalQuantity: 10,
    availableQuantity: 10,
    rentedQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    reservedQuantity: 0,
    minimumStock: 2,
    status: 'ACTIVE',
    defaultDamageFee: 300,
    defaultLossFee: 2500,
  }

  beforeEach(() => {
    localStorageMock.clear()
    resetSystemSettings()
    saveProducts([testProduct])
    saveQuotations([])
    saveReservations([])
    saveBackorders([])
    saveBills([])
    saveNotifications([])
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Quotation -> POS Data Transfer
  // ─────────────────────────────────────────────────────────────────────────────
  it('1. Quotation -> POS: Transferees customer, agreed prices, discounts, and dates correctly', () => {
    const quotation: Quotation = {
      id: 'qt-001',
      quotationNo: 'QT-2026-0001',
      quotationDate: '2026-09-12',
      expiryDate: '2026-09-20',
      status: 'SENT',
      customerId: 'cust-1',
      customerName: 'คุณสมศักดิ์',
      phone: '0899999999',
      customerAddress: '99 ถ.พหลโยธิน',
      rentalStartDate: '2026-09-16',
      rentalEndDate: '2026-09-22',
      items: [
        {
          id: 'qi-1',
          productId: 'prod-suit-1',
          productName: 'ชุดสูททักซิโด้ สีดำ',
          rentalType: 'NORMAL',
          quantity: 2,
          unitPrice: 400, // Special agreed rate discounted from 500
          usageCountOrDays: 1,
          lineTotal: 800,
        },
      ],
      subtotal: 800,
      discountAmount: 50,
      shippingFee: 0,
      depositAmount: 200,
      taxAmount: 0,
      grandTotal: 750,
      remark: 'ราคาพิเศษสำหรับงานแต่ง',
    }

    addQuotation(quotation)

    const posData = mapQuotationToPos(quotation)
    expect(posData.quotationId).toBe('qt-001')
    expect(posData.customer.customerName).toBe('คุณสมศักดิ์')
    expect(posData.customer.phone).toBe('0899999999')
    expect(posData.customer.address).toBe('99 ถ.พหลโยธิน')
    expect(posData.values.rentalStartDate).toBe('2026-09-16')
    expect(posData.values.rentalEndDate).toBe('2026-09-22')
    expect(posData.cartItems.length).toBe(1)
    expect(posData.cartItems[0].product.rentPrice).toBe(400) // Agreed price locked!
    expect(posData.cartItems[0].quantity).toBe(2)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Quotation with Reservation -> Bill: Prevents Double-Reservation
  // ─────────────────────────────────────────────────────────────────────────────
  it('2. Quotation with Reservation -> Bill: Adopts existing reservation and avoids double-reserving', () => {
    const quotation: Quotation = {
      id: 'qt-resv-1',
      quotationNo: 'QT-RESV-001',
      quotationDate: '2026-09-12',
      expiryDate: '2026-09-20',
      status: 'SENT',
      customerId: 'cust-1',
      customerName: 'คุณมณีรัตน์',
      phone: '0811111111',
      rentalStartDate: '2026-09-15',
      rentalEndDate: '2026-09-20',
      items: [
        {
          id: 'qi-resv-1',
          productId: 'prod-suit-1',
          productName: 'ชุดสูททักซิโด้ สีดำ',
          rentalType: 'NORMAL',
          quantity: 2,
          unitPrice: 500,
          usageCountOrDays: 1,
          lineTotal: 1000,
        },
      ],
      subtotal: 1000,
      discountAmount: 0,
      shippingFee: 0,
      depositAmount: 0,
      taxAmount: 0,
      grandTotal: 1000,
    }
    addQuotation(quotation)

    // Confirm quotation -> does NOT reserve stock (MASTER v2.3.0 Section 7.3)
    const confirmRes = confirmQuotationWorkflow(
      quotation.id,
      { userId: 'staff-1', displayName: 'พนักงาน A' }
    )
    expect(confirmRes.quotation.status).toBe('ACCEPTED')
    const reservationsBefore = loadReservations()
    expect(reservationsBefore.length).toBe(0)

    // Create Bill converting from Quotation
    const billItems = [
      buildFullBillItem({
        productId: 'prod-suit-1',
        productName: 'ชุดสูททักซิโด้ สีดำ',
        quantity: 2,
        dailyRate: 500,
        rentalStartDate: '2026-09-15',
        scheduledReturnDate: '2026-09-20',
      }),
    ]
    const billToCreate = buildFullBill({
      id: 'bill-from-qt-1',
      billNo: 'B-2026-0001',
      quotationId: quotation.id,
      customerName: 'คุณมณีรัตน์',
      customerPhone: '0811111111',
      rentalStartDate: '2026-09-15',
      scheduledReturnDate: '2026-09-20',
      items: billItems,
    })

    createBillWorkflow({
      bill: billToCreate,
      actor: { userId: 'staff-1', displayName: 'พนักงาน A' },
    })

    const reservationsAfter = loadReservations()
    // Invariant: Total active reservations for this product must remain 2 (NOT duplicated to 4)
    const activeResvs = reservationsAfter.filter((r) => r.productId === 'prod-suit-1' && r.status === 'ACTIVE')
    expect(activeResvs.length).toBe(1)
    expect(activeResvs[0].quantity).toBe(2)
    expect(activeResvs[0].sourceType).toBe('BILL')
    expect(activeResvs[0].sourceId).toBe('bill-from-qt-1')
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Quotation Converted Status Transition
  // ─────────────────────────────────────────────────────────────────────────────
  it('3. Quotation Converted Status: Marks quotation CONVERTED upon bill creation', () => {
    const quotation: Quotation = {
      id: 'qt-conv-1',
      quotationNo: 'QT-CONV-001',
      quotationDate: '2026-09-12',
      expiryDate: '2026-09-20',
      status: 'SENT',
      customerId: 'cust-1',
      customerName: 'คุณกิตติ',
      rentalStartDate: '2026-09-15',
      rentalEndDate: '2026-09-20',
      items: [
        {
          id: 'qi-conv-1',
          productId: 'prod-suit-1',
          productName: 'ชุดสูททักซิโด้ สีดำ',
          rentalType: 'NORMAL',
          quantity: 1,
          unitPrice: 500,
          usageCountOrDays: 1,
          lineTotal: 500,
        },
      ],
      subtotal: 500,
      discountAmount: 0,
      shippingFee: 0,
      depositAmount: 0,
      taxAmount: 0,
      grandTotal: 500,
    }
    addQuotation(quotation)

    const billItems = [
      buildFullBillItem({
        productId: 'prod-suit-1',
        productName: 'ชุดสูททักซิโด้ สีดำ',
        quantity: 1,
      }),
    ]
    const bill = buildFullBill({
      id: 'bill-conv-1',
      billNo: 'B-CONV-001',
      quotationId: quotation.id,
      items: billItems,
    })

    const res = createBillWorkflow({
      bill,
      actor: { userId: 'staff-1', displayName: 'พนักงาน A' },
    })

    const updatedQt = getQuotationById('qt-conv-1')
    expect(updatedQt?.status).toBe('CONVERTED')

    // Invariant: Duplicate conversion must be forbidden
    const duplicateBill = buildFullBill({
      id: 'bill-conv-dup',
      billNo: 'B-CONV-DUP',
      quotationId: quotation.id,
      items: billItems,
    })
    expect(() =>
      createBillWorkflow({
        bill: duplicateBill,
        actor: { userId: 'staff-1', displayName: 'พนักงาน A' },
      })
    ).toThrow(/ถูกแปลงเป็นบิลไปแล้ว/)

    // Invariant: Audit log recorded QUOTATION_CONVERT_BILL with matching correlationId
    const auditLogs = loadAuditLogs()
    const convertLog = auditLogs.find(
      (a) => a.action === 'QUOTATION_CONVERT_BILL' && a.correlationId === res.correlationId
    )
    expect(convertLog).toBeDefined()
    expect(convertLog?.after?.quotationId).toBe('qt-conv-1')
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Draft Bill: Save & Reopen
  // ─────────────────────────────────────────────────────────────────────────────
  it('4. Draft Bill Save & Load: Correctly saves draft and allows retrieval by ID', () => {
    const draftItems = [
      buildFullBillItem({
        productId: 'prod-suit-1',
        productName: 'ชุดสูททักซิโด้ สีดำ',
        quantity: 2,
        dailyRate: 500,
      }),
    ]
    const draftBill = buildFullBill({
      id: 'draft-bill-1',
      billNo: 'DRAFT-0001',
      customerName: 'คุณธนินทร์',
      rentalStatus: 'DRAFT',
      paymentStatus: 'UNPAID',
      dispatchStatus: 'PENDING',
      grandTotal: 1000,
      paidAmount: 0,
      outstandingAmount: 1000,
      items: draftItems,
    })

    const result = saveDraftBillWorkflow({
      bill: draftBill,
      actor: { userId: 'staff-1', displayName: 'พนักงาน A' },
    })

    expect(result.bill.id).toBe('draft-bill-1')
    expect(result.bill.rentalStatus).toBe('DRAFT')
    expect(result.bill.paymentStatus).toBe('UNPAID')

    const savedBills = loadBills()
    const found = savedBills.find((b) => b.id === 'draft-bill-1')
    expect(found).toBeDefined()
    expect(found?.customerName).toBe('คุณธนินทร์')
    expect(found?.grandTotal).toBe(1000)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Draft Bill: Zero Side Effects (No Stock/Reservation/Finance Impact)
  // ─────────────────────────────────────────────────────────────────────────────
  it('5. Draft Bill Zero Side Effects: Does not touch product stock, create reservations, or log finance tx', () => {
    const draftItems = [
      buildFullBillItem({
        productId: 'prod-suit-1',
        productName: 'ชุดสูททักซิโด้ สีดำ',
        quantity: 3,
      }),
    ]
    const draftBill = buildFullBill({
      id: 'draft-bill-pure',
      billNo: 'DRAFT-PURE-01',
      customerName: 'คุณอรทัย',
      items: draftItems,
    })

    saveDraftBillWorkflow({
      bill: draftBill,
      actor: { userId: 'staff-1', displayName: 'พนักงาน A' },
    })

    // Invariant 1: Product stock untouched
    const prods = loadProducts()
    const p = prods.find((x) => x.id === 'prod-suit-1')
    expect(p?.totalQuantity).toBe(10)
    expect(p?.reservedQuantity || 0).toBe(0)

    // Invariant 2: No reservations
    const resvs = loadReservations()
    expect(resvs.length).toBe(0)

    // Invariant 3: No backorders
    const bos = loadBackorders()
    expect(bos.length).toBe(0)

    // Invariant 4: No statement transactions
    const txs = loadStatementTransactions()
    expect(txs.length).toBe(0)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Draft Bill: Confirm Flow (Executes once on same ID)
  // ─────────────────────────────────────────────────────────────────────────────
  it('6. Draft Bill Confirm: Transitions draft to RENTING, reserves stock, operates on same ID', () => {
    const draftItems = [
      buildFullBillItem({
        productId: 'prod-suit-1',
        productName: 'ชุดสูททักซิโด้ สีดำ',
        quantity: 2,
        dailyRate: 500,
        rentalStartDate: '2026-09-15',
        scheduledReturnDate: '2026-09-20',
      }),
    ]
    const draftBill = buildFullBill({
      id: 'draft-to-confirm',
      billNo: 'DRAFT-CONF-01',
      rentalStatus: 'DRAFT',
      paymentStatus: 'UNPAID',
      dispatchStatus: 'PENDING',
      customerName: 'คุณชัยพร',
      items: draftItems,
      grandTotal: 1000,
      paidAmount: 0,
      outstandingAmount: 1000,
    })
    saveDraftBillWorkflow({
      bill: draftBill,
      actor: { userId: 'staff-1', displayName: 'พนักงาน A' },
    })

    // Confirm the draft bill
    const confirmRes = confirmDraftBillWorkflow({
      billId: 'draft-to-confirm',
      paymentSplits: [{ channel: 'CASH', amount: 1000 }],
      actor: { userId: 'staff-1', displayName: 'พนักงาน A' },
    })

    expect(confirmRes.bill.id).toBe('draft-to-confirm') // Same ID!
    expect(confirmRes.bill.rentalStatus).toBe('CONFIRMED')
    expect(confirmRes.bill.paymentStatus).toBe('PAID')
    expect(confirmRes.reservations?.length).toBe(1)
    expect(confirmRes.reservations?.[0].quantity).toBe(2)

    // Bill in persistence is updated, not duplicated
    const allBills = loadBills()
    expect(allBills.length).toBe(1)
    expect(allBills[0].id).toBe('draft-to-confirm')
    expect(allBills[0].rentalStatus).toBe('CONFIRMED')

    // Confirming again throws error
    expect(() =>
      confirmDraftBillWorkflow({
        billId: 'draft-to-confirm',
        actor: { userId: 'staff-1', displayName: 'พนักงาน A' },
      })
    ).toThrow(/not in DRAFT status/)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Draft Bill: Hard Deletion Guard
  // ─────────────────────────────────────────────────────────────────────────────
  it('7. Draft Bill Hard Deletion: Allowed for draft without transactions; forbidden for active bills', () => {
    const draftBill = buildFullBill({
      id: 'draft-to-delete',
      billNo: 'DRAFT-DEL-01',
      rentalStatus: 'DRAFT',
      paymentStatus: 'UNPAID',
      paidAmount: 0,
      items: [],
    })
    saveBills([draftBill])

    // Draft bill can be deleted
    expect(canHardDeleteBill(draftBill)).toBe(true)
    const nextBills = deleteBill(draftBill.id)
    expect(nextBills.find((b) => b.id === 'draft-to-delete')).toBeUndefined()

    // Active bill cannot be hard deleted
    const activeBill = buildFullBill({
      id: 'active-bill-nodelete',
      billNo: 'B-NODELETE-01',
      rentalStatus: 'RENTING',
      paidAmount: 500,
      items: [buildFullBillItem({ productId: 'prod-suit-1', productName: 'ชุดสูท', quantity: 1 })],
    })
    saveBills([activeBill])
    expect(canHardDeleteBill(activeBill)).toBe(false)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Reservation Expiry: UNTIL_START_DATE Policy
  // ─────────────────────────────────────────────────────────────────────────────
  it('8. Reservation Expiry: UNTIL_START_DATE expires reservations past start date and releases stock', () => {
    saveSystemSettings({
      rentalBilling: {
        ...loadSystemSettings().rentalBilling,
        reservationExpiryPolicy: 'UNTIL_START_DATE',
      },
    })

    // Create reservation with past start date: 2026-09-10
    const resv = createReservation({
      sourceType: 'QUOTATION',
      sourceId: 'qt-old',
      sourceNo: 'QT-OLD',
      customerId: 'cust-1',
      customerName: 'ลูกค้าทดสอบ',
      productId: 'prod-suit-1',
      productCode: 'SUIT-001',
      productName: 'ชุดสูททักซิโด้ สีดำ',
      itemType: 'RENT',
      quantity: 2,
      startDate: '2026-09-10',
      endDate: '2026-09-15',
    })

    // Check expiry as of 2026-09-12 (2 days after start date)
    const result = checkAndExpireReservations('2026-09-12')
    expect(result.expiredReservations.length).toBe(1)
    expect(result.expiredReservations[0].id).toBe(resv.id)
    expect(result.expiredReservations[0].status).toBe('EXPIRED')

    // Reserved stock is released back to product
    const avail = getProductAvailability('prod-suit-1')
    expect(avail.reserved).toBe(0)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. Reservation Expiry: DAYS_LIMIT Policy
  // ─────────────────────────────────────────────────────────────────────────────
  it('9. Reservation Expiry: DAYS_LIMIT expires reservations older than configured days', () => {
    saveSystemSettings({
      rentalBilling: {
        ...loadSystemSettings().rentalBilling,
        reservationExpiryPolicy: 'DAYS_LIMIT',
        reservationExpiryDays: 3,
      },
    })

    // Reservation created 5 days ago
    const resv = createReservation({
      sourceType: 'BILL',
      sourceId: 'b-old',
      sourceNo: 'B-OLD',
      customerId: 'cust-1',
      customerName: 'ลูกค้าทดสอบ',
      productId: 'prod-suit-1',
      productCode: 'SUIT-001',
      productName: 'ชุดสูททักซิโด้ สีดำ',
      itemType: 'RENT',
      quantity: 1,
      startDate: '2026-09-25',
      endDate: '2026-09-30',
    })
    // Backdate createdAt to 2026-09-01
    const all = loadReservations().map((r) =>
      r.id === resv.id ? { ...r, createdAt: '2026-09-01T00:00:00.000Z' } : r
    )
    saveReservations(all)

    // Check expiry as of 2026-09-06 (5 days diff >= 3)
    const result = checkAndExpireReservations('2026-09-06')
    expect(result.expiredReservations.length).toBe(1)
    expect(result.expiredReservations[0].status).toBe('EXPIRED')
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. Reservation Expiry Invariant: DISPATCHED Reservations Never Expire
  // ─────────────────────────────────────────────────────────────────────────────
  it('10. Reservation Expiry Invariant: DISPATCHED reservations can NEVER be expired', () => {
    saveSystemSettings({
      rentalBilling: {
        ...loadSystemSettings().rentalBilling,
        reservationExpiryPolicy: 'UNTIL_START_DATE',
      },
    })

    // Dispatched reservation with past start date
    const resv = createReservation({
      sourceType: 'BILL',
      sourceId: 'b-disp',
      sourceNo: 'B-DISP',
      customerId: 'cust-1',
      customerName: 'ลูกค้าทดสอบ',
      productId: 'prod-suit-1',
      productCode: 'SUIT-001',
      productName: 'ชุดสูททักซิโด้ สีดำ',
      itemType: 'RENT',
      quantity: 2,
      startDate: '2026-09-01',
      endDate: '2026-09-10',
    })
    // Mark DISPATCHED
    const all = loadReservations().map((r) =>
      r.id === resv.id ? { ...r, status: 'DISPATCHED' as const } : r
    )
    saveReservations(all)

    const result = checkAndExpireReservations('2026-09-12')
    expect(result.expiredReservations.length).toBe(0)

    const postCheck = loadReservations().find((r) => r.id === resv.id)
    expect(postCheck?.status).toBe('DISPATCHED') // Strict invariant preserved!
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 11. Backorder Ready Notification Trigger on Available Stock Increase
  // ─────────────────────────────────────────────────────────────────────────────
  it('11. Backorder Ready Notification: Notifies when stock becomes available', () => {
    // Create pending backorder for prod-suit-1
    createBackorder({
      sourceType: 'QUOTATION',
      sourceId: 'qt-bo',
      sourceNo: 'QT-BO-01',
      customerId: 'cust-wait',
      customerName: 'คุณสุนทร',
      productId: 'prod-suit-1',
      productCode: 'SUIT-001',
      productName: 'ชุดสูททักซิโด้ สีดำ',
      itemType: 'RENT',
      requestedQty: 2,
    })

    const notifs = checkBackordersOnStockIncrease('prod-suit-1', 2, {
      userId: 'staff-1',
      displayName: 'พนักงาน A',
    })

    expect(notifs.length).toBe(1)
    expect(notifs[0].type).toBe('BACKORDER_READY')
    expect(notifs[0].status).toBe('UNREAD')
    expect(notifs[0].data.readyQty).toBe(2)

    // Backorder status updated to READY
    const bos = loadBackorders()
    expect(bos[0].status).toBe('READY')
    expect(bos[0].allocatedReadyQty).toBe(2)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 12. Backorder Fulfillment Workflow
  // ─────────────────────────────────────────────────────────────────────────────
  it('12. Backorder Fulfillment: Explicit confirmation allocates stock, reduces backorder, marks ACTIONED', () => {
    const bo = createBackorder({
      sourceType: 'BILL',
      sourceId: 'b-bo-1',
      sourceNo: 'B-BO-001',
      customerId: 'cust-bo',
      customerName: 'คุณปรีชา',
      productId: 'prod-suit-1',
      productCode: 'SUIT-001',
      productName: 'ชุดสูททักซิโด้ สีดำ',
      itemType: 'RENT',
      requestedQty: 2,
      startDate: '2026-09-15',
      endDate: '2026-09-20',
    })

    checkBackordersOnStockIncrease('prod-suit-1', 2)

    // Execute user-confirmed fulfillment workflow
    const result = fulfillBackorderWorkflow({
      backorderId: bo.id,
      allocateQty: 2,
      actor: { userId: 'staff-1', displayName: 'พนักงาน A' },
    })

    // 1. Backorder status becomes FULFILLED
    expect(result.backorder.status).toBe('FULFILLED')
    expect(result.backorder.outstandingQty).toBe(0)

    // 2. Active reservation created
    expect(result.reservation.status).toBe('ACTIVE')
    expect(result.reservation.quantity).toBe(2)

    // 3. Notification marked ACTIONED
    const notifs = loadNotifications()
    const boNotif = notifs.find((n) => n.data.backorderId === bo.id)
    expect(boNotif?.status).toBe('ACTIONED')
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 13. Settings Persistence across reload
  // ─────────────────────────────────────────────────────────────────────────────
  it('13. Settings Persistence: Retains configured values across save and reload', () => {
    saveSystemSettings({
      rentalBilling: {
        ...loadSystemSettings().rentalBilling,
        reservationExpiryPolicy: 'DAYS_LIMIT',
        reservationExpiryDays: 5,
      },
      financePayment: {
        ...loadSystemSettings().financePayment,
        defaultVatPercent: 10,
        vatCalculationMode: 'EXCLUSIVE',
        maximumDiscountPercent: 25,
        moneyPrecision: 2,
        roundingMode: 'ROUND_HALF_UP',
      },
    })

    const loaded = loadSystemSettings()
    expect(loaded.financePayment?.defaultVatPercent).toBe(10)
    expect(loaded.financePayment?.vatCalculationMode).toBe('EXCLUSIVE')
    expect(loaded.financePayment?.maximumDiscountPercent).toBe(25)
    expect(loaded.rentalBilling?.reservationExpiryPolicy).toBe('DAYS_LIMIT')
    expect(loaded.rentalBilling?.reservationExpiryDays).toBe(5)
    expect(loaded.financePayment?.moneyPrecision).toBe(2)
    expect(loaded.financePayment?.roundingMode).toBe('ROUND_HALF_UP')
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 14. VAT Calculation Modes (Inclusive vs Exclusive)
  // ─────────────────────────────────────────────────────────────────────────────
  it('14. VAT Calculation Modes: Correctly calculates INCLUSIVE and EXCLUSIVE VAT', () => {
    // Exclusive mode: Subtotal 1000 + 7% VAT = 1070
    saveSystemSettings({
      financePayment: {
        ...loadSystemSettings().financePayment,
        defaultVatPercent: 7,
        vatCalculationMode: 'EXCLUSIVE',
      },
    })
    const totalsExclusive = calculateBillTotals({
      items: [{ quantity: 2, unitPrice: 500, lineTotal: 1000 }],
      enableVat: true,
    })
    expect(totalsExclusive.subtotal).toBe(1000)
    expect(totalsExclusive.vatAmount).toBe(70)
    expect(totalsExclusive.grandTotal).toBe(1070)

    // Inclusive mode: GrandTotal 1070 contains 7% VAT (1000 base + 70 vat)
    saveSystemSettings({
      financePayment: {
        ...loadSystemSettings().financePayment,
        defaultVatPercent: 7,
        vatCalculationMode: 'INCLUSIVE',
      },
    })
    const totalsInclusive = calculateBillTotals({
      items: [{ quantity: 1, unitPrice: 1070, lineTotal: 1070 }],
      enableVat: true,
    })
    expect(totalsInclusive.grandTotal).toBe(1070)
    expect(totalsInclusive.subtotalWithoutTax).toBe(1000)
    expect(totalsInclusive.vatAmount).toBe(70)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 15. Maximum Discount Enforcement
  // ─────────────────────────────────────────────────────────────────────────────
  it('15. Maximum Discount Capping: Caps discount exceeding maximumDiscountPercent', () => {
    saveSystemSettings({
      financePayment: {
        ...loadSystemSettings().financePayment,
        maximumDiscountPercent: 20,
        vatEnabled: false,
        defaultVatPercent: 0,
      },
    })

    // Subtotal = 1000. Maximum allowed discount is 20% = 200.
    // User requested 300 (30%)
    const totals = calculateBillTotals({
      items: [{ quantity: 1, unitPrice: 1000, lineTotal: 1000 }],
      discount: 300,
    })

    // Invariant: Discount must be capped at 200
    expect(totals.discountAmount).toBe(200)
    expect(totals.netSubtotal).toBe(800)
    expect(totals.grandTotal).toBe(800)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 16. Money Precision & Rounding Modes
  // ─────────────────────────────────────────────────────────────────────────────
  it('16. Money Precision & Rounding Modes: Obeys ROUND, CEIL, and FLOOR precision', () => {
    // ROUND precision 0
    saveSystemSettings({
      financePayment: {
        ...loadSystemSettings().financePayment,
        moneyPrecision: 0,
        roundingMode: 'ROUND_HALF_UP',
      },
    })
    expect(roundMoney(100.4)).toBe(100)
    expect(roundMoney(100.5)).toBe(101)

    // CEIL precision 0
    saveSystemSettings({
      financePayment: {
        ...loadSystemSettings().financePayment,
        moneyPrecision: 0,
        roundingMode: 'ROUND_UP',
      },
    })
    expect(roundMoney(100.01)).toBe(101)

    // FLOOR precision 0
    saveSystemSettings({
      financePayment: {
        ...loadSystemSettings().financePayment,
        moneyPrecision: 0,
        roundingMode: 'ROUND_DOWN',
      },
    })
    expect(roundMoney(100.99)).toBe(100)

    // Precision 2
    saveSystemSettings({
      financePayment: {
        ...loadSystemSettings().financePayment,
        moneyPrecision: 2,
        roundingMode: 'ROUND_HALF_UP',
      },
    })
    expect(roundMoney(100.555)).toBe(100.56)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 17. Late Return: Overdue Days Tracked with Zero Penalty Fee Invariant
  // ─────────────────────────────────────────────────────────────────────────────
  it('17. Late Return: Accurately calculates overdue days with 0 late penalty fee', () => {
    const bill = buildFullBill({
      id: 'b-late',
      billNo: 'B-LATE-01',
      scheduledReturnDate: '2026-09-10',
      items: [
        buildFullBillItem({
          productId: 'prod-suit-1',
          productName: 'ชุดสูททักซิโด้ สีดำ',
          quantity: 1,
          dailyRate: 200,
        }),
      ],
    })

    // Returned on 2026-09-15 (5 days overdue)
    const lateAnalysis = evaluateLateReturn(bill, '2026-09-15')
    expect(lateAnalysis.isOverdue).toBe(true)
    expect(lateAnalysis.overdueDays).toBe(5)
    expect(lateAnalysis.calculatedLateFee).toBe(0) // Strict invariant: late fee is 0!
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 18. Audit Trail Correlation across workflows
  // ─────────────────────────────────────────────────────────────────────────────
  it('18. Audit Trail Correlation: Propagates correlationId across all lifecycle events', () => {
    const correlationId = generateCorrelationId()

    const draftItems = [
      buildFullBillItem({
        productId: 'prod-suit-1',
        productName: 'ชุดสูททักซิโด้ สีดำ',
        quantity: 1,
        rentalStartDate: '2026-09-15',
        scheduledReturnDate: '2026-09-20',
      }),
    ]
    const draftBill = buildFullBill({
      id: 'draft-audit-corr',
      billNo: 'DRAFT-AUDIT-01',
      customerName: 'คุณวิชัย',
      rentalStatus: 'DRAFT',
      paymentStatus: 'UNPAID',
      items: draftItems,
    })

    // Step 1: Save draft with correlationId
    saveDraftBillWorkflow({
      bill: draftBill,
      actor: { userId: 'staff-1', displayName: 'พนักงาน A' },
      correlationId,
    })

    // Step 2: Confirm draft with same correlationId
    confirmDraftBillWorkflow({
      billId: 'draft-audit-corr',
      paymentSplits: [{ channel: 'TRANSFER', amount: 1000 }],
      actor: { userId: 'staff-1', displayName: 'พนักงาน A' },
      correlationId,
    })

    const auditLogs = loadAuditLogs()
    const linkedLogs = auditLogs.filter((log) => log.correlationId === correlationId)

    expect(linkedLogs.length).toBeGreaterThanOrEqual(2)
    const actions = linkedLogs.map((l) => l.action)
    expect(actions).toContain('BILL_DRAFT_SAVE')
    expect(actions).toContain('BILL_CONFIRM')
  })
})

describe('MASTER #5 shared VAT settings', () => {
  beforeEach(() => localStorageMock.clear())

  it('persists OFF/ON, preserves percent, overrides stale cart rate and audits switch', () => {
    const initial = loadSystemSettings()
    saveSystemSettings({ ...initial, financePayment: {
      ...initial.financePayment, vatEnabled: true, defaultVatPercent: 7,
    } })
    const before = loadAuditLogs().length
    const disabled = saveSystemSettings({ ...loadSystemSettings(), financePayment: {
      ...loadSystemSettings().financePayment, vatEnabled: false,
    } })
    expect(disabled.financePayment.defaultVatPercent).toBe(7)
    expect(loadAuditLogs().length).toBe(before + 1)
    const staleCart = { items: [{ quantity: 1, unitPrice: 100 }], taxRate: 0.07 }
    expect(calculateBillTotals(staleCart)).toMatchObject({ vatRate: 0, vatAmount: 0, grandTotal: 100 })
    saveSystemSettings({ ...disabled, financePayment: { ...disabled.financePayment, vatEnabled: true } })
    expect(calculateBillTotals({ ...staleCart, taxRate: 0 })).toMatchObject({ vatRate: 0.07, vatAmount: 7, grandTotal: 107 })
  })

  it('legacy settings without vatEnabled retain enabled default', () => {
    localStorageMock.setItem('app_system_settings', JSON.stringify({ financePayment: { defaultVatPercent: 7 } }))
    expect(loadSystemSettings().financePayment.vatEnabled).toBe(true)
  })

  it('inclusive VAT uses production totals and switches off cleanly', () => {
    const initial = loadSystemSettings()
    const enabled = saveSystemSettings({ ...initial, financePayment: {
      ...initial.financePayment, vatEnabled: true, defaultVatPercent: 7, vatCalculationMode: 'INCLUSIVE',
    } })
    const cart = { items: [{ quantity: 1, unitPrice: 107 }] }
    expect(calculateBillTotals(cart)).toMatchObject({ vatAmount: 7, grandTotal: 107 })
    saveSystemSettings({ ...enabled, financePayment: { ...enabled.financePayment, vatEnabled: false } })
    expect(calculateBillTotals(cart)).toMatchObject({ vatAmount: 0, grandTotal: 107 })
  })
})
