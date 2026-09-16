'use client'

import React from 'react'
import { RefreshCw, Filter } from 'lucide-react'
import { CustomDatePicker } from '@/components/common/CustomDatePicker'
import { CustomSelect } from '@/components/common/CustomSelect'

export interface ReportFilterProps {
  startDate: Date
  endDate: Date
  onStartDateChange: (d: Date | null) => void
  onEndDateChange: (d: Date | null) => void
  preset: string
  onPresetChange: (preset: string) => void
  granularity: 'daily' | 'monthly'
  onGranularityChange: (g: 'daily' | 'monthly') => void
  onRefresh: () => void
  isRefreshing?: boolean
}

export function ReportFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  preset,
  onPresetChange,
  granularity,
  onGranularityChange,
  onRefresh,
  isRefreshing = false,
}: ReportFilterProps) {
  const presetOptions = [
    { value: 'today', label: 'วันนี้' },
    { value: 'last_7_days', label: '7 วันล่าสุด' },
    { value: 'last_30_days', label: '30 วันล่าสุด' },
    { value: 'this_month', label: 'เดือนนี้' },
    { value: 'last_month', label: 'เดือนที่แล้ว' },
    { value: 'this_year', label: 'ปีนี้' },
    { value: 'all', label: 'ข้อมูลทั้งหมด' },
    { value: 'custom', label: 'กำหนดเอง' },
  ]

  const granularityOptions = [
    { value: 'daily', label: 'รายวัน' },
    { value: 'monthly', label: 'รายเดือน' },
  ]

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
      {/* Left Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        <div className="flex items-center gap-1 text-slate-400 shrink-0 text-xs font-bold mr-1">
          <Filter className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline text-slate-700 dark:text-slate-300">ตัวกรอง:</span>
        </div>

        {/* ช่วงกำหนดเอง / Presets */}
        <div className="w-32 sm:w-36 shrink-0">
          <CustomSelect
            value={preset}
            onChange={(val) => onPresetChange(String(val))}
            options={presetOptions}
            placeholder="ช่วงเวลา"
            buttonClassName="h-9 px-2.5 py-0 text-xs rounded-xl"
          />
        </div>

        {/* วันที่เริ่ม */}
        <div className="w-28 sm:w-32 shrink-0">
          <CustomDatePicker
            value={startDate}
            onChange={onStartDateChange}
            placeholder="วันที่เริ่ม"
            buttonClassName="h-9 px-2.5 py-0 text-xs rounded-xl font-mono font-bold"
          />
        </div>

        <span className="text-slate-400 text-xs font-bold shrink-0">-</span>

        {/* วันที่สิ้นสุด */}
        <div className="w-28 sm:w-32 shrink-0">
          <CustomDatePicker
            value={endDate}
            onChange={onEndDateChange}
            placeholder="วันที่สิ้นสุด"
            buttonClassName="h-9 px-2.5 py-0 text-xs rounded-xl font-mono font-bold"
          />
        </div>

        {/* รายวัน / รายเดือน */}
        <div className="w-24 sm:w-28 shrink-0">
          <CustomSelect
            value={granularity}
            onChange={(val) => onGranularityChange(val as 'daily' | 'monthly')}
            options={granularityOptions}
            placeholder="ความละเอียด"
            buttonClassName="h-9 px-2.5 py-0 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Right: Refresh Button */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 px-3.5 py-0 flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          title="รีเฟรชข้อมูลตามช่วงเวลา"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">รีเฟรช</span>
        </button>
      </div>
    </div>
  )
}
