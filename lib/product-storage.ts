/**
 * Shared Product Storage
 *
 * Single source of truth for product data, backed by localStorage.
 * - Seeds 43 products on first launch (no storage key found).
 * - All CRUD helpers persist changes immediately.
 * - Both /products and /pos must import from here.
 */

import { Product, RentalType, ProductType } from '@/lib/types/rental-pos'
import { getPeakReservedQuantity, getActiveReservationsForProduct } from '@/lib/reservation-storage'
import { checkBackordersOnStockIncrease } from '@/lib/notification-storage'
import { recordAuditLog, generateCorrelationId } from '@/lib/audit-storage'
import { DEFAULT_PRODUCT_STOCK_SETTINGS } from '@/lib/settings-storage'

export type { ProductType }

/**
 * Determine the master product type (RENT, SALE, or BOTH).
 */
export function getProductType(p: Product): ProductType {
  if (p.productType) return p.productType
  if ((p as any).product_type) return (p as any).product_type
  if (p.rentalType === 'SALE') return 'SALE'
  if ((p.rentalType as any) === 'BOTH') return 'BOTH'
  return 'RENT'
}

/**
 * Validate that product is allowed for the chosen POS mode (RENT or SALE).
 */
export function validateProductMode(p: Product, mode: 'RENT' | 'SALE'): void {
  const pType = getProductType(p)
  if (mode === 'RENT' && pType === 'SALE') {
    throw new Error(`สินค้า "${p.name}" (รหัส: ${p.code || p.id}) เป็นประเภท SALE ไม่สามารถใช้ในโหมดเช่าได้`)
  }
  if (mode === 'SALE' && pType === 'RENT') {
    throw new Error(`สินค้า "${p.name}" (รหัส: ${p.code || p.id}) เป็นประเภท RENT ไม่สามารถใช้ในโหมดขายได้`)
  }
}

/**
 * Validate non-negative stock invariants.
 */
export function validateStockInvariants(p: Product): void {
  if (
    (p.availableQuantity ?? 0) < 0 ||
    (p.rentedQuantity ?? 0) < 0 ||
    (p.damagedQuantity ?? 0) < 0 ||
    (p.lostQuantity ?? 0) < 0 ||
    (p.totalQuantity ?? 0) < 0 ||
    (p.reservedQuantity ?? 0) < 0
  ) {
    throw new Error(
      `Stock Invariant violation for product "${p.name}": Available=${p.availableQuantity}, Rented=${p.rentedQuantity}, Damaged=${p.damagedQuantity}, Lost=${p.lostQuantity}, Total=${p.totalQuantity}`
    )
  }
}

const STORAGE_KEY = 'app_product_storage'

// ─── Seed Data ────────────────────────────────────────────────────────
// Uses the same Product shape produced by NewProductModal.handleSaveProduct

