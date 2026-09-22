import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadBills,
  saveBills,
  saveBillToSupabase,
  loadBillById,
} from '../lib/bill-storage'
import {
  loadProducts,
  saveProducts,
} from '../lib/product-storage'
import {
  loadTransactions,
  saveTransactions,
  getTransactionsForBill,
} from '../lib/finance-storage'
import {
  loadReservations,
  saveReservations,
} from '../lib/reservation-storage'
import {
  loadBackorders,
  saveBackorders,
} from '../lib/backorder-storage'
import {
  loadQuotations,
  saveQuotations,
  addQuotation,
  confirmQuotationWorkflow,
  getQuotationById,
} from '../lib/quotation-storage'
import { loadAuditLogs, AUDIT_STORAGE_KEY } from '../lib/audit-storage'
import {
  createBillWorkflow,
  dispatchBillWorkflow,
  processSplitPaymentWorkflow,
  processReturnWorkflow,
  processBillRevisionWorkflow,
} from '../lib/bill-workflow-service'
import {
  calculateBillTotals,
  calculateFinancialCore,
  calculateRevenueRecognized,
} from '../lib/calculation-service'
import { Product, Quotation } from '../lib/types/rental-pos'
import { FullBill, FullBillItem } from '../lib/types/rental-return'

function buildFullBillItem(
  overrides: Partial<FullBillItem> & { productId: string; quantity: number }
): FullBillItem {
  const { productId, quantity, productName = 'ทดสอบสินค้า', ...rest } = overrides
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
    rentalStartDate: rest.rentalStartDate || '2026-09-22',
    scheduledReturnDate: rest.scheduledReturnDate || '2026-09-25',
    rentalType: rest.rentalType || 'DAILY',
    lineTotal: rest.lineTotal || 500,
    status: rest.status || 'RENTING',
    ...rest,
    productId,
    productName,
    quantity,
  }
}

