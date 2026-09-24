import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchProductsFromSupabase } from '@/lib/repositories/product-repository'
import { recordStockMovement, clearStockMovements } from '@/lib/stock-movement'

let mockInsertFails = false

const { mockRemoteProducts, mockRemoteMovements, mockFrom } = vi.hoisted(() => {
  const products: any[] = []
  const movements: any[] = []
  return {
    mockRemoteProducts: products,
    mockRemoteMovements: movements,
    mockFrom: vi.fn((table: string) => ({
      select: vi.fn((fields: string) => ({
        order: vi.fn(async () => {
          if (table === 'products') return { data: products, error: null }
          if (table === 'stock_movements') return { data: movements, error: null }
          return { data: [], error: null }
        })
      })),
      insert: vi.fn(async (payload: any) => {
        if (mockInsertFails) return { error: new Error('DB Connection Failed') }
        return { error: null }
      })
    }))
  }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '0000', user_metadata: { full_name: 'Test' } } } })
    }
  })
}))

// We need to bypass the placeholder check
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'real-key'

describe('Product/Stock Runtime Correction Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearStockMovements()
    mockRemoteProducts.length = 0
    mockRemoteMovements.length = 0
    mockInsertFails = false
  })

  it('Remote [] => runtime []', async () => {
    // Array is empty
    const products = await fetchProductsFromSupabase()
    expect(products.length).toBe(0)
  })

  it('RENT -> reload: availableQuantity drops, rentedQuantity increases', async () => {
    mockRemoteProducts.push({ id: 'p1', type: 'RENT', stock_quantity: 10 })
    mockRemoteMovements.push({ product_id: 'p1', type: 'RENT', quantity: 2, created_at: '2026-09-24T10:00:00Z' })
    const products = await fetchProductsFromSupabase()
    expect(products[0].availableQuantity).toBe(8)
    expect(products[0].rentedQuantity).toBe(2)
  })

  it('RETURN -> reload: rentedQuantity drops, availableQuantity increases', async () => {
    mockRemoteProducts.push({ id: 'p1', type: 'RENT', stock_quantity: 10 })
    mockRemoteMovements.push(
      { product_id: 'p1', type: 'RENT', quantity: 4 },
      { product_id: 'p1', type: 'RETURN', quantity: 1 }
    )
    const products = await fetchProductsFromSupabase()
    expect(products[0].availableQuantity).toBe(7)
    expect(products[0].rentedQuantity).toBe(3)
  })

  it('DAMAGE/LOST -> reload: rented drops, damaged/lost increases, available is unharmed further', async () => {
    mockRemoteProducts.push({ id: 'p1', type: 'RENT', stock_quantity: 8 }) // total 10, lost 2, so remote stock_quantity is 8
    mockRemoteMovements.push(
      { product_id: 'p1', type: 'RENT', quantity: 5 },
      { product_id: 'p1', type: 'DAMAGE', quantity: 1 },
      { product_id: 'p1', type: 'LOST', quantity: 2 }
    )
    const products = await fetchProductsFromSupabase()
    expect(products[0].availableQuantity).toBe(5) // total(10) - rented(2) - damaged(1) - lost(2) = 5
    expect(products[0].rentedQuantity).toBe(2)
    expect(products[0].damagedQuantity).toBe(1)
    expect(products[0].lostQuantity).toBe(2)
  })

  it('SALE -> reload: available drops (if not handled by DB trigger)', async () => {
    // If DB trigger reduces stock_quantity on SALE, we don't recalculate it here. 
    // In our implementation, SALE is NOT in the loop.
    mockRemoteProducts.push({ id: 'p1', type: 'SALE', stock_quantity: 50 })
    mockRemoteMovements.push({ product_id: 'p1', type: 'SALE', quantity: 10 })
    const products = await fetchProductsFromSupabase()
    // It should remain 50, because SALE doesn't reduce available in the recalculation loop
    // since we assume stock_quantity reflects the post-sale physical stock.
    expect(products[0].availableQuantity).toBe(50)
  })

  it('movement insert failure -> sends failure back (throws error)', async () => {
    mockInsertFails = true
    await expect(recordStockMovement({
      type: 'RENT',
      productId: 'p1',
      quantity: 1,
      beforeState: {},
      afterState: {},
      actor: { userId: '1', displayName: 'Sys' }
    })).rejects.toThrow('DB Connection Failed')
  })
})
