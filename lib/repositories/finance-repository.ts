import { createClient } from '@/lib/supabase/client'
import { StatementTransaction } from '@/lib/finance-storage'

// STATUS: READY_AFTER_REMOTE_APPLY
// This repository is prepared for Supabase migration but currently the application relies on statement-storage.ts (local storage) to maintain runtime stability.

const supabase = createClient()

export async function fetchTransactionsFromSupabase(): Promise<StatementTransaction[]> {
  const { data, error } = await supabase.from('statement_transactions').select('*').order('created_at', { ascending: false })
  if (error) throw error
  
  return data.map((t: any) => ({
    id: t.id,
    dateTime: t.transaction_date,
    refNo: t.ref_no,
    customerName: t.customer_name,
    billId: t.bill_id,
    billNo: t.bill_no,
    category: t.category,
    description: t.description,
    channel: t.payment_channel,
    type: t.transaction_type as any, // 'INCOME' | 'EXPENSE'
    incomeAmount: t.transaction_type === 'INCOME' ? Number(t.amount) : 0,
    expenseAmount: t.transaction_type === 'EXPENSE' ? Number(t.amount) : 0,
    runningBalance: 0, // This is derived in local storage, can be ignored or mapped if available
    isDeposit: t.is_deposit,
    originalTxId: t.original_tx_id,
    correlationId: t.correlation_id,
  } as unknown as StatementTransaction))
}

export async function saveTransactionToSupabase(tx: StatementTransaction): Promise<void> {
  const { error } = await supabase.from('statement_transactions').insert({
    id: tx.id?.startsWith('cart-') ? undefined : tx.id,
    transaction_date: tx.dateTime || new Date().toISOString(),
    ref_no: tx.refNo,
    customer_name: tx.customerName,
    bill_id: tx.billId,
    bill_no: tx.billNo,
    category: tx.category,
    description: tx.description,
    payment_channel: tx.channel,
    amount: tx.type === 'INCOME' ? tx.incomeAmount : tx.expenseAmount,
    transaction_type: tx.type,
    is_deposit: tx.isDeposit || false,
    original_tx_id: tx.originalTxId,
    correlation_id: tx.correlationId
  })
  
  if (error) throw error
}
