'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, Delete, LogOut, AlertCircle, Eye, EyeOff, ArrowRight, X } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useAppLock } from '@/lib/contexts/AppLockContext'
import { validatePinFormat } from '@/lib/pin-lock'

interface InitialPinSetupScreenProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function InitialPinSetupScreen({ onSuccess, onCancel }: InitialPinSetupScreenProps = {}) {
  const { user, signOut } = useAuth()
  const { setupPin } = useAppLock()

  const [step, setStep] = useState<'create' | 'confirm'>('create')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleKeyPress = useCallback((digit: string) => {
    setErrorMsg(null)
    if (step === 'create') {
      if (pin.length < 6) {
        setPin((prev) => prev + digit)
      }
    } else {
      if (confirmPin.length < 6) {
        setConfirmPin((prev) => prev + digit)
      }
    }
  }, [step, pin.length, confirmPin.length])

  const handleDelete = useCallback(() => {
    setErrorMsg(null)
    if (step === 'create') {
      setPin((prev) => prev.slice(0, -1))
    } else {
      setConfirmPin((prev) => prev.slice(0, -1))
    }
  }, [step])

  const handleClear = useCallback(() => {
    setErrorMsg(null)
    if (step === 'create') {
      setPin('')
    } else {
      setConfirmPin('')
    }
  }, [step])

  // Process Step 1 -> Step 2
  const handleProceedToConfirm = useCallback(() => {
    const val = validatePinFormat(pin)
    if (!val.isValid) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      setErrorMsg(val.error || 'PIN ไม่ปลอดภัย (ห้ามใช้เลขเรียงหรือเลขซ้ำ)')
      return
    }
    setStep('confirm')
    setErrorMsg(null)
  }, [pin])

  // Final Submit
  const handleFinalSubmit = useCallback(async () => {
    if (confirmPin !== pin) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      setErrorMsg('รหัส PIN ยืนยันไม่ตรงกับ PIN ที่ตั้งไว้')
      setConfirmPin('')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      const ok = await setupPin(pin)
      if (ok) {
        onSuccess?.()
      } else {
        throw new Error('ไม่สามารถบันทึก PIN ได้')
      }
    } catch (err: unknown) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      const message = err instanceof Error ? err.message : 'ไม่สามารถบันทึก PIN ได้ กรุณาลองใหม่อีกครั้ง'
      setErrorMsg(message)
      setConfirmPin('')
    } finally {
      setIsSubmitting(false)
    }
  }, [confirmPin, pin, setupPin, onSuccess])

  // Auto transition on 6 digits
  useEffect(() => {
    if (step === 'create' && pin.length === 6) {
      handleProceedToConfirm()
    }
  }, [pin, step, handleProceedToConfirm])

  useEffect(() => {
    if (step === 'confirm' && confirmPin.length === 6 && !isSubmitting) {
      handleFinalSubmit()
    }
  }, [confirmPin, step, isSubmitting, handleFinalSubmit])

  // Keyboard shortcut listener (0-9, Backspace, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key)
      } else if (e.key === 'Backspace') {
        handleDelete()
      } else if (e.key === 'Escape') {
        handleClear()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress, handleDelete, handleClear])

  const currentVal = step === 'create' ? pin : confirmPin

  return (
    <AuthLayout>
      <div className="w-full max-w-sm flex flex-col items-center justify-between py-2">
        {/* Header Info */}
        <div className="w-full flex items-center justify-between pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-500 dark:text-blue-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">Rental POS Security</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">ตั้งค่ารหัส PIN 6 หลัก</span>
            </div>
          </div>

          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>ปิด</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => signOut()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-300 dark:border-slate-700/80 hover:border-rose-300 dark:hover:border-rose-700/50 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${step === 'create' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            1. ตั้งรหัส PIN
          </div>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            2. ยืนยัน PIN
          </div>
        </div>

        {/* User Info */}
        <div className="text-center mb-3 shrink-0">
          <h2 className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight">
            {step === 'create' ? 'ตั้งรหัส PIN 6 หลัก' : 'ยืนยันรหัส PIN 6 หลัก'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {step === 'create'
              ? `สวัสดีคุณ ${user?.displayName || user?.fullName || user?.username || 'ผู้ใช้งาน'} กรุณาตั้ง PIN สำหรับล็อกระบบ`
              : 'กรุณากรอกรหัส PIN 6 หลักเดิมอีกครั้งเพื่อยืนยัน'}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-3 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PIN Indicators Dots */}
        <div className={`flex items-center justify-center gap-2.5 sm:gap-3 my-2 relative ${isShaking ? 'animate-bounce' : ''}`}>
          {Array.from({ length: 6 }).map((_, idx) => {
            const isFilled = idx < currentVal.length
            return (
              <div
                key={idx}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center transition-all duration-200 font-mono font-black text-sm sm:text-base ${
                  isFilled
                    ? 'border-blue-500 bg-blue-500/20 text-blue-600 dark:text-white shadow-md shadow-blue-500/20 scale-105'
                    : 'border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-transparent'
                }`}
              >
                {isFilled ? (showPin ? currentVal[idx] : '•') : ''}
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label={showPin ? "ซ่อน PIN" : "แสดง PIN"}
          >
            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {step === 'confirm' && (
          <button
            type="button"
            onClick={() => {
              setStep('create')
              setConfirmPin('')
              setErrorMsg(null)
            }}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium my-1 underline cursor-pointer"
          >
            ย้อนกลับไปแก้ไข PIN
          </button>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-[280px] mt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleKeyPress(num)}
              className="aspect-square w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-blue-600 active:text-white border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white font-black text-xl sm:text-2xl flex items-center justify-center mx-auto transition-all shadow-xs active:scale-95 disabled:opacity-40 cursor-pointer select-none"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClear}
            className="aspect-square w-14 h-14 sm:w-16 sm:h-16 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 active:bg-slate-200 dark:active:bg-slate-800 text-xs font-bold flex items-center justify-center mx-auto transition-colors disabled:opacity-0 cursor-pointer select-none"
          >
            ล้าง
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleKeyPress('0')}
            className="aspect-square w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-blue-600 active:text-white border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white font-black text-xl sm:text-2xl flex items-center justify-center mx-auto transition-all shadow-xs active:scale-95 disabled:opacity-40 cursor-pointer select-none"
          >
            0
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleDelete}
            className="aspect-square w-14 h-14 sm:w-16 sm:h-16 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 active:bg-slate-200 dark:active:bg-slate-800 flex items-center justify-center mx-auto transition-colors disabled:opacity-0 cursor-pointer select-none"
            aria-label="ลบตัวเลข"
          >
            <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Security rules info */}
        <div className="mt-3 text-center text-[10px] text-slate-500 dark:text-slate-400 max-w-xs space-y-0.5">
          <p>* PIN 6 หลักต้องไม่ใช่เลขซ้ำกันทั้งหมด หรือเลขเรียงติดกัน</p>
          <p>* รหัส PIN จะถูกเข้ารหัสแบบปลอดภัยด้วย Bcrypt ฝั่งเซิร์ฟเวอร์</p>
        </div>

        <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center pt-2 shrink-0">
          Rental POS &copy; {new Date().getFullYear()} - First Login Security Provisioning
        </div>
      </div>
    </AuthLayout>
  )
}
