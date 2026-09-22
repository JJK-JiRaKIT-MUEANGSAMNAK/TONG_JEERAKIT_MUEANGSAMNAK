/**
 * Centralized Calculation Service
 *
 * Single source of truth for financial & bill arithmetic across:
 * - POS Cart & Checkout
 * - Quotations
 * - Bill Revisions & Confirmations
 * - Document Renderers
 *
 * Rules:
 * - VAT is calculated AFTER discount.
 * - Deposit is strictly separated from Revenue.
 * - Money precision default 2 decimals, using rounding rules from Settings.
 * - Discount cannot exceed maximum discount ceiling from Settings.
 * - Late returns track dates and overdue days, but NEVER charge automatic penalty fees.
 */

import {
  loadSystemSettings,
  SystemConfig,
  RoundingMode,
  VatCalculationMode,
} from '@/lib/settings-storage'
import { RentalType } from '@/lib/types/rental-pos'

export interface RoundMoneyOptions {
  precision?: number
  mode?: RoundingMode | 'ROUND' | 'CEIL' | 'FLOOR'
}

/**
 * Rounds a financial amount based on specified precision and rounding rule.
 * Defaults to values configured in system settings.
 */
export function roundMoney(amount: number, options?: RoundMoneyOptions): number {
  if (isNaN(amount) || !isFinite(amount)) return 0
  const settings = loadSystemSettings()
  const precision = options?.precision !== undefined ? options.precision : (settings.financePayment.moneyPrecision ?? 2)
  const mode = options?.mode || settings.financePayment.roundingMode || 'ROUND_HALF_UP'
  const factor = Math.pow(10, precision)

  if (mode === 'ROUND_UP' || (mode as any) === 'CEIL') {
    return Math.ceil(amount * factor) / factor
  }
  if (mode === 'ROUND_DOWN' || (mode as any) === 'FLOOR') {
    return Math.floor(amount * factor) / factor
  }
  return Math.round(amount * factor) / factor
}

export interface LineItemInput {
  quantity: number
  unitPrice: number
  rentalType?: RentalType | string
  usageCount?: number
  billableDays?: number
  dailyStartDate?: string | Date | null
  dailyEndDate?: string | Date | null
}

/**
 * Calculates line total for a single item.
 */
export function calculateLineTotal(item: LineItemInput, settings?: SystemConfig): number {
  const qty = Number(item.quantity) || 0
  const price = Number(item.unitPrice) || 0
  const isSale = item.rentalType === 'SALE'

  let multiplier = 1
  if (!isSale) {
    if (item.rentalType === 'DAILY' && item.dailyStartDate && item.dailyEndDate) {
      const start = new Date(item.dailyStartDate).getTime()
      const end = new Date(item.dailyEndDate).getTime()
      if (!isNaN(start) && !isNaN(end)) {
        const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)))
        multiplier = days
      } else {
        multiplier = Math.max(1, item.billableDays || item.usageCount || 1)
      }
    } else {
      multiplier = Math.max(1, item.billableDays || item.usageCount || 1)
    }
  }

  const raw = qty * price * multiplier
  const precision = settings?.financePayment.moneyPrecision ?? 2
  const mode = settings?.financePayment.roundingMode ?? 'ROUND_HALF_UP'
  return roundMoney(raw, { precision, mode })
}

export interface CalculateTotalsOptions {
  items: Array<{ lineTotal?: number; quantity?: number; unitPrice?: number; rentalType?: any; usageCount?: number; billableDays?: number }>
  discount?: number
  discountAmount?: number
  discountPercent?: number
  shippingFee?: number
  depositAmount?: number
  taxRate?: number // e.g. 0.07 for 7%, or pass undefined to read default from Settings
  enableVat?: boolean
  includeShippingInTax?: boolean // defaults to true matching Thai standard
  settings?: SystemConfig
}

export interface BillCalculationResult {
  subtotal: number
  subtotalWithoutTax?: number
  discountAmount: number
  discountPercent: number
  isDiscountExceeded: boolean
  maxDiscountAllowed: number
  netSubtotal: number
  vatRate: number
  vatAmount: number
  shippingFee: number
  revenueTotal: number
  billAmount: number
  depositAmount: number
  grandTotal: number
  totalPayableWithDeposit: number
  precision: number
  roundingMode: RoundingMode
}

/**
 * Calculates complete bill totals according to centralized business rules.
 */
