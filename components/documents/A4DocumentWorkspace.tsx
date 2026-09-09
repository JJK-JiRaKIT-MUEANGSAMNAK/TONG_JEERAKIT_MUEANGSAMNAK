'use client'

import React, { useMemo } from 'react'
import { Eye } from 'lucide-react'
import { A4FitPreview } from '@/components/pos/A4FitPreview'
import { sanitizeDocumentHtml } from '@/lib/utils/document-html'

interface A4DocumentWorkspaceProps {
  title?: string
  subtitle?: string
  htmlContent: string
  orientation?: 'PORTRAIT' | 'LANDSCAPE'
  onPrint?: () => void
  onDownload?: () => void
  hideHeader?: boolean
  onDoubleClick?: () => void
}

export function A4DocumentWorkspace({
  htmlContent,
  onDoubleClick,
}: A4DocumentWorkspaceProps) {
  const safeHtml = useMemo(() => sanitizeDocumentHtml(htmlContent), [htmlContent])

  return (
    <div
      onDoubleClick={onDoubleClick}
      className="h-full min-h-0 w-full flex-1 overflow-hidden flex flex-col bg-slate-100/60 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-slate-800 cursor-pointer select-none"
      title="ดับเบิลคลิกเพื่อแสดงพรีวิวเอกสารเต็มจอ"
    >
      <div className="flex-1 min-h-0 w-full h-full overflow-hidden">
        <A4FitPreview paddingPx={1} className="h-full w-full">
          {safeHtml ? (
            <div
              className="p-8 text-slate-900 font-sans text-xs select-text"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400 space-y-2 text-center p-4">
              <Eye className="w-10 h-10 stroke-[1.5] text-slate-300" />
              <p className="font-extrabold text-slate-500 text-xs">ยังไม่ได้เลือกเอกสารเพื่อพรีวิว</p>
              <p className="text-[10px] text-slate-400 max-w-xs">
                โปรดเลือกรายการแบบฟอร์มเพื่อแสดง Preview สัดส่วน A4 จริง
              </p>
            </div>
          )}
        </A4FitPreview>
      </div>
    </div>
  )
}
