// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { describe, it, expect } from 'vitest'

import { render, screen } from '@testing-library/react'
import { createClient } from '../lib/supabase/client'
import {
  saveBillToSupabase,
  fetchBillByIdFromSupabase,
} from '../lib/bill-storage'
import {
  fetchTransactionsForBillFromSupabase,
} from '../lib/finance-storage'
import {
  processSplitPaymentWorkflow,
} from '../lib/bill-workflow-service'
import { FullBill } from '../lib/types/rental-return'
import { PaymentReceiptPlaceholder } from '../components/documents/PaymentReceiptPlaceholder'

describe('Split Payment & Receipt Verification Suite (Live Supabase & React DOM)', () => {
  const actor = { userId: 'audit-tester', displayName: 'ผู้ตรวจสอบระบบ' }

  // ─── TEST 1 ──────────────────────────────────────────────────────────────────
  it('1. บิลค้าง 1,000 บาท รับเงินสด 400 + โอน 600: ตรวจธุรกรรมและยอดบิลใน Supabase', async () => {
    const timestamp = Date.now()
    const initialBill: FullBill = {
      id: `bill-audit-001-${timestamp}`,
      billNo: `BILL-001-${timestamp.toString(36).toUpperCase()}`,
      customerName: 'คุณสมชาย ทดสอบรับเงินแยกช่องทาง',
      customerPhone: '0812345678',
      customerAddress: '123/45 ถนนสุขุมวิท กรุงเทพฯ',
      billDate: '2026-09-19',
      rentalStartDate: '2026-09-19',
      scheduledReturnDate: '2026-09-22',
      heldDepositAmount: 0,
      paidDepositAmount: 0,
      deposits: [],
      grandTotal: 1000,
      paidAmount: 0,
      outstandingAmount: 1000,
      rentalStatus: 'RENTING',
      paymentStatus: 'UNPAID',
      items: [],
    }

    // 1. บันทึกบิลเริ่มต้นลง Supabase
    await saveBillToSupabase(initialBill)

    // 2. เรียก processSplitPaymentWorkflow รับเงินสด 400 + โอน 600 ผ่าน Supabase RPC
    const requestId = `req-split-001-${timestamp}`
    const result = await processSplitPaymentWorkflow({
      billId: initialBill.id,
      requestId,
      paymentDate: '2026-09-19T10:00:00.000Z',
      tenders: [
        { paymentMethod: 'CASH', amount: 400, cashReceived: 400, referenceNo: 'CASH-REF-01' },
        { paymentMethod: 'TRANSFER', amount: 600, referenceNo: 'TRF-REF-01' },
      ],
      actor,
    })

    // ตรวจสอบข้อมูลที่คืนกลับจาก workflow
    expect(result.bill.paidAmount).toBe(1000)
    expect(result.bill.outstandingAmount).toBe(0)
    expect(result.bill.paymentStatus).toBe('PAID')
    expect(result.receiptNo).toBeDefined()
    expect(result.receiptNo).toMatch(/^RC-\d{8}-\d+$/)
    expect(result.batchId).toBeDefined()
    expect(result.batchId).toMatch(/^PAY-\d{8}-\d+$/)

    // ตรวจสอบข้อมูลจริงในตาราง public.bills ของ Supabase
    const dbBill = await fetchBillByIdFromSupabase(initialBill.id)
    expect(dbBill).not.toBeNull()
    expect(dbBill?.paidAmount).toBe(1000)
    expect(dbBill?.outstandingAmount).toBe(0)
    expect(dbBill?.paymentStatus).toBe('PAID')

    // ตรวจสอบธุรกรรมจริงในตาราง public.statement_transactions ของ Supabase
    const dbTxs = await fetchTransactionsForBillFromSupabase(initialBill.id)
    expect(dbTxs.length).toBe(2)

    const cashTx = dbTxs.find((t) => t.channel === 'CASH')
    const trfTx = dbTxs.find((t) => t.channel === 'TRANSFER')

    expect(cashTx).toBeDefined()
    expect(cashTx?.incomeAmount).toBe(400)
    expect(cashTx?.billId).toBe(initialBill.id)
    expect(cashTx?.billNo).toBe(initialBill.billNo)

    expect(trfTx).toBeDefined()
    expect(trfTx?.incomeAmount).toBe(600)
    expect(trfTx?.billId).toBe(initialBill.id)
    expect(trfTx?.billNo).toBe(initialBill.billNo)

    // ตรวจสอบตาราง payment_batches ใน Supabase
    const supabase = createClient()
    const { data: batchData, error: batchError } = await supabase
      .from('payment_batches')
      .select('*')
      .eq('id', result.batchId)
      .single()

    expect(batchError).toBeNull()
    expect(batchData).not.toBeNull()
    expect(Number(batchData.total_amount)).toBe(1000)
    expect(Number(batchData.outstanding_after)).toBe(0)
    expect(Number(batchData.paid_amount_after)).toBe(1000)
    expect(batchData.receipt_no).toBe(result.receiptNo)
  })

  // ─── TEST 2 ──────────────────────────────────────────────────────────────────
  it('2. โหลดข้อมูลกลับใหม่: ยอดบิลและธุรกรรมทั้งสองรายการต้องยังตรงกัน', async () => {
    const timestamp = Date.now()
    const initialBill: FullBill = {
      id: `bill-audit-002-${timestamp}`,
      billNo: `BILL-002-${timestamp.toString(36).toUpperCase()}`,
      customerName: 'คุณสมศักดิ์ ทดสอบโหลดข้อมูล',
      customerPhone: '0898765432',
      billDate: '2026-09-19',
      rentalStartDate: '2026-09-19',
      scheduledReturnDate: '2026-09-22',
      heldDepositAmount: 0,
      paidDepositAmount: 0,
      deposits: [],
      grandTotal: 1000,
      paidAmount: 0,
      outstandingAmount: 1000,
      rentalStatus: 'RENTING',
      paymentStatus: 'UNPAID',
      items: [],
    }

    await saveBillToSupabase(initialBill)

    await processSplitPaymentWorkflow({
      billId: initialBill.id,
      requestId: `req-split-002-${timestamp}`,
      tenders: [
        { paymentMethod: 'CASH', amount: 400, cashReceived: 400, referenceNo: 'CASH-02' },
        { paymentMethod: 'TRANSFER', amount: 600, referenceNo: 'TRF-02' },
      ],
      actor,
    })

    // โหลดข้อมูลสดตรงจาก Supabase
    const reloadedBill = await fetchBillByIdFromSupabase(initialBill.id)
    expect(reloadedBill).toBeDefined()
    expect(reloadedBill?.paidAmount).toBe(1000)
    expect(reloadedBill?.outstandingAmount).toBe(0)
    expect(reloadedBill?.paymentStatus).toBe('PAID')

    const reloadedTxs = await fetchTransactionsForBillFromSupabase(initialBill.id)
    expect(reloadedTxs.length).toBe(2)

    const totalTxIncome = reloadedTxs.reduce((sum, tx) => sum + tx.incomeAmount, 0)
    expect(totalTxIncome).toBe(1000)
    expect(totalTxIncome).toBe(reloadedBill?.paidAmount)
  })

  // ─── TEST 3 ──────────────────────────────────────────────────────────────────
  it('3. ตรวจข้อมูลที่ส่งเข้าใบเสร็จ: เรนเดอร์จริงด้วย React Component ว่าแสดงแยกช่องทางครบหรือไม่', () => {
    // โครงสร้าง props ที่สร้างขึ้นโดย BillActionView.tsx เมื่อได้รับผลลัพธ์จาก Supabase
    const channelLabels: Record<string, string> = {
      CASH: 'เงินสด (Cash)',
      TRANSFER: 'โอนเงินผ่านธนาคาร (Bank Transfer)',
    }

    const billNo = 'BILL-AUDIT-003'
    const splitTenders = [
      { paymentMethod: 'CASH', amount: 400, referenceNo: 'CASH-SLIP-01' },
      { paymentMethod: 'TRANSFER', amount: 600, referenceNo: 'KBANK-TRF-02' },
    ]

    const receiptItems = splitTenders.map((t) => ({
      name: `รับชำระค่าบริการเช่า (${channelLabels[t.paymentMethod] || t.paymentMethod})`,
      code: billNo,
      description: t.referenceNo ? `เลขอ้างอิง: ${t.referenceNo}` : `ชำระบิล ${billNo}`,
      amount: Number(t.amount),
      paymentMethod: channelLabels[t.paymentMethod] || t.paymentMethod,
    }))

    render(
      React.createElement(PaymentReceiptPlaceholder, {
        customerName: 'คุณประสิทธิ์ สุขใจ',
        customerPhone: '0823456789',
        receiptNo: 'RC-20260919-00001',
        billNo,
        paymentDate: '2026-09-19',
        amount: 1000,
        paymentChannel: 'หลายช่องทาง (Split Payment)',
        items: receiptItems,
        outstandingRemaining: 0,
        originalBillTotal: 1000,
        note: `ชำระยอดค้างชำระ บิล ${billNo}`,
      })
    )


    // ตรวจสอบว่าใน DOM มีการแสดงผลทั้ง 2 ช่องทางแยกกันอย่างชัดเจน
    const cashElements = screen.getAllByText(/เงินสด \(Cash\)/i)
    expect(cashElements.length).toBeGreaterThanOrEqual(1)
    const trfElements = screen.getAllByText(/โอนเงินผ่านธนาคาร \(Bank Transfer\)/i)
    expect(trfElements.length).toBeGreaterThanOrEqual(1)


    // ตรวจสอบการแสดงยอดเงินแต่ละรายการในตาราง (มีสัญลักษณ์ ฿)
    expect(screen.getByText(/400\.00/)).toBeInTheDocument()
    expect(screen.getByText(/600\.00/)).toBeInTheDocument()

    // ตรวจสอบเลขอ้างอิงของแต่ละรายการ
    expect(screen.getByText(/CASH-SLIP-01/)).toBeInTheDocument()
    expect(screen.getByText(/KBANK-TRF-02/)).toBeInTheDocument()

    // ตรวจสอบยอดรวมที่ชำระ (1,000.00)
    const totalElements = screen.getAllByText(/1,000\.00/)
    expect(totalElements.length).toBeGreaterThan(0)

    // ตรวจสอบยอดค้างชำระคงเหลือเป็น 0.00 (ไม่มีปัญหาหักซ้ำซ้อน)
    const zeroElements = screen.getAllByText(/0\.00/)
    expect(zeroElements.length).toBeGreaterThan(0)

  })

  // ─── TEST 4 ──────────────────────────────────────────────────────────────────
  it('4. จำลองกดยืนยันซ้ำเร็ว ๆ (Idempotency / Replay Test) ด้วย paymentRequestId เดียวกัน', async () => {
    const timestamp = Date.now()
    const billId = `bill-audit-004-${timestamp}`
    const initialBill: FullBill = {
      id: billId,
      billNo: `BILL-004-${timestamp.toString(36).toUpperCase()}`,
      customerName: 'คุณอนันต์ ทดสอบ Idempotency',
      customerPhone: '0811112222',
      billDate: '2026-09-19',
      rentalStartDate: '2026-09-19',
      scheduledReturnDate: '2026-09-22',
      heldDepositAmount: 0,
      paidDepositAmount: 0,
      deposits: [],
      grandTotal: 1000,
      paidAmount: 0,
      outstandingAmount: 1000,
      rentalStatus: 'RENTING',
      paymentStatus: 'UNPAID',
      items: [],
    }

    await saveBillToSupabase(initialBill)

    const sameRequestId = `req-idempotent-${timestamp}`
    const tenders = [{ paymentMethod: 'CASH', amount: 400, cashReceived: 400 }]

    // ครั้งที่ 1: กดยืนยันรับเงิน 400 บาท (Partial payment)
    const result1 = await processSplitPaymentWorkflow({
      billId,
      requestId: sameRequestId,
      tenders,
      actor,
    })

    expect(result1.bill.paidAmount).toBe(400)
    expect(result1.bill.outstandingAmount).toBe(600)
    expect(result1.isIdempotentReplay).toBeFalsy()

    // ครั้งที่ 2: กดยืนยันซ้ำด้วย paymentRequestId และ payload เดิมทันที
    const result2 = await processSplitPaymentWorkflow({
      billId,
      requestId: sameRequestId,
      tenders,
      actor,
    })

    // ต้องคืนสถานะเป็น IDEMPOTENT_REPLAY และไม่หักเงินซ้ำ
    expect(result2.isIdempotentReplay).toBe(true)
    expect(result2.batchId).toBe(result1.batchId)
    expect(result2.receiptNo).toBe(result1.receiptNo)

    // ตรวจสอบใน Supabase: ยอดจ่ายต้องยังเป็น 400 ไม่ใช่ 800
    const checkBill = await fetchBillByIdFromSupabase(billId)
    expect(checkBill?.paidAmount).toBe(400)
    expect(checkBill?.outstandingAmount).toBe(600)

    // ตรวจสอบใน Supabase: รายการธุรกรรมต้องมีเพียง 1 รายการ ไม่ถูกสร้างเบิ้ล
    const checkTxs = await fetchTransactionsForBillFromSupabase(billId)
    expect(checkTxs.length).toBe(1)
  })

  // ─── TEST 5 ──────────────────────────────────────────────────────────────────
  it('5. จำลองเปลี่ยน payload ด้วย paymentRequestId เดิม: ต้องถูกปฏิเสธ (IDEMPOTENCY_CONFLICT)', async () => {
    const timestamp = Date.now()
    const billId = `bill-audit-005-${timestamp}`
    const initialBill: FullBill = {
      id: billId,
      billNo: `BILL-005-${timestamp.toString(36).toUpperCase()}`,
      customerName: 'คุณกิตติศักดิ์ ทดสอบความขัดแย้ง',
      customerPhone: '0833334444',
      billDate: '2026-09-19',
      rentalStartDate: '2026-09-19',
      scheduledReturnDate: '2026-09-22',
      heldDepositAmount: 0,
      paidDepositAmount: 0,
      deposits: [],
      grandTotal: 1000,
      paidAmount: 0,
      outstandingAmount: 1000,
      rentalStatus: 'RENTING',
      paymentStatus: 'UNPAID',
      items: [],
    }

    await saveBillToSupabase(initialBill)

    const conflictRequestId = `req-conflict-${timestamp}`

    // ครั้งที่ 1: ชำระด้วย เงินสด 400
    await processSplitPaymentWorkflow({
      billId,
      requestId: conflictRequestId,
      tenders: [{ paymentMethod: 'CASH', amount: 400, cashReceived: 400 }],
      actor,
    })

    // ครั้งที่ 2: ใช้ requestId เดิมแต่เปลี่ยน payload เป็น โอน 500
    let conflictError: any = null
    try {
      await processSplitPaymentWorkflow({
        billId,
        requestId: conflictRequestId,
        tenders: [{ paymentMethod: 'TRANSFER', amount: 500 }],
        actor,
      })
    } catch (err: any) {
      conflictError = err
    }

    expect(conflictError).not.toBeNull()
    expect(conflictError.message).toContain('IDEMPOTENCY_CONFLICT')

    // ยอดบิลและธุรกรรมใน Supabase ต้องไม่เปลี่ยนแปลง
    const currentBill = await fetchBillByIdFromSupabase(billId)
    expect(currentBill?.paidAmount).toBe(400)
    expect(currentBill?.outstandingAmount).toBe(600)
  })

  // ─── TEST 6 ──────────────────────────────────────────────────────────────────
  it('6. บันทึกใหม่ด้วย paymentRequestId ใหม่: ยอดต้องถูกคำนวณจาก outstanding ล่าสุด', async () => {
    const timestamp = Date.now()
    const billId = `bill-audit-006-${timestamp}`
    const initialBill: FullBill = {
      id: billId,
      billNo: `BILL-006-${timestamp.toString(36).toUpperCase()}`,
      customerName: 'คุณนรินทร์ ทดสอบชำระต่อเนื่อง',
      customerPhone: '0844445555',
      billDate: '2026-09-19',
      rentalStartDate: '2026-09-19',
      scheduledReturnDate: '2026-09-22',
      heldDepositAmount: 0,
      paidDepositAmount: 0,
      deposits: [],
      grandTotal: 1000,
      paidAmount: 0,
      outstandingAmount: 1000,
      rentalStatus: 'RENTING',
      paymentStatus: 'UNPAID',
      items: [],
    }

    await saveBillToSupabase(initialBill)

    // งวดที่ 1: ชำระ 400 ด้วย requestId #1
    await processSplitPaymentWorkflow({
      billId,
      requestId: `req-part1-${timestamp}`,
      tenders: [{ paymentMethod: 'CASH', amount: 400, cashReceived: 400 }],
      actor,
    })

    // งวดที่ 2: ชำระส่วนที่เหลือ 600 ด้วย requestId #2
    const resultPart2 = await processSplitPaymentWorkflow({
      billId,
      requestId: `req-part2-${timestamp}`,
      tenders: [{ paymentMethod: 'TRANSFER', amount: 600 }],
      actor,
    })

    expect(resultPart2.bill.paidAmount).toBe(1000)
    expect(resultPart2.bill.outstandingAmount).toBe(0)
    expect(resultPart2.bill.paymentStatus).toBe('PAID')

    // ตรวจสอบใน Supabase
    const finalBill = await fetchBillByIdFromSupabase(billId)
    expect(finalBill?.paidAmount).toBe(1000)
    expect(finalBill?.outstandingAmount).toBe(0)
    expect(finalBill?.paymentStatus).toBe('PAID')

    const allTxs = await fetchTransactionsForBillFromSupabase(billId)
    expect(allTxs.length).toBe(2)
    const totalPaid = allTxs.reduce((sum, tx) => sum + tx.incomeAmount, 0)
    expect(totalPaid).toBe(1000)
  })

  // ─── TEST 7 ──────────────────────────────────────────────────────────────────
  it('7. จำลอง rollback เมื่อเงื่อนไขไม่ผ่าน: ข้อมูลต้องไม่ค้างครึ่ง ๆ กลาง ๆ (Atomicity & Rollback Test)', async () => {
    const timestamp = Date.now()
    const billId = `bill-audit-007-${timestamp}`
    const initialBill: FullBill = {
      id: billId,
      billNo: `BILL-007-${timestamp.toString(36).toUpperCase()}`,
      customerName: 'คุณวิชัย ทดสอบ Rollback',
      customerPhone: '0855556666',
      billDate: '2026-09-19',
      rentalStartDate: '2026-09-19',
      scheduledReturnDate: '2026-09-22',
      heldDepositAmount: 0,
      paidDepositAmount: 0,
      deposits: [],
      grandTotal: 500,
      paidAmount: 0,
      outstandingAmount: 500,
      rentalStatus: 'RENTING',
      paymentStatus: 'UNPAID',
      items: [],
    }

    await saveBillToSupabase(initialBill)

    // พยายามชำระเกินยอดค้าง: เงินสด 300 + โอน 300 รวม 600 บาท (ยอดค้างมีแค่ 500)
    let workflowError: any = null
    try {
      await processSplitPaymentWorkflow({
        billId,
        requestId: `req-overpay-${timestamp}`,
        tenders: [
          { paymentMethod: 'CASH', amount: 300, cashReceived: 300 },
          { paymentMethod: 'TRANSFER', amount: 300 },
        ],
        actor,
      })
    } catch (err: any) {
      workflowError = err
    }

    // 1. ระบบต้องไม่อนุญาตและแจ้งข้อผิดพลาด
    expect(workflowError).not.toBeNull()
    expect(workflowError.message).toContain('PAYMENT_EXCEEDS_OUTSTANDING')

    // 2. ตรวจสอบใน Supabase: ข้อมูลบิลต้องไม่ถูกเปลี่ยนแปลง (Atomicity)
    const billAfter = await fetchBillByIdFromSupabase(billId)
    expect(billAfter?.paidAmount).toBe(0)
    expect(billAfter?.outstandingAmount).toBe(500)

    // 3. ตรวจสอบใน Supabase: ไม่มีรายการธุรกรรมของ tender ใดหลุดรอดเข้าไปแม้แต่รายการเดียว
    const txsAfter = await fetchTransactionsForBillFromSupabase(billId)
    expect(txsAfter.length).toBe(0)

    // 4. ตรวจสอบตาราง payment_batches: ต้องไม่มี batch ตกค้าง
    const supabase = createClient()
    const { data: orphanBatches } = await supabase
      .from('payment_batches')
      .select('*')
      .eq('bill_id', billId)
    expect(orphanBatches?.length || 0).toBe(0)
  })
})