function buildFullBill(
  overrides: Partial<FullBill> & { id: string; billNo: string; items?: FullBillItem[] }
): FullBill {
  const { id, billNo, items = [], ...rest } = overrides
  return {
    id,
    billNo,
    billDate: rest.billDate || '2026-09-22',
    customerName: rest.customerName || 'ลูกค้าทดสอบ',
    customerPhone: rest.customerPhone || '0812345678',
    rentalStartDate: rest.rentalStartDate || '2026-09-22',
    scheduledReturnDate: rest.scheduledReturnDate || '2026-09-25',
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

describe('Core Business Logic Consolidation - 18 Required Test Cases', () => {
  const actor = {
    userId: 'usr-audit-01',
    displayName: 'Audit Tester',
  }

  const sampleProductA: Product = {
    id: 'prod-tent-01',
    code: 'TNT-001',
    name: 'เต็นท์ปิรามิด 3x3ม.',
    category: 'เต็นท์',
    unit: 'หลัง',
    rentalType: 'DAILY',
    dailyPrice: 1000,
    normalPrice: 1000,
    salePrice: 10000,
    totalQuantity: 20,
    availableQuantity: 20,
    rentedQuantity: 0,
    reservedQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    minimumStock: 2,
    status: 'ACTIVE',
    defaultDamageFee: 800,
    defaultLossFee: 5000,
  }

  const sampleProductB: Product = {
    id: 'prod-chair-02',
    code: 'CHR-002',
    name: 'เก้าอี้พลาสติกขาว',
    category: 'เฟอร์นิเจอร์',
    unit: 'ตัว',
    rentalType: 'DAILY',
    dailyPrice: 20,
    normalPrice: 20,
    salePrice: 250,
    totalQuantity: 100,
    availableQuantity: 100,
    rentedQuantity: 0,
    reservedQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    minimumStock: 10,
    status: 'ACTIVE',
    defaultDamageFee: 50,
    defaultLossFee: 200,
  }

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    saveProducts([
      JSON.parse(JSON.stringify(sampleProductA)),
      JSON.parse(JSON.stringify(sampleProductB)),
    ])
    saveBills([])
    saveTransactions([])
    saveReservations([])
    saveBackorders([])
    saveQuotations([])
  })

  // ==========================================
  // GROUP 1: BILL & FINANCE (Cases 1 - 4)
  // ==========================================

  it('Case 1: Create bill: bill amount 10,000, deposit 2,000 -> bill amount = 10,000, deposit = 2,000 (not 12,000)', () => {
    // Verification at calculation level
    const totals = calculateBillTotals({
      items: [
        { quantity: 1, unitPrice: 10000, lineTotal: 10000 },
      ],
      enableVat: false,
      depositAmount: 2000,
    })
    expect(totals.billAmount).toBe(10000)
    expect(totals.depositAmount).toBe(2000)
    expect(totals.grandTotal).toBe(10000) // grandTotal strictly excludes deposit
    expect(totals.totalPayableWithDeposit).toBe(12000) // payable at checkout includes deposit

    // Verification at workflow level
    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c1',
        billNo: 'BILL-C1-001',
        customerName: 'คุณสมชาย',
        customerPhone: '0811111111',
        subtotal: 10000,
        grandTotal: 10000,
        paidAmount: 10000,
        outstandingAmount: 0,
        paidDepositAmount: 2000,
        heldDepositAmount: 2000,
        paymentStatus: 'PAID',
        rentalStatus: 'CONFIRMED',
        dispatchStatus: 'PENDING',
        deposits: [
          {
            id: 'dep-c1',
            amount: 2000,
            refundAmount: 0,
            appliedAmount: 0,
            heldAmount: 2000,
            status: 'HELD',
            receivedDate: '2026-09-22',
            paymentMethod: 'TRANSFER',
            referenceNo: 'DEP-C1',
          },
        ],
        items: [
          buildFullBillItem({
            rentalBillItemId: 'item-c1',
            productId: sampleProductA.id,
            productCode: sampleProductA.code,
            productName: sampleProductA.name,
            quantity: 10,
            returnedQty: 0,
            outstandingQty: 10,
            dailyRate: 1000,
            lineTotal: 10000,
            unit: 'หลัง',
            status: 'PENDING',
          }),
        ],
      }),
      paymentSplits: [{ channel: 'TRANSFER', amount: 10000 }],
      depositAmount: 2000,
      depositChannel: 'TRANSFER',
      actor,
    })

    expect(createRes.bill.grandTotal).toBe(10000)
    expect(createRes.bill.billAmount).toBe(10000)
    expect(createRes.bill.heldDepositAmount).toBe(2000)

    // Separate ledger transactions
    const txs = getTransactionsForBill('bill-c1')
    const revTx = txs.find((t) => !t.isDeposit)
    const depTx = txs.find((t) => t.isDeposit)
    expect(revTx?.incomeAmount).toBe(10000)
    expect(depTx?.incomeAmount).toBe(2000)
  })

  it('Case 2: Bill 10,000, paid 3,000 -> bill outstanding = 7,000 (deposit not counted as revenue or outstanding offset)', () => {
    const core = calculateFinancialCore({
      billAmount: 10000,
      netPaid: 3000,
      securityDeposit: { received: 2000 },
    })

    expect(core.billAmount).toBe(10000)
    expect(core.netPaid).toBe(3000)
    expect(core.billOutstanding).toBe(7000) // 10000 - 3000 = 7000, deposit 2000 does NOT reduce outstanding
    expect(core.securityDeposit.held).toBe(2000)
  })

  it('Case 3: Bill 10,000, paid 10,000, then revise bill to 8,000 -> refund due = 2,000, payment history preserved', () => {
    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c3',
        billNo: 'BILL-C3-001',
        customerName: 'คุณสมศักดิ์',
        subtotal: 10000,
        grandTotal: 10000,
        paidAmount: 10000,
        outstandingAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'CONFIRMED',
        dispatchStatus: 'PENDING',
      }),
      paymentSplits: [{ channel: 'TRANSFER', amount: 10000, referenceNo: 'TX-INITIAL-10K' }],
      actor,
    })

    const initialTxs = getTransactionsForBill('bill-c3')
    expect(initialTxs.length).toBe(1)
    expect(initialTxs[0].incomeAmount).toBe(10000)

    // Revise bill down to 8,000
    const revResult = processBillRevisionWorkflow({
      billId: 'bill-c3',
      mode: 'CORRECTION',
      newSubtotal: 8000,
      newGrandTotal: 8000,
      reason: 'ลูกค้าขอลดจำนวนสินค้า',
      actor,
    })

    expect(revResult.bill.grandTotal).toBe(8000)
    expect(revResult.bill.paidAmount).toBe(10000)
    expect(revResult.bill.refundDue).toBe(2000)
    expect(revResult.bill.outstandingAmount).toBe(0)

    // Payment history is preserved: initial 10,000 transaction is still in ledger!
    const postTxs = getTransactionsForBill('bill-c3')
    const originalPayment = postTxs.find((t) => t.refNo?.includes('TX-INITIAL-10K'))
    expect(originalPayment).toBeDefined()
    expect(originalPayment?.incomeAmount).toBe(10000)
  })

  it('Case 4: Split payment: records 1 transaction per channel, reconciles total', async () => {
    const uniqueBillId = `bill-c4-${Date.now()}`
    const uniqueBillNo = `BILL-C4-${Date.now().toString(36)}`

    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: uniqueBillId,
        billNo: uniqueBillNo,
        customerName: 'คุณนภา',
        subtotal: 5000,
        grandTotal: 5000,
        paidAmount: 0,
        outstandingAmount: 5000,
        paymentStatus: 'UNPAID',
        rentalStatus: 'CONFIRMED',
        dispatchStatus: 'PENDING',
      }),
      actor,
    })

    await saveBillToSupabase(createRes.bill)

    const payResult = await processSplitPaymentWorkflow({
      billId: createRes.bill.id,
      splits: [
        { channel: 'CASH', amount: 2000, referenceNo: 'CASH-001' },
        { channel: 'TRANSFER', amount: 3000, referenceNo: 'TRF-002' },
      ],
      actor,
    })

    expect(payResult.bill.paidAmount).toBe(5000)
    expect(payResult.bill.paymentStatus).toBe('PAID')
    expect(payResult.bill.outstandingAmount).toBe(0)

    const txs = getTransactionsForBill(createRes.bill.id)
    expect(txs.length).toBe(2)
    const cashTx = txs.find((t) => t.channel === 'CASH')
    const trfTx = txs.find((t) => t.channel === 'TRANSFER')
    expect(cashTx?.incomeAmount).toBe(2000)
    expect(trfTx?.incomeAmount).toBe(3000)
  })

  // ==========================================
  // GROUP 2: RENTAL & STATUS (Cases 5 - 9)
  // ==========================================

  it('Case 5: Confirm bill without dispatch -> status = "CONFIRMED" (not "RENTING")', () => {
    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c5',
        billNo: 'BILL-C5-001',
        customerName: 'คุณประสิทธิ์',
        subtotal: 2000,
        grandTotal: 2000,
        paidAmount: 2000,
        outstandingAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING', // Attempting to pass RENTING before dispatch
        dispatchStatus: 'PENDING',
        items: [
          buildFullBillItem({
            rentalBillItemId: 'item-c5',
            productId: sampleProductA.id,
            quantity: 2,
            dailyRate: 1000,
            unit: 'หลัง',
            status: 'PENDING',
          }),
        ],
      }),
      actor,
    })

    // System enforces CONFIRMED because dispatchStatus is PENDING
    expect(createRes.bill.rentalStatus).toBe('CONFIRMED')
    expect(createRes.bill.dispatchStatus).toBe('PENDING')

    // Revenue recognized before handover must be 0 (MASTER v2.3.0 Section 5.3)
    const recognized = calculateRevenueRecognized({
      dispatchStatus: createRes.bill.dispatchStatus,
      items: [
        {
          rentalType: 'DAILY',
          quantity: 2,
          unitPrice: 1000,
        },
      ],
    })
    expect(recognized).toBe(0)
  })

  it('Case 6: Dispatch bill -> status = "RENTING", stock updated', () => {
    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c6',
        billNo: 'BILL-C6-001',
        customerName: 'คุณกิตติ',
        subtotal: 2000,
        grandTotal: 2000,
        paidAmount: 2000,
        outstandingAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'CONFIRMED',
        dispatchStatus: 'PENDING',
        items: [
          buildFullBillItem({
            rentalBillItemId: 'item-c6',
            productId: sampleProductA.id,
            quantity: 2,
            dailyRate: 1000,
            unit: 'หลัง',
            status: 'PENDING',
          }),
        ],
      }),
      actor,
    })

    expect(createRes.bill.rentalStatus).toBe('CONFIRMED')

    // Dispatch the bill
    const dispatchRes = dispatchBillWorkflow({
      billId: createRes.bill.id,
      actor,
    })

    expect(dispatchRes.bill.dispatchStatus).toBe('DISPATCHED')
    expect(dispatchRes.bill.rentalStatus).toBe('RENTING')

    // Stock verified
    const prodA = loadProducts().find((p) => p.id === sampleProductA.id)!
    expect(prodA.availableQuantity).toBe(18) // 20 - 2
    expect(prodA.rentedQuantity).toBe(2)
  })

  it('Case 7: Partial return -> remaining items still renting, return recorded', () => {
    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c7',
        billNo: 'BILL-C7-001',
        customerName: 'คุณวันชัย',
        subtotal: 5000,
        grandTotal: 5000,
        paidAmount: 5000,
        outstandingAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        items: [
          buildFullBillItem({
            rentalBillItemId: 'item-c7',
            productId: sampleProductA.id,
            quantity: 5,
            returnedQty: 0,
            outstandingQty: 5,
            dailyRate: 1000,
            unit: 'หลัง',
            status: 'RENTING',
          }),
        ],
      }),
      actor,
    })

    // Return 2 units normal
    const returnRes = processReturnWorkflow({
      billId: createRes.bill.id,
      returnItems: [
        {
          rentalBillItemId: 'item-c7',
          productId: sampleProductA.id,
          normalQty: 2,
          damagedQty: 0,
          lostQty: 0,
        },
      ],
      actor,
    })

    const updatedItem = returnRes.bill.items.find((i) => i.rentalBillItemId === 'item-c7')!
    expect(updatedItem.returnedQty).toBe(2)
    expect(updatedItem.outstandingQty).toBe(3)
    expect(returnRes.bill.rentalStatus).toBe('PARTIAL_RETURNED')

    const prodA = loadProducts().find((p) => p.id === sampleProductA.id)!
    expect(prodA.availableQuantity).toBe(17) // 15 + 2 returned
    expect(prodA.rentedQuantity).toBe(3)
  })

  it('Case 8: Damaged/Lost return -> damage/loss fee calculated from actual input, stock updated', () => {
    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c8',
        billNo: 'BILL-C8-001',
        customerName: 'คุณมานพ',
        subtotal: 5000,
        grandTotal: 5000,
        paidAmount: 5000,
        outstandingAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        items: [
          buildFullBillItem({
            rentalBillItemId: 'item-c8',
            productId: sampleProductA.id,
            quantity: 5,
            returnedQty: 0,
            outstandingQty: 5,
            dailyRate: 1000,
            unit: 'หลัง',
            status: 'RENTING',
          }),
        ],
      }),
      actor,
    })

    // Return: 2 normal, 2 damaged, 1 lost
    // Operator specifies actual repair fee 600 per unit (total 1200), replacement 4500 per unit (total 4500)
    const returnRes = processReturnWorkflow({
      billId: createRes.bill.id,
      returnItems: [
        {
          rentalBillItemId: 'item-c8',
          productId: sampleProductA.id,
          normalQty: 2,
          damagedQty: 2,
          lostQty: 1,
        },
      ],
      actualDamageCharges: [
        {
          rentalBillItemId: 'item-c8',
          damagedQty: 2,
          repairFeePerUnit: 600,
          actualDamageCharge: 1200,
          lostQty: 1,
          replacementFeePerUnit: 4500,
          actualLossCharge: 4500,
        },
      ],
      actor,
    })

    expect(returnRes.totalDamageCharges).toBe(5700) // 1200 + 4500

    const prodA = loadProducts().find((p) => p.id === sampleProductA.id)!
    expect(prodA.availableQuantity).toBe(17) // 15 + 2 normal
    expect(prodA.damagedQuantity).toBe(2)
    expect(prodA.lostQuantity).toBe(1)
    expect(prodA.rentedQuantity).toBe(0)
  })

  it('Case 9: Extension -> original bill marked EXTENDED, new bill created with originalBillId', () => {
    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c9-orig',
        billNo: 'BILL-C9-001',
        customerName: 'คุณชัยยศ',
        subtotal: 3000,
        grandTotal: 3000,
        paidAmount: 3000,
        outstandingAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        items: [
          buildFullBillItem({
            rentalBillItemId: 'item-c9',
            productId: sampleProductA.id,
            quantity: 1,
            returnedQty: 0,
            outstandingQty: 1,
            dailyRate: 1000,
            unit: 'หลัง',
            status: 'RENTING',
          }),
        ],
      }),
      actor,
    })

    // Extend original bill by 2 days with 2,000 fee
    const extRes = processBillRevisionWorkflow({
      billId: 'bill-c9-orig',
      mode: 'EXTENSION',
      extensionDays: 2,
      extensionFee: 2000,
      reason: 'ลูกค้าขอต่อเวลาเช่าเพิ่ม 2 วัน',
      actor,
    })

    // Original bill marked EXTENDED and preserved
    const origBillAfter = loadBillById('bill-c9-orig')!
    expect(origBillAfter.rentalStatus).toBe('EXTENDED')
    expect(origBillAfter.grandTotal).toBe(3000)

    // Extension bill created and linked
    const extBill = extRes.extensionBill!
    expect(extBill).toBeDefined()
    expect(extBill.originalBillId).toBe('bill-c9-orig')
    expect(extBill.grandTotal).toBe(2000)
    expect(extBill.rentalStatus).toBe('RENTING')
  })

  // ==========================================
  // GROUP 3: DEPOSIT SETTLEMENT (Cases 10 - 12)
  // ==========================================

  it('Case 10: Deposit > damage -> refund difference (deposit 2,000, damage 500 -> refund 1,500)', () => {
    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c10',
        billNo: 'BILL-C10-001',
        customerName: 'คุณวิทวัส',
        subtotal: 1000,
        grandTotal: 1000,
        paidAmount: 1000,
        outstandingAmount: 0,
        paidDepositAmount: 2000,
        heldDepositAmount: 2000,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        deposits: [
          {
            id: 'dep-c10',
            amount: 2000,
            refundAmount: 0,
            appliedAmount: 0,
            heldAmount: 2000,
            status: 'HELD',
            receivedDate: '2026-09-22',
            paymentMethod: 'TRANSFER',
            referenceNo: 'DEP-C10',
          },
        ],
        items: [
          buildFullBillItem({
            rentalBillItemId: 'item-c10',
            productId: sampleProductB.id,
            quantity: 10,
            returnedQty: 0,
            outstandingQty: 10,
            dailyRate: 20,
            unit: 'ตัว',
            status: 'RENTING',
          }),
        ],
      }),
      depositAmount: 2000,
      actor,
    })

    // Return with damage 500, deductFromDeposit: true, isConfirmed: true
    const retRes = processReturnWorkflow({
      billId: createRes.bill.id,
      returnItems: [
        {
          rentalBillItemId: 'item-c10',
          productId: sampleProductB.id,
          normalQty: 0,
          damagedQty: 10,
          lostQty: 0,
        },
      ],
      actualDamageCharges: [
        {
          rentalBillItemId: 'item-c10',
          damagedQty: 10,
          repairFeePerUnit: 50,
          actualDamageCharge: 500,
        },
      ],
      deductFromDeposit: true,
      isConfirmed: true,
      actor,
    })

    expect(retRes.depositApplied).toBe(500)
    expect(retRes.depositRefund).toBe(1500)
    expect(retRes.bill.heldDepositAmount).toBe(0)
    expect(retRes.bill.deposits?.[0]?.status).toBe('SETTLED')

    // Ledger records deposit settlement
    const txs = getTransactionsForBill('bill-c10')
    const appliedTx = txs.find((t) => t.category === 'หักมัดจำชำระค่าเสียหาย')
    const refundTx = txs.find((t) => t.category === 'คืนเงินมัดจำ')
    expect(appliedTx?.incomeAmount).toBe(500)
    expect(refundTx?.expenseAmount).toBe(1500)
  })

  it('Case 11: Deposit == damage -> settled evenly (deposit 2,000, damage 2,000 -> refund 0)', () => {
    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c11',
        billNo: 'BILL-C11-001',
        customerName: 'คุณปรีชา',
        subtotal: 1000,
        grandTotal: 1000,
        paidAmount: 1000,
        outstandingAmount: 0,
        paidDepositAmount: 2000,
        heldDepositAmount: 2000,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        deposits: [
          {
            id: 'dep-c11',
            amount: 2000,
            refundAmount: 0,
            appliedAmount: 0,
            heldAmount: 2000,
            status: 'HELD',
            receivedDate: '2026-09-22',
            paymentMethod: 'TRANSFER',
            referenceNo: 'DEP-C11',
          },
        ],
        items: [
          buildFullBillItem({
            rentalBillItemId: 'item-c11',
            productId: sampleProductA.id,
            quantity: 1,
            returnedQty: 0,
            outstandingQty: 1,
            dailyRate: 1000,
            unit: 'หลัง',
            status: 'RENTING',
          }),
        ],
      }),
      depositAmount: 2000,
      actor,
    })

    const retRes = processReturnWorkflow({
      billId: createRes.bill.id,
      returnItems: [
        {
          rentalBillItemId: 'item-c11',
          productId: sampleProductA.id,
          normalQty: 0,
          damagedQty: 1,
          lostQty: 0,
        },
      ],
      actualDamageCharges: [
        {
          rentalBillItemId: 'item-c11',
          damagedQty: 1,
          repairFeePerUnit: 2000,
          actualDamageCharge: 2000,
        },
      ],
      deductFromDeposit: true,
      isConfirmed: true,
      actor,
    })

    expect(retRes.depositApplied).toBe(2000)
    expect(retRes.depositRefund).toBe(0)
    expect(retRes.bill.heldDepositAmount).toBe(0)
    expect(retRes.bill.deposits?.[0]?.status).toBe('SETTLED')
  })

  it('Case 12: Deposit < damage -> deposit exhausted, balance due increased (deposit 2,000, damage 3,000 -> balance 1,000)', () => {
    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c12',
        billNo: 'BILL-C12-001',
        customerName: 'คุณสุรชัย',
        subtotal: 1000,
        grandTotal: 1000,
        paidAmount: 1000,
        outstandingAmount: 0,
        paidDepositAmount: 2000,
        heldDepositAmount: 2000,
        paymentStatus: 'PAID',
        rentalStatus: 'RENTING',
        dispatchStatus: 'DISPATCHED',
        deposits: [
          {
            id: 'dep-c12',
            amount: 2000,
            refundAmount: 0,
            appliedAmount: 0,
            heldAmount: 2000,
            status: 'HELD',
            receivedDate: '2026-09-22',
            paymentMethod: 'TRANSFER',
            referenceNo: 'DEP-C12',
          },
        ],
        items: [
          buildFullBillItem({
            rentalBillItemId: 'item-c12',
            productId: sampleProductA.id,
            quantity: 1,
            returnedQty: 0,
            outstandingQty: 1,
            dailyRate: 1000,
            unit: 'หลัง',
            status: 'RENTING',
          }),
        ],
      }),
      depositAmount: 2000,
      actor,
    })

    const retRes = processReturnWorkflow({
      billId: createRes.bill.id,
      returnItems: [
        {
          rentalBillItemId: 'item-c12',
          productId: sampleProductA.id,
          normalQty: 0,
          damagedQty: 1,
          lostQty: 0,
        },
      ],
      actualDamageCharges: [
        {
          rentalBillItemId: 'item-c12',
          damagedQty: 1,
          repairFeePerUnit: 3000,
          actualDamageCharge: 3000,
        },
      ],
      deductFromDeposit: true,
      isConfirmed: true,
      actor,
    })

    expect(retRes.depositApplied).toBe(2000)
    expect(retRes.depositRefund).toBe(0)
    expect(retRes.bill.heldDepositAmount).toBe(0)
    expect(retRes.bill.outstandingAmount).toBe(1000) // remaining 1000 added to balance due
    expect(retRes.bill.paymentStatus).toBe('PARTIAL')
  })

  // ==========================================
  // GROUP 4: QUOTATION (Cases 13 - 15)
  // ==========================================

  it('Case 13: Confirm quotation -> status ACCEPTED, 0 reservations created', () => {
    const q: Quotation = {
      id: 'quote-c13',
      quotationNo: 'QT-C13-001',
      quotationDate: '2026-09-22',
      expiryDate: '2026-10-05',
      customerId: 'cust-13',
      customerName: 'คุณวิเชียร',
      phone: '0898887777',
      rentalStartDate: '2026-10-01',
      rentalEndDate: '2026-10-05',
      items: [
        {
          productId: sampleProductA.id,
          productName: sampleProductA.name,
          rentalType: 'DAILY',
          quantity: 5,
          unitName: 'หลัง',
          unitPrice: 1000,
          usageCountOrDays: 5,
          lineTotal: 5000,
        },
      ],
      subtotal: 5000,
      discountAmount: 0,
      shippingFee: 0,
      depositAmount: 2000,
      taxAmount: 0,
      grandTotal: 5000,
      status: 'WAITING',
    }
    addQuotation(q)

    // Confirm quotation
    const confirmed = confirmQuotationWorkflow('quote-c13', actor)
    expect(confirmed.quotation.status).toBe('ACCEPTED')

    // MASTER v2.3.0 Section 7.3: Quotation confirm MUST NOT create reservations
    const reservations = loadReservations()
    expect(reservations.length).toBe(0)
  })

  it('Case 14: Confirm quotation -> 0 backorders created', () => {
    // Quotation for quantity 50 when available is only 20
    const q: Quotation = {
      id: 'quote-c14',
      quotationNo: 'QT-C14-001',
      quotationDate: '2026-09-22',
      expiryDate: '2026-10-05',
      customerId: 'cust-14',
      customerName: 'คุณวิชัย',
      phone: '0897776666',
      rentalStartDate: '2026-10-01',
      rentalEndDate: '2026-10-05',
      items: [
        {
          productId: sampleProductA.id,
          productName: sampleProductA.name,
          rentalType: 'DAILY',
          quantity: 50,
          unitName: 'หลัง',
          unitPrice: 1000,
          usageCountOrDays: 5,
          lineTotal: 50000,
        },
      ],
      subtotal: 50000,
      discountAmount: 0,
      shippingFee: 0,
      depositAmount: 10000,
      taxAmount: 0,
      grandTotal: 50000,
      status: 'WAITING',
    }
    addQuotation(q)

    const confirmed = confirmQuotationWorkflow('quote-c14', actor)
    expect(confirmed.quotation.status).toBe('ACCEPTED')

    // MASTER v2.3.0 Section 7.3: Quotation confirm MUST NOT create backorders
    const backorders = loadBackorders()
    expect(backorders.length).toBe(0)
  })

  it('Case 15: Convert quotation to bill -> items, customer, pricing transferred', () => {
    const q: Quotation = {
      id: 'quote-c15',
      quotationNo: 'QT-C15-001',
      quotationDate: '2026-09-22',
      expiryDate: '2026-10-05',
      customerId: 'cust-15',
      customerName: 'คุณประพันธ์',
      phone: '0812345678',
      rentalStartDate: '2026-10-01',
      rentalEndDate: '2026-10-05',
      items: [
        {
          productId: sampleProductA.id,
          productName: sampleProductA.name,
          rentalType: 'DAILY',
          quantity: 3,
          unitName: 'หลัง',
          unitPrice: 1000,
          usageCountOrDays: 5,
          lineTotal: 3000,
        },
      ],
      subtotal: 3000,
      discountAmount: 0,
      shippingFee: 0,
      depositAmount: 1500,
      taxAmount: 0,
      grandTotal: 3000,
      status: 'ACCEPTED',
    }
    addQuotation(q)

    // Convert quotation to bill via createBillWorkflow
    const billRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c15',
        billNo: 'BILL-C15-001',
        quotationId: q.id,
        customerName: q.customerName,
        customerPhone: q.phone,
        rentalStartDate: q.rentalStartDate,
        scheduledReturnDate: q.rentalEndDate,
        subtotal: q.subtotal,
        grandTotal: q.grandTotal,
        paidAmount: 0,
        outstandingAmount: q.grandTotal,
        paymentStatus: 'UNPAID',
        rentalStatus: 'CONFIRMED',
        dispatchStatus: 'PENDING',
        items: q.items.map((qi, idx) => buildFullBillItem({
          rentalBillItemId: `item-c15-${idx}`,
          productId: qi.productId,
          productName: qi.productName,
          quantity: qi.quantity,
          dailyRate: qi.unitPrice,
          lineTotal: qi.lineTotal,
          unit: qi.unitName || 'หลัง',
          status: 'PENDING',
        })),
      }),
      actor,
    })

    expect(billRes.bill.customerName).toBe('คุณประพันธ์')
    expect(billRes.bill.customerPhone).toBe('0812345678')
    expect(billRes.bill.grandTotal).toBe(3000)
    expect(billRes.bill.items.length).toBe(1)
    expect(billRes.bill.items[0].quantity).toBe(3)

    // Quotation is marked CONVERTED
    const updatedQ = getQuotationById('quote-c15')!
    expect(updatedQ.status).toBe('CONVERTED')
    expect(updatedQ.convertedBillId).toBe('bill-c15')
  })

  // ==========================================
  // GROUP 5: STOCK VALIDATION (Cases 16 - 18)
  // ==========================================

  it('Case 16: Bill confirmed -> reservation created', () => {
    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c16',
        billNo: 'BILL-C16-001',
        customerName: 'คุณอนุรักษ์',
        rentalStartDate: '2026-10-01',
        scheduledReturnDate: '2026-10-05',
        subtotal: 4000,
        grandTotal: 4000,
        paidAmount: 4000,
        outstandingAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'CONFIRMED',
        dispatchStatus: 'PENDING',
        items: [
          buildFullBillItem({
            rentalBillItemId: 'item-c16',
            productId: sampleProductA.id,
            productCode: sampleProductA.code,
            productName: sampleProductA.name,
            quantity: 4,
            dailyRate: 1000,
            lineTotal: 4000,
            unit: 'หลัง',
            status: 'PENDING',
          }),
        ],
      }),
      actor,
    })

    // Reservations table has record
    const reservations = loadReservations()
    expect(reservations.length).toBe(1)
    expect(reservations[0].sourceType).toBe('BILL')
    expect(reservations[0].sourceId).toBe('bill-c16')
    expect(reservations[0].quantity).toBe(4)

    // Product reservedQuantity is synced
    const prodA = loadProducts().find((p) => p.id === sampleProductA.id)!
    expect(prodA.reservedQuantity).toBe(4)
  })

  it('Case 17: Bill creation with insufficient stock -> rejected with clear error (not silently clamped)', () => {
    // sampleProductA has availableQuantity: 20. Attempt to dispatch with quantity 25.
    expect(() => {
      createBillWorkflow({
        bill: buildFullBill({
          id: 'bill-c17',
          billNo: 'BILL-C17-001',
          customerName: 'คุณวีระ',
          subtotal: 25000,
          grandTotal: 25000,
          paidAmount: 25000,
          outstandingAmount: 0,
          paymentStatus: 'PAID',
          rentalStatus: 'RENTING',
          dispatchStatus: 'DISPATCHED', // physical dispatch requires stock check
          items: [
            buildFullBillItem({
              rentalBillItemId: 'item-c17',
              productId: sampleProductA.id,
              productCode: sampleProductA.code,
              productName: sampleProductA.name,
              quantity: 25, // Available is only 20!
              dailyRate: 1000,
              lineTotal: 25000,
              unit: 'หลัง',
              status: 'RENTING',
            }),
          ],
        }),
        actor,
      })
    }).toThrow(/สต็อกสินค้า .* ไม่เพียงพอสำหรับการทำรายการ/)

    // Stock must not be mutated or clamped to 0
    const prodA = loadProducts().find((p) => p.id === sampleProductA.id)!
    expect(prodA.availableQuantity).toBe(20)
    expect(prodA.rentedQuantity).toBe(0)
  })

  it('Case 18: Bill dispatch with insufficient stock -> rejected with clear error, atomic rollback', () => {
    // Create a pending bill with 2 items:
    // Item 1: Product A (wants 5, available 20 - OK)
    // Item 2: Product B (wants 150, available 100 - INSUFFICIENT)
    const createRes = createBillWorkflow({
      bill: buildFullBill({
        id: 'bill-c18',
        billNo: 'BILL-C18-001',
        customerName: 'คุณชลิต',
        rentalStartDate: '2026-10-01',
        scheduledReturnDate: '2026-10-05',
        subtotal: 8000,
        grandTotal: 8000,
        paidAmount: 8000,
        outstandingAmount: 0,
        paymentStatus: 'PAID',
        rentalStatus: 'CONFIRMED',
        dispatchStatus: 'PENDING',
        items: [
          buildFullBillItem({
            rentalBillItemId: 'item-c18-1',
            productId: sampleProductA.id,
            productCode: sampleProductA.code,
            productName: sampleProductA.name,
            quantity: 5,
            dailyRate: 1000,
            unit: 'หลัง',
            status: 'PENDING',
          }),
          buildFullBillItem({
            rentalBillItemId: 'item-c18-2',
            productId: sampleProductB.id,
            productCode: sampleProductB.code,
            productName: sampleProductB.name,
            quantity: 150, // exceeds available 100
            dailyRate: 20,
            unit: 'ตัว',
            status: 'PENDING',
          }),
        ],
      }),
      actor,
    })

    // Now attempt dispatch -> must throw clear error
    expect(() => {
      dispatchBillWorkflow({
        billId: createRes.bill.id,
        actor,
      })
    }).toThrow(/สต็อกไม่เพียงพอสำหรับการส่งมอบ/)

    // Verify atomic rollback: Product A must NOT have been dispatched/rented!
    const prodA = loadProducts().find((p) => p.id === sampleProductA.id)!
    const prodB = loadProducts().find((p) => p.id === sampleProductB.id)!
    expect(prodA.availableQuantity).toBe(20)
    expect(prodA.rentedQuantity).toBe(0)
    expect(prodB.availableQuantity).toBe(100)
    expect(prodB.rentedQuantity).toBe(0)

    // Bill status must remain CONFIRMED and PENDING
    const billAfter = loadBillById(createRes.bill.id)!
    expect(billAfter.rentalStatus).toBe('CONFIRMED')
    expect(billAfter.dispatchStatus).toBe('PENDING')
  })
})
