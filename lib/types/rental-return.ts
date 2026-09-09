export interface ReturnInspectionItem {
  rentalBillItemId: string
  productId: string
  productCode?: string
  productName: string
  totalQtyInBill: number
  outstandingQty: number // quantity left to return
  returnQty: number      // total quantity selected to return in this session
  normalQty: number      // returned and ready to rent
  damagedQty: number     // returned and awaiting repair
  lostQty: number        // confirmed lost / removed from stock
  dailyRate: number
  repairFeePerUnit: number
  replacementFeePerUnit: number
  totalDamageFee: number
  note?: string

  // Item-level dates & selection
  selected?: boolean
  rentalStartDate?: string
  scheduledReturnDate?: string
  actualReturnDate?: string
  rentalType?: 'NORMAL' | 'DAILY'
  usageCount?: number
}

export interface ReturnCalculationResult {
  actualRentalDays: number
  scheduledRentalDays: number
  lateDays: number
  isEarlyReturn: boolean
  isOverdue: boolean
  
  // Financial breakdown
  persistedGrandTotal: number
  persistedPaidAmount: number
  persistedOutstandingAmount: number
  
  actualRentalFee: number
  rentalFeeDelta: number
  lateFeeTotal: number
  totalDamageFee: number // repair + replacement
  repairFeeTotal: number
  replacementFeeTotal: number
  
  returnChargeDelta: number
  grandTotalCharge: number // persistedGrandTotal + returnChargeDelta
  heldDepositAmount: number
  
  netAmount: number // amountDueAfterReturn = max(0, grandTotalCharge - persistedPaidAmount - (deductFromDeposit ? heldDepositAmount : 0))
  // If netAmount > 0: customer pays extra
  // If netAmount < 0: refund to customer
  // If netAmount === 0: settled evenly
  
  deductFromDeposit: boolean
  actualCollectedAmount: number // amount customer actually paid during return
  netRefundAmount: number       // amount actually refunded to customer
  remainingDebtAmount: number   // if customer paid less than netAmount (>0)
}

export interface AuditLogRecord {
  id: string
  billId: string
  billNo: string
  timestamp: string
  user: string
  action: string
  details: string
  previousState?: string
  newState?: string
}

export type GeneratedDocType = 
  | 'RECEIPT'            // ใบเสร็จรับเงิน
  | 'DAMAGE_RECEIPT'     // ใบเสร็จรับเงินค่าชำรุด/สูญหาย
  | 'CREDIT_NOTE'        // ใบลดค่าเช่า
  | 'PARTIAL_RECEIPT'    // ใบรับบางส่วน
  | 'DEBT_NOTE'          // ใบค้างชำระ
  | 'DEPOSIT_REFUND'     // ใบคืนเงินมัดจำ
  | 'DAMAGE_INVOICE'     // ใบแจ้งค่าเสียหาย
  | 'REPAIR_ORDER'       // ใบซ่อมสินค้า
  | 'CONTINUATION_BILL'  // ใบต่อบิล (กรณีคืนบางส่วน)
  | 'STOCK_REPORT'       // รายงานอัปเดตสต็อก
  | 'RETURN_RECEIPT'     // ใบรับคืนสินค้า

export interface GeneratedDocument {
  id: string
  docType: GeneratedDocType
  docNo: string
  title: string
  issuedDate: string
  billNo: string
  customerName: string
  amount?: number
  description: string
}

export interface FullBillItem {
  rentalBillItemId: string
  productId: string
  productCode: string
  productName: string
  quantity: number
  returnedQty: number
  outstandingQty: number
  dailyRate: number
  unit: string
  defaultRepairFee: number
  defaultReplacementFee: number
  requiresReturn: boolean
  rentalStartDate: string
  scheduledReturnDate: string
  actualReturnDate?: string
  rentalType?: 'NORMAL' | 'DAILY' | 'SALE'
  usageCount?: number
  lineTotal?: number
  status: 'RENTING' | 'RETURNED' | 'PARTIAL_RETURNED' | 'IN_REPAIR' | 'LOST'
}

export interface FullBillDeposit {
  id: string
  amount: number
  refundAmount: number
  appliedAmount: number
  heldAmount: number
  status: string
  receivedDate: string
  paymentMethod: string | null
  referenceNo: string | null
}

export interface FullBill {
  id: string
  customerId?: string
  billNo: string
  billDate: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  siteName?: string
  rentalStartDate: string
  scheduledReturnDate: string
  actualReturnDate?: string
  heldDepositAmount: number
  paidDepositAmount: number
  depositRequired?: number
  depositReceived?: number
  depositOutstanding?: number
  depositHeld?: number
  depositApplied?: number
  depositRefunded?: number
  deposits: FullBillDeposit[]
  subtotal?: number
  discountAmount?: number
  shippingFee?: number
  taxAmount?: number
  grandTotal: number
  paidAmount: number
  outstandingAmount: number
  rentalStatus: 'RENTING' | 'PARTIAL_RETURNED' | 'RETURNED' | 'CLOSED' | 'CANCELLED'
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID'
  items: FullBillItem[]
  auditLogs?: AuditLogRecord[]
  generatedDocs?: GeneratedDocument[]
  quotationId?: string
  reservationId?: string
  closedAt?: string
  cancelledAt?: string
  cancelReason?: string
  remark?: string
}

