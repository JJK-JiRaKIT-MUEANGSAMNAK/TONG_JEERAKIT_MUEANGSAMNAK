'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Building,
  Package,
  CalendarDays,
  Hash,
  FileText,
  CreditCard,
  BellRing,
  Save,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  QrCode,
  ShieldCheck,
  Check,
  Upload,
  Image as ImageIcon,
  Clock,
  AlertCircle,
  Tag,
  Pencil,
  Shield,
  KeyRound,
  Lock,
  LogOut,
  User,
  Key,
  Store,
  Eye,
  EyeOff,
  Copy,
  Smartphone,
} from 'lucide-react'
import { useToast } from '@/components/common/Toast'
import { CustomSelect } from '@/components/common/CustomSelect'
import { NumericInput } from '@/components/common/NumericInput'
import { ModalPortal } from '@/components/common/ModalPortal'
import { useAppLock } from '@/lib/contexts/AppLockContext'
import { InitialPinSetupScreen } from '@/components/auth/InitialPinSetupScreen'
import {
  TAB_CONTAINER_CLASSES,
  TAB_BUTTON_BASE_CLASSES,
  TAB_BUTTON_ACTIVE_CLASSES,
  TAB_BUTTON_INACTIVE_CLASSES,
} from '@/components/common/ActionButton'
import {
  ProductCategoryRule,
  CalculationType,
  CALCULATION_OPTIONS,
  loadCategoryRules,
  addCategoryRule,
  updateCategoryRule,
  deleteCategoryRule,
} from '@/lib/category-rules-storage'
export type AutoLockDuration = '3' | '5' | '10' | '15'

function previewDocumentNumber(cfg?: { prefix?: string; separator?: string; format?: string; digits?: number }): string {
  if (!cfg) return ''
  const prefix = cfg.prefix || 'DOC'
  const sep = cfg.separator ?? '-'
  const digits = cfg.digits || 4
  const num = String(1).padStart(digits, '0')
  return `${prefix}${sep}202609${sep}${num}`
}

const validatePin = (pin: string) => {
  if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return { isValid: false, error: 'PIN ต้องเป็นตัวเลข 6 หลัก' }
  }
  return { isValid: true, error: null }
}

