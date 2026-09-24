import { insertStockMovementToSupabase, generateUUID, isValidUUID } from '@/lib/repositories/product-repository'

/**
 * Stock Movement Domain Model & In-Memory Event Ledger
 *
 * Implements immutable stock movement event logging for all inventory transactions:
 * - RESERVE
 * - RELEASE_RESERVATION
 * - RENT_DISPATCH
 * - SALE_DELIVERY
 * - RETURN_NORMAL
 * - RETURN_DAMAGED
 * - LOST_WRITEOFF
 *
 * Append-only ledger mapped to Supabase stock_movements table.
 * No UPDATE/DELETE permitted.
 */

export type DomainStockMovementType =
  | 'RECEIVE'
  | 'RENT'
  | 'SALE'
  | 'RETURN'
  | 'DAMAGE'
  | 'LOST'
  | 'ADJUSTMENT'

export interface StockStateSnapshot {
  availableQuantity?: number
  rentedQuantity?: number
  damagedQuantity?: number
  lostQuantity?: number
  reservedQuantity?: number
  totalQuantity?: number
}

export interface DomainStockMovement {
  id: string
  type: DomainStockMovementType
  productId: string
  billId?: string
  billLineId?: string
  quantity: number
  beforeState: StockStateSnapshot
  afterState: StockStateSnapshot
  actor: {
    userId: string
    displayName: string
  }
  timestamp: string
  correlationId?: string
  reason?: string
}

export interface CreateStockMovementInput {
  id?: string
  type: DomainStockMovementType
  productId: string
  billId?: string
  billLineId?: string
  quantity: number
  beforeState: StockStateSnapshot
  afterState: StockStateSnapshot
  actor: {
    userId: string
    displayName: string
  }
  timestamp?: string
  correlationId?: string
  reason?: string
}

let inMemoryStockMovements: DomainStockMovement[] = []

/**
 * Generate and record an immutable Stock Movement event.
 * Idempotent: If an event with the exact same correlationId + type + productId + billLineId exists,
 * returns the existing record without duplicating.
 *
 * Uses real UUID for all movement records.
 */
export function recordStockMovement(input: CreateStockMovementInput): DomainStockMovement {
  if (input.correlationId && input.billLineId) {
    const existing = inMemoryStockMovements.find(
      (m) =>
        m.correlationId === input.correlationId &&
        m.type === input.type &&
        m.productId === input.productId &&
        m.billLineId === input.billLineId
    )
    if (existing) {
      return existing
    }
  }

  const recordId = isValidUUID(input.id) ? input.id! : generateUUID()

  const record: DomainStockMovement = {
    id: recordId,
    type: input.type,
    productId: input.productId,
    billId: input.billId,
    billLineId: input.billLineId,
    quantity: Math.max(0, input.quantity),
    beforeState: { ...input.beforeState },
    afterState: { ...input.afterState },
    actor: { ...input.actor },
    timestamp: input.timestamp || new Date().toISOString(),
    correlationId: input.correlationId,
    reason: input.reason,
  }

  inMemoryStockMovements.push(record)

  insertStockMovementToSupabase(record).catch((err) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to append stock movement to Supabase', err)
    }
  })

  return record
}

/**
 * Get all recorded stock movements, optionally filtered.
 */
export function getStockMovements(filter?: {
  billId?: string
  productId?: string
  correlationId?: string
  type?: DomainStockMovementType
}): DomainStockMovement[] {
  return inMemoryStockMovements.filter((m) => {
    if (filter?.billId && m.billId !== filter.billId) return false
    if (filter?.productId && m.productId !== filter.productId) return false
    if (filter?.correlationId && m.correlationId !== filter.correlationId) return false
    if (filter?.type && m.type !== filter.type) return false
    return true
  })
}

/**
 * Reset in-memory movement log (mainly for testing environment).
 */
export function clearStockMovements(): void {
  inMemoryStockMovements = []
}