export function calculateBillTotals(options: CalculateTotalsOptions): BillCalculationResult {
  const cfg = options.settings || loadSystemSettings()
  const precision = cfg.financePayment.moneyPrecision ?? 2
  const roundingMode = cfg.financePayment.roundingMode ?? 'ROUND_HALF_UP'
  const maxDiscountPercent = cfg.financePayment.maximumDiscountPercent ?? 50

  // 1. Subtotal
  let rawSubtotal = 0
  for (const it of options.items) {
    if (typeof it.lineTotal === 'number') {
      rawSubtotal += it.lineTotal
    } else {
      rawSubtotal += calculateLineTotal(it as LineItemInput, cfg)
    }
  }
  const subtotal = roundMoney(rawSubtotal, { precision, mode: roundingMode })

  // 2. Discount & Ceiling Validation
  const maxDiscountAllowed = roundMoney((subtotal * maxDiscountPercent) / 100, { precision, mode: roundingMode })
  let requestedDiscount = 0

  const directDiscount = options.discountAmount !== undefined ? options.discountAmount : options.discount
  if (options.discountPercent !== undefined && options.discountPercent > 0) {
    requestedDiscount = roundMoney((subtotal * options.discountPercent) / 100, { precision, mode: roundingMode })
  } else if (directDiscount !== undefined && directDiscount > 0) {
    requestedDiscount = roundMoney(Number(directDiscount), { precision, mode: roundingMode })
  }

  const isDiscountExceeded = requestedDiscount > maxDiscountAllowed + 0.0001
  // Cap at max allowed discount and subtotal
  const cappedDiscount = Math.min(requestedDiscount, maxDiscountAllowed)
  const discountAmount = roundMoney(Math.min(cappedDiscount, subtotal), { precision, mode: roundingMode })
  const effectiveDiscountPercent = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0

  // 3. Net Subtotal (after discount)
  const netSubtotal = roundMoney(Math.max(0, subtotal - discountAmount), { precision, mode: roundingMode })

  // 4. Shipping Fee
  const shippingFee = roundMoney(Math.max(0, Number(options.shippingFee) || 0), { precision, mode: roundingMode })

  // 5. VAT (calculated AFTER discount)
  let vatRate = 0
  if (options.taxRate !== undefined) {
    vatRate = options.taxRate
  } else if (options.enableVat !== false && cfg.financePayment.defaultVatPercent > 0) {
    vatRate = cfg.financePayment.defaultVatPercent / 100
  }

  const includeShippingInTax = options.includeShippingInTax !== false
  const taxBase = includeShippingInTax ? netSubtotal + shippingFee : netSubtotal

  let rawVat = 0
  if (vatRate > 0) {
    if (cfg.financePayment.vatCalculationMode === 'INCLUSIVE') {
      // Inclusive: taxBase * (vatRate / (1 + vatRate))
      rawVat = taxBase * (vatRate / (1 + vatRate))
    } else {
      // Exclusive: taxBase * vatRate
      rawVat = taxBase * vatRate
    }
  }
  const vatAmount = roundMoney(rawVat, { precision, mode: roundingMode })

  // 6. Revenue Total (Rental + Sales + Shipping + Tax, strictly excluding held deposit)
  let revenueTotal = 0
  if (cfg.financePayment.vatCalculationMode === 'INCLUSIVE') {
    revenueTotal = roundMoney(netSubtotal + shippingFee, { precision, mode: roundingMode })
  } else {
    revenueTotal = roundMoney(netSubtotal + shippingFee + vatAmount, { precision, mode: roundingMode })
  }

  const subtotalWithoutTax =
    cfg.financePayment.vatCalculationMode === 'INCLUSIVE'
      ? roundMoney(netSubtotal - vatAmount, { precision, mode: roundingMode })
      : netSubtotal

  // 7. Deposit (Held separately from Revenue)
  let depositAmount = roundMoney(Math.max(0, Number(options.depositAmount) || 0), { precision, mode: roundingMode })
  if (depositAmount === 0 && cfg.financePayment.defaultDepositPercent > 0 && subtotal > 0) {
    depositAmount = roundMoney((subtotal * cfg.financePayment.defaultDepositPercent) / 100, { precision, mode: roundingMode })
  }

  // 8. Bill Amount & Grand Total (Strictly excludes Security Deposit per MASTER v2.3.0)
  const billAmount = revenueTotal
  const grandTotal = billAmount
  const totalPayableWithDeposit = roundMoney(billAmount + depositAmount, { precision, mode: roundingMode })

  return {
    subtotal,
    subtotalWithoutTax,
    discountAmount,
    discountPercent: effectiveDiscountPercent,
    isDiscountExceeded,
    maxDiscountAllowed,
    netSubtotal,
    vatRate,
    vatAmount,
    shippingFee,
    revenueTotal,
    billAmount,
    depositAmount,
    grandTotal,
    totalPayableWithDeposit,
    precision,
    roundingMode,
  }
}