const validatePassword = (pwd: string, _context?: any) => {
  if (!pwd || pwd.length < 8) {
    return { isValid: false, error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }
  }
  return { isValid: true, error: null }
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

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
  reservationExpiryPolicy: 'UNTIL_START_DATE' | 'MANUAL' | 'DAYS_LIMIT'
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

export interface FinancePaymentSettings {
  paymentMethods: {
    cash: boolean
    bankTransfer: boolean
    promptPay: boolean
    credit: boolean
  }
  defaultVatPercent: number
  vatEnabled: boolean
  vatCalculationMode: 'EXCLUSIVE' | 'INCLUSIVE'
  defaultWithholdingPercent: number
  maximumDiscountPercent: number
  defaultDepositPercent: number
  autoCreateFinanceTransaction: boolean
  moneyPrecision: number
  roundingMode: 'ROUND_HALF_UP' | 'ROUND_UP' | 'ROUND_DOWN'
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

import { ManualBackupCard } from '@/components/settings/ManualBackupCard'

// 7 Main Categories
export type SettingsTab =
  | 'BUSINESS'
  | 'PRODUCTS_STOCK'
  | 'RENTAL_BILLS'
  | 'DOCUMENTS'
  | 'FINANCE'
  | 'NOTIFICATIONS'
  | 'SYSTEM_ACCOUNT'

export type BusinessSubTab = 'INFO' | 'BRANDING'
export type DocumentsSubTab = 'NUMBERS' | 'PRINTING'
export type SystemAccountSubTab = 'SECURITY' | 'BACKUP'

import {
  loadSystemSettings,
  saveSystemSettings,
  DEFAULT_SYSTEM_CONFIG,
  DEFAULT_BUSINESS_SETTINGS,
  DEFAULT_PRODUCT_STOCK_SETTINGS,
  DEFAULT_RENTAL_BILLING_SETTINGS,
  DEFAULT_DOCUMENT_NUMBERING_SETTINGS,
  DEFAULT_DOCUMENT_PRINTING_SETTINGS,
  DEFAULT_FINANCE_PAYMENT_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_BRANDING_SETTINGS,
} from '@/lib/settings-storage'
import { updatePassword } from '@/app/actions/auth'
import { useAuth } from '@/lib/contexts/AuthContext'

export default function SettingsPage() {
  const { showToast } = useToast()
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG)

  useEffect(() => {
    setConfig(loadSystemSettings())
    const syncVat = () => {
      const saved = loadSystemSettings()
      setConfig((prev) => ({
        ...prev,
        financePayment: { ...prev.financePayment, vatEnabled: saved.financePayment.vatEnabled },
      }))
    }
    window.addEventListener('app_settings_changed', syncVat)
    window.addEventListener('storage', syncVat)
    return () => {
      window.removeEventListener('app_settings_changed', syncVat)
      window.removeEventListener('storage', syncVat)
    }
  }, [])

  const saveConfig = async (cfg: SystemConfig, _businessId?: string, reason?: string) => {
    const actor = {
      userId: user?.id || 'system',
      displayName: user?.fullName || user?.username || 'ผู้ดูแลระบบ',
    }
    const saved = saveSystemSettings(cfg, actor, reason)
    setConfig(saved)
  }
  const resetConfig = () => setConfig(DEFAULT_SYSTEM_CONFIG)
  const resetBusinessSettings = () => setConfig((prev) => ({ ...prev, business: DEFAULT_BUSINESS_SETTINGS }))
  const resetBrandingSettings = () => setConfig((prev) => ({ ...prev, branding: DEFAULT_BRANDING_SETTINGS }))
  const resetRentalBillingSettings = () => setConfig((prev) => ({ ...prev, rentalBilling: DEFAULT_RENTAL_BILLING_SETTINGS }))
  const resetDocumentNumberingSettings = () => setConfig((prev) => ({ ...prev, documentNumbering: DEFAULT_DOCUMENT_NUMBERING_SETTINGS }))
  const resetFinancePaymentSettings = () => setConfig((prev) => ({ ...prev, financePayment: DEFAULT_FINANCE_PAYMENT_SETTINGS }))
  const resetDocumentPrintingSettings = () => setConfig((prev) => ({ ...prev, documentPrinting: DEFAULT_DOCUMENT_PRINTING_SETTINGS }))
  const resetNotificationSettings = () => setConfig((prev) => ({ ...prev, notifications: DEFAULT_NOTIFICATION_SETTINGS }))
  const { user, signOut } = useAuth()

  const [autoLockDuration, setAutoLockDuration] = useState<AutoLockDuration>('5')
  const [isMfaEnrolled, setIsMfaEnrolled] = useState(false)
  const [mfaFactors, setMfaFactors] = useState<any[]>([])

  useEffect(() => {
    async function loadMfaStatus() {
      const { createClient } = require('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (data && !error) {
        const totpFactors = data.all || []
        setMfaFactors(totpFactors)
        setIsMfaEnrolled(totpFactors.some((f: any) => f.status === 'verified'))
      }
    }
    loadMfaStatus()
  }, [])

  const lock = () => {
    if (typeof window !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('rental_pos_unlocked_')) {
          sessionStorage.removeItem(key)
        }
      })
      window.location.reload()
    }
  }

  const logout = async (_scope?: string) => {
    if (typeof window !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('rental_pos_unlocked_')) {
          sessionStorage.removeItem(key)
        }
      })
      await signOut()
    }
  }

  const { pinEnabled } = useAppLock()
  const [showPinSetupModal, setShowPinSetupModal] = useState(false)
  const changePassword = async (pwd: string) => {
    const res = await updatePassword(pwd)
    if (!res.success) throw new Error(res.error || 'ไม่สามารถเปลี่ยนรหัสผ่านได้')
  }
  const { createClient } = require('@/lib/supabase/client')
  const supabase = createClient()
  
  const enrollMfaTotp = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error) throw error
    return { 
      factorId: data.id, 
      secret: data.totp.secret, 
      qrCode: data.totp.qr_code, 
      uri: data.totp.uri 
    }
  }
  const verifyMfaEnrollment = async (factorId: string, code: string) => {
    const challenge = await supabase.auth.mfa.challenge({ factorId })
    if (challenge.error) throw challenge.error
    const verify = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code })
    if (verify.error) throw verify.error
  }
  const unenrollMfa = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId })
    if (error) throw error
  }
  const updateAutoLockSetting = async (dur: AutoLockDuration) => {
    setAutoLockDuration(dur)
    showToast('บันทึกสำเร็จ', 'อัปเดตระยะเวลาล็อกหน้าจอแล้ว', 'SUCCESS')
  }
  const updateUserAvatar = async (url: string | null) => {
    /* avatar update removed for auth context */
  }
  const [activeTab, setActiveTab] = useState<SettingsTab>('BUSINESS')
  const [businessSubTab, setBusinessSubTab] = useState<BusinessSubTab>('INFO')
  const [documentsSubTab, setDocumentsSubTab] = useState<DocumentsSubTab>('NUMBERS')
  const [systemAccountSubTab, setSystemAccountSubTab] = useState<SystemAccountSubTab>('SECURITY')
  const [isSaved, setIsSaved] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Profile & Branding Refs
  const authBgInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const appLogoInputRef = useRef<HTMLInputElement>(null)

  // Tab 8 Password States
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmNewPwd, setConfirmNewPwd] = useState('')
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)

  // Tab 8 MFA States
  const [isEnrollingMfa, setIsEnrollingMfa] = useState(false)
  const [mfaEnrollData, setMfaEnrollData] = useState<{ factorId: string; secret: string; qrCode: string; uri: string } | null>(null)
  const [mfaVerifyCode, setMfaVerifyCode] = useState('')
  const [mfaVerifyError, setMfaVerifyError] = useState<string | null>(null)
  const [mfaLoading, setMfaLoading] = useState(false)
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)

  // Visibility states for security fields
  const [showOldPin, setShowOldPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [showConfirmNewPin, setShowConfirmNewPin] = useState(false)
  const [showForgotPinPwd, setShowForgotPinPwd] = useState(false)
  const [showForgotPinNew, setShowForgotPinNew] = useState(false)
  const [showForgotPinConfirm, setShowForgotPinConfirm] = useState(false)
  const [showOldPwd, setShowOldPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmNewPwd, setShowConfirmNewPwd] = useState(false)
  const [showLineToken, setShowLineToken] = useState(false)
  const [showLineSecret, setShowLineSecret] = useState(false)

  // Auth Background Image upload handler (Max 3 MB)
  const handleAuthBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reasonPrompt = window.prompt('กรุณาระบุเหตุผลในการเปลี่ยนรูปพื้นหลังล็อกอิน (จำเป็น):')
    const trimmedReason = reasonPrompt?.trim()
    if (!trimmedReason) {
      if (reasonPrompt !== null) {
        showToast('กรุณาระบุเหตุผล', 'จำเป็นต้องระบุเหตุผลในการแก้ไขการตั้งค่า', 'ERROR')
      }
      if (e.target) e.target.value = ''
      return
    }

    const businessId = user?.businessId || '00000000-0000-0000-0000-000000000001'
    const previousConfig = config

    try {
      const uploadedUrl = await readFileAsDataUrl(file)

      const nextConfig: SystemConfig = {
        ...previousConfig,
        branding: {
          ...previousConfig.branding,
          authBackgroundImageUrl: uploadedUrl,
          authBackgroundType: 'image' as const,
        },
      }

      await saveConfig(nextConfig, businessId, trimmedReason)
      setConfig(nextConfig)
      showToast('อัปโหลดรูปพื้นหลังสำเร็จ', 'บันทึกรูปพื้นหลังเรียบร้อยแล้ว', 'SUCCESS')
    } catch (err: any) {
      setConfig(previousConfig)
      showToast('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถบันทึกรูปพื้นหลังได้', 'ERROR')
    } finally {
      if (e.target) e.target.value = ''
    }
  }

  const handleRemoveAuthBg = async () => {
    const reasonPrompt = window.prompt('กรุณาระบุเหตุผลในการลบรูปพื้นหลังล็อกอิน (จำเป็น):')
    const trimmedReason = reasonPrompt?.trim()
    if (!trimmedReason) {
      if (reasonPrompt !== null) {
        showToast('กรุณาระบุเหตุผล', 'จำเป็นต้องระบุเหตุผลในการแก้ไขการตั้งค่า', 'ERROR')
      }
      return
    }

    const businessId = user?.businessId || '00000000-0000-0000-0000-000000000001'
    const previousConfig = config

    const nextConfig: SystemConfig = {
      ...previousConfig,
      branding: {
        ...previousConfig.branding,
        authBackgroundImageUrl: null,
        authBackgroundType: 'default' as const,
      },
    }

    try {
      await saveConfig(nextConfig, businessId, trimmedReason)
      setConfig(nextConfig)

      if (authBgInputRef.current) {
        authBgInputRef.current.value = ''
      }
      showToast('ลบรูปพื้นหลังแล้ว', 'หน้าเข้าสู่ระบบและจอล็อกจะกลับไปใช้พื้นหลังค่าเริ่มต้น', 'INFO')
    } catch (err: any) {
      setConfig(previousConfig)
      showToast('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถลบรูปพื้นหลังได้', 'ERROR')
    }
  }

  // User Profile Avatar upload handler (Max 2 MB)
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const uploadedUrl = await readFileAsDataUrl(file)
      await updateUserAvatar(uploadedUrl)
      showToast('อัปเดตรูปโปรไฟล์สำเร็จ', `เปลี่ยนรูป Avatar เรียบร้อยแล้ว`, 'SUCCESS')
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถอัปเดตรูปโปรไฟล์ได้', 'ERROR')
    } finally {
      if (e.target) e.target.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      await updateUserAvatar(null)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
      showToast('คืนค่ารูปโปรไฟล์แล้ว', 'ระบบจะแสดงตัวอักษรย่อเป็นตัวแทนรูปโปรไฟล์', 'INFO')
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถลบรูปโปรไฟล์ได้', 'ERROR')
    }
  }

  // App Logo / Icon upload handler (Max 2 MB)
  const handleAppLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reasonPrompt = window.prompt('กรุณาระบุเหตุผลในการเปลี่ยนโลโก้ระบบ (จำเป็น):')
    const trimmedReason = reasonPrompt?.trim()
    if (!trimmedReason) {
      if (reasonPrompt !== null) {
        showToast('กรุณาระบุเหตุผล', 'จำเป็นต้องระบุเหตุผลในการแก้ไขการตั้งค่า', 'ERROR')
      }
      if (e.target) e.target.value = ''
      return
    }

    const businessId = user?.businessId || '00000000-0000-0000-0000-000000000001'
    const previousConfig = config

    try {
      const uploadedUrl = await readFileAsDataUrl(file)

      const nextConfig: SystemConfig = {
        ...previousConfig,
        branding: {
          ...previousConfig.branding,
          appLogoUrl: uploadedUrl,
        },
        business: {
          ...previousConfig.business,
          logoDataUrl: uploadedUrl,
        },
      }

      await saveConfig(nextConfig, businessId, trimmedReason)
      setConfig(nextConfig)

      showToast('อัปโหลดโลโก้สำเร็จ', 'บันทึกโลโก้ระบบเรียบร้อยแล้ว', 'SUCCESS')
    } catch (err: any) {
      setConfig(previousConfig)
      showToast('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถบันทึกโลโก้ได้', 'ERROR')
    } finally {
      if (e.target) e.target.value = ''
    }
  }

  const handleRemoveAppLogo = async () => {
    const reasonPrompt = window.prompt('กรุณาระบุเหตุผลในการลบโลโก้ระบบ (จำเป็น):')
    const trimmedReason = reasonPrompt?.trim()
    if (!trimmedReason) {
      if (reasonPrompt !== null) {
        showToast('กรุณาระบุเหตุผล', 'จำเป็นต้องระบุเหตุผลในการแก้ไขการตั้งค่า', 'ERROR')
      }
      return
    }

    const businessId = user?.businessId || '00000000-0000-0000-0000-000000000001'
    const previousConfig = config

    const nextConfig: SystemConfig = {
      ...previousConfig,
      branding: {
        ...previousConfig.branding,
        appLogoUrl: null,
      },
      business: {
        ...previousConfig.business,
        logoDataUrl: '',
      },
    }

    try {
      await saveConfig(nextConfig, businessId, trimmedReason)
      setConfig(nextConfig)

      if (appLogoInputRef.current) {
        appLogoInputRef.current.value = ''
      }
      showToast('คืนค่าโลโก้เริ่มต้นแล้ว', 'ระบบจะใช้ไอคอนมาตรฐานของ Rental POS', 'INFO')
    } catch (err: any) {
      setConfig(previousConfig)
      showToast('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถลบโลโก้ได้', 'ERROR')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError(null)
    setPwdSuccess(false)
    if (!oldPwd) {
      setPwdError('กรุณากรอกรหัสผ่านเดิม')
      return
    }
    const val = validatePassword(newPwd, { username: user?.username, email: user?.email })
    if (!val.isValid) {
      setPwdError(val.error || 'รหัสผ่านใหม่ไม่ปลอดภัย')
      return
    }
    if (newPwd !== confirmNewPwd) {
      setPwdError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }
    setPwdLoading(true)
    try {
      await changePassword(newPwd)
      setPwdSuccess(true)
      setOldPwd('')
      setNewPwd('')
      setConfirmNewPwd('')
      showToast('เปลี่ยนรหัสผ่านสำเร็จ', 'บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว', 'SUCCESS')
      setTimeout(() => setPwdSuccess(false), 3000)
    } catch (err: any) {
      setPwdError(err?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
    } finally {
      setPwdLoading(false)
    }
  }

  // MFA Handlers
  const handleStartMfaEnroll = async () => {
    setMfaLoading(true)
    setMfaVerifyError(null)
    try {
      const result = await enrollMfaTotp()
      setMfaEnrollData(result)
      setIsEnrollingMfa(true)
      setMfaVerifyCode('')
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถเริ่มต้นตั้งค่า 2FA ได้', 'ERROR')
    } finally {
      setMfaLoading(false)
    }
  }

  const handleVerifyMfaEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaEnrollData?.factorId) return
    const clean = mfaVerifyCode.trim().replace(/\D/g, '')
    if (clean.length !== 6) {
      setMfaVerifyError('กรุณากรอกรหัส 6 หลักจากแอป Authenticator')
      return
    }
    setMfaLoading(true)
    setMfaVerifyError(null)
    try {
      await verifyMfaEnrollment(mfaEnrollData.factorId, clean)
      setIsEnrollingMfa(false)
      setMfaEnrollData(null)
      setMfaVerifyCode('')
      setIsMfaEnrolled(true)
      
      const { data } = await supabase.auth.mfa.listFactors()
      if (data) setMfaFactors(data.all || [])

      showToast('เปิดใช้งาน 2FA สำเร็จ', 'ระบบเปิดใช้งานการยืนยันตัวตนสองชั้นเรียบร้อยแล้ว (ระดับความปลอดภัย AAL2)', 'SUCCESS')
    } catch (err: any) {
      setMfaVerifyError(err?.message || 'รหัสยืนยันไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง')
    } finally {
      setMfaLoading(false)
    }
  }

  const handleCancelMfaEnroll = async () => {
    if (mfaEnrollData?.factorId) {
      try {
        await unenrollMfa(mfaEnrollData.factorId)
      } catch {
        // ignore cleanup error
      }
    }
    setIsEnrollingMfa(false)
    setMfaEnrollData(null)
    setMfaVerifyCode('')
    setMfaVerifyError(null)
  }

  const handleUnenrollMfa = async () => {
    const verifiedFactor = mfaFactors.find((f) => f.status === 'verified')
    if (!verifiedFactor) return
    setMfaLoading(true)
    try {
      await unenrollMfa(verifiedFactor.id)
      setShowUnenrollConfirm(false)
      setIsMfaEnrolled(false)
      setMfaFactors(mfaFactors.filter(f => f.id !== verifiedFactor.id))
      showToast('ปิดใช้งาน 2FA แล้ว', 'ยกเลิกการยืนยันตัวตนสองชั้นเรียบร้อยแล้ว', 'INFO')
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถปิดการใช้งาน 2FA ได้', 'ERROR')
    } finally {
      setMfaLoading(false)
    }
  }

  const handleCopySecret = () => {
    if (!mfaEnrollData?.secret) return
    navigator.clipboard.writeText(mfaEnrollData.secret)
    setCopiedSecret(true)
    showToast('คัดลอกแล้ว', 'คัดลอก Secret Key ไปยังคลิปบอร์ดแล้ว', 'INFO')
    setTimeout(() => setCopiedSecret(false), 2000)
  }

  // Logo upload handler (Max 500 KB, Data URL)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      showToast('ขนาดไฟล์เกินกำหนด', 'ไฟล์โลโก้ต้องมีขนาดไม่เกิน 500 KB', 'ERROR')
      if (e.target) e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setConfig((prev) => ({
        ...prev,
        business: {
          ...prev.business,
          logoDataUrl: dataUrl,
        },
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setConfig((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        logoDataUrl: '',
      },
    }))
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  // Bank QR Code upload handler (Max 500 KB, Data URL)
  const bankQrInputRef = useRef<HTMLInputElement>(null)
  const handleBankQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      showToast('ขนาดไฟล์เกินกำหนด', 'ไฟล์ QR Code ต้องมีขนาดไม่เกิน 500 KB', 'ERROR')
      if (e.target) e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setConfig((prev) => ({
        ...prev,
        business: {
          ...prev.business,
          bankQrDataUrl: dataUrl,
        },
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveBankQr = () => {
    setConfig((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        bankQrDataUrl: '',
      },
    }))
    if (bankQrInputRef.current) {
      bankQrInputRef.current.value = ''
    }
  }

  // Master Category Rules (1 row = 1 Product Category Rule)
  const [categoryRules, setCategoryRules] = useState<ProductCategoryRule[]>([])
  const [ruleNewName, setRuleNewName] = useState('')
  const [ruleNewCalcType, setRuleNewCalcType] = useState<CalculationType>('PER_ROUND')
  const [ruleNewUnit, setRuleNewUnit] = useState('')
  const [ruleEditId, setRuleEditId] = useState<string | null>(null)
  const [ruleEditName, setRuleEditName] = useState('')
  const [ruleEditCalcType, setRuleEditCalcType] = useState<CalculationType>('PER_ROUND')
  const [ruleEditUnit, setRuleEditUnit] = useState('')
  const [ruleDeleteConfirmId, setRuleDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    setCategoryRules(loadCategoryRules())
  }, [])

  const handleRuleAdd = () => {
    const name = ruleNewName.trim()
    const unit = ruleNewUnit.trim()
    if (!name) {
      showToast('กรุณาระบุชื่อหมวดหมู่', 'ชื่อหมวดหมู่ต้องไม่ว่าง', 'ERROR')
      return
    }
    if (!unit) {
      showToast('กรุณาระบุหน่วยนับ', 'หน่วยนับต้องไม่ว่าง', 'ERROR')
      return
    }
    const matched = CALCULATION_OPTIONS.find((c) => c.type === ruleNewCalcType)
    const calculationLabel = matched?.label || 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ'

    const updated = addCategoryRule({
      name,
      calculationType: ruleNewCalcType,
      calculationLabel,
      unit,
    })
    setCategoryRules(updated)
    setRuleNewName('')
    setRuleNewUnit('')
    setRuleNewCalcType('PER_ROUND')
    showToast('เพิ่มชุดกฎสินค้าสำเร็จ', `เพิ่ม "${name}" (${unit}) เข้าระบบเรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleRuleUpdate = (id: string) => {
    const name = ruleEditName.trim()
    const unit = ruleEditUnit.trim()
    if (!name || !unit) {
      showToast('กรุณากรอกข้อมูลให้ครบ', 'ชื่อหมวดหมู่และหน่วยนับต้องไม่เป็นค่าว่าง', 'ERROR')
      return
    }
    const matched = CALCULATION_OPTIONS.find((c) => c.type === ruleEditCalcType)
    const calculationLabel = matched?.label || 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ'

    const updated = updateCategoryRule({
      id,
      name,
      calculationType: ruleEditCalcType,
      calculationLabel,
      unit,
    })
    setCategoryRules(updated)
    setRuleEditId(null)
    setRuleEditName('')
    setRuleEditUnit('')
    showToast('แก้ไขสำเร็จ', `อัปเดต "${name}" เรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleRuleDelete = (id: string) => {
    const updated = deleteCategoryRule(id)
    setCategoryRules(updated)
    setRuleDeleteConfirmId(null)
    showToast('ลบชุดกฎสินค้าสำเร็จ', 'ลบข้อมูลออกจากระบบเรียบร้อยแล้ว', 'SUCCESS')
  }

  // Appointment Types CRUD in Settings
  interface MasterItem {
    id: string
    label: string
  }
  const [appointmentTypes, setAppointmentTypes] = useState<MasterItem[]>([])
  const masterData = {
    addAppointmentType: (label: string) =>
      setAppointmentTypes((prev) => [...prev, { id: `apt-${Date.now()}`, label }]),
    updateAppointmentType: (id: string, label: string) =>
      setAppointmentTypes((prev) => prev.map((a) => (a.id === id ? { ...a, label } : a))),
    removeAppointmentType: (id: string) => setAppointmentTypes((prev) => prev.filter((a) => a.id !== id)),
    appointmentTypes,
  }

  // Appointment Types CRUD in Settings
  const [aptNewTypeName, setAptNewTypeName] = useState('')
  const [aptEditingTypeId, setAptEditingTypeId] = useState<string | null>(null)
  const [aptEditingTypeLabel, setAptEditingTypeLabel] = useState('')
  const [aptDeleteConfirmId, setAptDeleteConfirmId] = useState<string | null>(null)

  const handleAptTypeAdd = () => {
    const label = aptNewTypeName.trim()
    if (!label) return
    masterData.addAppointmentType(label)
    setAptNewTypeName('')
    showToast('เพิ่มประเภทนัดหมายสำเร็จ', `เพิ่ม "${label}" เข้าระบบเรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleAptTypeUpdate = (id: string) => {
    const label = aptEditingTypeLabel.trim()
    if (!label) return
    masterData.updateAppointmentType(id, label)
    setAptEditingTypeId(null)
    setAptEditingTypeLabel('')
    showToast('แก้ไขประเภทนัดหมายสำเร็จ', `อัปเดต "${label}" เรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleAptTypeDelete = (id: string) => {
    masterData.removeAppointmentType(id)
    setAptDeleteConfirmId(null)
    showToast('ลบประเภทนัดหมายสำเร็จ', 'ลบประเภทนัดหมายออกจากระบบเรียบร้อยแล้ว', 'SUCCESS')
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const trimmedBusiness = {
      ...config.business,
      businessName: config.business.businessName.trim(),
      address: config.business.address.trim(),
      phone: config.business.phone.trim(),
      email: config.business.email.trim(),
      lineId: config.business.lineId.trim(),
      authorizedPerson: config.business.authorizedPerson.trim(),
      bankName: config.business.bankName.trim(),
      bankAccountName: config.business.bankAccountName.trim(),
      bankAccountNumber: config.business.bankAccountNumber.trim(),
      promptPayValue: config.business.promptPayValue.trim(),
    }

    if (trimmedBusiness.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedBusiness.email)) {
        showToast('อีเมลไม่ถูกต้อง', 'กรุณาระบุรูปแบบอีเมลให้ถูกต้อง (เช่น name@domain.com)', 'ERROR')
        return
      }
    }

    if (trimmedBusiness.taxId && trimmedBusiness.taxId.length > 13) {
      showToast('เลขผู้เสียภาษีไม่ถูกต้อง', 'เลขประจำตัวผู้เสียภาษีต้องไม่เกิน 13 หลัก', 'ERROR')
      return
    }

    const pm = config.financePayment?.paymentMethods
    if (pm && !pm.cash && !pm.bankTransfer && !pm.promptPay && !pm.credit) {
      showToast('บันทึกไม่สำเร็จ', 'ต้องเปิดใช้งานช่องทางการชำระเงินอย่างน้อย 1 ช่องทาง', 'ERROR')
      return
    }

    const trimmedPrinting = {
      ...config.documentPrinting,
      footerText: (config.documentPrinting?.footerText || '').trim(),
    }

    const sanitizedNotifications: NotificationSettings = {
      deliveryReminder: {
        enabled: !!config.notifications?.deliveryReminder?.enabled,
        daysBefore: Math.max(0, Math.min(365, Math.floor(Number(config.notifications?.deliveryReminder?.daysBefore) || 0))),
      },
      returnReminder: {
        enabled: !!config.notifications?.returnReminder?.enabled,
        daysBefore: Math.max(0, Math.min(365, Math.floor(Number(config.notifications?.returnReminder?.daysBefore) || 0))),
      },
      paymentReminder: {
        enabled: !!config.notifications?.paymentReminder?.enabled,
        daysBefore: Math.max(0, Math.min(365, Math.floor(Number(config.notifications?.paymentReminder?.daysBefore) || 0))),
      },
      lowStockReminder: {
        enabled: !!config.notifications?.lowStockReminder?.enabled,
      },
      overdueReturnReminder: {
        enabled: !!config.notifications?.overdueReturnReminder?.enabled,
      },
    }

    const toSave: SystemConfig = {
      ...config,
      branding: {
        ...config.branding,
        systemName: (config.branding?.systemName || '').trim() || 'JJK_JeeRaKiT',
      },
      business: trimmedBusiness,
      documentPrinting: trimmedPrinting,
      notifications: sanitizedNotifications,
      productStock: {
        ...config.productStock,
        lowStockNotificationEnabled: sanitizedNotifications.lowStockReminder.enabled,
      },
    }

    const businessId = user?.businessId || '00000000-0000-0000-0000-000000000001'
    const reasonPrompt = window.prompt('กรุณาระบุเหตุผลในการแก้ไขการตั้งค่าระบบ (จำเป็น):')
    const trimmedReason = reasonPrompt?.trim()
    if (!trimmedReason) {
      if (reasonPrompt !== null) {
        showToast('กรุณาระบุเหตุผล', 'จำเป็นต้องระบุเหตุผลในการแก้ไขการตั้งค่าระบบ', 'ERROR')
      }
      return
    }

    try {
      await saveConfig(toSave, businessId, trimmedReason)
      setConfig(toSave)
      setIsSaved(true)
      showToast('บันทึกการตั้งค่าสำเร็จ', 'บันทึกการตั้งค่าเรียบร้อยแล้ว', 'SUCCESS')
      setTimeout(() => setIsSaved(false), 2000)
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถบันทึกการตั้งค่าได้', 'ERROR')
    }
  }

  const handleResetDefaults = () => {
    if (activeTab === 'BUSINESS') {
      if (businessSubTab === 'INFO') {
        if (confirm('คุณต้องการคืนค่าข้อมูลกิจการกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
          resetBusinessSettings()
          setConfig((prev) => ({
            ...prev,
            business: DEFAULT_BUSINESS_SETTINGS,
          }))
          showToast('คืนค่าสำเร็จ', 'คืนค่าข้อมูลกิจการเป็นค่าเริ่มต้นเรียบร้อยแล้ว', 'INFO')
        }
        return
      }
      if (businessSubTab === 'BRANDING') {
        if (confirm('คุณต้องการคืนค่าการตั้งค่าแบรนด์และหน้าตาระบบกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
          resetBrandingSettings()
          updateUserAvatar(null)
          setConfig((prev) => ({
            ...prev,
            branding: DEFAULT_BRANDING_SETTINGS,
          }))
          showToast('คืนค่าสำเร็จ', 'คืนค่าการตั้งค่าแบรนด์และหน้าตาระบบเป็นค่าเริ่มต้นเรียบร้อยแล้ว', 'INFO')
        }
        return
      }
    }

    if (activeTab === 'PRODUCTS_STOCK') {
      if (confirm('คุณต้องการคืนค่าการตั้งค่าสินค้าและสต็อกกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
        setConfig((prev) => ({
          ...prev,
          productStock: DEFAULT_PRODUCT_STOCK_SETTINGS,
        }))
        showToast('คืนค่าสำเร็จ', 'คืนค่าการตั้งค่าสินค้าและสต็อกเป็นค่าเริ่มต้นเรียบร้อยแล้ว', 'INFO')
      }
      return
    }

    if (activeTab === 'RENTAL_BILLS') {
      if (confirm('คุณต้องการคืนค่าการตั้งค่าการเช่าและบิลกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
        resetRentalBillingSettings()
        setConfig((prev) => ({
          ...prev,
          rentalBilling: DEFAULT_RENTAL_BILLING_SETTINGS,
        }))
        showToast('คืนค่าสำเร็จ', 'คืนค่าการตั้งค่าการเช่าและบิลเป็นค่าเริ่มต้นเรียบร้อยแล้ว', 'INFO')
      }
      return
    }

    if (activeTab === 'DOCUMENTS') {
      if (documentsSubTab === 'NUMBERS') {
        if (confirm('คุณต้องการคืนค่าการตั้งค่าเลขที่เอกสารกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
          resetDocumentNumberingSettings()
          setConfig((prev) => ({
            ...prev,
            documentNumbering: DEFAULT_DOCUMENT_NUMBERING_SETTINGS,
          }))
          showToast('คืนค่าสำเร็จ', 'คืนค่าการตั้งค่าเลขที่เอกสารเป็นค่าเริ่มต้นเรียบร้อยแล้ว', 'INFO')
        }
        return
      }
      if (documentsSubTab === 'PRINTING') {
        if (confirm('คุณต้องการคืนค่าการตั้งค่าเอกสารและการพิมพ์กลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
          resetDocumentPrintingSettings()
          setConfig((prev) => ({
            ...prev,
            documentPrinting: DEFAULT_DOCUMENT_PRINTING_SETTINGS,
          }))
          showToast('คืนค่าสำเร็จ', 'คืนค่าการตั้งค่าเอกสารและการพิมพ์เป็นค่าเริ่มต้นเรียบร้อยแล้ว', 'INFO')
        }
        return
      }
    }

    if (activeTab === 'FINANCE') {
      if (confirm('คุณต้องการคืนค่าการตั้งค่าการเงินและการชำระเงินกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
        resetFinancePaymentSettings()
        setConfig((prev) => ({
          ...prev,
          financePayment: DEFAULT_FINANCE_PAYMENT_SETTINGS,
        }))
        showToast('คืนค่าสำเร็จ', 'คืนค่าการตั้งค่าการเงินและการชำระเงินเป็นค่าเริ่มต้นเรียบร้อยแล้ว', 'INFO')
      }
      return
    }

    if (activeTab === 'NOTIFICATIONS') {
      if (confirm('คุณต้องการคืนค่าการตั้งค่าการแจ้งเตือนกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
        resetNotificationSettings()
        setConfig((prev) => ({
          ...prev,
          notifications: DEFAULT_NOTIFICATION_SETTINGS,
          productStock: {
            ...prev.productStock,
            lowStockNotificationEnabled: DEFAULT_NOTIFICATION_SETTINGS.lowStockReminder.enabled,
          },
        }))
        showToast('คืนค่าสำเร็จ', 'คืนค่าการตั้งค่าการแจ้งเตือนเป็นค่าเริ่มต้นเรียบร้อยแล้ว', 'INFO')
      }
      return
    }

    if (activeTab === 'SYSTEM_ACCOUNT') {
      if (confirm('คุณต้องการคืนค่าการตั้งค่าบัญชีและความปลอดภัยกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
        setAutoLockDuration('5')
        showToast('คืนค่าสำเร็จ', 'คืนค่าการตั้งค่าความปลอดภัยเป็นค่าเริ่มต้นเรียบร้อยแล้ว', 'INFO')
      }
      return
    }

    if (confirm('คุณต้องการคืนค่าการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      resetConfig()
      showToast('คืนค่าสำเร็จ', 'คืนค่าการตั้งค่าทั้งหมดเป็นค่าเริ่มต้นเรียบร้อยแล้ว', 'INFO')
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-900 text-xs p-2">
      {/* Workspace Card: พื้นที่ทำงานเดียว ครอบแถบหลัก + แถบย่อย + เนื้อหา */}
      <div className="flex-1 min-h-0 min-w-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden flex flex-col">
        {/* แถวที่ 1: แถบหลัก (Main Tabs) */}
        <div className="px-2 sm:px-2.5 py-1.5 sm:py-2 border-b border-slate-200 dark:border-slate-700 shrink-0 flex items-center overflow-x-auto no-scrollbar">
          <div className={TAB_CONTAINER_CLASSES}>
            {[
              { id: 'BUSINESS' as const, label: 'กิจการ', icon: Building },
              { id: 'PRODUCTS_STOCK' as const, label: 'สินค้า / สต็อก', icon: Package },
              { id: 'RENTAL_BILLS' as const, label: 'เช่า / บิล', icon: CalendarDays },
              { id: 'DOCUMENTS' as const, label: 'เอกสาร', icon: FileText },
              { id: 'FINANCE' as const, label: 'การเงิน', icon: CreditCard },
              { id: 'NOTIFICATIONS' as const, label: 'นัดหมาย / แจ้งเตือน', icon: BellRing },
              { id: 'SYSTEM_ACCOUNT' as const, label: 'บัญชี / ระบบ', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`${TAB_BUTTON_BASE_CLASSES} ${
                    isActive ? TAB_BUTTON_ACTIVE_CLASSES : TAB_BUTTON_INACTIVE_CLASSES
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 hidden xl:block" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* แถวที่ 2: แถบย่อย (Subtabs) - แสดงเฉพาะแท็บที่มีแถบย่อย */}
        {activeTab === 'BUSINESS' && (
          <div className="px-2.5 py-1.5 border-b border-slate-200 dark:border-slate-700 shrink-0 flex items-center overflow-x-auto no-scrollbar">
            <div className={TAB_CONTAINER_CLASSES}>
              <button
                type="button"
                onClick={() => setBusinessSubTab('INFO')}
                className={`${TAB_BUTTON_BASE_CLASSES} ${
                  businessSubTab === 'INFO' ? TAB_BUTTON_ACTIVE_CLASSES : TAB_BUTTON_INACTIVE_CLASSES
                }`}
              >
                <Building className="w-3.5 h-3.5 shrink-0" />
                <span>ข้อมูลกิจการ</span>
              </button>
              <button
                type="button"
                onClick={() => setBusinessSubTab('BRANDING')}
                className={`${TAB_BUTTON_BASE_CLASSES} ${
                  businessSubTab === 'BRANDING' ? TAB_BUTTON_ACTIVE_CLASSES : TAB_BUTTON_INACTIVE_CLASSES
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span>แบรนด์และหน้าตาระบบ</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'DOCUMENTS' && (
          <div className="px-2.5 py-1.5 border-b border-slate-200 dark:border-slate-700 shrink-0 flex items-center overflow-x-auto no-scrollbar">
            <div className={TAB_CONTAINER_CLASSES}>
              <button
                type="button"
                onClick={() => setDocumentsSubTab('NUMBERS')}
                className={`${TAB_BUTTON_BASE_CLASSES} ${
                  documentsSubTab === 'NUMBERS' ? TAB_BUTTON_ACTIVE_CLASSES : TAB_BUTTON_INACTIVE_CLASSES
                }`}
              >
                <Hash className="w-3.5 h-3.5 shrink-0" />
                <span>เลขที่เอกสาร</span>
              </button>
              <button
                type="button"
                onClick={() => setDocumentsSubTab('PRINTING')}
                className={`${TAB_BUTTON_BASE_CLASSES} ${
                  documentsSubTab === 'PRINTING' ? TAB_BUTTON_ACTIVE_CLASSES : TAB_BUTTON_INACTIVE_CLASSES
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>รูปแบบและการพิมพ์</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'SYSTEM_ACCOUNT' && (
          <div className="px-2.5 py-1.5 border-b border-slate-200 dark:border-slate-700 shrink-0 flex items-center overflow-x-auto no-scrollbar">
            <div className={TAB_CONTAINER_CLASSES}>
              <button
                type="button"
                onClick={() => setSystemAccountSubTab('SECURITY')}
                className={`${TAB_BUTTON_BASE_CLASSES} ${
                  systemAccountSubTab === 'SECURITY' ? TAB_BUTTON_ACTIVE_CLASSES : TAB_BUTTON_INACTIVE_CLASSES
                }`}
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>บัญชีและความปลอดภัย</span>
              </button>
              <button
                type="button"
                onClick={() => setSystemAccountSubTab('BACKUP')}
                className={`${TAB_BUTTON_BASE_CLASSES} ${
                  systemAccountSubTab === 'BACKUP' ? TAB_BUTTON_ACTIVE_CLASSES : TAB_BUTTON_INACTIVE_CLASSES
                }`}
              >
                <Save className="w-3.5 h-3.5 shrink-0" />
                <span>สำรองข้อมูล</span>
              </button>
            </div>
          </div>
        )}

        {/* แถวที่ 3: เนื้อหาของแท็บปัจจุบัน (Content Area) */}
        <form onSubmit={handleSave} className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden p-2">
          {/* Scrollable Container (internal scroll only, no page-level scroll) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 space-y-2 text-xs">
              
              {/* ================= TAB 1: กิจการ ================= */}
              {activeTab === 'BUSINESS' && (
                <div className="space-y-3">
                  {/* Subtab 1: ข้อมูลกิจการ (INFO) */}
                  {businessSubTab === 'INFO' && (
                    <div className="space-y-2">
                      {/* Logo Section */}
                      <div className="py-6 px-4 space-y-4">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-blue-500" />
                          <span>โลโก้กิจการ</span>
                        </h4>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          {/* Logo Preview Frame */}
                          <div className="w-32 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative">
                            {config.business.logoDataUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={config.business.logoDataUrl}
                                alt="Business Logo Preview"
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <div className="text-center p-2 text-slate-400">
                                <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                                <span className="text-[10px] block">ยังไม่มีโลโก้</span>
                              </div>
                            )}
                          </div>

                          {/* Logo Actions & Guidelines */}
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="file"
                                ref={logoInputRef}
                                onChange={handleLogoUpload}
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => logoInputRef.current?.click()}
                                className="h-9 px-3.5 py-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                              >
                                <Upload className="w-4 h-4" />
                                <span>{config.business.logoDataUrl ? 'เปลี่ยนโลโก้' : 'อัปโหลดโลโก้'}</span>
                              </button>

                              {config.business.logoDataUrl && (
                                <button
                                  type="button"
                                  onClick={handleRemoveLogo}
                                  className="h-9 px-3.5 py-0 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>ลบโลโก้</span>
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              รองรับไฟล์รูปภาพ PNG, JPG, WebP (ขนาดไฟล์ไม่เกิน 500 KB)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* General Business Information */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            ชื่อสถานประกอบการ / ร้านค้า <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={config.business.businessName}
                            onChange={(e) => setConfig({ ...config, business: { ...config.business, businessName: e.target.value } })}
                            placeholder="เช่น เจริญการช่าง สาขาใหญ่"
                            className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            เบอร์โทรศัพท์ติดต่อ
                          </label>
                          <input
                            type="tel"
                            value={config.business.phone}
                            onChange={(e) => setConfig({ ...config, business: { ...config.business, phone: e.target.value } })}
                            placeholder="เช่น 02-123-4567 หรือ 081-234-5678"
                            className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            อีเมลติดต่อ
                          </label>
                          <input
                            type="email"
                            value={config.business.email}
                            onChange={(e) => setConfig({ ...config, business: { ...config.business, email: e.target.value } })}
                            placeholder="เช่น contact@business.com"
                            className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            เลขประจำตัวผู้เสียภาษีอากร (Tax ID)
                          </label>
                          <input
                            type="text"
                            value={config.business.taxId}
                            onChange={(e) => setConfig({ ...config, business: { ...config.business, taxId: e.target.value } })}
                            placeholder="เช่น 0105551234567"
                            className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            ที่อยู่สถานประกอบการ
                          </label>
                          <textarea
                            value={config.business.address}
                            onChange={(e) => setConfig({ ...config, business: { ...config.business, address: e.target.value } })}
                            placeholder="เช่น 123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110"
                            rows={2}
                            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            ชื่อผู้มีอำนาจลงนาม / ผู้จัดการ
                          </label>
                          <input
                            type="text"
                            value={config.business.authorizedPerson}
                            onChange={(e) => setConfig({ ...config, business: { ...config.business, authorizedPerson: e.target.value } })}
                            placeholder="เช่น นายสมชาย ใจดี (ผู้จัดการ)"
                            className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subtab 2: แบรนด์และหน้าตาระบบ (BRANDING) */}
                  {businessSubTab === 'BRANDING' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        {/* CARD 0: ชื่อระบบ (System Name) */}
                        <div className="py-6 px-4 space-y-4">
                          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                ชื่อระบบ
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                กำหนดชื่อระบบหลักสำหรับแสดงผลบนแถบเมนู ส่วนหัว และหน้าจอทั้งหมด
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                ชื่อระบบ
                              </label>
                              <input
                                type="text"
                                value={config.branding?.systemName || ''}
                                onChange={(e) =>
                                  setConfig({
                                    ...config,
                                    branding: {
                                      ...config.branding,
                                      systemName: e.target.value,
                                    },
                                  })
                                }
                                placeholder="JJK_JeeRaKiT"
                                className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* CARD 1: พื้นหลังเข้าสู่ระบบ (Login + PIN Lock Background) */}
                        <div className="py-6 px-4 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-pink-500/10 dark:bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                  พื้นหลังเข้าสู่ระบบและปลดล็อก PIN
                                </h4>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                ref={authBgInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                className="hidden"
                                onChange={handleAuthBgUpload}
                              />
                              <button
                                type="button"
                                onClick={() => authBgInputRef.current?.click()}
                                className="h-9 px-3.5 py-0 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              >
                                <Upload className="w-4 h-4" />
                                <span>{config.branding?.authBackgroundImageUrl ? 'เปลี่ยนรูปพื้นหลัง' : 'อัปโหลดรูปพื้นหลัง'}</span>
                              </button>
                              {config.branding?.authBackgroundImageUrl && (
                                <button
                                  type="button"
                                  onClick={handleRemoveAuthBg}
                                  className="h-9 px-3.5 py-0 rounded-xl bg-slate-200 hover:bg-red-100 dark:bg-slate-700 dark:hover:bg-red-950/60 text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>ลบรูป</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Background Preview Frame */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                ตัวอย่างการแสดงผลบนหน้า Login และ App Lock (Live Preview)
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {config.branding?.authBackgroundImageUrl ? '🟢 กำหนดรูปภาพแล้ว' : '⚪ ค่าเริ่มต้น (Gradient Glow)'}
                              </span>
                            </div>

                            <div className="relative aspect-video sm:aspect-[21/9] w-full rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-md bg-slate-950 flex items-center justify-center">
                              {config.branding?.authBackgroundImageUrl ? (
                                <div
                                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                  style={{ backgroundImage: `url(${config.branding.authBackgroundImageUrl})` }}
                                >
                                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" />
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
                                  <div className="absolute top-1/4 -left-10 w-48 h-48 bg-blue-600/30 rounded-full blur-2xl" />
                                  <div className="absolute bottom-1/4 -right-10 w-48 h-48 bg-indigo-600/30 rounded-full blur-2xl" />
                                </div>
                              )}

                              {/* Mini Lock Mockup Box */}
                              <div className="relative z-10 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 sm:p-4 text-center max-w-xs w-full mx-4 shadow-xl backdrop-blur-md">
                                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white mx-auto mb-1.5 shadow-sm">
                                  <Lock className="w-4 h-4" />
                                </div>
                                <p className="text-xs font-black text-white">{config.business.businessName || 'Rental POS'}</p>
                                <p className="text-[10px] text-slate-400 mb-2">หน้าจอล็อก & เข้าสู่ระบบ</p>
                                <div className="flex justify-center gap-1.5">
                                  {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1.5">
                              * รองรับไฟล์ .jpg, .jpeg, .png, .webp ขนาดไม่เกิน 3 MB ระบบจะครอบและปรับสัดส่วนอัตโนมัติ (Cover & Center)
                            </p>
                          </div>
                        </div>

                        {/* CARD 2: รูปโปรไฟล์ผู้ใช้งาน (User Avatar) */}
                        <div className="py-6 px-4 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                <User className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                  รูปโปรไฟล์ผู้ใช้งาน
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  รูป Avatar ประจำตัวสำหรับบัญชีปัจจุบัน (@{user?.username || user?.email || 'N/A'}) แสดงบนหน้าจอ PIN Lock และส่วนหัวผู้ใช้
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                className="hidden"
                                onChange={handleAvatarUpload}
                              />
                              <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="h-9 px-3.5 py-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              >
                                <Upload className="w-4 h-4" />
                                <span>{user?.avatarUrl ? 'เปลี่ยนรูปโปรไฟล์' : 'อัปโหลดรูปโปรไฟล์'}</span>
                              </button>
                              {user?.avatarUrl && (
                                <button
                                  type="button"
                                  onClick={handleRemoveAvatar}
                                  className="h-9 px-3.5 py-0 rounded-xl bg-slate-200 hover:bg-red-100 dark:bg-slate-700 dark:hover:bg-red-950/60 text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>ลบรูป</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Avatar Preview Area */}
                          <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-blue-400/30 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-500/20 shrink-0 overflow-hidden">
                              {user?.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.avatarUrl} alt={user.fullName || 'User Avatar'} className="w-full h-full object-cover" />
                              ) : (
                                user?.firstName?.[0] || 'ผ'
                              )}
                            </div>

                            <div className="space-y-1 text-center sm:text-left">
                              <div className="flex items-center justify-center sm:justify-start gap-2">
                                <span className="font-black text-sm text-slate-900 dark:text-slate-100">{user?.fullName || 'ผู้ใช้งานระบบ'}</span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold text-[10px]">
                                  @{user?.username || user?.email || 'N/A'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                สิทธิ์การใช้งาน: {user?.role === 'OWNER' ? '👑 เจ้าของร้าน (Owner)' : '💻 พนักงาน (User)'}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {user?.avatarUrl ? '✓ ใช้รูปโปรไฟล์แบบรูปภาพส่วนตัว (แยกอิสระตามแต่ละ User)' : '✓ ใช้ตัวอักษรย่อเป็นตัวแทนรูปโปรไฟล์ (Initial Avatar)'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* CARD 3: โลโก้แอปและไอคอนระบบ (App Logo & System Icon) */}
                        <div className="py-6 px-4 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                                <Building className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                  โลโก้แอปและไอคอนระบบ
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  โลโก้หลักของระบบ ใช้เป็น Favicon บนบราวเซอร์, หัวเมนู Sidebar, และไอคอนสำหรับ Home Screen
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                ref={appLogoInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                className="hidden"
                                onChange={handleAppLogoUpload}
                              />
                              <button
                                type="button"
                                onClick={() => appLogoInputRef.current?.click()}
                                className="h-9 px-3.5 py-0 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              >
                                <Upload className="w-4 h-4" />
                                <span>{config.branding?.appLogoUrl || config.business?.logoDataUrl ? 'เปลี่ยนโลโก้แอป' : 'อัปโหลดโลโก้แอป'}</span>
                              </button>
                              {(config.branding?.appLogoUrl || config.business?.logoDataUrl) && (
                                <button
                                  type="button"
                                  onClick={handleRemoveAppLogo}
                                  className="h-9 px-3.5 py-0 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  <span>คืนค่าเริ่มต้น</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Dual Mockup: PC Browser Tab & Mobile App Icon */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Mockup 1: PC Browser Tab */}
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                                🖥️ ตัวอย่างการแสดงผลบน PC (Browser Tab & Favicon)
                              </span>
                              <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-700/80 shadow-inner">
                                {/* Browser Tab Bar Mockup */}
                                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800">
                                  <div className="flex gap-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                  </div>
                                  <div className="flex-1 bg-slate-800/80 rounded-lg px-2.5 py-1 flex items-center gap-2 max-w-[220px]">
                                    <div className="w-4 h-4 rounded-md overflow-hidden shrink-0 flex items-center justify-center bg-slate-700">
                                      {config.branding?.appLogoUrl || config.business?.logoDataUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={config.branding?.appLogoUrl || config.business?.logoDataUrl} alt="Favicon" className="w-full h-full object-contain" />
                                      ) : (
                                        <Store className="w-3 h-3 text-emerald-400" />
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-200 truncate font-semibold">
                                      {config.branding?.systemName || config.business.businessName || 'JJK_JeeRaKiT'}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-400">Favicon บน Browser จะอัปเดตแบบ Dynamic อัตโนมัติตามโลโก้นี้</p>
                              </div>
                            </div>

                            {/* Mockup 2: Mobile App Icon */}
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                                📱 ตัวอย่างการแสดงผลบน Smartphone (Home Screen Icon)
                              </span>
                              <div className="bg-slate-900 rounded-xl p-3 border border-slate-700/80 flex items-center gap-4 shadow-inner">
                                {/* App Icon Squircle */}
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white shrink-0 overflow-hidden">
                                  {config.branding?.appLogoUrl || config.business?.logoDataUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={config.branding?.appLogoUrl || config.business?.logoDataUrl} alt="App Icon" className="w-full h-full object-contain" />
                                  ) : (
                                    <Store className="w-7 h-7" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-extrabold text-xs text-white">{config.business.businessName || 'Rental POS'}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    ไอคอนสำหรับบันทึกไว้ที่หน้าจอโฮม (PWA / Web App Shortcut)
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            * แนะนำใช้รูปสัดส่วนสี่เหลี่ยมจัตุรัส (Square 512×512 ขึ้นไป) ไฟล์ .png หรือ .webp เพื่อความคมชัดสูงสุด
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 2: สินค้าและสต็อก ================= */}
              {activeTab === 'PRODUCTS_STOCK' && (
                <div className="space-y-2">
                  {/* Section A: Category Rules (1 row = 1 Product Category Rule) */}
                  <div className="space-y-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            ส่วนที่ 1: หมวดหมู่และกฎสินค้า (หมวดหมู่ + รูปแบบคิดเงิน + หน่วยนับ)
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 ml-6">
                          เมื่อเลือกหมวดหมู่ตอนเพิ่มสินค้า ระบบจะดึงรูปแบบการคำนวณและหน่วยนับของชุดกฎนี้ไปใช้ทันที
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                        ทั้งหมด {categoryRules.length} ชุดกฎ
                      </span>
                    </div>

                    {/* Add Rule Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center pt-1">
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={ruleNewName}
                          onChange={(e) => setRuleNewName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleRuleAdd())}
                          placeholder="ชื่อหมวดหมู่ (เช่น แบบคาน, แบบเสา)..."
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <CustomSelect
                          buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                          value={ruleNewCalcType}
                          onChange={(val) => setRuleNewCalcType(val as CalculationType)}
                          options={CALCULATION_OPTIONS.map((opt) => ({
                            value: opt.type,
                            label: opt.label,
                          }))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={ruleNewUnit}
                          onChange={(e) => setRuleNewUnit(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleRuleAdd())}
                          placeholder="หน่วยนับ (เช่น แผ่น, ชิ้น)..."
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <button
                          type="button"
                          onClick={handleRuleAdd}
                          disabled={!ruleNewName.trim() || !ruleNewUnit.trim()}
                          className="w-full h-9 px-3.5 py-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          title="เพิ่มชุดกฎ"
                        >
                          <Plus className="w-4 h-4" />
                          <span>เพิ่ม</span>
                        </button>
                      </div>
                    </div>

                    {/* Category Rules Table: ลำดับ | ชื่อหมวดหมู่ | รูปแบบการคำนวณ | หน่วยนับ | จัดการ */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-xs">
                      <table className="w-full table-fixed text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                            <th className="py-2 px-3 w-12 text-center">ลำดับ</th>
                            <th className="py-2 px-3 w-40">ชื่อหมวดหมู่</th>
                            <th className="py-2 px-3 w-auto">รูปแบบการคำนวณ</th>
                            <th className="py-2 px-3 w-24 text-center">หน่วยนับ</th>
                            <th className="py-2 px-2 w-20 text-center">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                          {categoryRules.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                                ยังไม่มีชุดกฎสินค้าในระบบ
                              </td>
                            </tr>
                          ) : (
                            categoryRules.map((rule, idx) => (
                              <tr
                                key={rule.id}
                                className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                              >
                                {ruleEditId === rule.id ? (
                                  <>
                                    <td className="py-1.5 px-3 text-center font-bold text-slate-500">
                                      {idx + 1}
                                    </td>
                                    <td className="py-1.5 px-2">
                                      <input
                                        type="text"
                                        value={ruleEditName}
                                        onChange={(e) => setRuleEditName(e.target.value)}
                                        className="w-full h-7 px-2.5 py-0 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-xs"
                                        autoFocus
                                      />
                                    </td>
                                    <td className="py-1.5 px-2">
                                      <CustomSelect
                                        buttonClassName="h-7 px-2 py-0 rounded-lg text-xs"
                                        value={ruleEditCalcType}
                                        onChange={(val) => setRuleEditCalcType(val as CalculationType)}
                                        options={CALCULATION_OPTIONS.map((opt) => ({
                                          value: opt.type,
                                          label: opt.label,
                                        }))}
                                      />
                                    </td>
                                    <td className="py-1.5 px-2">
                                      <input
                                        type="text"
                                        value={ruleEditUnit}
                                        onChange={(e) => setRuleEditUnit(e.target.value)}
                                        className="w-full h-7 px-2.5 py-0 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-center font-semibold"
                                      />
                                    </td>
                                    <td className="py-1.5 px-2 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleRuleUpdate(rule.id)}
                                          className="h-7 w-7 p-0 flex items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 cursor-pointer"
                                          title="บันทึก"
                                        >
                                          <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRuleEditId(null)
                                            setRuleEditName('')
                                            setRuleEditUnit('')
                                          }}
                                          className="h-7 w-7 p-0 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 cursor-pointer"
                                          title="ยกเลิก"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                ) : ruleDeleteConfirmId === rule.id ? (
                                  <>
                                    <td className="py-1.5 px-3 text-center font-bold text-slate-500">
                                      {idx + 1}
                                    </td>
                                    <td colSpan={3} className="py-1.5 px-3 text-xs text-red-600 dark:text-red-400 font-bold truncate">
                                      ยืนยันลบชุดกฎ &quot;{rule.name}&quot; ({rule.unit}) หรือไม่?
                                    </td>
                                    <td className="py-1.5 px-2 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleRuleDelete(rule.id)}
                                          className="h-7 px-2.5 py-0 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs cursor-pointer"
                                        >
                                          ลบ
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setRuleDeleteConfirmId(null)}
                                          className="h-7 px-2.5 py-0 rounded-lg border border-slate-300 text-slate-600 font-semibold text-xs cursor-pointer"
                                        >
                                          ยกเลิก
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="py-1.5 px-3 text-center font-bold text-slate-400">
                                      {idx + 1}
                                    </td>
                                    <td className="py-1.5 px-3 font-extrabold text-slate-900 dark:text-slate-100 truncate">
                                      {rule.name}
                                    </td>
                                    <td className="py-1.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate">
                                      {rule.calculationLabel}
                                    </td>
                                    <td className="py-1.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 inline-block">
                                        {rule.unit}
                                      </span>
                                    </td>
                                    <td className="py-1.5 px-2 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRuleEditId(rule.id)
                                            setRuleEditName(rule.name)
                                            setRuleEditCalcType(rule.calculationType)
                                            setRuleEditUnit(rule.unit)
                                            setRuleDeleteConfirmId(null)
                                          }}
                                          className="h-7 w-7 p-0 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                          title="แก้ไข"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRuleDeleteConfirmId(rule.id)
                                            setRuleEditId(null)
                                          }}
                                          className="h-7 w-7 p-0 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                          title="ลบ"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section B: Inventory Configurations */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        ส่วนที่ 2: การควบคุมสต็อกและการเตือน (Stock Behavior & Control)
                      </h4>
                    </div>
                    
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        เกณฑ์เตือนสต็อกขั้นต่ำเริ่มต้น (ชิ้น/ชุด)
                      </label>
                      <NumericInput
                        value={config.productStock.defaultMinimumStock}
                        onChange={(val) =>
                          setConfig({
                            ...config,
                            productStock: {
                              ...config.productStock,
                              defaultMinimumStock: val === '' ? 0 : val,
                            },
                          })
                        }
                        defaultValueOnBlur={0}
                        min={0}
                        allowDecimals={false}
                        className="w-full sm:w-60 h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
                      />
                    </div>

                    <label className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.productStock.allowZeroStock}
                        onChange={(e) => setConfig({ ...config, productStock: { ...config.productStock, allowZeroStock: e.target.checked } })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">อนุญาตสต็อกเป็น 0 (สร้างสินค้าสต็อก 0 ชิ้นได้)</span>
                        <span className="text-[11px] text-slate-400">เมื่อเปิดใช้งาน จะสามารถสร้างสินค้าที่มีจำนวนสต็อกเริ่มต้นเป็น 0 ชิ้นได้</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.productStock.allowBackdatedStockAdjustment}
                        onChange={(e) => setConfig({ ...config, productStock: { ...config.productStock, allowBackdatedStockAdjustment: e.target.checked } })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">อนุญาตปรับสต็อกย้อนหลัง</span>
                        <span className="text-[11px] text-slate-400">อนุญาตให้บันทึกวันที่ทำรายการสต็อกย้อนหลังได้</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.productStock.lowStockNotificationEnabled}
                        onChange={(e) => setConfig({ ...config, productStock: { ...config.productStock, lowStockNotificationEnabled: e.target.checked } })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">เปิดการแจ้งเตือนเมื่อสต็อกต่ำ</span>
                        <span className="text-[11px] text-slate-400">แสดงการแจ้งเตือนเมื่อสต็อกสินค้าพร้อมใช้ต่ำกว่าเกณฑ์ขั้นต่ำ</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: การเช่าและบิล ================= */}
              {activeTab === 'RENTAL_BILLS' && (
                <div className="space-y-2">
                  {/* กลุ่ม A: ค่าเริ่มต้นการเช่า (Rental Defaults) */}
                  <div className="py-6 px-4 space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-emerald-500" />
                      <span>กลุ่ม A: ค่าเริ่มต้นการเช่า (Rental Defaults)</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          รูปแบบการเช่าเริ่มต้น (Default Rental Type)
                        </label>
                        <CustomSelect
                          buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                          value={config.rentalBilling.defaultRentalType}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              rentalBilling: { ...config.rentalBilling, defaultRentalType: String(val) },
                            })
                          }
                          options={
                            categoryRules.length > 0
                              ? categoryRules.map((cr) => ({
                                  value: cr.name,
                                  label: cr.name,
                                  sublabel: cr.calculationLabel,
                                }))
                              : [
                                  { value: 'NORMAL', label: 'เช่าปกติ (ตามรอบสินค้า)' },
                                  { value: 'DAILY', label: 'เช่ารายวัน (Daily Rental)' },
                                ]
                          }
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          จำนวนวันเช่าเริ่มต้น (Default Rental Days)
                        </label>
                        <NumericInput
                          value={config.rentalBilling.defaultRentalDays}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              rentalBilling: {
                                ...config.rentalBilling,
                                defaultRentalDays: val === '' ? 1 : Math.max(1, val),
                              },
                            })
                          }
                          defaultValueOnBlur={1}
                          min={1}
                          allowDecimals={false}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* กลุ่ม B: วิธีการคำนวณและเวลาตัดรอบ (Billing Calculation & Cutoff) */}
                  <div className="py-6 px-4 space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>กลุ่ม B: วิธีการคำนวณและเวลาตัดรอบ (Billing Calculation & Cutoff)</span>
                    </h4>

                    {/* Day Counting Method */}
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        รูปแบบการนับวันเช่า (Day Counting Method)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[
                          {
                            id: 'START_DATE_IS_DAY_ONE',
                            title: 'นับวันเริ่มต้นเป็นวันที่ 1',
                            desc: 'สูตร: วันสิ้นสุด - วันเริ่ม + 1 (เช่น 1 ส.ค. ถึง 1 ส.ค. = 1 วัน)',
                          },
                          {
                            id: 'NIGHTS',
                            title: 'นับตามจำนวนคืน (Nights)',
                            desc: 'สูตร: ผลต่างของวัน/คืน (เช่น 1 ส.ค. ถึง 5 ส.ค. = 4 คืน)',
                          },
                          {
                            id: 'CUSTOM',
                            title: 'กำหนดเองตามสัญญา (Custom)',
                            desc: 'เปิดให้ปรับแต่งจำนวนวันตามข้อตกลง (เก็บค่าการตั้งค่า)',
                          },
                        ].map((item) => (
                          <div
                            key={item.id}
                            onClick={() =>
                              setConfig({
                                ...config,
                                rentalBilling: {
                                  ...config.rentalBilling,
                                  rentalDayCalculation: item.id as any,
                                },
                              })
                            }
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              config.rentalBilling.rentalDayCalculation === item.id
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  config.rentalBilling.rentalDayCalculation === item.id
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : 'border-slate-400'
                                }`}
                              >
                                {config.rentalBilling.rentalDayCalculation === item.id && (
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                )}
                              </span>
                              <span>{item.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 pl-5.5">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Return Cutoff Time (ย้ายมากลุ่ม B) */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        เวลาตัดรอบคืนของประจำวัน (Daily Return Cutoff Time)
                      </label>
                      <div className="max-w-xs">
                        <input
                          type="time"
                          step={60}
                          value={config.rentalBilling.returnCutoffTime}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              rentalBilling: {
                                ...config.rentalBilling,
                                returnCutoffTime: e.target.value || '12:00',
                              },
                            })
                          }
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        ค่าเริ่มต้น 12:00 — หากคืนสินค้าในเช้าวันถัดไปก่อนเวลาตัดรอบนี้ ระบบจะไม่คิดเพิ่มวันเช่า (DAILY)
                      </p>
                    </div>
                  </div>

                  {/* กลุ่ม C: การคืนสินค้าล่าช้าและค่าปรับ (Overdue & Late Return Policy) */}
                  <div className="py-6 px-4 space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>กลุ่ม C: การคืนสินค้าล่าช้าและค่าปรับ (Overdue & Late Return Policy)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Grace Period ผ่อนผันก่อนคิดค่าปรับ (วัน)
                        </label>
                        <NumericInput
                          value={config.rentalBilling.gracePeriodDays}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              rentalBilling: {
                                ...config.rentalBilling,
                                gracePeriodDays: val === '' ? 0 : val,
                              },
                            })
                          }
                          defaultValueOnBlur={0}
                          min={0}
                          allowDecimals={false}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">จำนวนวันหลังกำหนดคืนที่ยังไม่เริ่มคิดค่าปรับ</span>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          วิธีคิดค่าปรับ (Late Fee Mode)
                        </label>
                        <CustomSelect
                          buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                          value={config.rentalBilling.lateFeeMode}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              rentalBilling: {
                                ...config.rentalBilling,
                                lateFeeMode: val as any,
                              },
                            })
                          }
                          options={[
                            { value: 'NONE', label: 'ไม่คิดอัตโนมัติ (None)' },
                            { value: 'FIXED_PER_DAY', label: 'จำนวนเงินคงที่ / วัน (Fixed/Day)' },
                            { value: 'PERCENT_PER_DAY', label: 'เปอร์เซ็นต์ / วัน (% of Daily Rate)' },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {config.rentalBilling.lateFeeMode === 'PERCENT_PER_DAY'
                            ? 'อัตราค่าปรับ (% ต่อวัน)'
                            : 'อัตราค่าปรับ (บาท ต่อวัน)'}
                        </label>
                        <NumericInput
                          value={config.rentalBilling.lateFeeValue}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              rentalBilling: {
                                ...config.rentalBilling,
                                lateFeeValue: val === '' ? 0 : val,
                              },
                            })
                          }
                          defaultValueOnBlur={0}
                          min={0}
                          disabled={config.rentalBilling.lateFeeMode === 'NONE'}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold disabled:opacity-40 text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="flex items-start gap-3 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.rentalBilling.dailyOverdueChargeEnabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              rentalBilling: {
                                ...config.rentalBilling,
                                dailyOverdueChargeEnabled: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 mt-0.5 text-emerald-600 rounded"
                        />
                        <span>
                          <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">คิดค่าเช่ารายวัน (DAILY) เพิ่มเมื่อส่งคืนเกินกำหนด</span>
                          <span className="block mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            เปิด = คำนวณคิดค่าเช่าเพิ่มตามจำนวนวันที่เกินกำหนดส่งคืนจริง (ปิด = ระบบแจ้งเตือนเกินกำหนดเท่านั้น โดยไม่เพิ่มวันคิดเงิน)
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* กลุ่ม D: นโยบายบิลและการจอง (Order & Booking Policies) */}
                  <div className="py-6 px-4 space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span>กลุ่ม D: นโยบายบิลและการจอง (Order & Booking Policies)</span>
                    </h4>

                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.rentalBilling.allowPartialReturn}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              rentalBilling: {
                                ...config.rentalBilling,
                                allowPartialReturn: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">
                            อนุญาตให้ทยอยคืนสินค้าบางส่วน (Partial Return)
                          </span>
                          <span className="text-[11px] text-slate-400">
                            เมื่อปิดใช้งาน ระบบจะไม่อนุญาตให้ยืนยันการคืนหากคืนสินค้าไม่ครบตามจำนวนคงค้าง
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.rentalBilling.allowPartialPayment}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              rentalBilling: {
                                ...config.rentalBilling,
                                allowPartialPayment: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">
                            อนุญาตให้ชำระเงินบางส่วน (Partial Payment)
                          </span>
                          <span className="text-[11px] text-slate-400">
                            เมื่อปิดใช้งาน จำนวนรับชำระจะต้องเท่ากับยอดคงค้างที่ต้องชำระเท่านั้น
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.rentalBilling.allowContinueAfterPaid}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              rentalBilling: {
                                ...config.rentalBilling,
                                allowContinueAfterPaid: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">
                            อนุญาตให้ทำรายการต่อหลังชำระเงินครบแล้ว
                          </span>
                          <span className="text-[11px] text-slate-400">
                            เมื่อเปิดใช้งาน ระบบจะอนุญาตให้ส่งคืนสินค้าหรือแก้ไขรายการแม้ว่าบิลจะชำระครบแล้ว
                          </span>
                        </div>
                      </label>

                      {/* Reservation Expiry Policy */}
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 pt-2">
                        <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-500" />
                          <span>นโยบายการหมดอายุการจองสต็อก (Reservation Expiry Policy)</span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              กฎการหมดอายุการจอง
                            </label>
                            <CustomSelect
                              buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                              value={config.rentalBilling.reservationExpiryPolicy || 'UNTIL_START_DATE'}
                              onChange={(val) =>
                                setConfig({
                                  ...config,
                                  rentalBilling: {
                                    ...config.rentalBilling,
                                    reservationExpiryPolicy: val as any,
                                  },
                                })
                              }
                              options={[
                                { value: 'UNTIL_START_DATE', label: 'คงไว้จนถึงวันเริ่มเช่า / วันรับสินค้า' },
                                { value: 'MANUAL', label: 'คงไว้จนกว่าผู้ใช้จะยกเลิกเอง' },
                                { value: 'DAYS_LIMIT', label: 'หมดอายุหลังจำนวนวันที่กำหนด' },
                              ]}
                            />
                          </div>
                          {config.rentalBilling.reservationExpiryPolicy === 'DAYS_LIMIT' && (
                            <div>
                              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                จำนวนวันที่ให้จองสินค้าได้ (วัน)
                              </label>
                              <NumericInput
                                value={config.rentalBilling.reservationExpiryDays ?? 7}
                                onChange={(val) =>
                                  setConfig({
                                    ...config,
                                    rentalBilling: {
                                      ...config.rentalBilling,
                                      reservationExpiryDays: val === '' ? 1 : Math.max(1, Number(val)),
                                    },
                                  })
                                }
                                defaultValueOnBlur={7}
                                min={1}
                                allowDecimals={false}
                                className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: เอกสาร ================= */}
              {activeTab === 'DOCUMENTS' && (
                <div className="space-y-2">
                  {/* Subtab 1: รูปแบบเลขที่เอกสาร (NUMBERS) */}
                  {documentsSubTab === 'NUMBERS' && (
                    <div className="space-y-2">
                  {(
                    [
                      { key: 'rentalBill', name: 'บิลเช่า / สัญญาเช่า' },
                      { key: 'quotation', name: 'ใบเสนอราคา' },
                      { key: 'receipt', name: 'ใบเสร็จรับเงิน' },
                      { key: 'returnSlip', name: 'ใบรับคืนสินค้า' },
                    ] as { key: 'rentalBill' | 'quotation' | 'receipt' | 'returnSlip'; name: string }[]
                  ).map((doc) => {
                    const dConfig = config.documentNumbering[doc.key]
                    const preview = previewDocumentNumber(dConfig)

                    return (
                      <div key={doc.key} className="py-6 px-4 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100">{doc.name}</h4>
                          <div className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-black text-xs border border-indigo-200 dark:border-indigo-800">
                            ตัวอย่าง: {preview}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">Prefix</label>
                            <input
                              type="text"
                              maxLength={10}
                              value={dConfig.prefix}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  documentNumbering: {
                                    ...config.documentNumbering,
                                    [doc.key]: { ...dConfig, prefix: e.target.value.trim() },
                                  },
                                })
                              }
                              className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-blue-600 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">จำนวนหลัก Running</label>
                            <CustomSelect
                              buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                              value={dConfig.runningDigits}
                              onChange={(val) =>
                                setConfig({
                                  ...config,
                                  documentNumbering: {
                                    ...config.documentNumbering,
                                    [doc.key]: { ...dConfig, runningDigits: parseInt(String(val), 10) || 3 },
                                  },
                                })
                              }
                              options={[
                                { value: 3, label: '3 หลัก (001)' },
                                { value: 4, label: '4 หลัก (0001)' },
                                { value: 5, label: '5 หลัก (00001)' },
                                { value: 6, label: '6 หลัก (000001)' },
                              ]}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">รอบการรีเซ็ตเลข</label>
                            <CustomSelect
                              buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                              value={dConfig.resetCycle}
                              onChange={(val) =>
                                setConfig({
                                  ...config,
                                  documentNumbering: {
                                    ...config.documentNumbering,
                                    [doc.key]: { ...dConfig, resetCycle: val },
                                  },
                                })
                              }
                              options={[
                                { value: 'DAILY', label: 'รายวัน' },
                                { value: 'MONTHLY', label: 'รายเดือน' },
                                { value: 'YEARLY', label: 'รายปี' },
                                { value: 'NEVER', label: 'ไม่รีเซ็ต' },
                              ]}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">รูปแบบปี</label>
                            <CustomSelect
                              buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                              value={dConfig.yearMode}
                              onChange={(val) =>
                                setConfig({
                                  ...config,
                                  documentNumbering: {
                                    ...config.documentNumbering,
                                    [doc.key]: { ...dConfig, yearMode: val },
                                  },
                                })
                              }
                              options={[
                                { value: 'BE', label: 'พ.ศ. (เช่น 2569)' },
                                { value: 'CE', label: 'ค.ศ. (เช่น 2026)' },
                              ]}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">รูปแบบวันที่</label>
                            <CustomSelect
                              buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                              disabled={!dConfig.includeDate}
                              value={dConfig.datePattern}
                              onChange={(val) =>
                                setConfig({
                                  ...config,
                                  documentNumbering: {
                                    ...config.documentNumbering,
                                    [doc.key]: { ...dConfig, datePattern: val },
                                  },
                                })
                              }
                              options={[
                                { value: 'DDMMYYYY', label: 'วันเดือนปี (15082569)' },
                                { value: 'MMYYYY', label: 'เดือนปี (082569)' },
                                { value: 'YYYY', label: 'ปีอย่างเดียว (2569)' },
                              ]}
                            />
                          </div>

                          <div className="flex flex-col justify-end">
                            <label className="flex items-center gap-1.5 py-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={dConfig.includeDate}
                                onChange={(e) =>
                                  setConfig({
                                    ...config,
                                    documentNumbering: {
                                      ...config.documentNumbering,
                                      [doc.key]: { ...dConfig, includeDate: e.target.checked },
                                    },
                                  })
                                }
                                className="w-4 h-4 text-indigo-600 rounded"
                              />
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">ใส่วันที่ในรหัส</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                    </div>
                  )}

                  {/* Subtab 2: รูปแบบและการพิมพ์ (PRINTING) */}
                  {documentsSubTab === 'PRINTING' && (
                    <div className="space-y-2">
                      {/* Section 1: แบบฟอร์มเริ่มต้น */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">แบบฟอร์มเริ่มต้น</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          บิลเช่า
                        </label>
                        <CustomSelect
                          buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                          value={config.documentPrinting.defaultTemplates.rentalBill}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                defaultTemplates: {
                                  ...config.documentPrinting.defaultTemplates,
                                  rentalBill: val,
                                },
                              },
                            })
                          }
                          options={[
                            { value: 'บิลเช่ามาตรฐาน (Standard Rental Bill)', label: 'บิลเช่ามาตรฐาน' },
                            { value: 'บิลเช่าแบบกระชับ (Compact Rental Bill)', label: 'บิลเช่าแบบกระชับ' },
                            { value: 'บิลเช่าพร้อมใบกำกับภาษี (Tax Invoice / Rental Bill)', label: 'บิลเช่าพร้อมใบกำกับภาษี' },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          ใบเสนอราคา
                        </label>
                        <CustomSelect
                          buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                          value={config.documentPrinting.defaultTemplates.quotation}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                defaultTemplates: {
                                  ...config.documentPrinting.defaultTemplates,
                                  quotation: val,
                                },
                              },
                            })
                          }
                          options={[
                            { value: 'ใบเสนอราคามาตรฐาน (Standard Quotation)', label: 'ใบเสนอราคามาตรฐาน' },
                            { value: 'ใบเสนอราคาแบบละเอียด (Detailed Quotation)', label: 'ใบเสนอราคาแบบละเอียด' },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          ใบเสร็จรับเงิน
                        </label>
                        <CustomSelect
                          buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                          value={config.documentPrinting.defaultTemplates.receipt}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                defaultTemplates: {
                                  ...config.documentPrinting.defaultTemplates,
                                  receipt: val,
                                },
                              },
                            })
                          }
                          options={[
                            { value: 'ใบเสร็จรับเงินมาตรฐาน (Standard Receipt)', label: 'ใบเสร็จรับเงินมาตรฐาน' },
                            { value: 'ใบเสร็จรับเงินแบบย่อ (Short Receipt)', label: 'ใบเสร็จรับเงินแบบย่อ' },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          ใบรับคืนสินค้า
                        </label>
                        <CustomSelect
                          buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                          value={config.documentPrinting.defaultTemplates.returnSlip}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                defaultTemplates: {
                                  ...config.documentPrinting.defaultTemplates,
                                  returnSlip: val,
                                },
                              },
                            })
                          }
                          options={[
                            { value: 'ใบรับคืนสินค้ามาตรฐาน (Standard Return Slip)', label: 'ใบรับคืนสินค้ามาตรฐาน' },
                            { value: 'ใบรับคืนพร้อมตรวจสภาพ (Inspection Return Slip)', label: 'ใบรับคืนพร้อมตรวจสภาพ' },
                          ]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: กระดาษและระยะขอบ */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">กระดาษและระยะขอบ</span>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          ขนาดกระดาษ
                        </label>
                        <CustomSelect
                          buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                          value={config.documentPrinting.paperSize}
                          disabled
                          onChange={() => {}}
                          options={[
                            { value: 'A4', label: 'A4 (210 × 297 mm)' },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          บน (มม.)
                        </label>
                        <NumericInput
                          value={config.documentPrinting.margins.top}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                margins: {
                                  ...config.documentPrinting.margins,
                                  top: val === '' ? 0 : Math.min(50, val),
                                },
                              },
                            })
                          }
                          defaultValueOnBlur={0}
                          min={0}
                          max={50}
                          allowDecimals={false}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          ขวา (มม.)
                        </label>
                        <NumericInput
                          value={config.documentPrinting.margins.right}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                margins: {
                                  ...config.documentPrinting.margins,
                                  right: val === '' ? 0 : Math.min(50, val),
                                },
                              },
                            })
                          }
                          defaultValueOnBlur={0}
                          min={0}
                          max={50}
                          allowDecimals={false}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          ล่าง (มม.)
                        </label>
                        <NumericInput
                          value={config.documentPrinting.margins.bottom}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                margins: {
                                  ...config.documentPrinting.margins,
                                  bottom: val === '' ? 0 : Math.min(50, val),
                                },
                              },
                            })
                          }
                          defaultValueOnBlur={0}
                          min={0}
                          max={50}
                          allowDecimals={false}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          ซ้าย (มม.)
                        </label>
                        <NumericInput
                          value={config.documentPrinting.margins.left}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                margins: {
                                  ...config.documentPrinting.margins,
                                  left: val === '' ? 0 : Math.min(50, val),
                                },
                              },
                            })
                          }
                          defaultValueOnBlur={0}
                          min={0}
                          max={50}
                          allowDecimals={false}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: องค์ประกอบเอกสาร */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">องค์ประกอบเอกสาร</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.documentPrinting.showLogo}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                showLogo: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-rose-600 rounded"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">แสดงโลโก้</span>
                          <span className="text-[11px] text-slate-500">แสดงโลโก้กิจการบนหัวเอกสาร (ใช้รูปภาพจากข้อมูลกิจการ)</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.documentPrinting.showQRCode}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                showQRCode: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-rose-600 rounded"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">แสดง QR Code</span>
                          <span className="text-[11px] text-slate-500">แสดง PromptPay QR Code สำหรับชำระเงิน</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.documentPrinting.showAuthorizedPerson}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                showAuthorizedPerson: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-rose-600 rounded"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">แสดงชื่อผู้มีอำนาจลงนาม</span>
                          <span className="text-[11px] text-slate-500">แสดงชื่อผู้ออกบิล / ผู้จัดการใต้ช่องลายเซ็น</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.documentPrinting.showSignature}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                showSignature: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-rose-600 rounded"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">แสดงลายเซ็น</span>
                          <span className="text-[11px] text-slate-500">แสดงลายมือชื่อดิจิทัล (เมื่อมีไฟล์ลายเซ็น)</span>
                        </div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          ข้อความท้ายเอกสาร (Footer Text)
                        </label>
                        <textarea
                          rows={2}
                          value={config.documentPrinting.footerText}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                footerText: e.target.value,
                              },
                            })
                          }
                          placeholder="ระบุข้อความหมายเหตุหรือเงื่อนไขเพิ่มเติมท้ายเอกสาร..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          จำนวนสำเนาเริ่มต้น
                        </label>
                        <NumericInput
                          value={config.documentPrinting.defaultCopies}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              documentPrinting: {
                                ...config.documentPrinting,
                                defaultCopies: val === '' ? 1 : Math.max(1, Math.min(10, val)),
                              },
                            })
                          }
                          defaultValueOnBlur={1}
                          min={1}
                          max={10}
                          allowDecimals={false}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-xs"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">พิมพ์ 1-10 ชุดต่อครั้ง</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

              {/* ================= TAB 5: การเงิน ================= */}
              {activeTab === 'FINANCE' && (
                <div className="space-y-2">
                  {/* Section A: บัญชีรับเงินของร้าน & PromptPay (ยกมาจากหมวดกิจการเดิม) */}
                  <div className="py-6 px-4 space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>ส่วนที่ 1: บัญชีรับเงิน & PromptPay สำหรับรับชำระ</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">ธนาคาร</label>
                        <input
                          type="text"
                          value={config.business.bankName}
                          onChange={(e) => setConfig({ ...config, business: { ...config.business, bankName: e.target.value } })}
                          placeholder="เช่น ธนาคารกสิกรไทย (KBANK)"
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">เลขที่บัญชี</label>
                        <input
                          type="text"
                          value={config.business.bankAccountNumber}
                          onChange={(e) => setConfig({ ...config, business: { ...config.business, bankAccountNumber: e.target.value } })}
                          placeholder="เช่น 045-2-12345-6"
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">ชื่อบัญชี</label>
                        <input
                          type="text"
                          value={config.business.bankAccountName}
                          onChange={(e) => setConfig({ ...config, business: { ...config.business, bankAccountName: e.target.value } })}
                          placeholder="เช่น ร้าน หรือ บจก..."
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-800">
                      <div>
                        <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">ประเภท PromptPay</label>
                        <CustomSelect
                          buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                          value={config.business.promptPayType || ''}
                          onChange={(val) => setConfig({ ...config, business: { ...config.business, promptPayType: val as any } })}
                          options={[
                            { value: '', label: '-- ไม่ระบุประเภท --' },
                            { value: 'PHONE', label: 'เบอร์โทรศัพท์ (Phone Number)' },
                            { value: 'TAX_ID', label: 'เลขประจำตัวผู้เสียภาษี (Tax ID / ID Card)' },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">หมายเลข PromptPay</label>
                        <input
                          type="text"
                          value={config.business.promptPayValue}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '')
                            const maxLen = config.business.promptPayType === 'TAX_ID' ? 13 : 10
                            setConfig({ ...config, business: { ...config.business, promptPayValue: val.slice(0, maxLen) } })
                          }}
                          placeholder={
                            config.business.promptPayType === 'TAX_ID'
                              ? 'เช่น 0105565012345 (13 หลัก)'
                              : config.business.promptPayType === 'PHONE'
                              ? 'เช่น 0812345678 (10 หลัก)'
                              : 'ระบุหมายเลข PromptPay'
                          }
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Bank QR Code Upload */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
                            QR Code รับเงินของธนาคาร (Bank QR Code)
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            รูปภาพ QR Code รับเงินที่ร้านได้รับจากธนาคาร/แอปธนาคาร (รองรับ PNG, JPG, WEBP ขนาดไม่เกิน 500 KB)
                          </span>
                        </div>
                      </div>

                      <input
                        ref={bankQrInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleBankQrUpload}
                        className="hidden"
                      />

                      {config.business.bankQrDataUrl ? (
                        <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-white flex items-center justify-center p-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={config.business.bankQrDataUrl}
                              alt="Bank QR Code"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>มีรูปภาพ QR Code รับเงินแล้ว</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => bankQrInputRef.current?.click()}
                                className="h-9 px-3.5 py-0 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 cursor-pointer"
                              >
                                <Upload className="w-4 h-4" />
                                <span>เปลี่ยน QR</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveBankQr}
                                className="h-9 px-3.5 py-0 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-semibold flex items-center gap-1.5 border border-red-200 dark:border-red-800 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>ลบ QR</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => bankQrInputRef.current?.click()}
                          className="p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-white dark:bg-slate-800 transition-colors"
                        >
                          <QrCode className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            เลือกรูปภาพ QR Code รับเงิน
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section B: ช่องทางรับชำระเงิน (Payment Methods) */}
                  <div className="py-6 px-4 space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-500" />
                      <span>ส่วนที่ 2: ช่องทางการชำระเงินที่เปิดใช้งาน</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.financePayment.paymentMethods.cash}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              financePayment: {
                                ...config.financePayment,
                                paymentMethods: {
                                  ...config.financePayment.paymentMethods,
                                  cash: e.target.checked,
                                },
                              },
                            })
                          }
                          className="w-4 h-4 text-violet-600 rounded"
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">เงินสด</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.financePayment.paymentMethods.bankTransfer}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              financePayment: {
                                ...config.financePayment,
                                paymentMethods: {
                                  ...config.financePayment.paymentMethods,
                                  bankTransfer: e.target.checked,
                                },
                              },
                            })
                          }
                          className="w-4 h-4 text-violet-600 rounded"
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">โอนธนาคาร</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.financePayment.paymentMethods.promptPay}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              financePayment: {
                                ...config.financePayment,
                                paymentMethods: {
                                  ...config.financePayment.paymentMethods,
                                  promptPay: e.target.checked,
                                },
                              },
                            })
                          }
                          className="w-4 h-4 text-violet-600 rounded"
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">PromptPay QR</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.financePayment.paymentMethods.credit}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              financePayment: {
                                ...config.financePayment,
                                paymentMethods: {
                                  ...config.financePayment.paymentMethods,
                                  credit: e.target.checked,
                                },
                              },
                            })
                          }
                          className="w-4 h-4 text-violet-600 rounded"
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">เครดิต / ค้างชำระ</span>
                      </label>
                    </div>
                  </div>

                  {/* Section C: ภาษีและส่วนลด (Tax & Discount Settings) */}
                  <div className="py-6 px-4 space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>ส่วนที่ 3: ภาษีและส่วนลด (Tax & Discount Settings)</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          ภาษีมูลค่าเพิ่มเริ่มต้น (VAT %)
                        </label>
                        <label className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            role="switch"
                            checked={config.financePayment.vatEnabled}
                            onChange={(e) => setConfig((prev) => ({
                              ...prev,
                              financePayment: { ...prev.financePayment, vatEnabled: e.target.checked },
                            }))}
                            className="w-4 h-4 text-violet-600 rounded"
                          />
                          เปิดใช้งาน VAT
                        </label>
                        <NumericInput
                          value={config.financePayment.defaultVatPercent}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              financePayment: {
                                ...config.financePayment,
                                defaultVatPercent: val === '' ? 0 : Math.max(0, Math.min(100, val)),
                              },
                            })
                          }
                          defaultValueOnBlur={0}
                          min={0}
                          max={100}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          ภาษีหัก ณ ที่จ่าย (Withholding %)
                        </label>
                        <NumericInput
                          value={config.financePayment.defaultWithholdingPercent}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              financePayment: {
                                ...config.financePayment,
                                defaultWithholdingPercent: val === '' ? 0 : Math.max(0, Math.min(100, val)),
                              },
                            })
                          }
                          defaultValueOnBlur={0}
                          min={0}
                          max={100}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          ส่วนลดสูงสุดที่อนุญาต (Max Discount %)
                        </label>
                        <NumericInput
                          value={config.financePayment.maximumDiscountPercent}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              financePayment: {
                                ...config.financePayment,
                                maximumDiscountPercent: val === '' ? 0 : Math.max(0, Math.min(100, val)),
                              },
                            })
                          }
                          defaultValueOnBlur={0}
                          min={0}
                          max={100}
                          allowDecimals={false}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          วิธีคิดภาษีมูลค่าเพิ่ม (VAT Mode)
                        </label>
                        <CustomSelect
                          buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                          value={config.financePayment.vatCalculationMode || 'EXCLUSIVE'}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              financePayment: {
                                ...config.financePayment,
                                vatCalculationMode: val as any,
                              },
                            })
                          }
                          options={[
                            { value: 'EXCLUSIVE', label: 'แยกภาษี (Exclusive / เพิ่มจากยอดสินค้า)' },
                            { value: 'INCLUSIVE', label: 'รวมภาษีในราคาสินค้า (Inclusive)' },
                          ]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section D: เงินมัดจำและการเงินอัตโนมัติ (Deposit & Automation) */}
                  <div className="py-6 px-4 space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Save className="w-4 h-4 text-emerald-500" />
                      <span>ส่วนที่ 4: เงินมัดจำและการเงินอัตโนมัติ (Deposit & Automation)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          เงินมัดจำเริ่มต้น (Default Deposit %)
                        </label>
                        <NumericInput
                          value={config.financePayment.defaultDepositPercent}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              financePayment: {
                                ...config.financePayment,
                                defaultDepositPercent: val === '' ? 0 : Math.max(0, Math.min(100, val)),
                              },
                            })
                          }
                          defaultValueOnBlur={0}
                          min={0}
                          max={100}
                          allowDecimals={false}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-3 p-2.5 w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer h-9">
                          <input
                            type="checkbox"
                            checked={config.financePayment.autoCreateFinanceTransaction}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                financePayment: {
                                  ...config.financePayment,
                                  autoCreateFinanceTransaction: e.target.checked,
                                },
                              })
                            }
                            className="w-4 h-4 text-violet-600 rounded"
                          />
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            บันทึกรายการบัญชีการเงินอัตโนมัติเมื่อรับชำระ
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Section E: การปัดเศษทศนิยม (Currency & Rounding) */}
                  <div className="py-6 px-4 space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-indigo-500" />
                      <span>ส่วนที่ 5: การปัดเศษทศนิยม (Currency & Rounding)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          จำนวนทศนิยมยอดเงิน (Money Precision)
                        </label>
                        <NumericInput
                          value={config.financePayment.moneyPrecision ?? 2}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              financePayment: {
                                ...config.financePayment,
                                moneyPrecision: val === '' ? 2 : Math.max(0, Math.min(4, Number(val))),
                              },
                            })
                          }
                          defaultValueOnBlur={2}
                          min={0}
                          max={4}
                          allowDecimals={false}
                          className="w-full h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          กฎการปัดเศษทศนิยม (Rounding Mode)
                        </label>
                        <CustomSelect
                          buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                          value={config.financePayment.roundingMode || 'ROUND_HALF_UP'}
                          onChange={(val) =>
                            setConfig({
                              ...config,
                              financePayment: {
                                ...config.financePayment,
                                roundingMode: val as any,
                              },
                            })
                          }
                          options={[
                            { value: 'ROUND_HALF_UP', label: 'ปัดเศษมาตรฐาน (Half Up)' },
                            { value: 'ROUND_UP', label: 'ปัดขึ้นเสมอ (Round Up)' },
                            { value: 'ROUND_DOWN', label: 'ปัดลง / ตัดทศนิยม (Round Down)' },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 6: นัดหมายและการแจ้งเตือน ================= */}
              {activeTab === 'NOTIFICATIONS' && (
                <div className="space-y-2">
                  {/* Group A: ประเภทการนัดหมาย (Appointment Types) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-teal-600" />
                        <span>กลุ่ม A: ประเภทการนัดหมาย (Appointment Types)</span>
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        ทั้งหมด {masterData.appointmentTypes.length} ประเภท (Master Data)
                      </span>
                    </div>

                    {/* Add New Appointment Type */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ชื่อประเภทนัดหมายใหม่ เช่น 📦 รับสินค้าหน้างาน..."
                        value={aptNewTypeName}
                        onChange={(e) => setAptNewTypeName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAptTypeAdd()
                          }
                        }}
                        className="flex-1 h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAptTypeAdd}
                        className="h-9 px-3.5 py-0 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>เพิ่ม</span>
                      </button>
                    </div>

                    {/* Appointment Types List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {masterData.appointmentTypes.map((type) => (
                        <div
                          key={type.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                        >
                          {aptEditingTypeId === type.id ? (
                            <div className="flex-1 flex items-center gap-1.5">
                              <input
                                autoFocus
                                value={aptEditingTypeLabel}
                                onChange={(e) => setAptEditingTypeLabel(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAptTypeUpdate(type.id)
                                  } else if (e.key === 'Escape') {
                                    setAptEditingTypeId(null)
                                  }
                                }}
                                className="flex-1 h-7 px-2.5 py-0 rounded-lg border border-teal-500 text-xs bg-white dark:bg-slate-800 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleAptTypeUpdate(type.id)}
                                className="h-7 px-2.5 py-0 rounded-lg bg-teal-600 text-white text-xs font-bold shrink-0 cursor-pointer"
                              >
                                บันทึก
                              </button>
                              <button
                                type="button"
                                onClick={() => setAptEditingTypeId(null)}
                                className="h-7 px-2.5 py-0 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold shrink-0 cursor-pointer"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                                {type.label}
                              </span>
                              {aptDeleteConfirmId === type.id ? (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleAptTypeDelete(type.id)}
                                    className="h-7 px-2.5 py-0 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs cursor-pointer"
                                  >
                                    ยืนยันลบ
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setAptDeleteConfirmId(null)}
                                    className="h-7 px-2.5 py-0 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                                  >
                                    ยกเลิก
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAptEditingTypeId(type.id)
                                      setAptEditingTypeLabel(type.label)
                                      setAptDeleteConfirmId(null)
                                    }}
                                    className="h-7 w-7 p-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer"
                                    title="แก้ไขชื่อประเภท"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAptDeleteConfirmId(type.id)
                                      setAptEditingTypeId(null)
                                    }}
                                    className="h-7 w-7 p-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                    title="ลบประเภท"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Group B: การแจ้งเตือนในระบบ (System Alerts) */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <BellRing className="w-3.5 h-3.5 text-teal-600" />
                      <span>กลุ่ม B: การแจ้งเตือนในระบบ (System Alerts)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* 1. กำหนดส่งสินค้า */}
                      <div className="py-2 flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.notifications?.deliveryReminder?.enabled ?? true}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                notifications: {
                                  ...config.notifications,
                                  deliveryReminder: {
                                    ...config.notifications?.deliveryReminder,
                                    enabled: e.target.checked,
                                  },
                                },
                              })
                            }
                            className="w-4 h-4 text-teal-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                              กำหนดส่งสินค้า
                            </span>
                            <span className="text-[11px] text-slate-500">
                              แจ้งเตือนรายการนัดหมายส่งสินค้าล่วงหน้า
                            </span>
                          </div>
                        </label>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] text-slate-500">แจ้งล่วงหน้า</span>
                          <NumericInput
                            value={config.notifications?.deliveryReminder?.daysBefore ?? 1}
                            onChange={(val) => {
                              const num = val === '' ? 0 : Math.min(365, Math.max(0, val))
                              setConfig({
                                ...config,
                                notifications: {
                                  ...config.notifications,
                                  deliveryReminder: {
                                    ...config.notifications?.deliveryReminder,
                                    daysBefore: num,
                                  },
                                },
                              })
                            }}
                            defaultValueOnBlur={1}
                            min={0}
                            max={365}
                            allowDecimals={false}
                            disabled={!config.notifications?.deliveryReminder?.enabled}
                            className="w-12 h-7 px-1.5 py-0 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold text-xs disabled:opacity-50"
                          />
                          <span className="text-[11px] text-slate-500">วัน</span>
                        </div>
                      </div>

                      {/* 2. กำหนดคืนสินค้า */}
                      <div className="py-2 flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.notifications?.returnReminder?.enabled ?? true}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                notifications: {
                                  ...config.notifications,
                                  returnReminder: {
                                    ...config.notifications?.returnReminder,
                                    enabled: e.target.checked,
                                  },
                                },
                              })
                            }
                            className="w-4 h-4 text-teal-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                              กำหนดคืนสินค้า
                            </span>
                            <span className="text-[11px] text-slate-500">
                              แจ้งเตือนบิลที่ใกล้ครบกำหนดรับคืนอุปกรณ์
                            </span>
                          </div>
                        </label>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] text-slate-500">แจ้งล่วงหน้า</span>
                          <NumericInput
                            value={config.notifications?.returnReminder?.daysBefore ?? 1}
                            onChange={(val) => {
                              const num = val === '' ? 0 : Math.min(365, Math.max(0, val))
                              setConfig({
                                ...config,
                                notifications: {
                                  ...config.notifications,
                                  returnReminder: {
                                    ...config.notifications?.returnReminder,
                                    daysBefore: num,
                                  },
                                },
                              })
                            }}
                            defaultValueOnBlur={1}
                            min={0}
                            max={365}
                            allowDecimals={false}
                            disabled={!config.notifications?.returnReminder?.enabled}
                            className="w-12 h-7 px-1.5 py-0 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold text-xs disabled:opacity-50"
                          />
                          <span className="text-[11px] text-slate-500">วัน</span>
                        </div>
                      </div>

                      {/* 3. ค้างชำระ */}
                      <div className="py-2 flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.notifications?.paymentReminder?.enabled ?? true}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                notifications: {
                                  ...config.notifications,
                                  paymentReminder: {
                                    ...config.notifications?.paymentReminder,
                                    enabled: e.target.checked,
                                  },
                                },
                              })
                            }
                            className="w-4 h-4 text-teal-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                              ค้างชำระ
                            </span>
                            <span className="text-[11px] text-slate-500">
                              แจ้งเตือนยอดเงินค้างชำระที่ถึงกำหนด
                            </span>
                          </div>
                        </label>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] text-slate-500">แจ้งล่วงหน้า</span>
                          <NumericInput
                            value={config.notifications?.paymentReminder?.daysBefore ?? 1}
                            onChange={(val) => {
                              const num = val === '' ? 0 : Math.min(365, Math.max(0, val))
                              setConfig({
                                ...config,
                                notifications: {
                                  ...config.notifications,
                                  paymentReminder: {
                                    ...config.notifications?.paymentReminder,
                                    daysBefore: num,
                                  },
                                },
                              })
                            }}
                            defaultValueOnBlur={1}
                            min={0}
                            max={365}
                            allowDecimals={false}
                            disabled={!config.notifications?.paymentReminder?.enabled}
                            className="w-12 h-7 px-1.5 py-0 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold text-xs disabled:opacity-50"
                          />
                          <span className="text-[11px] text-slate-500">วัน</span>
                        </div>
                      </div>

                      {/* 4. สต็อกต่ำ */}
                      <label className="py-2 flex items-center justify-between gap-2.5 cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={config.notifications?.lowStockReminder?.enabled ?? config.productStock?.lowStockNotificationEnabled ?? true}
                            onChange={(e) => {
                              const checked = e.target.checked
                              setConfig({
                                ...config,
                                productStock: {
                                  ...config.productStock,
                                  lowStockNotificationEnabled: checked,
                                },
                                notifications: {
                                  ...config.notifications,
                                  lowStockReminder: {
                                    enabled: checked,
                                  },
                                },
                              })
                            }}
                            className="w-4 h-4 text-teal-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                              สต็อกต่ำ
                            </span>
                            <span className="text-[11px] text-slate-500">
                              แจ้งเตือนเมื่อสินค้าพร้อมใช้ต่ำกว่าขั้นต่ำ
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                          Stock Alert
                        </span>
                      </label>

                      {/* 5. สินค้าค้างคืน/คืนล่าช้า */}
                      <label className="py-2 flex items-center justify-between gap-2.5 cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={config.notifications?.overdueReturnReminder?.enabled ?? true}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                notifications: {
                                  ...config.notifications,
                                  overdueReturnReminder: {
                                    enabled: e.target.checked,
                                  },
                                },
                              })
                            }
                            className="w-4 h-4 text-teal-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                              สินค้าค้างคืน / คืนล่าช้า
                            </span>
                            <span className="text-[11px] text-slate-500">
                              แจ้งเตือนรายการบิลที่เลยกำหนดส่งคืนอุปกรณ์
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold text-[10px]">
                          Overdue Alert
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Group C: LINE Notify / LINE Official Account */}
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>กลุ่ม C: การเชื่อมต่อ LINE Notify / LINE Official Account</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-extrabold text-[10px]">
                        พร้อมใช้งาน
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                          LINE Notify Token / Messaging API Channel Token
                        </label>
                        <div className="relative">
                          <input
                            type={showLineToken ? "text" : "password"}
                            value={config.appointmentsNotifications?.lineNotifyToken || ''}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                appointmentsNotifications: {
                                  ...config.appointmentsNotifications,
                                  lineNotifyToken: e.target.value,
                                },
                              })
                            }
                            className="w-full h-9 pl-3 pr-8 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLineToken(!showLineToken)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 focus:outline-none transition-colors cursor-pointer"
                            aria-label={showLineToken ? "ซ่อน Token" : "แสดง Token"}
                          >
                            {showLineToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                          LINE OA Channel Secret (สำหรับการตอบกลับอัตโนมัติ)
                        </label>
                        <div className="relative">
                          <input
                            type={showLineSecret ? "text" : "password"}
                            value={config.appointmentsNotifications?.lineOaSecret || ''}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                appointmentsNotifications: {
                                  ...config.appointmentsNotifications,
                                  lineOaSecret: e.target.value,
                                },
                              })
                            }
                            className="w-full h-9 pl-3 pr-8 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLineSecret(!showLineSecret)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 focus:outline-none transition-colors cursor-pointer"
                            aria-label={showLineSecret ? "ซ่อน Secret" : "แสดง Secret"}
                          >
                            {showLineSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => { /* No-op or disabled */ }}
                        className="h-9 px-3.5 py-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>⚡ ทดสอบส่งข้อความ LINE แจ้งเตือน (ยังไม่เชื่อม)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 7: บัญชีและระบบ ================= */}
              {activeTab === 'SYSTEM_ACCOUNT' && (
                <div className="space-y-2">
                  {systemAccountSubTab === 'SECURITY' && (
                    <div className="space-y-2">
                      {/* 1. User Profile Information */}
                  <div className="py-6 px-4 space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      <span>ข้อมูลบัญชีผู้ใช้งาน</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-500 mb-0.5 text-[11px]">ชื่อผู้ใช้งาน (Username)</label>
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold font-mono text-slate-900 dark:text-slate-100">
                          @{user?.username || user?.email || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 mb-0.5 text-[11px]">อีเมล (Email สำหรับกู้คืน)</label>
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-slate-100 flex items-center justify-between">
                          <span>{user?.email || 'N/A'}</span>
                          {user?.emailVerified ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                              ยืนยันแล้ว
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">
                              รอการยืนยัน
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 mb-0.5 text-[11px]">ชื่อ-นามสกุล</label>
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-slate-100">
                          {user?.fullName || '-'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 mb-0.5 text-[11px]">บทบาทในระบบ (Role)</label>
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold flex items-center gap-1.5">
                          {user?.role === 'OWNER' ? (
                            <span className="text-emerald-600 dark:text-emerald-400">👑 เจ้าของร้าน / ผู้ดูแลระบบ (OWNER)</span>
                          ) : (
                            <span className="text-indigo-600 dark:text-indigo-400">💻 พนักงาน (USER)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Security: PIN 6-digits App Lock */}
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            การล็อกหน้าจอด้วย PIN 6 หลัก (App Lock)
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            ป้องกันการเข้าใช้งานระบบบนอุปกรณ์นี้โดยไม่ต้องออกจากระบบ
                          </p>
                        </div>
                      </div>

                      <div>
                        {pinEnabled ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>PIN 6 หลัก: เปิดใช้งานแล้ว</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300 font-bold text-xs w-fit inline-block">
                            PIN 6 หลัก: ยังไม่ได้เปิดใช้งาน
                          </span>
                        )}
                      </div>
                    </div>

                    {!pinEnabled && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          ผู้ใช้สามารถเปิดใช้งาน PIN เพื่อล็อกระบบขณะทำงานได้
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPinSetupModal(true)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>เปิดใช้งาน PIN 6 หลัก</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {showPinSetupModal && (
                    <ModalPortal>
                      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="relative w-full max-w-sm">
                          <InitialPinSetupScreen
                            onSuccess={() => {
                              setShowPinSetupModal(false)
                              showToast('เปิดใช้งานสำเร็จ', 'เปิดใช้งาน PIN 6 หลักสำหรับล็อกระบบเรียบร้อยแล้ว', 'SUCCESS')
                            }}
                            onCancel={() => setShowPinSetupModal(false)}
                          />
                        </div>
                      </div>
                    </ModalPortal>
                  )}

                  {/* 3. Two-Factor Authentication (2FA / TOTP) */}
                    <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span>การยืนยันตัวตนสองชั้น (Two-Factor Authentication / TOTP)</span>
                        </span>
                        {isMfaEnrolled ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>เปิดใช้งานแล้ว (AAL2)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">
                            ยังไม่เปิดใช้งาน (AAL1)
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500">
                        เพิ่มความปลอดภัยระดับสูงให้กับบัญชีของคุณด้วย Time-based One-Time Password (TOTP)
                        ผ่านแอปพลิเคชันอย่าง Google Authenticator, Microsoft Authenticator หรือ 1Password
                      </p>

                      {/* Not Enrolled State */}
                      {!isMfaEnrolled && !isEnrollingMfa && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={handleStartMfaEnroll}
                            disabled={mfaLoading}
                            className="h-9 px-3.5 py-0 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>{mfaLoading ? 'กำลังสร้างคำขอ...' : 'เปิดใช้งาน 2-Factor Authentication'}</span>
                          </button>
                        </div>
                      )}

                      {/* Enrollment Step-by-step Flow */}
                      {!isMfaEnrolled && isEnrollingMfa && mfaEnrollData && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                          <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                              <span>ขั้นตอนที่ 1: สแกน QR Code หรือคัดลอก Secret Key</span>
                            </h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              เปิดแอป Authenticator บนมือถือของคุณ แล้วสแกนรูป QR ด้านล่างนี้ หรือพิมพ์คีย์ลับลงในแอป
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* QR Code Preview */}
                            <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={mfaEnrollData.qrCode}
                                alt="TOTP QR Code"
                                className="w-40 h-40 object-contain rounded-xl"
                              />
                            </div>

                            {/* Secret key string */}
                            <div className="flex-1 space-y-2 text-xs w-full">
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                รหัสคีย์ลับ (Secret Key สำหรับพิมพ์เอง)
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] select-all break-all text-slate-900 dark:text-slate-100 font-bold">
                                  {mfaEnrollData.secret}
                                </div>
                                <button
                                  type="button"
                                  onClick={handleCopySecret}
                                  className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                                  title="คัดลอก Secret Key"
                                  aria-label="คัดลอก Secret Key"
                                >
                                  {copiedSecret ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-500">
                                ผู้ให้บริการ: Rental POS &bull; บัญชี: @{user?.username || user?.email || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-3">
                            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <Key className="w-3.5 h-3.5 text-emerald-500" />
                              <span>ขั้นตอนที่ 2: กรอกรหัสยืนยัน 6 หลักเพื่อเปิดใช้งาน</span>
                            </h5>

                            {mfaVerifyError && (
                              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{mfaVerifyError}</span>
                              </div>
                            )}

                            <form onSubmit={handleVerifyMfaEnroll} className="flex flex-wrap items-center gap-2.5">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={mfaVerifyCode}
                                onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-36 h-9 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-center font-mono font-bold tracking-widest text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                autoFocus
                              />
                              <button
                                type="submit"
                                disabled={mfaLoading || mfaVerifyCode.trim().length !== 6}
                                className="h-9 px-3.5 py-0 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {mfaLoading ? 'กำลังตรวจสอบ...' : 'ยืนยันและเปิดใช้งาน 2FA'}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelMfaEnroll}
                                disabled={mfaLoading}
                                className="h-9 px-3.5 py-0 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                              >
                                ยกเลิก
                              </button>
                            </form>
                          </div>
                        </div>
                      )}

                      {/* Enrolled Active State */}
                      {isMfaEnrolled && (
                        <div className="space-y-3 pt-1">
                          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Smartphone className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                                  Authenticator App (TOTP)
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  รับรหัส 6 หลักจากแอปพลิเคชันทุกครั้งเมื่อเข้าสู่ระบบ
                                </span>
                              </div>
                            </div>

                            {!showUnenrollConfirm && (
                              <button
                                type="button"
                                onClick={() => setShowUnenrollConfirm(true)}
                                className="h-9 px-3.5 py-0 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                              >
                                ปิดใช้งาน 2FA
                              </button>
                            )}
                          </div>

                          {showUnenrollConfirm && (
                            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2 animate-in fade-in">
                              <span className="font-bold text-rose-800 dark:text-rose-300 text-xs flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4" />
                                <span>ยืนยันการปิดใช้งาน 2-Factor Authentication?</span>
                              </span>
                              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                                หากปิดใช้งาน ระบบจะลดระดับความปลอดภัยของบัญชีลงเหลือ AAL1 (เข้าสู่ระบบด้วยรหัสผ่านอย่างเดียว)
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={handleUnenrollMfa}
                                  disabled={mfaLoading}
                                  className="h-9 px-3.5 py-0 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {mfaLoading ? 'กำลังดำเนินการ...' : 'ยืนยันปิดใช้งาน 2FA'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowUnenrollConfirm(false)}
                                  disabled={mfaLoading}
                                  className="h-9 px-3.5 py-0 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 4. Change Password Section */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                        <Lock className="w-4 h-4 text-blue-500" />
                        <span>เปลี่ยนรหัสผ่าน Rental POS (Change Password)</span>
                      </span>

                      {pwdError && (
                        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{pwdError}</span>
                        </div>
                      )}

                      {pwdSuccess && (
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">รหัสผ่านเดิม</label>
                          <div className="relative">
                            <input
                              type={showOldPwd ? "text" : "password"}
                              value={oldPwd}
                              onChange={(e) => setOldPwd(e.target.value)}
                              placeholder="••••••••"
                              className="w-full h-9 pl-3 pr-8 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowOldPwd(!showOldPwd)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 focus:outline-none transition-colors cursor-pointer"
                              aria-label={showOldPwd ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                            >
                              {showOldPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">รหัสผ่านใหม่ (อย่างน้อย 12 ตัวอักษร)</label>
                          <div className="relative">
                            <input
                              type={showNewPwd ? "text" : "password"}
                              value={newPwd}
                              onChange={(e) => setNewPwd(e.target.value)}
                              placeholder="••••••••"
                              className="w-full h-9 pl-3 pr-8 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPwd(!showNewPwd)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 focus:outline-none transition-colors cursor-pointer"
                              aria-label={showNewPwd ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                            >
                              {showNewPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">ยืนยันรหัสผ่านใหม่</label>
                          <div className="relative">
                            <input
                              type={showConfirmNewPwd ? "text" : "password"}
                              value={confirmNewPwd}
                              onChange={(e) => setConfirmNewPwd(e.target.value)}
                              placeholder="••••••••"
                              className="w-full h-9 pl-3 pr-8 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmNewPwd(!showConfirmNewPwd)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 focus:outline-none transition-colors cursor-pointer"
                              aria-label={showConfirmNewPwd ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                            >
                              {showConfirmNewPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleChangePassword}
                          disabled={pwdLoading}
                          className="h-9 px-3.5 py-0 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
                        >
                          {pwdLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                        </button>
                      </div>
                    </div>

                    {/* 5. Session Management */}
                    <div className="py-6 px-4 space-y-4">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>เซสชันการใช้งาน</span>
                      </h4>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => logout()}
                          className="h-9 px-3.5 py-0 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>ออกจากระบบปัจจุบัน</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await logout('global')
                              showToast('ออกจากระบบสำเร็จ', 'ออกจากระบบทุกอุปกรณ์ (ยังไม่รองรับ)เรียบร้อยแล้ว', 'INFO')
                            } catch {
                              await logout()
                            }
                          }}
                          className="h-9 px-3.5 py-0 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-indigo-500" />
                          <span>ออกจากระบบทุกอุปกรณ์ (Logout All Devices)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtab 2: สำรองและกู้คืนข้อมูล (BACKUP) */}
                {systemAccountSubTab === 'BACKUP' && (
                  <div className="space-y-2">
                    {/* Manual Local Offline Backup */}
                    <ManualBackupCard />
                  </div>
                )}
              </div>
            )}



            </div>

            {/* Footer Action Area */}
            {!(activeTab === 'SYSTEM_ACCOUNT' && systemAccountSubTab === 'BACKUP') && (
              <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="h-9 px-3.5 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>คืนค่าเดิม</span>
                </button>

                <button
                  type="submit"
                  className={`h-9 px-3.5 py-0 rounded-xl text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-700 shadow-emerald-700/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>บันทึกแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>บันทึกการตั้งค่า</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    )
  }
