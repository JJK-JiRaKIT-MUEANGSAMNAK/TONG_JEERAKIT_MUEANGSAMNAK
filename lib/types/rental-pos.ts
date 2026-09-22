// TypeScript Definitions for Rental POS Database & Domain Models

export type RentalType = 'NORMAL' | 'DAILY' | 'SALE'
export type CustomerType = 'INDIVIDUAL' | 'CORPORATE'
export type CustomerStatus = 'ACTIVE' | 'INACTIVE'
export type AppointmentType = 'DELIVERY' | 'RETURN' | 'PAYMENT' | 'CONTRACT' | 'QUOTATION' | 'INSPECTION' | 'GENERAL'
export type AppointmentStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
export type QuotationStatus = 'DRAFT' | 'SENT' | 'WAITING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED' | 'CANCELLED'
export type RentalStatus = 'DRAFT' | 'CONFIRMED' | 'RENTING' | 'EXTENDED' | 'PARTIAL_RETURNED' | 'RETURNED' | 'CLOSED' | 'CANCELLED' | 'VOID'
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUND_PARTIAL' | 'REFUNDED'
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'QR' | 'CHEQUE' | 'OTHER'
export type DepositStatus = 'HELD' | 'PARTIALLY_REFUNDED' | 'REFUNDED'
export type TransactionType = 'INCOME' | 'EXPENSE'
export type StockMovementType = 'RENTAL_OUT' | 'SALE' | 'RETURN_NORMAL' | 'RETURN_DAMAGED' | 'RETURN_LOST' | 'ADJUSTMENT' | 'INITIAL'
export type StockAdjustmentType = 'NEW_STOCK' | 'DISPOSAL' | 'DAMAGE_TRANSFER' | 'REPAIR_RETURN' | 'LOSS_WRITE_OFF' | 'LOSS_RECOVERY' | 'COUNT_RECONCILE' | 'MAINTENANCE_IN' | 'MAINTENANCE_OUT'

export interface StockAdjustment {
  type: StockAdjustmentType
  quantity: number
  reason: string
}

export type UserRole = 'OWNER' | 'USER'

export interface Profile {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  fullName: string
  role: UserRole
  businessId?: string | null
  avatarUrl?: string | null
  emailVerified?: boolean
  createdAt: string
  updatedAt: string
}

export interface CurrentUser {
  id: string
  userId: string
  username: string
  email: string
  firstName: string
  fullName: string
  displayName: string
  role: UserRole
  businessId: string | null
  emailVerified: boolean
  avatarUrl?: string | null
}


