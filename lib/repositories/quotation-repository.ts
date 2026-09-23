import { createClient } from '@/lib/supabase/client'
import { Quotation } from '@/lib/types/rental-pos'

// STATUS: READY_AFTER_REMOTE_APPLY
// This repository is prepared for Supabase migration but currently the application relies on quotation-storage.ts (local storage) to maintain runtime stability.

const supabase = createClient()

export async function fetchQuotationsFromSupabase(): Promise<Quotation[]> {
  const { data: quotes, error: quotesError } = await supabase.from('quotations').select('*').order('created_at', { ascending: false })
  if (quotesError) throw quotesError
  
  const { data: items, error: itemsError } = await supabase.from('quotation_items').select('*')
  if (itemsError) throw itemsError
  
  return quotes.map((q: any) => {
    const qItems = items.filter((i: any) => i.quotation_id === q.id).map((i: any) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name,
      productCode: i.product_code,
      unitName: i.unit_name,
      rentalType: i.rental_type as any,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      usageCountOrDays: i.usage_count_or_days,
      dailyStartDate: i.daily_start_date,
      dailyEndDate: i.daily_end_date,
      lineTotal: Number(i.line_total)
    }))
    
    return {
      id: q.id,
      quotationNo: q.quotation_no,
      customerId: q.customer_id,
      customerName: q.customer_name,
      customerAddress: q.customer_address,
      customerTaxId: q.customer_tax_id,
      phone: q.customer_phone,
      siteName: q.site_name,
      rentalStartDate: q.rental_start_date,
      rentalEndDate: q.rental_end_date,
      discountAmount: Number(q.discount_amount),
      shippingFee: Number(q.shipping_fee),
      taxAmount: Number(q.tax_amount),
      depositAmount: Number(q.deposit_amount),
      grandTotal: Number(q.grand_total),
      status: q.status as any,
      remark: q.remark,
      cancelReason: q.cancel_reason,
      convertedBillId: q.converted_bill_id,
      items: qItems,
      createdAt: q.created_at,
      acceptedAt: q.accepted_at,
      cancelledAt: q.cancelled_at
    } as unknown as Quotation
  })
}

export async function saveQuotationToSupabase(quotation: Quotation): Promise<void> {
  const { error: quoteError } = await supabase.from('quotations').upsert({
    id: quotation.id,
    quotation_no: quotation.quotationNo,
    customer_id: quotation.customerId,
    customer_name: quotation.customerName,
    customer_phone: quotation.phone,
    customer_address: quotation.customerAddress,
    customer_tax_id: quotation.customerTaxId,
    site_name: quotation.siteName,
    rental_start_date: quotation.rentalStartDate,
    rental_end_date: quotation.rentalEndDate,
    discount_amount: quotation.discountAmount,
    shipping_fee: quotation.shippingFee,
    tax_amount: quotation.taxAmount,
    deposit_amount: quotation.depositAmount,
    grand_total: quotation.grandTotal,
    status: quotation.status,
    remark: quotation.remark,
    cancel_reason: quotation.cancelReason,
    converted_bill_id: quotation.convertedBillId,
    updated_at: new Date().toISOString(),
    accepted_at: quotation.acceptedAt,
    cancelled_at: quotation.cancelledAt
  })
  
  if (quoteError) throw quoteError
  
  // Delete existing items and re-insert
  await supabase.from('quotation_items').delete().eq('quotation_id', quotation.id)
  
  if (quotation.items.length > 0) {
    const { error: itemsError } = await supabase.from('quotation_items').insert(
      quotation.items.map(item => ({
        id: item.id?.startsWith('cart-') ? undefined : item.id, // Generate new UUID if local cart ID
        quotation_id: quotation.id,
        product_id: item.productId,
        product_name: item.productName,
        product_code: item.productId, // No productCode in QuotationItem type, use productId
        unit_name: item.unitName,
        rental_type: item.rentalType,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        usage_count_or_days: item.usageCountOrDays,
        daily_start_date: item.dailyStartDate,
        daily_end_date: item.dailyEndDate,
        line_total: item.lineTotal
      }))
    )
    if (itemsError) throw itemsError
  }
}
