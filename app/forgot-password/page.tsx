'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { resetPasswordForEmail } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    try {
      const result = await resetPasswordForEmail(email)
      if (result.success) {
        setIsSubmitted(true)
      } else {
        setError(result.error || 'เกิดข้อผิดพลาดในการส่งลิงก์')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-4">
        <div className="text-left space-y-1">
          <h2 className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight">
            ลืมรหัสผ่าน
          </h2>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">ดำเนินการส่งคำขอแล้ว</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                หาก Email (<span className="text-blue-600 dark:text-blue-400 font-semibold">{email}</span>) มีบัญชีอยู่ในระบบ ระบบจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังกล่องจดหมายของคุณ
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้าเข้าสู่ระบบ</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">อีเมลที่ลงทะเบียน</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="somchai@example.com"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-xs rounded-xl border border-blue-500 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              {isSubmitting ? (
                <span>กำลังส่งคำขอ...</span>
              ) : (
                <>
                  <span>ส่งลิงก์รีเซ็ตรหัสผ่าน</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1.5 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับสู่หน้าเข้าสู่ระบบ</span>
              </Link>
            </div>
          </form>
        )}

        <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 pt-3 border-t border-slate-200 dark:border-slate-800">
          Rental POS &copy; {new Date().getFullYear()} - All rights reserved
        </p>
      </div>
    </AuthLayout>
  )
}