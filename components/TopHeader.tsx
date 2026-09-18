'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Calendar, Clock } from 'lucide-react'
import { NotificationBell } from '@/components/common/NotificationBell'
import { QuickActionLauncher } from '@/components/common/QuickActionLauncher'

// Map pathname prefixes to Thai page names according to specification
const PAGE_NAME_MAP: Record<string, string> = {
  '/dashboard': 'แดชบอร์ด',
  '/reports': 'รายงานสรุป',
  '/products': 'สินค้า / สต็อก',
  '/customers': 'ลูกค้า',
  '/appointments': 'ปฏิทินนัดหมาย',
  '/pos': 'หน้าร้าน POS',
  '/bills': 'จัดการบิลเช่า',
  '/documents': 'จัดการเอกสาร',
  '/quotations': 'ใบเสนอราคา',
  '/finance': 'การเงิน',
  '/settings': 'ตั้งค่าระบบ',
  '/owner-permissions': 'จัดการสิทธิ์ & รายงาน',
}

function getPageName(pathname: string, searchParams?: { get: (k: string) => string | null } | null): string {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const view = searchParams?.get('view')
    if (view === 'assets') return 'ธุรกรรมสินทรัพย์'
    if (view === 'stock') return 'บริหารงานสต็อก'
    if (view === 'business') return 'วิเคราะห์ธุรกิจ'
    return 'แดชบอร์ด'
  }

  if (pathname === '/reports' || pathname.startsWith('/reports/')) {
    const view = searchParams?.get('view')
    if (view === 'finance') return 'การเงิน'
    if (view === 'sales-rental') return 'ขาย เช่า และเอกสาร'
    if (view === 'operations') return 'งานปฏิบัติการ'
    if (view === 'stock') return 'สต็อกและสินค้า'
    if (view === 'business') return 'วิเคราะห์ธุรกิจ'
    return 'รายงานสรุป'
  }

  for (const [prefix, name] of Object.entries(PAGE_NAME_MAP)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return name
    }
  }
  return 'ระบบ'
}

function TopHeaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [currentDateStr, setCurrentDateStr] = useState('')
  const [currentTimeStr, setCurrentTimeStr] = useState('')

  const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].some(
    (route) => pathname === route || pathname?.startsWith(route + '/')
  )

  const pageName = getPageName(pathname || '', searchParams)

  // Live Date & Time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
      const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ]
      
      const dayName = dayNames[now.getDay()]
      const dateNum = now.getDate()
      const monthName = monthNames[now.getMonth()]
      const yearBE = now.getFullYear() + 543

      setCurrentDateStr(`วัน${dayName}ที่ ${dateNum} ${monthName} ${yearBE}`)

      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      setCurrentTimeStr(`${hours}:${minutes}:${seconds} น.`)
    }

    updateDateTime()
    const timer = setInterval(updateDateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  if (isAuthRoute) return null

  return (
    <header className="hidden xl:flex items-center justify-between px-6 py-3 bg-[#E3E3E3] dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 shadow-sm shrink-0 relative min-h-[56px]">
      {/* Left: Dynamic Menu / Page Title */}
      <div className="flex items-center min-w-0 z-10">
        <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
          {pageName}
        </h1>
      </div>

      {/* Right: Actions (Date & Time + Notification Bell & Quick Action Launcher) */}
      <div className="flex items-center gap-3 shrink-0 z-10">
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 font-semibold shadow-xs">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{currentDateStr || 'กำลังโหลด...'}</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{currentTimeStr}</span>
        </div>

        <NotificationBell />
        <QuickActionLauncher />
      </div>
    </header>
  )
}

export function TopHeader() {
  return (
    <Suspense fallback={null}>
      <TopHeaderContent />
    </Suspense>
  )
}
