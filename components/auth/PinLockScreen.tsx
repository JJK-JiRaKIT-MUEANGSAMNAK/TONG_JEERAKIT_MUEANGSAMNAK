'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Lock, Delete, LogOut, KeyRound, AlertCircle, ShieldAlert, Eye, EyeOff, X } from 'lucide-react'
import { ModalPortal } from '@/components/common/ModalPortal'

const getPinLockoutDuration = (_level: number) => 0
const getStoredLockoutState = () => ({ failedAttempts: 0, lockoutLevel: 0, lockUntil: 0 })
const saveStoredLockoutState = (_state: any) => {}
const clearStoredLockoutState = () => {}

interface PinLockScreenProps {
  onUnlockSuccess?: () => void
}

export function PinLockScreen({ onUnlockSuccess }: PinLockScreenProps) {
  const user = null as any
  const branding = null as any
  const logout = () => {}
  const unlockWithPin = async (_p: string) => true
  const resetPinWithPassword = async (_pwd: string, _np: string) => true
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutLevel, setLockoutLevel] = useState(0)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bgLoadError, setBgLoadError] = useState(false)

  // Forgot PIN Modal state
  const [showForgotPinModal, setShowForgotPinModal] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [newPinInput, setNewPinInput] = useState('')
  const [confirmPinInput, setConfirmPinInput] = useState('')
  const [showModalPassword, setShowModalPassword] = useState(false)
  const [showModalNewPin, setShowModalNewPin] = useState(false)
  const [showModalConfirmPin, setShowModalConfirmPin] = useState(false)
  const [forgotPinError, setForgotPinError] = useState<string | null>(null)
  const [isResettingPin, setIsResettingPin] = useState(false)

  // Initialize lockout state from persistent sessionStorage
  useEffect(() => {
    const stored = getStoredLockoutState()
    setFailedAttempts(stored.failedAttempts)
    setLockoutLevel(stored.lockoutLevel)
    if (stored.lockUntil > Date.now()) {
      const remaining = Math.ceil((stored.lockUntil - Date.now()) / 1000)
      setLockoutSeconds(remaining)
    }
  }, [])

  // Lockout Countdown Timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => (prev > 1 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [lockoutSeconds])

  // Keypad & Keyboard Input Listener
  const isLockedOut = lockoutSeconds > 0

  const handleFailedAttempt = useCallback(
    (customMsg?: string) => {
      const nextFailures = failedAttempts + 1
      let nextLevel = 0
      let duration = 0

      if (nextFailures >= 5) {
        nextLevel = nextFailures === 5 ? 0 : lockoutLevel + 1
        duration = getPinLockoutDuration(nextLevel)
      }

      const lockUntil = duration > 0 ? Date.now() + duration * 1000 : 0

      saveStoredLockoutState({
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
    [failedAttempts, lockoutLevel]
  )

  const handleKeyPress = useCallback(
    async (digit: string) => {
      if (isLockedOut || isSubmitting || showForgotPinModal) return
      if (pin.length >= 6) return

      const nextPin = pin + digit
      setPin(nextPin)
      setErrorMsg(null)

      if (nextPin.length === 6) {
        setIsSubmitting(true)
        try {
          const success = await unlockWithPin(nextPin)
          if (success) {
            clearStoredLockoutState()
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
        } catch (err: any) {
          handleFailedAttempt(err?.message)
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [pin, isLockedOut, isSubmitting, showForgotPinModal, unlockWithPin, onUnlockSuccess, handleFailedAttempt]
  )

  const handleDigitPress = handleKeyPress

  const handleDelete = useCallback(() => {
    if (isLockedOut || isSubmitting || showForgotPinModal) return
    setPin((prev) => prev.slice(0, -1))
    setErrorMsg(null)
  }, [isLockedOut, isSubmitting, showForgotPinModal])

  const handleClear = useCallback(() => {
    if (isLockedOut || isSubmitting || showForgotPinModal) return
    setPin('')
    setErrorMsg(null)
  }, [isLockedOut, isSubmitting, showForgotPinModal])

  // Keyboard shortcut support (0-9, Backspace, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showForgotPinModal) {
        if (e.key === 'Escape' && !isResettingPin) {
          setShowForgotPinModal(false)
          setForgotPinError(null)
        }
        return
      }
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
  }, [handleKeyPress, handleDelete, handleClear, showForgotPinModal, isResettingPin])

  // Handle Forgot PIN with Password Reset
  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPinError(null)

    if (!passwordInput.trim()) {
      setForgotPinError('กรุณากรอกรหัสผ่านบัญชีผู้ใช้')
      return
    }

    if (newPinInput.length !== 6 || !/^\d{6}$/.test(newPinInput)) {
      setForgotPinError('PIN ใหม่ต้องเป็นตัวเลข 6 หลัก')
      return
    }

    if (newPinInput !== confirmPinInput) {
      setForgotPinError('PIN ใหม่และการยืนยัน PIN ไม่ตรงกัน')
      return
    }

    setIsResettingPin(true)
    try {
      const ok = await resetPinWithPassword(passwordInput, newPinInput)
      if (ok) {
        clearStoredLockoutState()
        setFailedAttempts(0)
        setLockoutLevel(0)
        setLockoutSeconds(0)
        setShowForgotPinModal(false)
        setPasswordInput('')
        setNewPinInput('')
        setConfirmPinInput('')
        setPin('')
        if (onUnlockSuccess) {
          onUnlockSuccess()
        }
      } else {
        setForgotPinError('รหัสผ่านไม่ถูกต้อง หรือไม่สามารถรีเซ็ต PIN ได้')
      }
    } catch (err: any) {
      setForgotPinError(err?.message || 'ไม่สามารถรีเซ็ต PIN ได้ กรุณาตรวจสอบรหัสผ่าน')
    } finally {
      setIsResettingPin(false)
    }
  }

  const handleLogout = () => {
    clearStoredLockoutState()
    logout()
  }

  const activeBg = !bgLoadError && branding?.authBackgroundImageUrl ? branding.authBackgroundImageUrl : null

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
            alt=""
            className="hidden"
            onError={() => setBgLoadError(true)}
          />
        </div>
      )}

      {/* Main App Lock Screen Content Wrapper (Dimmed and non-interactive when modal is open) */}
      <div
        className={`w-full h-full flex flex-col items-center justify-between relative z-10 transition-all duration-200 ${
          showForgotPinModal ? 'pointer-events-none select-none opacity-40 filter blur-xs' : ''
        }`}
        aria-hidden={showForgotPinModal ? true : undefined}
      >
        {/* Top Header info */}
        <div className="w-full max-w-sm flex items-center justify-between pt-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 text-xs font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">หน้าจอล็อก (App Lock)</span>
              <span className="text-[10px] text-slate-400">กรุณากรอก PIN 6 หลักเพื่อปลดล็อก</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            tabIndex={showForgotPinModal ? -1 : 0}
            disabled={showForgotPinModal}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="ออกจากระบบ"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>

        {/* Center PIN Area */}
        <div className="flex flex-col items-center justify-center max-w-xs w-full my-auto space-y-6">
          {/* User Identity Display */}
          <div className="text-center space-y-1.5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-blue-400/30 flex items-center justify-center text-white text-xl font-black shadow-xl shadow-blue-500/20 mx-auto overflow-hidden">
              {user?.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.avatarUrl} alt={user.fullName || 'User Avatar'} className="w-full h-full object-cover" />
              ) : (
                user?.firstName?.[0] || 'ผ'
              )}
            </div>
            <h2 className="text-lg font-black text-white">{user?.fullName || 'ผู้จัดการ เจ้าของกิจการ'}</h2>
            <p className="text-xs text-slate-400">@{user?.username || 'owner'}</p>
          </div>

          {/* 6 PIN Display / Dots (with Visibility Toggle) */}
          <div className="relative flex items-center justify-center">
            <div
              className={`flex items-center justify-center gap-3 py-2 ${
                isShaking ? 'animate-shake' : ''
              }`}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const isFilled = pin.length > index
                const char = pin[index]
                return (
                  <div
                    key={index}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isFilled
                        ? 'bg-blue-500/20 border-2 border-blue-500 text-white font-mono font-black text-sm shadow-md shadow-blue-500/30'
                        : 'bg-slate-800/80 border-2 border-slate-700 text-transparent'
                    }`}
                  >
                    {isFilled ? (showPin ? char : '•') : ''}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              tabIndex={showForgotPinModal ? -1 : 0}
              disabled={showForgotPinModal}
              onClick={() => setShowPin(!showPin)}
              className="absolute -right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1.5 focus:outline-none transition-colors cursor-pointer disabled:opacity-50"
              aria-label={showPin ? "ซ่อน PIN" : "แสดง PIN"}
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error / Lockout Message */}
          <div className="min-h-[28px] text-center">
            {lockoutSeconds > 0 ? (
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-950/40 border border-amber-900 px-3 py-1 rounded-xl">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>ระงับการใส่ PIN ชั่วคราว: {lockoutSeconds} วินาที</span>
              </div>
            ) : errorMsg ? (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-950/40 border border-rose-900 px-3 py-1 rounded-xl animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">ใส่รหัส PIN 6 หลักเพื่อเข้าใช้งาน</p>
            )}
          </div>

          {/* Numeric Keypad (1-9, 0) */}
          <div className="grid grid-cols-3 gap-3.5 w-full max-w-[280px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                tabIndex={showForgotPinModal ? -1 : 0}
                disabled={lockoutSeconds > 0 || isSubmitting || showForgotPinModal}
                onClick={() => handleDigitPress(num.toString())}
                aria-label={`ตัวเลข ${num}`}
                className="aspect-square w-16 h-16 rounded-full bg-slate-800/80 hover:bg-slate-700 active:bg-blue-600 border border-slate-700/80 text-white font-black text-2xl flex items-center justify-center mx-auto transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none"
              >
                {num}
              </button>
            ))}

            {/* Bottom row: Clear, 0, Backspace */}
            <button
              type="button"
              tabIndex={showForgotPinModal ? -1 : 0}
              disabled={lockoutSeconds > 0 || isSubmitting || pin.length === 0 || showForgotPinModal}
              onClick={handleClear}
              className="aspect-square w-16 h-16 rounded-full text-slate-400 hover:text-slate-200 active:bg-slate-800 text-xs font-bold flex items-center justify-center mx-auto transition-colors disabled:opacity-0 cursor-pointer select-none"
            >
              ล้าง
            </button>

            <button
              type="button"
              tabIndex={showForgotPinModal ? -1 : 0}
              disabled={lockoutSeconds > 0 || isSubmitting || showForgotPinModal}
              onClick={() => handleDigitPress('0')}
              aria-label="ตัวเลข 0"
              className="aspect-square w-16 h-16 rounded-full bg-slate-800/80 hover:bg-slate-700 active:bg-blue-600 border border-slate-700/80 text-white font-black text-2xl flex items-center justify-center mx-auto transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none"
            >
              0
            </button>

            <button
              type="button"
              tabIndex={showForgotPinModal ? -1 : 0}
              disabled={lockoutSeconds > 0 || isSubmitting || pin.length === 0 || showForgotPinModal}
              onClick={handleDelete}
              aria-label="ลบตัวเลข"
              className="aspect-square w-16 h-16 rounded-full text-slate-400 hover:text-slate-200 active:bg-slate-800 flex items-center justify-center mx-auto transition-colors disabled:opacity-0 cursor-pointer select-none"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>

          {/* Forgot PIN Link */}
          <button
            type="button"
            tabIndex={showForgotPinModal ? -1 : 0}
            disabled={showForgotPinModal}
            onClick={() => setShowForgotPinModal(true)}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer pt-2 flex items-center gap-1.5 disabled:opacity-50"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>ลืมรหัส PIN? ปลดล็อกด้วยรหัสผ่าน</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center pb-2 shrink-0">
          <p className="text-[10px] text-slate-500">
            Rental POS &bull; เซสชันบัญชีผู้ใช้ปลอดภัย &bull; ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต
          </p>
        </div>
      </div>

      {/* Forgot PIN Re-auth Modal Portaled on Top Layer */}
      {showForgotPinModal && (
        <ModalPortal>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-pin-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isResettingPin) {
                setShowForgotPinModal(false)
                setForgotPinError(null)
              }
            }}
            className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ width: 'min(560px, calc(100vw - 32px))' }}
              className="w-full max-w-[560px] max-h-[calc(100dvh-32px)] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-150 my-auto"
            >
              {/* Modal Header */}
              <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/90">
                <h3 id="forgot-pin-modal-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <span>ยืนยันตัวตนเพื่อตั้ง PIN ใหม่</span>
                </h3>
                <button
                  type="button"
                  disabled={isResettingPin}
                  onClick={() => {
                    setShowForgotPinModal(false)
                    setForgotPinError(null)
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body & Form */}
              <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4">
                {forgotPinError && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-400 text-xs font-semibold animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotPinError}</span>
                  </div>
                )}

                <form id="reset-pin-form" onSubmit={handleResetPinSubmit} className="space-y-4 text-xs">
                  {/* Account Password Field */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      รหัสผ่าน Rental POS ของคุณ (@{user?.username || 'user'})
                    </label>
                    <div className="relative">
                      <input
                        type={showModalPassword ? "text" : "password"}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="กรอกรหัสผ่านเพื่อยืนยันสิทธิ์"
                        autoFocus
                        disabled={isResettingPin}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowModalPassword(!showModalPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 focus:outline-none transition-colors cursor-pointer"
                        aria-label={showModalPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      >
                        {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New PIN & Confirm PIN Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">PIN 6 หลักใหม่</label>
                      <div className="relative">
                        <input
                          type={showModalNewPin ? "text" : "password"}
                          maxLength={6}
                          value={newPinInput}
                          onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                          placeholder={showModalNewPin ? "000000" : "••••••"}
                          disabled={isResettingPin}
                          className="w-full pl-3.5 pr-8 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-center font-mono tracking-widest text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowModalNewPin(!showModalNewPin)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 focus:outline-none transition-colors cursor-pointer"
                          aria-label={showModalNewPin ? "ซ่อน PIN" : "แสดง PIN"}
                        >
                          {showModalNewPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">ยืนยัน PIN ใหม่</label>
                      <div className="relative">
                        <input
                          type={showModalConfirmPin ? "text" : "password"}
                          maxLength={6}
                          value={confirmPinInput}
                          onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                          placeholder={showModalConfirmPin ? "000000" : "••••••"}
                          disabled={isResettingPin}
                          className="w-full pl-3.5 pr-8 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-center font-mono tracking-widest text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowModalConfirmPin(!showModalConfirmPin)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 focus:outline-none transition-colors cursor-pointer"
                          aria-label={showModalConfirmPin ? "ซ่อน PIN" : "แสดง PIN"}
                        >
                          {showModalConfirmPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="shrink-0 px-5 sm:px-6 py-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isResettingPin}
                  onClick={() => {
                    setShowForgotPinModal(false)
                    setForgotPinError(null)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  form="reset-pin-form"
                  disabled={isResettingPin}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isResettingPin ? 'กำลังบันทึก...' : 'ตั้ง PIN ใหม่และปลดล็อก'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
