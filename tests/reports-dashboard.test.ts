/**
 * Integration tests: Report Summary Service
 *
 * Tests computeFinancialSummary, computeStockSummary,
 * computeRentalOperationalSummary, and computeQuotationSummary
 * using real Storage functions with mocked localStorage.
 *
 * Rules asserted:
 * - Deposit ≠ Revenue (isDeposit transactions excluded from grossReceived)
 * - Refund reduces net revenue
 * - VOID / CANCELLED bills excluded from outstanding
 * - Reserved stock NOT counted as available
 * - Backorder status READY counts as pending
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  computeFinancialSummary,
  computeStockSummary,
  computeRentalOperationalSummary,
  computeQuotationSummary,
  computeTopProducts,
  computeTopCustomers,
} from '../lib/report-summary-service'

// ─── localStorage mock ───────────────────────────────────────────────────────

const store: Record<string, string> = {}
const localStorageMock = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
}
Object.defineProperty(global, 'localStorage', { value: localStorageMock })
Object.defineProperty(global, 'window', { value: global, writable: true })

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setFinance(txs: object[]) {
  store['app_finance_storage'] = JSON.stringify(txs)
}

function setBills(bills: object[]) {
  store['app_bill_storage'] = JSON.stringify(bills)
}

function setProducts(prods: object[]) {
  store['app_product_storage'] = JSON.stringify(prods)
}

function setReservations(rsvs: object[]) {
  store['app_reservation_storage'] = JSON.stringify(rsvs)
}

function setBackorders(bos: object[]) {
  store['app_backorder_storage'] = JSON.stringify(bos)
}

function setQuotations(qs: object[]) {
  store['app_quotation_storage'] = JSON.stringify(qs)
}

function makeTx(overrides: object) {
  return {
    id: `tx-${Math.random()}`,
    dateTime: '2026-01-15T10:00:00.000Z',
    refNo: 'TX-001',
    type: 'INCOME',
    category: 'ค่าเช่าอุปกรณ์',
    description: 'test',
    incomeAmount: 0,
    expenseAmount: 0,
    runningBalance: 0,
    channel: 'โอนเงิน',
    isDeposit: false,
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => localStorageMock.clear())

describe('computeFinancialSummary', () => {
  it('1. grossReceived sums INCOME non-deposit transactions', () => {
    setFinance([
      makeTx({ incomeAmount: 1000, type: 'INCOME', isDeposit: false }),
      makeTx({ incomeAmount: 500,  type: 'INCOME', isDeposit: false }),
    ])
    setBills([])
    const r = computeFinancialSummary()
    expect(r.grossReceived).toBe(1500)
  })

  it('2. depositReceived is NOT counted in grossReceived', () => {
    setFinance([
      makeTx({ incomeAmount: 1000, type: 'INCOME', isDeposit: false }),
      makeTx({ incomeAmount: 300,  type: 'INCOME', isDeposit: true }),
    ])
    setBills([])
    const r = computeFinancialSummary()
    expect(r.grossReceived).toBe(1000)
    expect(r.depositReceived).toBe(300)
  })

  it('3. refundTotal from EXPENSE non-deposit transactions', () => {
    setFinance([
      makeTx({ incomeAmount: 2000, type: 'INCOME', isDeposit: false }),
      makeTx({ expenseAmount: 400, type: 'EXPENSE', isDeposit: false }),
    ])
    setBills([])
    const r = computeFinancialSummary()
    expect(r.refundTotal).toBe(400)
    expect(r.netReceived).toBe(1600)
  })

  it('4. depositHeld = depositReceived - depositRefunded', () => {
    setFinance([
      makeTx({ incomeAmount: 500, type: 'INCOME', isDeposit: true }),
      makeTx({ expenseAmount: 200, type: 'EXPENSE', isDeposit: true }),
    ])
    setBills([])
    const r = computeFinancialSummary()
    expect(r.depositReceived).toBe(500)
    expect(r.depositRefunded).toBe(200)
    expect(r.depositHeld).toBe(300)
  })

  it('5. date range filter applies to transactions', () => {
    setFinance([
      makeTx({ dateTime: '2026-01-10T10:00:00.000Z', incomeAmount: 999 }),
      makeTx({ dateTime: '2026-01-15T10:00:00.000Z', incomeAmount: 100 }),
      makeTx({ dateTime: '2026-01-20T10:00:00.000Z', incomeAmount: 888 }),
    ])
    setBills([])
    const r = computeFinancialSummary({ startDate: '2026-01-14', endDate: '2026-01-16' })
    expect(r.grossReceived).toBe(100)
    expect(r.txCount).toBe(1)
  })

  it('6. outstanding excludes VOID and CANCELLED bills', () => {
    setBills([
      { id: 'b1', rentalStatus: 'RENTING',   paymentStatus: 'UNPAID', outstandingAmount: 1000 },
      { id: 'b2', rentalStatus: 'CANCELLED', paymentStatus: 'VOID',   outstandingAmount: 500 },
      { id: 'b3', rentalStatus: 'CLOSED',    paymentStatus: 'PAID',   outstandingAmount: 200 },
    ])
    setFinance([])
    const r = computeFinancialSummary()
    expect(r.outstanding).toBe(1000) // only b1
  })

  it('7. byPaymentMethod groups and sums by channel', () => {
    setFinance([
      makeTx({ incomeAmount: 1000, channel: 'โอนเงิน' }),
      makeTx({ incomeAmount: 500,  channel: 'โอนเงิน' }),
      makeTx({ incomeAmount: 200,  channel: 'เงินสด' }),
    ])
    setBills([])
    const r = computeFinancialSummary()
    const transfer = r.byPaymentMethod.find((m) => m.method === 'โอนเงิน')
    const cash = r.byPaymentMethod.find((m) => m.method === 'เงินสด')
    expect(transfer?.amount).toBe(1500)
    expect(transfer?.count).toBe(2)
    expect(cash?.amount).toBe(200)
  })

  it('8. daily array has one entry per distinct date in range', () => {
    setFinance([
      makeTx({ dateTime: '2026-01-01T10:00:00.000Z', incomeAmount: 100 }),
      makeTx({ dateTime: '2026-01-01T14:00:00.000Z', incomeAmount: 200 }),
      makeTx({ dateTime: '2026-01-02T10:00:00.000Z', incomeAmount: 50 }),
    ])
    setBills([])
    const r = computeFinancialSummary()
    expect(r.daily).toHaveLength(2)
    const jan1 = r.daily.find((d) => d.date === '2026-01-01')
    expect(jan1?.income).toBe(300)
  })

  it('8b. netReceived allows negative value when refund exceeds gross revenue', () => {
    setFinance([
      makeTx({ incomeAmount: 300, type: 'INCOME', isDeposit: false }),
      makeTx({ expenseAmount: 800, type: 'EXPENSE', isDeposit: false }),
    ])
    setBills([])
    const r = computeFinancialSummary()
    expect(r.grossReceived).toBe(300)
    expect(r.refundTotal).toBe(800)
    expect(r.netReceived).toBe(-500)
  })

  it('8c. depositHeld calculates all-time held deposits regardless of date range filter', () => {
    setFinance([
      // Past deposit outside date filter
      makeTx({ dateTime: '2026-01-01T10:00:00.000Z', incomeAmount: 1000, type: 'INCOME', isDeposit: true }),
      // In-range transaction
      makeTx({ dateTime: '2026-01-15T10:00:00.000Z', incomeAmount: 200, type: 'INCOME', isDeposit: false }),
    ])
    setBills([])
    const r = computeFinancialSummary({ startDate: '2026-01-14', endDate: '2026-01-16' })
    expect(r.grossReceived).toBe(200)
    expect(r.depositReceived).toBe(0)
    expect(r.depositHeld).toBe(1000)
  })
})

describe('computeStockSummary', () => {
  it('9. available, reserved, rented, damaged, lost are summed separately', () => {
    setProducts([
      { id: 'p1', availableQuantity: 10, reservedQuantity: 2, rentedQuantity: 5, damagedQuantity: 1, lostQuantity: 0 },
      { id: 'p2', availableQuantity: 8,  reservedQuantity: 3, rentedQuantity: 2, damagedQuantity: 0, lostQuantity: 1 },
    ])
    const s = computeStockSummary()
    expect(s.available).toBe(18)
    expect(s.reserved).toBe(5)
    expect(s.rented).toBe(7)
    expect(s.damaged).toBe(1)
    expect(s.lost).toBe(1)
    expect(s.activeProducts).toBe(2)
  })

  it('10. totalPhysical = available + reserved + rented + damaged + lost', () => {
    setProducts([
      { id: 'p1', availableQuantity: 10, reservedQuantity: 2, rentedQuantity: 5, damagedQuantity: 1, lostQuantity: 1 },
    ])
    const s = computeStockSummary()
    expect(s.totalPhysical).toBe(19)
  })

  it('11. reserved is NOT included in available', () => {
    setProducts([
      { id: 'p1', availableQuantity: 10, reservedQuantity: 3, rentedQuantity: 0, damagedQuantity: 0, lostQuantity: 0 },
    ])
    const s = computeStockSummary()
    expect(s.available).toBe(10) // not 13
    expect(s.reserved).toBe(3)
  })
})

describe('computeRentalOperationalSummary', () => {
  it('12. activeRentals counts RENTING bills excluding CLOSED/CANCELLED', () => {
    setBills([
      { id: 'b1', rentalStatus: 'RENTING', paymentStatus: 'UNPAID' },
      { id: 'b2', rentalStatus: 'RENTING', paymentStatus: 'UNPAID' },
      { id: 'b3', rentalStatus: 'CLOSED',  paymentStatus: 'PAID'   },
      { id: 'b4', rentalStatus: 'CANCELLED', paymentStatus: 'VOID' },
    ])
    setReservations([])
    setBackorders([])
    const ops = computeRentalOperationalSummary()
    expect(ops.activeRentals).toBe(2)
  })

  it('13. backorderPending counts PENDING and READY statuses', () => {
    setBills([])
    setReservations([])
    setBackorders([
      { status: 'PENDING' },
      { status: 'READY'   },
      { status: 'FULFILLED' },
      { status: 'CANCELLED' },
    ])
    const ops = computeRentalOperationalSummary()
    expect(ops.backorderPending).toBe(2)
  })

  it('14. overdue counts bills past scheduledReturnDate', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    setBills([
      { id: 'b1', rentalStatus: 'RENTING', scheduledReturnDate: yesterday },
      { id: 'b2', rentalStatus: 'RENTING', scheduledReturnDate: tomorrow },
    ])
    setReservations([])
    setBackorders([])
    const ops = computeRentalOperationalSummary()
    expect(ops.overdue).toBe(1)
  })
})

describe('computeQuotationSummary', () => {
  it('15. counts quotations by status correctly', () => {
    setQuotations([
      { id: 'q1', status: 'DRAFT' },
      { id: 'q2', status: 'SENT' },
      { id: 'q3', status: 'ACCEPTED' },
      { id: 'q4', status: 'CONVERTED' },
      { id: 'q5', status: 'CANCELLED' },
      { id: 'q6', status: 'WAITING' },
      { id: 'q7', status: 'REJECTED' },
      { id: 'q8', status: 'EXPIRED' },
    ])
    const q = computeQuotationSummary()
    expect(q.draft).toBe(1)
    expect(q.sent).toBe(1)
    expect(q.waiting).toBe(1)
    expect(q.accepted).toBe(1)
    expect(q.converted).toBe(1)
    expect(q.cancelled).toBe(1)
    expect(q.rejected).toBe(1)
    expect(q.expired).toBe(1)
    expect(q.total).toBe(8)
  })
})
