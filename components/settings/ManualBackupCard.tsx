'use client'

import React, { useState } from 'react'
import { Download, FileSpreadsheet, FileCode, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { CustomDatePicker } from '@/components/common/CustomDatePicker'
import { useToast } from '@/components/common/Toast'
import { logger } from '@/lib/utils/logger'

export function ManualBackupCard() {
  const { showToast } = useToast()
  const [dateMode, setDateMode] = useState<'ALL' | 'CUSTOM'>('ALL')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [lastExportTime, setLastExportTime] = useState<string | null>(null)

  const handleExport = async (format: 'JSON' | 'EXCEL') => {
    setIsExporting(true)
    try {
      const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      setLastExportTime(nowStr)
      showToast(
        'ดาวน์โหลดไฟล์สำรองข้อมูลสำเร็จ',
        `บันทึกไฟล์สำรองข้อมูล (${format}) ลงในอุปกรณ์ของคุณเรียบร้อยแล้ว`,
        'SUCCESS'
      )
    } catch (err: any) {
      logger.error('Backup export failed:', err)
      showToast(
        'เกิดข้อผิดพลาดในการสำรองข้อมูล',
        err?.message || 'ไม่สามารถดึงข้อมูลจากระบบเพื่อดาวน์โหลดได้',
        'ERROR'
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
              สำรองข้อมูลลงในเครื่อง (Manual Offline Backup)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              ดาวน์โหลดข้อมูลบิล สต็อก ลูกค้า และการเงิน เก็บไว้ในคอมพิวเตอร์หรือแฟลชไดรฟ์ได้ทุกเมื่อ ไม่มีค่าใช้จ่าย
            </p>
          </div>
        </div>

        {lastExportTime && (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium border border-emerald-200 dark:border-emerald-800 shrink-0">
            <CheckCircle2 className="w-3 h-3" /> โหลดล่าสุดเมื่อ {lastExportTime}
          </span>
        )}
      </div>

      {/* Date Filter Selection */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">ช่วงข้อมูลที่ต้องการสำรอง:</span>
          <div className="h-9 p-1 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setDateMode('ALL')}
              className={`h-7 px-3.5 text-xs rounded-lg transition-all cursor-pointer font-bold whitespace-nowrap flex items-center justify-center ${
                dateMode === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ข้อมูลทั้งหมด (Full Backup)
            </button>
            <button
              type="button"
              onClick={() => setDateMode('CUSTOM')}
              className={`h-7 px-3.5 text-xs rounded-lg transition-all cursor-pointer font-bold whitespace-nowrap flex items-center justify-center ${
                dateMode === 'CUSTOM'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              เลือกช่วงวันที่ (Custom Date)
            </button>
          </div>
        </div>

        {dateMode === 'CUSTOM' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">ตั้งแต่วันที่:</span>
              <CustomDatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="เลือกวันเริ่มต้น"
                align="left"
                buttonClassName="h-9 px-2.5 py-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold hover:border-slate-300 dark:hover:border-slate-600"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">ถึงวันที่:</span>
              <CustomDatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="เลือกวันสิ้นสุด"
                align="left"
                buttonClassName="h-9 px-2.5 py-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold hover:border-slate-300 dark:hover:border-slate-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Download Buttons */}
      <div className="pt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleExport('EXCEL')}
          disabled={isExporting}
          className="h-9 py-0 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer flex-1 min-w-[200px]"
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>{isExporting ? 'กำลังสร้างไฟล์...' : 'ดาวน์โหลดเป็นไฟล์ Excel (.xlsx)'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleExport('JSON')}
          disabled={isExporting}
          className="h-9 py-0 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer flex-1 min-w-[200px]"
        >
          <FileCode className="w-4 h-4 shrink-0" />
          <span>{isExporting ? 'กำลังสร้างไฟล์...' : 'ดาวน์โหลดเป็นไฟล์ Database JSON'}</span>
        </button>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>ไฟล์จะถูกบันทึกลงในเครื่องของคุณโดยตรง สามารถนำไปเปิดดูใน Excel หรือเก็บเป็นหลักฐานได้ทันที</span>
      </div>
    </div>
  )
}
