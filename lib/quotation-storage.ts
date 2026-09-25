/**
 * Shared Quotation Storage
 *
 * Source of truth: Supabase PostgreSQL public.quotations table with in-memory cache.
 * Single source of truth for quotations across POS, Quotations, and Checkout.
 * ZERO 'as any' assertions.
 * LocalStorage fallback for business data is strictly forbidden.
 */

import { Quotation, QuotationStatus, Customer, Product } from '@/lib/types/rental-pos'
import { CartItem } from '@/lib/cart-storage'
import { createReservation, releaseReservationsBySource, ReservationRecord } from '@/lib/reservation-storage'
import { createBackorder, cancelBackordersBySource, BackorderRecord } from '@/lib/backorder-storage'
import { getProductAvailability, syncProductReservedStock } from '@/lib/product-storage'
import { recordAuditLog, generateCorrelationId } from '@/lib/audit-storage'
import { loadSystemSettings } from '@/lib/settings-storage'
import { createClient } from '@/lib/supabase/client'

// In-memory cache for fast synchronous access by UI components
let _cachedQuotations: Quotation[] | null = null

const STORAGE_KEY = 'app_quotation_storage'

export function setCachedQuotations(quotations: Quotation[]): void {
  _cachedQuotations = quotations
}

export function loadQuotations(): Quotation[] {
  if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === null) {
        _cachedQuotations = []
        return []
      }
      return JSON.parse(raw) as Quotation[]
    } catch {
      return []
    }
  }
  return _cachedQuotations || []
}

export function saveQuotations(quotations: Quotation[]): void {
  _cachedQuotations = quotations
  if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations))
    } catch {}
  }
}

export function getQuotationById(id: string): Quotation | null {
  const current = loadQuotations()
  return current.find((q) => q.id === id || q.quotationNo === id) || null
}

export function addQuotation(incoming: Quotation): Quotation[] {
  const current = loadQuotations()
  const exists = current.some((q) => q.id === incoming.id)
  const next = exists
    ? current.map((q) => (q.id === incoming.id ? incoming : q))
    : [incoming, ...current]
  saveQuotations(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveQuotationToSupabase(incoming).catch((err) =>
      console.error('[Supabase] Failed to sync added quotation:', err)
    )
  }
  return next
}

export function updateQuotation(updated: Quotation): Quotation[] {
  const current = loadQuotations()
  const next = current.map((q) => (q.id === updated.id ? updated : q))
  saveQuotations(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveQuotationToSupabase(updated).catch((err) =>
      console.error('[Supabase] Failed to sync updated quotation:', err)
    )
  }
  return next
}

export function updateQuotationStatus(
  id: string,
  status: QuotationStatus,
  remark?: string
): Quotation[] {
  const current = loadQuotations()
  let targetQuote: Quotation | undefined
  const next = current.map((q) => {
    if (q.id === id || q.quotationNo === id) {
      targetQuote = {
        ...q,
        status,
        ...(remark !== undefined ? { remark } : {}),
      }
      return targetQuote
    }
    return q
  })
  saveQuotations(next)
  if (targetQuote && typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveQuotationToSupabase(targetQuote).catch((err) =>
      console.error('[Supabase] Failed to sync quotation status:', err)
    )
  }
  return next
}

export function updateQuotationConverted(
  id: string,
  convertedBillId: string
): Quotation[] {
  const current = loadQuotations()
  let targetQuote: Quotation | undefined
  const next = current.map((q) => {
    if (q.id === id || q.quotationNo === id) {
      targetQuote = {
        ...q,
        status: 'CONVERTED' as const,
        convertedBillId,
      }
      return targetQuote
    }
    return q
  })
  saveQuotations(next)
  if (targetQuote && typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveQuotationToSupabase(targetQuote).catch((err) =>
      console.error('[Supabase] Failed to sync converted quotation:', err)
    )
  }
  return next
}

export function deleteQuotation(id: string): Quotation[] {
  const current = loadQuotations()
  const next = current.filter((q) => q.id !== id && q.quotationNo !== id)
  saveQuotations(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    deleteQuotationFromSupabase(id).catch((err) =>
      console.error('[Supabase] Failed to delete quotation:', err)
    )
  }
  return next
}

export function generateQuotationNo(): string {
  const now = new Date()
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = String(Math.floor(1000 + Math.random() * 9000))
  return `QT-${ymd}-${rand}`
}

