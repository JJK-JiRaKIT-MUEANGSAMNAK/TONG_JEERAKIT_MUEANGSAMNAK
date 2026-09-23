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
  Clock,
} from 'lucide-react'
import { NotificationBell } from '@/components/common/NotificationBell'
import { QuickActionLauncher } from '@/components/common/QuickActionLauncher'
import { AppLockButton } from '@/components/auth/AppLockButton'
import { useAuth } from '@/lib/contexts/AuthContext'
import { getPageMeta } from '@/lib/navigation-meta'
import { useLiveClock } from '@/lib/hooks/useLiveClock'

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const MENU_ITEMS: MenuItem[] = [
  { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard },
  { name: 'รายงานสรุป', href: '/reports', icon: BarChart3 },
  { name: 'ปฏิทินนัดหมาย', href: '/appointments', icon: Calendar },
  { name: 'หน้าร้าน POS', href: '/pos', icon: ShoppingBag },
  { name: 'จัดการบิลเช่า', href: '/bills', icon: Receipt },
  { name: 'จัดการเอกสาร', href: '/documents', icon: FileCheck2 },
  { name: 'ข้อมูลลูกค้า', href: '/customers', icon: Users },
  { name: 'สินค้า/สต็อก', href: '/products', icon: Package },
  { name: 'ใบเสนอราคา', href: '/quotations', icon: FileText },
  { name: 'การเงิน', href: '/finance/statement', icon: Wallet },
  { name: 'ตั้งค่าระบบ', href: '/settings', icon: Settings },
  { name: 'จัดการสิทธิ์ & รายงาน', href: '/owner-permissions', icon: ShieldCheck },
]

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
  const { name: pageName, icon: PageIcon, colorClass, dotClass } = getPageMeta(pathname || '', searchParams)
  const { currentDateStr, currentTimeStr } = useLiveClock()

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
      <header className="xl:hidden sticky top-0 z-30 bg-[#E3E3E3] dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-300 dark:border-slate-800 shadow-sm shrink-0 relative flex items-center justify-between min-h-[56px] gap-2">
        {/* Left: Hamburger menu toggle button + Current menu name */}
        <div className="flex items-center gap-2 z-10 shrink-0 min-w-0">
          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 shrink-0 cursor-pointer shadow-xs"
            aria-label="เปิด/ปิด เมนู"
          >
            {isMobileOpen ? <X className="w-5 h-5 text-emerald-500" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 shadow-xs min-w-0">
            <PageIcon className={`w-4 h-4 shrink-0 ${colorClass}`} />
            <span className={`font-bold text-xs sm:text-sm truncate ${colorClass}`} title={pageName}>
              {pageName}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
          </div>
        </div>

        {/* Right: Actions (Date & Time Bar + Notification Bell & Quick Action Launcher) */}
        <div className="flex items-center gap-2 z-10 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-semibold shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 hidden sm:block" />
            <span className="hidden md:inline">{currentDateStr || 'กำลังโหลด...'}</span>
            <span className="text-slate-300 dark:text-slate-600 hidden md:inline">|</span>
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-mono text-slate-900 dark:text-slate-100 font-bold shrink-0">{currentTimeStr}</span>
          </div>

          <AppLockButton variant="mobile" />
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
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#E3E3E3] dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col h-dvh max-h-dvh xl:h-full shrink-0 border-r border-slate-300 dark:border-slate-800 select-none shadow-2xl transition-transform duration-300 ease-in-out xl:static xl:w-64 xl:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header (Close button only on mobile, clean header with no duplicate logo/system name) */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-300 dark:border-slate-800 shrink-0">
          <span className="text-xs font-extrabold tracking-wider uppercase text-slate-700 dark:text-slate-300">
            เมนูหลัก
          </span>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="xl:hidden p-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-800 transition-colors"
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
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <LayoutDashboard className={`w-3.5 h-3.5 shrink-0 ${isDashboardActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                      <span className="min-w-0 whitespace-nowrap">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isDashboardExpanded ? (
                        <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${isDashboardActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`} />
                      ) : (
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isDashboardActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`} />
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
                                ? 'bg-emerald-500/20 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border-l-2 border-emerald-400'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-300/50 dark:hover:bg-slate-800'
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
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <BarChart3 className={`w-3.5 h-3.5 shrink-0 ${isReportsActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                      <span className="min-w-0 whitespace-nowrap">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isReportsExpanded ? (
                        <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${isReportsActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`} />
                      ) : (
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isReportsActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`} />
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
                                ? 'bg-emerald-500/20 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border-l-2 border-emerald-400'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-300/50 dark:hover:bg-slate-800'
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
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                  <span className="min-w-0 whitespace-nowrap">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 shrink-0 text-white/80" />}
              </Link>
            )
          })}
        </nav>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-slate-300 dark:border-slate-800 bg-slate-200/60 dark:bg-slate-900 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-800 border border-slate-400 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                {user?.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.avatarUrl} alt={user.displayName || user.fullName || user.username} className="w-full h-full object-cover" />
                ) : (
                  (user?.displayName || user?.fullName || user?.username || 'US').slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.displayName || user?.fullName || user?.username || 'ผู้ใช้งาน'}
                </p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate flex items-center gap-1">
                  <span className="text-amber-700 dark:text-amber-400 font-bold">
                    {user?.role === 'OWNER' ? '👑 เจ้าของร้าน' : '💻 พนักงาน'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <AppLockButton variant="sidebar" />
              <button
                onClick={async () => {
                  setIsMobileOpen(false)
                  await signOut()
                }}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                title="ออกจากระบบ"
                aria-label="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
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
