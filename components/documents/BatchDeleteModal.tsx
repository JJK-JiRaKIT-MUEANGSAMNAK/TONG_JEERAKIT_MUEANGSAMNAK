'use client'

import React, { useState, useEffect } from 'react'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface BatchDeleteModalProps {
  isOpen: boolean
  count: number
  itemTypeLabel?: string
  onClose: () => void
  onConfirm: (reason: string) => void
}

export function BatchDeleteModal({
  isOpen,
  count,
  itemTypeLabel = 'รายการเอกสาร',
  onClose,
  onConfirm
}: BatchDeleteModalProps) {
  const [deleteReason, setDeleteReason] = useState('')

  useEffect(() => {
    if (isOpen) {
      setDeleteReason('')
    }
  }, [isOpen])

  const handleConfirm = () => {
    const trimmed = deleteReason.trim()
    if (!trimmed) return
    onConfirm(trimmed)
    onClose()
  }

  return (
    <AppModal isOpen={isOpen} onClose={onClose} size="sm">
      <AppModalHeader
        onClose={onClose}
        icon={<AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />}
        title="ยืนยันการลบข้อมูล"
      />

      <AppModalBody className="space-y-3 text-xs">
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-slate-800 dark:text-slate-200 leading-relaxed font-bold text-xs">
          ต้องการลบ{itemTypeLabel}ที่เลือกจำนวน <span className="text-red-600 dark:text-red-400 text-sm font-black">{count}</span> รายการหรือไม่?
          <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-1">
            การดำเนินการนี้ไม่สามารถยกเลิกได้ รายการทั้งหมดจะถูกลบออกจากฐานข้อมูลถาวร
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span>เหตุผลในการลบ (จำเป็น)</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="ระบุเหตุผล เช่น แบบฟอร์มเก่าเลิกใช้งาน, ข้อมูลซ้ำซ้อน..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </AppModalBody>

      <AppModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-extrabold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!deleteReason.trim()}
          className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/40 text-white font-extrabold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          <span>ยืนยันการลบ</span>
        </button>
      </AppModalFooter>
    </AppModal>
  )
}
