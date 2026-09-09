'use client'

import React, { useState } from 'react'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { Clock, ShieldCheck, UserCheck, History, AlertCircle, ArrowRight } from 'lucide-react'

export interface BillRevision {
  id: string
  revisionType: string
  createdBy?: string
  createdAt: string
  reason?: string
  beforeSnapshot?: any
  afterSnapshot?: any
}

interface AuditLogViewerModalProps {
  billId?: string
  billNo: string
  customerName: string
  onClose: () => void
}

const REVISION_ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CORRECTION: { label: 'แก้ไขรายละเอียดบิล', color: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' },
  EXTENSION: { label: 'ขยายระยะเวลาเช่า', color: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' },
  CANCELLATION: { label: 'ยกเลิกบิลเช่า', color: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' },
  DEPOSIT_REFUND: { label: 'คืนเงินมัดจำ', color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
  PRICE_OVERRIDE: { label: 'ปรับลดราคาพิเศษ', color: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' },
  DELIVERY_ADJUSTMENT: { label: 'ปรับเปลี่ยนการส่งมอบ', color: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' },
}

export function AuditLogViewerModal({
  billId,
  billNo,
  customerName,
  onClose,
}: AuditLogViewerModalProps) {
  const [revisions, setRevisions] = useState<BillRevision[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
            ประวัติการแก้ไขสัญญาและบิล (Bill Revision History)
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
            <p className="text-xs">กำลังโหลดประวัติสัญญาจากฐานข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-rose-500 bg-rose-500/10 rounded-xl p-4">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : revisions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
            <p className="font-bold text-sm text-slate-300">บิลนี้อยู่ในสถานะสัญญาตั้งต้น (Original Contract)</p>
            <p className="text-xs mt-1 text-slate-500">
              ยังไม่มีการแก้ไขรายการ, ขยายเวลาเช่า, หรือปรับปรุงยอดเงินมัดจำย้อนหลัง
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6">
            {revisions.map((rev, index) => {
              const actionMeta = REVISION_ACTION_LABELS[rev.revisionType] || {
                label: rev.revisionType,
                color: 'bg-slate-100 text-slate-700',
              }
              const beforeBill = rev.beforeSnapshot?.bill || rev.beforeSnapshot
              const afterBill = rev.afterSnapshot?.bill || rev.afterSnapshot

              return (
                <div key={rev.id || index} className="relative pl-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center text-slate-500 font-mono text-[11px]">
                      <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                        <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                        ผู้ทำรายการ (Actor ID): {rev.createdBy ? `${rev.createdBy.slice(0, 8)}...` : 'ระบบ'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDateTime(rev.createdAt)}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wide ${actionMeta.color}`}>
                        {actionMeta.label}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        (ครั้งที่ {index + 1})
                      </span>
                    </div>

                    {/* Reason */}
                    <div className="bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-500 dark:text-slate-400 mr-1.5">เหตุผลที่ระบุ:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        {rev.reason || '-'}
                      </span>
                    </div>

                    {/* Snapshots Before & After comparison */}
                    {(beforeBill || afterBill) && (
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                        <div className="bg-rose-50/80 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
                          <span className="text-rose-600 dark:text-rose-400 font-bold block text-[10px] mb-1">
                            ข้อมูลก่อนแก้ไข (Before):
                          </span>
                          <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
                            <div>สถานะ: <span className="font-bold">{beforeBill?.rental_status || beforeBill?.status || '-'}</span></div>
                            {beforeBill?.grand_total !== undefined && (
                              <div>ยอดรวม: ฿{Number(beforeBill.grand_total).toLocaleString('th-TH')}</div>
                            )}
                          </div>
                        </div>

                        <div className="bg-emerald-50/80 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-[10px] mb-1">
                            ข้อมูลหลังแก้ไข (After):
                          </span>
                          <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
                            <div>สถานะ: <span className="font-bold">{afterBill?.rental_status || afterBill?.status || '-'}</span></div>
                            {afterBill?.grand_total !== undefined && (
                              <div>ยอดรวม: ฿{Number(afterBill.grand_total).toLocaleString('th-TH')}</div>
                            )}
                          </div>
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
            ประวัติการแก้ไขสัญญา (Bill Revision History)
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
