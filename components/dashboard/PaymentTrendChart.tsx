'use client'

import React, { useState, useMemo } from 'react'
import { TrendingUp, RefreshCw } from 'lucide-react'

export interface DailyPaymentTrend {
  date: string
  dayLabel: string
  amount: number
  billCount: number
  fullThaiDate?: string
}

interface PaymentTrendChartProps {
  data: DailyPaymentTrend[]
  isLoading?: boolean
  onRefresh?: () => void
}

export function PaymentTrendChart({ data, isLoading, onRefresh }: PaymentTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const total7Days = useMemo(() => {
    return data.reduce((sum, d) => sum + (d.amount || 0), 0)
  }, [data])

  const maxAmount = useMemo(() => {
    const rawMax = Math.max(...data.map((d) => d.amount || 0), 0)
    if (rawMax === 0) return 1000 // default scale when all values are 0
    // Round up to nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)))
    return Math.ceil((rawMax * 1.15) / magnitude) * magnitude
  }, [data])

  // SVG Chart Geometry
  const svgWidth = 560
  const svgHeight = 150
  const padLeft = 52
  const padRight = 24
  const padTop = 18
  const padBottom = 26

  const plotWidth = svgWidth - padLeft - padRight
  const plotHeight = svgHeight - padTop - padBottom
  const yZero = svgHeight - padBottom

  const points = useMemo(() => {
    if (!data || data.length === 0) return []
    const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0

    return data.map((d, idx) => {
      const x = padLeft + idx * stepX
      const ratio = maxAmount > 0 ? Math.min(1, Math.max(0, (d.amount || 0) / maxAmount)) : 0
      const y = yZero - ratio * plotHeight
      return { x, y, ...d }
    })
  }, [data, maxAmount, padLeft, plotWidth, plotHeight, yZero])

  // Generate smooth cubic bezier curve
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' }
    if (points.length === 1) {
      const p = points[0]
      return {
        linePath: `M ${p.x},${p.y}`,
        areaPath: `M ${p.x},${yZero} L ${p.x},${p.y} L ${p.x},${yZero} Z`,
      }
    }

    let pStr = `M ${points[0].x},${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[i + 2] || p2

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      pStr += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
    }

    const aStr = `${pStr} L ${points[points.length - 1].x},${yZero} L ${points[0].x},${yZero} Z`
    return { linePath: pStr, areaPath: aStr }
  }, [points, yZero])

  const formatAxisLabel = (val: number) => {
    if (val >= 100000) return `฿${(val / 1000).toFixed(0)}k`
    if (val >= 10000) return `฿${(val / 1000).toFixed(1)}k`
    if (val >= 1000) return `฿${(val / 1000).toFixed(1)}k`
    return `฿${val.toLocaleString('th-TH')}`
  }

  const formatCurrency = (val: number) => {
    return `฿${val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>แนวโน้มรับชำระ 7 วันล่าสุด</span>
        </h3>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
              ยอดรับรวม 7 วัน
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(total7Days)}
            </span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              type="button"
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="รีเฟรชข้อมูลแนวโน้ม"
              aria-label="รีเฟรชข้อมูลแนวโน้ม"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Line Chart Area */}
      <div className="relative w-full h-44 sm:h-48 md:h-52 select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradient fill underneath the trend line */}
            <linearGradient id="dashboardPaymentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>

            {/* Subtle glow filter for the trend line */}
            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Horizontal Grid lines & Y-axis labels */}
          {/* Top (Max) */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={svgWidth - padRight}
            y2={padTop}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-700/60"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text
            x={padLeft - 6}
            y={padTop + 3.5}
            textAnchor="end"
            className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono font-medium"
          >
            {formatAxisLabel(maxAmount)}
          </text>

          {/* Middle (50%) */}
          <line
            x1={padLeft}
            y1={padTop + plotHeight / 2}
            x2={svgWidth - padRight}
            y2={padTop + plotHeight / 2}
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-700/40"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text
            x={padLeft - 6}
            y={padTop + plotHeight / 2 + 3.5}
            textAnchor="end"
            className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono font-medium"
          >
            {formatAxisLabel(maxAmount / 2)}
          </text>

          {/* Bottom (Zero) */}
          <line
            x1={padLeft}
            y1={yZero}
            x2={svgWidth - padRight}
            y2={yZero}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-700"
            strokeWidth="1"
          />
          <text
            x={padLeft - 6}
            y={yZero + 3.5}
            textAnchor="end"
            className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono font-medium"
          >
            ฿0
          </text>

          {/* Shaded Area Under Curve */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#dashboardPaymentGradient)"
              className="transition-all duration-300"
            />
          )}

          {/* Trend Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#emeraldGlow)"
              className="transition-all duration-300"
            />
          )}

          {/* Hover Guides & Data Dots */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx
            const isToday = idx === points.length - 1

            return (
              <g key={pt.date} className="cursor-pointer">
                {/* Vertical hover guide line */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={yZero}
                    stroke="currentColor"
                    className="text-emerald-500/50 dark:text-emerald-400/50"
                    strokeDasharray="2 2"
                    strokeWidth="1.5"
                  />
                )}

                {/* Outer halo on hover */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill="#10b981"
                    fillOpacity="0.2"
                    className="animate-pulse"
                  />
                )}

                {/* Main point dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : isToday ? 4.5 : 3.5}
                  fill={isHovered ? '#10b981' : isToday ? '#10b981' : '#ffffff'}
                  stroke="#10b981"
                  strokeWidth={isHovered ? '3' : '2'}
                  className="transition-all duration-150 drop-shadow-xs dark:fill-slate-900"
                />

                {/* X-axis Label text */}
                <text
                  x={pt.x}
                  y={yZero + 18}
                  textAnchor="middle"
                  className={`text-[10px] sm:text-[11px] font-mono transition-colors ${
                    isHovered
                      ? 'fill-emerald-600 dark:fill-emerald-400 font-black'
                      : isToday
                      ? 'fill-slate-900 dark:fill-slate-100 font-bold'
                      : 'fill-slate-500 dark:fill-slate-400 font-medium'
                  }`}
                >
                  {pt.dayLabel}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Transparent columns overlay to capture mouse & touch hover across full height */}
        <div className="absolute inset-0 flex" style={{ left: `${(padLeft / svgWidth) * 100}%`, right: `${(padRight / svgWidth) * 100}%` }}>
          {points.map((pt, idx) => (
            <div
              key={pt.date}
              className="flex-1 h-full cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onTouchStart={() => setHoveredIdx(idx)}
            />
          ))}
        </div>

        {/* Interactive Floating Tooltip */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(points[hoveredIdx].x / svgWidth) * 100}%`,
              top: `${Math.max(16, (points[hoveredIdx].y / svgHeight) * 100 - 8)}%`,
            }}
          >
            <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-xs text-xs space-y-0.5 whitespace-nowrap">
              <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <span>{points[hoveredIdx].fullThaiDate || points[hoveredIdx].date}</span>
                {hoveredIdx === points.length - 1 && (
                  <span className="px-1 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-300 font-bold rounded">
                    วันนี้
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                {formatCurrency(points[hoveredIdx].amount)}
              </div>
            </div>
            {/* Tooltip downward caret */}
            <div className="w-2 h-2 bg-slate-900 dark:bg-slate-950 rotate-45 mx-auto -mt-1 border-r border-b border-slate-700/80" />
          </div>
        )}
      </div>
    </div>
  )
}