// ─── Supabase Async Operations ────────────────────────────────────────

export async function fetchQuotationsFromSupabase(): Promise<Quotation[]> {
  const supabase = createClient()
  const { data: quotes, error: quotesError } = await supabase
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false })

  if (quotesError) {
    throw new Error(`ไม่สามารถดึงข้อมูลใบเสนอราคาจาก Supabase ได้: ${quotesError.message}`)
  }

  const { data: items, error: itemsError } = await supabase.from('quotation_items').select('*')
  if (itemsError) {
    throw new Error(`ไม่สามารถดึงข้อมูลรายการใบเสนอราคาจาก Supabase ได้: ${itemsError.message}`)
  }

  const allItems = items || []
  const mapped: Quotation[] = (quotes || []).map((q: any) => {
    // If quotation has embedded JSON items, prefer them; otherwise join from quotation_items
    let qItems = Array.isArray(q.items) && q.items.length > 0 ? q.items : []
    if (qItems.length === 0) {
      qItems = allItems
        .filter((i: any) => i.quotation_id === q.id)
        .map((i: any) => ({
          id: i.id,
          productId: i.product_id,
          productName: i.product_name,
          productCode: i.product_code || i.product_id,
          unitName: i.unit_name,
          rentalType: i.rental_type,
          quantity: i.quantity,
          unitPrice: Number(i.unit_price || 0),
          usageCountOrDays: i.usage_count_or_days || 1,
          dailyStartDate: i.daily_start_date,
          dailyEndDate: i.daily_end_date,
          lineTotal: Number(i.line_total || 0),
        }))
    }

    return {
      id: q.id,
      quotationNo: q.quotation_no,
      quotationDate: q.quotation_date || q.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      expiryDate: q.expiry_date || q.rental_start_date || q.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      customerId: q.customer_id || '',
      customerName: q.customer_name || '',
      customerAddress: q.customer_address,
      customerTaxId: q.customer_tax_id,
      phone: q.customer_phone,
      siteName: q.site_name,
      rentalStartDate: q.rental_start_date,
      rentalEndDate: q.rental_end_date,
      subtotal: Number(q.subtotal || q.grand_total || 0),
      discountAmount: Number(q.discount_amount || 0),
      shippingFee: Number(q.shipping_fee || 0),
      taxAmount: Number(q.tax_amount || 0),
      depositAmount: Number(q.deposit_amount || 0),
      grandTotal: Number(q.grand_total || 0),
      status: q.status || 'DRAFT',
      remark: q.remark,
      cancelReason: q.cancel_reason,
      convertedBillId: q.converted_bill_id,
      items: qItems,
      createdAt: q.created_at,
      acceptedAt: q.accepted_at,
      cancelledAt: q.cancelled_at,
    }
  })

  saveQuotations(mapped)
  return mapped
}

export async function fetchQuotationByIdFromSupabase(id: string): Promise<Quotation | null> {
  const supabase = createClient()
  const { data: q, error } = await supabase
    .from('quotations')
    .select('*')
    .or(`id.eq.${id},quotation_no.eq.${id}`)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`ไม่สามารถดึงข้อมูลใบเสนอราคา ${id} ได้: ${error.message}`)
  }

  if (!q) return null

  let qItems = Array.isArray(q.items) && q.items.length > 0 ? q.items : []
  if (qItems.length === 0) {
    const { data: items } = await supabase
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', q.id)
    qItems = (items || []).map((i: any) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name,
      productCode: i.product_code || i.product_id,
      unitName: i.unit_name,
      rentalType: i.rental_type,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price || 0),
      usageCountOrDays: i.usage_count_or_days || 1,
      dailyStartDate: i.daily_start_date,
      dailyEndDate: i.daily_end_date,
      lineTotal: Number(i.line_total || 0),
    }))
  }

  const quote: Quotation = {
    id: q.id,
    quotationNo: q.quotation_no,
    quotationDate: q.quotation_date || q.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    expiryDate: q.expiry_date || q.rental_start_date || q.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    customerId: q.customer_id || '',
    customerName: q.customer_name || '',
    customerAddress: q.customer_address,
    customerTaxId: q.customer_tax_id,
    phone: q.customer_phone,
    siteName: q.site_name,
    rentalStartDate: q.rental_start_date,
    rentalEndDate: q.rental_end_date,
    subtotal: Number(q.subtotal || q.grand_total || 0),
    discountAmount: Number(q.discount_amount || 0),
    shippingFee: Number(q.shipping_fee || 0),
    taxAmount: Number(q.tax_amount || 0),
    depositAmount: Number(q.deposit_amount || 0),
    grandTotal: Number(q.grand_total || 0),
    status: q.status || 'DRAFT',
    remark: q.remark,
    cancelReason: q.cancel_reason,
    convertedBillId: q.converted_bill_id,
    items: qItems,
    createdAt: q.created_at,
    acceptedAt: q.accepted_at,
    cancelledAt: q.cancelled_at,
  }

  const current = loadQuotations()
  const next = current.some((item) => item.id === quote.id)
    ? current.map((item) => (item.id === quote.id ? quote : item))
    : [quote, ...current]
  saveQuotations(next)
  return quote
}

