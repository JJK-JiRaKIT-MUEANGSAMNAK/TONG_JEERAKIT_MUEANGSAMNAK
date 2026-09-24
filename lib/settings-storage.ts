/**
 * Centralized System Settings Storage & Service
 *
 * Backed by localStorage key 'app_system_settings'.
 * Single source of truth for financial rules, VAT rates, discount ceilings,
 * money precision/rounding, and reservation expiry policies across the entire app.
 */

import { recordAuditLog, generateCorrelationId } from '@/lib/audit-storage'

export interface BusinessSettings {
  businessName: string
  address: string
  phone: string
  email: string
  taxId: string
  branchNo: string
  lineId: string
  authorizedPerson: string
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  promptPayValue: string
  promptPayType?: string
  logoDataUrl?: string
  bankQrDataUrl?: string
}

export interface ProductStockSettings {
  defaultMinimumStock: number
  allowZeroStock: boolean
  allowBackdatedStockAdjustment: boolean
  lowStockNotificationEnabled: boolean
}

export type ReservationExpiryPolicy = 'UNTIL_START_DATE' | 'MANUAL' | 'DAYS_LIMIT'

export interface RentalBillingSettings {
  defaultRentalType: string
  defaultRentalDays: number
  rentalDayCalculation: string
  gracePeriodDays: number
  lateFeeMode: string
  lateFeeValue: number
  dailyOverdueChargeEnabled: boolean
  returnCutoffTime: string
  allowPartialReturn: boolean
  allowPartialPayment: boolean
  allowContinueAfterPaid: boolean
  reservationExpiryPolicy: ReservationExpiryPolicy
  reservationExpiryDays: number
}

export interface DocNumberFormat {
  prefix: string
  runningDigits: number
  resetCycle: string
  yearMode: string
  includeDate: boolean
  datePattern: string
  separator?: string
  digits?: number
}

export interface DocumentNumberingSettings {
  rentalBill: DocNumberFormat
  quotation: DocNumberFormat
  receipt: DocNumberFormat
  returnSlip: DocNumberFormat
}

export interface DocumentPrintingSettings {
  defaultTemplates: {
    rentalBill: string
    quotation: string
    receipt: string
    returnSlip: string
  }
  paperSize: string
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  footerText: string
  showLogo?: boolean
  showQRCode?: boolean
  showAuthorizedPerson?: boolean
  showSignature?: boolean
  defaultCopies?: number
}

export type VatCalculationMode = 'EXCLUSIVE' | 'INCLUSIVE'
export type RoundingMode = 'ROUND_HALF_UP' | 'ROUND_UP' | 'ROUND_DOWN'

export interface FinancePaymentSettings {
  paymentMethods: {
    cash: boolean
    bankTransfer: boolean
    promptPay: boolean
    credit: boolean
  }
  defaultVatPercent: number
  vatEnabled?: boolean
  vatCalculationMode: VatCalculationMode
  defaultWithholdingPercent: number
  maximumDiscountPercent: number
  defaultDepositPercent: number
  autoCreateFinanceTransaction: boolean
  moneyPrecision: number
  roundingMode: RoundingMode
}

export interface NotificationItemSettings {
  enabled: boolean
  daysBefore?: number
}

export interface NotificationSettings {
  deliveryReminder: NotificationItemSettings
  returnReminder: NotificationItemSettings
  paymentReminder: NotificationItemSettings
  lowStockReminder: { enabled: boolean }
  overdueReturnReminder: { enabled: boolean }
}

export interface BrandingSettings {
  systemName: string
  authBackgroundType?: 'gradient' | 'image' | 'default'
  authBackgroundImageUrl?: string | null
  appLogoUrl?: string | null
}

export interface SystemConfig {
  business: BusinessSettings
  productStock: ProductStockSettings
  rentalBilling: RentalBillingSettings
  documentNumbering: DocumentNumberingSettings
  documentPrinting: DocumentPrintingSettings
  financePayment: FinancePaymentSettings
  notifications: NotificationSettings
  branding: BrandingSettings
  appointmentsNotifications?: {
    lineNotifyToken?: string
    lineOaSecret?: string
  }
}

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: 'บริษัท ทีเจ อุปกรณ์ก่อสร้างและจัดเลี้ยง จำกัด',
  address: '99/9 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
  phone: '02-123-4567',
  email: 'contact@tj-rental.com',
  taxId: '0105560001234',
  branchNo: '00000',
  lineId: '@tjrental',
  authorizedPerson: 'นายทอง เจียรกิตติ์',
  bankName: 'ธนาคารกสิกรไทย',
  bankAccountName: 'บจก. ทีเจ อุปกรณ์',
  bankAccountNumber: '123-4-56789-0',
  promptPayValue: '0105560001234',
  promptPayType: 'TAX_ID',
  logoDataUrl: '',
  bankQrDataUrl: '',
}

