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
    <header className="hidden xl:flex items-center justify-between px-6 py-3 bg-[#E3E3E3] border-b border-slate-300 shadow-sm shrink-0">
      {/* Left: Dynamic Menu / Page Title */}
      <div className="flex items-center min-w-0">
        <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
          {pageName}
        </h1>
      </div>

      {/* Right: Date/Time Badge (Positioned where store owner text was) + Theme Switcher */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Date & Time Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 font-semibold shadow-xs">
          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{currentDateStr || 'กำลังโหลด...'}</span>
          <span className="text-slate-600">|</span>
          <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="font-mono text-slate-100 font-bold">{currentTimeStr}</span>
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Quick Action Launcher */}
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
