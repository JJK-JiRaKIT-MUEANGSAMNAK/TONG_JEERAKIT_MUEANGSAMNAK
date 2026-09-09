'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Store, AlertCircle, Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const isRegistered = searchParams.get('registered') === '1'
  const sessionExpired = searchParams.get('reason') === 'session-expired'
  const isPendingApproval = searchParams.get('reason') === 'pending-approval'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
  }

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 flex items-center justify-center p-4 overflow-y-auto z-50">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/25 mb-3 overflow-hidden">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Rental POS</h1>
        </div>

        {isRegistered && !error && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>สมัครสมาชิกสำเร็จ กรุณายืนยันอีเมลจริงของคุณก่อนเข้าสู่ระบบ</span>
          </div>
        )}

        {sessionExpired && !error && (
          <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-amber-300 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>เซสชันหมดอายุหรือถูกยกเลิก กรุณาเข้าสู่ระบบใหม่</span>
          </div>
        )}

        {isPendingApproval && !error && (
          <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-amber-300 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>บัญชีนี้ยังไม่ได้รับสิทธิ์เข้าธุรกิจ กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มสิทธิ์เข้าใช้งาน</span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">ชื่อผู้ใช้งาน (Username)</label>
            <div className="relative">
              <span className="text-slate-500 font-bold absolute left-3.5 top-1/2 -translate-y-1/2">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-300">รหัสผ่าน</label>
              <Link href="/forgot-password" className="text-[11px] text-blue-400 hover:text-blue-300 font-medium">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 focus:outline-none transition-colors cursor-pointer"
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-xs rounded-xl border border-blue-500 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-1 shadow-lg shadow-blue-500/20"
          >
            {isLoading ? <span>กำลังเข้าสู่ระบบ...</span> : <><span>เข้าสู่ระบบ</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="text-center mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400">
          ยังไม่มีบัญชีผู้ใช้งาน?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold underline">สมัครสมาชิก</Link>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-4">
          Rental POS &copy; {new Date().getFullYear()} - All rights reserved
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-semibold">กำลังโหลด...</div>}>
      <LoginForm />
    </Suspense>
  )
}