'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, Delete, LogOut, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react'

const validatePin = (_p: string) => ({ isValid: true, error: null as string | null })

export function InitialPinSetupScreen() {
  const user = null as any
  const branding = null as any
  const setInitialPin = async (_p: string) => {}
  const logout = () => {}

  const [step, setStep] = useState<'create' | 'confirm'>('create')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bgLoadError, setBgLoadError] = useState(false)

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
    const val = validatePin(pin)
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
      await setInitialPin(pin)
    } catch (err: any) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      setErrorMsg(err?.message || 'ไม่สามารถบันทึก PIN ได้ กรุณาลองใหม่อีกครั้ง')
      setConfirmPin('')
    } finally {
      setIsSubmitting(false)
    }
  }, [confirmPin, pin, setInitialPin])

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

  const activeBg = !bgLoadError && branding?.authBackgroundImageUrl ? branding.authBackgroundImageUrl : null
  const currentVal = step === 'create' ? pin : confirmPin

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] min-h-[100dvh] z-50 bg-[#07111f] flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-300 overflow-hidden">
      {/* Background Image with Dark Overlay */}
      {activeBg && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url(${activeBg})` }}
        >
          <div className="absolute inset-0 bg-[#07111f]/85 backdrop-blur-xs" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeBg}
            alt="background-preloader"
            className="hidden"
            onError={() => setBgLoadError(true)}
          />
        </div>
      )}

      {/* Header Info */}
      <div className="w-full max-w-sm flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-white">Rental POS Security</div>
            <div className="text-[10px] text-slate-400">ตั้งค่าความปลอดภัยครั้งแรก</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-700/50 text-slate-300 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      {/* PIN Card */}
      <div className="w-full max-w-sm flex flex-col items-center justify-center z-10 my-auto py-2 shrink-0">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${step === 'create' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            1. ตั้งรหัส PIN
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            2. ยืนยัน PIN
          </div>
        </div>

        {/* User Info */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-black text-white tracking-tight">
            {step === 'create' ? 'ตั้งรหัส PIN 6 หลัก' : 'ยืนยันรหัส PIN 6 หลัก'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'create'
              ? `สวัสดีคุณ ${user?.fullName || user?.username} กรุณาตั้ง PIN สำหรับล็อกหน้าจอ`
              : 'กรุณากรอกรหัส PIN 6 หลักเดิมอีกครั้งเพื่อยืนยัน'}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PIN Indicators Dots */}
        <div className={`flex items-center justify-center gap-3 my-3 relative ${isShaking ? 'animate-bounce' : ''}`}>
          {Array.from({ length: 6 }).map((_, idx) => {
            const isFilled = idx < currentVal.length
            return (
              <div
                key={idx}
                className={`w-10 h-12 rounded-xl border flex items-center justify-center transition-all duration-200 font-mono font-black text-base ${
                  isFilled
                    ? 'border-blue-400/80 bg-blue-500/20 text-white shadow-lg shadow-blue-500/20 scale-105'
                    : 'border-slate-800/80 bg-slate-900/60 text-transparent'
                }`}
              >
                {isFilled ? (showPin ? currentVal[idx] : '•') : ''}
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute -right-9 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
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
            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium my-1 underline cursor-pointer"
          >
            ย้อนกลับไปแก้ไข PIN
          </button>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px] mt-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleKeyPress(num)}
              className="h-13 rounded-2xl bg-slate-900/80 hover:bg-blue-600/25 active:bg-blue-600/40 border border-slate-800/80 hover:border-blue-500/40 text-white font-black text-lg flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClear}
            className="h-13 rounded-2xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/50 text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          >
            ล้าง
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleKeyPress('0')}
            className="h-13 rounded-2xl bg-slate-900/80 hover:bg-blue-600/25 active:bg-blue-600/40 border border-slate-800/80 hover:border-blue-500/40 text-white font-black text-lg flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
          >
            0
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleDelete}
            className="h-13 rounded-2xl bg-slate-900/40 hover:bg-rose-950/40 border border-slate-800/50 hover:border-rose-700/50 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            aria-label="ลบตัวเลข"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Security rules info */}
        <div className="mt-5 text-center text-[10px] text-slate-500 max-w-xs space-y-1">
          <p>* PIN 6 หลักต้องไม่ใช่เลขซ้ำกันทั้งหมด หรือเลขเรียงติดกัน (เช่น 123456, 111111)</p>
          <p>* รหัส PIN จะถูกเข้ารหัสแบบปลอดภัยด้วย Bcrypt ฝั่งเซิร์ฟเวอร์</p>
        </div>
      </div>

      <div className="text-[10px] text-slate-600 z-10 text-center shrink-0">
        Rental POS &copy; {new Date().getFullYear()} - First Login Security Provisioning
      </div>
    </div>
  )
}
