/**
 * Reservation Domain Storage
 *
 * Single source of truth for stock reservations across Quotations and Bills.
 * Supports date-range overlap detection to allow non-overlapping rentals to share physical stock.
 * LocalStorage key: 'app_reservation_storage'.
 */

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

const STORAGE_KEY = 'app_reservation_storage'

export function loadReservations(): ReservationRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as ReservationRecord[]
    }
    return []
  } catch {
    return []
  }
}

export function saveReservations(reservations: ReservationRecord[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations))
  } catch {
    // silently handle quota exceeded
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
  return record
}

export function updateReservation(updated: ReservationRecord): ReservationRecord[] {
  const current = loadReservations()
  const next = current.map((r) => (r.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : r))
  saveReservations(next)
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
  const next = current.map((r) => {
    if (r.sourceType === sourceType && r.sourceId === sourceId && r.status === 'ACTIVE') {
      return {
        ...r,
        status: 'RELEASED' as const,
        releasedAt: nowIso,
        releaseReason: reason,
        updatedAt: nowIso,
        ...(correlationId ? { correlationId } : {}),
      }
    }
    return r
  })
  saveReservations(next)
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
  const next = current.map((r) => {
    if (r.sourceType === sourceType && r.sourceId === sourceId && r.status === 'ACTIVE') {
      return {
        ...r,
        status: 'DISPATCHED' as const,
        dispatchedAt: nowIso,
        updatedAt: nowIso,
        ...(correlationId ? { correlationId } : {}),
      }
    }
    return r
  })
  saveReservations(next)
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
  return updated
}
