/**
 * Money Core Utility
 *
 * Single source of truth for all monetary arithmetic using Integer Satang.
 * 1 THB = 100 Satang.
 *
 * Guarantees zero floating-point precision drift for:
 * 0, 0.01, 0.10, 0.29, 1, 1.01, 10.50, 999999.99, etc.
 */

/**
 * Parses any Baht representation (number, formatted string) into integer Satang.
 * Handles float precision safely without intermediate float distortion.
 */
export function toSatang(baht: number | string | null | undefined): number {
  if (baht === null || baht === undefined || baht === '') return 0

  if (typeof baht === 'string') {
    const trimmed = baht.trim().replace(/,/g, '')
    if (!trimmed || isNaN(Number(trimmed))) return 0
    const isNegative = trimmed.startsWith('-')
    const absStr = isNegative ? trimmed.slice(1) : trimmed
    const parts = absStr.split('.')
    const whole = parseInt(parts[0] || '0', 10) || 0
    const rawFrac = (parts[1] || '').slice(0, 2).padEnd(2, '0')
    const frac = parseInt(rawFrac, 10) || 0
    const satang = whole * 100 + frac
    return isNegative ? -satang : satang
  }

  if (isNaN(baht) || !isFinite(baht)) return 0

  // For numbers, use Math.round on baht * 100 with epsilon guard
  const sign = baht < 0 ? -1 : 1
  const abs = Math.abs(baht)
  return sign * Math.round(abs * 100 + 1e-9)
}

/**
 * Converts integer Satang into Baht for API boundaries, UI display, and DB persistence.
 */
export function toBaht(satang: number): number {
  if (isNaN(satang) || !isFinite(satang)) return 0
  return satang / 100
}

/**
 * Formats a monetary amount (in Baht or Satang) as THB string with 2 decimal places.
 */
export function formatMoneyTHB(amount: number, isSatang = false): string {
  const baht = isSatang ? toBaht(amount) : amount
  return baht.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Adds multiple Satang amounts safely.
 */
export function addSatang(...amounts: number[]): number {
  return amounts.reduce((acc, curr) => acc + (toSatang(toBaht(curr)) || 0), 0)
}

/**
 * Subtracts Satang amounts (a - b).
 */
export function subtractSatang(a: number, b: number): number {
  return (toSatang(toBaht(a)) || 0) - (toSatang(toBaht(b)) || 0)
}

/**
 * Multiplies Satang by a quantity or factor and rounds to integer Satang.
 */
export function multiplySatang(satang: number, factor: number): number {
  if (isNaN(satang) || isNaN(factor)) return 0
  return Math.round(satang * factor)
}

/**
 * Calculates line total for a single item in integer Satang.
 */
export function calculateLineTotalSatang(
  unitPriceSatang: number,
  quantity: number,
  multiplier = 1
): number {
  const qty = Math.max(0, quantity || 0)
  const mult = Math.max(1, multiplier || 1)
  return multiplySatang(unitPriceSatang, qty * mult)
}

/**
 * Calculates VAT in integer Satang.
 * @param taxBaseSatang Net taxable amount in Satang
 * @param vatRate Rate (e.g. 0.07 for 7%)
 * @param isInclusive Whether VAT is inclusive in the price
 */
export function calculateVatSatang(
  taxBaseSatang: number,
  vatRate: number,
  isInclusive = false
): number {
  if (taxBaseSatang <= 0 || vatRate <= 0) return 0
  if (isInclusive) {
    // taxBase * (vatRate / (1 + vatRate))
    const factor = vatRate / (1 + vatRate)
    return Math.round(taxBaseSatang * factor)
  }
  return Math.round(taxBaseSatang * vatRate)
}

export interface DiscountCalculationSatangResult {
  discountSatang: number
  isDiscountExceeded: boolean
  maxAllowedSatang: number
  effectivePercent: number
}

/**
 * Calculates discount in integer Satang with maximum percentage ceiling validation.
 */
export function calculateDiscountSatang(
  subtotalSatang: number,
  options?: {
    discountPercent?: number
    discountAmountSatang?: number
    maxDiscountPercent?: number
  }
): DiscountCalculationSatangResult {
  const maxPercent = options?.maxDiscountPercent ?? 50
  const maxAllowedSatang = Math.round((subtotalSatang * maxPercent) / 100)

  let requestedSatang = 0
  if (options?.discountPercent !== undefined && options.discountPercent > 0) {
    requestedSatang = Math.round((subtotalSatang * options.discountPercent) / 100)
  } else if (options?.discountAmountSatang !== undefined && options.discountAmountSatang > 0) {
    requestedSatang = Math.round(options.discountAmountSatang)
  }

  const isDiscountExceeded = requestedSatang > maxAllowedSatang
  const cappedSatang = Math.min(requestedSatang, maxAllowedSatang)
  const discountSatang = Math.max(0, Math.min(cappedSatang, subtotalSatang))
  const effectivePercent = subtotalSatang > 0 ? (discountSatang / subtotalSatang) * 100 : 0

  return {
    discountSatang,
    isDiscountExceeded,
    maxAllowedSatang,
    effectivePercent,
  }
}

export interface DepositSettlementSatangResult {
  compensationTotalSatang: number
  appliedDepositSatang: number
  refundDueSatang: number
  balanceDueSatang: number
}

/**
 * Calculates Deposit Settlement strictly using integer Satang:
 * - Compensation Total = Damage Actual + Lost Actual
 * - Applied Deposit = min(Held Deposit, Compensation Total)
 * - Refund Due = max(Held Deposit - Applied Deposit, 0)
 * - Balance Due = max(Compensation Total - Applied Deposit, 0)
 */
export function calculateDepositSettlementSatang(
  heldDepositSatang: number,
  compensationTotalSatang: number
): DepositSettlementSatangResult {
  const held = Math.max(0, heldDepositSatang || 0)
  const comp = Math.max(0, compensationTotalSatang || 0)

  const appliedDepositSatang = Math.min(held, comp)
  const refundDueSatang = Math.max(0, held - appliedDepositSatang)
  const balanceDueSatang = Math.max(0, comp - appliedDepositSatang)

  return {
    compensationTotalSatang: comp,
    appliedDepositSatang,
    refundDueSatang,
    balanceDueSatang,
  }
}

/**
 * Baht boundary helper for Deposit Settlement:
 * Converts Baht inputs to Satang, computes settlement via integer core,
 * and returns Baht results.
 */
export function calculateDepositSettlement(
  heldDepositBaht: number,
  compensationTotalBaht: number
): {
  compensationTotal: number
  appliedDeposit: number
  refundDue: number
  balanceDue: number
} {
  const heldSatang = toSatang(heldDepositBaht)
  const compSatang = toSatang(compensationTotalBaht)
  const res = calculateDepositSettlementSatang(heldSatang, compSatang)

  return {
    compensationTotal: toBaht(res.compensationTotalSatang),
    appliedDeposit: toBaht(res.appliedDepositSatang),
    refundDue: toBaht(res.refundDueSatang),
    balanceDue: toBaht(res.balanceDueSatang),
  }
}
