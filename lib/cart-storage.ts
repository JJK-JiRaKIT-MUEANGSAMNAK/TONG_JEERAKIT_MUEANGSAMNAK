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

/** Explicit line mode wins; older carts fall back to rentalType/product type. */
export function isSaleCartItem(item: { itemType?: 'RENT' | 'SALE'; rentalType?: string; product?: { rentalType?: string } }): boolean {
  return item.itemType ? item.itemType === 'SALE' : (item.rentalType || item.product?.rentalType) === 'SALE'
}

export function validateCartCustomer(
  items: Parameters<typeof isSaleCartItem>[0][],
  customer: Pick<Customer, 'customerName' | 'phone' | 'address'> | null,
): void {
  if (!items.some((item) => !isSaleCartItem(item))) return
  if (!customer) throw new Error('บิลที่มีรายการเช่าจำเป็นต้องระบุลูกค้า')
  if (!customer.customerName?.trim() || !customer.phone?.trim() || !customer.address?.trim()) {
    throw new Error('ลูกค้าต้องมี ชื่อ, เบอร์โทร, และที่อยู่')
  }
}
