'use client'

import React from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 1. ReportAreaTrendChart (Line / Area SVG)
// ─────────────────────────────────────────────────────────────────────────────

export interface AreaSeries {
  name: string
  key: string
  color: string
  gradientId: string
}

export interface ReportAreaTrendChartProps {
  data: Array<Record<string, any>>
  xKey?: string
  series: AreaSeries[]
  height?: number
  valuePrefix?: string
  valueSuffix?: string
}

export function ReportAreaTrendChart({
  data,
  xKey = 'label',
  series,
  height = 175,
  valuePrefix = '฿',
  valueSuffix = '',
}: ReportAreaTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-slate-500">
        ยังไม่มีข้อมูลแนวโน้ม
      </div>
    )
  }

  // Calculate maximum value across all series
  let maxVal = 100
  for (const d of data) {
    for (const s of series) {
      const val = Number(d[s.key] || 0)
      if (val > maxVal) maxVal = val
    }
  }

  const width = 540
  const paddingLeft = 55
  const paddingRight = 16
  const paddingTop = 16
  const paddingBottom = 26
  const innerWidth = width - paddingLeft - paddingRight
  const innerHeight = height - paddingTop - paddingBottom

  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => ({
    ratio,
    val: Math.round(maxVal * (1 - ratio)),
    y: paddingTop + innerHeight * ratio,
  }))

  return (
    <div className="w-full flex flex-col">
      {/* Legend */}
      <div className="flex items-center justify-end gap-3 text-[10.5px] mb-1 font-bold flex-wrap">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5" style={{ color: s.color }}>
            <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        <defs>
          {series.map((s) => (
            <linearGradient key={s.gradientId} id={s.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.06" />
            </linearGradient>
          ))}
        </defs>

        {/* Y-axis gridlines & labels */}
        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line
              x1={paddingLeft}
              y1={t.y}
              x2={width - paddingRight}
              y2={t.y}
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-800"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 6}
              y={t.y + 3}
              textAnchor="end"
              className="fill-slate-500 font-mono text-[9px]"
            >
              {valuePrefix}
              {t.val >= 1000 ? `${(t.val / 1000).toFixed(0)}k` : t.val.toLocaleString()}
              {valueSuffix}
            </text>
          </g>
        ))}

        {/* Series Areas & Lines */}
        {series.map((s) => {
          const points = data.map((d, i) => {
            const x = paddingLeft + (i / Math.max(1, data.length - 1)) * innerWidth
            const val = Math.max(0, Number(d[s.key] || 0))
            const y = paddingTop + innerHeight - (val / maxVal) * innerHeight
            return { x, y }
          })

          const pathD = points.reduce(
            (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
            ''
          )
          const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`

          return (
            <g key={s.key}>
              <path d={areaD} fill={`url(#${s.gradientId})`} />
              <path
                d={pathD}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {data.length <= 15 &&
                points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="3"
                    fill={s.color}
                    className="stroke-white dark:stroke-slate-900 stroke-2"
                  />
                ))}
            </g>
          )
        })}

        {/* X-axis labels (sampled if many points) */}
        {data.map((d, i) => {
          const totalPoints = data.length
          const step = totalPoints > 14 ? Math.ceil(totalPoints / 7) : 1
          if (i % step !== 0 && i !== totalPoints - 1) return null

          const x = paddingLeft + (i / Math.max(1, totalPoints - 1)) * innerWidth
          return (
            <text
              key={i}
              x={x}
              y={height - 8}
              textAnchor="middle"
              className="fill-slate-500 font-mono text-[9px]"
            >
              {d[xKey]}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ReportBarChart (Dual or Multi Bar SVG)
// ─────────────────────────────────────────────────────────────────────────────

export interface BarSeries {
  name: string
  key: string
  color: string
}

export interface ReportBarChartProps {
  data: Array<Record<string, any>>
  xKey?: string
  series: BarSeries[]
  height?: number
  valuePrefix?: string
}

export function ReportBarChart({
  data,
  xKey = 'label',
  series,
  height = 175,
  valuePrefix = '฿',
}: ReportBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-slate-500">
        ยังไม่มีข้อมูลเปรียบเทียบ
      </div>
    )
  }

  let maxVal = 100
  for (const d of data) {
    for (const s of series) {
      const val = Number(d[s.key] || 0)
      if (val > maxVal) maxVal = val
    }
  }

  const width = 540
  const paddingLeft = 55
  const paddingRight = 16
  const paddingTop = 16
  const paddingBottom = 26
  const innerWidth = width - paddingLeft - paddingRight
  const innerHeight = height - paddingTop - paddingBottom

  const groupCount = data.length
  const groupWidth = innerWidth / Math.max(1, groupCount)
  const barCount = series.length
  const barWidth = Math.min(20, Math.max(4, (groupWidth * 0.7) / barCount))

  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => ({
    ratio,
    val: Math.round(maxVal * (1 - ratio)),
    y: paddingTop + innerHeight * ratio,
  }))

  return (
    <div className="w-full flex flex-col">
      {/* Legend */}
      <div className="flex items-center justify-end gap-3 text-[10.5px] mb-1 font-bold flex-wrap">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5" style={{ color: s.color }}>
            <span className="w-2.5 h-2.5 rounded-xs inline-block shrink-0" style={{ backgroundColor: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        {/* Y Gridlines */}
        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line
              x1={paddingLeft}
              y1={t.y}
              x2={width - paddingRight}
              y2={t.y}
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-800"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 6}
              y={t.y + 3}
              textAnchor="end"
              className="fill-slate-500 font-mono text-[9px]"
            >
              {valuePrefix}
              {t.val >= 1000 ? `${(t.val / 1000).toFixed(0)}k` : t.val.toLocaleString()}
            </text>
          </g>
        ))}

        {/* Groups */}
        {data.map((d, gIdx) => {
          const groupCenter = paddingLeft + (gIdx + 0.5) * groupWidth
          const totalBarsWidth = barCount * barWidth + (barCount - 1) * 2
          const startX = groupCenter - totalBarsWidth / 2

          return (
            <g key={gIdx}>
              {series.map((s, bIdx) => {
                const val = Math.max(0, Number(d[s.key] || 0))
                const barH = (val / maxVal) * innerHeight
                const x = startX + bIdx * (barWidth + 2)
                const y = paddingTop + innerHeight - barH

                return (
                  <rect
                    key={s.key}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(val > 0 ? 2 : 0, barH)}
                    rx="2"
                    fill={s.color}
                    className="transition-all duration-200"
                  />
                )
              })}

              {/* X Label (sampled if too many) */}
              {(groupCount <= 12 || gIdx % Math.ceil(groupCount / 7) === 0) && (
                <text
                  x={groupCenter}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[8.5px]"
                >
                  {d[xKey]}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ReportDonutChart (Donut SVG with Legend)
// ─────────────────────────────────────────────────────────────────────────────

export interface DonutItem {
  label: string
  value: number
  color: string
  percentage?: number
}

export interface ReportDonutChartProps {
  data: DonutItem[]
  size?: number
  centerTitle?: string
  centerValue?: string | number
  centerSuffix?: string
  valuePrefix?: string
}

export function ReportDonutChart({
  data,
  size = 130,
  centerTitle = 'รวม',
  centerValue,
  centerSuffix = '',
  valuePrefix = '',
}: ReportDonutChartProps) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0)
  const radius = 46
  const strokeWidth = 14
  const circumference = 2 * Math.PI * radius

  let cumulativeOffset = 0

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
      {/* Donut Circle */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90 select-none">
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
              if (!item.value || item.value <= 0) return null
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

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
          <span className="text-[8.5px] text-slate-400 font-bold uppercase">{centerTitle}</span>
          <span className="text-[12px] font-black text-slate-800 dark:text-slate-100 font-mono leading-tight truncate max-w-full">
            {centerValue !== undefined
              ? centerValue
              : `${valuePrefix}${total.toLocaleString()}`}
          </span>
          {centerSuffix && (
            <span className="text-[8px] text-slate-400 font-medium">{centerSuffix}</span>
          )}
        </div>
      </div>

      {/* Legend Items */}
      <div className="flex flex-col gap-1 min-w-0 flex-1 w-full">
        {data.map((item, idx) => {
          const pct = item.percentage !== undefined
            ? item.percentage
            : total > 0 ? Math.round((item.value / total) * 100) : 0

          return (
            <div
              key={idx}
              className="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
            >
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono shrink-0 ml-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {valuePrefix}
                  {(item.value || 0).toLocaleString()}
                </span>
                <span className="text-[9.5px] text-slate-400 w-7 text-right font-sans">
                  {pct}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ReportFunnel (Pipeline steps: ร่าง → ส่ง → ยืนยัน → เป็นบิล)
// ─────────────────────────────────────────────────────────────────────────────

export interface FunnelStep {
  stage: string
  label: string
  count: number
  value: number
  percentage: number
  color: string
}

export function ReportFunnel({ steps }: { steps: FunnelStep[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
      {steps.map((st, idx) => (
        <div
          key={st.stage}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between relative overflow-hidden"
        >
          {/* Accent top border line */}
          <div
            className="absolute top-0 inset-x-0 h-1"
            style={{ backgroundColor: st.color }}
          />

          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
              {st.label}
            </span>
            <span
              className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-md shrink-0"
              style={{
                backgroundColor: `${st.color}20`,
                color: st.color,
              }}
            >
              {st.percentage}%
            </span>
          </div>

          <div className="my-0.5">
            <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-slate-100">
              {st.count.toLocaleString()}{' '}
              <span className="text-[10px] font-normal text-slate-400">ใบ</span>
            </div>
            <div className="text-[10.5px] font-bold font-mono text-slate-600 dark:text-slate-300 truncate">
              ฿{st.value.toLocaleString()}
            </div>
          </div>

          {/* Step connector arrow indicator (for desktop) */}
          {idx < steps.length - 1 && (
            <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-700 text-xs">
              ›
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
