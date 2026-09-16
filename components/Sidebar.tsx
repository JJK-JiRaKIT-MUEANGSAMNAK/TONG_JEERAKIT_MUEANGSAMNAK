'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
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
  ChevronDown,
} from 'lucide-react'
import { NotificationBell } from '@/components/common/NotificationBell'
import { QuickActionLauncher } from '@/components/common/QuickActionLauncher'
import { useAuth } from '@/lib/contexts/AuthContext'

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

const PAGE_NAME_MAP: Record<string, string> = {
  '/dashboard': 'แดชบอร์ด',
  '/products': 'สินค้า / สต็อก',
  '/customers': 'ลูกค้า',
  '/reports': 'รายงาน',
  '/appointments': 'ปฏิทินนัดหมาย',
  '/pos': 'หน้าร้าน POS',
  '/bills': 'จัดการบิลเช่า',
  '/documents': 'จัดการเอกสาร',
  '/quotations': 'ใบเสนอราคา',
  '/finance': 'การเงิน',
  '/settings': 'ตั้งค่าระบบ',
  '/owner-permissions': 'จัดการสิทธิ์ & รายงาน',
}

function getPageName(pathname: string): string {
  for (const [prefix, name] of Object.entries(PAGE_NAME_MAP)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return name
    }
  }
  return 'ระบบ'
}

function SidebarContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(() => pathname === '/dashboard')
  const [isReportsExpanded, setIsReportsExpanded] = useState(
    () => pathname === '/reports' || pathname?.startsWith('/reports/')
  )
  const { user, signOut } = useAuth()

  const logoUrl = ''
  const systemDisplayName = 'JJK_JeeRaKiT'
  const pageName = getPageName(pathname || '')

  // Keep dashboard expanded if user navigates to /dashboard
  useEffect(() => {
    if (pathname === '/dashboard') {
      setIsDashboardExpanded(true)
    }
  }, [pathname])

  // Keep reports expanded if user navigates to /reports
  useEffect(() => {
    if (pathname === '/reports' || pathname?.startsWith('/reports/')) {
      setIsReportsExpanded(true)
    }
  }, [pathname])

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
        {/* Left: Hamburger menu toggle button + Current menu name */}
        <div className="flex items-center gap-2 z-10 shrink-0 max-w-[40%] min-w-0">
          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 shrink-0"
            aria-label="เปิด/ปิด เมนู"
          >
            {isMobileOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-xs sm:text-sm text-slate-100 truncate" title={pageName}>
            {pageName}
          </span>
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

        {/* Right: Actions (Notification Bell & Quick Action Launcher) */}
        <div className="flex items-center gap-2 z-10 shrink-0">
          <NotificationBell />
          <QuickActionLauncher />
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
        {/* Drawer Header (Close button only on mobile, clean header with no duplicate logo/system name) */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <span className="text-xs font-extrabold tracking-wider uppercase text-slate-400">
            เมนูหลัก
          </span>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="xl:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="ปิดเมนู"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav
          className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {MENU_ITEMS.map((item) => {
            if (item.href === '/dashboard') {
              const isDashboardActive = pathname === '/dashboard'
              const currentView = searchParams.get('view') || 'assets'

              const subItems = [
                { name: 'ธุรกรรมสินทรัพย์', view: 'assets', href: '/dashboard?view=assets' },
                { name: 'บริหารงานสต็อก', view: 'stock', href: '/dashboard?view=stock' },
                { name: 'วิเคราะห์ธุรกิจ', view: 'business', href: '/dashboard?view=business' },
              ]

              return (
                <div key={item.href} className="space-y-1">
                  <div
                    onClick={() => {
                      setIsDashboardExpanded((prev) => !prev)
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setIsDashboardExpanded((prev) => !prev)
                      }
                    }}
                    className={`flex min-h-10 items-center justify-between gap-2 px-3 py-2 rounded-lg font-bold text-[11px] leading-4 transition-all duration-150 cursor-pointer select-none ${
                      isDashboardActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <LayoutDashboard className={`w-3.5 h-3.5 shrink-0 ${isDashboardActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="min-w-0 whitespace-nowrap">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isDashboardExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 shrink-0 text-white/80" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-white/80" />
                      )}
                    </div>
                  </div>

                  {/* Submenu: ธุรกรรมสินทรัพย์, บริหารงานสต็อก, วิเคราะห์ธุรกิจ */}
                  {isDashboardExpanded && (
                    <div className="pl-6 pr-1 py-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      {subItems.map((sub) => {
                        const isSubActive = isDashboardActive && currentView === sub.view

                        return (
                          <Link
                            key={sub.view}
                            href={sub.href}
                            onClick={handleMenuClick}
                            className={`flex min-h-8 items-center justify-between gap-2 px-3 py-1.5 rounded-md font-semibold text-[10.5px] leading-4 transition-all duration-150 ${
                              isSubActive
                                ? 'bg-emerald-500/20 text-emerald-300 font-bold border-l-2 border-emerald-400'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>
                            {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            if (item.href === '/reports') {
              const isReportsActive = pathname === '/reports' || pathname?.startsWith('/reports/')
              const currentView = searchParams.get('view') || 'finance'

              const subItems = [
                { name: 'การเงิน', view: 'finance', href: '/reports?view=finance' },
                { name: 'ขาย เช่า และเอกสาร', view: 'sales-rental', href: '/reports?view=sales-rental' },
                { name: 'งานปฏิบัติการ', view: 'operations', href: '/reports?view=operations' },
                { name: 'สต็อกและสินค้า', view: 'stock', href: '/reports?view=stock' },
                { name: 'วิเคราะห์ธุรกิจ', view: 'business', href: '/reports?view=business' },
              ]

              return (
                <div key={item.href} className="space-y-1">
                  <div
                    onClick={() => {
                      setIsReportsExpanded((prev) => !prev)
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setIsReportsExpanded((prev) => !prev)
                      }
                    }}
                    className={`flex min-h-10 items-center justify-between gap-2 px-3 py-2 rounded-lg font-bold text-[11px] leading-4 transition-all duration-150 cursor-pointer select-none ${
                      isReportsActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <BarChart3 className={`w-3.5 h-3.5 shrink-0 ${isReportsActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="min-w-0 whitespace-nowrap">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isReportsExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 shrink-0 text-white/80" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-white/80" />
                      )}
                    </div>
                  </div>

                  {/* Submenu: การเงิน, ขาย เช่า และเอกสาร, งานปฏิบัติการ, สต็อกและสินค้า, วิเคราะห์ธุรกิจ */}
                  {isReportsExpanded && (
                    <div className="pl-6 pr-1 py-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      {subItems.map((sub) => {
                        const isSubActive = isReportsActive && currentView === sub.view

                        return (
                          <Link
                            key={sub.view}
                            href={sub.href}
                            onClick={handleMenuClick}
                            className={`flex min-h-8 items-center justify-between gap-2 px-3 py-1.5 rounded-md font-semibold text-[10.5px] leading-4 transition-all duration-150 ${
                              isSubActive
                                ? 'bg-emerald-500/20 text-emerald-300 font-bold border-l-2 border-emerald-400'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>
                            {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

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
                {user?.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.avatarUrl} alt={user.displayName || user.fullName || user.username} className="w-full h-full object-cover" />
                ) : (
                  (user?.displayName || user?.fullName || user?.username || 'US').slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {user?.displayName || user?.fullName || user?.username || 'ผู้ใช้งาน'}
                </p>
                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span className="text-indigo-400 font-bold">
                    {user?.role === 'OWNER' ? '👑 เจ้าของร้าน' : '💻 พนักงาน'}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={async () => {
                setIsMobileOpen(false)
                await signOut()
              }}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
              title="ออกจากระบบ"
              aria-label="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarContent />
    </Suspense>
  )
}
