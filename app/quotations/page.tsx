'use client'
import { ModalHeader } from '@/components/common/ModalHeader'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  ArrowRight,
  Search,
  ShoppingBag,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CustomSelect } from '@/components/common/CustomSelect'
import { Quotation } from '@/lib/types/rental-pos'
import { logger } from '@/lib/utils/logger'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/lib/contexts/AuthContext'
import {
  loadQuotations as loadQuotationsFromStorage,
  updateQuotationStatus,
  confirmQuotationWorkflow,
  cancelQuotationWorkflow,
} from '@/lib/quotation-storage'
import { checkAndExpireReservations } from '@/lib/bill-workflow-service'
import { useAutoFitPageSize } from '@/lib/hooks/useAutoFitPageSize'

interface ReservationFulfillmentResult {
  hasShortage: boolean
  requestedQuantity: number
  reservedQuantity: number
  shortageQuantity: number
  items: Array<{
    productId: string
    productName: string
    shortageQuantity: number
  }>
}

export default function QuotationsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { user } = useAuth()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const [selectedQuotationForConversion, setSelectedQuotationForConversion] = useState<Quotation | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionError, setActionError] = useState('')
  const [reservationResult, setReservationResult] = useState<ReservationFulfillmentResult | null>(null)

  // Quotation Release Reservation with Mandatory User Reason
  const [quotationForRelease, setQuotationForRelease] = useState<Quotation | null>(null)
  const [releaseReason, setReleaseReason] = useState('')
  const [releaseTargetStatus, setReleaseTargetStatus] = useState<'CANCELLED' | 'WAITING' | 'REJECTED'>('CANCELLED')
  const [releaseError, setReleaseError] = useState('')
  const [isReleasing, setIsReleasing] = useState(false)

  const handleOpenReleaseModal = (quotation: Quotation) => {
    setQuotationForRelease(quotation)
    setReleaseReason('')
    setReleaseTargetStatus('CANCELLED')
    setReleaseError('')
    setIsReleasing(false)
  }

  const handleCloseReleaseModal = () => {
    if (isReleasing) return
    setQuotationForRelease(null)
    setReleaseReason('')
    setReleaseError('')
  }

  const handleConfirmRelease = async () => {
    if (!quotationForRelease || isReleasing) return
    const trimmedReason = releaseReason.trim()
    if (!trimmedReason) {
      setReleaseError('กรุณาระบุเหตุผลในการปล่อยหรือยกเลิกการจองสินค้า')
      return
    }

    setIsReleasing(true)
    setReleaseError('')
    try {
      const actor = {
        userId: user?.userId || 'system',
        displayName: user?.displayName || 'ระบบ',
      }
      cancelQuotationWorkflow(quotationForRelease.id, trimmedReason, actor)
      const updatedList = loadQuotationsFromStorage()
      setQuotations(updatedList)
      setQuotationForRelease(null)
      setReleaseReason('')
      if (selectedQuotationForConversion?.id === quotationForRelease.id) {
        closeActionModal()
      }
      showToast('ยกเลิกใบเสนอราคาสำเร็จ', `ยกเลิก ${quotationForRelease.quotationNo} และปล่อยการจองสินค้าเรียบร้อยแล้ว`, 'SUCCESS')
    } catch (err: any) {
      setReleaseError(err?.message || 'ไม่สามารถปล่อยการจองได้')
    } finally {
      setIsReleasing(false)
    }
  }

  const loadQuotations = React.useCallback(async () => {
    setIsLoading(true)
    try {
      try {
        checkAndExpireReservations()
      } catch {
        // ignore on early boot
      }
      const data = loadQuotationsFromStorage()
      setQuotations(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadQuotations()
  }, [loadQuotations])

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const quotationAutoFit = useAutoFitPageSize({
    totalItems: filteredQuotations.length,
    defaultRowHeight: 38,
    defaultHeaderHeight: 36,
  })

  useEffect(() => {
    quotationAutoFit.setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const paginatedQuotations = filteredQuotations.slice(
    quotationAutoFit.startIndex,
    quotationAutoFit.endIndex
  )

  const closeActionModal = () => {
    setSelectedQuotationForConversion(null)
    setReservationResult(null)
    setActionError('')
    setIsProcessing(false)
  }

  const handleOpenConversionVerification = (quotation: Quotation) => {
    setReservationResult(null)
    setActionError('')
    setSelectedQuotationForConversion(quotation)
  }

  const routeAcceptedQuotationToPos = (quotationId: string) => {
    closeActionModal()
    router.push(`/pos?quotationId=${encodeURIComponent(quotationId)}`)
  }

  const handlePrintQuotation = (_q: Quotation) => {
    window.print()
  }

  const handleConfirmConvertToPos = async () => {
    if (!selectedQuotationForConversion || isProcessing) return
    const targetQuotation = selectedQuotationForConversion
    if (targetQuotation.status === 'CONVERTED') return

    setIsProcessing(true)
    setActionError('')
    try {
      if (targetQuotation.status !== 'ACCEPTED') {
        const actor = {
          userId: user?.userId || 'system',
          displayName: user?.displayName || 'ระบบ',
        }
        const res = confirmQuotationWorkflow(targetQuotation.id, actor)
        const updated = loadQuotationsFromStorage()
        setQuotations(updated)
        closeActionModal()
        const backorderMsg = res.backorders.length > 0
          ? ` (มี Backorder ${res.backorders.length} รายการเนื่องจากสต็อกไม่พอ)`
          : ''
        showToast('ตอบรับใบเสนอราคาสำเร็จ', `ปรับสถานะ ${targetQuotation.quotationNo} เป็น ตอบรับ / จองสินค้าแล้ว${backorderMsg}`, 'SUCCESS')
      } else {
        routeAcceptedQuotationToPos(targetQuotation.id)
      }
    } catch (err: any) {
      setActionError(err?.message || 'ไม่สามารถดำเนินการได้')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden p-2 bg-slate-100 dark:bg-slate-900 gap-2 text-xs">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
        <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold block">ใบเสนอราคาทั้งหมด</span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{quotations.length}</h3>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 sm:p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm">
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block">ตอบรับ / จองสินค้าแล้ว</span>
          <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {quotations.filter((q) => q.status === 'ACCEPTED').length}
          </h3>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 sm:p-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 shadow-sm">
          <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold block">รอยืนยัน</span>
          <h3 className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {quotations.filter((q) => q.status === 'WAITING' || q.status === 'SENT' || q.status === 'DRAFT').length}
          </h3>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 p-2.5 sm:p-3 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 shadow-sm">
          <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold block">ทำรายการสำเร็จ</span>
          <h3 className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
            {quotations.filter((q) => q.status === 'CONVERTED').length}
          </h3>
        </div>
      </div>

      {isLoading && (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3" />
          <span className="text-sm font-semibold">กำลังโหลดข้อมูลใบเสนอราคา...</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* 1. Mobile Card View (< md screens) */}
          <div className="md:hidden flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
            {/* Mobile Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2 shrink-0">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาเลขที่ใบเสนอราคา หรือ ชื่อลูกค้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs w-full">
                <div className="flex-1">
                  <CustomSelect
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(String(value))}
                    buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                    options={[
                      { value: 'ALL', label: 'สถานะ: ทั้งหมด' },
                      { value: 'ACCEPTED', label: 'ตอบรับ / จองสินค้าแล้ว' },
                      { value: 'WAITING', label: 'รอยืนยัน' },
                      { value: 'CONVERTED', label: 'แปลงเป็นบิลแล้ว' },
                    ]}
                  />
                </div>

                <button
                  onClick={() => router.push('/pos?mode=quotation')}
                  className="h-9 px-3.5 py-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้าง</span>
                </button>
              </div>
            </div>

            {/* Mobile Card List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
              {paginatedQuotations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic">ไม่พบรายการใบเสนอราคา</div>
              ) : (
                paginatedQuotations.map((q) => {
                  const isConverted = q.status === 'CONVERTED'
                  const buttonLabel = isConverted ? 'เปิดบิลแล้ว' : q.status === 'ACCEPTED' ? 'เปิดบิล POS' : 'ตอบรับ / จองสินค้า'
                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 block">
                            {q.quotationNo}
                          </span>
                          <span className="text-[11px] text-slate-400 block">วันที่: {q.quotationDate}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          q.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : q.status === 'CONVERTED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {q.status === 'ACCEPTED' ? 'ตอบรับ / จองแล้ว' : q.status === 'CONVERTED' ? 'เปิดบิลแล้ว' : 'รอยืนยัน'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs py-1.5 border-y border-slate-100 dark:border-slate-700/80">
                        <div>
                          <span className="text-slate-400 block text-[10px]">ลูกค้า:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                            {q.customerName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">ช่วงเช่า:</span>
                          <span className="font-mono text-slate-600 dark:text-slate-400 block text-[11px]">
                            {q.rentalStartDate} - {q.rentalEndDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <div>
                          <span className="text-[10px] text-slate-400 block">ยอดสุทธิ:</span>
                          <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                            ฿{q.grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePrintQuotation(q)}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1 shadow-xs hover:bg-slate-50 active:scale-95 cursor-pointer min-h-[36px]"
                            title="พิมพ์ใบเสนอราคา"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>พิมพ์</span>
                          </button>

                          {q.status === 'ACCEPTED' && (
                            <button
                              type="button"
                              onClick={() => handleOpenReleaseModal(q)}
                              className="px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs inline-flex items-center gap-1 shadow-xs cursor-pointer min-h-[36px]"
                              title="ปล่อยการจองสินค้า"
                            >
                              <span>ปล่อยจอง</span>
                            </button>
                          )}

                          <button
                            disabled={isConverted}
                            onClick={() => !isConverted && handleOpenConversionVerification(q)}
                            className={`px-3 py-1.5 rounded-xl text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all min-h-[36px] ${
                              isConverted
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 cursor-pointer'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{buttonLabel}</span>
                            {!isConverted && <ArrowRight className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Mobile pagination bar */}
            <div className="shrink-0 flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
              <span>
                {filteredQuotations.length > 0
                  ? `${quotationAutoFit.startIndex + 1}-${quotationAutoFit.endIndex} จาก ${filteredQuotations.length}`
                  : '0 รายการ'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={quotationAutoFit.currentPage <= 1}
                  onClick={() => quotationAutoFit.setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40 cursor-pointer"
                >
                  ก่อนหน้า
                </button>
                <span className="font-bold text-slate-700 dark:text-slate-200 px-1">
                  {quotationAutoFit.currentPage}/{quotationAutoFit.totalPages}
                </span>
                <button
                  type="button"
                  disabled={quotationAutoFit.currentPage >= quotationAutoFit.totalPages}
                  onClick={() => quotationAutoFit.setCurrentPage((p) => Math.min(quotationAutoFit.totalPages, p + 1))}
                  className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40 cursor-pointer"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>

          {/* 2. Desktop/Tablet Table View (>= md screens) */}
          <div
            className="hidden md:flex bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex-1 min-h-0 flex-col"
          >
            {/* Table Toolbar */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                {/* Search */}
                <div className="relative min-w-[140px] flex-1 max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาเลขที่ใบเสนอราคา หรือ ชื่อลูกค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <div className="w-48 shrink-0">
                  <CustomSelect
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(String(value))}
                    buttonClassName="h-9 px-2.5 py-0 rounded-xl"
                    options={[
                      { value: 'ALL', label: 'สถานะ: ทั้งหมด' },
                      { value: 'ACCEPTED', label: 'ตอบรับ / จองสินค้าแล้ว' },
                      { value: 'WAITING', label: 'รอยืนยัน' },
                      { value: 'CONVERTED', label: 'แปลงเป็นบิลแล้ว' },
                    ]}
                  />
                </div>
              </div>

              {/* Action Buttons: สร้างใบเสนอราคา */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => router.push('/pos?mode=quotation')}
                  className="h-9 px-3.5 py-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้างใบเสนอราคา</span>
                </button>
              </div>
            </div>

            {/* Table + Pagination container measured by quotationAutoFit.containerRef */}
            <div
              ref={quotationAutoFit.containerRef}
              className="flex-1 min-h-0 min-w-0 flex flex-col justify-between overflow-hidden"
            >
              <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col">
                <table className={`w-full table-fixed text-left text-xs leading-tight border-collapse ${paginatedQuotations.length === 0 ? 'h-full' : ''}`}>
                  <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-bold">
                    <tr>
                      <th className="w-[15%] py-2 px-3 whitespace-nowrap">เลขที่ใบเสนอราคา</th>
                      <th className="w-[11%] py-2 px-3 whitespace-nowrap">วันที่เอกสาร</th>
                      <th className="w-[20%] py-2 px-3 whitespace-nowrap">ชื่อลูกค้า</th>
                      <th className="w-[18%] py-2 px-3 whitespace-nowrap">ช่วงเช่าสินค้า</th>
                      <th className="w-[13%] py-2 px-3 text-right whitespace-nowrap">ยอดรวมสุทธิ</th>
                      <th className="w-[11%] py-2 px-3 text-center whitespace-nowrap">สถานะ</th>
                      <th className="w-[12%] py-2 px-3 text-center whitespace-nowrap">การกระทำ</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-slate-100 dark:divide-slate-700 ${paginatedQuotations.length === 0 ? 'h-full' : ''}`}>
                    {paginatedQuotations.length === 0 ? (
                      <tr data-empty-row="true" className="h-full">
                        <td colSpan={7} className="h-full px-4 text-center text-slate-400 italic align-middle">
                          <div className="flex flex-col items-center justify-center">
                            <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-1.5 opacity-50" />
                            <p className="font-bold text-xs text-slate-600 dark:text-slate-400">ไม่พบรายการใบเสนอราคา</p>
                            <span className="text-[10px] text-slate-400">ลองปรับตัวกรองหรือสร้างใบเสนอราคาใหม่</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedQuotations.map((q) => {
                        const isConverted = q.status === 'CONVERTED'
                        const buttonLabel = isConverted ? 'เปิดแล้ว' : q.status === 'ACCEPTED' ? 'เปิดบิล' : 'ตอบรับ/จอง'
                        return (
                          <tr key={q.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="py-1.5 px-3 font-bold text-blue-600 dark:text-blue-400 font-mono whitespace-nowrap truncate">{q.quotationNo}</td>
                            <td className="py-1.5 px-3 text-slate-500 font-mono whitespace-nowrap truncate">{q.quotationDate}</td>
                            <td className="py-1.5 px-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap truncate">{q.customerName}</td>
                            <td className="py-1.5 px-3 text-slate-500 font-mono whitespace-nowrap truncate">{q.rentalStartDate} ถึง {q.rentalEndDate}</td>
                            <td className="py-1.5 px-3 text-right font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap tabular-nums">
                              ฿{q.grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-1.5 px-3 text-center whitespace-nowrap">
                              <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                q.status === 'ACCEPTED'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : q.status === 'CONVERTED'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {q.status === 'ACCEPTED' ? 'ตอบรับ / จองแล้ว' : q.status === 'CONVERTED' ? 'เปิดบิลแล้ว' : 'รอยืนยัน'}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-center whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handlePrintQuotation(q)}
                                  className="shrink-0 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] inline-flex items-center gap-1 shadow-xs hover:bg-slate-50 hover:scale-[1.02] cursor-pointer"
                                  title="พิมพ์ใบเสนอราคา"
                                >
                                  <Printer className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                  <span>พิมพ์</span>
                                </button>

                                {q.status === 'ACCEPTED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReleaseModal(q)}
                                    className="shrink-0 px-2 py-1 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-[10px] inline-flex items-center gap-1 shadow-xs hover:scale-[1.02] cursor-pointer"
                                    title="ปล่อย / ยกเลิกการจองสินค้า"
                                  >
                                    <span>ปล่อยจอง</span>
                                  </button>
                                )}

                                <button
                                  disabled={isConverted}
                                  onClick={() => !isConverted && handleOpenConversionVerification(q)}
                                  className={`shrink-0 px-2 py-1 rounded-lg text-white font-extrabold text-[10px] inline-flex items-center gap-1 shadow-md transition-all ${
                                    isConverted ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] cursor-pointer'
                                  }`}
                                >
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>{buttonLabel}</span>
                                  {!isConverted && <ArrowRight className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  {filteredQuotations.length > 0 ? (
                    <span>
                      แสดง {quotationAutoFit.startIndex + 1} - {quotationAutoFit.endIndex} จาก {filteredQuotations.length} รายการ
                    </span>
                  ) : (
                    <span>0 รายการ</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={quotationAutoFit.currentPage <= 1}
                    onClick={() => quotationAutoFit.setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>ก่อนหน้า</span>
                  </button>
                  <span className="font-bold text-slate-700 dark:text-slate-200 px-1">
                    {quotationAutoFit.currentPage} / {quotationAutoFit.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={quotationAutoFit.currentPage >= quotationAutoFit.totalPages}
                    onClick={() => quotationAutoFit.setCurrentPage((p) => Math.min(quotationAutoFit.totalPages, p + 1))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>ถัดไป</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedQuotationForConversion && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isProcessing) closeActionModal()
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 cursor-default max-h-[90vh] overflow-y-auto"
          >
            <ModalHeader onClose={() => !isProcessing && closeActionModal()} inset="p6">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600">{selectedQuotationForConversion.quotationNo}</span>
                <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
                  {selectedQuotationForConversion.status === 'ACCEPTED' ? 'ตรวจสอบก่อนเปิดบิล' : 'ตอบรับและจองสินค้า'}
                </h3>
              </div>
            </ModalHeader>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <p>ลูกค้า: <strong>{selectedQuotationForConversion.customerName}</strong> ({selectedQuotationForConversion.phone})</p>
                <p>ช่วงเวลาเช่า: <strong className="font-mono">{selectedQuotationForConversion.rentalStartDate} ถึง {selectedQuotationForConversion.rentalEndDate}</strong></p>
              </div>

              <h4 className="font-bold">รายการสินค้า</h4>
              <div className="border rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {selectedQuotationForConversion.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center bg-white dark:bg-slate-900">
                    <div>
                      <span className="font-bold block">{item.productName}</span>
                      <span className="text-[11px] text-slate-500">จำนวน: {item.quantity} | ราคา: {item.unitPrice} บาท</span>
                    </div>
                    <span className="font-extrabold text-blue-600">{item.lineTotal.toLocaleString()} บาท</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl space-y-1 text-right border border-blue-100 dark:border-blue-900">
                <p>ยอดรวมส่วนลด/ค่าขนส่ง/VAT: <span className="font-bold">{(selectedQuotationForConversion.grandTotal - selectedQuotationForConversion.subtotal).toLocaleString()} บาท</span></p>
                <h4 className="text-sm font-black text-blue-600 dark:text-blue-400">
                  ยอดรวมสุทธิทั้งสิ้น: {selectedQuotationForConversion.grandTotal.toLocaleString()} บาท
                </h4>
              </div>

              {reservationResult && (
                <div className={`p-3 rounded-xl border ${reservationResult.hasShortage ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900'}`}>
                  <div className="flex gap-2 items-start">
                    {reservationResult.hasShortage ? <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    <div className="space-y-1 flex-1">
                      <p className="font-black">
                        {reservationResult.hasShortage ? `ยืนยันแล้ว — รอสินค้า ${reservationResult.shortageQuantity} ชิ้น` : 'จองสินค้าได้ครบ'}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        ต้องการ {reservationResult.requestedQuantity} / จองได้ {reservationResult.reservedQuantity} / ขาด {reservationResult.shortageQuantity}
                      </p>
                      {reservationResult.items.filter((item) => item.shortageQuantity > 0).map((item) => (
                        <div key={item.productId} className="text-[11px] flex justify-between gap-2">
                          <span>{item.productName}</span>
                          <span className="font-bold text-amber-700 dark:text-amber-300">ขาด {item.shortageQuantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {actionError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300">
                  {actionError}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center gap-2 text-xs">
              <div>
                {selectedQuotationForConversion.status === 'ACCEPTED' && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleOpenReleaseModal(selectedQuotationForConversion)}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs disabled:opacity-50 cursor-pointer"
                  >
                    ยกเลิก / ปล่อยการจองสินค้านี้
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={closeActionModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold disabled:opacity-50"
                >
                  {reservationResult?.hasShortage ? 'ปิด' : 'ยกเลิก'}
                </button>

                {!reservationResult?.hasShortage && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleConfirmConvertToPos}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-lg shadow-emerald-500/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                    <span>{selectedQuotationForConversion.status === 'ACCEPTED' ? 'เข้า POS เพื่อเปิดบิล' : 'ยืนยันและจองสินค้า'}</span>
                    {!isProcessing && <ArrowRight className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Release Reservation Modal */}
      {quotationForRelease && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isReleasing) handleCloseReleaseModal()
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 cursor-default"
          >
            <ModalHeader onClose={handleCloseReleaseModal} inset="p6">
              <div>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                  {quotationForRelease.quotationNo}
                </span>
                <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
                  ปล่อยการจองสินค้าจากใบเสนอราคา
                </h3>
              </div>
            </ModalHeader>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <p>ลูกค้า: <strong>{quotationForRelease.customerName}</strong></p>
                <p>ช่วงเวลาเช่า: <strong className="font-mono">{quotationForRelease.rentalStartDate} ถึง {quotationForRelease.rentalEndDate}</strong></p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  สถานะหลังปล่อยการจอง *
                </label>
                <select
                  value={releaseTargetStatus}
                  onChange={(e) => setReleaseTargetStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="CANCELLED">CANCELLED (ยกเลิกใบเสนอราคา)</option>
                  <option value="WAITING">WAITING (ปรับกลับเป็นรอยืนยัน)</option>
                  <option value="REJECTED">REJECTED (ปฏิเสธใบเสนอราคา)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  เหตุผลในการปล่อยการจอง (จำเป็นต้องระบุ) *
                </label>
                <textarea
                  rows={3}
                  value={releaseReason}
                  onChange={(e) => {
                    setReleaseReason(e.target.value)
                    if (releaseError) setReleaseError('')
                  }}
                  placeholder="กรุณาระบุเหตุผล เช่น ลูกค้ายกเลิกคำสั่งเช่า, ไม่สะดวกชำระมัดจำ, สินค้าไม่พร้อม ฯลฯ"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                />
              </div>

              {releaseError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
                  {releaseError}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                disabled={isReleasing}
                onClick={handleCloseReleaseModal}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold disabled:opacity-50 cursor-pointer"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                disabled={isReleasing || !releaseReason.trim()}
                onClick={handleConfirmRelease}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-lg shadow-rose-500/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isReleasing ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>ยืนยันปล่อยการจอง</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
