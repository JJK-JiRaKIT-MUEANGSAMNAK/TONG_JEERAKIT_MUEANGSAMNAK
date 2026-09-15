'use client'

import React, { useState } from 'react'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { BillActionView } from '@/components/bills/BillActionView'
import { BillRevisionView } from '@/components/bills/BillRevisionView'
import { AuditLogViewerModal } from '@/components/bills/AuditLogViewerModal'
import { LineNotifyModal } from '@/components/bills/LineNotifyModal'
import { DepositRefundModal } from '@/components/bills/DepositRefundModal'
import { PaymentRefundModal } from '@/components/bills/PaymentRefundModal'
import { useToast } from '@/components/common/Toast'
import { useRouter } from 'next/navigation'
import { FullBill, loadBills as fetchBills, deleteBill as deleteBillFromStorage, canHardDeleteBill } from '@/lib/bill-storage'
import { returnProductStock, restoreSaleProductStock } from '@/lib/product-storage'
import { useAuth } from '@/lib/contexts/AuthContext'
import { recordAuditLog, generateCorrelationId } from '@/lib/audit-storage'
import { cancelOrVoidBillWorkflow, confirmDraftBillWorkflow, checkAndExpireReservations } from '@/lib/bill-workflow-service'
import {
  Search,
  RefreshCw,
  Printer,
  Clock,
  CheckCircle2,
  ShieldAlert,
  XCircle,
  MessageSquare,
  History,
  AlertCircle,
  Phone,
  Receipt,
  Edit3,
  CalendarPlus,
  WalletCards,
  FileEdit,
  Trash2,
} from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'
import { useAutoFitPageSize } from '@/lib/hooks/useAutoFitPageSize'

