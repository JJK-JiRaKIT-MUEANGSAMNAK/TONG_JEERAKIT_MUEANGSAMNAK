'use client'

import React from 'react'
import { CustomDatePicker } from '@/components/common/CustomDatePicker'

export type DateFilterMode = 'ALL' | 'DAY' | 'RANGE' | 'MONTH'

export interface FinanceDateFilterValue {
  mode: DateFilterMode
  date?: Date | null
  startDate?: Date | null
  endDate?: Date | null
  year?: number
  month?: number // 0 - 11
}

interface FinanceDateFilterProps {
  value: FinanceDateFilterValue
  onChange: (val: FinanceDateFilterValue) => void
  className?: string
}

/**
 * Standard Central Date Filter wrapper based on CustomDatePicker.
 * Unifies all Date Filtering to the standard 2-calendar [จากวันที่] ถึง [ถึงวันที่] layout.
 */
export function FinanceDateFilter({ value, onChange, className = '' }: FinanceDateFilterProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="w-36 sm:w-40">
        <CustomDatePicker
          value={value.startDate ?? value.date ?? null}
          onChange={(d) => {
            onChange({
              ...value,
              mode: d || value.endDate ? 'RANGE' : 'ALL',
              startDate: d,
              date: d,
            })
          }}
          placeholder="จากวันที่"
          align="left"
          showClear={true}
        />
      </div>
      <span className="text-slate-400 font-bold text-xs shrink-0">ถึง</span>
      <div className="w-36 sm:w-40">
        <CustomDatePicker
          value={value.endDate ?? null}
          onChange={(d) => {
            onChange({
              ...value,
              mode: value.startDate || d ? 'RANGE' : 'ALL',
              endDate: d,
            })
          }}
          placeholder="ถึงวันที่"
          align="left"
          showClear={true}
        />
      </div>
    </div>
  )
}