function buildProduct(
  id: string,
  code: string,
  name: string,
  category: string,
  categoryId: string,
  rentalType: RentalType,
  rentalTypeId: string,
  unit: string,
  unitId: string,
  overrides: Partial<Product> = {},
): Product {
  const isAccessory = overrides.isAccessory ?? false
  return {
    id,
    code,
    name,
    category,
    categoryId,
    rentalType,
    rentalTypeId,
    unit,
    unitId,
    normalPrice: overrides.normalPrice ?? (overrides.rentPrice ?? 35),
    dailyPrice: overrides.dailyPrice ?? 0,
    salePrice: overrides.salePrice ?? (rentalType === 'SALE' ? 100 : isAccessory ? 20 : 0),
    costPrice: 0,
    defaultDamageFee: 0,
    defaultLossFee: 0,
    totalQuantity: 20,
    availableQuantity: 20,
    rentedQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    minimumStock: DEFAULT_PRODUCT_STOCK_SETTINGS.defaultMinimumStock,
    status: 'ACTIVE',
    isAccessory,
    isChargeable: !isAccessory,
    requiresReturn: rentalType !== 'SALE',
    categoryRuleId: overrides.categoryRuleId ?? categoryId,
    calculationType: overrides.calculationType ?? (rentalType === 'DAILY' ? 'PER_DAY' : rentalType === 'SALE' ? 'SALE' : 'PER_ROUND'),
    calculationLabel: overrides.calculationLabel ?? (rentalType === 'DAILY' ? 'ราคาเช่าต่อวัน × จำนวนสินค้า × จำนวนวัน' : rentalType === 'SALE' ? 'ราคาขายต่อชิ้น × จำนวนสินค้า' : 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ'),
    rentPrice: overrides.rentPrice !== undefined ? overrides.rentPrice : (rentalType === 'SALE' ? null : 35),
    createdAt: overrides.createdAt ?? new Date().toISOString().slice(0, 10),
    ...overrides,
  }
}

const SEED_PRODUCTS: Product[] = [
  // ── แบบคาน (23) ──
  buildProduct('seed-bk-001', 'BK-001', 'แบบคาน 40x0.50', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-002', 'BK-002', 'แบบคาน 40x0.70', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-003', 'BK-003', 'แบบคาน 40x0.75', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-004', 'BK-004', 'แบบคาน 40x0.80', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-005', 'BK-005', 'แบบคาน 40x1.00', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-006', 'BK-006', 'แบบคาน 40x1.20', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-007', 'BK-007', 'แบบคาน 40x1.25', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-008', 'BK-008', 'แบบคาน 40x1.30', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-009', 'BK-009', 'แบบคาน 40x1.50', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-010', 'BK-010', 'แบบคาน 40x1.60', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-011', 'BK-011', 'แบบคาน 40x1.75', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-012', 'BK-012', 'แบบคาน 40x1.80', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-013', 'BK-013', 'แบบคาน 40x2.00', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-014', 'BK-014', 'แบบคาน 40x2.20', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-015', 'BK-015', 'แบบคาน 40x2.25', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-016', 'BK-016', 'แบบคาน 40x2.50', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-017', 'BK-017', 'แบบคาน 40x2.75', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-018', 'BK-018', 'แบบคาน 40x3.00', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-019', 'BK-019', 'แบบคาน 40x3.25', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-020', 'BK-020', 'แบบคาน 40x3.50', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-021', 'BK-021', 'แบบคาน 40x3.60', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-022', 'BK-022', 'แบบคาน 40x3.75', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),
  buildProduct('seed-bk-023', 'BK-023', 'แบบคาน 40x3.76', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1'),

  // ── แบบเสา (10) ──
  buildProduct('seed-bs-001', 'BS-001', 'แบบเสา 15x15x2.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2'),
  buildProduct('seed-bs-002', 'BS-002', 'แบบเสา 15x15x3.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2'),
  buildProduct('seed-bs-003', 'BS-003', 'แบบเสา 20x20x1.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2'),
  buildProduct('seed-bs-004', 'BS-004', 'แบบเสา 20x20x1.50', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2'),
  buildProduct('seed-bs-005', 'BS-005', 'แบบเสา 20x20x2.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2'),
  buildProduct('seed-bs-006', 'BS-006', 'แบบเสา 20x20x3.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2'),
  buildProduct('seed-bs-007', 'BS-007', 'แบบเสา 20x20x3.50', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2'),
  buildProduct('seed-bs-008', 'BS-008', 'แบบเสา 25x25x1.50', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2'),
  buildProduct('seed-bs-009', 'BS-009', 'แบบเสา 25x25x2.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2'),
  buildProduct('seed-bs-010', 'BS-010', 'แบบเสา 25x25x3.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2'),

  // ── นั่งร้าน (4) ──
  buildProduct('seed-nr-001', 'NR-001', 'นั่งร้าน 1.70(ชุด)', 'นั่งร้าน', 'cat-3', 'NORMAL', 'rt-1', 'ชุด', 'unit-4'),
  buildProduct('seed-nr-002', 'NR-002', 'ล้อ 6นิ้ว', 'นั่งร้าน', 'cat-3', 'NORMAL', 'rt-1', 'ชุด', 'unit-4'),
  buildProduct('seed-nr-003', 'NR-003', 'ล้อ 8นิ้ว', 'นั่งร้าน', 'cat-3', 'NORMAL', 'rt-1', 'ชุด', 'unit-4'),
  buildProduct('seed-nr-004', 'NR-004', 'ขาปรับระดับ', 'นั่งร้าน', 'cat-3', 'NORMAL', 'rt-1', 'ชุด', 'unit-4'),

  // ── อุปกรณ์เสริม (6) ──
  buildProduct('seed-acc-001', 'ACC-NUT-0410', 'น็อต 4/10"', 'อุปกรณ์เสริม', 'cat-4', 'NORMAL', 'rt-1', 'ชิ้น', 'unit-3', { isAccessory: true, isChargeable: false }),
  buildProduct('seed-acc-002', 'ACC-NUT-0414', 'น็อต 4/14"', 'อุปกรณ์เสริม', 'cat-4', 'NORMAL', 'rt-1', 'ชิ้น', 'unit-3', { isAccessory: true, isChargeable: false }),
  buildProduct('seed-acc-003', 'ACC-NUT-0401', 'น็อต 4/1"', 'อุปกรณ์เสริม', 'cat-4', 'NORMAL', 'rt-1', 'ชิ้น', 'unit-3', { isAccessory: true, isChargeable: false }),
  buildProduct('seed-acc-004', 'ACC-CROSS', 'กากบาท', 'อุปกรณ์เสริม', 'cat-4', 'NORMAL', 'rt-1', 'ชิ้น', 'unit-3', { isAccessory: true, isChargeable: false }),
  buildProduct('seed-acc-005', 'ACC-CAP', 'ครอบนั่งร้าน', 'อุปกรณ์เสริม', 'cat-4', 'NORMAL', 'rt-1', 'ชิ้น', 'unit-3', { isAccessory: true, isChargeable: false }),
  buildProduct('seed-acc-006', 'ACC-JOINT', 'ข้อต่อ', 'อุปกรณ์เสริม', 'cat-4', 'NORMAL', 'rt-1', 'ชิ้น', 'unit-3', { isAccessory: true, isChargeable: false }),
]

// ─── Storage helpers ──────────────────────────────────────────────────

/**
 * Load products from localStorage, seeding 43 items if key is absent.
 * Safe to call on the server (returns [] when `window` is undefined).
 */
export function loadProducts(): Product[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // Normalize backward-compatible prices without destroying existing data
        return parsed.map((p: Product) => {
          let rentPrice = p.rentPrice
          let salePrice = p.salePrice

          if (rentPrice === undefined && salePrice === undefined) {
            if (p.rentalType === 'SALE') {
              salePrice = p.salePrice ?? p.sale_price ?? (p.normalPrice || 0)
              rentPrice = null
            } else {
              rentPrice = p.normalPrice || p.dailyPrice || p.normal_price || p.daily_price || 0
              salePrice = p.salePrice ?? p.sale_price ?? null
            }
          }

          const totalQty = p.totalQuantity ?? (p as any).stock_qty ?? (p as any).stock ?? 0
          const availQty = p.availableQuantity ?? (p as any).available_stock ?? totalQty

          return {
            ...p,
            totalQuantity: totalQty,
            availableQuantity: availQty,
            rentPrice: rentPrice !== undefined ? rentPrice : null,
            salePrice: salePrice !== undefined ? salePrice : null,
          }
        })
      }
    }
    // First launch → seed
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS))
    return [...SEED_PRODUCTS]
  } catch {
    return []
  }
}

/** Persist an entire product array (replaces all data). */
export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch {
    // quota exceeded – silently ignore
  }
}

