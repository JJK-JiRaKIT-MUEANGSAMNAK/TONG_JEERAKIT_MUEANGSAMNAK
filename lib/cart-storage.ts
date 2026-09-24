/**
 * Shared POS Cart Storage
 *
 * Backed by localStorage key 'pos_active_cart'.
 * Bridges cart state from POS page to Checkout page with full fidelity.
 */

import { Customer, Product } from '@/lib/types/rental-pos'

const STORAGE_KEY = 'pos_active_cart'

export interface CartItem {
  id: string
  product: Product
  productId?: string
  productName?: string
  rentalType: 'NORMAL' | 'DAILY' | 'SALE'
  itemType?: 'RENT' | 'SALE'
  requiresReturn?: boolean
  unitName?: string
  calculationType?: string
  calculationLabel?: string
  quantity: number
  unitPrice: number
  usageCount: number
  billableDays?: number
  dailyStartDate?: string
  dailyEndDate?: string
  lineTotal: number
}

export interface ActiveCartData {
  customer: Customer | null
  items: CartItem[]
  discount: number
  shippingFee: number
  depositAmount: number
  taxRate: number
  shippingAddress: string
  headerRentalDate: string // ISO string or YYYY-MM-DD
  headerReturnDate: string // ISO string or YYYY-MM-DD
  documentType: string
  documentDate: string // ISO string or YYYY-MM-DD
  subtotal: number
  tax: number
  grandTotal: number
  remark?: string
  quotationId?: string
  quotationNo?: string
  draftBillId?: string
}

export function loadActiveCart(): ActiveCartData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ActiveCartData
  } catch {
    return null
  }
}

export function saveActiveCart(data: ActiveCartData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // silently ignore quota issues
  }
}

export function clearActiveCart(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // silently ignore
  }
}
