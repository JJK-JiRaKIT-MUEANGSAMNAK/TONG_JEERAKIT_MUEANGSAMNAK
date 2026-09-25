/**
 * Reservation Domain Storage
 *
 * Source of truth: Supabase PostgreSQL public.reservations table with in-memory cache.
 * Single source of truth for stock reservations across Quotations and Bills.
 * Supports date-range overlap detection to allow non-overlapping rentals to share physical stock.
 * LocalStorage fallback for business data is strictly forbidden.
 */

import { createClient } from '@/lib/supabase/client'

export type ReservationStatus = 'ACTIVE' | 'DISPATCHED' | 'RELEASED' | 'EXPIRED'
export type ReservationSourceType = 'QUOTATION' | 'BILL'
export type ReservationItemType = 'RENT' | 'SALE'

export interface ReservationRecord {
  id: string
  reservationNo: string
  sourceType: ReservationSourceType
  sourceId: string
  sourceNo: string
  customerId: string
  customerName: string
  productId: string
  productCode: string
  productName: string
  itemType: ReservationItemType
  quantity: number
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  status: ReservationStatus
  createdAt: string
  updatedAt: string
  dispatchedAt?: string
  releasedAt?: string
  releaseReason?: string
  correlationId?: string
}

// In-memory cache for fast synchronous access across quotation and bill workflows
let _cachedReservations: ReservationRecord[] | null = null

const STORAGE_KEY = 'app_reservation_storage'

export function setCachedReservations(reservations: ReservationRecord[]): void {
  _cachedReservations = reservations
}

export function loadReservations(): ReservationRecord[] {
  if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === null) {
        _cachedReservations = []
        return []
      }
      return JSON.parse(raw) as ReservationRecord[]
    } catch {
      return []
    }
  }
  return _cachedReservations || []
}

export function saveReservations(reservations: ReservationRecord[]): void {
  _cachedReservations = reservations
  if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations))
    } catch {}
  }
}

export function generateReservationNo(): string {
  const now = new Date()
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = String(Math.floor(1000 + Math.random() * 9000))
  return `RESV-${ymd}-${rand}`
}

export interface CreateReservationInput {
  sourceType: ReservationSourceType
  sourceId: string
  sourceNo: string
  customerId: string
  customerName: string
  productId: string
  productCode: string
  productName: string
  itemType: ReservationItemType
  quantity: number
  startDate: string
  endDate: string
  correlationId?: string
}

