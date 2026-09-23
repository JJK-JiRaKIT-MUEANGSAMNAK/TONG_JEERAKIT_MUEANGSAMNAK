import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types/rental-pos'

// STATUS: READY_AFTER_REMOTE_APPLY
// This repository is prepared for Supabase migration but currently the application relies on product-storage.ts (local storage) to maintain runtime stability.

const supabase = createClient()

export async function fetchProductsFromSupabase(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (error) throw error
  
  return data.map((p: any) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    category: p.category_id || 'ทั่วไป', // needs category mapping in a real app
    unit: p.unit_id || 'ชิ้น', // needs unit mapping in a real app
    rentalType: p.rental_type as any,
    normalPrice: Number(p.normal_price),
    dailyPrice: p.daily_price ? Number(p.daily_price) : undefined,
    rentPrice: p.rent_price ? Number(p.rent_price) : undefined,
    salePrice: p.sale_price ? Number(p.sale_price) : undefined,
    defaultDamageFee: Number(p.default_damage_fee),
    defaultLossFee: Number(p.default_loss_fee),
    totalQuantity: p.total_quantity,
    availableQuantity: p.available_quantity,
    rentedQuantity: p.rented_quantity,
    damagedQuantity: p.damaged_quantity,
    lostQuantity: p.lost_quantity,
    minimumStock: p.minimum_stock,
    status: p.status as any,
    calculationType: p.calculation_type,
    calculationLabel: p.calculation_label
  } as unknown as Product))
}

export async function saveProductToSupabase(product: Product): Promise<void> {
  const { error } = await supabase.from('products').upsert({
    id: product.id,
    code: product.code,
    name: product.name,
    category_id: product.category, // simplified for now
    unit_id: product.unit, // simplified for now
    rental_type: product.rentalType,
    normal_price: product.normalPrice,
    daily_price: product.dailyPrice,
    rent_price: product.rentPrice,
    sale_price: product.salePrice,
    default_damage_fee: product.defaultDamageFee,
    default_loss_fee: product.defaultLossFee,
    total_quantity: product.totalQuantity,
    available_quantity: product.availableQuantity,
    rented_quantity: product.rentedQuantity,
    damaged_quantity: product.damagedQuantity,
    lost_quantity: product.lostQuantity,
    minimum_stock: product.minimumStock,
    status: product.status,
    calculation_type: product.calculationType,
    calculation_label: product.calculationLabel,
    updated_at: new Date().toISOString()
  })
  
  if (error) throw error
}
