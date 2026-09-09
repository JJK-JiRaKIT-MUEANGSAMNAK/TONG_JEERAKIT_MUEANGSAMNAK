'use client'

import React, { useRef } from 'react'
import { AppModal, AppModalHeader, AppModalBody } from '@/components/common/AppModal'
import { Printer, Download } from 'lucide-react'
import { exportElementToPDF } from '@/lib/print/generatePDF'

interface PrintDialogProps {
  title?: string
  children: React.ReactNode
  onClose: () => void
}

export function PrintDialog({ title = 'แสดงตัวอย่างเอกสารก่อนพิมพ์', children, onClose }: PrintDialogProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (printRef.current) {
      await exportElementToPDF(printRef.current, `rental-document.pdf`)
    }
  }

  return (
    <AppModal isOpen={true} onClose={onClose} size="xl">
      {/* Modal Header */}
      <AppModalHeader
        onClose={onClose}
        icon={<Printer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        title={title}
        headerActions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/30 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์เอกสาร</span>
            </button>
          </div>
        }
      />

      {/* Printable View Container */}
      <AppModalBody className="p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/80 flex justify-center">
        <div ref={printRef} className="bg-white rounded-xl shadow-xl w-full max-w-[210mm] h-fit">
          {children}
        </div>
      </AppModalBody>
    </AppModal>
  )
}
