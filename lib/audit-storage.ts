/**
 * Centralized Audit Log Storage Service
 *
 * Backed by localStorage key 'app_audit_storage'.
 * Single source of truth for all state mutation audit logs across the application.
 *
 * Design principles:
 * - Append-only / Immutable log: Strictly NO update or delete APIs.
 * - Single Correlation ID per user operation spanning multiple entities.
 * - Reason required for high-risk actions (cancels, deletions, adjustments).
 * - Safe for SSR (guards for window / localStorage).
 */

export type AuditEntityType =
  | 'BILL'
  | 'PRODUCT'
  | 'FINANCE'
  | 'STOCK'
  | 'CUSTOMER'
  | 'SETTINGS'
  | string

export interface AuditLogEntry {
  id: string
  userId: string
  displayName: string
  action: string
  entityType: AuditEntityType
  entityId: string
  billId?: string
  before: Record<string, any> | null
  after: Record<string, any> | null
  reason?: string | null
  correlationId: string
  createdAt: string
}

export const AUDIT_STORAGE_KEY = 'app_audit_storage'

export const HIGH_RISK_ACTIONS = [
  'BILL_CANCEL',
  'BILL_VOID',
  'BILL_DELETE',
  'STOCK_MANUAL_ADJUST',
  'STOCK_DAMAGED',
  'STOCK_LOST',
  'PRODUCT_DELETE',
  'PRICE_OVERRIDE',
  'DISCOUNT_OVERRIDE',
  'BACKDATED_EDIT',
  'SETTING_FINANCE_STOCK_UPDATE',
  'PAYMENT_REFUND',
] as const

/**
 * Checks if a given action is classified as high-risk and requires an explicit reason.
 */
export function isHighRiskAction(action: string): boolean {
  const upper = action.toUpperCase()
  if (HIGH_RISK_ACTIONS.some((hra) => hra === upper)) return true
  if (upper.endsWith('_CANCEL') || upper.endsWith('_VOID') || upper.endsWith('_DELETE')) return true
  return false
}

/**
 * Generates a unique correlation ID for linking multi-entity mutations within a single user operation.
 */
export function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `corr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export interface CreateAuditLogParams {
  userId: string
  displayName: string
  action: string
  entityType: AuditEntityType
  entityId: string
  billId?: string
  before?: Record<string, any> | null
  after?: Record<string, any> | null
  reason?: string | null
  correlationId: string
}

/**
 * Records a new audit log entry.
 * Throws an Error if a high-risk action does not provide a valid non-empty reason.
 * Append-only: No modification or deletion allowed.
 */
export function recordAuditLog(params: CreateAuditLogParams): AuditLogEntry {
  const trimmedReason = params.reason?.trim() || null

  if (isHighRiskAction(params.action)) {
    if (!trimmedReason) {
      throw new Error(`Action "${params.action}" is a high-risk mutation and requires a valid reason`)
    }
  }

  const determinedBillId =
    params.billId ||
    params.before?.billId ||
    params.after?.billId ||
    (params.entityType === 'BILL' ? params.entityId : undefined)

  const newEntry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: params.userId || 'system',
    displayName: params.displayName || 'ระบบ',
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    billId: determinedBillId,
    before: params.before ?? null,
    after: params.after ?? null,
    reason: trimmedReason,
    correlationId: params.correlationId || generateCorrelationId(),
    createdAt: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    try {
      const current = loadAuditLogs()
      // Prepend newest log and maintain up to 2000 entries
      const nextLogs = [newEntry, ...current].slice(0, 2000)
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(nextLogs))
    } catch (err) {
      console.error('[AuditLog] Failed to persist audit entry to localStorage:', err)
    }
  }

  return newEntry
}

export interface AuditLogFilter {
  entityType?: string
  entityId?: string
  correlationId?: string
  action?: string
  billNo?: string
}

/**
 * Loads audit logs with optional filtering.
 * Read-only: Does not expose any mutation or deletion capabilities.
 */
export function loadAuditLogs(filter?: AuditLogFilter): AuditLogEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    let list = parsed as AuditLogEntry[]

    if (filter) {
      if (filter.entityType) {
        list = list.filter((e) => e.entityType === filter.entityType)
      }
      if (filter.entityId) {
        list = list.filter((e) => e.entityId === filter.entityId)
      }
      if (filter.correlationId) {
        list = list.filter((e) => e.correlationId === filter.correlationId)
      }
      if (filter.action) {
        list = list.filter((e) => e.action === filter.action)
      }
      if (filter.billNo) {
        list = list.filter(
          (e) =>
            e.before?.billNo === filter.billNo ||
            e.after?.billNo === filter.billNo ||
            e.entityId === filter.billNo
        )
      }
    }
    return list
  } catch {
    return []
  }
}

/**
 * Gets audit logs for a specific entity type and entity ID.
 */
export function getAuditLogsByEntity(entityType: string, entityId: string): AuditLogEntry[] {
  return loadAuditLogs({ entityType, entityId })
}

/**
 * Gets all audit logs created in the scope of a single correlation ID.
 */
export function getAuditLogsByCorrelationId(correlationId: string): AuditLogEntry[] {
  return loadAuditLogs({ correlationId })
}

/**
 * Gets all audit logs associated with a bill (by ID or Bill Number).
 */
export function getAuditLogsForBill(billId: string, billNo?: string): AuditLogEntry[] {
  const allLogs = loadAuditLogs()
  return allLogs.filter((e) => {
    if (e.billId === billId) return true
    if (e.before?.billId === billId || e.after?.billId === billId) return true
    if (e.entityType === 'BILL' && e.entityId === billId) return true
    if (billNo) {
      if (e.before?.billNo === billNo || e.after?.billNo === billNo || e.entityId === billNo) {
        return true
      }
    }
    return false
  })
}
