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
    customerName: c.customer_name,
    phone: c.phone || '',
    address: c.address || '',
    taxId: c.tax_id || '',
    email: c.email || '',
    companyName: c.company_name || '',
    idCardNumber: c.id_card_number || '',
    idCardExpiry: c.id_card_expiry || ''
  }))
}

export async function saveCustomerToSupabase(customer: Customer): Promise<void> {
  const { error } = await supabase.from('customers').upsert({
    id: customer.id,
    customer_name: customer.customerName,
    phone: customer.phone,
    address: customer.address,
    tax_id: customer.taxId,
    email: customer.email,
    company_name: customer.companyName,
    id_card_number: customer.idCardNumber,
    id_card_expiry: customer.idCardExpiry,
    updated_at: new Date().toISOString()
  })
  
  if (error) throw error
}
