import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadBills,
  saveBills,
  canHardDeleteBill,
  deleteBill,
  loadBillById,
} from '../lib/bill-storage'
import {
  loadProducts,
  saveProducts,
} from '../lib/product-storage'
import {
  loadTransactions,
  saveTransactions,
  getBillFinanceSummary,
  getTransactionsForBill,
} from '../lib/finance-storage'
import { loadAuditLogs } from '../lib/audit-storage'
import {
  createBillWorkflow,
  processSplitPaymentWorkflow,
  processReturnWorkflow,
  processBillRevisionWorkflow,
  cancelOrVoidBillWorkflow,
  processDepositRefundWorkflow,
  processPaymentRefundWorkflow,
} from '../lib/bill-workflow-service'
import { FullBill } from '../lib/types/rental-return'
import { Product } from '../lib/types/rental-pos'

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

describe('Comprehensive Bill Lifecycle Integration Suite', () => {
  const testProductA: Product = {
    id: 'prod-chair-01',
    code: 'CHR-001',
    name: 'เก้าอี้จัดเลี้ยงสีขาว',
    category: 'เฟอร์นิเจอร์',
    unit: 'ตัว',
    rentalType: 'DAILY',
    dailyPrice: 50,
    normalPrice: 50,
    salePrice: 500,
    totalQuantity: 100,
    availableQuantity: 100,
    rentedQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    minimumStock: 5,
    status: 'ACTIVE',
    defaultDamageFee: 100,
    defaultLossFee: 500,
  }

  const testProductB: Product = {
    id: 'prod-table-02',
    code: 'TBL-002',
    name: 'โต๊ะกลมจัดเลี้ยง 1.5ม.',
    category: 'เฟอร์นิเจอร์',
    unit: 'ตัว',
    rentalType: 'DAILY',
    dailyPrice: 200,
    normalPrice: 200,
    salePrice: 2000,
    totalQuantity: 20,
    availableQuantity: 20,
    rentedQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    minimumStock: 2,
    status: 'ACTIVE',
    defaultDamageFee: 500,
    defaultLossFee: 2000,
  }

  const actor = {
    userId: 'user-emp-001',
    displayName: 'สมชาย เจ้าหน้าที่ระบบ',
  }

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    saveProducts([JSON.parse(JSON.stringify(testProductA)), JSON.parse(JSON.stringify(testProductB))])
    saveBills([])
    saveTransactions([])
  })

  // 1. Create bill + receive payment: Bill / Finance / Audit consistent
  it('1. Create bill + receive payment: Bill, Finance, Stock, and Audit match with shared correlationId', () => {
    const result = createBillWorkflow({
      bill: {
        id: 'bill-001',
        billNo: 'BILL-20260912-0001',
        customerName: 'สมศักดิ์ มั่งมี',
        customerPhone: '0812345678',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 1500,
        grandTotal: 2500, // 1500 rental + 1000 deposit
        paidAmount: 1500,
        outstandingAmount: 0,
        paidDepositAmount: 1000,
        heldDepositAmount: 1000,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        deposits: [
          {
            id: 'dep-1',
            amount: 1000,
            refundAmount: 0,
            appliedAmount: 0,
            heldAmount: 1000,
            status: 'HELD',
            receivedDate: '2026-09-12',
            paymentMethod: 'TRANSFER',
            referenceNo: 'TX-DEP-001',
          },
        ],
        items: [
          {
            rentalBillItemId: 'item-1',
            productId: testProductA.id,
            productCode: testProductA.code,
            productName: testProductA.name,
            quantity: 10,
            returnedQty: 0,
            outstandingQty: 10,
            dailyRate: 50,
            unit: 'ตัว',
            defaultRepairFee: 100,
            defaultReplacementFee: 500,
            requiresReturn: true,
            rentalStartDate: '2026-09-12',
            scheduledReturnDate: '2026-09-15',
            status: 'RENTING',
          },
        ],
      },
      paymentSplits: [{ channel: 'TRANSFER', amount: 1500, referenceNo: 'TX-REV-001' }],
      depositAmount: 1000,
      depositChannel: 'TRANSFER',
      depositReferenceNo: 'TX-DEP-001',
      actor,
    })

    expect(result.bill.id).toBe('bill-001')
    expect(result.bill.billNo).toBe('BILL-20260912-0001')
    expect(result.bill.paidAmount).toBe(1500)
    expect(result.bill.paidDepositAmount).toBe(1000)

    // Verify Finance Statement Transactions
    const txs = getTransactionsForBill(result.bill.id)
    expect(txs.length).toBe(2) // 1 rental revenue + 1 deposit
    const revenueTx = txs.find((t) => !t.isDeposit)
    const depositTx = txs.find((t) => t.isDeposit)

    expect(revenueTx?.incomeAmount).toBe(1500)
    expect(revenueTx?.correlationId).toBe(result.correlationId)
    expect(depositTx?.incomeAmount).toBe(1000)
    expect(depositTx?.isDeposit).toBe(true)
    expect(depositTx?.correlationId).toBe(result.correlationId)

    // Verify Stock: Product A rented increased by 10, available decreased by 10
    const products = loadProducts()
    const prodA = products.find((p) => p.id === testProductA.id)!
    expect(prodA.availableQuantity).toBe(90)
    expect(prodA.rentedQuantity).toBe(10)

    // Verify Audit Logs
    const auditLogs = loadAuditLogs().filter((l) => l.correlationId === result.correlationId)
    expect(auditLogs.length).toBeGreaterThanOrEqual(2)
  })

  // 2. Split payment: records 1 transaction per method, totals match
  it('2. Split payment: records 1 transaction per channel, bill totals match exactly', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-002',
        billNo: 'BILL-20260912-0002',
        customerName: 'สมศรี มีทรัพย์',
        customerPhone: '0899998888',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 2000,
        grandTotal: 2000,
        paidAmount: 0,
        outstandingAmount: 2000,
        paidDepositAmount: 0,
        heldDepositAmount: 0,
        paymentStatus: 'UNPAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'PENDING',
        deposits: [],
        items: [],
      },
      actor,
    })

    // Split payment across Cash (800) and Transfer (1200)
    const payResult = processSplitPaymentWorkflow({
      billId: createResult.bill.id,
      splits: [
        { channel: 'CASH', amount: 800, referenceNo: 'CASH-SLIP-01' },
        { channel: 'TRANSFER', amount: 1200, referenceNo: 'BANK-TRF-02' },
      ],
      actor,
    })

    expect(payResult.bill.paidAmount).toBe(2000)
    expect(payResult.bill.paymentStatus).toBe('PAID')

    // Statement must have exactly 2 distinct transactions
    const txs = getTransactionsForBill(createResult.bill.id)
    expect(txs.length).toBe(2)
    const cashTx = txs.find((t) => t.channel === 'CASH')
    const trfTx = txs.find((t) => t.channel === 'TRANSFER')

    expect(cashTx?.incomeAmount).toBe(800)
    expect(trfTx?.incomeAmount).toBe(1200)
    expect(cashTx?.correlationId).toBe(payResult.correlationId)
    expect(trfTx?.correlationId).toBe(payResult.correlationId)
  })

  // 3. Cancel bill before dispatch (PENDING): releases reserved/rented stock to Available
  it('3. Cancel bill before dispatch: releases reserved/rented stock to Available', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-003',
        billNo: 'BILL-20260912-0003',
        customerName: 'ธงชัย สบายดี',
        customerPhone: '0822223333',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 500,
        grandTotal: 500,
        paidAmount: 500,
        outstandingAmount: 0,
        paidDepositAmount: 0,
        heldDepositAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'PENDING', // NOT YET DISPATCHED
        deposits: [],
        items: [
          {
            rentalBillItemId: 'item-3',
            productId: testProductA.id,
            productCode: testProductA.code,
            productName: testProductA.name,
            quantity: 5,
            returnedQty: 0,
            outstandingQty: 5,
            dailyRate: 50,
            unit: 'ตัว',
            defaultRepairFee: 100,
            defaultReplacementFee: 500,
            requiresReturn: true,
            rentalStartDate: '2026-09-12',
            scheduledReturnDate: '2026-09-15',
            status: 'RENTING',
          },
        ],
      },
      paymentSplits: [{ channel: 'CASH', amount: 500 }],
      actor,
    })

    // Before cancel: stock was reservedQuantity=5, rentedQuantity=0 (Confirm != Dispatch)
    let prodA = loadProducts().find((p) => p.id === testProductA.id)!
    expect(prodA.reservedQuantity).toBe(5)
    expect(prodA.rentedQuantity).toBe(0)

    // Cancel bill
    const cancelResult = cancelOrVoidBillWorkflow({
      billId: createResult.bill.id,
      reason: 'ลูกค้ายกเลิกงานก่อนจัดส่ง',
      actor,
      actionType: 'CANCEL',
    })

    expect(cancelResult.bill.rentalStatus).toBe('CANCELLED')
    expect(cancelResult.bill.paymentStatus).toBe('REFUNDED')

    // Stock must be released: reservedQuantity=0, availableQuantity=100, rentedQuantity=0
    prodA = loadProducts().find((p) => p.id === testProductA.id)!
    expect(prodA.reservedQuantity).toBe(0)
    expect(prodA.availableQuantity).toBe(100)
    expect(prodA.rentedQuantity).toBe(0)

    // Financial reversal transaction should exist
    const txs = getTransactionsForBill(createResult.bill.id)
    const refundTx = txs.find((t) => t.type === 'EXPENSE')
    expect(refundTx?.expenseAmount).toBe(500)
  })

  // 4. Cancel/Void bill after dispatch (DISPATCHED): does NOT automatically restore stock to available
  it('4. Cancel/Void bill after dispatch: does NOT automatically restore stock to available', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-004',
        billNo: 'BILL-20260912-0004',
        customerName: 'วิชัย มุ่งมั่น',
        customerPhone: '0833334444',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 500,
        grandTotal: 500,
        paidAmount: 500,
        outstandingAmount: 0,
        paidDepositAmount: 0,
        heldDepositAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED', // ALREADY DISPATCHED TO CUSTOMER
        deposits: [],
        items: [
          {
            rentalBillItemId: 'item-4',
            productId: testProductA.id,
            productCode: testProductA.code,
            productName: testProductA.name,
            quantity: 5,
            returnedQty: 0,
            outstandingQty: 5,
            dailyRate: 50,
            unit: 'ตัว',
            defaultRepairFee: 100,
            defaultReplacementFee: 500,
            requiresReturn: true,
            rentalStartDate: '2026-09-12',
            scheduledReturnDate: '2026-09-15',
            status: 'RENTING',
          },
        ],
      },
      paymentSplits: [{ channel: 'CASH', amount: 500 }],
      actor,
    })

    // After checkout: available=95, rented=5
    let prodA = loadProducts().find((p) => p.id === testProductA.id)!
    expect(prodA.availableQuantity).toBe(95)
    expect(prodA.rentedQuantity).toBe(5)

    // Cancel/Void the dispatched bill
    cancelOrVoidBillWorkflow({
      billId: createResult.bill.id,
      reason: 'โมฆะบิลเนื่องจากข้อมูลผิดพลาด สินค้ายังอยู่หน้างานจริง',
      actor,
      actionType: 'VOID',
    })

    // Stock must NOT be returned to available because items are still physically dispatched
    prodA = loadProducts().find((p) => p.id === testProductA.id)!
    expect(prodA.availableQuantity).toBe(95) // Must remain 95!
  })

  // 5. Return Normal: Available quantity increases
  it('5. Return Normal: Available quantity increases correctly', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-005',
        billNo: 'BILL-20260912-0005',
        customerName: 'ประสิทธิ์ สุขใจ',
        customerPhone: '0844445555',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 500,
        grandTotal: 500,
        paidAmount: 500,
        outstandingAmount: 0,
        paidDepositAmount: 0,
        heldDepositAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        deposits: [],
        items: [
          {
            rentalBillItemId: 'item-5',
            productId: testProductA.id,
            productCode: testProductA.code,
            productName: testProductA.name,
            quantity: 6,
            returnedQty: 0,
            outstandingQty: 6,
            dailyRate: 50,
            unit: 'ตัว',
            defaultRepairFee: 100,
            defaultReplacementFee: 500,
            requiresReturn: true,
            rentalStartDate: '2026-09-12',
            scheduledReturnDate: '2026-09-15',
            status: 'RENTING',
          },
        ],
      },
      paymentSplits: [{ channel: 'CASH', amount: 500 }],
      actor,
    })

    // Initial after creation: available=94, rented=6
    let prodA = loadProducts().find((p) => p.id === testProductA.id)!
    expect(prodA.availableQuantity).toBe(94)
    expect(prodA.rentedQuantity).toBe(6)

    // Process return: return 6 Normal
    const returnResult = processReturnWorkflow({
      billId: createResult.bill.id,
      returnItems: [
        {
          rentalBillItemId: 'item-5',
          productId: testProductA.id,
          normalQty: 6,
          damagedQty: 0,
          lostQty: 0,
        },
      ],
      actor,
    })

    expect(returnResult.bill.rentalStatus).toBe('RETURNED')
    prodA = loadProducts().find((p) => p.id === testProductA.id)!
    expect(prodA.availableQuantity).toBe(100)
    expect(prodA.rentedQuantity).toBe(0)
    expect(prodA.damagedQuantity).toBe(0)
    expect(prodA.lostQuantity).toBe(0)
  })

  // 6. Return Damaged: Damaged increases, Available does NOT increase
  it('6. Return Damaged: Damaged increases, Available does NOT increase', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-006',
        billNo: 'BILL-20260912-0006',
        customerName: 'อนันต์ บุญรอด',
        customerPhone: '0855556666',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 500,
        grandTotal: 500,
        paidAmount: 500,
        outstandingAmount: 0,
        paidDepositAmount: 0,
        heldDepositAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        deposits: [],
        items: [
          {
            rentalBillItemId: 'item-6',
            productId: testProductA.id,
            productCode: testProductA.code,
            productName: testProductA.name,
            quantity: 4,
            returnedQty: 0,
            outstandingQty: 4,
            dailyRate: 50,
            unit: 'ตัว',
            defaultRepairFee: 100,
            defaultReplacementFee: 500,
            requiresReturn: true,
            rentalStartDate: '2026-09-12',
            scheduledReturnDate: '2026-09-15',
            status: 'RENTING',
          },
        ],
      },
      paymentSplits: [{ channel: 'CASH', amount: 500 }],
      actor,
    })

    // Return 2 Normal + 2 Damaged
    processReturnWorkflow({
      billId: createResult.bill.id,
      returnItems: [
        {
          rentalBillItemId: 'item-6',
          productId: testProductA.id,
          normalQty: 2,
          damagedQty: 2,
          lostQty: 0,
        },
      ],
      actor,
    })

    const prodA = loadProducts().find((p) => p.id === testProductA.id)!
    // available was 96. +2 normal -> 98. Damaged +2. Rented 4 -> 0.
    expect(prodA.availableQuantity).toBe(98)
    expect(prodA.rentedQuantity).toBe(0)
    expect(prodA.damagedQuantity).toBe(2)
    expect(prodA.lostQuantity).toBe(0)
  })

  // 7. Return Lost: Lost increases (and total reduces), Available does NOT increase
  it('7. Return Lost: Lost increases, Total decreases, Available does NOT increase', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-007',
        billNo: 'BILL-20260912-0007',
        customerName: 'ศิริพร อารีย์',
        customerPhone: '0866667777',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 500,
        grandTotal: 500,
        paidAmount: 500,
        outstandingAmount: 0,
        paidDepositAmount: 0,
        heldDepositAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        deposits: [],
        items: [
          {
            rentalBillItemId: 'item-7',
            productId: testProductA.id,
            productCode: testProductA.code,
            productName: testProductA.name,
            quantity: 3,
            returnedQty: 0,
            outstandingQty: 3,
            dailyRate: 50,
            unit: 'ตัว',
            defaultRepairFee: 100,
            defaultReplacementFee: 500,
            requiresReturn: true,
            rentalStartDate: '2026-09-12',
            scheduledReturnDate: '2026-09-15',
            status: 'RENTING',
          },
        ],
      },
      paymentSplits: [{ channel: 'CASH', amount: 500 }],
      actor,
    })

    // Return 1 Normal + 2 Lost
    processReturnWorkflow({
      billId: createResult.bill.id,
      returnItems: [
        {
          rentalBillItemId: 'item-7',
          productId: testProductA.id,
          normalQty: 1,
          damagedQty: 0,
          lostQty: 2,
        },
      ],
      actor,
    })

    const prodA = loadProducts().find((p) => p.id === testProductA.id)!
    // available was 97. +1 normal -> 98. lost 2. total was 100 -> 98.
    expect(prodA.availableQuantity).toBe(98)
    expect(prodA.rentedQuantity).toBe(0)
    expect(prodA.lostQuantity).toBe(2)
    expect(prodA.totalQuantity).toBe(98)
  })

  // 8. Partial Return: Bill transitions to PARTIAL_RETURNED
  it('8. Partial Return: Bill transitions to PARTIAL_RETURNED status', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-008',
        billNo: 'BILL-20260912-0008',
        customerName: 'กมล ชัยชนะ',
        customerPhone: '0877778888',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 500,
        grandTotal: 500,
        paidAmount: 500,
        outstandingAmount: 0,
        paidDepositAmount: 0,
        heldDepositAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        deposits: [],
        items: [
          {
            rentalBillItemId: 'item-8',
            productId: testProductA.id,
            productCode: testProductA.code,
            productName: testProductA.name,
            quantity: 10,
            returnedQty: 0,
            outstandingQty: 10,
            dailyRate: 50,
            unit: 'ตัว',
            defaultRepairFee: 100,
            defaultReplacementFee: 500,
            requiresReturn: true,
            rentalStartDate: '2026-09-12',
            scheduledReturnDate: '2026-09-15',
            status: 'RENTING',
          },
        ],
      },
      paymentSplits: [{ channel: 'CASH', amount: 500 }],
      actor,
    })

    // Return only 4 items out of 10
    const returnResult = processReturnWorkflow({
      billId: createResult.bill.id,
      returnItems: [
        {
          rentalBillItemId: 'item-8',
          productId: testProductA.id,
          normalQty: 4,
          damagedQty: 0,
          lostQty: 0,
        },
      ],
      actor,
    })

    expect(returnResult.bill.rentalStatus).toBe('PARTIAL_RETURNED')
    const item = returnResult.bill.items.find((i) => i.rentalBillItemId === 'item-8')!
    expect(item.returnedQty).toBe(4)
    expect(item.outstandingQty).toBe(6)
    expect(item.status).toBe('PARTIAL_RETURNED')
  })

  // 9. Bill Revision decreasing qty/total: stock delta restored + refundDueAmount calculated
  it('9. Bill Revision decreasing qty/total: restores stock delta, calculates refundDueAmount, preserves payments', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-009',
        billNo: 'BILL-20260912-0009',
        customerName: 'พงษ์ศักดิ์ ภักดี',
        customerPhone: '0888889999',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 1000,
        grandTotal: 1000,
        paidAmount: 1000,
        outstandingAmount: 0,
        paidDepositAmount: 0,
        heldDepositAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        deposits: [],
        items: [
          {
            rentalBillItemId: 'item-9',
            productId: testProductA.id,
            productCode: testProductA.code,
            productName: testProductA.name,
            quantity: 20,
            returnedQty: 0,
            outstandingQty: 20,
            dailyRate: 50,
            unit: 'ตัว',
            defaultRepairFee: 100,
            defaultReplacementFee: 500,
            requiresReturn: true,
            rentalStartDate: '2026-09-12',
            scheduledReturnDate: '2026-09-15',
            status: 'RENTING',
          },
        ],
      },
      paymentSplits: [{ channel: 'TRANSFER', amount: 1000, referenceNo: 'TRF-FULL' }],
      actor,
    })

    // Product A stock was availableQuantity=80, rentedQuantity=20
    let prodA = loadProducts().find((p) => p.id === testProductA.id)!
    expect(prodA.availableQuantity).toBe(80)
    expect(prodA.rentedQuantity).toBe(20)

    // Revise bill: reduce quantity from 20 to 10
    const revisionResult = processBillRevisionWorkflow({
      billId: createResult.bill.id,
      mode: 'CORRECTION',
      reason: 'ลูกค้าขอปรับลดจำนวนเก้าอี้เหลือ 10 ตัว',
      headerRentalDate: '2026-09-12',
      headerReturnDate: '2026-09-13', // 1 day * 10 * 50 = 500
      items: [
        {
          rentalBillItemId: 'item-9',
          productId: testProductA.id,
          productName: testProductA.name,
          rentalType: 'DAILY',
          quantity: 10,
          returnedQty: 0,
          outstandingQty: 10,
          unitPrice: 50,
          usageCount: 1,
          dailyStartDate: '2026-09-12',
          dailyEndDate: '2026-09-13',
          scheduledReturnDate: '2026-09-13',
          action: 'UPDATE',
          addRounds: 0,
        },
      ],
      actor,
    })

    expect(revisionResult.bill.grandTotal).toBe(500)
    expect(revisionResult.bill.paidAmount).toBe(1000) // Original payment untouched!
    expect(revisionResult.bill.refundDueAmount).toBe(500) // 1000 - 500 = 500 due for refund
    expect(revisionResult.bill.revisions?.length).toBe(1)

    // Stock delta: 10 items returned to Available
    prodA = loadProducts().find((p) => p.id === testProductA.id)!
    expect(prodA.availableQuantity).toBe(90)
    expect(prodA.rentedQuantity).toBe(10)
  })

  // 10. Bill Revision increasing qty/total: cuts stock delta + increases outstandingAmount
  it('10. Bill Revision increasing qty/total: deducts stock delta, increases outstandingAmount', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-010',
        billNo: 'BILL-20260912-0010',
        customerName: 'สมบูรณ์ นิมิตร',
        customerPhone: '0811112222',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-13',
        subtotal: 500,
        grandTotal: 500,
        paidAmount: 500,
        outstandingAmount: 0,
        paidDepositAmount: 0,
        heldDepositAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'PENDING',
        deposits: [],
        items: [
          {
            rentalBillItemId: 'item-10',
            productId: testProductA.id,
            productCode: testProductA.code,
            productName: testProductA.name,
            quantity: 10,
            returnedQty: 0,
            outstandingQty: 10,
            dailyRate: 50,
            unit: 'ตัว',
            defaultRepairFee: 100,
            defaultReplacementFee: 500,
            requiresReturn: true,
            rentalStartDate: '2026-09-12',
            scheduledReturnDate: '2026-09-13',
            status: 'RENTING',
          },
        ],
      },
      paymentSplits: [{ channel: 'CASH', amount: 500 }],
      actor,
    })

    // Revise bill: add Table product (2 units @ 200 = 400)
    processBillRevisionWorkflow({
      billId: createResult.bill.id,
      mode: 'CORRECTION',
      reason: 'ลูกค้าขอเพิ่มโต๊ะจัดเลี้ยง 2 ตัว',
      headerRentalDate: '2026-09-12',
      headerReturnDate: '2026-09-13',
      items: [
        {
          rentalBillItemId: 'item-10',
          productId: testProductA.id,
          productName: testProductA.name,
          rentalType: 'DAILY',
          quantity: 10,
          returnedQty: 0,
          outstandingQty: 10,
          unitPrice: 50,
          usageCount: 1,
          dailyStartDate: '2026-09-12',
          dailyEndDate: '2026-09-13',
          scheduledReturnDate: '2026-09-13',
          action: 'UPDATE',
          addRounds: 0,
        },
        {
          productId: testProductB.id,
          productName: testProductB.name,
          rentalType: 'DAILY',
          quantity: 2,
          returnedQty: 0,
          outstandingQty: 2,
          unitPrice: 200,
          usageCount: 1,
          dailyStartDate: '2026-09-12',
          dailyEndDate: '2026-09-13',
          scheduledReturnDate: '2026-09-13',
          action: 'ADD',
          addRounds: 0,
        },
      ],
      actor,
    })

    const updatedBill = loadBillById(createResult.bill.id)!
    expect(updatedBill.grandTotal).toBe(900) // 500 + 400
    expect(updatedBill.paidAmount).toBe(500)
    expect(updatedBill.outstandingAmount).toBe(400)
    expect(updatedBill.paymentStatus).toBe('PARTIAL')

    // Table stock deducted by 2
    const prodB = loadProducts().find((p) => p.id === testProductB.id)!
    expect(prodB.availableQuantity).toBe(18)
    expect(prodB.rentedQuantity).toBe(2)
  })

  // 11. Payment intact after Revision / Void
  it('11. Original payment transactions remain intact after Revision and Void', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-011',
        billNo: 'BILL-20260912-0011',
        customerName: 'วีระ ชาญชัย',
        customerPhone: '0823334444',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 1000,
        grandTotal: 1000,
        paidAmount: 1000,
        outstandingAmount: 0,
        paidDepositAmount: 0,
        heldDepositAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'PENDING',
        deposits: [],
        items: [],
      },
      paymentSplits: [{ channel: 'QR', amount: 1000, referenceNo: 'QR-PAY-11' }],
      actor,
    })

    // Revise bill
    processBillRevisionWorkflow({
      billId: createResult.bill.id,
      mode: 'CORRECTION',
      reason: 'ปรับยอดเงิน',
      headerRentalDate: '2026-09-12',
      headerReturnDate: '2026-09-15',
      discountAmount: 200,
      items: [],
      actor,
    })

    // Void bill
    cancelOrVoidBillWorkflow({
      billId: createResult.bill.id,
      reason: 'โมฆะบิลทดสอบ',
      actor,
      actionType: 'VOID',
    })

    // Original income transaction must STILL exist in Statement
    const allTxs = getTransactionsForBill(createResult.bill.id)
    const originalIncome = allTxs.find((t) => t.type === 'INCOME' && t.refNo?.includes('QR-PAY-11'))
    expect(originalIncome).toBeDefined()
    expect(originalIncome?.incomeAmount).toBe(1000)

    // And reversal expense must also exist separately
    const reversalTx = allTxs.find((t) => t.type === 'EXPENSE')
    expect(reversalTx).toBeDefined()
  })

  // 12. Refund cannot exceed actual received amount
  it('12. Validation prevents refunds exceeding actual received funds', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-012',
        billNo: 'BILL-20260912-0012',
        customerName: 'ศุภชัย ก้าวหน้า',
        customerPhone: '0834445555',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 500,
        grandTotal: 1000, // 500 rent + 500 deposit
        paidAmount: 500,
        outstandingAmount: 0,
        paidDepositAmount: 500,
        heldDepositAmount: 500,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'PENDING',
        deposits: [
          {
            id: 'dep-12',
            amount: 500,
            refundAmount: 0,
            appliedAmount: 0,
            heldAmount: 500,
            status: 'HELD',
            receivedDate: '2026-09-12',
            paymentMethod: 'CASH',
            referenceNo: 'CASH-DEP-12',
          },
        ],
        items: [],
      },
      paymentSplits: [{ channel: 'CASH', amount: 500 }],
      depositAmount: 500,
      depositChannel: 'CASH',
      actor,
    })

    // Try to refund deposit 600 (exceeding 500) -> must throw
    expect(() =>
      processDepositRefundWorkflow({
        billId: createResult.bill.id,
        amount: 600,
        channel: 'CASH',
        actor,
      })
    ).toThrow(/exceeds held deposit/)

    // Try to refund payment 700 (exceeding 500) -> must throw
    expect(() =>
      processPaymentRefundWorkflow({
        billId: createResult.bill.id,
        amount: 700,
        channel: 'CASH',
        reason: 'ขอคืนเงินเกิน',
        actor,
      })
    ).toThrow(/exceeds available net paid revenue/)

    // Legitimate refund of 300 should succeed
    const legitRefund = processPaymentRefundWorkflow({
      billId: createResult.bill.id,
      amount: 300,
      channel: 'CASH',
      reason: 'คืนเงินบางส่วนตามตกลง',
      actor,
    })
    expect(legitRefund.refundTx.expenseAmount).toBe(300)

    // Trying to refund another 300 now exceeds the remaining 200 -> must throw
    expect(() =>
      processPaymentRefundWorkflow({
        billId: createResult.bill.id,
        amount: 300,
        channel: 'CASH',
        reason: 'คืนเงินรอบสองเกินยอด',
        actor,
      })
    ).toThrow(/exceeds available net paid revenue/)
  })

  // 13. Reload from Storage: Bill, Finance, Stock, Audit remain consistent
  it('13. Reload from Storage: Bill, Finance, Stock, and Audit remain strictly consistent', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-013',
        billNo: 'BILL-20260912-0013',
        customerName: 'เกรียงไกร สดใส',
        customerPhone: '0845556666',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 500,
        grandTotal: 500,
        paidAmount: 500,
        outstandingAmount: 0,
        paidDepositAmount: 0,
        heldDepositAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        deposits: [],
        items: [
          {
            rentalBillItemId: 'item-13',
            productId: testProductA.id,
            productCode: testProductA.code,
            productName: testProductA.name,
            quantity: 5,
            returnedQty: 0,
            outstandingQty: 5,
            dailyRate: 50,
            unit: 'ตัว',
            defaultRepairFee: 100,
            defaultReplacementFee: 500,
            requiresReturn: true,
            rentalStartDate: '2026-09-12',
            scheduledReturnDate: '2026-09-15',
            status: 'RENTING',
          },
        ],
      },
      paymentSplits: [{ channel: 'TRANSFER', amount: 500, referenceNo: 'RELOAD-TEST' }],
      actor,
    })

    // Simulate reloading fresh from storage
    const reloadedBill = loadBillById(createResult.bill.id)!
    const financeSummary = getBillFinanceSummary(reloadedBill.id)
    const reloadedProducts = loadProducts()
    const prodA = reloadedProducts.find((p) => p.id === testProductA.id)!
    const auditLogs = loadAuditLogs().filter((l) => l.correlationId === createResult.correlationId)

    expect(reloadedBill.billNo).toBe('BILL-20260912-0013')
    expect(reloadedBill.paidAmount).toBe(500)
    expect(financeSummary.totalPaid).toBe(500)
    expect(prodA.rentedQuantity).toBe(5)
    expect(auditLogs.length).toBeGreaterThan(0)
  })

  // 14. Confirmed bill has no Hard Delete path (deleteBill throws, canHardDeleteBill is false)
  it('14. Confirmed bill has no Hard Delete path: canHardDeleteBill is false, deleteBill throws exception', () => {
    const createResult = createBillWorkflow({
      bill: {
        id: 'bill-014',
        billNo: 'BILL-20260912-0014',
        customerName: 'อำนาจ เจริญกิจ',
        customerPhone: '0856667777',
        billDate: '2026-09-12',
        rentalStartDate: '2026-09-12',
        scheduledReturnDate: '2026-09-15',
        subtotal: 500,
        grandTotal: 500,
        paidAmount: 500,
        outstandingAmount: 0,
        paidDepositAmount: 0,
        heldDepositAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        deposits: [],
        items: [],
      },
      paymentSplits: [{ channel: 'CASH', amount: 500 }],
      actor,
    })

    const confirmedBill = loadBillById(createResult.bill.id)!

    // canHardDeleteBill must return false
    expect(canHardDeleteBill(confirmedBill)).toBe(false)

    // deleteBill must throw an explicit exception
    expect(() => deleteBill(confirmedBill.id)).toThrow(/Cannot hard delete confirmed or transactional bill/)

    // Confirm bill is still present in storage
    const billsAfter = loadBills()
    expect(billsAfter.some((b) => b.id === confirmedBill.id)).toBe(true)
  })
})
