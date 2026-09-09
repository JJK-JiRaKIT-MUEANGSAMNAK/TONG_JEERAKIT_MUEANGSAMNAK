import React from 'react'
import Link from 'next/link'
import { FileQuestion, ArrowLeft, Store } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 mb-6">
        <FileQuestion className="w-8 h-8" />
      </div>

      <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3">ไม่พบหน้าที่คุณต้องการ</h2>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        ขออภัย ไม่พบหน้าเว็บที่คุณกำลังเข้าถึง หรือหน้านี้อาจถูกย้าย/ลบออกจากระบบแล้ว
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
        >
          <Store className="w-4 h-4" />
          <span>กลับไปยังหน้าแดชบอร์ด</span>
        </Link>
        <Link
          href="/pos"
          className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังหน้าร้าน POS</span>
        </Link>
      </div>
    </div>
  )
}
