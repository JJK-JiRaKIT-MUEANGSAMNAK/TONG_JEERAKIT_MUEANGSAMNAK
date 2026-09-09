'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  FileCheck2,
  Calendar,
  FileText,
  Users,
  Package,
  Wallet,
  BarChart3,
  Settings,
  ShieldCheck,
  Store,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Lock,
} from 'lucide-react'
import { NotificationBell } from '@/components/common/NotificationBell'
import { ThemeToggle } from '@/components/common/ThemeToggle'

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const MENU_ITEMS: MenuItem[] = [
  { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard },
  { name: 'ปฏิทินนัดหมาย', href: '/appointments', icon: Calendar },
  { name: 'หน้าร้าน POS', href: '/pos', icon: ShoppingBag },
  { name: 'จัดการบิลเช่า', href: '/bills', icon: Receipt },
  { name: 'จัดการเอกสาร', href: '/documents', icon: FileCheck2 },
  { name: 'ข้อมูลลูกค้า', href: '/customers', icon: Users },
  { name: 'สินค้า/สต็อก', href: '/products', icon: Package },
  { name: 'ใบเสนอราคา', href: '/quotations', icon: FileText },
  { name: 'การเงิน', href: '/finance/statement', icon: Wallet },
  { name: 'รายงานสรุป', href: '/reports', icon: BarChart3 },
  { name: 'ตั้งค่าระบบ', href: '/settings', icon: Settings },
  { name: 'จัดการสิทธิ์ & รายงาน', href: '/owner-permissions', icon: ShieldCheck },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const logoUrl = ''
  const systemDisplayName = 'JJK_JeeRaKiT'

  // Auto-collapse sidebar when route/pathname changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].some(
    (route) => pathname === route || pathname?.startsWith(route + '/')
  )
  if (isAuthRoute) return null

  const handleMenuClick = () => {
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile & Tablet Header Bar (Visible on screens < xl) */}
      <header className="xl:hidden sticky top-0 z-30 bg-[#0b1627] text-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#263954] shadow-md shrink-0 relative flex items-center justify-between min-h-[56px]">
        {/* Left: Hamburger menu toggle button */}
        <div className="flex items-center z-10 shrink-0">
          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="เปิด/ปิด เมนู"
          >
            {isMobileOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Center: True Center Logo + System Name */}
        <div className="absolute inset-x-16 sm:inset-x-24 inset-y-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 max-w-full min-w-0 pointer-events-auto">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-sm overflow-hidden shrink-0">
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Store className="w-4 h-4" />
              )}
            </div>
            <span className="font-extrabold text-sm sm:text-base text-white truncate tracking-tight">
              {systemDisplayName}
            </span>
          </div>
        </div>

        {/* Right: Actions (Theme Toggle & Notification Bell) */}
        <div className="flex items-center gap-2 z-10 shrink-0">
          <button
            onClick={() => {}}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
            title="ล็อกหน้าจอ (Lock Screen)"
          >
            <Lock className="w-4 h-4" />
          </button>
          <ThemeToggle />
          <NotificationBell />
        </div>
      </header>

      {/* Backdrop Overlay for Mobile/Tablet */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0b1627] text-slate-300 flex flex-col h-dvh max-h-dvh xl:h-full shrink-0 border-r border-[#263954] select-none shadow-2xl transition-transform duration-300 ease-in-out xl:static xl:w-64 xl:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header (Desktop & Drawer Top-Left) */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 overflow-hidden shrink-0">
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Store className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-lg text-white tracking-tight leading-none truncate">
                {systemDisplayName}
              </h1>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="xl:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1.5">
          {MENU_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleMenuClick}
                className={`flex min-h-10 items-center justify-between gap-2 px-3 py-2 rounded-lg font-bold text-[11px] leading-4 transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="min-w-0 whitespace-nowrap">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 shrink-0 text-white/80" />}
              </Link>
            )
          })}
        </nav>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                US
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs font-bold text-slate-200 truncate">
                  ผู้จัดการร้าน
                </p>
                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span className="text-indigo-400 font-bold">💻 พนักงาน</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsMobileOpen(false)
              }}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
