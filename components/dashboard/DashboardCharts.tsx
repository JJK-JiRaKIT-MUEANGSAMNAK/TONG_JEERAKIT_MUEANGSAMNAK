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

export function AreaTrendChart({ data, height = 170 }: AreaTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-slate-400">
        ยังไม่มีข้อมูลแนวโน้ม
      </div>
    )
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1000)

  const width = 500
  const paddingLeft = 55
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 26
  const innerWidth = width - paddingLeft - paddingRight
  const innerHeight = height - paddingTop - paddingBottom

  const pointsIncome = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(1, data.length - 1)) * innerWidth
    const y = paddingTop + innerHeight - (d.income / maxVal) * innerHeight
    return { x, y }
  })

  const pointsExpense = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(1, data.length - 1)) * innerWidth
    const y = paddingTop + innerHeight - (d.expense / maxVal) * innerHeight
    return { x, y }
  })

  const pathIncome = pointsIncome.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  )
  const areaIncome = `${pathIncome} L ${pointsIncome[pointsIncome.length - 1].x} ${height - paddingBottom} L ${pointsIncome[0].x} ${height - paddingBottom} Z`

  const pathExpense = pointsExpense.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  )
  const areaExpense = `${pathExpense} L ${pointsExpense[pointsExpense.length - 1].x} ${height - paddingBottom} L ${pointsExpense[0].x} ${height - paddingBottom} Z`

  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => ({
    ratio,
    val: Math.round(maxVal * (1 - ratio)),
    y: paddingTop + innerHeight * ratio,
  }))

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-3 text-[10.5px] mb-1 font-bold">
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> รายรับ
        </span>
        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> รายจ่าย / เงินคืน
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="cashIncomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="cashExpenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines and Y-axis labels */}
        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line
              x1={paddingLeft}
              y1={t.y}
              x2={width - paddingRight}
              y2={t.y}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 8}
              y={t.y + 3}
              textAnchor="end"
              className="fill-slate-400 font-mono text-[8.5px]"
            >
              {t.val >= 1000 ? `${Math.round(t.val / 1000)}k` : t.val}
            </text>
          </g>
        ))}

        {/* Areas */}
        <path d={areaIncome} fill="url(#cashIncomeGrad)" />
        <path d={areaExpense} fill="url(#cashExpenseGrad)" />

        {/* Lines */}
        <path d={pathIncome} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathExpense} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />

        {/* Dots and X-axis labels */}
        {pointsIncome.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="#10b981" className="stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
            <circle cx={pointsExpense[i].x} cy={pointsExpense[i].y} r="3" fill="#ef4444" className="stroke-white dark:stroke-slate-900" strokeWidth="1" />
            <text
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              className="fill-slate-400 font-bold text-[9px]"
            >
              {data[i].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

interface SalesVsRentBarProps {
  salesRevenue: number
  rentalRevenue: number
  height?: number
}

export function SalesVsRentBarChart({ salesRevenue, rentalRevenue, height = 170 }: SalesVsRentBarProps) {
  const maxVal = Math.max(salesRevenue, rentalRevenue, 1000) * 1.2
  const width = 320
  const paddingLeft = 45
  const paddingRight = 20
  const paddingTop = 24
  const paddingBottom = 26
  const innerWidth = width - paddingLeft - paddingRight
  const innerHeight = height - paddingTop - paddingBottom

  const barWidth = 60
  const col1X = paddingLeft + innerWidth * 0.28 - barWidth / 2
  const col2X = paddingLeft + innerWidth * 0.72 - barWidth / 2

  const h1 = (salesRevenue / maxVal) * innerHeight
  const h2 = (rentalRevenue / maxVal) * innerHeight
  const y1 = paddingTop + innerHeight - h1
  const y2 = paddingTop + innerHeight - h2

  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => ({
    ratio,
    val: Math.round(maxVal * (1 - ratio)),
    y: paddingTop + innerHeight * ratio,
  }))

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-3 text-[10px] mb-1 font-bold text-slate-400">
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" /> ยอดขายสินค้า
        </span>
        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
          <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" /> รายได้จากการเช่า
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line
              x1={paddingLeft}
              y1={t.y}
              x2={width - paddingRight}
              y2={t.y}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 6}
              y={t.y + 3}
              textAnchor="end"
              className="fill-slate-400 font-mono text-[8.5px]"
            >
              {t.val >= 1000 ? `${Math.round(t.val / 1000)}k` : t.val}
            </text>
          </g>
        ))}

        {/* Bar 1: Sales */}
        <rect
          x={col1X}
          y={y1}
          width={barWidth}
          height={Math.max(4, h1)}
          rx="4"
          fill="#10b981"
          className="transition-all duration-300"
        />
        <text
          x={col1X + barWidth / 2}
          y={y1 - 6}
          textAnchor="middle"
          className="fill-slate-700 dark:fill-slate-200 font-mono font-bold text-[9.5px]"
        >
          {salesRevenue.toLocaleString()}
        </text>
        <text
          x={col1X + barWidth / 2}
          y={height - 6}
          textAnchor="middle"
          className="fill-slate-500 dark:fill-slate-400 font-bold text-[9px]"
        >
          ขายสินค้า
        </text>

        {/* Bar 2: Rental */}
        <rect
          x={col2X}
          y={y2}
          width={barWidth}
          height={Math.max(4, h2)}
          rx="4"
          fill="#3b82f6"
          className="transition-all duration-300"
        />
        <text
          x={col2X + barWidth / 2}
          y={y2 - 6}
          textAnchor="middle"
          className="fill-slate-700 dark:fill-slate-200 font-mono font-bold text-[9.5px]"
        >
          {rentalRevenue.toLocaleString()}
        </text>
        <text
          x={col2X + barWidth / 2}
          y={height - 6}
          textAnchor="middle"
          className="fill-slate-500 dark:fill-slate-400 font-bold text-[9px]"
        >
          การเช่า
        </text>
      </svg>
    </div>
  )
}

