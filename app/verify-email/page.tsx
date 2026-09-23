'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, CheckCircle2, Clock, RefreshCw, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type VerifyState = 'CHECKING' | 'VERIFIED' | 'EXPIRED'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerifyState>('CHECKING')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    async function checkStatus() {
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserEmail(user.email ?? null)
        if (user.email_confirmed_at || session) {
          setStatus('VERIFIED')
        } else {
          setStatus('EXPIRED')
        }
      } else {
        // If no user, it might be an invalid or expired link
        setStatus('EXPIRED')
      }
    }
    checkStatus()
  }, [])

  const handleResend = async () => {
    if (!userEmail) return
    setIsResending(true)
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      })
      setResendSuccess(true)
    } catch (e) {
      console.error(e)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/25">
          <Mail className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-xl font-black text-white">ยืนยันที่อยู่อีเมล</h1>
          <p className="text-slate-400 text-xs mt-1">
            การยืนยันอีเมลสำหรับบัญชีผู้ใช้งาน Rental POS
          </p>
        </div>

        {/* State Display */}
        {status === 'CHECKING' && (
          <div className="py-6 space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-300 font-semibold">กำลังตรวจสอบโทเค็นยืนยันอีเมล...</p>
            <p className="text-[11px] text-slate-500">กรุณารอสักครู่ ระบบกำลังสื่อสารกับเซิร์ฟเวอร์</p>
          </div>
        )}

        {status === 'VERIFIED' && (
          <div className="py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ยืนยันอีเมลสำเร็จเรียบร้อย</h3>
              <p className="text-xs text-slate-400 mt-1">
                อีเมลของคุณได้รับการยืนยันแล้ว สามารถเข้าใช้งานระบบ Rental POS ได้ทันที
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              <span>ไปที่หน้าเข้าสู่ระบบ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'EXPIRED' && (
          <div className="py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ลิงก์ยืนยันอีเมลหมดอายุ</h3>
              <p className="text-xs text-slate-400 mt-1">
                ลิงก์นี้หมดอายุการใช้งานหรือถูกใช้งานไปแล้ว กรุณากดปุ่มเพื่อส่งอีเมลยืนยันใหม่อีกครั้ง
              </p>
            </div>

            {resendSuccess ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold">
                ส่งอีเมลยืนยันใหม่ไปยังกล่องจดหมายของคุณเรียบร้อยแล้ว
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'กำลังส่งอีเมล...' : 'ส่งอีเมลยืนยันใหม่อีกครั้ง'}</span>
              </button>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500">
          <p>ระบบยืนยันอีเมลสำหรับเข้าใช้งาน</p>
          <Link href="/login" className="text-blue-400 hover:underline mt-1 inline-block">
            กลับสู่หน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  )
}
