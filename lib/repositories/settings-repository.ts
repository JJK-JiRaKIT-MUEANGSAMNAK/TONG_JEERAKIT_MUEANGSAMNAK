import { createClient } from '@/lib/supabase/client'
import { SystemSettings, SystemSecrets } from '@/lib/types/settings'

// STATUS: READY_AFTER_REMOTE_APPLY
// This repository is prepared for Supabase migration but currently the application relies on local storage or stub data to maintain runtime stability.

const supabase = createClient()

export async function fetchSystemSettings(): Promise<SystemSettings | null> {
  const { data, error } = await supabase.from('system_settings').select('*').limit(1).single()
  if (error && error.code !== 'PGRST116') throw error
  if (!data) return null
  
  return {
    id: data.id,
    companyName: data.company_name,
    companyAddress: data.company_address || '',
    companyTaxId: data.company_tax_id || '',
    companyPhone: data.company_phone || '',
    companyEmail: data.company_email || '',
    logoUrl: data.logo_url,
    receiptFooterText: data.receipt_footer_text,
    quotationNote: data.quotation_note,
    defaultRentalDays: data.default_rental_days || 1,
    updatedAt: data.updated_at
  }
}

export async function saveSystemSettings(settings: SystemSettings): Promise<void> {
  const { error } = await supabase.from('system_settings').upsert({
    id: settings.id,
    company_name: settings.companyName,
    company_address: settings.companyAddress,
    company_tax_id: settings.companyTaxId,
    company_phone: settings.companyPhone,
    company_email: settings.companyEmail,
    logo_url: settings.logoUrl,
    receipt_footer_text: settings.receiptFooterText,
    quotation_note: settings.quotationNote,
    default_rental_days: settings.defaultRentalDays,
    updated_at: new Date().toISOString()
  })
  if (error) throw error
}

export async function fetchSystemSecrets(): Promise<SystemSecrets | null> {
  const { data, error } = await supabase.from('system_secrets').select('*').limit(1).single()
  if (error && error.code !== 'PGRST116') throw error
  if (!data) return null
  
  return {
    id: data.id,
    lineChannelAccessToken: data.line_channel_access_token,
    lineChannelSecret: data.line_channel_secret,
    promptpayId: data.promptpay_id,
    updatedAt: data.updated_at
  }
}

export async function saveSystemSecrets(secrets: SystemSecrets): Promise<void> {
  const { error } = await supabase.from('system_secrets').upsert({
    id: secrets.id,
    line_channel_access_token: secrets.lineChannelAccessToken,
    line_channel_secret: secrets.lineChannelSecret,
    promptpay_id: secrets.promptpayId,
    updated_at: new Date().toISOString()
  })
  if (error) throw error
}