export interface FinancialCoreParams {
  billAmount: number
  netPaid: number
  revenueRecognized?: number
  securityDeposit?: {
    required?: number
    received?: number
    refunded?: number
    applied?: number
  }
}

export interface FinancialCoreResult {
  billAmount: number
  netPaid: number
  billOutstanding: number
  revenueRecognized: number
  earnedOutstanding: number
  advanceDeferred: number
  overpayment: number
  refundDue: number
  securityDeposit: {
    required: number
    received: number
    refunded: number
    applied: number
    held: number
  }
}

/**
 * Calculates unified financial metrics strictly adhering to MASTER v2.3.0 Section 9:
 * - Bill Outstanding = max(Bill Amount - Net Paid, 0)
 * - Earned Outstanding = max(Revenue Recognized - Net Paid, 0)
 * - Advance / Deferred = min(max(Net Paid - Revenue Recognized, 0), max(Bill Amount - Revenue Recognized, 0))
 * - Overpayment = max(Net Paid - Bill Amount, 0)
 * - Refund Due = Overpayment (or when revised bill is lower than net paid)
 * - Security Deposit: strictly separated from Net Paid and Revenue Recognized
 */
export function calculateFinancialCore(params: FinancialCoreParams): FinancialCoreResult {
  const billAmount = Math.max(0, Number(params.billAmount) || 0)
  const netPaid = Math.max(0, Number(params.netPaid) || 0)
  const revenueRecognized = Math.max(0, Number(params.revenueRecognized) || 0)

  const billOutstanding = Math.max(0, billAmount - netPaid)
  const earnedOutstanding = Math.max(0, revenueRecognized - netPaid)
  const unearnedService = Math.max(0, billAmount - revenueRecognized)
  const advanceDeferred = Math.min(Math.max(0, netPaid - revenueRecognized), unearnedService)
  const overpayment = Math.max(0, netPaid - billAmount)
  const refundDue = overpayment

  const dep = params.securityDeposit || {}
  const depRequired = Math.max(0, Number(dep.required) || 0)
  const depReceived = Math.max(0, Number(dep.received) || 0)
  const depRefunded = Math.max(0, Number(dep.refunded) || 0)
  const depApplied = Math.max(0, Number(dep.applied) || 0)
  const depHeld = Math.max(0, depReceived - depRefunded - depApplied)

  return {
    billAmount,
    netPaid,
    billOutstanding,
    revenueRecognized,
    earnedOutstanding,
    advanceDeferred,
    overpayment,
    refundDue,
    securityDeposit: {
      required: depRequired,
      received: depReceived,
      refunded: depRefunded,
      applied: depApplied,
      held: depHeld,
    },
  }
}

export interface CalculateRevenueRecognizedOptions {
  dispatchStatus?: 'PENDING' | 'DISPATCHED' | string
  items: Array<{
    rentalType?: RentalType | string
    quantity: number
    unitPrice: number
    lineTotal?: number
    dailyStartDate?: string | Date | null
    dailyEndDate?: string | Date | null
    billableDays?: number
    usageCount?: number
    actualReturnDate?: string | Date | null
    isDelivered?: boolean
  }>
  referenceDate?: string | Date // defaults to today
}

/**
 * Calculates Revenue Recognized according to MASTER v2.3.0 Section 9.6:
 * - Before Actual Handover / Dispatch: Revenue Recognized = 0 ALWAYS!
 * - When Dispatched / Delivered:
 *   - Sale items: Recognized in full once delivered
 *   - Daily rental: price * qty * actual elapsed service days
 *   - Round rental: price * qty * actual rounds
 */
