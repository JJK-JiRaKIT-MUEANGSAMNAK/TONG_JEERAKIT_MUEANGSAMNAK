'use client'

import React from 'react'

interface TrendPoint {
  label: string
  income: number
  expense: number
}

interface AreaTrendChartProps {
  data: TrendPoint[]
  height?: number
}

export function AreaTrendChart({ data, height = 180 }: AreaTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-slate-400">
        ยังไม่มีข้อมูลแนวโน้ม
      </div>
    )
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 100)

  const width = 500
  const paddingX = 40
  const paddingY = 24
  const innerWidth = width - paddingX * 2
  const innerHeight = height - paddingY * 2

  const pointsIncome = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * innerWidth
    const y = paddingY + innerHeight - (d.income / maxVal) * innerHeight
    return { x, y }
  })

  const pointsExpense = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * innerWidth
    const y = paddingY + innerHeight - (d.expense / maxVal) * innerHeight
    return { x, y }
  })

  const pathIncome = pointsIncome.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  )
  const areaIncome = `${pathIncome} L ${pointsIncome[pointsIncome.length - 1].x} ${height - paddingY} L ${pointsIncome[0].x} ${height - paddingY} Z`

  const pathExpense = pointsExpense.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  )
  const areaExpense = `${pathExpense} L ${pointsExpense[pointsExpense.length - 1].x} ${height - paddingY} L ${pointsExpense[0].x} ${height - paddingY} Z`

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-3 text-[11px] mb-1 font-bold">
        <span className="flex items-center gap-1 text-emerald-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> รายรับ
        </span>
        <span className="flex items-center gap-1 text-rose-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> รายจ่าย/คืนเงิน
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingY + innerHeight * ratio
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          )
        })}

        {/* Areas */}
        <path d={areaIncome} fill="url(#incomeGrad)" />
        <path d={areaExpense} fill="url(#expenseGrad)" />

        {/* Lines */}
        <path d={pathIncome} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <path d={pathExpense} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />

        {/* Dots & Labels */}
        {pointsIncome.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="#10b981" className="stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
            <circle cx={pointsExpense[i].x} cy={pointsExpense[i].y} r="3" fill="#ef4444" className="stroke-white dark:stroke-slate-900" strokeWidth="1" />
            <text
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              className="fill-slate-400 font-bold text-[9.5px]"
            >
              {data[i].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

interface SingleTrendPoint {
  label: string
  value: number
}

export function SingleAreaTrendChart({
  data,
  height = 180,
  strokeColor = '#3b82f6',
  gradId = 'singleGrad',
}: {
  data: SingleTrendPoint[]
  height?: number
  strokeColor?: string
  gradId?: string
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-slate-400">
        ยังไม่มีข้อมูล
      </div>
    )
  }

  const maxVal = Math.max(...data.map((d) => d.value), 100)
  const width = 500
  const paddingX = 40
  const paddingY = 24
  const innerWidth = width - paddingX * 2
  const innerHeight = height - paddingY * 2

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * innerWidth
    const y = paddingY + innerHeight - (d.value / maxVal) * innerHeight
    return { x, y }
  })

  const path = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '')
  const area = `${path} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((ratio, idx) => {
        const y = paddingY + innerHeight * ratio
        return (
          <line
            key={idx}
            x1={paddingX}
            y1={y}
            x2={width - paddingX}
            y2={y}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
        )
      })}
      <path d={area} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill={strokeColor} className="stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
          <text
            x={p.x}
            y={height - 6}
            textAnchor="middle"
            className="fill-slate-400 font-bold text-[9.5px]"
          >
            {data[i].label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function DonutChart({
  data,
  size = 130,
}: {
  data: Array<{ label: string; value: number; color: string; percentage: number }>
  size?: number
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = 45
  const strokeWidth = 16
  const circumference = 2 * Math.PI * radius

  let cumulativePercent = 0

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-100 dark:text-slate-800" />
          {total === 0 ? (
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#64748b" strokeWidth={strokeWidth} strokeDasharray="10 10" />
          ) : (
            data.map((item, idx) => {
              const dash = (item.value / total) * circumference
              const offset = circumference - (cumulativePercent / 100) * circumference
              cumulativePercent += (item.value / total) * 100

              return (
                <circle
                  key={idx}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeDashoffset={-((cumulativePercent - (item.value / total) * 100) / 100) * circumference}
                  className="transition-all duration-300"
                />
              )
            })
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-black text-slate-800 dark:text-slate-100">{total.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 font-bold">รวม</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{item.label}</span>
            </div>
            <div className="flex items-center gap-2 font-mono shrink-0">
              <span className="font-bold text-slate-800 dark:text-slate-200">{item.value.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 w-7 text-right">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HorizontalBarChart({
  data,
}: {
  data: Array<{ label: string; count: number; color: string }>
}) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="space-y-2 w-full">
      {data.map((item, idx) => {
        const pct = Math.max(2, Math.round((item.count / max) * 100))
        return (
          <div key={idx} className="space-y-0.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">{item.count.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