export const DEFAULT_PRODUCT_STOCK_SETTINGS: ProductStockSettings = {
  defaultMinimumStock: 2,
  allowZeroStock: false,
  allowBackdatedStockAdjustment: false,
  lowStockNotificationEnabled: true,
}

export const DEFAULT_RENTAL_BILLING_SETTINGS: RentalBillingSettings = {
  defaultRentalType: 'DAILY',
  defaultRentalDays: 1,
  rentalDayCalculation: 'INCLUSIVE',
  gracePeriodDays: 0,
  lateFeeMode: 'NONE',
  lateFeeValue: 0,
  dailyOverdueChargeEnabled: false,
  returnCutoffTime: '18:00',
  allowPartialReturn: true,
  allowPartialPayment: true,
  allowContinueAfterPaid: false,
  reservationExpiryPolicy: 'UNTIL_START_DATE',
  reservationExpiryDays: 7,
}

export const DEFAULT_DOCUMENT_NUMBERING_SETTINGS: DocumentNumberingSettings = {
  rentalBill: { prefix: 'BILL', runningDigits: 4, resetCycle: 'MONTHLY', yearMode: 'BE', includeDate: true, datePattern: 'YYYYMM' },
  quotation: { prefix: 'QT', runningDigits: 4, resetCycle: 'MONTHLY', yearMode: 'BE', includeDate: true, datePattern: 'YYYYMM' },
  receipt: { prefix: 'REC', runningDigits: 4, resetCycle: 'MONTHLY', yearMode: 'BE', includeDate: true, datePattern: 'YYYYMM' },
  returnSlip: { prefix: 'RET', runningDigits: 4, resetCycle: 'MONTHLY', yearMode: 'BE', includeDate: true, datePattern: 'YYYYMM' },
}

export const DEFAULT_DOCUMENT_PRINTING_SETTINGS: DocumentPrintingSettings = {
  defaultTemplates: {
    rentalBill: '',
    quotation: '',
    receipt: '',
    returnSlip: '',
  },
  paperSize: 'A4',
  margins: { top: 0, right: 0, bottom: 0, left: 0 },
  footerText: '',
  showLogo: true,
  showQRCode: true,
  showAuthorizedPerson: true,
  showSignature: true,
  defaultCopies: 1,
}

export const DEFAULT_FINANCE_PAYMENT_SETTINGS: FinancePaymentSettings = {
  paymentMethods: {
    cash: true,
    bankTransfer: true,
    promptPay: true,
    credit: false,
  },
  defaultVatPercent: 7,
  vatEnabled: true,
  vatCalculationMode: 'EXCLUSIVE',
  defaultWithholdingPercent: 0,
  maximumDiscountPercent: 50,
  defaultDepositPercent: 0,
  autoCreateFinanceTransaction: true,
  moneyPrecision: 2,
  roundingMode: 'ROUND_HALF_UP',
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  deliveryReminder: { enabled: true, daysBefore: 1 },
  returnReminder: { enabled: true, daysBefore: 1 },
  paymentReminder: { enabled: true, daysBefore: 1 },
  lowStockReminder: { enabled: true },
  overdueReturnReminder: { enabled: true },
}

export const DEFAULT_BRANDING_SETTINGS: BrandingSettings = {
  systemName: 'JJK_JeeRaKiT',
  authBackgroundType: 'gradient',
  authBackgroundImageUrl: null,
  appLogoUrl: null,
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  business: DEFAULT_BUSINESS_SETTINGS,
  productStock: DEFAULT_PRODUCT_STOCK_SETTINGS,
  rentalBilling: DEFAULT_RENTAL_BILLING_SETTINGS,
  documentNumbering: DEFAULT_DOCUMENT_NUMBERING_SETTINGS,
  documentPrinting: DEFAULT_DOCUMENT_PRINTING_SETTINGS,
  financePayment: DEFAULT_FINANCE_PAYMENT_SETTINGS,
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
  branding: DEFAULT_BRANDING_SETTINGS,
  appointmentsNotifications: {
    lineNotifyToken: '',
    lineOaSecret: '',
  },
}