export function calculateRevenueRecognized(options: CalculateRevenueRecognizedOptions): number {
  if (options.dispatchStatus !== 'DISPATCHED') {
    return 0
  }

  const now = options.referenceDate ? new Date(options.referenceDate) : new Date()
  let recognized = 0

  for (const item of options.items) {
    const qty = Number(item.quantity) || 0
    const price = Number(item.unitPrice) || 0
    if (item.rentalType === 'SALE') {
      recognized += qty * price
      continue
    }

    if (item.rentalType === 'DAILY') {
      const start = item.dailyStartDate ? new Date(item.dailyStartDate) : now
      const effectiveEnd = item.actualReturnDate ? new Date(item.actualReturnDate) : now
      const schedEnd = item.dailyEndDate ? new Date(item.dailyEndDate) : effectiveEnd
      const cutOff = new Date(Math.min(effectiveEnd.getTime(), schedEnd.getTime(), now.getTime()))

      let days = 0
      if (!isNaN(start.getTime()) && !isNaN(cutOff.getTime())) {
        const diffMs = cutOff.getTime() - start.getTime()
        days = Math.max(1, Math.min(item.billableDays || 9999, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1))
      } else {
        days = Math.max(1, item.billableDays || 1)
      }
      recognized += qty * price * days
    } else {
      // Round-based
      const rounds = Math.max(1, item.usageCount || 1)
      recognized += qty * price * rounds
    }
  }

  return roundMoney(recognized)
}

/**
 * Validates whether a requested discount exceeds the maximum allowed percentage.
 * Throws a descriptive error if exceeded.
 */
export function validateDiscountCeiling(subtotal: number, discountAmount: number, settings?: SystemConfig): void {
  const cfg = settings || loadSystemSettings()
  const maxPercent = cfg.financePayment.maximumDiscountPercent ?? 50
  const maxAllowed = (subtotal * maxPercent) / 100
  if (discountAmount > maxAllowed + 0.01) {
    throw new Error(
      `ส่วนลด ${discountAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท เกินเพดานส่วนลดสูงสุดที่อนุญาต (${maxPercent}% = ${maxAllowed.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท)`
    )
  }
}

export interface LateReturnInspectionInput {
  scheduledReturnDate: string | Date
  actualReturnDate: string | Date
}

export interface LateReturnInspectionResult {
  scheduledDate: string
  actualDate: string
  isLate: boolean
  lateDays: number
  penaltyAmount: number // STRICT INVARIANT: Must always be 0 (no automatic penalty)
  isOverdue: boolean
  overdueDays: number
  calculatedLateFee: number
}

/**
 * Evaluates late returns. Tracks overdue dates and day counts,
 * but STRICTLY forbids automatic penalty charges.
 */
export function evaluateLateReturn(
  scheduledOrBillOrInput: LateReturnInspectionInput | { scheduledReturnDate?: string | Date; [key: string]: any } | string | Date,
  actualReturnDate?: string | Date
): LateReturnInspectionResult {
  let scheduledRaw: string | Date | undefined
  let actualRaw: string | Date | undefined

  if (typeof scheduledOrBillOrInput === 'object' && scheduledOrBillOrInput !== null && 'scheduledReturnDate' in scheduledOrBillOrInput) {
    scheduledRaw = scheduledOrBillOrInput.scheduledReturnDate
    actualRaw = actualReturnDate || (scheduledOrBillOrInput as any).actualReturnDate || new Date()
  } else if (actualReturnDate !== undefined) {
    scheduledRaw = scheduledOrBillOrInput as string | Date
    actualRaw = actualReturnDate
  } else {
    scheduledRaw = new Date()
    actualRaw = new Date()
  }

  const scheduled = new Date(scheduledRaw || new Date())
  const actual = new Date(actualRaw || new Date())
  scheduled.setHours(0, 0, 0, 0)
  actual.setHours(0, 0, 0, 0)

  const diffMs = actual.getTime() - scheduled.getTime()
  const lateDays = diffMs > 0 ? Math.round(diffMs / (1000 * 60 * 60 * 24)) : 0

  return {
    scheduledDate: isNaN(scheduled.getTime()) ? '' : scheduled.toISOString().slice(0, 10),
    actualDate: isNaN(actual.getTime()) ? '' : actual.toISOString().slice(0, 10),
    isLate: lateDays > 0,
    lateDays,
    penaltyAmount: 0, // Automatic penalties strictly prohibited
    isOverdue: lateDays > 0,
    overdueDays: lateDays,
    calculatedLateFee: 0,
  }
}