/** Add one or more products, persists immediately, returns the new full list. */
export function addProducts(incoming: Product | Product[]): Product[] {
  const current = loadProducts()
  const arr = Array.isArray(incoming) ? incoming : [incoming]
  const incomingIds = new Set(arr.map((p) => p.id))
  const merged = [...arr, ...current.filter((p) => !incomingIds.has(p.id))]
  saveProducts(merged)
  return merged
}

/** Update a single product in-place, persists immediately, returns the new full list. */
export function updateProduct(updated: Product): Product[] {
  const current = loadProducts()
  const next = current.map((p) => (p.id === updated.id ? updated : p))
  saveProducts(next)
  return next
}

/** Delete a product by id, persists immediately, returns the new full list. */
export function deleteProduct(id: string): Product[] {
  const current = loadProducts()
  const next = current.filter((p) => p.id !== id)
  saveProducts(next)
  return next
}

/** Deduct stock when items are rented or sold. */
export function rentProductStock(
  itemsOrProductId: string | Array<{ productId: string; quantity: number; isSale?: boolean }>,
  quantity?: number,
  isSale?: boolean
): Product[] {
  const current = loadProducts()
  let list: Array<{ productId: string; quantity: number; isSale?: boolean }> = []

  if (typeof itemsOrProductId === 'string') {
    list = [{ productId: itemsOrProductId, quantity: quantity || 0, isSale }]
  } else if (Array.isArray(itemsOrProductId)) {
    list = itemsOrProductId
  }

  // Pre-validate all items to ensure atomicity & non-negative stock (MASTER v2.3.0 Section 8.1)
  for (const item of list) {
    const p = current.find((prod) => prod.id === item.productId)
    if (!p) {
      throw new Error(`ไม่พบข้อมูลสินค้า ID "${item.productId}" ในระบบ`)
    }
    const reqQty = Number(item.quantity) || 0
    if (reqQty > 0 && (p.availableQuantity || 0) < reqQty) {
      throw new Error(
        `สต็อกสินค้า "${p.name}" (รหัส: ${p.code || p.id}) ไม่เพียงพอสำหรับการทำรายการ (ต้องการ ${reqQty}, มีพร้อมใช้ ${p.availableQuantity || 0})`
      )
    }
  }

  const map = new Map(list.map((i) => [i.productId, i]))
  const next = current.map((p) => {
    const item = map.get(p.id)
    if (!item) return p
    const qty = Math.max(0, item.quantity)
    const isProductSale = item.isSale || p.rentalType === 'SALE'

    if (isProductSale) {
      return {
        ...p,
        totalQuantity: Math.max(0, (p.totalQuantity || 0) - qty),
        availableQuantity: Math.max(0, (p.availableQuantity || 0) - qty),
      }
    }
    return {
      ...p,
      availableQuantity: Math.max(0, (p.availableQuantity || 0) - qty),
      rentedQuantity: (p.rentedQuantity || 0) + qty,
      totalRentalCount: (p.totalRentalCount || 0) + qty,
    }
  })
  saveProducts(next)
  return next
}

