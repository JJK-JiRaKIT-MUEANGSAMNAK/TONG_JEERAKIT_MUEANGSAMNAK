import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  recordAuditLog,
  loadAuditLogs,
  getAuditLogsByEntity,
  getAuditLogsByCorrelationId,
  getAuditLogsForBill,
  generateCorrelationId,
  isHighRiskAction,
  AUDIT_STORAGE_KEY,
} from '../lib/audit-storage'

// Simulated in-memory localStorage adhering to Web Storage API
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

describe('Centralized Audit Log Service (lib/audit-storage.ts)', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('generates unique correlation IDs', () => {
    const id1 = generateCorrelationId()
    const id2 = generateCorrelationId()
    expect(id1).toBeDefined()
    expect(id2).toBeDefined()
    expect(id1).not.toBe(id2)
  })

  it('correctly identifies high-risk actions', () => {
    expect(isHighRiskAction('BILL_CANCEL')).toBe(true)
    expect(isHighRiskAction('BILL_VOID')).toBe(true)
    expect(isHighRiskAction('BILL_DELETE')).toBe(true)
    expect(isHighRiskAction('PRODUCT_DELETE')).toBe(true)
    expect(isHighRiskAction('STOCK_MANUAL_ADJUST')).toBe(true)
    expect(isHighRiskAction('PRICE_OVERRIDE')).toBe(true)
    expect(isHighRiskAction('BILL_CREATE')).toBe(false)
    expect(isHighRiskAction('STOCK_RENT')).toBe(false)
    expect(isHighRiskAction('PAYMENT_RECEIVE')).toBe(false)
  })

  it('records an audit log entry for normal action without reason', () => {
    const correlationId = generateCorrelationId()
    const entry = recordAuditLog({
      userId: 'usr-123',
      displayName: 'สมชาย ผู้จัดการ',
      action: 'BILL_CREATE',
      entityType: 'BILL',
      entityId: 'bill-001',
      before: null,
      after: { billNo: 'BILL-2026-001', grandTotal: 5000 },
      correlationId,
    })

    expect(entry.id).toBeDefined()
    expect(entry.userId).toBe('usr-123')
    expect(entry.displayName).toBe('สมชาย ผู้จัดการ')
    expect(entry.action).toBe('BILL_CREATE')
    expect(entry.entityType).toBe('BILL')
    expect(entry.entityId).toBe('bill-001')
    expect(entry.before).toBeNull()
    expect(entry.after).toEqual({ billNo: 'BILL-2026-001', grandTotal: 5000 })
    expect(entry.correlationId).toBe(correlationId)
    expect(entry.createdAt).toBeDefined()

    const loaded = loadAuditLogs()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe(entry.id)
  })

  it('requires reason for high-risk action and throws if omitted', () => {
    const correlationId = generateCorrelationId()

    // Missing reason on high-risk action
    expect(() => {
      recordAuditLog({
        userId: 'usr-123',
        displayName: 'สมชาย',
        action: 'BILL_CANCEL',
        entityType: 'BILL',
        entityId: 'bill-001',
        before: { rentalStatus: 'RENTING' },
        after: { rentalStatus: 'CANCELLED' },
        correlationId,
      })
    }).toThrow(/requires a valid reason/)

    // Empty whitespace reason
    expect(() => {
      recordAuditLog({
        userId: 'usr-123',
        displayName: 'สมชาย',
        action: 'PRODUCT_DELETE',
        entityType: 'PRODUCT',
        entityId: 'prod-001',
        reason: '   ',
        correlationId,
      })
    }).toThrow(/requires a valid reason/)

    // Valid reason provided
    const validEntry = recordAuditLog({
      userId: 'usr-123',
      displayName: 'สมชาย',
      action: 'BILL_CANCEL',
      entityType: 'BILL',
      entityId: 'bill-001',
      before: { rentalStatus: 'RENTING' },
      after: { rentalStatus: 'CANCELLED' },
      reason: 'ลูกค้ายกเลิกงานหน้างานกะทันหัน',
      correlationId,
    })

    expect(validEntry.reason).toBe('ลูกค้ายกเลิกงานหน้างานกะทันหัน')
  })

  it('links multi-entity mutations using a shared correlationId', () => {
    const operationCorrelationId = generateCorrelationId()
    const actor = { userId: 'usr-admin', displayName: 'แอดมินระบบ' }

    // Mutation 1: Bill Create
    recordAuditLog({
      ...actor,
      action: 'BILL_CREATE',
      entityType: 'BILL',
      entityId: 'bill-999',
      before: null,
      after: { billNo: 'BILL-999', grandTotal: 1200 },
      correlationId: operationCorrelationId,
    })

    // Mutation 2: Stock Rent
    recordAuditLog({
      ...actor,
      action: 'STOCK_RENT',
      entityType: 'STOCK',
      entityId: 'prod-scaffold-01',
      before: { availableQuantity: 50 },
      after: { rentedQtyDelta: 10 },
      correlationId: operationCorrelationId,
    })

    // Mutation 3: Finance Receive
    recordAuditLog({
      ...actor,
      action: 'PAYMENT_RECEIVE',
      entityType: 'FINANCE',
      entityId: 'tx-001',
      before: null,
      after: { amount: 1200, channel: 'TRANSFER' },
      correlationId: operationCorrelationId,
    })

    // Query by correlationId
    const relatedLogs = getAuditLogsByCorrelationId(operationCorrelationId)
    expect(relatedLogs).toHaveLength(3)

    const actions = relatedLogs.map((l) => l.action)
    expect(actions).toContain('BILL_CREATE')
    expect(actions).toContain('STOCK_RENT')
    expect(actions).toContain('PAYMENT_RECEIVE')

    // Query by entity
    const billLogs = getAuditLogsByEntity('BILL', 'bill-999')
    expect(billLogs).toHaveLength(1)
    expect(billLogs[0].entityId).toBe('bill-999')

    const stockLogs = getAuditLogsByEntity('STOCK', 'prod-scaffold-01')
    expect(stockLogs).toHaveLength(1)
  })

  it('provides getAuditLogsForBill by billId and billNo', () => {
    const correlationId = generateCorrelationId()

    recordAuditLog({
      userId: 'usr-1',
      displayName: 'สมศรี',
      action: 'BILL_CREATE',
      entityType: 'BILL',
      entityId: 'bill-unique-123',
      before: null,
      after: { billNo: 'BILL-TH-001', grandTotal: 3000 },
      correlationId,
    })

    recordAuditLog({
      userId: 'usr-1',
      displayName: 'สมศรี',
      action: 'STOCK_RETURN',
      entityType: 'STOCK',
      entityId: 'prod-01',
      before: { billNo: 'BILL-TH-001', returnedQty: 5 },
      after: { status: 'RETURNED' },
      correlationId,
    })

    const billLogs = getAuditLogsForBill('bill-unique-123', 'BILL-TH-001')
    expect(billLogs.length).toBeGreaterThanOrEqual(2)
  })
})
