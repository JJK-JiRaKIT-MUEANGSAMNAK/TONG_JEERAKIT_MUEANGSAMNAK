import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types/rental-pos'

// STATUS: ALIGNED_WITH_REMOTE_SCHEMA
// Real Remote Columns:
// products: id, code, name, category_id, unit_id, type, rent_price, sale_price, stock_quantity, image_url, created_at, updated_at
// stock_movements: id (UUID), product_id, type, quantity, reference_id, reference_type, remark, actor_user_id, actor_display_name, created_at

const supabase = createClient()

export function isValidUUID(val?: string | null): boolean {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val)
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function isPlaceholderConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || url.includes('placeholder') || !key || key.includes('placeholder')
}

/**
 * Fetch all products from Supabase using only real Remote schema columns.
 */
export async function fetchProductsFromSupabase(): Promise<Product[]> {
  if (isPlaceholderConfig()) {
    return []
  }

  const [{ data, error }, { data: movementsData }] = await Promise.all([
    supabase
      .from('products')
      .select('id, code, name, category_id, unit_id, type, rent_price, sale_price, stock_quantity, image_url, created_at, updated_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('stock_movements')
      .select('product_id, type, quantity, created_at')
      .order('created_at', { ascending: true })
  ])

  if (error) throw error

  const movements = movementsData || []
  
  // Group movements by product_id
  const movementsByProduct: Record<string, any[]> = {}
  for (const m of movements) {
    if (!movementsByProduct[m.product_id]) {
      movementsByProduct[m.product_id] = []
    }
    movementsByProduct[m.product_id].push(m)
  }

  return (data || []).map((p: any) => {
    const type: 'RENT' | 'SALE' | 'BOTH' = p.type || (p.rental_type === 'SALE' ? 'SALE' : 'RENT')
    const rentPrice = p.rent_price !== null && p.rent_price !== undefined ? Number(p.rent_price) : null
    const salePrice = p.sale_price !== null && p.sale_price !== undefined ? Number(p.sale_price) : null
    const stockQty = Number(p.stock_quantity ?? 0)

    let rented = 0
    let damaged = 0
    let lost = 0

    const prodMovements = movementsByProduct[p.id] || []
    for (const m of prodMovements) {
      if (m.type === 'RENT') {
        rented += m.quantity
      } else if (m.type === 'RETURN') {
        rented = Math.max(0, rented - m.quantity)
      } else if (m.type === 'DAMAGE') {
        damaged += m.quantity
        rented = Math.max(0, rented - m.quantity)
      } else if (m.type === 'LOST') {
        lost += m.quantity
        rented = Math.max(0, rented - m.quantity)
      }
    }

    const available = Math.max(0, stockQty - rented - damaged)

    return {
      id: p.id,
      code: p.code || '',
      name: p.name || '',
      categoryId: p.category_id || undefined,
      category: '',
      unitId: p.unit_id || undefined,
      unit: '',
      rentalType: type === 'SALE' ? 'SALE' : 'NORMAL',
      productType: type,
      rentPrice,
      salePrice,
      normalPrice: rentPrice ?? 0,
      dailyPrice: 0,
      totalQuantity: stockQty,
      availableQuantity: available,
      rentedQuantity: rented,
      damagedQuantity: damaged,
      lostQuantity: lost,
      minimumStock: 0,
      status: 'ACTIVE',
      requiresReturn: type !== 'SALE',
      createdAt: p.created_at,
      product_code: p.code,
      product_name: p.name,
      stock_quantity: stockQty,
      rent_price: rentPrice,
      sale_price: salePrice,
      imageUrl: p.image_url || undefined,
    } as unknown as Product
  })
}

/**
 * Upsert product to Supabase using ONLY real Remote schema columns:
 * id, code, name, category_id, unit_id, type, rent_price, sale_price, stock_quantity, image_url, updated_at
 */
export async function saveProductToSupabase(product: Product): Promise<void> {
  if (isPlaceholderConfig()) return

  // Determine type: RENT, SALE, or BOTH
  let type: 'RENT' | 'SALE' | 'BOTH' = 'RENT'
  if (product.productType) {
    type = product.productType
  } else if (product.rentalType === 'SALE') {
    type = 'SALE'
  } else if ((product.rentalType as any) === 'BOTH') {
    type = 'BOTH'
  }

  // Determine rent_price and sale_price
  let rentPrice: number | null = null
  if (product.rentPrice !== undefined && product.rentPrice !== null) {
    rentPrice = Number(product.rentPrice)
  } else if (type !== 'SALE') {
    rentPrice = Number(product.normalPrice ?? product.dailyPrice ?? (product as any).normal_price ?? (product as any).daily_price ?? 0)
  }

  let salePrice: number | null = null
  if (product.salePrice !== undefined && product.salePrice !== null) {
    salePrice = Number(product.salePrice)
  } else if (type !== 'RENT') {
    salePrice = Number((product as any).sale_price ?? (product.rentalType === 'SALE' ? product.normalPrice : 0))
  }

  const stockQuantity = Number((product as any).stock_quantity ?? product.totalQuantity ?? product.availableQuantity ?? 0)

  // categoryId -> category_id; unitId -> unit_id
  // DO NOT use product.category or product.unit display names as IDs
  let categoryId = product.categoryId || (product as any).category_id || null
  let unitId = product.unitId || (product as any).unit_id || null

  if (categoryId === product.category) {
    categoryId = null
  }
  if (unitId === product.unit) {
    unitId = null
  }

  const imageUrl = (product as any).imageUrl || (product as any).image_url || null
  const id = product.id || generateUUID()

  const payload = {
    id,
    code: product.code || (product as any).product_code || '',
    name: product.name || (product as any).product_name || '',
    category_id: categoryId,
    unit_id: unitId,
    type,
    rent_price: rentPrice,
    sale_price: salePrice,
    stock_quantity: stockQuantity,
    image_url: imageUrl,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('products').upsert(payload)
  if (error) throw error
}

/**
 * Delete product from Supabase
 */
export async function deleteProductFromSupabase(id: string): Promise<void> {
  if (isPlaceholderConfig()) return
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

/**
 * Categories repository methods
 */
export async function fetchCategoriesFromSupabase(): Promise<Array<{ id: string; name: string }>> {
  if (isPlaceholderConfig()) return []
  const { data, error } = await supabase.from('product_categories').select('id, name').order('name')
  if (error) throw error
  return data || []
}

export async function saveCategoryToSupabase(category: { id: string; name: string }): Promise<void> {
  if (isPlaceholderConfig()) return
  const { error } = await supabase.from('product_categories').upsert({
    id: category.id,
    name: category.name,
  })
  if (error) throw error
}

export async function deleteCategoryFromSupabase(id: string): Promise<void> {
  if (isPlaceholderConfig()) return
  const { error } = await supabase.from('product_categories').delete().eq('id', id)
  if (error) throw error
}

/**
 * Units repository methods
 */
export async function fetchUnitsFromSupabase(): Promise<Array<{ id: string; name: string }>> {
  if (isPlaceholderConfig()) return []
  const { data, error } = await supabase.from('units').select('id, name').order('name')
  if (error) throw error
  return data || []
}

export async function saveUnitToSupabase(unit: { id: string; name: string; isActive?: boolean }): Promise<void> {
  if (isPlaceholderConfig()) return
  const { error } = await supabase.from('units').upsert({
    id: unit.id,
    name: unit.name,
  })
  if (error) throw error
}

export async function deleteUnitFromSupabase(id: string): Promise<void> {
  if (isPlaceholderConfig()) return
  const { error } = await supabase.from('units').delete().eq('id', id)
  if (error) throw error
}

/**
 * Stock Movements repository method:
 * Remote stock_movements columns:
 * id (UUID), product_id, type, quantity, reference_id, reference_type, remark, actor_user_id, actor_display_name, created_at
 * Append-only. No update/delete.
 */

export async function fetchStockMovementsFromSupabase(): Promise<any[]> {
  if (isPlaceholderConfig()) return []

  const { data, error } = await supabase
    .from('stock_movements')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function insertStockMovementToSupabase(movement: any): Promise<void> {
  if (isPlaceholderConfig()) return

  // Ensure valid UUID id
  const id = isValidUUID(movement.id) ? movement.id : generateUUID()

  // actor_user_id must be real authenticated user UUID
  let actorUserId = movement.actor?.userId || movement.actor_user_id || null
  let actorDisplayName = movement.actor?.displayName || movement.actor_display_name || 'System'

  if (!isValidUUID(actorUserId)) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        actorUserId = user.id
        actorDisplayName = user.user_metadata?.full_name || user.email || actorDisplayName
      } else {
        // Do NOT fallback to "system" string
        actorUserId = null
      }
    } catch {
      actorUserId = null
    }
  }

  // reference_id and reference_type mapping:
  const referenceId = movement.billId || movement.referenceId || movement.reference_id || null
  const referenceType = movement.referenceType || movement.reference_type || (referenceId ? 'BILL' : (movement.type === 'ADJUSTMENT' ? 'ADJUSTMENT' : 'MANUAL'))

  // reason -> remark
  const remark = movement.remark || movement.reason || null

  const payload = {
    id,
    product_id: movement.productId || movement.product_id,
    type: movement.type,
    quantity: Math.max(0, movement.quantity ?? 0),
    reference_id: referenceId,
    reference_type: referenceType,
    remark,
    actor_user_id: actorUserId,
    actor_display_name: actorDisplayName,
    created_at: movement.timestamp || movement.createdAt || movement.created_at || new Date().toISOString(),
  }

  const { error } = await supabase.from('stock_movements').insert(payload)
  if (error) throw error
}