/** Restore stock when items are returned (normal, damaged, lost). */
export function returnProductStock(
  itemsOrProductId: string | Array<{ productId: string; normalQty?: number; damagedQty?: number; lostQty?: number; quantity?: number }>,
  normalQtyOrTotal?: number,
  damagedQty?: number,
  lostQty?: number
): Product[] {
  const current = loadProducts()
  let list: Array<{ productId: string; normalQty: number; damagedQty: number; lostQty: number }> = []

  if (typeof itemsOrProductId === 'string') {
    list = [{
      productId: itemsOrProductId,
      normalQty: normalQtyOrTotal || 0,
      damagedQty: damagedQty || 0,
      lostQty: lostQty || 0,
    }]
  } else if (Array.isArray(itemsOrProductId)) {
    list = itemsOrProductId.map((i) => ({
      productId: i.productId,
      normalQty: i.normalQty !== undefined ? i.normalQty : (i.quantity || 0),
      damagedQty: i.damagedQty || 0,
      lostQty: i.lostQty || 0,
    }))
  }

  const map = new Map(list.map((i) => [i.productId, i]))
  const next = current.map((p) => {
    const item = map.get(p.id)
    if (!item) return p
    const normal = Math.max(0, item.normalQty || 0)
    const damaged = Math.max(0, item.damagedQty || 0)
    const lost = Math.max(0, item.lostQty || 0)
    const totalReturned = normal + damaged + lost

    return {
      ...p,
      rentedQuantity: Math.max(0, (p.rentedQuantity || 0) - totalReturned),
      availableQuantity: (p.availableQuantity || 0) + normal,
      damagedQuantity: (p.damagedQuantity || 0) + damaged,
      lostQuantity: (p.lostQuantity || 0) + lost,
      totalQuantity: Math.max(0, (p.totalQuantity || 0) - lost),
    }
  })
  saveProducts(next)
  return next
}