export function DonutChart({
  data,
  size = 120,
  centerTitle = 'รวม',
  centerPrefix = '',
  centerSuffix = '',
}: {
  data: Array<{ label: string; value: number; color: string; percentage: number }>
  size?: number
  centerTitle?: string
  centerPrefix?: string
  centerSuffix?: string
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = 46
  const strokeWidth = 14
  const circumference = 2 * Math.PI * radius

  let cumulativeOffset = 0

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
          />
          {total === 0 ? (
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#64748b"
              strokeWidth={strokeWidth}
              strokeDasharray="8 8"
            />
          ) : (
            data.map((item, idx) => {
              const dash = (item.value / total) * circumference
              const currentOffset = cumulativeOffset
              cumulativeOffset += dash

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
                  strokeDashoffset={-currentOffset}
                  className="transition-all duration-300"
                />
              )
            })
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
          <span className="text-[9px] text-slate-400 font-bold">{centerTitle}</span>
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 font-mono leading-tight truncate max-w-full">
            {centerPrefix}{total.toLocaleString()}
          </span>
          {centerSuffix && (
            <span className="text-[8.5px] text-slate-400 font-medium">{centerSuffix}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-[10.5px]">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{item.label}</span>
            </div>
            <div className="flex items-center gap-1 font-mono shrink-0 ml-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {centerPrefix ? `฿${item.value.toLocaleString()}` : item.value.toLocaleString()}
              </span>
              <span className="text-[9.5px] text-slate-400 w-8 text-right font-sans">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function VerticalBarChart({
  data,
  height = 140,
}: {
  data: Array<{ label: string; count: number; color: string }>
  height?: number
}) {
  const max = Math.max(...data.map((d) => d.count), 5) * 1.25
  const width = 280
  const paddingLeft = 28
  const paddingRight = 14
  const paddingTop = 22
  const paddingBottom = 24
  const innerWidth = width - paddingLeft - paddingRight
  const innerHeight = height - paddingTop - paddingBottom

  const barWidth = Math.min(32, innerWidth / (data.length * 1.6))
  const step = innerWidth / data.length

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Gridlines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingTop + innerHeight * ratio
          const val = Math.round(max * (1 - ratio))
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 4}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-400 font-mono text-[8px]"
              >
                {val}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const h = (item.count / max) * innerHeight
          const x = paddingLeft + idx * step + (step - barWidth) / 2
          const y = paddingTop + innerHeight - h

          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(3, h)}
                rx="3"
                fill={item.color}
                className="transition-all duration-300"
              />
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                className="fill-slate-700 dark:fill-slate-200 font-mono font-bold text-[9px]"
              >
                {item.count}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - 6}
                textAnchor="middle"
                className="fill-slate-400 font-bold text-[8.5px]"
              >
                {item.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function CategoryHorizontalBarChart({
  data,
}: {
  data: Array<{ category: string; total: number; available: number; rented: number; damaged: number }>
}) {
  const max = Math.max(...data.map((d) => d.total), 10)
  const maxScale = Math.ceil(max / 100) * 100 || 500
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899']

  return (
    <div className="space-y-2 w-full">
      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
        {data.map((cat, idx) => {
          const pct = Math.max(3, Math.round((cat.total / maxScale) * 100))
          const color = colors[idx % colors.length]

          return (
            <div key={idx} className="space-y-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{cat.category}</span>
                <span className="font-mono text-slate-800 dark:text-slate-100 font-black text-xs">
                  {cat.total.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Axis ticks at bottom: 0, 100, 200, 300, 400, 500 */}
      <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span>0</span>
        <span>{Math.round(maxScale * 0.25)}</span>
        <span>{Math.round(maxScale * 0.5)}</span>
        <span>{Math.round(maxScale * 0.75)}</span>
        <span>{maxScale}</span>
      </div>
    </div>
  )
}

export function GroupedBarChart({
  data,
  label1,
  color1,
  label2,
  color2,
  height = 140,
}: {
  data: Array<{ label: string; val1: number; val2: number }>
  label1: string
  color1: string
  label2: string
  color2: string
  height?: number
}) {
  const max = Math.max(...data.map((d) => Math.max(d.val1, d.val2)), 10) * 1.25
  const width = 340
  const paddingLeft = 28
  const paddingRight = 14
  const paddingTop = 22
  const paddingBottom = 24
  const innerWidth = width - paddingLeft - paddingRight
  const innerHeight = height - paddingTop - paddingBottom

  const step = innerWidth / Math.max(1, data.length)
  const barWidth = Math.min(10, step * 0.35)

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-3 text-[9.5px] mb-1 font-bold">
        <span className="flex items-center gap-1" style={{ color: color1 }}>
          <span className="w-2 h-2 rounded-xs inline-block" style={{ backgroundColor: color1 }} /> {label1}
        </span>
        <span className="flex items-center gap-1" style={{ color: color2 }}>
          <span className="w-2 h-2 rounded-xs inline-block" style={{ backgroundColor: color2 }} /> {label2}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingTop + innerHeight * ratio
          const val = Math.round(max * (1 - ratio))
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 4}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-400 font-mono text-[8px]"
              >
                {val}
              </text>
            </g>
          )
        })}

        {data.map((item, idx) => {
          const h1 = (item.val1 / max) * innerHeight
          const h2 = (item.val2 / max) * innerHeight
          const centerX = paddingLeft + idx * step + step / 2
          const x1 = centerX - barWidth - 1
          const x2 = centerX + 1
          const y1 = paddingTop + innerHeight - h1
          const y2 = paddingTop + innerHeight - h2

          return (
            <g key={idx}>
              <rect x={x1} y={y1} width={barWidth} height={Math.max(2, h1)} rx="2" fill={color1} />
              <rect x={x2} y={y2} width={barWidth} height={Math.max(2, h2)} rx="2" fill={color2} />
              <text
                x={centerX}
                y={height - 6}
                textAnchor="middle"
                className="fill-slate-400 font-bold text-[8.5px]"
              >
                {item.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function DoubleLineAreaTrendChart({
  data,
  height = 170,
}: {
  data: Array<{ label: string; revenue: number; grossProfit: number }>
  height?: number
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-slate-400">
        ยังไม่มีข้อมูลแนวโน้ม
      </div>
    )
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.grossProfit)), 1000) * 1.2
  const width = 500
  const paddingLeft = 55
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 26
  const innerWidth = width - paddingLeft - paddingRight
  const innerHeight = height - paddingTop - paddingBottom

  const pointsRev = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(1, data.length - 1)) * innerWidth
    const y = paddingTop + innerHeight - (d.revenue / maxVal) * innerHeight
    return { x, y }
  })

  const pointsProfit = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(1, data.length - 1)) * innerWidth
    const y = paddingTop + innerHeight - (d.grossProfit / maxVal) * innerHeight
    return { x, y }
  })

  const pathRev = pointsRev.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  )
  const areaRev = `${pathRev} L ${pointsRev[pointsRev.length - 1].x} ${height - paddingBottom} L ${pointsRev[0].x} ${height - paddingBottom} Z`

  const pathProfit = pointsProfit.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  )

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    ratio,
    val: Math.round(maxVal * (1 - ratio)),
    y: paddingTop + innerHeight * ratio,
  }))

  const lastPoint = data[data.length - 1]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10.5px] mb-1 font-bold">
        <span className="text-[9.5px] text-slate-400 font-normal">รายรับ (บาท)</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> รายรับ
          </span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> กำไรขั้นต้น
          </span>
        </div>
      </div>
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="doubleLineRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {yTicks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={t.y}
                x2={width - paddingRight}
                y2={t.y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 6}
                y={t.y + 3}
                textAnchor="end"
                className="fill-slate-400 font-mono text-[8px]"
              >
                {t.val.toLocaleString()}
              </text>
            </g>
          ))}

          {/* Area under revenue */}
          <path d={areaRev} fill="url(#doubleLineRevGrad)" />

          {/* Revenue Line */}
          <path d={pathRev} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Profit Line */}
          <path d={pathProfit} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots */}
          {pointsRev.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" className="stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
              <circle cx={pointsProfit[i].x} cy={pointsProfit[i].y} r="3.5" fill="#10b981" className="stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
              <text
                x={p.x}
                y={height - 6}
                textAnchor="middle"
                className="fill-slate-400 font-bold text-[9px]"
              >
                {data[i].label}
              </text>
            </g>
          ))}
        </svg>

        {/* Small Tooltip badge at top right if last point exists */}
        {lastPoint && (
          <div className="hidden sm:block absolute top-2 right-6 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 shadow-sm text-[9.5px] pointer-events-none">
            <div className="font-bold text-slate-500 mb-0.5">{lastPoint.label}</div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-mono font-bold">รายรับ: ฿{lastPoint.revenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-mono font-bold">กำไรขั้นต้น: ฿{lastPoint.grossProfit.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
