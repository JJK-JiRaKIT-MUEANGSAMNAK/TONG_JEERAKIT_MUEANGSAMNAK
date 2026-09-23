import { createClient } from '@/lib/supabase/client'
import { FullBill } from '@/lib/types/rental-return'

// STATUS: READY_AFTER_REMOTE_APPLY
// This repository is prepared for Supabase migration but currently the application relies on bill-storage.ts (local storage) to maintain runtime stability.

const supabase = createClient()

export async function fetchBillsFromSupabase(): Promise<FullBill[]> {
  const { data: bills, error: billsError } = await supabase.from('bills').select('*').order('created_at', { ascending: false })
  if (billsError) throw billsError
  
  const { data: items, error: itemsError } = await supabase.from('bill_items').select('*')
  if (itemsError) throw itemsError
  
  return bills.map((b: any) => {
    const bItems = items.filter((i: any) => i.bill_id === b.id).map((i: any) => ({
      rentalBillItemId: i.id,
      productId: i.product_id,
      productName: i.product_name,
      productCode: i.product_code,
      unit: i.unit,
      rentalType: i.rental_type,
      quantity: i.quantity,
      returnedQty: i.returned_qty,
      outstandingQty: i.outstanding_qty,
      dailyRate: Number(i.daily_rate),
      rentalStartDate: i.rental_start_date,
      scheduledReturnDate: i.scheduled_return_date,
      usageCount: i.usage_count,
      billableDays: i.billable_days,
      isDelivered: i.is_delivered,
      actualReturnDate: i.actual_return_date
    }))
    
    return {
      id: b.id,
      billNo: b.bill_no,
      quotationId: b.quotation_id,
      customerId: b.customer_id,
      customerName: b.customer_name,
      customerPhone: b.customer_phone,
      customerAddress: b.customer_address,
      siteName: b.site_name,
      rentalStartDate: b.rental_start_date,
      scheduledReturnDate: b.scheduled_return_date,
      dispatchStatus: b.dispatch_status as any,
      rentalStatus: b.rental_status as any,
      paymentStatus: b.payment_status as any,
      subtotal: Number(b.subtotal),
      discountAmount: Number(b.discount_amount),
      shippingFee: Number(b.shipping_fee),
      billAmount: Number(b.bill_amount),
      grandTotal: Number(b.grand_total),
      paidAmount: Number(b.paid_amount),
      outstandingAmount: Number(b.outstanding_amount),
      heldDepositAmount: Number(b.held_deposit_amount),
      paidDepositAmount: Number(b.paid_deposit_amount),
      depositRefunded: Number(b.deposit_refunded),
      depositApplied: Number(b.deposit_applied),
      refundDue: Number(b.refund_due),
      cancelReason: b.cancel_reason,
      remark: b.remark,
      items: bItems,
      createdAt: b.created_at,
      cancelledAt: b.cancelled_at
    } as unknown as FullBill
  })
}

export async function saveBillToSupabase(bill: FullBill): Promise<void> {
  const { error: billError } = await supabase.from('bills').upsert({
    id: bill.id,
    bill_no: bill.billNo,
    quotation_id: bill.quotationId,
    customer_id: bill.customerId,
    customer_name: bill.customerName,
    customer_phone: bill.customerPhone,
    customer_address: bill.customerAddress,
    site_name: bill.siteName,
    rental_start_date: bill.rentalStartDate,
    scheduled_return_date: bill.scheduledReturnDate,
    dispatch_status: bill.dispatchStatus,
    rental_status: bill.rentalStatus,
    payment_status: bill.paymentStatus,
    subtotal: bill.subtotal,
    discount_amount: bill.discountAmount,
    shipping_fee: bill.shippingFee,
    bill_amount: bill.billAmount,
    grand_total: bill.grandTotal,
    paid_amount: bill.paidAmount,
    outstanding_amount: bill.outstandingAmount,
    held_deposit_amount: bill.heldDepositAmount,
    paid_deposit_amount: bill.paidDepositAmount,
    deposit_refunded: bill.depositRefunded,
    deposit_applied: bill.depositApplied,
    refund_due: bill.refundDue,
    cancel_reason: bill.cancelReason,
    remark: bill.remark,
    updated_at: new Date().toISOString(),
    cancelled_at: bill.cancelledAt
  })
  
  if (billError) throw billError
  
  await supabase.from('bill_items').delete().eq('bill_id', bill.id)
  
  if (bill.items.length > 0) {
    const { error: itemsError } = await supabase.from('bill_items').insert(
      bill.items.map((item: any) => ({
        id: item.rentalBillItemId?.startsWith('cart-') ? undefined : item.rentalBillItemId,
        bill_id: bill.id,
        product_id: item.productId,
        product_name: item.productName,
        product_code: item.productCode || item.productId,
        unit: item.unit,
        rental_type: item.rentalType,
        quantity: item.quantity,
        returned_qty: item.returnedQty,
        outstanding_qty: item.outstandingQty,
        daily_rate: item.dailyRate,
        rental_start_date: item.rentalStartDate,
        scheduled_return_date: item.scheduledReturnDate,
        usage_count: item.usageCount,
        billable_days: item.billableDays,
        is_delivered: item.isDelivered,
        actual_return_date: item.actualReturnDate
      }))
    )
    if (itemsError) throw itemsError
  }
}