/** Restore stock when a sale bill is cancelled (increases totalQuantity and availableQuantity back, without touching rentedQuantity). */
export function restoreSaleProductStock(
  itemsOrProductId: string | Array<{ productId: string; quantity: number }>,
  quantity?: number
): Product[] {
  const current = loadProducts()
  let list: Array<{ productId: string; quantity: number }> = []

  if (typeof itemsOrProductId === 'string') {
    list = [{ productId: itemsOrProductId, quantity: quantity || 0 }]
  } else if (Array.isArray(itemsOrProductId)) {
    list = itemsOrProductId
  }

  const map = new Map(list.map((i) => [i.productId, i]))
  const next = current.map((p) => {
    const item = map.get(p.id)
    if (!item) return p
    const qty = Math.max(0, item.quantity)
    return {
      ...p,
      totalQuantity: (p.totalQuantity || 0) + qty,
      availableQuantity: (p.availableQuantity || 0) + qty,
    }
  })
  saveProducts(next)
  return next
}

/**
 * Adjust product stock by a delta (positive means more rented/sold; negative means less rented/sold).
 * Used by Bill Revision to sync inventory changes.
 */
export function adjustProductStockDelta(
  productId: string,
  quantityDelta: number,
  isSale?: boolean
): Product[] {
  if (quantityDelta === 0) return loadProducts()
  const current = loadProducts()
  const next = current.map((p) => {
    if (p.id !== productId) return p
    const isProductSale = isSale || p.rentalType === 'SALE'
    if (isProductSale) {
      return {
        ...p,
        totalQuantity: Math.max(0, (p.totalQuantity || 0) - quantityDelta),
        availableQuantity: Math.max(0, (p.availableQuantity || 0) - quantityDelta),
      }
    }
    return {
      ...p,
      availableQuantity: Math.max(0, (p.availableQuantity || 0) - quantityDelta),
      rentedQuantity: Math.max(0, (p.rentedQuantity || 0) + quantityDelta),
    }
  })
  saveProducts(next)
  return next
}

export interface ProductAvailabilityResult {
  total: number
  usable: number
  available: number
  availableForRange: number
  reserved: number
  rented: number
  damaged: number
  lost: number
  inRepair: number
}

/**
 * Calculate dated availability for a product taking into account physical stock,
 * damaged, lost, in-repair, currently rented, and peak concurrent reservations within the date range.
 * Invariant: availableForRange >= 0.
 */
export function getProductAvailability(
  productId: string,
  startDate?: string,
  endDate?: string
): ProductAvailabilityResult {
  const products = loadProducts()
  const p = products.find((prod) => prod.id === productId)
  if (!p) {
    return {
      total: 0,
      usable: 0,
      available: 0,
      availableForRange: 0,
      reserved: 0,
      rented: 0,
      damaged: 0,
      lost: 0,
      inRepair: 0,
    }
  }

  const damaged = p.damagedQuantity || 0
  const lost = p.lostQuantity || 0
  const inRepair = p.maintenanceQuantity || p.inRepairQuantity || 0
  const rented = p.rentedQuantity || 0
  const total = p.totalQuantity || 0
  const usable = Math.max(0, total - damaged - lost - inRepair)
  const peakReserved = getPeakReservedQuantity(productId, startDate, endDate)
  const availableForRange = Math.max(0, usable - rented - peakReserved)
  const available = Math.max(0, p.availableQuantity || 0)

  return {
    total,
    usable,
    available,
    availableForRange,
    reserved: peakReserved,
    rented,
    damaged,
    lost,
    inRepair,
  }
}

/**
 * Safe product master update.
 * Guarantees that editing master data (code, name, category, unit, prices, etc.)
 * NEVER changes, resets, or corrupts current stock counts.
 */