export const SETTINGS_STORAGE_KEY = 'app_system_settings'

/**
 * Merge loaded partial settings with complete defaults to guarantee field completeness.
 */
function mergeWithDefaults(loaded: Partial<SystemConfig>): SystemConfig {
  return {
    business: { ...DEFAULT_BUSINESS_SETTINGS, ...(loaded.business || {}) },
    productStock: { ...DEFAULT_PRODUCT_STOCK_SETTINGS, ...(loaded.productStock || {}) },
    rentalBilling: {
      ...DEFAULT_RENTAL_BILLING_SETTINGS,
      ...(loaded.rentalBilling || {}),
      reservationExpiryPolicy: loaded.rentalBilling?.reservationExpiryPolicy || DEFAULT_RENTAL_BILLING_SETTINGS.reservationExpiryPolicy,
      reservationExpiryDays: Number(loaded.rentalBilling?.reservationExpiryDays) || DEFAULT_RENTAL_BILLING_SETTINGS.reservationExpiryDays,
    },
    documentNumbering: {
      rentalBill: { ...DEFAULT_DOCUMENT_NUMBERING_SETTINGS.rentalBill, ...(loaded.documentNumbering?.rentalBill || {}) },
      quotation: { ...DEFAULT_DOCUMENT_NUMBERING_SETTINGS.quotation, ...(loaded.documentNumbering?.quotation || {}) },
      receipt: { ...DEFAULT_DOCUMENT_NUMBERING_SETTINGS.receipt, ...(loaded.documentNumbering?.receipt || {}) },
      returnSlip: { ...DEFAULT_DOCUMENT_NUMBERING_SETTINGS.returnSlip, ...(loaded.documentNumbering?.returnSlip || {}) },
    },
    documentPrinting: {
      ...DEFAULT_DOCUMENT_PRINTING_SETTINGS,
      ...(loaded.documentPrinting || {}),
      defaultTemplates: { ...DEFAULT_DOCUMENT_PRINTING_SETTINGS.defaultTemplates, ...(loaded.documentPrinting?.defaultTemplates || {}) },
      margins: { ...DEFAULT_DOCUMENT_PRINTING_SETTINGS.margins, ...(loaded.documentPrinting?.margins || {}) },
    },
    financePayment: {
      ...DEFAULT_FINANCE_PAYMENT_SETTINGS,
      ...(loaded.financePayment || {}),
      paymentMethods: { ...DEFAULT_FINANCE_PAYMENT_SETTINGS.paymentMethods, ...(loaded.financePayment?.paymentMethods || {}) },
      defaultVatPercent: Number(loaded.financePayment?.defaultVatPercent ?? DEFAULT_FINANCE_PAYMENT_SETTINGS.defaultVatPercent),
      vatEnabled: loaded.financePayment?.vatEnabled ?? DEFAULT_FINANCE_PAYMENT_SETTINGS.vatEnabled,
      vatCalculationMode: loaded.financePayment?.vatCalculationMode || DEFAULT_FINANCE_PAYMENT_SETTINGS.vatCalculationMode,
      maximumDiscountPercent: Number(loaded.financePayment?.maximumDiscountPercent ?? DEFAULT_FINANCE_PAYMENT_SETTINGS.maximumDiscountPercent),
      defaultDepositPercent: Number(loaded.financePayment?.defaultDepositPercent ?? DEFAULT_FINANCE_PAYMENT_SETTINGS.defaultDepositPercent),
      moneyPrecision: Number(loaded.financePayment?.moneyPrecision ?? DEFAULT_FINANCE_PAYMENT_SETTINGS.moneyPrecision),
      roundingMode: loaded.financePayment?.roundingMode || DEFAULT_FINANCE_PAYMENT_SETTINGS.roundingMode,
    },
    notifications: {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...(loaded.notifications || {}),
      deliveryReminder: { ...DEFAULT_NOTIFICATION_SETTINGS.deliveryReminder, ...(loaded.notifications?.deliveryReminder || {}) },
      returnReminder: { ...DEFAULT_NOTIFICATION_SETTINGS.returnReminder, ...(loaded.notifications?.returnReminder || {}) },
      paymentReminder: { ...DEFAULT_NOTIFICATION_SETTINGS.paymentReminder, ...(loaded.notifications?.paymentReminder || {}) },
      lowStockReminder: { ...DEFAULT_NOTIFICATION_SETTINGS.lowStockReminder, ...(loaded.notifications?.lowStockReminder || {}) },
      overdueReturnReminder: { ...DEFAULT_NOTIFICATION_SETTINGS.overdueReturnReminder, ...(loaded.notifications?.overdueReturnReminder || {}) },
    },
    branding: { ...DEFAULT_BRANDING_SETTINGS, ...(loaded.branding || {}) },
    appointmentsNotifications: {
      ...DEFAULT_SYSTEM_CONFIG.appointmentsNotifications,
      ...(loaded.appointmentsNotifications || {}),
    },
  }
}

