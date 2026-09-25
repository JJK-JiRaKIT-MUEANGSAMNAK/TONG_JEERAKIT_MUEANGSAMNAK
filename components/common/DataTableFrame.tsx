'use client'

import React from 'react'

export interface DataTableFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode
  footer?: React.ReactNode
  empty?: boolean
  emptyState?: React.ReactNode
  bodyClassName?: string
  containerClassName?: string
  children: React.ReactNode
}

export const DATA_TABLE_FRAME_HEIGHT_CLASSES = 'min-h-[320px] max-h-[380px]'
export const DATA_TABLE_THEAD_CLASSES = 'sticky top-0 z-20 bg-[#E3E3E3] dark:bg-slate-800 font-bold'
export const DATA_TABLE_TH_CLASSES = 'py-2 font-bold whitespace-nowrap'
export const DATA_TABLE_TD_CLASSES = 'py-1.5'

/**
 * Shared standard table class based on StockReportView:
 * Full width, table-auto (browser distributes column widths automatically),
 * border-collapse, and left-aligned.
 */
export const DATA_TABLE_CLASSES = 'w-full text-left border-collapse table-auto'
export const DATA_TABLE_AUTO_CLASSES = DATA_TABLE_CLASSES
export const DATA_TABLE_LAYOUT_CLASSES = DATA_TABLE_CLASSES

/**
 * DataTableFrame: Source of truth for full data tables
 * Handles presentation: card container, scrollable area with 8-row height, sticky thead, and cell padding.
 */
export function DataTableFrame({
  header,
  footer,
  empty,
  emptyState,
  className = '',
  bodyClassName = '',
  containerClassName = '',
  children,
  ...props
}: DataTableFrameProps) {
  const baseCard = className.includes('rounded-')
    ? className
    : `p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs ${className}`

  return (
    <div
      className={`flex flex-col min-h-0 overflow-hidden ${baseCard}`.trim()}
      {...props}
    >
      {header && <div className="shrink-0">{header}</div>}

      <div className={`flex-1 min-h-0 overflow-hidden ${containerClassName}`.trim()}>
        <div
          className={`overflow-y-auto overflow-x-auto min-h-[320px] max-h-[380px] [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-20 [&_thead]:bg-[#E3E3E3] dark:[&_thead]:bg-slate-800 [&_thead]:font-bold [&_th]:py-2 [&_th]:font-bold [&_th]:whitespace-nowrap [&_td]:py-1.5 ${bodyClassName}`.trim()}
        >
          {empty && emptyState ? emptyState : children}
        </div>
      </div>

      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  )
}
