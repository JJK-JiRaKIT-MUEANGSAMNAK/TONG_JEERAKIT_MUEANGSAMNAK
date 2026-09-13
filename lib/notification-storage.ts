/**
 * Actionable Notification Domain Storage
 *
 * Stores actionable alerts such as Backorder Ready notifications when stock increases.
 * Adheres strictly to the invariant: NO auto-allocation without user confirmation.
 * LocalStorage key: 'app_actionable_notifications'.
 */

import { getPendingBackordersForProduct, updateBackorder } from '@/lib/backorder-storage'
import { recordAuditLog, generateCorrelationId } from '@/lib/audit-storage'

export type NotificationType = 'BACKORDER_READY' | 'RESERVATION_EXPIRING' | 'DISPATCH_DUE' | 'STOCK_LOW'
export type NotificationStatus = 'UNREAD' | 'READ' | 'ACTIONED' | 'DISMISSED'

export interface ActionableNotificationData {
  backorderId?: string
  backorderNo?: string
  sourceType?: string
  sourceId?: string
  sourceNo?: string
  customerId?: string
  customerName?: string
  productId?: string
  productCode?: string
  productName?: string
  outstandingQty?: number
  readyQty?: number
  availableQty?: number
  [key: string]: unknown
}

export interface ActionableNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  data: ActionableNotificationData
  status: NotificationStatus
  createdAt: string
  actionedAt?: string
  actionedBy?: string
  correlationId?: string
}

const STORAGE_KEY = 'app_actionable_notifications'

export function loadNotifications(): ActionableNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as ActionableNotification[]
    }
    return []
  } catch {
    return []
  }
}

export function saveNotifications(notifications: ActionableNotification[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch {
    // silently handle quota exceeded
  }
}

export interface CreateNotificationInput {
  type: NotificationType
  title: string
  message: string
  data: ActionableNotificationData
  correlationId?: string
}

export function createNotification(input: CreateNotificationInput): ActionableNotification {
  const nowIso = new Date().toISOString()
  const record: ActionableNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: input.type,
    title: input.title,
    message: input.message,
    data: input.data,
    status: 'UNREAD',
    createdAt: nowIso,
    correlationId: input.correlationId,
  }

  const current = loadNotifications()
  saveNotifications([record, ...current])
  return record
}

export function markNotificationStatus(
  id: string,
  status: NotificationStatus,
  actorName?: string
): ActionableNotification[] {
  const current = loadNotifications()
  const nowIso = new Date().toISOString()
  const next = current.map((n) => {
    if (n.id === id) {
      return {
        ...n,
        status,
        ...(status === 'ACTIONED' ? { actionedAt: nowIso, actionedBy: actorName } : {}),
      }
    }
    return n
  })
  saveNotifications(next)
  return next
}

export function markNotificationActionedByBackorder(
  backorderId: string,
  actorName?: string
): ActionableNotification[] {
  const current = loadNotifications()
  const nowIso = new Date().toISOString()
  const next = current.map((n) => {
    if (n.data?.backorderId === backorderId && (n.status === 'UNREAD' || n.status === 'READ')) {
      return {
        ...n,
        status: 'ACTIONED' as const,
        actionedAt: nowIso,
        actionedBy: actorName,
      }
    }
    return n
  })
  saveNotifications(next)
  return next
}

/**
 * When product stock increases (restock, stock count, return), check pending backorders FIFO.
 * Creates actionable notification for the user to review and confirm allocation.
 * DOES NOT silently auto-allocate stock!
 */
export function checkBackordersOnStockIncrease(
  productId: string,
  newAvailableQty: number,
  actor?: { userId: string; displayName: string },
  correlationId?: string
): ActionableNotification[] {
  if (newAvailableQty <= 0) return []

  const pending = getPendingBackordersForProduct(productId)
  if (pending.length === 0) return []

  const corrId = correlationId || generateCorrelationId()
  const actorUserId = actor?.userId || 'system'
  const actorDisplayName = actor?.displayName || 'ระบบ'
  const created: ActionableNotification[] = []

  let remainingStock = newAvailableQty

  for (const bo of pending) {
    if (remainingStock <= 0) break

    const readyQty = Math.min(bo.outstandingQty, remainingStock)
    remainingStock -= readyQty

    // Update backorder status to READY and note available portion
    updateBackorder({
      ...bo,
      status: 'READY',
      allocatedReadyQty: readyQty,
      updatedAt: new Date().toISOString(),
    })

    const notif = createNotification({
      type: 'BACKORDER_READY',
      title: `สินค้าพร้อมจัดสรรสำหรับ Backorder (${bo.productName})`,
      message: `สินค้า ${bo.productName} มีสต็อกพร้อมจัดสรรจำนวน ${readyQty} ${bo.itemType === 'RENT' ? 'สำหรับเช่า' : 'สำหรับขาย'} ให้แก่ ${bo.customerName} (${bo.sourceType} #${bo.sourceNo}). กรุณากดยืนยันการจัดสรร`,
      data: {
        backorderId: bo.id,
        backorderNo: bo.backorderNo,
        sourceType: bo.sourceType,
        sourceId: bo.sourceId,
        sourceNo: bo.sourceNo,
        customerId: bo.customerId,
        customerName: bo.customerName,
        productId: bo.productId,
        productCode: bo.productCode,
        productName: bo.productName,
        outstandingQty: bo.outstandingQty,
        readyQty,
        availableQty: newAvailableQty,
        itemType: bo.itemType,
        startDate: bo.startDate,
        endDate: bo.endDate,
      },
      correlationId: corrId,
    })

    created.push(notif)

    recordAuditLog({
      userId: actorUserId,
      displayName: actorDisplayName,
      action: 'BACKORDER_READY_NOTIFIED',
      entityType: 'NOTIFICATION',
      entityId: notif.id,
      before: { backorderId: bo.id, status: bo.status },
      after: {
        notificationId: notif.id,
        backorderId: bo.id,
        readyQty,
        outstandingQty: bo.outstandingQty,
        newAvailableQty,
      },
      correlationId: corrId,
    })
  }

  return created
}
