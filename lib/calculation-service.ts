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
import {
  toSatang,
  toBaht,
  addSatang,
  subtractSatang,
  multiplySatang,
  calculateLineTotalSatang,
  calculateVatSatang,
  calculateDiscountSatang,
  calculateDepositSettlement,
} from '@/lib/money'

export interface RoundMoneyOptions {
  precision?: number
  mode?: RoundingMode | 'ROUND' | 'CEIL' | 'FLOOR'
}

/**
 * Rounds a financial amount based on specified precision and rounding rule.
 * Defaults to values configured in system settings.
 * Uses integer Satang for standard 2-decimal money calculations.
 */
export function roundMoney(amount: number, options?: RoundMoneyOptions): number {
  if (isNaN(amount) || !isFinite(amount)) return 0
  const settings = loadSystemSettings()
  const precision = options?.precision !== undefined ? options.precision : (settings.financePayment.moneyPrecision ?? 2)
  const mode = options?.mode || settings.financePayment.roundingMode || 'ROUND_HALF_UP'

  if (precision === 2 && (mode === 'ROUND_HALF_UP' || mode === 'ROUND')) {
    return toBaht(toSatang(amount))
  }

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
  const isSale = item.rentalType === 'SALE'

  let multiplier = 1
  if (!isSale) {
    if (item.rentalType === 'DAILY' && item.dailyStartDate && item.dailyEndDate) {
      if (item.billableDays !== undefined) {
        multiplier = Math.max(1, item.billableDays)
      } else {
        const start = new Date(item.dailyStartDate).getTime()
        const end = new Date(item.dailyEndDate).getTime()
        if (!isNaN(start) && !isNaN(end)) {
          const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)))
          multiplier = days
        } else {
          multiplier = Math.max(1, item.usageCount || 1)
        }
      }
    } else {
      multiplier = Math.max(1, item.billableDays || item.usageCount || 1)
    }
  }

  const priceSatang = toSatang(item.unitPrice)
  const lineSatang = calculateLineTotalSatang(priceSatang, qty, multiplier)
  return toBaht(lineSatang)
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

  // 1. Subtotal in Satang
  let rawSubtotalSatang = 0
  for (const it of options.items) {
    if (typeof it.lineTotal === 'number') {
      rawSubtotalSatang = addSatang(rawSubtotalSatang, toSatang(it.lineTotal))
    } else {
      rawSubtotalSatang = addSatang(rawSubtotalSatang, toSatang(calculateLineTotal(it as LineItemInput, cfg)))
    }
  }
  const subtotal = toBaht(rawSubtotalSatang)

  // 2. Discount & Ceiling Validation in Satang
  const discountCalc = calculateDiscountSatang(rawSubtotalSatang, {
    discountPercent: options.discountPercent,
    discountAmountSatang: options.discountAmount !== undefined ? toSatang(options.discountAmount) : (options.discount !== undefined ? toSatang(options.discount) : undefined),
    maxDiscountPercent,
  })

  const discountAmount = toBaht(discountCalc.discountSatang)
  const maxDiscountAllowed = toBaht(discountCalc.maxAllowedSatang)
  const isDiscountExceeded = discountCalc.isDiscountExceeded
  const effectiveDiscountPercent = discountCalc.effectivePercent

  // 3. Net Subtotal (after discount) in Satang
  const netSubtotalSatang = Math.max(0, subtractSatang(rawSubtotalSatang, discountCalc.discountSatang))
  const netSubtotal = toBaht(netSubtotalSatang)

  // 4. Shipping Fee in Satang
  const shippingFeeSatang = Math.max(0, toSatang(options.shippingFee))
  const shippingFee = toBaht(shippingFeeSatang)

  // 5. VAT in Satang
  let vatRate = 0
  if (cfg.financePayment.vatEnabled && cfg.financePayment.defaultVatPercent > 0) {
    vatRate = cfg.financePayment.defaultVatPercent / 100
  }

  const includeShippingInTax = options.includeShippingInTax !== false
  const taxBaseSatang = includeShippingInTax
    ? addSatang(netSubtotalSatang, shippingFeeSatang)
    : netSubtotalSatang

  const isVatInclusive = cfg.financePayment.vatCalculationMode === 'INCLUSIVE'
  const vatAmountSatang = calculateVatSatang(taxBaseSatang, vatRate, isVatInclusive)
  const vatAmount = toBaht(vatAmountSatang)

  // 6. Revenue Total in Satang
  let revenueTotalSatang = 0
  if (isVatInclusive) {
    revenueTotalSatang = addSatang(netSubtotalSatang, shippingFeeSatang)
  } else {
    revenueTotalSatang = addSatang(netSubtotalSatang, shippingFeeSatang, vatAmountSatang)
  }
  const revenueTotal = toBaht(revenueTotalSatang)

  const subtotalWithoutTax = isVatInclusive
    ? toBaht(Math.max(0, subtractSatang(netSubtotalSatang, vatAmountSatang)))
    : netSubtotal

  // 7. Deposit in Satang (Held strictly separately from Revenue)
  let depositAmountSatang = Math.max(0, toSatang(options.depositAmount))
  if (depositAmountSatang === 0 && cfg.financePayment.defaultDepositPercent > 0 && rawSubtotalSatang > 0) {
    depositAmountSatang = Math.round((rawSubtotalSatang * cfg.financePayment.defaultDepositPercent) / 100)
  }
  const depositAmount = toBaht(depositAmountSatang)

  // 8. Bill Amount & Grand Total (Strictly excludes Security Deposit per MASTER v2.3.0)
  const billAmount = revenueTotal
  const grandTotal = billAmount
  const totalPayableWithDeposit = toBaht(addSatang(revenueTotalSatang, depositAmountSatang))

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
  const billAmountSatang = Math.max(0, toSatang(params.billAmount))
  const netPaidSatang = Math.max(0, toSatang(params.netPaid))
  const revenueRecognizedSatang = Math.max(0, toSatang(params.revenueRecognized))

  const billOutstandingSatang = Math.max(0, billAmountSatang - netPaidSatang)
  const earnedOutstandingSatang = Math.max(0, revenueRecognizedSatang - netPaidSatang)
  const unearnedServiceSatang = Math.max(0, billAmountSatang - revenueRecognizedSatang)
  const advanceDeferredSatang = Math.min(
    Math.max(0, netPaidSatang - revenueRecognizedSatang),
    unearnedServiceSatang
  )
  const overpaymentSatang = Math.max(0, netPaidSatang - billAmountSatang)
  const refundDueSatang = overpaymentSatang

  const dep = params.securityDeposit || {}
  const depRequiredSatang = Math.max(0, toSatang(dep.required))
  const depReceivedSatang = Math.max(0, toSatang(dep.received))
  const depRefundedSatang = Math.max(0, toSatang(dep.refunded))
  const depAppliedSatang = Math.max(0, toSatang(dep.applied))
  const depHeldSatang = Math.max(0, depReceivedSatang - depRefundedSatang - depAppliedSatang)

  return {
    billAmount: toBaht(billAmountSatang),
    netPaid: toBaht(netPaidSatang),
    billOutstanding: toBaht(billOutstandingSatang),
    revenueRecognized: toBaht(revenueRecognizedSatang),
    earnedOutstanding: toBaht(earnedOutstandingSatang),
    advanceDeferred: toBaht(advanceDeferredSatang),
    overpayment: toBaht(overpaymentSatang),
    refundDue: toBaht(refundDueSatang),
    securityDeposit: {
      required: toBaht(depRequiredSatang),
      received: toBaht(depReceivedSatang),
      refunded: toBaht(depRefundedSatang),
      applied: toBaht(depAppliedSatang),
      held: toBaht(depHeldSatang),
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
  let recognizedSatang = 0

  for (const item of options.items) {
    const qty = Number(item.quantity) || 0
    const priceSatang = toSatang(item.unitPrice)
    if (item.rentalType === 'SALE') {
      recognizedSatang = addSatang(recognizedSatang, multiplySatang(priceSatang, qty))
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
      recognizedSatang = addSatang(recognizedSatang, multiplySatang(priceSatang, qty * days))
    } else {
      // Round-based
      const rounds = Math.max(1, item.usageCount || 1)
      recognizedSatang = addSatang(recognizedSatang, multiplySatang(priceSatang, qty * rounds))
    }
  }

  return toBaht(recognizedSatang)
}

/**
 * Single Central Financial Summary
 * Reconciles Bill Amount, Net Paid from Transaction History, Revenue Recognized, and Core Metrics.
 */
export function getBillFinancialCoreSummary(
  bill: {
    billAmount?: number
    grandTotal: number
    dispatchStatus?: string
    items?: any[]
    heldDepositAmount?: number
    paidDepositAmount?: number
    depositRefunded?: number
    depositApplied?: number
    depositRequired?: number
  },
  netPaidBaht: number
): FinancialCoreResult {
  const billAmount = bill.billAmount !== undefined ? bill.billAmount : bill.grandTotal
  const revenueRecognized = calculateRevenueRecognized({
    dispatchStatus: bill.dispatchStatus,
    items: (bill.items || []).map((it) => ({
      rentalType: it.rentalType,
      quantity: it.quantity,
      unitPrice: it.dailyRate || it.unitPrice || 0,
      dailyStartDate: it.rentalStartDate,
      dailyEndDate: it.scheduledReturnDate,
      actualReturnDate: it.actualReturnDate,
      billableDays: it.billableDays,
      usageCount: it.usageCount,
    })),
  })

  return calculateFinancialCore({
    billAmount,
    netPaid: netPaidBaht,
    revenueRecognized,
    securityDeposit: {
      required: bill.depositRequired,
      received: bill.paidDepositAmount,
      refunded: bill.depositRefunded,
      applied: bill.depositApplied,
    },
  })
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
