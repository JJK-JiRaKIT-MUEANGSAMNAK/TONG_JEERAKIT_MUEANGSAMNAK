/**
 * Backorder Domain Storage
 *
 * Tracks unfulfilled demand when requested quantity exceeds available stock.
 * Maintained in FIFO queue by creation date to fairly allocate incoming stock.
 * LocalStorage key: 'app_backorder_storage'.
 */

export type BackorderStatus = 'PENDING' | 'READY' | 'FULFILLED' | 'CANCELLED'
export type BackorderSourceType = 'BILL' | 'QUOTATION'
export type BackorderItemType = 'RENT' | 'SALE'

export interface BackorderRecord {
  id: string
  backorderNo: string
  sourceType: BackorderSourceType
  sourceId: string
  sourceNo: string
  customerId: string
  customerName: string
  productId: string
  productCode: string
  productName: string
  itemType: BackorderItemType
  requestedQty: number
  fulfilledQty: number
  outstandingQty: number
  startDate?: string
  endDate?: string
  status: BackorderStatus
  createdAt: string
  updatedAt: string
  correlationId?: string
  notes?: string
  allocatedReadyQty?: number
}

const STORAGE_KEY = 'app_backorder_storage'

export function loadBackorders(): BackorderRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as BackorderRecord[]
    }
    return []
  } catch {
    return []
  }
}

export function saveBackorders(backorders: BackorderRecord[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(backorders))
  } catch {
    // silently handle quota exceeded
  }
}

export function generateBackorderNo(): string {
  const now = new Date()
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = String(Math.floor(1000 + Math.random() * 9000))
  return `BO-${ymd}-${rand}`
}

export interface CreateBackorderInput {
  sourceType: BackorderSourceType
  sourceId: string
  sourceNo: string
  customerId: string
  customerName: string
  productId: string
  productCode: string
  productName: string
  itemType: BackorderItemType
  requestedQty: number
  outstandingQty?: number
  startDate?: string
  endDate?: string
  notes?: string
  correlationId?: string
}

export function createBackorder(input: CreateBackorderInput): BackorderRecord {
  const nowIso = new Date().toISOString()
  const outstanding = input.outstandingQty !== undefined ? input.outstandingQty : input.requestedQty

  const record: BackorderRecord = {
    id: `bo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    backorderNo: generateBackorderNo(),
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    sourceNo: input.sourceNo,
    customerId: input.customerId,
    customerName: input.customerName,
    productId: input.productId,
    productCode: input.productCode,
    productName: input.productName,
    itemType: input.itemType,
    requestedQty: input.requestedQty,
    fulfilledQty: 0,
    outstandingQty: Math.max(0, outstanding),
    startDate: input.startDate,
    endDate: input.endDate,
    status: 'PENDING',
    createdAt: nowIso,
    updatedAt: nowIso,
    notes: input.notes,
    correlationId: input.correlationId,
  }

  const current = loadBackorders()
  saveBackorders([record, ...current])
  return record
}

export function updateBackorder(updated: BackorderRecord): BackorderRecord[] {
  const current = loadBackorders()
  const next = current.map((b) => (b.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : b))
  saveBackorders(next)
  return next
}

export function getBackordersBySource(
  sourceType: BackorderSourceType,
  sourceId: string
): BackorderRecord[] {
  return loadBackorders().filter((b) => b.sourceType === sourceType && b.sourceId === sourceId)
}

/**
 * Retrieve pending backorders for a product sorted FIFO (earliest confirmed/created first).
 */
export function getPendingBackordersForProduct(productId: string): BackorderRecord[] {
  return loadBackorders()
    .filter((b) => b.productId === productId && (b.status === 'PENDING' || b.status === 'READY') && b.outstandingQty > 0)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

/**
 * Cancel backorders associated with a specific source (Quotation or Bill).
 */
export function cancelBackordersBySource(
  sourceType: BackorderSourceType,
  sourceId: string,
  reason?: string
): BackorderRecord[] {
  const current = loadBackorders()
  const nowIso = new Date().toISOString()
  const next = current.map((b) => {
    if (b.sourceType === sourceType && b.sourceId === sourceId && (b.status === 'PENDING' || b.status === 'READY')) {
      return {
        ...b,
        status: 'CANCELLED' as const,
        notes: reason ? [b.notes, `ยกเลิก: ${reason}`].filter(Boolean).join(' | ') : b.notes,
        updatedAt: nowIso,
      }
    }
    return b
  })
  saveBackorders(next)
  return next.filter((b) => b.sourceType === sourceType && b.sourceId === sourceId)
}

/**
 * Fulfill a backorder with explicit allocated quantity.
 * Increases fulfilledQty and decreases outstandingQty.
 * If outstandingQty reaches 0, status becomes FULFILLED.
 */
export function fulfillBackorder(
  backorderId: string,
  allocateQty: number
): { backorder: BackorderRecord; allBackorders: BackorderRecord[] } {
  const current = loadBackorders()
  const target = current.find((b) => b.id === backorderId)
  if (!target) {
    throw new Error(`Backorder ${backorderId} not found`)
  }

  const validAllocate = Math.min(target.outstandingQty, Math.max(0, allocateQty))
  const newFulfilled = target.fulfilledQty + validAllocate
  const newOutstanding = Math.max(0, target.outstandingQty - validAllocate)
  const newStatus: BackorderStatus = newOutstanding === 0 ? 'FULFILLED' : 'PENDING'

  const updated: BackorderRecord = {
    ...target,
    fulfilledQty: newFulfilled,
    outstandingQty: newOutstanding,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  }

  const next = current.map((b) => (b.id === target.id ? updated : b))
  saveBackorders(next)
  return { backorder: updated, allBackorders: next }
}