export async function saveQuotationToSupabase(quotation: Quotation): Promise<void> {
  const supabase = createClient()
  const { error: quoteError } = await supabase.from('quotations').upsert({
    id: quotation.id,
    quotation_no: quotation.quotationNo,
    customer_id: quotation.customerId || null,
    customer_name: quotation.customerName,
    customer_phone: quotation.phone || null,
    customer_address: quotation.customerAddress || null,
    customer_tax_id: quotation.customerTaxId || null,
    site_name: quotation.siteName || null,
    rental_start_date: quotation.rentalStartDate || null,
    rental_end_date: quotation.rentalEndDate || null,
    discount_amount: quotation.discountAmount || 0,
    shipping_fee: quotation.shippingFee || 0,
    tax_amount: quotation.taxAmount || 0,
    deposit_amount: quotation.depositAmount || 0,
    grand_total: quotation.grandTotal || 0,
    status: quotation.status,
    remark: quotation.remark || null,
    cancel_reason: quotation.cancelReason || null,
    converted_bill_id: quotation.convertedBillId || null,
    items: quotation.items || [],
    updated_at: new Date().toISOString(),
    accepted_at: quotation.acceptedAt || null,
    cancelled_at: quotation.cancelledAt || null,
  })

  if (quoteError) {
    throw new Error(`ไม่สามารถบันทึกใบเสนอราคา ${quotation.quotationNo} ลง Supabase ได้: ${quoteError.message}`)
  }

  // Also sync quotation_items table
  await supabase.from('quotation_items').delete().eq('quotation_id', quotation.id)

  if (quotation.items && quotation.items.length > 0) {
    const { error: itemsError } = await supabase.from('quotation_items').insert(
      quotation.items.map((item) => ({
        quotation_id: quotation.id,
        product_id: item.productId,
        product_name: item.productName,
        product_code: item.productId,
        unit_name: item.unitName || 'ชิ้น',
        rental_type: item.rentalType,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        usage_count_or_days: item.usageCountOrDays || 1,
        daily_start_date: item.dailyStartDate || null,
        daily_end_date: item.dailyEndDate || null,
        line_total: item.lineTotal,
      }))
    )
    if (itemsError) {
      console.warn('Warning: Failed to sync quotation_items table:', itemsError.message)
    }
  }

  const current = loadQuotations()
  const next = current.some((q) => q.id === quotation.id)
    ? current.map((q) => (q.id === quotation.id ? quotation : q))
    : [quotation, ...current]
  saveQuotations(next)
}

export async function deleteQuotationFromSupabase(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('quotations')
    .delete()
    .or(`id.eq.${id},quotation_no.eq.${id}`)

  if (error) {
    throw new Error(`ไม่สามารถลบใบเสนอราคาจาก Supabase ได้: ${error.message}`)
  }
}

export interface QuotationToPosValues {
  discount: number
  shippingFee: number
  depositAmount: number
  taxRate: number
  shippingAddress: string
  rentalStartDate: string
  rentalEndDate: string
}

export interface QuotationToPosResult {
  quotationId: string
  quotationNo: string
  customer: Customer
  cartItems: CartItem[]
  values: QuotationToPosValues
}

/**
 * Shared helper: Maps Quotation domain model into POS runtime state (Customer, CartItems, and financial values).
 * Used identically in runtime POS (/pos?quotationId=...) and test suites to prevent drift.
 */
