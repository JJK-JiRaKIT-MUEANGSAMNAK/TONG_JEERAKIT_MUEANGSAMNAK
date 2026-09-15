'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
  CheckCircle2,
  Box,
  User,
  FileText,
  Layers,
  ArrowRight,
} from 'lucide-react'
import {
  loadNotifications,
  markNotificationStatus,
  saveNotifications,
  ActionableNotification,
  NotificationType,
} from '@/lib/notification-storage'
import { fulfillBackorderWorkflow } from '@/lib/bill-workflow-service'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useToast } from '@/components/common/Toast'
import {
  AppModal,
  AppModalHeader,
  AppModalBody,
  AppModalFooter,
} from '@/components/common/AppModal'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<ActionableNotification[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Backorder Fulfillment Modal State
  const [selectedBackorderNotif, setSelectedBackorderNotif] = useState<ActionableNotification | null>(null)
  const [allocateQty, setAllocateQty] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Load notifications from persistence
  const refreshNotifications = useCallback(() => {
    const list = loadNotifications()
    setNotifications(list)
  }, [])

  useEffect(() => {
    refreshNotifications()

    const handleStorageUpdate = () => {
      refreshNotifications()
    }

    window.addEventListener('storage', handleStorageUpdate)
    window.addEventListener('app-storage-update', handleStorageUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageUpdate)
      window.removeEventListener('app-storage-update', handleStorageUpdate)
    }
  }, [refreshNotifications])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.status === 'UNREAD').length
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

  const handleItemClick = (item: ActionableNotification) => {
    if (item.status === 'UNREAD') {
      const updated = markNotificationStatus(item.id, 'READ', user?.displayName || 'STAFF')
      setNotifications(updated)
    }

    setIsOpen(false)

    if (item.type === 'BACKORDER_READY' && item.status !== 'ACTIONED') {
      const initialQty = Number(item.data?.readyQty || item.data?.outstandingQty || 1)
      setAllocateQty(Math.max(1, initialQty))
      setSelectedBackorderNotif(item)
      return
    }

    if (item.data?.sourceType === 'BILL' && item.data?.sourceId) {
      router.push(`/bills?id=${item.data.sourceId}`)
    } else if (item.data?.sourceType === 'QUOTATION' && item.data?.sourceId) {
      router.push(`/quotations?id=${item.data.sourceId}`)
    }
  }

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = notifications.map((n) =>
      n.status === 'UNREAD' ? { ...n, status: 'READ' as const } : n
    )
    saveNotifications(updated)
    setNotifications(updated)
    window.dispatchEvent(new Event('app-storage-update'))
  }

  const handleConfirmFulfillBackorder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBackorderNotif?.data?.backorderId) {
      showToast('ไม่พบข้อมูล Backorder', 'กรุณาลองใหม่อีกครั้ง', 'ERROR')
      return
    }

    const backorderId = selectedBackorderNotif.data.backorderId
    const maxQty = Number(selectedBackorderNotif.data.readyQty || selectedBackorderNotif.data.outstandingQty || 1)

    if (allocateQty <= 0 || allocateQty > maxQty) {
      showToast('จำนวนไม่ถูกต้อง', `กรุณาระบุจำนวนระหว่าง 1 ถึง ${maxQty}`, 'ERROR')
      return
    }

    setIsSubmitting(true)
    try {
      const result = fulfillBackorderWorkflow({
        backorderId,
        allocateQty,
        actor: {
          userId: user?.id || 'staff',
          displayName: user?.displayName || 'เจ้าหน้าที่',
        },
      })

      showToast(
        'จัดสรรสินค้าสำเร็จ',
        `สร้างรายการจอง ${result.reservation.reservationNo} สำหรับ Backorder ${result.backorder.backorderNo} เรียบร้อยแล้ว`,
        'SUCCESS'
      )

      refreshNotifications()
      window.dispatchEvent(new Event('app-storage-update'))
      setSelectedBackorderNotif(null)
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการจัดสรร', err?.message || 'ไม่สามารถจัดสรรสินค้าได้', 'ERROR')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'BACKORDER_READY':
        return <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      case 'RESERVATION_EXPIRING':
        return <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      case 'DISPATCH_DUE':
        return <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      case 'STOCK_LOW':
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
      default:
        return <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
    }
  }

  const getBadgeStyle = (item: ActionableNotification) => {
    if (item.status === 'ACTIONED') {
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    }
    switch (item.type) {
      case 'BACKORDER_READY':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
      case 'RESERVATION_EXPIRING':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
      case 'DISPATCH_DUE':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
      case 'STOCK_LOW':
        return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getBadgeLabel = (item: ActionableNotification) => {
    if (item.status === 'ACTIONED') return 'จัดสรรแล้ว'
    switch (item.type) {
      case 'BACKORDER_READY':
        return 'พร้อมจัดสรร'
      case 'RESERVATION_EXPIRING':
        return 'ใกล้หมดอายุ'
      case 'DISPATCH_DUE':
        return 'ถึงกำหนดส่งมอบ'
      case 'STOCK_LOW':
        return 'สต็อกต่ำ'
      default:
        return 'แจ้งเตือน'
    }
  }

  return (
    <>
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

            {/* Notification Items List */}
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
                notifications.map((item) => {
                  const isUnread = item.status === 'UNREAD'
                  const isActioned = item.status === 'ACTIONED'

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        isUnread
                          ? 'bg-blue-50/40 dark:bg-blue-950/20'
                          : isActioned
                            ? 'opacity-65'
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
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold shrink-0 ${getBadgeStyle(
                              item
                            )}`}
                          >
                            {getBadgeLabel(item)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                        {item.type === 'BACKORDER_READY' && !isActioned && (
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <span>คลิกเพื่อตรวจสอบและจัดสรรสินค้า</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Unread indicator / arrow */}
                      <div className="flex items-center self-center shrink-0 text-slate-400">
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 mr-1" />
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backorder Fulfillment Inspection Modal */}
      <AppModal
        isOpen={!!selectedBackorderNotif}
        onClose={() => setSelectedBackorderNotif(null)}
        size="md"
      >
        {selectedBackorderNotif && (
          <>
            <AppModalHeader
              onClose={() => setSelectedBackorderNotif(null)}
              icon={<Package className="w-5 h-5 text-emerald-600" />}
              title="ตรวจสอบและจัดสรรสินค้าสำหรับ Backorder"
            />

            <form onSubmit={handleConfirmFulfillBackorder} className="flex-1 min-h-0 flex flex-col">
              <AppModalBody className="space-y-4 text-xs">
                {/* Details Banner */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">เลขที่ Backorder:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {selectedBackorderNotif.data.backorderNo || selectedBackorderNotif.data.backorderId || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">เอกสารอ้างอิง:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedBackorderNotif.data.sourceType || 'DOCUMENT'} #{selectedBackorderNotif.data.sourceNo || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">ลูกค้า:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                        {selectedBackorderNotif.data.customerName || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">ประเภทรายการ:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedBackorderNotif.data.itemType === 'RENT' ? 'ให้เช่า' : 'ขายขาด'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">สินค้า:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                      {selectedBackorderNotif.data.productName}
                    </span>
                    {selectedBackorderNotif.data.productCode && (
                      <span className="text-[11px] font-mono text-slate-500 block">
                        รหัส: {selectedBackorderNotif.data.productCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock & Quantities Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block">
                      ยอดคงค้างใน Backorder
                    </span>
                    <span className="text-xl font-extrabold text-amber-800 dark:text-amber-200">
                      {selectedBackorderNotif.data.outstandingQty ?? '-'}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 ml-1">ชิ้น</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">
                      สต็อกที่พร้อมจัดสรร
                    </span>
                    <span className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
                      {selectedBackorderNotif.data.readyQty ?? '-'}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-1">ชิ้น</span>
                  </div>
                </div>

                {/* Allocation Input */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-200">
                    ระบุจำนวนที่ต้องการยืนยันจัดสรร <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={Number(selectedBackorderNotif.data.readyQty || selectedBackorderNotif.data.outstandingQty || 1)}
                    value={allocateQty}
                    onChange={(e) => setAllocateQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-bold"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    เมื่อยืนยันแล้ว ระบบจะหักยอด Backorder และสร้างรายการจอง (Reservation) อัตโนมัติ
                  </p>
                </div>
              </AppModalBody>

              <AppModalFooter>
                <button
                  type="button"
                  onClick={() => setSelectedBackorderNotif(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'กำลังจัดสรร...' : 'ยืนยันจัดสรรสินค้า'}</span>
                </button>
              </AppModalFooter>
            </form>
          </>
        )}
      </AppModal>
    </>
  )
}
