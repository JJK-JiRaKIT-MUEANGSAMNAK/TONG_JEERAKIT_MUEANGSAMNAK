'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CheckCheck,
  Truck,
  RotateCcw,
  AlertTriangle,
  CreditCard,
  Package,
  Calendar,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'DELIVERY' | 'RETURN' | 'OVERDUE' | 'PAYMENT' | 'LOW_STOCK' | 'APPOINTMENT'
  isRead: boolean
  href?: string
  timeAgo?: string
  badgeLabel?: string
  badgeColor?: string
}

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  // Handle clicking outside popover to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleItemClick = (item: NotificationItem) => {
    setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)))
    setIsOpen(false)
    if (item.href) {
      router.push(item.href)
    }
  }

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'DELIVERY':
        return <Truck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
      case 'RETURN':
        return <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      case 'OVERDUE':
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      case 'LOW_STOCK':
        return <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
      case 'APPOINTMENT':
      default:
        return <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
    }
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="การแจ้งเตือน"
        title="การแจ้งเตือน"
        className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300'
        }`}
      >
        <Bell className="w-4 h-4" />

        {/* Badge (Only visible when unread count > 0) */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center leading-none shadow-sm animate-in zoom-in duration-200">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0d1b2e] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#263954] z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border-b border-slate-200 dark:border-[#263954] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                การแจ้งเตือน
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[10px] font-black">
                  {unreadCount} รายการใหม่
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="ทำเครื่องหมายว่าอ่านแล้วทั้งหมด"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>อ่านทั้งหมด</span>
              </button>
            )}
          </div>

          {/* Notification Items List (Scrolls Internally) */}
          <div className="overflow-y-auto max-h-[360px] divide-y divide-slate-100 dark:divide-slate-800/80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  ไม่มีการแจ้งเตือน
                </p>
                <p className="text-[11px] text-slate-400">
                  ทุกรายการอยู่ในสถานะเรียบร้อยแล้ว
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    !item.isRead
                      ? 'bg-blue-50/40 dark:bg-blue-950/20'
                      : 'opacity-85'
                  }`}
                >
                  {/* Icon */}
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 mt-0.5">
                    {getIconForType(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate block">
                        {item.title}
                      </span>
                      {item.badgeLabel && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold shrink-0 ${
                            item.badgeColor || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.badgeLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {/* Unread indicator / arrow */}
                  <div className="flex items-center self-center shrink-0 text-slate-400">
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 mr-1" />
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