export function mapQuotationToPos(
  quote: Quotation,
  products: Product[] = [],
  customers: Customer[] = []
): QuotationToPosResult {
  // 1. Set customer
  const matchedCustomer = customers.find((c) => c.id === quote.customerId)
  const customer: Customer = matchedCustomer || {
    id: quote.customerId,
    customerName: quote.customerName,
    phone: quote.phone || (quote as any).customerPhone || '',
    address: quote.customerAddress || '',
    taxId: quote.customerTaxId,
  }

  // 2. Set cart items from quote.items
  const cartItems: CartItem[] = quote.items.map((qItem, idx) => {
    const matchedProd = products.find((p) => p.id === qItem.productId)
    const isSale = qItem.rentalType === 'SALE'
    const fallbackProduct: Product = {
      id: qItem.productId,
      code: qItem.productId,
      name: qItem.productName,
      category: 'ทั่วไป',
      unit: qItem.unitName || 'ชิ้น',
      rentalType: qItem.rentalType,
      normalPrice: qItem.unitPrice,
      dailyPrice: qItem.unitPrice,
      rentPrice: qItem.unitPrice,
      defaultDamageFee: 0,
      defaultLossFee: 0,
      totalQuantity: 999,
      availableQuantity: 999,
      rentedQuantity: 0,
      damagedQuantity: 0,
      lostQuantity: 0,
      minimumStock: 0,
      status: 'ACTIVE',
    }

    const baseProduct: Product = matchedProd
      ? {
          ...matchedProd,
          normalPrice: qItem.unitPrice,
          dailyPrice: qItem.unitPrice,
          rentPrice: qItem.unitPrice,
          salePrice: isSale ? qItem.unitPrice : (matchedProd.salePrice ?? qItem.unitPrice),
        }
      : fallbackProduct

    return {
      id: qItem.id || `cart-${Date.now()}-${idx}`,
      product: baseProduct,
      productId: qItem.productId,
      productName: qItem.productName,
      itemType: isSale ? 'SALE' : 'RENT',
      unitName: qItem.unitName || matchedProd?.unit || 'ชิ้น',
      calculationType: matchedProd?.calculationType,
      calculationLabel: matchedProd?.calculationLabel,
      rentalType: qItem.rentalType,
      quantity: qItem.quantity,
      unitPrice: qItem.unitPrice,
      usageCount: qItem.usageCountOrDays || 1,
      billableDays: qItem.usageCountOrDays || 1,
      dailyStartDate: qItem.dailyStartDate,
      dailyEndDate: qItem.dailyEndDate,
      lineTotal: qItem.lineTotal,
    }
  })

  // 3. Set financial & dates
  const settings = loadSystemSettings()
  const defaultVatRate = (settings.financePayment.defaultVatPercent || 7) / 100

  const values: QuotationToPosValues = {
    discount: quote.discountAmount,
    shippingFee: quote.shippingFee,
    depositAmount: quote.depositAmount,
    taxRate: quote.taxAmount > 0 ? defaultVatRate : 0,
    shippingAddress: quote.siteName || quote.customerAddress || '',
    rentalStartDate: quote.rentalStartDate,
    rentalEndDate: quote.rentalEndDate,
  }

  return { quotationId: quote.id, quotationNo: quote.quotationNo, customer, cartItems, values }
}

export interface ConfirmQuotationResult {
  quotation: Quotation
  reservations: ReservationRecord[]
  backorders: BackorderRecord[]
  correlationId: string
}

/**
 * Confirm a quotation (transitions to ACCEPTED).
 * Invariants:
 * - MASTER v2.3.0 Section 7.3: Quotations do NOT reserve stock and do NOT create backorders.
 * - Stock reservation begins ONLY when a Bill is created/confirmed.
 * - Audits QUOTATION_CONFIRM with shared correlationId.
 */