export interface BusinessSettings {
  id: string
  businessName: string
  address: string
  taxId: string
  branchNo: string
  phone: string
  email: string
  lineId?: string
  authorizedPerson?: string
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  promptPayValue?: string
  logoUrl?: string
  logoDataUrl?: string
  bankQrDataUrl?: string
  promptPayId?: string
  accountName?: string
  inclusiveDaysCounting: boolean
  usageCountUnitName: string
  dueAlertDaysNotice: number
  updatedAt: string
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export interface Unit {
  id: string
  name: string
  isActive: boolean
}

export interface StockBalance {
  id: string
  businessId: string
  productId: string
  availableQty: number
  rentedQty: number
  damagedQty: number
  lostQty: number
  reservedQty: number
  maintenanceQty: number
  createdAt?: string
  updatedAt?: string
}

export interface Permission {
  id: string
  code: string
  name: string
  description?: string | null
  module: string
  createdAt?: string
  updatedAt?: string
}

export interface BusinessMemberPermission {
  id: string
  businessMemberId: string
  permissionId: string
  grantedBy?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Product {
  id: string
  businessId?: string
  code: string
  name: string
  category: string
  categoryId?: string
  unit: string
  unitId?: string
  rentalType: RentalType
  rentalTypeId?: string
  normalPrice: number
  dailyPrice: number
  rentPrice?: number | null
  salePrice?: number | null
  costPrice?: number
  replacementPrice?: number
  defaultDamageFee: number
  defaultLossFee: number
  defaultLostFee?: number
  defaultRepairFee?: number
  defaultReplacementFee?: number
  totalQuantity: number
  availableQuantity: number
  rentedQuantity: number
  damagedQuantity: number
  lostQuantity: number
  reservedQuantity?: number
  maintenanceQuantity?: number
  inRepairQuantity?: number
  minimumStock: number
  status: 'ACTIVE' | 'INACTIVE'
  description?: string
  totalRentalCount?: number
  createdAt?: string
  categoryRuleId?: string
  calculationType?: string
  calculationLabel?: string
  // Compatibility aliases
  product_code?: string
  product_name?: string
  unit_name?: string
  rental_type?: RentalType
  normal_price?: number
  daily_price?: number
  sale_price?: number
  available_qty?: number
  minimum_quantity?: number
  lastRentedCustomer?: {
    customerName: string
    phone?: string
    billNo: string
    date: string
    quantity: number
  }
  siteLocations?: { siteName: string; customerName: string; billNo: string; quantity: number; returnDate: string; phone?: string; startDate?: string }[]
  rentalHistory?: any[]
  isAccessory?: boolean
  isChargeable?: boolean
  requiresReturn?: boolean
  defaultQtyPerSet?: number
}

export interface Customer {
  id: string
  customerCode?: string
  customerName: string
  customerType?: CustomerType
  companyName?: string
  taxId?: string
  phone: string
  status?: string
  phone2?: string
  email?: string
  lineId?: string
  address?: string
  houseNo?: string
  moo?: string
  soi?: string
  road?: string
  subDistrict?: string
  district?: string
  province?: string
  postalCode?: string
  idCardNumber?: string
  idCardImageUrl?: string
  idCardExpiry?: string
  isSuspended?: boolean
  note?: string
  createdAt?: string
}

export interface Appointment {
  id: string
  businessId?: string
  customerId?: string
  customerName: string
  phone?: string
  title: string
  type: AppointmentType
  appointmentTypeId?: string
  date: string
  startTime: string
  endTime: string
  location?: string
  contactPerson?: string
  billId?: string
  billNo?: string
  quotationId?: string
  quotationNo?: string
  details?: string
  status: AppointmentStatus
  createdAt?: string
}

export type ReservationStatus = 'ACTIVE' | 'CONVERTED' | 'CANCELLED' | 'EXPIRED' | 'RELEASED'
export type ReservationFulfillmentStatus = 'PENDING' | 'PARTIAL' | 'FULFILLED'

export interface ReservationItem {
  id?: string
  reservationId?: string
  productId: string
  productName: string
  quantity: number
  requestedQuantity?: number
  reservedQuantity?: number
  deliveredQuantity?: number
  shortageQuantity?: number
  unitPrice?: number
  rentalType?: RentalType
  dailyStartDate?: string
  dailyEndDate?: string
}

export interface Reservation {
  id: string
  businessId?: string
  customerId: string
  customerName?: string
  quotationId: string
  quotationNo?: string
  billId?: string
  reservationNo: string
  startDate: string
  endDate: string
  status: ReservationStatus
  fulfillmentStatus?: ReservationFulfillmentStatus
  requestedQuantity?: number
  reservedQuantity?: number
  deliveredQuantity?: number
  shortageQuantity?: number
  note?: string
  items: ReservationItem[]
  createdAt?: string
  updatedAt?: string
}

export interface QuotationItem {
  id?: string
  productId: string
  productName: string
  rentalType: RentalType
  quantity: number
  unitName?: string
  unitPrice: number
  usageCountOrDays: number
  lineTotal: number
  dailyStartDate?: string
  dailyEndDate?: string
  isAccessory?: boolean
  isChargeable?: boolean
  requiresReturn?: boolean
}

export interface Quotation {
  id: string
  quotationNo: string
  quotationDate: string
  expiryDate: string
  customerId: string
  customerName: string
  phone?: string
  customerAddress?: string
  customerTaxId?: string
  siteName?: string
  rentalStartDate: string
  rentalEndDate: string
  items: QuotationItem[]
  subtotal: number
  discountAmount: number
  shippingFee: number
  depositAmount: number
  taxAmount: number
  grandTotal: number
  status: QuotationStatus
  remark?: string
  cancelReason?: string
  cancelledAt?: string
  acceptedAt?: string
  reservationId?: string
  convertedBillId?: string
}

export interface RentalBillItem {
  id?: string
  productId: string
  productName: string
  rentalType: RentalType
  quantity: number
  unitName?: string
  unitPrice: number
  usageCount?: number
  billableDays?: number
  dailyStartDate?: string
  dailyEndDate?: string
  lineTotal: number
  returnedQuantity: number
  damagedQuantity: number
  lostQuantity: number
  outstandingQuantity: number
  isAccessory?: boolean
  isChargeable?: boolean
  requiresReturn?: boolean
}

export interface RentalBill {
  id: string
  customerId: string
  customerName: string
  billNo: string
  billDate: string
  rentalStartDate: string
  rentalEndDate: string
  items: RentalBillItem[]
  subtotal: number
  discountAmount: number
  shippingFee: number
  depositAmount: number
  depositRequired?: number
  depositReceived?: number
  depositOutstanding?: number
  depositHeld?: number
  depositApplied?: number
  depositRefunded?: number
  taxAmount: number
  billAmount?: number
  grandTotal: number
  paidAmount: number
  outstandingAmount: number
  rentalStatus: RentalStatus
  paymentStatus: PaymentStatus
  remark?: string
  siteName?: string
  siteAddress?: string
  shippingAddress?: string
  customerAddress?: string
  customerPhone?: string
  customerTaxId?: string
  documentType?: string
  documentTitle?: string
  quotationId?: string
  reservationId?: string
  originalBillId?: string
  parentBillId?: string
  closedAt?: string
  cancelledAt?: string
  cancelReason?: string
  dispatchStatus?: 'PENDING' | 'DISPATCHED'
  refundDueAmount?: number
  revisions?: BillRevisionRecord[]
}

export interface BillRevisionRecord {
  id: string
  revisionNo: number
  timestamp: string
  userId: string
  displayName: string
  reason: string
  mode: 'CORRECTION' | 'EXTENSION' | string
  before: {
    grandTotal: number
    subtotal?: number
    paidAmount?: number
    outstandingAmount?: number
    items: any[]
  }
  after: {
    grandTotal: number
    subtotal?: number
    paidAmount?: number
    outstandingAmount?: number
    items: any[]
  }
  stockDeltas?: Array<{
    productId: string
    productName: string
    quantityDelta: number
  }>
  financialDelta?: {
    grandTotalDelta: number
    outstandingDelta: number
    refundDueDelta?: number
  }
  correlationId: string
}

export interface FinancialTransaction {
  id: string
  dateTime: string
  refNo: string
  type: TransactionType
  category: string
  description: string
  customerName?: string
  incomeAmount: number
  expenseAmount: number
  runningBalance: number
  channel: string
}

export interface CustomerPaymentRecord {
  id: string
  paymentNo: string
  receiptNo?: string | null
  paymentDate: string
  paymentMethod: PaymentMethod | string
  amount: number
  cashReceived?: number | null
  changeAmount?: number
  status: string
  referenceNo?: string | null
  note?: string | null
  createdAt?: string
  billNo?: string
  billId?: string
  billDate?: string
}

export interface CustomerOutstandingItemRecord {
  id: string
  billId: string
  billNo: string
  billDate: string
  productId: string
  productName: string
  rentalType: RentalType | string
  totalQuantity: number
  returnedQuantity: number
  damagedQuantity: number
  lostQuantity: number
  outstandingQuantity: number
  unitName: string
  unitPrice: number
  rentalStartDate: string
  scheduledReturnDate: string
  overdueDays: number
  isOverdue: boolean
}

export interface CustomerReturnStats {
  totalReturnedItemsWithDates: number
  onTimeReturnedItems: number
  onTimeRatePercent: number | null
}
