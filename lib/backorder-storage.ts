/**
 * Backorder Domain Storage
 *
 * Source of truth: Supabase PostgreSQL public.backorders table with in-memory cache.
 * Tracks unfulfilled demand when requested quantity exceeds available stock.
 * Maintained in FIFO queue by creation date to fairly allocate incoming stock.
 * LocalStorage fallback for business data is strictly forbidden.
 */

import { createClient } from '@/lib/supabase/client'

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

// In-memory cache for fast synchronous access
let _cachedBackorders: BackorderRecord[] | null = null

const STORAGE_KEY = 'app_backorder_storage'

export function setCachedBackorders(backorders: BackorderRecord[]): void {
  _cachedBackorders = backorders
}

export function loadBackorders(): BackorderRecord[] {
  if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === null) {
        _cachedBackorders = []
        return []
      }
      return JSON.parse(raw) as BackorderRecord[]
    } catch {
      return []
    }
  }
  return _cachedBackorders || []
}

export function saveBackorders(backorders: BackorderRecord[]): void {
  _cachedBackorders = backorders
  if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backorders))
    } catch {}
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
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveBackorderToSupabase(record).catch((err) =>
      console.error('[Supabase] Failed to sync backorder:', err)
    )
  }
  return record
}

export function updateBackorder(updated: BackorderRecord): BackorderRecord[] {
  const current = loadBackorders()
  const next = current.map((b) =>
    b.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : b
  )
  saveBackorders(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveBackorderToSupabase(updated).catch((err) =>
      console.error('[Supabase] Failed to sync updated backorder:', err)
    )
  }
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
  const updatedList: BackorderRecord[] = []
  const next = current.map((b) => {
    if (b.sourceType === sourceType && b.sourceId === sourceId && (b.status === 'PENDING' || b.status === 'READY')) {
      const updated: BackorderRecord = {
        ...b,
        status: 'CANCELLED' as const,
        notes: reason ? [b.notes, `ยกเลิก: ${reason}`].filter(Boolean).join(' | ') : b.notes,
        updatedAt: nowIso,
      }
      updatedList.push(updated)
      return updated
    }
    return b
  })
  saveBackorders(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    Promise.all(updatedList.map(saveBackorderToSupabase)).catch((err) =>
      console.error('[Supabase] Failed to sync cancelled backorders:', err)
    )
  }
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
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveBackorderToSupabase(updated).catch((err) =>
      console.error('[Supabase] Failed to sync fulfilled backorder:', err)
    )
  }
  return { backorder: updated, allBackorders: next }
}

// ─── Database Row Mapping ──────────────────────────────────────────

export function dbBackorderToDomain(row: any): BackorderRecord {
  return {
    id: row.id,
    backorderNo: row.backorder_no || `BO-${row.id}`,
    sourceType: (row.source_type || 'BILL') as BackorderSourceType,
    sourceId: row.source_id || '',
    sourceNo: row.source_no || '',
    customerId: row.customer_id || '',
    customerName: row.customer_name || '',
    productId: row.product_id,
    productCode: row.product_code || row.product_id,
    productName: row.product_name || '',
    itemType: (row.item_type || 'RENT') as BackorderItemType,
    requestedQty: Number(row.requested_qty || row.quantity || 0),
    fulfilledQty: Number(row.fulfilled_qty || 0),
    outstandingQty: Number(row.outstanding_qty !== undefined ? row.outstanding_qty : (row.quantity || 0)),
    startDate: row.start_date,
    endDate: row.end_date,
    status: (row.status || 'PENDING') as BackorderStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    notes: row.notes,
    allocatedReadyQty: Number(row.allocated_ready_qty || 0),
    correlationId: row.correlation_id,
  }
}

export function domainBackorderToDbRow(rec: BackorderRecord): Record<string, any> {
  return {
    id: rec.id,
    backorder_no: rec.backorderNo,
    source_type: rec.sourceType,
    source_id: rec.sourceId,
    source_no: rec.sourceNo,
    customer_id: rec.customerId || null,
    customer_name: rec.customerName,
    product_id: rec.productId,
    product_code: rec.productCode,
    product_name: rec.productName,
    item_type: rec.itemType,
    requested_qty: rec.requestedQty,
    quantity: rec.requestedQty,
    fulfilled_qty: rec.fulfilledQty,
    outstanding_qty: rec.outstandingQty,
    start_date: rec.startDate || null,
    end_date: rec.endDate || null,
    status: rec.status,
    notes: rec.notes || null,
    allocated_ready_qty: rec.allocatedReadyQty || 0,
    correlation_id: rec.correlationId || null,
    updated_at: new Date().toISOString(),
  }
}

// ─── Supabase Async Operations ────────────────────────────────────────

export async function fetchBackordersFromSupabase(): Promise<BackorderRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('backorders')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`ไม่สามารถดึงข้อมูล Backorder จาก Supabase ได้: ${error.message}`)
  }

  const mapped = (data || []).map(dbBackorderToDomain)
  saveBackorders(mapped)
  return mapped
}

export async function saveBackorderToSupabase(rec: BackorderRecord): Promise<void> {
  const supabase = createClient()
  const row = domainBackorderToDbRow(rec)
  const { error } = await supabase.from('backorders').upsert(row)

  if (error) {
    throw new Error(`ไม่สามารถบันทึก Backorder ลง Supabase ได้: ${error.message}`)
  }
}
