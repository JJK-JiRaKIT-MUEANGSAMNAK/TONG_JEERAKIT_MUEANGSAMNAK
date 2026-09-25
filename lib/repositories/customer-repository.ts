import { createClient } from '@/lib/supabase/client'
import { Customer } from '@/lib/types/rental-pos'

// STATUS: READY_AFTER_REMOTE_APPLY
// This repository is prepared for Supabase migration but currently the application relies on customer-storage.ts (local storage) to maintain runtime stability.

const supabase = createClient()

export async function fetchCustomersFromSupabase(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
  if (error) throw error
  
  return data.map((c: any) => ({
    id: c.id,
    customerCode: c.customer_code,
    customerName: c.customer_name,
    customerType: c.customer_type,
    companyName: c.company_name,
    taxId: c.tax_id,
    phone: c.phone || '',
    status: c.status,
    phone2: c.phone2,
    email: c.email,
    lineId: c.line_id,
    address: c.address,
    houseNo: c.house_no,
    moo: c.moo,
    soi: c.soi,
    road: c.road,
    subDistrict: c.sub_district,
    district: c.district,
    province: c.province,
    postalCode: c.postal_code,
    idCardNumber: c.id_card_number,
    idCardImageUrl: c.id_card_image_url,
    idCardExpiry: c.id_card_expiry,
    isSuspended: c.is_suspended,
    note: c.note,
    createdAt: c.created_at
  }))
}

export async function saveCustomerToSupabase(customer: Customer): Promise<void> {
  const { error } = await supabase.from('customers').upsert({
    id: customer.id,
    customer_code: customer.customerCode,
    customer_name: customer.customerName,
    customer_type: customer.customerType,
    company_name: customer.companyName,
    tax_id: customer.taxId,
    phone: customer.phone,
    status: customer.status,
    phone2: customer.phone2,
    email: customer.email,
    line_id: customer.lineId,
    address: customer.address,
    house_no: customer.houseNo,
    moo: customer.moo,
    soi: customer.soi,
    road: customer.road,
    sub_district: customer.subDistrict,
    district: customer.district,
    province: customer.province,
    postal_code: customer.postalCode,
    id_card_number: customer.idCardNumber,
    id_card_image_url: customer.idCardImageUrl,
    id_card_expiry: customer.idCardExpiry,
    is_suspended: customer.isSuspended,
    note: customer.note,
    updated_at: new Date().toISOString()
  })
  
  if (error) throw error
}