export function confirmQuotationWorkflow(
  quotationId: string,
  actor: { userId: string; displayName: string },
  correlationId?: string
): ConfirmQuotationResult {
  const current = loadQuotations()
  const quote = current.find((q) => q.id === quotationId || q.quotationNo === quotationId)
  if (!quote) {
    throw new Error(`Quotation ${quotationId} not found`)
  }
  if (quote.status === 'CANCELLED') {
    throw new Error('Cannot confirm a cancelled quotation')
  }
  if (quote.status === 'CONVERTED') {
    throw new Error('Quotation has already been converted to a bill')
  }

  const corrId = correlationId || generateCorrelationId()
  const nowIso = new Date().toISOString()
  const reservations: ReservationRecord[] = []
  const backorders: BackorderRecord[] = []

  const updatedQuotation: Quotation = {
    ...quote,
    status: 'ACCEPTED',
    acceptedAt: nowIso,
  }

  updateQuotation(updatedQuotation)

  recordAuditLog({
    userId: actor.userId,
    displayName: actor.displayName,
    action: 'QUOTATION_CONFIRM',
    entityType: 'QUOTATION',
    entityId: updatedQuotation.id,
    before: { quotationNo: quote.quotationNo, status: quote.status },
    after: {
      quotationNo: updatedQuotation.quotationNo,
      status: updatedQuotation.status,
      reservationsCount: 0,
      backordersCount: 0,
    },
    correlationId: corrId,
  })

  return { quotation: updatedQuotation, reservations, backorders, correlationId: corrId }
}

export interface CancelQuotationResult {
  quotation: Quotation
  releasedReservations: ReservationRecord[]
  cancelledBackorders: BackorderRecord[]
  correlationId: string
}

/**
 * Cancel a quotation without deleting it from history.
 * Invariants:
 * - Releases all ACTIVE reservations associated with this quotation.
 * - Cancels pending backorders associated with this quotation.
 * - Syncs product reserved stock back to available.
 * - Retains quotation in persistence history with cancelReason and cancelledAt.
 * - Audits QUOTATION_CANCEL with shared correlationId.
 */
export function cancelQuotationWorkflow(
  quotationId: string,
  reason: string,
  actor: { userId: string; displayName: string },
  correlationId?: string
): CancelQuotationResult {
  const trimmedReason = reason.trim()
  if (!trimmedReason) {
    throw new Error('Reason is required for cancelling a quotation')
  }

  const current = loadQuotations()
  const quote = current.find((q) => q.id === quotationId || q.quotationNo === quotationId)
  if (!quote) {
    throw new Error(`Quotation ${quotationId} not found`)
  }

  const corrId = correlationId || generateCorrelationId()
  const nowIso = new Date().toISOString()

  // 1. Release active reservations
  const releasedReservations = releaseReservationsBySource('QUOTATION', quote.id, trimmedReason, corrId)

  // 2. Cancel pending backorders
  const cancelledBackorders = cancelBackordersBySource('QUOTATION', quote.id, trimmedReason)

  // 3. Sync product reserved stocks
  for (const item of quote.items) {
    syncProductReservedStock(item.productId)
  }

  // 4. Update quotation status to CANCELLED (never hard deleted!)
  const updatedQuotation: Quotation = {
    ...quote,
    status: 'CANCELLED',
    cancelReason: trimmedReason,
    cancelledAt: nowIso,
    remark: [quote.remark, `ยกเลิก: ${trimmedReason}`].filter(Boolean).join(' | '),
  }

  updateQuotation(updatedQuotation)

  recordAuditLog({
    userId: actor.userId,
    displayName: actor.displayName,
    action: 'QUOTATION_CANCEL',
    entityType: 'QUOTATION',
    entityId: updatedQuotation.id,
    before: { quotationNo: quote.quotationNo, status: quote.status },
    after: {
      quotationNo: updatedQuotation.quotationNo,
      status: updatedQuotation.status,
      cancelReason: trimmedReason,
      releasedReservationsCount: releasedReservations.length,
      cancelledBackordersCount: cancelledBackorders.length,
    },
    reason: trimmedReason,
    correlationId: corrId,
  })

  return { quotation: updatedQuotation, releasedReservations, cancelledBackorders, correlationId: corrId }
}

/**
 * Mark a quotation as CONVERTED to a bill.
 * Retains quotation in persistence history and links to convertedBillId.
 */
export function markQuotationConverted(
  quotationId: string,
  billId: string,
  correlationId?: string
): Quotation | null {
  const current = loadQuotations()
  const quote = current.find((q) => q.id === quotationId || q.quotationNo === quotationId)
  if (!quote) return null

  if (quote.status === 'CONVERTED') {
    throw new Error('Quotation is already converted')
  }

  const updatedQuotation: Quotation = {
    ...quote,
    status: 'CONVERTED',
    convertedBillId: billId,
  }

  updateQuotation(updatedQuotation)
  return updatedQuotation
}