export default function BillsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { user } = useAuth()
  const [bills, setBills] = useState<FullBill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rentalFilter, setRentalFilter] = useState<string>('ALL')
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL')

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const statusParam = new URLSearchParams(window.location.search).get('status')
      if (statusParam === 'DRAFT') {
        setRentalFilter('DRAFT')
      }
    }
  }, [])

  // Modals State
  const [selectedBillForLog, setSelectedBillForLog] = useState<FullBill | null>(null)
  const [selectedBillForLine, setSelectedBillForLine] = useState<FullBill | null>(null)
  
  // Workflow State
  const [selectedRowBill, setSelectedRowBill] = useState<FullBill | null>(null)

  const [activeWorkflow, setActiveWorkflow] = useState<'RETURN' | 'PAYMENT' | 'CORRECTION' | 'EXTENSION' | null>(null)
  const [showDepositRefund, setShowDepositRefund] = useState(false)
  const [showPaymentRefund, setShowPaymentRefund] = useState(false)

  // Cancel Modal State
  const [selectedBillForCancel, setSelectedBillForCancel] = useState<FullBill | null>(null)
  const [cancelReason, setCancelReason] = useState<string>('')

  const loadBills = React.useCallback(async () => {
    setIsLoading(true)
    try {
      try {
        checkAndExpireReservations()
      } catch {
        // ignore on early boot
      }
      const data = fetchBills()
      setBills(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadBills()
  }, [loadBills])

  // Calculate Overdue status using current calendar date
  const isOverdueBill = (b: FullBill) => {
    if (b.rentalStatus === 'CLOSED' || b.rentalStatus === 'CANCELLED' || !b.scheduledReturnDate) return false
    const scheduled = new Date(b.scheduledReturnDate)
    const today = new Date()
    scheduled.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    return scheduled.getTime() < today.getTime()
  }

  const getOverdueDays = (b: FullBill) => {
    if (!isOverdueBill(b)) return 0
    const scheduled = new Date(b.scheduledReturnDate)
    const today = new Date()
    scheduled.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diff = today.getTime() - scheduled.getTime()
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
  }

  // Filtered List
  const filteredBills = bills.filter((b) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      b.billNo.toLowerCase().includes(term) ||
      b.customerName.toLowerCase().includes(term) ||
      b.customerPhone.toLowerCase().includes(term)

    let matchesRental = true
    if (rentalFilter === 'RENTING') matchesRental = b.rentalStatus === 'RENTING'
    else if (rentalFilter === 'OVERDUE') matchesRental = isOverdueBill(b)
    else if (rentalFilter === 'PARTIAL_RETURNED') matchesRental = b.rentalStatus === 'PARTIAL_RETURNED'
    else if (rentalFilter === 'CLOSED') matchesRental = b.rentalStatus === 'CLOSED'
    else if (rentalFilter === 'DRAFT') matchesRental = b.rentalStatus === 'DRAFT'
    else if (rentalFilter === 'CANCELLED') matchesRental = b.rentalStatus === 'CANCELLED'

    let matchesPayment = true
    if (paymentFilter === 'PAID') matchesPayment = b.paymentStatus === 'PAID'
    else if (paymentFilter === 'PARTIAL') matchesPayment = b.paymentStatus === 'PARTIAL'
    else if (paymentFilter === 'UNPAID') matchesPayment = b.paymentStatus === 'UNPAID'

    return matchesSearch && matchesRental && matchesPayment
  })

  // Auto-fit pagination for Bills Table
  const {
    containerRef: billsTableContainerRef,
    pageSize: billsPageSize,
    currentPage: billsCurrentPage,
    setCurrentPage: setBillsCurrentPage,
    totalPages: billsTotalPages,
    startIndex: billsStartIndex,
    endIndex: billsEndIndex,
  } = useAutoFitPageSize({
    defaultRowHeight: 34,
    defaultHeaderHeight: 34,
    totalItems: filteredBills.length,
  })

  // Reset page when search or filters change
  React.useEffect(() => {
    setBillsCurrentPage(1)
  }, [searchTerm, rentalFilter, paymentFilter, setBillsCurrentPage])

  const paginatedBills = filteredBills.slice(billsStartIndex, billsEndIndex)

  // Metrics
  const rentingCount = bills.filter((b) => b.rentalStatus === 'RENTING').length
  const overdueCount = bills.filter((b) => isOverdueBill(b)).length
  const unpaidCount = bills.filter((b) => b.paymentStatus !== 'PAID').length
  const closedCount = bills.filter((b) => b.rentalStatus === 'CLOSED').length
  const draftCount = bills.filter((b) => b.rentalStatus === 'DRAFT').length

  const handleConfirmCancelBill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBillForCancel || !cancelReason.trim()) return

    const trimmedReason = cancelReason.trim()
    try {
      cancelOrVoidBillWorkflow({
        billId: selectedBillForCancel.id,
        reason: trimmedReason,
        actor: {
          userId: user?.userId || 'system',
          displayName: user?.displayName || 'ระบบ',
        },
        actionType: 'CANCEL',
      })

      const updatedBills = fetchBills()
      setBills(updatedBills)

      showToast('ยกเลิกบิลสำเร็จ', `ยกเลิกบิล ${selectedBillForCancel.billNo} เรียบร้อยแล้ว`, 'SUCCESS')
      setSelectedBillForCancel(null)
      setCancelReason('')
      setSelectedRowBill(null)
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการยกเลิกบิล', err?.message || 'ไม่สามารถยกเลิกบิลได้', 'ERROR')
    }
  }

  return (
    <div className={`h-full min-h-0 flex flex-col overflow-hidden ${activeWorkflow ? 'p-1 sm:p-1.5 md:p-2 gap-1.5 sm:gap-2' : 'p-2.5 sm:p-3 md:p-4 gap-2 sm:gap-2.5'} bg-slate-100 dark:bg-slate-900 text-xs`}>

      {activeWorkflow ? (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {activeWorkflow === 'CORRECTION' || activeWorkflow === 'EXTENSION' ? (
            <BillRevisionView
              bill={selectedRowBill!}
              mode={activeWorkflow}
              onClose={() => {
                setActiveWorkflow(null)
                setSelectedRowBill(null)
              }}
              onSaved={async () => {
                setActiveWorkflow(null)
                setSelectedRowBill(null)
                await loadBills()
              }}
            />
          ) : (
            <BillActionView 
              customerName={selectedRowBill?.customerName || ''}
              bills={bills}
              setBills={setBills}
              initialMode={activeWorkflow}
              initialBillId={selectedRowBill?.id}
              onClose={() => {
                setActiveWorkflow(null)
                setSelectedRowBill(null)
              }}
            />
          )}
        </div>
      ) : (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 shrink-0">
            <div className="bg-blue-50/60 dark:bg-blue-950/40 p-2 sm:p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] text-blue-700 dark:text-blue-300 font-semibold">กำลังเช่าอยู่</span>
                <h3 className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">{rentingCount} บิล</h3>
              </div>
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-300">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="bg-red-50/60 dark:bg-red-950/40 p-2 sm:p-2.5 rounded-xl border border-red-200 dark:border-red-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] text-red-700 dark:text-red-300 font-semibold">เกินกำหนดคืน</span>
                <h3 className="text-base sm:text-lg font-black text-red-600 dark:text-red-400 mt-0.5">{overdueCount} บิล</h3>
              </div>
              <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-600 dark:text-red-300">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="bg-amber-50/60 dark:bg-amber-950/40 p-2 sm:p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-300 font-semibold">ค้างชำระ</span>
                <h3 className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{unpaidCount} บิล</h3>
              </div>
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600 dark:text-amber-300">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-2 sm:p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">ปิดบิลแล้ว</span>
                <h3 className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{closedCount} บิล</h3>
              </div>
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
            {/* Filter Toolbar */}
          <div className="p-2 sm:p-2.5 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-2 shrink-0">
            {/* Row 1: Search & Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาเลขบิล, ชื่อลูกค้า หรือ เบอร์โทรศัพท์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="w-36 sm:w-44">
                  <CustomSelect
                    value={rentalFilter}
                    onChange={(val) => setRentalFilter(String(val))}
                    options={[
                      { value: 'ALL', label: 'สถานะเช่า: ทั้งหมด' },
                      { value: 'DRAFT', label: `แบบร่าง (${draftCount})` },
                      { value: 'RENTING', label: 'เปิดอยู่ / กำลังเช่า' },
                      { value: 'OVERDUE', label: 'เกินกำหนดคืน' },
                      { value: 'PARTIAL_RETURNED', label: 'คืนบางส่วน' },
                      { value: 'CLOSED', label: 'ปิดบิลแล้ว' },
                      { value: 'CANCELLED', label: 'ยกเลิกบิล' },
                    ]}
                    align="left"
                    direction="down"
                  />
                </div>

                <div className="w-36 sm:w-44">
                  <CustomSelect
                    value={paymentFilter}
                    onChange={(val) => setPaymentFilter(String(val))}
                    options={[
                      { value: 'ALL', label: 'การชำระ: ทั้งหมด' },
                      { value: 'PAID', label: 'ชำระแล้ว' },
                      { value: 'PARTIAL', label: 'ชำระบางส่วน' },
                      { value: 'UNPAID', label: 'ค้างชำระ' },
                    ]}
                    align="left"
                    direction="down"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Action Buttons (Responsive with smooth horizontal scroll) */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-2 gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0">
                {selectedRowBill?.rentalStatus === 'DRAFT' ? (
                  <>
                    <button
                      onClick={() => router.push(`/pos?draftBillId=${selectedRowBill.id}`)}
                      className="px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-all shrink-0"
                      title="เปิดแบบร่างใน POS เพื่อแก้ไข"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>แก้ไขแบบร่าง</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm(`ยืนยันการเปิดบิลจากแบบร่าง ${selectedRowBill.billNo} ใช่หรือไม่?`)) {
                          try {
                            confirmDraftBillWorkflow({
                              billId: selectedRowBill.id,
                              actor: {
                                userId: user?.userId || 'system',
                                displayName: user?.displayName || 'ระบบ',
                              },
                            })
                            showToast('ยืนยันบิลสำเร็จ', `ยืนยันบิล ${selectedRowBill.billNo} เรียบร้อยแล้ว`, 'SUCCESS')
                            await loadBills()
                          } catch (err: any) {
                            showToast('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถยืนยันบิลได้', 'ERROR')
                          }
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-all shrink-0"
                      title="ยืนยันออกบิลเช่าจริง"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ยืนยันบิล</span>
                    </button>

                    {canHardDeleteBill(selectedRowBill) && (
                      <button
                        onClick={async () => {
                          if (confirm(`คุณต้องการลบแบบร่าง ${selectedRowBill.billNo} หรือไม่?`)) {
                            try {
                              deleteBillFromStorage(selectedRowBill.id)
                              showToast('ลบแบบร่างสำเร็จ', `ลบแบบร่าง ${selectedRowBill.billNo} เรียบร้อยแล้ว`, 'SUCCESS')
                              setSelectedRowBill(null)
                              await loadBills()
                            } catch (err: any) {
                              showToast('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถลบแบบร่างได้', 'ERROR')
                            }
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-all shrink-0"
                        title="ลบแบบร่างนี้ทิ้ง"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบแบบร่าง</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {/* Action Button 1: รับคืนสินค้า */}
                    <button
                      disabled={!selectedRowBill}
                      onClick={() => setActiveWorkflow('RETURN')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 ${
                        selectedRowBill
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-[1.02] cursor-pointer'
                          : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                      }`}
                      title="รับคืนสินค้าจากลูกค้า"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>รับคืนสินค้า</span>
                    </button>
                    
                    {/* Action Button 2: รับชำระเงิน */}
                    <button
                      disabled={!selectedRowBill}
                      onClick={() => setActiveWorkflow('PAYMENT')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 ${
                        selectedRowBill
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 hover:scale-[1.02] cursor-pointer'
                          : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                      }`}
                      title="บันทึกรับชำระเงิน"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>รับชำระเงิน</span>
                    </button>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

                    <button
                      disabled={!selectedRowBill || !['RENTING', 'PARTIAL_RETURNED'].includes(selectedRowBill.rentalStatus)}
                      onClick={() => setActiveWorkflow('CORRECTION')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 ${
                        selectedRowBill && ['RENTING', 'PARTIAL_RETURNED'].includes(selectedRowBill.rentalStatus)
                          ? 'bg-violet-600 hover:bg-violet-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                      }`}
                      title="แก้ไขรายการในบิล"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>แก้ไขบิล</span>
                    </button>

                    <button
                      disabled={!selectedRowBill || !['RENTING', 'PARTIAL_RETURNED'].includes(selectedRowBill.rentalStatus)}
                      onClick={() => setActiveWorkflow('EXTENSION')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 ${
                        selectedRowBill && ['RENTING', 'PARTIAL_RETURNED'].includes(selectedRowBill.rentalStatus)
                          ? 'bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                      }`}
                      title="ขยายเวลาเช่าต่อ"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>เช่าต่อ</span>
                    </button>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

                    <button
                      disabled={!selectedRowBill || selectedRowBill.heldDepositAmount <= 0}
                      onClick={() => setShowDepositRefund(true)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 ${
                        selectedRowBill && selectedRowBill.heldDepositAmount > 0
                          ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                      }`}
                      title="คืนเงินมัดจำให้ลูกค้า"
                    >
                      <WalletCards className="w-3.5 h-3.5" />
                      <span>คืนมัดจำ</span>
                    </button>

                    <button
                      disabled={!selectedRowBill || selectedRowBill.paidAmount <= 0}
                      onClick={() => setShowPaymentRefund(true)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 ${
                        selectedRowBill && selectedRowBill.paidAmount > 0
                          ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                      }`}
                      title="คืนเงินรับชำระ"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>คืนเงินรับชำระ</span>
                    </button>
                  </>
                )}

                {selectedRowBill && (
                  <button
                    onClick={() => setSelectedBillForLog(selectedRowBill)}
                    className="px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm bg-slate-700 hover:bg-slate-600 text-white cursor-pointer transition-all shrink-0"
                    title="ดูประวัติและไทม์ไลน์ของบิล"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>ประวัติบิล</span>
                  </button>
                )}
              </div>

              {selectedRowBill && (
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] shrink-0 font-medium text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">เลือกบิล:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedRowBill.billNo}</span>
                  <span className="truncate max-w-[120px]">({selectedRowBill.customerName})</span>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-16 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-3" />
              <span className="text-sm font-semibold">กำลังโหลดข้อมูลบิล...</span>
            </div>
          )}

          {/* Responsive Bills View */}
          {!isLoading && (
            <>
          {/* 1. Mobile Card View (< md screens) */}
          <div className="md:hidden flex-1 min-h-0 overflow-hidden flex flex-col justify-between">
            <div className="flex-1 min-h-0 overflow-hidden space-y-2.5 pr-1">
            {paginatedBills.map((b) => {
              const overdue = isOverdueBill(b)
              const overdueDays = getOverdueDays(b)

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedRowBill(b)}
                  className={`p-3 rounded-2xl border shadow-sm space-y-2.5 cursor-pointer transition-all ${selectedRowBill?.id === b.id ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-500/50' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 block">
                        {b.billNo}
                      </span>
                      <span className="text-[11px] text-slate-400 block">วันที่ออกบิล: {b.billDate}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.rentalStatus === 'DRAFT'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300'
                            : b.rentalStatus === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : b.rentalStatus === 'CLOSED'
                                ? 'bg-slate-200 text-slate-700'
                                : overdue
                                  ? 'bg-red-100 text-red-700 border border-red-300'
                                  : b.rentalStatus === 'RENTING'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-amber-100 text-amber-700'
                          }`}
                      >
                        {b.rentalStatus === 'DRAFT'
                          ? 'แบบร่าง'
                          : b.rentalStatus === 'CANCELLED'
                            ? 'ยกเลิก'
                            : b.rentalStatus === 'CLOSED'
                              ? 'ปิดบิล'
                              : overdue
                                ? `เกินกำหนด (${overdueDays} วัน)`
                                : b.rentalStatus === 'RENTING'
                                  ? 'กำลังเช่า'
                                  : 'คืนบางส่วน'}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : b.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {b.paymentStatus === 'PAID' ? 'ชำระแล้ว' : b.paymentStatus === 'PARTIAL' ? 'ชำระบางส่วน' : 'ค้างชำระ'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-700/80">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ลูกค้า:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {b.customerName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{b.customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">กำหนดคืน:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {b.scheduledReturnDate}
                      </span>
                      {overdue && (
                        <span className="text-[10px] font-bold text-red-600 block">
                          เกิน {overdueDays} วัน
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">ยอดสุทธิ / ค้างชำระ:</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">
                        ฿{b.grandTotal.toLocaleString()}
                      </span>
                      {b.outstandingAmount > 0 && (
                        <span className="text-red-600 font-bold ml-1 text-[11px]">
                          (คงค้าง ฿{b.outstandingAmount.toLocaleString()})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {b.rentalStatus === 'DRAFT' ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/pos?draftBillId=${b.id}`)
                            }}
                            className="p-1.5 rounded-xl text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60"
                            title="แก้ไขแบบร่างใน POS"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              if (confirm(`ต้องการลบแบบร่าง ${b.billNo} หรือไม่?`)) {
                                const ok = deleteBillFromStorage(b.id)
                                if (ok) {
                                  showToast('ลบแบบร่างสำเร็จ', `ลบแบบร่าง ${b.billNo} แล้ว`, 'SUCCESS')
                                  await loadBills()
                                }
                              }
                            }}
                            className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60"
                            title="ลบแบบร่าง"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedBillForLog(b)}
                            className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="ประวัติ"
                          >
                            <History className="w-4 h-4 text-blue-500" />
                          </button>

                          <button
                            onClick={() => window.print()}
                            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            title="พิมพ์บิล (A4)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {paginatedBills.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
                <Receipt className="w-8 h-8 opacity-40 mb-1" />
                <span className="text-xs font-semibold">ไม่พบรายการบิล</span>
                <span className="text-[10px] mt-1 text-slate-500">ลองปรับตัวกรองหรือเพิ่มบิลใหม่จาก POS</span>
              </div>
            )}
            </div>

            {/* Mobile Pagination */}
            <div className="shrink-0 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
              <span>หน้า {billsCurrentPage} / {billsTotalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setBillsCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={billsCurrentPage === 1}
                  className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 font-bold"
                >
                  ก่อนหน้า
                </button>
                <button
                  type="button"
                  onClick={() => setBillsCurrentPage((p) => Math.min(billsTotalPages, p + 1))}
                  disabled={billsCurrentPage === billsTotalPages || billsTotalPages === 0}
                  className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 font-bold"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>

          {/* 2. Compact Table View (>= md screens) */}
          <div className="hidden md:flex flex-1 min-h-0 overflow-hidden flex-col justify-between">
            <div ref={billsTableContainerRef} className="flex-1 min-h-0 min-w-0 overflow-hidden">
              <table className="w-full text-left border-collapse text-[10px] leading-tight table-fixed">
                <colgroup>
                  <col className="w-[88px] sm:w-[96px] lg:w-[108px]" />
                  <col className="w-auto" />
                  <col className="w-[74px] sm:w-[82px] lg:w-[90px]" />
                  <col className="w-[48px] sm:w-[54px] lg:w-[60px]" />
                  <col className="w-[68px] sm:w-[78px] lg:w-[86px]" />
                  <col className="w-[68px] sm:w-[78px] lg:w-[86px]" />
                  <col className="w-[68px] sm:w-[78px] lg:w-[86px]" />
                  <col className="w-[64px] sm:w-[72px] lg:w-[80px]" />
                  <col className="w-[64px] sm:w-[72px] lg:w-[80px]" />
                  <col className="w-[58px] sm:w-[76px] lg:w-[104px]" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 shadow-xs text-xs">
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-xs">
                    <th className="px-1 py-2 bg-slate-50 dark:bg-slate-900 whitespace-nowrap">เลขที่บิล</th>
                    <th className="px-1 py-2 bg-slate-50 dark:bg-slate-900 whitespace-nowrap">ลูกค้า / เบอร์</th>
                    <th className="px-1 py-2 bg-slate-50 dark:bg-slate-900 whitespace-nowrap">กำหนดคืน</th>
                    <th className="px-1 py-2 text-center bg-slate-50 dark:bg-slate-900 whitespace-nowrap">วันเกิน</th>
                    <th className="px-1 py-2 text-right bg-slate-50 dark:bg-slate-900 whitespace-nowrap">ยอดสุทธิ</th>
                    <th className="px-1 py-2 text-right bg-slate-50 dark:bg-slate-900 whitespace-nowrap">ชำระแล้ว</th>
                    <th className="px-1 py-2 text-right bg-slate-50 dark:bg-slate-900 whitespace-nowrap">คงค้าง</th>
                    <th className="px-1 py-2 text-center bg-slate-50 dark:bg-slate-900 whitespace-nowrap">สถานะเช่า</th>
                    <th className="px-1 py-2 text-center bg-slate-50 dark:bg-slate-900 whitespace-nowrap">การชำระ</th>
                    <th className="px-1 py-2 text-center bg-slate-50 dark:bg-slate-900 whitespace-nowrap">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {paginatedBills.map((b) => {
                    const overdue = isOverdueBill(b)
                    const overdueDays = getOverdueDays(b)
                    const isClosed = b.rentalStatus === 'CLOSED' || b.rentalStatus === 'CANCELLED'

                    return (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedRowBill(b)}
                        className={`transition-colors cursor-pointer ${selectedRowBill?.id === b.id ? 'bg-emerald-50/50 dark:bg-emerald-900/20 ring-1 ring-inset ring-emerald-500/30' : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/30'}`}
                      >
                        <td className="px-1 py-1.5 font-bold font-mono text-blue-600 dark:text-blue-400 truncate text-[10px]">
                          {b.billNo}
                        </td>
                        <td className="px-1 py-1.5 space-y-px overflow-hidden">
                          <div className="font-bold text-slate-900 dark:text-slate-100 truncate text-[10px]">
                            {b.customerName}
                          </div>
                          <div className="text-slate-500 text-[10px] flex items-center gap-0.5 font-mono truncate">
                            <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span className="truncate">{b.customerPhone}</span>
                          </div>
                        </td>
                        <td className="px-1 py-1.5 font-semibold text-slate-700 dark:text-slate-300 truncate text-[10px] font-mono">
                          {b.scheduledReturnDate}
                        </td>
                        <td className="px-1 py-1.5 text-center truncate">
                          {overdue ? (
                            <span className="px-1 py-0.5 rounded-full bg-red-100 text-red-700 font-black text-[10px] whitespace-nowrap">
                              +{overdueDays} วัน
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px]">-</span>
                          )}
                        </td>
                        <td className="px-1 py-1.5 text-right font-extrabold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap text-[10px]">
                          ฿{b.grandTotal.toLocaleString('th-TH')}
                        </td>
                        <td className="px-1 py-1.5 text-right text-emerald-600 font-semibold tabular-nums whitespace-nowrap text-[10px]">
                          ฿{b.paidAmount.toLocaleString('th-TH')}
                        </td>
                        <td className="px-1 py-1.5 text-right font-bold text-red-600 tabular-nums whitespace-nowrap text-[10px]">
                          ฿{b.outstandingAmount.toLocaleString('th-TH')}
                        </td>
                        <td className="px-1 py-1.5 text-center truncate">
                          <span
                            className={`inline-flex px-1 sm:px-1.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                              b.rentalStatus === 'DRAFT'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300'
                                : b.rentalStatus === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800'
                                  : b.rentalStatus === 'CLOSED'
                                    ? 'bg-slate-200 text-slate-700'
                                    : overdue
                                      ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300'
                                      : b.rentalStatus === 'RENTING'
                                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {b.rentalStatus === 'DRAFT'
                              ? 'แบบร่าง'
                              : b.rentalStatus === 'CANCELLED'
                                ? 'ยกเลิก'
                                : b.rentalStatus === 'CLOSED'
                                  ? 'ปิดบิล'
                                  : overdue
                                    ? 'เกินกำหนด'
                                    : b.rentalStatus === 'RENTING'
                                      ? 'กำลังเช่า'
                                      : 'คืนบางส่วน'}
                          </span>
                        </td>
                        <td className="px-1 py-1.5 text-center truncate">
                          <span
                            className={`inline-flex px-1 sm:px-1.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${b.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : b.paymentStatus === 'PARTIAL'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                  : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                              }`}
                          >
                            {b.paymentStatus === 'PAID'
                              ? 'ชำระแล้ว'
                              : b.paymentStatus === 'PARTIAL'
                                ? 'ชำระบางส่วน'
                                : 'ค้างชำระ'}
                          </span>
                        </td>
                        <td className="px-0.5 sm:px-1 py-1 text-center">
                          {b.rentalStatus === 'DRAFT' ? (
                            <div className="grid grid-cols-3 sm:flex sm:flex-row items-center justify-center gap-0.5 sm:gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/pos?draftBillId=${b.id}`)
                                }}
                                className="inline-flex h-5.5 w-5.5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 items-center justify-center rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors cursor-pointer"
                                title="แก้ไขแบบร่างใน POS"
                              >
                                <FileEdit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  if (confirm(`ยืนยันการเปิดบิลเช่าจากแบบร่าง ${b.billNo}?`)) {
                                    try {
                                      const res = await confirmDraftBillWorkflow({
                                        billId: b.id,
                                        actor: {
                                          userId: user?.id || 'staff',
                                          displayName: user?.displayName || 'STAFF',
                                        },
                                      })
                                      if (res.bill) {
                                        showToast('เปิดบิลสำเร็จ', `แปลงแบบร่าง ${b.billNo} เป็นบิลเช่าเรียบร้อยแล้ว`, 'SUCCESS')
                                        await loadBills()
                                      }
                                    } catch (err: any) {
                                      showToast('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถยืนยันบิลได้', 'ERROR')
                                    }
                                  }
                                }}
                                className="inline-flex h-5.5 w-5.5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                                title="ยืนยันเปิดบิลจริง"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  if (confirm(`ต้องการลบแบบร่าง ${b.billNo} หรือไม่?`)) {
                                    const ok = deleteBillFromStorage(b.id)
                                    if (ok) {
                                      showToast('ลบแบบร่างสำเร็จ', `ลบแบบร่าง ${b.billNo} แล้ว`, 'SUCCESS')
                                      await loadBills()
                                    } else {
                                      showToast('เกิดข้อผิดพลาด', 'ไม่สามารถลบแบบร่างได้', 'ERROR')
                                    }
                                  }
                                }}
                                className="inline-flex h-5.5 w-5.5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                                title="ลบแบบร่าง"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-0.5 sm:gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedBillForLog(b)
                                }}
                                className="inline-flex h-5.5 w-5.5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                title="ดูประวัติ"
                              >
                                <History className="w-3.5 h-3.5 text-blue-500" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedBillForLine(b as any)
                                }}
                                className="inline-flex h-5.5 w-5.5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                                title="ส่งการแจ้งเตือน LINE"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.print()
                                }}
                                className="inline-flex h-5.5 w-5.5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                title="พิมพ์บิล (A4)"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {!isClosed ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedBillForCancel(b)
                                  }}
                                  className="inline-flex h-5.5 w-5.5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                                  title="ยกเลิกบิล"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <div className="h-5.5 w-5.5 sm:hidden" />
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {paginatedBills.length === 0 && (
                    <tr data-empty-row="true">
                      <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <Receipt className="w-8 h-8 opacity-40 mb-1" />
                          <span className="font-semibold">ยังไม่มีรายการบิล</span>
                          <span className="text-[11px] text-slate-400">ลองปรับตัวกรองหรือเพิ่มบิลใหม่จาก POS</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Desktop Pagination Footer */}
            <div className="shrink-0 p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">
                แสดง {filteredBills.length > 0 ? billsStartIndex + 1 : 0} ถึง {Math.min(billsEndIndex, filteredBills.length)} จากทั้งหมด {filteredBills.length} รายการ
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setBillsCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={billsCurrentPage === 1}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 font-bold transition-colors cursor-pointer"
                >
                  ก่อนหน้า
                </button>
                <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
                  {billsCurrentPage} / {billsTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setBillsCurrentPage((p) => Math.min(billsTotalPages, p + 1))}
                  disabled={billsCurrentPage === billsTotalPages || billsTotalPages === 0}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 font-bold transition-colors cursor-pointer"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  </>
)}

      <DepositRefundModal
        isOpen={showDepositRefund && !!selectedRowBill}
        bill={selectedRowBill}
        onClose={() => setShowDepositRefund(false)}
        onSaved={loadBills}
      />

      {selectedRowBill && (
        <PaymentRefundModal
          isOpen={showPaymentRefund}
          rentalBillId={selectedRowBill.id}
          billNo={selectedRowBill.billNo}
          onClose={() => setShowPaymentRefund(false)}
          onSuccess={async (message) => {
            showToast('คืนเงินสำเร็จ', message, 'SUCCESS')
            await loadBills()
          }}
        />
      )}

      {/* Audit Log Modal */}
      {selectedBillForLog && (
        <AuditLogViewerModal
          billId={selectedBillForLog.id}
          billNo={selectedBillForLog.billNo}
          customerName={selectedBillForLog.customerName}
          onClose={() => setSelectedBillForLog(null)}
        />
      )}

      {/* Cancel Modal */}
      <AppModal
        isOpen={!!selectedBillForCancel}
        onClose={() => setSelectedBillForCancel(null)}
        size="sm"
      >
        {selectedBillForCancel && (
          <>
            <AppModalHeader
              onClose={() => setSelectedBillForCancel(null)}
              icon={<XCircle className="w-5 h-5 text-red-500" />}
              title={`ยกเลิกบิลเช่า (${selectedBillForCancel.billNo})`}
            />

            <form onSubmit={handleConfirmCancelBill} className="flex-1 min-h-0 flex flex-col">
              <AppModalBody className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-300">
                  คุณกำลังจะยกเลิกบิลเช่าของ <strong className="text-slate-900 dark:text-slate-100">{selectedBillForCancel.customerName}</strong>
                </p>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-200">
                    ระบุเหตุผลในการยกเลิกบิล <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="เช่น ลูกค้าขอยกเลิกงาน..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>
              </AppModalBody>

              <AppModalFooter>
                <button
                  type="button"
                  onClick={() => setSelectedBillForCancel(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
                >
                  ยืนยันยกเลิกบิล
                </button>
              </AppModalFooter>
            </form>
          </>
        )}
      </AppModal>

      {/* Line Notify Modal */}
      <LineNotifyModal
        isOpen={!!selectedBillForLine}
        onClose={() => setSelectedBillForLine(null)}
        billData={
          selectedBillForLine
            ? {
              id: selectedBillForLine.id,
              billNo: selectedBillForLine.billNo,
              customerName: selectedBillForLine.customerName,
              customerPhone: selectedBillForLine.customerPhone,
              returnDate: selectedBillForLine.scheduledReturnDate,
              grandTotal: selectedBillForLine.grandTotal,
              outstandingAmount: selectedBillForLine.outstandingAmount,
              rentalStatus: selectedBillForLine.rentalStatus,
            }
            : null
        }
      />


    </div>
  )
}

