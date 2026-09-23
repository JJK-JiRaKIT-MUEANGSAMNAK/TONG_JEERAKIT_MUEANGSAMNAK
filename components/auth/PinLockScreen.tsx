'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Lock, Delete, LogOut, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useAppLock } from '@/lib/contexts/AppLockContext'
import { AuthLayout } from '@/components/auth/AuthLayout'

import {
  getPinLockoutState,
  savePinLockoutState,
  clearPinLockoutState,
  getPinLockoutDuration,
  setAppLockedState,
} from '@/lib/pin-lock'

interface PinLockScreenProps {
  onUnlockSuccess?: () => void
}

export function PinLockScreen({ onUnlockSuccess }: PinLockScreenProps) {
  const { user, signOut: logout } = useAuth()
  const { verifyPin, unlockApp } = useAppLock()
  const userId = user?.id || ''

  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutLevel, setLockoutLevel] = useState(0)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize lockout state from persistent sessionStorage for current user
  useEffect(() => {
    if (!userId) return
    const stored = getPinLockoutState(userId)
    setFailedAttempts(stored.failedAttempts)
    setLockoutLevel(stored.lockoutLevel)
    if (stored.lockUntil > Date.now()) {
      const remaining = Math.ceil((stored.lockUntil - Date.now()) / 1000)
      setLockoutSeconds(remaining)
    } else {
      setLockoutSeconds(0)
    }
  }, [userId])

  // Lockout Countdown Timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => (prev > 1 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [lockoutSeconds])

  const isLockedOut = lockoutSeconds > 0

  const handleFailedAttempt = useCallback(
    (customMsg?: string) => {
      if (!userId) return
      const nextFailures = failedAttempts + 1
      let nextLevel = 0
      let duration = 0

      if (nextFailures >= 5) {
        nextLevel = nextFailures === 5 ? 0 : lockoutLevel + 1
        duration = getPinLockoutDuration(nextLevel)
      }

      const lockUntil = duration > 0 ? Date.now() + duration * 1000 : 0

      savePinLockoutState(userId, {
        failedAttempts: nextFailures,
        lockoutLevel: nextLevel,
        lockUntil,
      })

      setFailedAttempts(nextFailures)
      setLockoutLevel(nextLevel)
      setLockoutSeconds(duration)

      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      setPin('')

      if (duration > 0) {
        const displayTime = duration >= 60 ? `${Math.floor(duration / 60)} นาที (${duration} วินาที)` : `${duration} วินาที`
        setErrorMsg(`ใส่ PIN ผิดครบ ${nextFailures} ครั้ง ระบบถูกระงับชั่วคราว ${displayTime}`)
      } else {
        setErrorMsg(customMsg || `PIN ไม่ถูกต้อง (เหลือโอกาสอีก ${5 - nextFailures} ครั้ง)`)
      }
    },
    [userId, failedAttempts, lockoutLevel]
  )

  const handleKeyPress = useCallback(
    async (digit: string) => {
      if (isLockedOut || isSubmitting) return
      if (pin.length >= 6) return

      const nextPin = pin + digit
      setPin(nextPin)
      setErrorMsg(null)

      if (nextPin.length === 6) {
        setIsSubmitting(true)
        try {
          const success = await verifyPin(nextPin)
          if (success) {
            if (userId) {
              clearPinLockoutState(userId)
            }
            setFailedAttempts(0)
            setLockoutLevel(0)
            setLockoutSeconds(0)
            setPin('')
            if (onUnlockSuccess) {
              onUnlockSuccess()
            }
          } else {
            handleFailedAttempt()
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการตรวจสอบ PIN'
          handleFailedAttempt(message)
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [pin, isLockedOut, isSubmitting, verifyPin, onUnlockSuccess, handleFailedAttempt, userId]
  )

  const handleDigitPress = handleKeyPress

  const handleDelete = useCallback(() => {
    if (isLockedOut || isSubmitting) return
    setPin((prev) => prev.slice(0, -1))
    setErrorMsg(null)
  }, [isLockedOut, isSubmitting])

  const handleClear = useCallback(() => {
    if (isLockedOut || isSubmitting) return
    setPin('')
    setErrorMsg(null)
  }, [isLockedOut, isSubmitting])

  // Keyboard shortcut support (0-9, Backspace, Escape)
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

  const handleLogout = async () => {
    if (userId) {
      setAppLockedState(userId, false)
      clearPinLockoutState(userId)
    }
    unlockApp()
    await logout()
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm flex flex-col items-center justify-between py-2 transition-all duration-200">
        {/* Top Header info */}
        <div className="w-full flex items-center justify-between pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-500 dark:text-blue-400 text-xs font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">หน้าจอล็อก (App Lock)</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">กรุณากรอก PIN 6 หลักเพื่อปลดล็อก</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>

        {/* User Identity Display */}
        <div className="text-center space-y-1 mb-2 shrink-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-blue-400/30 flex items-center justify-center text-white text-xl font-black shadow-xl shadow-blue-500/20 mx-auto overflow-hidden">
            {user?.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.avatarUrl} alt={user.fullName || 'User Avatar'} className="w-full h-full object-cover" />
            ) : (
              user?.firstName?.[0] || 'ผ'
            )}
          </div>
          <h2 className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight">
            {user?.displayName || user?.fullName || 'ผู้ใช้งาน'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">@{user?.username || 'user'}</p>
        </div>

        {/* 6 PIN Display / Dots (with Visibility Toggle) */}
        <div className="relative flex items-center justify-center mb-2">
          <div
            className={`flex items-center justify-center gap-2.5 sm:gap-3 py-1 ${
              isShaking ? 'animate-shake' : ''
            }`}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = pin.length > index
              const char = pin[index]
              return (
                <div
                  key={index}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isFilled
                      ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-600 dark:text-white font-mono font-black text-sm shadow-md shadow-blue-500/30'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 text-transparent'
                  }`}
                >
                  {isFilled ? (showPin ? char : '•') : ''}
                </div>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute -right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 focus:outline-none transition-colors cursor-pointer"
            aria-label={showPin ? "ซ่อน PIN" : "แสดง PIN"}
          >
            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Error / Lockout Message */}
        <div className="min-h-[26px] text-center mb-2">
          {lockoutSeconds > 0 ? (
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 px-3 py-1 rounded-xl">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>ระงับการใส่ PIN ชั่วคราว: {lockoutSeconds} วินาที</span>
            </div>
          ) : errorMsg ? (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 px-3 py-1 rounded-xl animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">ใส่รหัส PIN 6 หลักเพื่อเข้าใช้งาน</p>
          )}
        </div>

        {/* Numeric Keypad (1-9, 0) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              disabled={lockoutSeconds > 0 || isSubmitting}
              onClick={() => handleDigitPress(num.toString())}
              aria-label={`ตัวเลข ${num}`}
              className="aspect-square w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-blue-600 active:text-white border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white font-black text-xl sm:text-2xl flex items-center justify-center mx-auto transition-all shadow-xs active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none"
            >
              {num}
            </button>
          ))}

          {/* Bottom row: Clear, 0, Backspace */}
          <button
            type="button"
            disabled={lockoutSeconds > 0 || isSubmitting || pin.length === 0}
            onClick={handleClear}
            className="aspect-square w-14 h-14 sm:w-16 sm:h-16 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 active:bg-slate-200 dark:active:bg-slate-800 text-xs font-bold flex items-center justify-center mx-auto transition-colors disabled:opacity-0 cursor-pointer select-none"
          >
            ล้าง
          </button>

          <button
            type="button"
            disabled={lockoutSeconds > 0 || isSubmitting}
            onClick={() => handleDigitPress('0')}
            aria-label="ตัวเลข 0"
            className="aspect-square w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-blue-600 active:text-white border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white font-black text-xl sm:text-2xl flex items-center justify-center mx-auto transition-all shadow-xs active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none"
          >
            0
          </button>

          <button
            type="button"
            disabled={lockoutSeconds > 0 || isSubmitting || pin.length === 0}
            onClick={handleDelete}
            aria-label="ลบตัวเลข"
            className="aspect-square w-14 h-14 sm:w-16 sm:h-16 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 active:bg-slate-200 dark:active:bg-slate-800 flex items-center justify-center mx-auto transition-colors disabled:opacity-0 cursor-pointer select-none"
          >
            <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center pt-3 pb-1 shrink-0">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Rental POS &bull; เซสชันบัญชีผู้ใช้ปลอดภัย &bull; ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