export function createReservation(input: CreateReservationInput): ReservationRecord {
  const nowIso = new Date().toISOString()
  const record: ReservationRecord = {
    id: `resv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    reservationNo: generateReservationNo(),
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    sourceNo: input.sourceNo,
    customerId: input.customerId,
    customerName: input.customerName,
    productId: input.productId,
    productCode: input.productCode,
    productName: input.productName,
    itemType: input.itemType,
    quantity: Math.max(0, input.quantity),
    startDate: input.startDate,
    endDate: input.endDate,
    status: 'ACTIVE',
    createdAt: nowIso,
    updatedAt: nowIso,
    correlationId: input.correlationId,
  }

  const current = loadReservations()
  saveReservations([record, ...current])
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveReservationToSupabase(record).catch((err) =>
      console.error('[Supabase] Failed to sync reservation:', err)
    )
  }
  return record
}

export function updateReservation(updated: ReservationRecord): ReservationRecord[] {
  const current = loadReservations()
  const next = current.map((r) =>
    r.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : r
  )
  saveReservations(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveReservationToSupabase(updated).catch((err) =>
      console.error('[Supabase] Failed to sync updated reservation:', err)
    )
  }
  return next
}

export function getReservationsBySource(
  sourceType: ReservationSourceType,
  sourceId: string
): ReservationRecord[] {
  return loadReservations().filter((r) => r.sourceType === sourceType && r.sourceId === sourceId)
}

export function getActiveReservationsForProduct(productId: string): ReservationRecord[] {
  return loadReservations().filter((r) => r.productId === productId && r.status === 'ACTIVE')
}

/**
 * Check if two date ranges overlap.
 * Format: YYYY-MM-DD.
 * Rule: [startA, endA] overlaps [startB, endB] iff startA <= endB and endA >= startB.
 */
export function areDatesOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  if (!startA || !endA || !startB || !endB) return true
  return startA <= endB && endA >= startB
}

/**
 * Get active reservations for a product that overlap with a specific date range.
 * If range is omitted, returns all ACTIVE reservations for the product.
 */
export function getActiveReservationsInRange(
  productId: string,
  startDate?: string,
  endDate?: string
): ReservationRecord[] {
  const actives = getActiveReservationsForProduct(productId)
  if (!startDate || !endDate) return actives

  return actives.filter((res) => {
    // If reservation has no dates or is open-ended SALE reservation, treat as overlapping
    if (!res.startDate || !res.endDate) return true
    return areDatesOverlapping(startDate, endDate, res.startDate, res.endDate)
  })
}

/**
 * Calculate the peak concurrent reserved quantity for a product across a date range.
 * If no dates provided, sums all ACTIVE reservations.
 * If dates provided, computes peak concurrent overlap on any single day within the range.
 */
export function getPeakReservedQuantity(
  productId: string,
  startDate?: string,
  endDate?: string
): number {
  const overlapping = getActiveReservationsInRange(productId, startDate, endDate)
  if (overlapping.length === 0) return 0
  if (!startDate || !endDate) {
    return overlapping.reduce((sum, r) => sum + r.quantity, 0)
  }

  // Find all distinct boundary dates in the overlapping set constrained to [startDate, endDate]
  const boundaryDates = new Set<string>()
  boundaryDates.add(startDate)
  boundaryDates.add(endDate)

  for (const r of overlapping) {
    if (r.startDate && r.startDate >= startDate && r.startDate <= endDate) {
      boundaryDates.add(r.startDate)
    }
    if (r.endDate && r.endDate >= startDate && r.endDate <= endDate) {
      boundaryDates.add(r.endDate)
    }
  }

  // Check concurrent reserved quantity on each boundary date
  let peak = 0
  for (const date of Array.from(boundaryDates)) {
    const concurrentOnDate = overlapping.reduce((sum, r) => {
      const coversDate = (!r.startDate || !r.endDate) || (r.startDate <= date && date <= r.endDate)
      return coversDate ? sum + r.quantity : sum
    }, 0)
    if (concurrentOnDate > peak) {
      peak = concurrentOnDate
    }
  }

  return peak
}

/**
 * Release all ACTIVE reservations associated with a specific source (Quotation or Bill).
 */
export function releaseReservationsBySource(
  sourceType: ReservationSourceType,
  sourceId: string,
  reason: string,
  correlationId?: string
): ReservationRecord[] {
  const current = loadReservations()
  const nowIso = new Date().toISOString()
  const updatedList: ReservationRecord[] = []
  const next = current.map((r) => {
    if (r.sourceType === sourceType && r.sourceId === sourceId && r.status === 'ACTIVE') {
      const updated: ReservationRecord = {
        ...r,
        status: 'RELEASED' as const,
        releasedAt: nowIso,
        releaseReason: reason,
        updatedAt: nowIso,
        ...(correlationId ? { correlationId } : {}),
      }
      updatedList.push(updated)
      return updated
    }
    return r
  })
  saveReservations(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    Promise.all(updatedList.map(saveReservationToSupabase)).catch((err) =>
      console.error('[Supabase] Failed to sync released reservations:', err)
    )
  }
  return next.filter((r) => r.sourceType === sourceType && r.sourceId === sourceId)
}

/**
 * Transition all ACTIVE reservations for a source to DISPATCHED.
 */
export function dispatchReservationsBySource(
  sourceType: ReservationSourceType,
  sourceId: string,
  correlationId?: string
): ReservationRecord[] {
  const current = loadReservations()
  const nowIso = new Date().toISOString()
  const updatedList: ReservationRecord[] = []
  const next = current.map((r) => {
    if (r.sourceType === sourceType && r.sourceId === sourceId && r.status === 'ACTIVE') {
      const updated: ReservationRecord = {
        ...r,
        status: 'DISPATCHED' as const,
        dispatchedAt: nowIso,
        updatedAt: nowIso,
        ...(correlationId ? { correlationId } : {}),
      }
      updatedList.push(updated)
      return updated
    }
    return r
  })
  saveReservations(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    Promise.all(updatedList.map(saveReservationToSupabase)).catch((err) =>
      console.error('[Supabase] Failed to sync dispatched reservations:', err)
    )
  }
  return next.filter((r) => r.sourceType === sourceType && r.sourceId === sourceId)
}

/**
 * Expire an active reservation.
 * Invariant: DISPATCHED reservations can NEVER be expired!
 */
export function expireReservation(
  id: string,
  reason = 'EXPIRED_BY_POLICY',
  correlationId?: string
): ReservationRecord | null {
  const current = loadReservations()
  const target = current.find((r) => r.id === id)
  if (!target || target.status !== 'ACTIVE') {
    return null
  }
  const nowIso = new Date().toISOString()
  const updated: ReservationRecord = {
    ...target,
    status: 'EXPIRED',
    releasedAt: nowIso,
    releaseReason: reason,
    updatedAt: nowIso,
    ...(correlationId ? { correlationId } : {}),
  }
  saveReservations(current.map((r) => (r.id === id ? updated : r)))
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveReservationToSupabase(updated).catch((err) =>
      console.error('[Supabase] Failed to sync expired reservation:', err)
    )
  }
  return updated
}

// ─── Database Row Mapping ──────────────────────────────────────────

export function dbReservationToDomain(row: any): ReservationRecord {
  return {
    id: row.id,
    reservationNo: row.reservation_no || row.reference_id || `RESV-${row.id}`,
    sourceType: (row.source_type || row.reference_type || 'BILL') as ReservationSourceType,
    sourceId: row.source_id || row.reference_id || '',
    sourceNo: row.source_no || '',
    customerId: row.customer_id || '',
    customerName: row.customer_name || '',
    productId: row.product_id,
    productCode: row.product_code || row.product_id,
    productName: row.product_name || '',
    itemType: (row.item_type || 'RENT') as ReservationItemType,
    quantity: Number(row.quantity || 0),
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    status: (row.status || 'ACTIVE') as ReservationStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    dispatchedAt: row.dispatched_at,
    releasedAt: row.released_at,
    releaseReason: row.release_reason,
    correlationId: row.correlation_id,
  }
}

export function domainReservationToDbRow(rec: ReservationRecord): Record<string, any> {
  return {
    id: rec.id,
    reservation_no: rec.reservationNo,
    source_type: rec.sourceType,
    source_id: rec.sourceId,
    source_no: rec.sourceNo,
    reference_id: rec.sourceId,
    reference_type: rec.sourceType,
    customer_id: rec.customerId || null,
    customer_name: rec.customerName,
    product_id: rec.productId,
    product_code: rec.productCode,
    product_name: rec.productName,
    item_type: rec.itemType,
    quantity: rec.quantity,
    start_date: rec.startDate || null,
    end_date: rec.endDate || null,
    status: rec.status,
    dispatched_at: rec.dispatchedAt || null,
    released_at: rec.releasedAt || null,
    release_reason: rec.releaseReason || null,
    correlation_id: rec.correlationId || null,
    updated_at: new Date().toISOString(),
  }
}

// ─── Supabase Async Operations ────────────────────────────────────────

export async function fetchReservationsFromSupabase(): Promise<ReservationRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`ไม่สามารถดึงข้อมูลการจองสตอกจาก Supabase ได้: ${error.message}`)
  }

  const mapped = (data || []).map(dbReservationToDomain)
  saveReservations(mapped)
  return mapped
}

export async function saveReservationToSupabase(rec: ReservationRecord): Promise<void> {
  const supabase = createClient()
  const row = domainReservationToDbRow(rec)
  const { error } = await supabase.from('reservations').upsert(row)

  if (error) {
    throw new Error(`ไม่สามารถบันทึกการจองสตอกลง Supabase ได้: ${error.message}`)
  }
}
