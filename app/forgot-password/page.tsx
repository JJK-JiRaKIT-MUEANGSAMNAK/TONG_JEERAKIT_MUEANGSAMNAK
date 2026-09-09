'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
  }

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 flex items-center justify-center p-4 overflow-y-auto z-50">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/25 mb-3">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">ลืมรหัสผ่าน</h1>
          <p className="text-slate-400 text-xs mt-1">
            ระบุอีเมลที่คุณใช้ลงทะเบียนเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">ดำเนินการส่งคำขอแล้ว</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
                หาก Email (<span className="text-blue-400 font-semibold">{email}</span>) มีบัญชีอยู่ในระบบ ระบบจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังกล่องจดหมายของคุณ
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้าเข้าสู่ระบบ</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">อีเมลที่ลงทะเบียน</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="somchai@example.com"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
              <Link href="/login" className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับสู่หน้าเข้าสู่ระบบ</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}