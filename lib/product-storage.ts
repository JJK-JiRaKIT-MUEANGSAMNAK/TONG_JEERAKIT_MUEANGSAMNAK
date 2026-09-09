/**
 * Shared Product Storage
 *
 * Single source of truth for product data, backed by localStorage.
 * - Seeds 43 products on first launch (no storage key found).
 * - All CRUD helpers persist changes immediately.
 * - Both /products and /pos must import from here.
 */

import { Product, RentalType } from '@/lib/types/rental-pos'

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
    normalPrice: 0,
    dailyPrice: 0,
    salePrice: 0,
    costPrice: 0,
    defaultDamageFee: 0,
    defaultLossFee: 0,
    totalQuantity: 0,
    availableQuantity: 0,
    rentedQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    minimumStock: 3,
    status: 'ACTIVE',
    isAccessory,
    isChargeable: !isAccessory,
    requiresReturn: true,
    ...overrides,
  }
}

const SEED_PRODUCTS: Product[] = [
  // ── แบบคาน (23) — NORMAL, แผ่น, normalPrice from SQL ──
  buildProduct('seed-bk-001', 'BK-001', 'แบบคาน 40x0.50', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 10, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-002', 'BK-002', 'แบบคาน 40x0.70', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 14, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-003', 'BK-003', 'แบบคาน 40x0.75', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 15, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-004', 'BK-004', 'แบบคาน 40x0.80', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 16, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-005', 'BK-005', 'แบบคาน 40x1.00', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 20, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-006', 'BK-006', 'แบบคาน 40x1.20', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 24, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-007', 'BK-007', 'แบบคาน 40x1.25', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 25, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-008', 'BK-008', 'แบบคาน 40x1.30', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 26, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-009', 'BK-009', 'แบบคาน 40x1.50', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 30, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-010', 'BK-010', 'แบบคาน 40x1.60', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 32, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-011', 'BK-011', 'แบบคาน 40x1.75', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 35, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-012', 'BK-012', 'แบบคาน 40x1.80', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 36, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-013', 'BK-013', 'แบบคาน 40x2.00', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 40, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-014', 'BK-014', 'แบบคาน 40x2.20', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 44, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-015', 'BK-015', 'แบบคาน 40x2.25', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 45, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-016', 'BK-016', 'แบบคาน 40x2.50', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 50, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-017', 'BK-017', 'แบบคาน 40x2.75', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 55, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-018', 'BK-018', 'แบบคาน 40x3.00', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 60, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-019', 'BK-019', 'แบบคาน 40x3.25', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 65, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-020', 'BK-020', 'แบบคาน 40x3.50', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 70, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-021', 'BK-021', 'แบบคาน 40x3.60', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 72, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-022', 'BK-022', 'แบบคาน 40x3.75', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 75, defaultQtyPerSet: 1 }),
  buildProduct('seed-bk-023', 'BK-023', 'แบบคาน 40x3.76', 'แบบคาน', 'cat-1', 'NORMAL', 'rt-1', 'แผ่น', 'unit-1', { normalPrice: 80, defaultQtyPerSet: 1 }),

  // ── แบบเสา (10) — NORMAL, ต้น, normalPrice from SQL ──
  buildProduct('seed-bs-001', 'BS-001', 'แบบเสา 15x15x2.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2', { normalPrice: 80, defaultQtyPerSet: 1 }),
  buildProduct('seed-bs-002', 'BS-002', 'แบบเสา 15x15x3.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2', { normalPrice: 100, defaultQtyPerSet: 1 }),
  buildProduct('seed-bs-003', 'BS-003', 'แบบเสา 20x20x1.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2', { normalPrice: 60, defaultQtyPerSet: 1 }),
  buildProduct('seed-bs-004', 'BS-004', 'แบบเสา 20x20x1.50', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2', { normalPrice: 80, defaultQtyPerSet: 1 }),
  buildProduct('seed-bs-005', 'BS-005', 'แบบเสา 20x20x2.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2', { normalPrice: 90, defaultQtyPerSet: 1 }),
  buildProduct('seed-bs-006', 'BS-006', 'แบบเสา 20x20x3.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2', { normalPrice: 100, defaultQtyPerSet: 1 }),
  buildProduct('seed-bs-007', 'BS-007', 'แบบเสา 20x20x3.50', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2', { normalPrice: 150, defaultQtyPerSet: 1 }),
  buildProduct('seed-bs-008', 'BS-008', 'แบบเสา 25x25x1.50', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2', { normalPrice: 90, defaultQtyPerSet: 1 }),
  buildProduct('seed-bs-009', 'BS-009', 'แบบเสา 25x25x2.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2', { normalPrice: 100, defaultQtyPerSet: 1 }),
  buildProduct('seed-bs-010', 'BS-010', 'แบบเสา 25x25x3.00', 'แบบเสา', 'cat-2', 'NORMAL', 'rt-1', 'ต้น', 'unit-2', { normalPrice: 160, defaultQtyPerSet: 1 }),

  // ── นั่งร้าน/อุปกรณ์ (4) — DAILY, ชุด (v_unit_set), dailyPrice from SQL ──
  buildProduct('seed-nr-001', 'NR-001', 'นั่งร้าน 1.70(ชุด)', 'นั่งร้าน/อุปกรณ์', 'cat-3', 'DAILY', 'rt-2', 'ชุด', 'unit-4', { dailyPrice: 15, defaultQtyPerSet: 1 }),
  buildProduct('seed-nr-002', 'NR-002', 'ล้อ 6นิ้ว', 'นั่งร้าน/อุปกรณ์', 'cat-3', 'DAILY', 'rt-2', 'ชุด', 'unit-4', { dailyPrice: 20, defaultQtyPerSet: 1 }),
  buildProduct('seed-nr-003', 'NR-003', 'ล้อ 8นิ้ว', 'นั่งร้าน/อุปกรณ์', 'cat-3', 'DAILY', 'rt-2', 'ชุด', 'unit-4', { dailyPrice: 20, defaultQtyPerSet: 1 }),
  buildProduct('seed-nr-004', 'NR-004', 'ขาปรับระดับ', 'นั่งร้าน/อุปกรณ์', 'cat-3', 'DAILY', 'rt-2', 'ชุด', 'unit-4', { dailyPrice: 20, defaultQtyPerSet: 1 }),

  // ── อุปกรณ์เสริม (6) — DAILY, ตัว/อัน, isAccessory=true, isChargeable=false ──
  buildProduct('seed-acc-001', 'ACC-NUT-0410', 'น็อต 4/10"', 'อุปกรณ์เสริม', 'cat-4', 'DAILY', 'rt-2', 'ตัว', 'unit-5', { isAccessory: true, isChargeable: false, defaultQtyPerSet: 1 }),
  buildProduct('seed-acc-002', 'ACC-NUT-0414', 'น็อต 4/14"', 'อุปกรณ์เสริม', 'cat-4', 'DAILY', 'rt-2', 'ตัว', 'unit-5', { isAccessory: true, isChargeable: false, defaultQtyPerSet: 1 }),
  buildProduct('seed-acc-003', 'ACC-NUT-0401', 'น็อต 4/1"', 'อุปกรณ์เสริม', 'cat-4', 'DAILY', 'rt-2', 'ตัว', 'unit-5', { isAccessory: true, isChargeable: false, defaultQtyPerSet: 1 }),
  buildProduct('seed-acc-004', 'ACC-CROSS', 'กากบาท', 'อุปกรณ์เสริม', 'cat-4', 'DAILY', 'rt-2', 'อัน', 'unit-6', { isAccessory: true, isChargeable: false, defaultQtyPerSet: 2 }),
  buildProduct('seed-acc-005', 'ACC-CAP', 'ครอบนั่งร้าน', 'อุปกรณ์เสริม', 'cat-4', 'DAILY', 'rt-2', 'อัน', 'unit-6', { isAccessory: true, isChargeable: false, defaultQtyPerSet: 1 }),
  buildProduct('seed-acc-006', 'ACC-JOINT', 'ข้อต่อ', 'อุปกรณ์เสริม', 'cat-4', 'DAILY', 'rt-2', 'อัน', 'unit-6', { isAccessory: true, isChargeable: false, defaultQtyPerSet: 4 }),
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
      if (Array.isArray(parsed)) return parsed as Product[]
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
