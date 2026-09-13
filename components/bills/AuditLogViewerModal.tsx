'use client'

import React, { useState, useEffect } from 'react'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { Clock, ShieldCheck, UserCheck, History, AlertCircle, Hash } from 'lucide-react'
import { getAuditLogsForBill, AuditLogEntry } from '@/lib/audit-storage'

interface AuditLogViewerModalProps {
  billId?: string
  billNo: string
  customerName: string
  onClose: () => void
}

const AUDIT_ACTION_LABELS: Record<string, { label: string; color: string }> = {
  BILL_CREATE: { label: 'สร้างบิลใหม่', color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40' },
  BILL_CANCEL: { label: 'ยกเลิกบิลเช่า', color: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300/40' },
  BILL_RETURN: { label: 'บันทึกรับคืนสินค้า', color: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300/40' },
  BILL_PAYMENT: { label: 'บันทึกรับชำระเงิน', color: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300/40' },
  BILL_DELETE: { label: 'ลบรายการบิล', color: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300/40' },
  STOCK_RENT: { label: 'ตัดสต็อกออกเช่า', color: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300/40' },
  STOCK_RETURN: { label: 'รับคืนสต็อกสินค้า', color: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-300/40' },
  STOCK_RESTORE: { label: 'คืนสต็อกสินค้า', color: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300/40' },
  PAYMENT_RECEIVE: { label: 'บันทึกรายรับการเงิน', color: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-300/40' },
  CORRECTION: { label: 'แก้ไขรายละเอียดบิล', color: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/40' },
  EXTENSION: { label: 'ขยายระยะเวลาเช่า', color: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300/40' },
}

export function AuditLogViewerModal({
  billId,
  billNo,
  customerName,
  onClose,
}: AuditLogViewerModalProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    try {
      const logs = getAuditLogsForBill(billId || '', billNo)
      setAuditLogs(logs)
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถโหลดประวัติ Audit Log ได้')
    } finally {
      setLoading(false)
    }
  }, [billId, billNo])

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-'
    try {
      const d = new Date(isoString)
      return d.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <AppModal isOpen={true} onClose={onClose} size="lg">
      <AppModalHeader
        onClose={onClose}
        icon={<History className="w-5 h-5 text-blue-500" />}
      >
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            ประวัติการทำรายการและตรวจสอบ (Audit Log History)
          </h3>
          <p className="text-xs text-slate-400">
            เลขที่บิล: <span className="font-mono text-blue-500 font-bold">{billNo}</span> | ลูกค้า: {customerName}
          </p>
        </div>
      </AppModalHeader>

      <AppModalBody className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
            <p className="text-xs">กำลังโหลดประวัติ Audit Log...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-rose-500 bg-rose-500/10 rounded-xl p-4">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
            <p className="font-bold text-sm text-slate-300">บิลนี้ยังไม่มีประวัติ Mutation เพิ่มเติม</p>
            <p className="text-xs mt-1 text-slate-500">
              เมื่อมีการยกเลิกบิล, รับคืนสินค้า, รับชำระเงิน หรือปรับเปลี่ยนสถานะ จะถูกบันทึกที่นี่แบบ Real-time
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6">
            {auditLogs.map((log, index) => {
              const actionMeta = AUDIT_ACTION_LABELS[log.action] || {
                label: log.action,
                color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/40',
              }

              return (
                <div key={log.id || index} className="relative pl-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                    {/* Header Row: Actor & Time */}
                    <div className="flex flex-wrap justify-between items-center text-slate-500 font-mono text-[11px] gap-2">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                        ผู้ทำรายการ: <strong className="text-blue-600 dark:text-blue-400">{log.displayName}</strong>
                        <span className="text-slate-400 font-normal">({log.userId ? log.userId.slice(0, 10) : 'system'})</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>

                    {/* Action & Entity */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wide ${actionMeta.color}`}>
                          {actionMeta.label}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                          {log.entityType}: {log.entityId}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                        <Hash className="w-3 h-3 text-slate-400" />
                        Corr: {log.correlationId ? `${log.correlationId.slice(0, 18)}...` : '-'}
                      </span>
                    </div>

                    {/* Reason */}
                    {log.reason && (
                      <div className="bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs">
                        <span className="font-bold text-slate-500 dark:text-slate-400 mr-1.5">เหตุผลที่ระบุ (Reason):</span>
                        <span className="text-slate-800 dark:text-slate-100 font-medium">
                          {log.reason}
                        </span>
                      </div>
                    )}

                    {/* Snapshots Before & After comparison */}
                    {(log.before || log.after) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                        <div className="bg-rose-50/80 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
                          <span className="text-rose-600 dark:text-rose-400 font-bold block text-[10px] mb-1">
                            ข้อมูลก่อนแก้ไข (Before):
                          </span>
                          {log.before ? (
                            <pre className="text-slate-700 dark:text-slate-300 text-[10px] whitespace-pre-wrap break-all leading-tight">
                              {JSON.stringify(log.before, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">(ไม่มีข้อมูลก่อนหน้า / สร้างใหม่)</span>
                          )}
                        </div>

                        <div className="bg-emerald-50/80 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-[10px] mb-1">
                            ข้อมูลหลังแก้ไข (After):
                          </span>
                          {log.after ? (
                            <pre className="text-slate-700 dark:text-slate-300 text-[10px] whitespace-pre-wrap break-all leading-tight">
                              {JSON.stringify(log.after, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">(ถูกลบ / ไม่มีข้อมูลปลายทาง)</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </AppModalBody>

      <AppModalFooter>
        <div className="flex-1 flex items-center justify-between w-full">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            ระบบบันทึกประวัติการตรวจสอบอัตโนมัติ (Immutable Audit Log)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </AppModalFooter>
    </AppModal>
  )
}