/**
 * Load system settings from localStorage or fallback to defaults.
 */
export function loadSystemSettings(): SystemConfig {
  if (typeof window === 'undefined') return DEFAULT_SYSTEM_CONFIG
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return mergeWithDefaults(parsed)
    }
  } catch {
    // fallback
  }
  return DEFAULT_SYSTEM_CONFIG
}

/**
 * Helper to get current centralized default minimum stock threshold for runtime warnings.
 */
export function getDefaultMinimumStock(): number {
  return loadSystemSettings().productStock.defaultMinimumStock ?? DEFAULT_PRODUCT_STOCK_SETTINGS.defaultMinimumStock
}

export interface ActorInfo {
  userId: string
  displayName: string
}

/**
 * Persist system settings with audit logging for money/stock/workflow impacting changes.
 */
export function saveSystemSettings(
  config: Partial<SystemConfig> | SystemConfig,
  actor?: ActorInfo,
  reason?: string
): SystemConfig {
  const previous = loadSystemSettings()
  const merged = mergeWithDefaults(config)

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged))
      if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('app_settings_changed', { detail: merged }))
      }
    } catch (err: any) {
      throw new Error(`ไม่สามารถบันทึกการตั้งค่าลง storage ได้: ${err?.message || 'Storage Quota Exceeded'}`)
    }
  }

  // Check if financial, stock, or workflow parameters changed
  const financeChanged =
    previous.financePayment.defaultVatPercent !== merged.financePayment.defaultVatPercent ||
    previous.financePayment.vatCalculationMode !== merged.financePayment.vatCalculationMode ||
    previous.financePayment.maximumDiscountPercent !== merged.financePayment.maximumDiscountPercent ||
    previous.financePayment.defaultDepositPercent !== merged.financePayment.defaultDepositPercent ||
    previous.financePayment.moneyPrecision !== merged.financePayment.moneyPrecision ||
    previous.financePayment.roundingMode !== merged.financePayment.roundingMode

  const stockOrWorkflowChanged =
    previous.productStock.allowZeroStock !== merged.productStock.allowZeroStock ||
    previous.productStock.defaultMinimumStock !== merged.productStock.defaultMinimumStock ||
    previous.rentalBilling.reservationExpiryPolicy !== merged.rentalBilling.reservationExpiryPolicy ||
    previous.rentalBilling.reservationExpiryDays !== merged.rentalBilling.reservationExpiryDays

  if (financeChanged || stockOrWorkflowChanged) {
    const correlationId = generateCorrelationId()
    const trimmedReason = reason?.trim() || 'อัปเดตการตั้งค่าระบบ'

    recordAuditLog({
      userId: actor?.userId || 'system',
      displayName: actor?.displayName || 'ระบบ',
      action: 'SETTING_FINANCE_STOCK_UPDATE',
      entityType: 'SETTINGS',
      entityId: 'system-config',
      before: {
        financePayment: previous.financePayment,
        productStock: previous.productStock,
        rentalBilling: {
          reservationExpiryPolicy: previous.rentalBilling.reservationExpiryPolicy,
          reservationExpiryDays: previous.rentalBilling.reservationExpiryDays,
        },
      },
      after: {
        financePayment: merged.financePayment,
        productStock: merged.productStock,
        rentalBilling: {
          reservationExpiryPolicy: merged.rentalBilling.reservationExpiryPolicy,
          reservationExpiryDays: merged.rentalBilling.reservationExpiryDays,
        },
      },
      reason: trimmedReason,
      correlationId,
    })
  }

  return merged
}

/**
 * Reset system settings to factory defaults.
 */
export function resetSystemSettings(): SystemConfig {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SETTINGS_STORAGE_KEY)
    if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('app_settings_changed', { detail: DEFAULT_SYSTEM_CONFIG }))
    }
  }
  return DEFAULT_SYSTEM_CONFIG
}
