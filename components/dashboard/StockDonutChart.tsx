'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { Layers, ArrowRight } from 'lucide-react'

export interface StockDonutChartProps {
  available: number
  rented: number
  reserved?: number
  damaged: number
  lost: number
  totalProducts?: number
}

interface Segment {
  key: string
  label: string
  value: number
  color: string
  bgColor: string
  textColor: string
  percentage: number
  dashArray: string
  dashOffset: number
}

export function StockDonutChart({
  available,
  rented,
  reserved = 0,
  damaged,
  lost,
  totalProducts = 0,
}: StockDonutChartProps) {
  const totalStock = available + reserved + rented + damaged + lost

  const segments = useMemo<Segment[]>(() => {
    if (totalStock === 0) return []

    // Circle radius 48 => circumference = 2 * PI * 48 ≈ 301.593
    const radius = 48
    const circumference = 2 * Math.PI * radius

    const rawData = [
      {
        key: 'available',
        label: 'พร้อมใช้',
        value: available,
        color: '#10b981', // emerald-500
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
        textColor: 'text-emerald-700 dark:text-emerald-300',
      },
      {
        key: 'rented',
        label: 'อยู่กับลูกค้า',
        value: rented,
        color: '#3b82f6', // blue-500
        bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
        textColor: 'text-blue-700 dark:text-blue-300',
      },
      {
        key: 'reserved',
        label: 'จอง',
        value: reserved,
        color: '#a855f7', // purple-500
        bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
        textColor: 'text-purple-700 dark:text-purple-300',
      },
      {
        key: 'damaged',
        label: 'ชำรุด',
        value: damaged,
        color: '#f59e0b', // amber-500
        bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
        textColor: 'text-amber-700 dark:text-amber-300',
      },
      {
        key: 'lost',
        label: 'สูญหาย',
        value: lost,
        color: '#ef4444', // red-500
        bgColor: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
        textColor: 'text-red-700 dark:text-red-300',
      },
    ]

    let accumulatedOffset = 0
    return rawData.map((item) => {
      const pct = (item.value / totalStock) * 100
      const strokeLen = (item.value / totalStock) * circumference
      const segment: Segment = {
        ...item,
        percentage: pct,
        dashArray: `${strokeLen} ${circumference}`,
        dashOffset: -accumulatedOffset,
      }
      accumulatedOffset += strokeLen
      return segment
    })
  }, [available, reserved, rented, damaged, lost, totalStock])

  return (
    <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 md:p-3.5 lg:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 sm:space-y-2.5 md:space-y-2.5 lg:space-y-4 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 sm:pb-2.5 lg:pb-3">
        <h3 className="font-bold text-xs sm:text-sm md:text-sm lg:text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5 md:gap-2">
          <Layers className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>สัดส่วนสถานะสต็อกสินค้า {totalProducts > 0 ? `(${totalProducts} รายการ)` : ''}</span>
        </h3>
        <Link
          href="/products"
          className="text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>จัดการสต็อก</span>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </Link>
      </div>

      {/* Donut & Legend Container */}
      {totalStock === 0 ? (
        <div className="w-full h-32 sm:h-36 md:h-36 lg:h-48 xl:h-52 flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-700/80 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-1.5 sm:mb-2">
            <Layers className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 opacity-60" />
          </div>
          <p className="text-xs md:text-xs lg:text-sm font-bold text-slate-600 dark:text-slate-400">
            ยังไม่มีข้อมูลสต็อกสินค้าในระบบ
          </p>
        </div>
      ) : (
        <div className="flex flex-row items-center justify-between gap-1.5 sm:gap-2.5 md:gap-2 lg:gap-4 h-32 sm:h-36 md:h-36 lg:h-48 xl:h-52 min-w-0">
          {/* SVG Donut */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-28 md:h-28 lg:w-36 lg:h-36 xl:w-40 xl:h-40 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-700/60"
                strokeWidth="15"
              />

              {/* Segments */}
              {segments.map((s) => {
                if (s.value <= 0) return null
                return (
                  <circle
                    key={s.key}
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="15"
                    strokeDasharray={s.dashArray}
                    strokeDashoffset={s.dashOffset}
                    className="transition-all duration-500"
                  />
                )
              })}
            </svg>

            {/* Donut Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[8px] sm:text-[9px] md:text-[8.5px] lg:text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                สต็อกรวม
              </span>
              <span className="text-xs sm:text-sm md:text-sm lg:text-lg font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5 leading-tight">
                {totalStock.toLocaleString()}
              </span>
              <span className="text-[7px] sm:text-[8px] md:text-[8px] lg:text-[9px] text-slate-400 dark:text-slate-500 leading-none">
                หน่วย
              </span>
            </div>
          </div>

          {/* 4 Status Cards Grid */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-1.5 lg:gap-2.5 w-full flex-1">
            {segments.map((s) => (
              <div
                key={s.key}
                className={`p-1.5 sm:p-2 md:p-1.5 lg:p-2.5 rounded-lg md:rounded-xl border flex flex-col justify-between ${s.bgColor}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span
                      className="w-1.5 h-1.5 md:w-1.5 md:h-1.5 lg:w-2 lg:h-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className={`text-[10px] md:text-[10px] lg:text-[11px] font-bold truncate ${s.textColor}`}>
                      {s.label}
                    </span>
                  </div>
                  <span className="text-[8.5px] md:text-[9px] lg:text-[10px] font-semibold text-slate-500 dark:text-slate-400 font-mono shrink-0">
                    {s.percentage < 1 && s.percentage > 0
                      ? `${s.percentage.toFixed(1)}%`
                      : `${Math.round(s.percentage)}%`}
                  </span>
                </div>

                <div className="mt-0.5 sm:mt-1 flex items-baseline justify-between">
                  <span className="text-xs sm:text-sm md:text-xs lg:text-base font-black text-slate-900 dark:text-slate-100 font-mono">
                    {s.value.toLocaleString()}
                  </span>
                  <span className="text-[8px] md:text-[8.5px] lg:text-[10px] text-slate-400 dark:text-slate-500">
                    หน่วย
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