export function updateProductMaster(
  updated: Product,
  actor?: { userId: string; displayName: string },
  correlationId?: string
): Product[] {
  const current = loadProducts()
  const existing = current.find((p) => p.id === updated.id)
  if (!existing) {
    return updateProduct(updated)
  }

  // Preserve all inventory counts exactly
  const preservedProduct: Product = {
    ...updated,
    totalQuantity: existing.totalQuantity,
    availableQuantity: existing.availableQuantity,
    rentedQuantity: existing.rentedQuantity,
    damagedQuantity: existing.damagedQuantity,
    lostQuantity: existing.lostQuantity,
    reservedQuantity: existing.reservedQuantity,
    maintenanceQuantity: existing.maintenanceQuantity,
    inRepairQuantity: existing.inRepairQuantity,
  }

  const next = current.map((p) => (p.id === updated.id ? preservedProduct : p))
  saveProducts(next)

  if (actor) {
    const corrId = correlationId || generateCorrelationId()
    recordAuditLog({
      userId: actor.userId,
      displayName: actor.displayName,
      action: 'PRODUCT_MASTER_UPDATE',
      entityType: 'PRODUCT',
      entityId: updated.id,
      before: {
        code: existing.code,
        name: existing.name,
        category: existing.category,
        unit: existing.unit,
        rentalType: existing.rentalType,
        normalPrice: existing.normalPrice,
        salePrice: existing.salePrice,
      },
      after: {
        code: updated.code,
        name: updated.name,
        category: updated.category,
        unit: updated.unit,
        rentalType: updated.rentalType,
        normalPrice: updated.normalPrice,
        salePrice: updated.salePrice,
      },
      correlationId: corrId,
    })
  }

  return next
}

export interface StockCountAdjustmentInput {
  normalQty?: number
  damagedQty?: number
  lostQty?: number
  soldQty?: number
}

/**
 * Apply stock count adjustment from physical count/audit.
 * Persists actual stock, records before/after in audit log with mandatory reason,
 * and if available stock increased, notifies pending backorders FIFO without auto-allocating.
 */
export function applyStockCountAdjustment(
  productId: string,
  counts: StockCountAdjustmentInput,
  reason: string,
  actor: { userId: string; displayName: string },
  correlationId?: string
): Product[] {
  const current = loadProducts()
  const p = current.find((prod) => prod.id === productId)
  if (!p) return current

  const trimmedReason = reason.trim() || 'ตรวจนับสต็อกประจำงวด'
  const corrId = correlationId || generateCorrelationId()

  const before = {
    totalQuantity: p.totalQuantity || 0,
    availableQuantity: p.availableQuantity || 0,
    rentedQuantity: p.rentedQuantity || 0,
    damagedQuantity: p.damagedQuantity || 0,
    lostQuantity: p.lostQuantity || 0,
  }

  const newAvailable = counts.normalQty !== undefined ? Math.max(0, counts.normalQty) : (p.availableQuantity || 0)
  const newDamaged = counts.damagedQty !== undefined ? Math.max(0, counts.damagedQty) : (p.damagedQuantity || 0)
  const newLost = counts.lostQty !== undefined ? Math.max(0, counts.lostQty) : (p.lostQuantity || 0)
  const rented = p.rentedQuantity || 0
  const newTotal = newAvailable + rented + newDamaged + newLost

  const after = {
    totalQuantity: newTotal,
    availableQuantity: newAvailable,
    rentedQuantity: rented,
    damagedQuantity: newDamaged,
    lostQuantity: newLost,
  }

  const updatedProduct: Product = {
    ...p,
    ...after,
  }

  const next = current.map((prod) => (prod.id === productId ? updatedProduct : prod))
  saveProducts(next)

  recordAuditLog({
    userId: actor.userId,
    displayName: actor.displayName,
    action: 'STOCK_COUNT_ADJUSTMENT',
    entityType: 'STOCK',
    entityId: productId,
    before: { ...before, productCode: p.code },
    after: { ...after, productCode: p.code },
    reason: trimmedReason,
    correlationId: corrId,
  })

  // If available stock increased, trigger actionable backorder check
  if (newAvailable > before.availableQuantity) {
    checkBackordersOnStockIncrease(productId, newAvailable, actor, corrId)
  }

  return next
}

/**
 * Synchronize product's reservedQuantity with active reservations.
 */
export function syncProductReservedStock(productId: string): Product[] {
  const current = loadProducts()
  const activeReservations = getActiveReservationsForProduct(productId)
  const totalReserved = activeReservations.reduce((sum, r) => sum + r.quantity, 0)

  const next = current.map((p) => {
    if (p.id === productId) {
      return {
        ...p,
        reservedQuantity: totalReserved,
      }
    }
    return p
  })
  saveProducts(next)
  return next
}
