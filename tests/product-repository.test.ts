import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'

const { mockFrom, mockAuthGetUser } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockAuthGetUser: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: {
      getUser: mockAuthGetUser,
    },
  }),
}))

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

import {
  fetchProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  fetchCategoriesFromSupabase,
  saveCategoryToSupabase,
  deleteCategoryFromSupabase,
  fetchUnitsFromSupabase,
  saveUnitToSupabase,
  deleteUnitFromSupabase,
  insertStockMovementToSupabase,
  isValidUUID,
} from '@/lib/repositories/product-repository'
import { Product } from '@/lib/types/rental-pos'

describe('Master #4 - Product Repository Schema & Mapping Tests', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'real-anon-key'
  })

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
  })

  let capturedUpsertPayload: any = null
  let capturedInsertPayload: any = null
  let capturedDeleteFilter: any = null
  let capturedSelectFieldsByTable: Record<string, string> = {}

  beforeEach(() => {
    vi.clearAllMocks()
    capturedUpsertPayload = null
    capturedInsertPayload = null
    capturedDeleteFilter = null
    capturedSelectFieldsByTable = {}

    mockFrom.mockImplementation((table: string) => ({
      select: vi.fn((fields: string) => {
        capturedSelectFieldsByTable[table] = fields
        return {
          order: vi.fn(async () => {
            if (table === 'products') {
              return {
                data: [
                  {
                    id: '11111111-1111-4111-8111-111111111111',
                    code: 'PROD-01',
                    name: 'สินค้าเช่า 1',
                    category_id: 'cat-1',
                    unit_id: 'unit-1',
                    type: 'RENT',
                    rent_price: 150,
                    sale_price: null,
                    stock_quantity: 25,
                    image_url: 'https://example.com/p1.png',
                    created_at: '2026-09-24T00:00:00Z',
                    updated_at: '2026-09-24T00:00:00Z',
                  },
                ],
                error: null,
              }
            }
            if (table === 'product_categories') {
              return { data: [{ id: 'cat-1', name: 'หมวดทดสอบ' }], error: null }
            }
            if (table === 'units') {
              return { data: [{ id: 'unit-1', name: 'ชิ้น' }], error: null }
            }
            return { data: [], error: null }
          }),
        }
      }),
      upsert: vi.fn(async (payload: any) => {
        capturedUpsertPayload = payload
        return { error: null }
      }),
      insert: vi.fn(async (payload: any) => {
        capturedInsertPayload = payload
        return { error: null }
      }),
      delete: vi.fn(() => ({
        eq: vi.fn(async (col: string, val: any) => {
          capturedDeleteFilter = { col, val }
          return { error: null }
        }),
      })),
    }))

    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: '99999999-9999-4999-8999-999999999999', email: 'admin@tong.com' } },
    })
  })

  it('1. saveProductToSupabase uses ONLY real Remote schema columns and forbids legacy columns', async () => {
    const testProduct: Product = {
      id: 'prod-001',
      code: 'CODE-01',
      name: 'แบบคาน 40x0.50',
      category: 'แบบคาน',
      categoryId: 'cat-100',
      unit: 'แผ่น',
      unitId: 'unit-100',
      rentalType: 'NORMAL',
      productType: 'RENT',
      normalPrice: 50,
      dailyPrice: 0,
      rentPrice: 50,
      salePrice: null,
      defaultDamageFee: 100,
      defaultLossFee: 200,
      totalQuantity: 30,
      availableQuantity: 20,
      rentedQuantity: 10,
      damagedQuantity: 0,
      lostQuantity: 0,
      minimumStock: 5,
      status: 'ACTIVE',
      calculationType: 'PER_ROUND',
      calculationLabel: 'ราคาเช่าต่อรอบ',
    }

    await saveProductToSupabase(testProduct)

    expect(capturedUpsertPayload).toBeDefined()
    // Verify required real columns are present
    expect(capturedUpsertPayload.id).toBe('prod-001')
    expect(capturedUpsertPayload.code).toBe('CODE-01')
    expect(capturedUpsertPayload.name).toBe('แบบคาน 40x0.50')
    expect(capturedUpsertPayload.category_id).toBe('cat-100')
    expect(capturedUpsertPayload.unit_id).toBe('unit-100')
    expect(capturedUpsertPayload.type).toBe('RENT')
    expect(capturedUpsertPayload.rent_price).toBe(50)
    expect(capturedUpsertPayload.sale_price).toBeNull()
    expect(capturedUpsertPayload.stock_quantity).toBe(30)
    expect(capturedUpsertPayload.updated_at).toBeDefined()

    // STRICT CHECK: Ensure forbidden columns are NOT present
    const forbiddenColumns = [
      'rental_type',
      'normal_price',
      'daily_price',
      'default_damage_fee',
      'default_loss_fee',
      'total_quantity',
      'available_quantity',
      'rented_quantity',
      'damaged_quantity',
      'lost_quantity',
      'minimum_stock',
      'status',
      'calculation_type',
      'calculation_label',
      'category',
      'unit',
    ]

    for (const col of forbiddenColumns) {
      expect(capturedUpsertPayload).not.toHaveProperty(col)
    }

    // Ensure category and unit display names are NEVER passed to ID columns
    expect(capturedUpsertPayload.category_id).not.toBe('แบบคาน')
    expect(capturedUpsertPayload.unit_id).not.toBe('แผ่น')
  })

  it('2. saveProductToSupabase properly handles RENT, SALE, and BOTH modes with rent_price and sale_price', async () => {
    // BOTH mode
    const bothProduct: Product = {
      id: 'prod-both-01',
      code: 'BOTH-01',
      name: 'สินค้าเช่าและขาย',
      category: 'ทั่วไป',
      categoryId: 'cat-01',
      unit: 'ชิ้น',
      unitId: 'unit-01',
      rentalType: 'NORMAL',
      productType: 'BOTH',
      normalPrice: 100,
      dailyPrice: 0,
      rentPrice: 100,
      salePrice: 1500,
      defaultDamageFee: 0,
      defaultLossFee: 0,
      totalQuantity: 10,
      availableQuantity: 10,
      rentedQuantity: 0,
      damagedQuantity: 0,
      lostQuantity: 0,
      minimumStock: 0,
      status: 'ACTIVE',
    }

    await saveProductToSupabase(bothProduct)
    expect(capturedUpsertPayload.type).toBe('BOTH')
    expect(capturedUpsertPayload.rent_price).toBe(100)
    expect(capturedUpsertPayload.sale_price).toBe(1500)

    // SALE mode
    const saleProduct: Product = {
      id: 'prod-sale-01',
      code: 'SALE-01',
      name: 'สินค้าขายขาด',
      category: 'ทั่วไป',
      categoryId: 'cat-01',
      unit: 'ชิ้น',
      unitId: 'unit-01',
      rentalType: 'SALE',
      productType: 'SALE',
      normalPrice: 250,
      dailyPrice: 0,
      rentPrice: null,
      salePrice: 250,
      defaultDamageFee: 0,
      defaultLossFee: 0,
      totalQuantity: 50,
      availableQuantity: 50,
      rentedQuantity: 0,
      damagedQuantity: 0,
      lostQuantity: 0,
      minimumStock: 0,
      status: 'ACTIVE',
    }

    await saveProductToSupabase(saleProduct)
    expect(capturedUpsertPayload.type).toBe('SALE')
    expect(capturedUpsertPayload.rent_price).toBeNull()
    expect(capturedUpsertPayload.sale_price).toBe(250)
  })

  it('3. insertStockMovementToSupabase uses real UUID, maps reference and remark, and sends ONLY remote columns', async () => {
    const movementInput = {
      id: 'not-a-uuid-sm-12345',
      type: 'RECEIVE',
      productId: 'prod-001',
      billId: 'bill-abc-123',
      billLineId: 'line-001',
      quantity: 15,
      beforeState: { availableQuantity: 10, totalQuantity: 10 },
      afterState: { availableQuantity: 25, totalQuantity: 25 },
      actor: { userId: 'not-uuid-system', displayName: 'สมหมาย' },
      correlationId: 'corr-xyz-789',
      reason: 'รับสินค้าเข้าสต็อกจากโรงงาน',
      timestamp: '2026-09-24T00:00:00Z',
    }

    await insertStockMovementToSupabase(movementInput)

    expect(capturedInsertPayload).toBeDefined()
    // Verify ID is a valid UUID, not 'sm-...'
    expect(isValidUUID(capturedInsertPayload.id)).toBe(true)
    expect(capturedInsertPayload.id).not.toContain('sm-')

    // Verify mapping
    expect(capturedInsertPayload.product_id).toBe('prod-001')
    expect(capturedInsertPayload.type).toBe('RECEIVE')
    expect(capturedInsertPayload.quantity).toBe(15)
    expect(capturedInsertPayload.reference_id).toBe('bill-abc-123')
    expect(capturedInsertPayload.reference_type).toBe('BILL')
    expect(capturedInsertPayload.remark).toBe('รับสินค้าเข้าสต็อกจากโรงงาน')

    // Verify actor_user_id is resolved to authenticated user UUID, NEVER "system" string
    expect(capturedInsertPayload.actor_user_id).toBe('99999999-9999-4999-8999-999999999999')
    expect(capturedInsertPayload.actor_user_id).not.toBe('system')
    expect(capturedInsertPayload.actor_user_id).not.toBe('not-uuid-system')

    // STRICT CHECK: Ensure forbidden columns are NOT present
    const forbiddenMovementColumns = [
      'bill_id',
      'bill_line_id',
      'before_state',
      'after_state',
      'correlation_id',
      'reason',
    ]

    for (const col of forbiddenMovementColumns) {
      expect(capturedInsertPayload).not.toHaveProperty(col)
    }
  })

  it('4. fetchProductsFromSupabase reads only real Remote schema columns and maps to Product', async () => {
    const products = await fetchProductsFromSupabase()
    expect(products.length).toBe(1)
    const p = products[0]
    expect(p.id).toBe('11111111-1111-4111-8111-111111111111')
    expect(p.code).toBe('PROD-01')
    expect(p.name).toBe('สินค้าเช่า 1')
    expect(p.productType).toBe('RENT')
    expect(p.rentPrice).toBe(150)
    expect(p.salePrice).toBeNull()
    expect(p.totalQuantity).toBe(25)
    expect(p.availableQuantity).toBe(25)
    expect(p.categoryId).toBe('cat-1')
    expect(p.unitId).toBe('unit-1')
    expect(capturedSelectFieldsByTable['products']).toContain('id, code, name, category_id, unit_id, type, rent_price, sale_price, stock_quantity, image_url')
  })

  it('5. deleteProductFromSupabase deletes product by id', async () => {
    await deleteProductFromSupabase('prod-delete-123')
    expect(capturedDeleteFilter).toEqual({ col: 'id', val: 'prod-delete-123' })
  })

  it('6. category and unit functions sync only id and name, and handle deletion cleanly', async () => {
    await saveCategoryToSupabase({ id: 'cat-new-01', name: 'หมวดเหล็ก' })
    expect(capturedUpsertPayload).toEqual({ id: 'cat-new-01', name: 'หมวดเหล็ก' })

    await deleteCategoryFromSupabase('cat-del-01')
    expect(capturedDeleteFilter).toEqual({ col: 'id', val: 'cat-del-01' })

    await saveUnitToSupabase({ id: 'unit-new-01', name: 'กิโลกรัม' })
    expect(capturedUpsertPayload).toEqual({ id: 'unit-new-01', name: 'กิโลกรัม' })

    await deleteUnitFromSupabase('unit-del-01')
    expect(capturedDeleteFilter).toEqual({ col: 'id', val: 'unit-del-01' })
  })
})
