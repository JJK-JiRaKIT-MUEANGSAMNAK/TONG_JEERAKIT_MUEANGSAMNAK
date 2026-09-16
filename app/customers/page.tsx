'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Search,
  Edit,
  ShieldOff,
  ShieldCheck,
  Eye,
  FileText,
  CreditCard,
  Package,
  BarChart3,
  Tag,
  History,
  Upload,
  CheckCircle2,
  Trash2,
  UserCheck,
  AlertTriangle,
  Printer,
  Receipt,
  Save,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'
import {
  Customer,
  RentalBill,
  CustomerPaymentRecord,
  CustomerOutstandingItemRecord,
  CustomerReturnStats,
} from '@/lib/types/rental-pos'
import { NewCustomerModal } from '@/components/customers/NewCustomerModal'
import { useToast } from '@/components/common/Toast'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { logger } from '@/lib/utils/logger'
import { loadCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/lib/customer-storage'
import { loadRentalBills, deleteBill, canHardDeleteBill } from '@/lib/bill-storage'
import { returnProductStock, restoreSaleProductStock } from '@/lib/product-storage'
import { loadTransactions } from '@/lib/finance-storage'
import { useAuth } from '@/lib/contexts/AuthContext'
import { recordAuditLog, generateCorrelationId } from '@/lib/audit-storage'
import { cancelOrVoidBillWorkflow } from '@/lib/bill-workflow-service'
import { useAutoFitPageSize } from '@/lib/hooks/useAutoFitPageSize'

export default function CustomersPage() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [bills, setBills] = useState<RentalBill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [billSearchTerm, setBillSearchTerm] = useState<string>('')
  const [suspendingCustomerId, setSuspendingCustomerId] = useState<string | null>(null)

  // Customer 360 Sub-tabs Data State (from DB)
  const [customerPayments, setCustomerPayments] = useState<CustomerPaymentRecord[]>([])
  const [customerOutstandingItems, setCustomerOutstandingItems] = useState<CustomerOutstandingItemRecord[]>([])
  const [customerReturnStats, setCustomerReturnStats] = useState<CustomerReturnStats>({
    totalReturnedItemsWithDates: 0,
    onTimeReturnedItems: 0,
    onTimeRatePercent: null,
  })
  const [customerNoteInput, setCustomerNoteInput] = useState<string>('')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [isLoadingCustomerDetails, setIsLoadingCustomerDetails] = useState(false)

  // Zoom ID Card Modal State
  const [zoomIDCardUrl, setZoomIDCardUrl] = useState<string | null>(null)

  // Add / Edit Modal State
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  // Delete Customer Confirmation State
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [customerDeleteReason, setCustomerDeleteReason] = useState('')

  // Active Tab State inside Customer Details
  const [active360Tab, setActive360Tab] = useState<
    | 'GENERAL'
    | 'RENTAL_HISTORY'
    | 'PAYMENT_HISTORY'
    | 'OUTSTANDING_ITEMS'
    | 'DOCUMENTS'
    | 'ANALYTICS'
    | 'NOTES_TAGS'
  >('GENERAL')

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const c = loadCustomers()
      const b = loadRentalBills()
      setCustomers(c)
      setBills(b)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Fetch Customer 360 detailed records whenever selectedCustomerId changes
  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerPayments([])
      setCustomerOutstandingItems([])
      setCustomerReturnStats({ totalReturnedItemsWithDates: 0, onTimeReturnedItems: 0, onTimeRatePercent: null })
      setCustomerNoteInput('')
      return
    }

    const currentCustomer = customers.find((c) => c.id === selectedCustomerId)
    setCustomerNoteInput(currentCustomer?.note || '')

    // Payments from finance transactions
    const allTx = loadTransactions()
    const matchingTx = allTx.filter(
      (tx) => tx.customerName && currentCustomer && tx.customerName.toLowerCase() === currentCustomer.customerName.toLowerCase()
    )
    const payments: CustomerPaymentRecord[] = matchingTx.map((tx) => ({
      id: tx.id,
      paymentNo: tx.refNo,
      paymentDate: tx.dateTime,
      paymentMethod: tx.channel,
      amount: tx.incomeAmount,
      status: 'SUCCESS',
      billNo: tx.refNo,
    }))
    setCustomerPayments(payments)

    // Outstanding items from customerBills
    const currentBills = bills.filter(
      (b) => currentCustomer && (b.customerId === currentCustomer.id || b.customerName === currentCustomer.customerName)
    )
    const outstanding: CustomerOutstandingItemRecord[] = []
    currentBills
      .filter((b) => b.rentalStatus === 'RENTING')
      .forEach((b) => {
        b.items.forEach((item) => {
          if (item.rentalType === 'SALE' || item.requiresReturn === false) return
          const remaining = item.outstandingQuantity ?? (item.quantity - (item.returnedQuantity || 0))
          if (remaining > 0) {
            const isOverdue = b.rentalEndDate ? new Date(b.rentalEndDate) < new Date() : false
            outstanding.push({
              id: item.id || `out-${b.id}-${item.productId}`,
              billId: b.id,
              billNo: b.billNo,
              billDate: b.billDate,
              productId: item.productId,
              productName: item.productName,
              rentalType: item.rentalType,
              totalQuantity: item.quantity,
              returnedQuantity: item.returnedQuantity || 0,
              damagedQuantity: item.damagedQuantity || 0,
              lostQuantity: item.lostQuantity || 0,
              outstandingQuantity: remaining,
              unitName: item.unitName || 'ชิ้น',
              unitPrice: item.unitPrice,
              rentalStartDate: item.dailyStartDate || b.rentalStartDate,
              scheduledReturnDate: item.dailyEndDate || b.rentalEndDate,
              overdueDays: 0,
              isOverdue,
            })
          }
        })
      })
    setCustomerOutstandingItems(outstanding)
  }, [selectedCustomerId, customers, bills])

  const selectedCustomer: Customer | undefined = customers.find((c) => c.id === selectedCustomerId)

  // Filter bills for selected customer
  const customerBills = selectedCustomer
    ? bills.filter(
        (b) => b.customerId === selectedCustomer.id || b.customerName === selectedCustomer.customerName
      ).filter(
        (b) =>
          b.billNo.toLowerCase().includes(billSearchTerm.toLowerCase()) ||
          b.customerName.toLowerCase().includes(billSearchTerm.toLowerCase())
      )
    : []

  // Metrics calculation for RENTAL_HISTORY tab
  const totalBills = customerBills.length
  const totalSpent = customerBills.reduce((sum, b) => sum + b.grandTotal, 0)
  const totalOutstanding = customerBills.reduce((sum, b) => sum + b.outstandingAmount, 0)
  const activeRentingBills = customerBills.filter((b) => b.rentalStatus === 'RENTING').length

  // Auto-fit pagination for customer tabs
  const rentalAutoFit = useAutoFitPageSize({
    totalItems: customerBills.length,
    activeKey: active360Tab,
    defaultRowHeight: 40,
    defaultHeaderHeight: 38,
  })
  const paginatedCustomerBills = customerBills.slice(rentalAutoFit.startIndex, rentalAutoFit.endIndex)

  const paymentAutoFit = useAutoFitPageSize({
    totalItems: customerPayments.length,
    activeKey: active360Tab,
    defaultRowHeight: 40,
    defaultHeaderHeight: 38,
  })
  const paginatedCustomerPayments = customerPayments.slice(paymentAutoFit.startIndex, paymentAutoFit.endIndex)

  const outstandingAutoFit = useAutoFitPageSize({
    totalItems: customerOutstandingItems.length,
    activeKey: active360Tab,
    defaultRowHeight: 40,
    defaultHeaderHeight: 38,
  })
  const paginatedCustomerOutstandingItems = customerOutstandingItems.slice(
    outstandingAutoFit.startIndex,
    outstandingAutoFit.endIndex
  )

  // Bill Delete Confirmation State
  const [billToDelete, setBillToDelete] = useState<RentalBill | null>(null)
  const [deleteBillReason, setDeleteBillReason] = useState('')
  const [isDeletingBill, setIsDeletingBill] = useState(false)

  const handleConfirmDeleteBill = async () => {
    if (!billToDelete) return
    const reason = deleteBillReason.trim()
    if (!reason) {
      showToast('กรุณาระบุเหตุผล', 'จำเป็นต้องระบุเหตุผลในการลบบิล (DELETE_REASON_REQUIRED)', 'ERROR')
      return
    }
    setIsDeletingBill(true)
    try {
      const actorUserId = user?.userId || 'system'
      const actorDisplayName = user?.displayName || 'ระบบ'

      if (canHardDeleteBill(billToDelete)) {
        // Only draft bills with no transactions can be hard deleted
        deleteBill(billToDelete.id)
        setBills((prev) => prev.filter((b) => b.id !== billToDelete.id))
        showToast(
          'ลบรายการบิลฉบับร่างสำเร็จ',
          `ลบรายการบิลฉบับร่าง ${billToDelete.billNo} ออกจากระบบเรียบร้อยแล้ว`,
          'SUCCESS'
        )
      } else {
        // Confirmed or transactional bills must NOT be hard deleted; transition to VOID via lifecycle workflow
        cancelOrVoidBillWorkflow({
          billId: billToDelete.id,
          reason,
          actor: {
            userId: actorUserId,
            displayName: actorDisplayName,
          },
          actionType: 'VOID',
        })
        const updatedBills = loadRentalBills()
        setBills(updatedBills)
        showToast(
          'โมฆะบิลสำเร็จ',
          `บิล ${billToDelete.billNo} มีธุรกรรมแล้ว ระบบได้เปลี่ยนสถานะเป็น VOID เพื่อรักษาประวัติการเงินและสต็อก`,
          'SUCCESS'
        )
      }

      setBillToDelete(null)
      setDeleteBillReason('')
    } catch (err: any) {
      logger.error('Failed to delete/void bill:', err)
      showToast('ดำเนินการไม่สำเร็จ', err?.message || 'เกิดข้อผิดพลาดในการดำเนินการกับบิล', 'ERROR')
    } finally {
      setIsDeletingBill(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingCustomer(null)
    setShowAddEditModal(true)
  }

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c)
    setShowAddEditModal(true)
  }

  const handleToggleSuspend = async (c: Customer) => {
    if (suspendingCustomerId) return

    const targetSuspend = !c.isSuspended
    const reasonPrompt = window.prompt(
      targetSuspend
        ? `กรุณาระบุเหตุผลในการระงับสิทธิ์ลูกค้า "${c.customerName}" (จำเป็น):`
        : `กรุณาระบุเหตุผลในการปลดระงับสิทธิ์ลูกค้า "${c.customerName}" (จำเป็น):`
    )
    const trimmedReason = reasonPrompt?.trim()
    if (!trimmedReason) {
      if (reasonPrompt !== null) {
        showToast('กรุณาระบุเหตุผล', 'จำเป็นต้องระบุเหตุผลในการเปลี่ยนสถานะสิทธิ์ลูกค้า', 'ERROR')
      }
      return
    }

    setSuspendingCustomerId(c.id)

    try {
      const updatedCustomer = { ...c, isSuspended: targetSuspend }
      updateCustomer(updatedCustomer)
      setCustomers((prev) =>
        prev.map((item) => (item.id === updatedCustomer.id ? updatedCustomer : item))
      )
      showToast(
        targetSuspend ? 'ระงับสิทธิ์ลูกค้าแล้ว' : 'ปลดระงับสิทธิ์แล้ว',
        `ปรับเปลี่ยนสถานะสิทธิ์ของ ${updatedCustomer.customerName} เรียบร้อยแล้ว`,
        targetSuspend ? 'ERROR' : 'SUCCESS'
      )
    } catch (err: any) {
      showToast('ไม่สามารถเปลี่ยนสถานะได้', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
    } finally {
      setSuspendingCustomerId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return
    const trimmedReason = customerDeleteReason.trim()
    if (!trimmedReason) {
      showToast('กรุณาระบุเหตุผล', 'จำเป็นต้องระบุเหตุผลในการลบลูกค้า', 'ERROR')
      return
    }

    try {
      deleteCustomer(customerToDelete.id)
      setCustomers((prev) => prev.filter((item) => item.id !== customerToDelete.id))
      if (selectedCustomerId === customerToDelete.id) {
        setSelectedCustomerId('')
      }
      showToast(
        'ลบลูกค้าสำเร็จ',
        `ทำการลบข้อมูลลูกค้า ${customerToDelete.customerName} เรียบร้อยแล้ว`,
        'SUCCESS'
      )
      setCustomerDeleteReason('')
      setCustomerToDelete(null)
    } catch (err: any) {
      showToast('ไม่สามารถลบข้อมูลลูกค้าได้', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
    }
  }

  const handleSaveCustomer = async (updatedCustomer: Customer, reason?: string) => {
    const exists = customers.find((c) => c.id === updatedCustomer.id)
    if (exists) {
      const trimmedReason = reason?.trim()
      if (!trimmedReason) {
        showToast('กรุณาระบุเหตุผล', 'จำเป็นต้องระบุเหตุผลในการแก้ไขข้อมูลลูกค้า', 'ERROR')
        return
      }
      updateCustomer(updatedCustomer)
      setCustomers(customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)))
      showToast('แก้ไขข้อมูลลูกค้าสำเร็จ', `ปรับปรุงข้อมูลของ ${updatedCustomer.customerName} เรียบร้อยแล้ว`, 'SUCCESS')
    } else {
      const newCustomer = { ...updatedCustomer, id: updatedCustomer.id || `cust-${Date.now()}` }
      addCustomer(newCustomer)
      setCustomers([newCustomer, ...customers])
      setSelectedCustomerId(newCustomer.id)
      showToast('เพิ่มลูกค้าใหม่สำเร็จ', `บันทึกข้อมูลลูกค้า ${newCustomer.customerName} เรียบร้อยแล้ว`, 'SUCCESS')
    }
  }

  const handleSaveNote = async () => {
    if (!selectedCustomer) return
    const reasonPrompt = window.prompt(`กรุณาระบุเหตุผลในการแก้ไขหมายเหตุลูกค้า "${selectedCustomer.customerName}" (จำเป็น):`)
    const trimmedReason = reasonPrompt?.trim()
    if (!trimmedReason) {
      if (reasonPrompt !== null) {
        showToast('กรุณาระบุเหตุผล', 'จำเป็นต้องระบุเหตุผลในการแก้ไขหมายเหตุลูกค้า', 'ERROR')
      }
      return
    }
    setIsSavingNote(true)
    try {
      const updated = {
        ...selectedCustomer,
        note: customerNoteInput.trim() || undefined,
      }
      updateCustomer(updated)
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      showToast('บันทึกหมายเหตุสำเร็จ', `อัปเดตหมายเหตุของ ${updated.customerName} เรียบร้อยแล้ว`, 'SUCCESS')
    } catch (err: any) {
      showToast('บันทึกหมายเหตุไม่สำเร็จ', err?.message || 'เกิดข้อผิดพลาด', 'ERROR')
    } finally {
      setIsSavingNote(false)
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden p-2 bg-slate-100 dark:bg-slate-900 gap-2">

      {/* Customer Selector & Add Action Toolbar (การ์ดค้นหาลูกค้า แยกอิสระ) */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
        <div className="flex-1 min-w-0">
          <CustomSelect
            value={selectedCustomerId}
            onChange={(val) => setSelectedCustomerId(String(val))}
            placeholder="กรุณาเลือกลูกค้าเพื่อแสดงข้อมูลลูกค้า (พิมพ์ชื่อ รหัส หรือเบอร์โทร)..."
            searchable={true}
            options={customers.map((c) => ({
              value: c.id,
              label: c.customerName || '',
              sublabel: `${c.customerCode || ''} | ${c.phone || ''}`,
            }))}
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleOpenAdd}
            className="h-9 px-3.5 py-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มลูกค้าใหม่</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Card (การ์ดเนื้อหา โดยมีปุ่มแถบติดอยู่บนหัวการ์ดเนื้อหา) */}
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {/* Sub-tabs Navigation Bar (ปุ่มแถบติดอยู่บนหัวการ์ดเนื้อหา) */}
        <div className="p-2 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="bg-slate-100 dark:bg-slate-900/80 h-9 p-1 gap-1 rounded-xl grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 items-center">
            <button
              onClick={() => setActive360Tab('GENERAL')}
              className={`w-full h-7 px-3.5 py-0 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
                active360Tab === 'GENERAL'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">ข้อมูลทั่วไป & หน้าบัตร</span>
            </button>

            <button
              onClick={() => setActive360Tab('RENTAL_HISTORY')}
              className={`w-full h-7 px-3.5 py-0 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
                active360Tab === 'RENTAL_HISTORY'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">ประวัติการเช่า</span>
            </button>

            <button
              onClick={() => setActive360Tab('PAYMENT_HISTORY')}
              className={`w-full h-7 px-3.5 py-0 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
                active360Tab === 'PAYMENT_HISTORY'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">ประวัติการชำระเงิน</span>
            </button>

            <button
              onClick={() => setActive360Tab('OUTSTANDING_ITEMS')}
              className={`w-full h-7 px-3.5 py-0 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
                active360Tab === 'OUTSTANDING_ITEMS'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">สินค้าค้างคืน</span>
            </button>

            <button
              onClick={() => setActive360Tab('DOCUMENTS')}
              className={`w-full h-7 px-3.5 py-0 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
                active360Tab === 'DOCUMENTS'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">เอกสารส่วนตัว</span>
            </button>

            <button
              onClick={() => setActive360Tab('ANALYTICS')}
              className={`w-full h-7 px-3.5 py-0 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
                active360Tab === 'ANALYTICS'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">สถิติการใช้งาน</span>
            </button>

            <button
              onClick={() => setActive360Tab('NOTES_TAGS')}
              className={`w-full h-7 px-3.5 py-0 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
                active360Tab === 'NOTES_TAGS'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">หมายเหตุ</span>
            </button>
          </div>
        </div>

        {/* Tab Content Workspace Area */}
        {isLoading ? (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3" />
            <span className="text-sm font-semibold">กำลังโหลดข้อมูลลูกค้า...</span>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* TAB 1: ข้อมูลทั่วไป & หน้าบัตร */}
            {active360Tab === 'GENERAL' && (
              <div className="flex-1 min-h-0 text-xs p-3 sm:p-3.5 flex flex-col justify-between gap-2 overflow-hidden">
            {/* ข้อมูลพื้นฐานผู้เช่า - ส่วนหัวและปุ่มจัดการ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-slate-200 dark:border-slate-700 shrink-0">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      ข้อมูลลูกค้า {selectedCustomer?.customerCode ? `(${selectedCustomer.customerCode})` : '(-)'}
                    </h4>
                    {selectedCustomer?.isSuspended && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full ml-1">
                        🔒 ถูกระงับสิทธิ์
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      disabled={!selectedCustomer}
                      onClick={() => selectedCustomer && handleOpenEdit(selectedCustomer)}
                      className={`px-2.5 py-1.5 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 shadow-sm transition-all ${
                        !selectedCustomer
                          ? 'opacity-40 cursor-not-allowed bg-slate-800 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white cursor-pointer'
                      }`}
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-400" />
                      <span>แก้ไขข้อมูล</span>
                    </button>

                    <button
                      type="button"
                      disabled={!selectedCustomer || suspendingCustomerId === selectedCustomer?.id}
                      onClick={() => selectedCustomer && handleToggleSuspend(selectedCustomer)}
                      className={`px-2.5 py-1.5 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
                        !selectedCustomer || suspendingCustomerId === selectedCustomer?.id
                          ? 'opacity-40 cursor-not-allowed bg-slate-400 text-white'
                          : selectedCustomer.isSuspended
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                          : 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                      }`}
                    >
                      {selectedCustomer && suspendingCustomerId === selectedCustomer.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>กำลังบันทึก...</span>
                        </>
                      ) : (
                        <>
                          {selectedCustomer?.isSuspended ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                          <span>{selectedCustomer?.isSuspended ? 'ปลดระงับสิทธิ์' : 'ระงับสิทธิ์'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={!selectedCustomer}
                      onClick={() => selectedCustomer && setCustomerToDelete(selectedCustomer)}
                      className={`px-2.5 py-1.5 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all ${
                        !selectedCustomer
                          ? 'opacity-40 cursor-not-allowed bg-red-600/60 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 cursor-pointer'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบลูกค้า</span>
                    </button>
                  </div>
                </div>

                {/* 1. ส่วนข้อมูลติดต่อ */}
                <div className="space-y-1 shrink-0">
                  <div className="border-b border-slate-200 dark:border-slate-700 pb-0.5">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px]">
                      ข้อมูลติดต่อ
                    </span>
                  </div>

                  {/* แถวที่ 1: ชื่อลูกค้า / ชื่อบริษัท, รหัสลูกค้า, เลขประจำตัวผู้เสียภาษี */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        ชื่อลูกค้า / ชื่อบริษัท
                      </label>
                      <div className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {selectedCustomer?.customerName || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        รหัสลูกค้า
                      </label>
                      <div className="w-full px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 font-mono font-bold text-slate-600 dark:text-slate-300 text-xs truncate">
                        {selectedCustomer?.customerCode || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        เลขประจำตัวผู้เสียภาษี
                      </label>
                      <div className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-mono font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                        {selectedCustomer?.taxId || '-'}
                      </div>
                    </div>
                  </div>

                  {/* แถวที่ 2: เบอร์โทรศัพท์ 1, เบอร์โทรศัพท์ 2, อีเมล (Email), LINE ID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        เบอร์โทรศัพท์หลัก
                      </label>
                      <div className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-mono font-bold text-blue-600 dark:text-blue-400 text-xs truncate">
                        {selectedCustomer?.phone || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        เบอร์โทรศัพท์ 2
                      </label>
                      <div className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-mono text-slate-700 dark:text-slate-300 text-xs truncate">
                        {selectedCustomer?.phone2 || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        อีเมล (Email)
                      </label>
                      <div className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 text-xs truncate">
                        {selectedCustomer?.email || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        LINE ID
                      </label>
                      <div className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 text-xs truncate">
                        {selectedCustomer?.lineId || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. ส่วนที่อยู่ตามเอกสาร */}
                <div className="space-y-1 shrink-0">
                  <div className="border-b border-slate-200 dark:border-slate-700 pb-0.5">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px]">
                      ที่อยู่ตามเอกสาร
                    </span>
                  </div>

                  {/* แถวที่ 1: บ้านเลขที่, หมู่, ซอย, ถนน */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        บ้านเลขที่
                      </label>
                      <div className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {selectedCustomer?.houseNo || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        หมู่
                      </label>
                      <div className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-800 dark:text-slate-200 truncate">
                        {selectedCustomer?.moo || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        ซอย
                      </label>
                      <div className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-800 dark:text-slate-200 truncate">
                        {selectedCustomer?.soi || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        ถนน
                      </label>
                      <div className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-800 dark:text-slate-200 truncate">
                        {selectedCustomer?.road || '-'}
                      </div>
                    </div>
                  </div>

                  {/* แถวที่ 2: จังหวัด, อำเภอ / เขต, ตำบล / แขวง, รหัสไปรษณีย์ */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        จังหวัด
                      </label>
                      <div className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-medium text-blue-600 dark:text-blue-400 text-xs truncate">
                        {selectedCustomer?.province || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        อำเภอ / เขต
                      </label>
                      <div className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-800 dark:text-slate-200 text-xs truncate">
                        {selectedCustomer?.district || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        ตำบล / แขวง
                      </label>
                      <div className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-800 dark:text-slate-200 text-xs truncate">
                        {selectedCustomer?.subDistrict || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        รหัสไปรษณีย์
                      </label>
                      <div className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-mono font-bold text-center text-blue-600 dark:text-blue-400 text-xs truncate">
                        {selectedCustomer?.postalCode || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. ส่วนสำเนาบัตรประชาชน (ยืดเต็มความสูงที่เหลือ) */}
                <div className="flex-1 min-h-0 flex flex-col pt-1">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-1 shrink-0">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                      <span>สำเนาบัตรประชาชน</span>
                    </span>
                    {selectedCustomer ? (
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>ยืนยันตัวตนแล้ว</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-[10px] flex items-center gap-1">
                        <span>รอเลือกลูกค้า</span>
                      </span>
                    )}
                  </div>

                  {/* Layout แบ่ง 2 ฝั่ง ซ้าย: รูปบัตรขยายเต็มพื้นที่ | ขวา: ข้อมูลเลขบัตร + ปุ่มจัดการ */}
                  <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 items-stretch pt-2">
                    {/* ฝั่งซ้าย: กล่องรูปบัตร ยืดเต็มพื้นที่และจัดรูปอยู่กึ่งกลางสมบูรณ์ทั้งแนวตั้งและแนวนอน */}
                    <div className="flex-1 min-h-0 flex items-center justify-center p-2 rounded-2xl bg-slate-900/5 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 overflow-hidden">
                      {selectedCustomer?.idCardImageUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedCustomer.idCardImageUrl}
                            alt="ID Card"
                            className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl shadow-md border border-slate-300 dark:border-slate-700 transition-transform duration-200 hover:scale-[1.02]"
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-bold text-emerald-300 shadow-sm pointer-events-none">
                            ✓ สำเนาบัตร
                          </div>
                        </div>
                      ) : selectedCustomer ? (
                        <div className="aspect-[85.6/54] w-full max-w-[280px] sm:max-w-[320px] max-h-full p-3 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 text-white flex flex-col justify-between rounded-xl shadow-lg border border-blue-400/30">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <p className="text-[7px] tracking-wider font-black uppercase text-sky-200">
                                บัตรประจำตัวประชาชนไทย
                              </p>
                              <p className="text-[10px] font-extrabold truncate max-w-[150px] text-white">
                                {selectedCustomer.customerName || 'ชื่อ-นามสกุล ลูกค้า'}
                              </p>
                            </div>
                            <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[7px] font-black text-slate-900 shrink-0 shadow-sm border border-yellow-300">
                              TH
                            </div>
                          </div>

                          <div className="font-mono space-y-0.5 my-auto text-center">
                            <p className="text-[7px] text-sky-200">เลขประจำตัวประชาชน / Identification No.</p>
                            <p className="text-xs sm:text-sm font-bold tracking-wider text-yellow-300">
                              {selectedCustomer.idCardNumber || '-'}
                            </p>
                          </div>

                          <div className="flex justify-between items-end text-[7px] font-mono text-sky-200 border-t border-white/20 pt-1">
                            <span>หมดอายุ: {selectedCustomer.idCardExpiry || '-'}</span>
                            <span className="font-bold text-emerald-300">✓ VERIFIED</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[85.6/54] w-full max-w-[280px] sm:max-w-[320px] max-h-full p-3 bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-1">
                          <CreditCard className="w-8 h-8 opacity-40 text-slate-400" />
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">กรุณาเลือกลูกค้าเพื่อแสดงข้อมูล</p>
                          <span className="text-[10px] text-slate-400">เลือกรายชื่อลูกค้าจากเมนูด้านบน</span>
                        </div>
                      )}
                    </div>

                    {/* ฝั่งขวา: ด้านบน ข้อมูลเลขบัตรประชาชน | ด้านล่าง การจัดการและปุ่ม */}
                    <div className="flex flex-col justify-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                      {/* ด้านบน: เลขบัตรประชาชน และ วันหมดอายุ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                            เลขบัตรประจำตัวประชาชน (13 หลัก)
                          </label>
                          <div className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs text-slate-900 dark:text-slate-100 truncate shadow-2xs">
                            {selectedCustomer?.idCardNumber || '-'}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                            วันหมดอายุบัตรประชาชน
                          </label>
                          <div className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs text-slate-700 dark:text-slate-300 truncate shadow-2xs">
                            {selectedCustomer?.idCardExpiry || '-'}
                          </div>
                        </div>
                      </div>

                      {/* ด้านล่าง: การจัดการสำเนาบัตรประชาชน และ ปุ่ม */}
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700/60">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            การจัดการสำเนาบัตรประชาชน
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            ดูภาพขยาย หรืออัปโหลด/สแกนเปลี่ยนรูป
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            disabled={!selectedCustomer?.idCardImageUrl}
                            onClick={() => {
                              if (selectedCustomer?.idCardImageUrl) {
                                setZoomIDCardUrl(selectedCustomer.idCardImageUrl)
                              }
                            }}
                            className={`flex-1 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 text-xs shadow-xs transition-all ${
                              !selectedCustomer?.idCardImageUrl ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>ดูรูปภาพขนาดเต็ม</span>
                          </button>
                          <button
                            type="button"
                            disabled={!selectedCustomer}
                            onClick={() => selectedCustomer && handleOpenEdit(selectedCustomer)}
                            className={`flex-1 px-3 py-2 font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-sm transition-all ${
                              !selectedCustomer
                                ? 'opacity-40 cursor-not-allowed bg-indigo-600/60 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5 shrink-0" />
                            <span>อัปโหลด / สแกนเปลี่ยนรูป</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ประวัติการเช่า */}
            {active360Tab === 'RENTAL_HISTORY' && (
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                {/* 4 Stat Cards */}
                <div className="px-3 pt-2.5 pb-1.5 shrink-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center h-full">
                      <span className="text-slate-600 dark:text-slate-400 block text-[10px] font-bold truncate">จำนวนบิลทั้งหมด</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 truncate mt-0.5">{totalBills} บิล</span>
                    </div>
                    <div className="bg-emerald-50/60 dark:bg-emerald-950/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col justify-center h-full">
                      <span className="text-emerald-700 dark:text-emerald-300 block text-[10px] font-bold truncate">ยอดเช่ารวม</span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">฿{totalSpent.toLocaleString('th-TH')}</span>
                    </div>
                    <div className="bg-red-50/60 dark:bg-red-950/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-red-200 dark:border-red-800 flex flex-col justify-center h-full">
                      <span className="text-red-700 dark:text-red-300 block text-[10px] font-bold truncate">หนี้ค้างชำระ</span>
                      <span className="text-xs sm:text-sm font-extrabold text-red-600 dark:text-red-400 truncate mt-0.5">฿{totalOutstanding.toLocaleString('th-TH')}</span>
                    </div>
                    <div className="bg-blue-50/60 dark:bg-blue-950/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-blue-200 dark:border-blue-800 flex flex-col justify-center h-full">
                      <span className="text-blue-700 dark:text-blue-300 block text-[10px] font-bold truncate">กำลังเช่าอยู่</span>
                      <span className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400 truncate mt-0.5">{activeRentingBills} บิล</span>
                    </div>
                  </div>
                </div>

                {/* Filter & Search Bar inside Workspace */}
                <div className="px-3 sm:px-3.5 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    ประวัติบิลการเช่าย้อนหลังทั้งหมด ({customerBills.length} รายการ)
                  </h4>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาเลขที่บิล..."
                      value={billSearchTerm}
                      onChange={(e) => setBillSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                  {/* Table Area: Fills 100% of remaining vertical height */}
                  <div
                    ref={rentalAutoFit.containerRef}
                    className="flex-1 min-h-0 overflow-hidden flex flex-col"
                  >
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px] leading-tight table-fixed">
                      <thead className="sticky top-0 z-10 bg-[#E3E3E3] dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider shadow-xs text-xs">
                        <tr>
                          <th className="w-[145px] min-w-[145px] max-w-[145px] px-2 py-2.5 whitespace-nowrap">เลขที่บิล</th>
                          <th className="px-1.5 sm:px-2 py-2.5 whitespace-nowrap">วันที่ออกบิล</th>
                          <th className="px-1.5 sm:px-2 py-2.5 whitespace-nowrap">กำหนดคืน</th>
                          <th className="px-1.5 sm:px-2 py-2.5 text-right whitespace-nowrap">ยอดสุทธิ</th>
                          <th className="px-1.5 sm:px-2 py-2.5 text-right whitespace-nowrap">ชำระแล้ว</th>
                          <th className="px-1.5 sm:px-2 py-2.5 text-right whitespace-nowrap">คงค้าง</th>
                          <th className="px-1.5 sm:px-2 py-2.5 text-center whitespace-nowrap">สถานะเช่า</th>
                          <th className="px-1.5 sm:px-2 py-2.5 text-center whitespace-nowrap">สถานะเงิน</th>
                          <th className="w-[72px] min-w-[72px] px-1 py-2.5 text-center whitespace-nowrap">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginatedCustomerBills.length === 0 ? (
                          <tr data-empty-row="true">
                            <td colSpan={9} className="px-4 py-12 text-center text-slate-400 italic">
                              {!selectedCustomer
                                ? 'กรุณาเลือกลูกค้าเพื่อแสดงข้อมูล'
                                : 'ไม่พบประวัติการเช่าสำหรับลูกค้ารายนี้'}
                            </td>
                          </tr>
                        ) : (
                          paginatedCustomerBills.map((b) => {
                            let rentalBadgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            let rentalBadgeText = 'ฉบับร่าง'
                            if (b.rentalStatus === 'RENTING') {
                              rentalBadgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              rentalBadgeText = 'กำลังเช่า'
                            } else if (b.rentalStatus === 'PARTIAL_RETURNED') {
                              rentalBadgeClass = 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              rentalBadgeText = 'คืนบางส่วน'
                            } else if (b.rentalStatus === 'RETURNED') {
                              rentalBadgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              rentalBadgeText = 'คืนครบแล้ว'
                            } else if (b.rentalStatus === 'CLOSED') {
                              rentalBadgeClass = 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold'
                              rentalBadgeText = 'ปิดบิล'
                            } else if (b.rentalStatus === 'CANCELLED') {
                              rentalBadgeClass = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              rentalBadgeText = 'ยกเลิก'
                            }

                            let paymentBadgeClass = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            let paymentBadgeText = 'ค้างชำระ'
                            if (b.paymentStatus === 'PAID') {
                              paymentBadgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              paymentBadgeText = 'ชำระแล้ว'
                            } else if (b.paymentStatus === 'PARTIAL') {
                              paymentBadgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              paymentBadgeText = 'ชำระบางส่วน'
                            } else if (b.paymentStatus === 'REFUNDED') {
                              paymentBadgeClass = 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              paymentBadgeText = 'คืนเงินแล้ว'
                            } else if (b.paymentStatus === 'REFUND_PARTIAL') {
                              paymentBadgeClass = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              paymentBadgeText = 'คืนเงินบางส่วน'
                            }

                            return (
                              <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="w-[145px] min-w-[145px] max-w-[145px] px-2 py-2.5 whitespace-nowrap overflow-hidden">
                                  <div className="truncate font-bold text-blue-600 dark:text-blue-400 font-mono" title={b.billNo}>
                                    {b.billNo}
                                  </div>
                                </td>
                                <td className="px-1.5 sm:px-2 py-2.5 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">{b.billDate}</td>
                                <td className="px-1.5 sm:px-2 py-2.5 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">{b.rentalEndDate}</td>
                                <td className="px-1.5 sm:px-2 py-2.5 text-right font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap tabular-nums">
                                  ฿{b.grandTotal.toLocaleString('th-TH')}
                                </td>
                                <td className="px-1.5 sm:px-2 py-2.5 text-right text-emerald-600 font-semibold whitespace-nowrap tabular-nums">
                                  ฿{b.paidAmount.toLocaleString('th-TH')}
                                </td>
                                <td className="px-1.5 sm:px-2 py-2.5 text-right font-bold text-red-600 whitespace-nowrap tabular-nums">
                                  ฿{b.outstandingAmount.toLocaleString('th-TH')}
                                </td>
                                <td className="px-1.5 sm:px-2 py-2.5 text-center whitespace-nowrap">
                                  <span className={`inline-flex shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold ${rentalBadgeClass}`}>
                                    {rentalBadgeText}
                                  </span>
                                </td>
                                <td className="px-1.5 sm:px-2 py-2.5 text-center whitespace-nowrap">
                                  <span className={`inline-flex shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold ${paymentBadgeClass}`}>
                                    {paymentBadgeText}
                                  </span>
                                </td>
                                <td className="w-[72px] min-w-[72px] px-1 py-2.5 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1 flex-nowrap shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => window.print()}
                                      title="พิมพ์เอกสาร A4"
                                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors shadow-xs cursor-pointer shrink-0"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setBillToDelete(b)}
                                      title="ลบรายการบิล"
                                      className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-xs cursor-pointer shrink-0"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
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
                  <div className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                      {customerBills.length > 0 ? (
                        <span>
                          แสดง {rentalAutoFit.startIndex + 1} - {rentalAutoFit.endIndex} จาก {customerBills.length} รายการ
                        </span>
                      ) : (
                        <span>0 รายการ</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={rentalAutoFit.currentPage <= 1}
                        onClick={() => rentalAutoFit.setCurrentPage((p) => Math.max(1, p - 1))}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>ก่อนหน้า</span>
                      </button>
                      <span className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {rentalAutoFit.currentPage} / {rentalAutoFit.totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={rentalAutoFit.currentPage >= rentalAutoFit.totalPages}
                        onClick={() => rentalAutoFit.setCurrentPage((p) => Math.min(rentalAutoFit.totalPages, p + 1))}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>ถัดไป</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ประวัติการชำระเงิน */}
            {active360Tab === 'PAYMENT_HISTORY' && (
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                {/* Stat Cards */}
                <div className="px-3 pt-2.5 pb-1.5 shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs">
                    <div className="bg-emerald-50/60 dark:bg-emerald-950/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col justify-center h-full">
                      <span className="text-emerald-700 dark:text-emerald-300 block text-[10px] font-bold truncate">ยอดรับชำระเงินสะสมรวม</span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                        ฿{customerPayments.filter((p) => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center h-full">
                      <span className="text-slate-600 dark:text-slate-400 block text-[10px] font-bold truncate">จำนวนรายการชำระเงิน</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {customerPayments.length} รายการ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header */}
                <div className="px-3 sm:px-3.5 py-2 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    ประวัติการชำระเงินจากฐานข้อมูลจริง ({customerPayments.length} รายการ)
                  </h4>
                  {isLoadingCustomerDetails && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> กำลังโหลด...
                    </span>
                  )}
                </div>

                  {/* Table Area */}
                  <div
                    ref={paymentAutoFit.containerRef}
                    className="flex-1 min-h-0 overflow-hidden flex flex-col"
                  >
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <table className="w-full text-left border-collapse text-[10px] leading-tight table-fixed">
                        <thead className="sticky top-0 z-10 bg-[#E3E3E3] dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider shadow-xs text-xs">
                          <tr>
                          <th className="px-2 py-2.5 whitespace-nowrap">วันที่ชำระ</th>
                          <th className="px-2 py-2.5 whitespace-nowrap">เลขที่ใบเสร็จ / การชำระ</th>
                          <th className="px-2 py-2.5 whitespace-nowrap">เลขที่บิลเช่า</th>
                          <th className="px-2 py-2.5 whitespace-nowrap">ช่องทางชำระเงิน</th>
                          <th className="px-2 py-2.5 text-right whitespace-nowrap">จำนวนเงิน</th>
                          <th className="px-2 py-2.5 whitespace-nowrap">เลขอ้างอิง / หมายเหตุ</th>
                          <th className="px-2 py-2.5 text-center whitespace-nowrap">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {paginatedCustomerPayments.length === 0 ? (
                          <tr data-empty-row="true">
                            <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                              <Receipt className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-1.5 opacity-50" />
                              <p>{!selectedCustomer ? 'กรุณาเลือกลูกค้าเพื่อแสดงข้อมูล' : 'ยังไม่มีประวัติการชำระเงินสำหรับลูกค้ารายนี้'}</p>
                              <span className="text-[10px] text-slate-400">
                                {!selectedCustomer
                                  ? 'เลือกรายชื่อลูกค้าจากเมนูด้านบน เพื่อดูข้อมูลการชำระเงิน'
                                  : 'เมื่อมีการรับชำระเงินหรือตัดยอดค้าง ข้อมูลจะแสดงที่นี่อัตโนมัติ'}
                              </span>
                            </td>
                          </tr>
                        ) : (
                          paginatedCustomerPayments.map((p) => {
                            let methodLabel = p.paymentMethod
                            if (p.paymentMethod === 'CASH') methodLabel = '💵 เงินสด'
                            else if (p.paymentMethod === 'TRANSFER') methodLabel = '🏦 โอนเงินธนาคาร'
                            else if (p.paymentMethod === 'QR') methodLabel = '📱 PromptPay QR'
                            else if (p.paymentMethod === 'CHEQUE') methodLabel = '📑 เช็ค'

                            return (
                              <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="px-2 py-2.5 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">{p.paymentDate}</td>
                                <td className="px-2 py-2.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">
                                  {p.receiptNo || p.paymentNo}
                                </td>
                                <td className="px-2 py-2.5 font-bold text-blue-600 dark:text-blue-400 font-mono whitespace-nowrap">
                                  {p.billNo || '-'}
                                </td>
                                <td className="px-2 py-2.5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                  {methodLabel}
                                </td>
                                <td className="px-2 py-2.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap tabular-nums">
                                  ฿{p.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-2 py-2.5 text-slate-500 whitespace-nowrap truncate max-w-[160px]" title={p.referenceNo || p.note || '-'}>
                                  {p.referenceNo || p.note || '-'}
                                </td>
                                <td className="px-2 py-2.5 text-center whitespace-nowrap">
                                  <span
                                    className={`inline-flex shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      p.status === 'COMPLETED'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                    }`}
                                  >
                                    {p.status === 'COMPLETED' ? 'ชำระสำเร็จ' : 'ยกเลิก'}
                                  </span>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer */}
                  <div className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                      {customerPayments.length > 0 ? (
                        <span>
                          แสดง {paymentAutoFit.startIndex + 1} - {paymentAutoFit.endIndex} จาก {customerPayments.length} รายการ
                        </span>
                      ) : (
                        <span>0 รายการ</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={paymentAutoFit.currentPage <= 1}
                        onClick={() => paymentAutoFit.setCurrentPage((p) => Math.max(1, p - 1))}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>ก่อนหน้า</span>
                      </button>
                      <span className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {paymentAutoFit.currentPage} / {paymentAutoFit.totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={paymentAutoFit.currentPage >= paymentAutoFit.totalPages}
                        onClick={() => paymentAutoFit.setCurrentPage((p) => Math.min(paymentAutoFit.totalPages, p + 1))}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>ถัดไป</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: สินค้าค้างคืน */}
            {active360Tab === 'OUTSTANDING_ITEMS' && (
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                {/* 3 Stat Cards */}
                <div className="px-3 pt-2.5 pb-1.5 shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 text-xs">
                    <div className="bg-amber-50/60 dark:bg-amber-950/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-amber-200 dark:border-amber-800 flex flex-col justify-center h-full">
                      <span className="text-amber-800 dark:text-amber-300 block text-[10px] font-bold truncate">จำนวนสินค้าค้างคืนรวม</span>
                      <span className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400 truncate mt-0.5">
                        {customerOutstandingItems.reduce((sum, i) => sum + i.outstandingQuantity, 0)} ชิ้น
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center h-full">
                      <span className="text-slate-600 dark:text-slate-400 block text-[10px] font-bold truncate">จำนวนบิลที่มีของค้าง</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {new Set(customerOutstandingItems.map((i) => i.billId)).size} บิล
                      </span>
                    </div>
                    <div className="bg-red-50/60 dark:bg-red-950/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-red-200 dark:border-red-800 flex flex-col justify-center h-full">
                      <span className="text-red-800 dark:text-red-300 block text-[10px] font-bold truncate">สินค้าที่เลยกำหนดคืน</span>
                      <span className="text-xs sm:text-sm font-extrabold text-red-600 dark:text-red-400 truncate mt-0.5">
                        {customerOutstandingItems.filter((i) => i.isOverdue).reduce((sum, i) => sum + i.outstandingQuantity, 0)} ชิ้น
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header */}
                <div className="px-3 sm:px-3.5 py-2 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    รายการสินค้าที่ถืออยู่นอกคลัง (คัดกรองจากบิลที่ยังมียอดคงค้าง)
                  </h4>
                  {isLoadingCustomerDetails && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> กำลังโหลด...
                    </span>
                  )}
                </div>

                  {/* Table Area */}
                  <div
                    ref={outstandingAutoFit.containerRef}
                    className="flex-1 min-h-0 overflow-hidden flex flex-col"
                  >
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <table className="w-full text-left border-collapse text-[10px] leading-tight table-fixed">
                        <thead className="sticky top-0 z-10 bg-[#E3E3E3] dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider shadow-xs text-xs">
                          <tr>
                          <th className="px-2 py-2.5 whitespace-nowrap">สินค้า</th>
                          <th className="px-2 py-2.5 whitespace-nowrap">เลขที่บิล</th>
                          <th className="px-2 py-2.5 whitespace-nowrap">วันที่เช่า</th>
                          <th className="px-2 py-2.5 whitespace-nowrap">กำหนดคืน</th>
                          <th className="px-2 py-2.5 text-right whitespace-nowrap">เช่าทั้งหมด</th>
                          <th className="px-2 py-2.5 text-right whitespace-nowrap">คืนแล้ว</th>
                          <th className="px-2 py-2.5 text-right whitespace-nowrap">ชำรุด/สูญหาย</th>
                          <th className="px-2 py-2.5 text-right whitespace-nowrap text-amber-700 dark:text-amber-400 font-extrabold">ค้างคืน</th>
                          <th className="px-2 py-2.5 text-center whitespace-nowrap">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {paginatedCustomerOutstandingItems.length === 0 ? (
                          <tr data-empty-row="true">
                            <td colSpan={9} className="px-4 py-8 text-center text-slate-400 italic">
                              <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-1.5 opacity-50" />
                              <p className="font-bold text-xs text-slate-600 dark:text-slate-400">
                                {!selectedCustomer ? 'กรุณาเลือกลูกค้าเพื่อแสดงข้อมูล' : 'ไม่มีสินค้าค้างคืน'}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {!selectedCustomer
                                  ? 'เลือกรายชื่อลูกค้าจากเมนูด้านบน เพื่อดูรายการสินค้าค้างคืน'
                                  : 'ลูกค้ารายนี้ไม่มีอุปกรณ์ค้างคืนในระบบ'}
                              </span>
                            </td>
                          </tr>
                        ) : (
                          paginatedCustomerOutstandingItems.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                              <td className="px-2 py-2.5 whitespace-nowrap">
                                <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.productName}</span>
                              </td>
                              <td className="px-2 py-2.5 font-bold text-blue-600 dark:text-blue-400 font-mono whitespace-nowrap">{item.billNo}</td>
                              <td className="px-2 py-2.5 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">{item.rentalStartDate || '-'}</td>
                              <td className="px-2 py-2.5 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">{item.scheduledReturnDate || '-'}</td>
                              <td className="px-2 py-2.5 text-right text-slate-700 dark:text-slate-300 whitespace-nowrap tabular-nums">
                                {item.totalQuantity} {item.unitName}
                              </td>
                              <td className="px-2 py-2.5 text-right text-emerald-600 font-semibold whitespace-nowrap tabular-nums">
                                {item.returnedQuantity}
                              </td>
                              <td className="px-2 py-2.5 text-right text-slate-500 whitespace-nowrap tabular-nums">
                                {item.damagedQuantity + item.lostQuantity > 0 ? `${item.damagedQuantity + item.lostQuantity}` : '-'}
                              </td>
                              <td className="px-2 py-2.5 text-right font-black text-amber-600 dark:text-amber-400 whitespace-nowrap tabular-nums">
                                {item.outstandingQuantity} {item.unitName}
                              </td>
                              <td className="px-2 py-2.5 text-center whitespace-nowrap">
                                {item.isOverdue ? (
                                  <span className="inline-flex shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                                    เกิน {item.overdueDays} วัน
                                  </span>
                                ) : (
                                  <span className="inline-flex shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    ปกติ
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer */}
                  <div className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                      {customerOutstandingItems.length > 0 ? (
                        <span>
                          แสดง {outstandingAutoFit.startIndex + 1} - {outstandingAutoFit.endIndex} จาก {customerOutstandingItems.length} รายการ
                        </span>
                      ) : (
                        <span>0 รายการ</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={outstandingAutoFit.currentPage <= 1}
                        onClick={() => outstandingAutoFit.setCurrentPage((p) => Math.max(1, p - 1))}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>ก่อนหน้า</span>
                      </button>
                      <span className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {outstandingAutoFit.currentPage} / {outstandingAutoFit.totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={outstandingAutoFit.currentPage >= outstandingAutoFit.totalPages}
                        onClick={() => outstandingAutoFit.setCurrentPage((p) => Math.min(outstandingAutoFit.totalPages, p + 1))}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>ถัดไป</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: เอกสารส่วนตัวลูกค้า */}
            {active360Tab === 'DOCUMENTS' && (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5 p-3 sm:p-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">เอกสารส่วนตัวลูกค้า</h4>
                    <p className="text-[10px] text-slate-500">แสดงเฉพาะไฟล์เอกสารที่บันทึกไว้จริงในระบบ และข้อมูลประกอบของลูกค้า</p>
                  </div>
                </div>

                {!selectedCustomer ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-2">
                    <FileText className="w-8 h-8 opacity-40 mx-auto" />
                    <p className="font-bold text-xs text-slate-600 dark:text-slate-400">กรุณาเลือกลูกค้าเพื่อแสดงข้อมูล</p>
                    <span className="text-[10px] text-slate-400">เลือกรายชื่อลูกค้าจากเมนูด้านบน เพื่อดูเอกสารส่วนตัว</span>
                  </div>
                ) : (

                <div className="space-y-3">
                  {/* 1. ส่วนไฟล์เอกสารประจำตัว (แสดงเมื่อมีไฟล์จริง) */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      ไฟล์เอกสารประจำตัว (Document Files)
                    </span>

                    {selectedCustomer.idCardImageUrl ? (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 shrink-0">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                สำเนาบัตรประจำตัวประชาชน
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                มีไฟล์เอกสารจริง
                              </span>
                            </div>
                            <p className="text-slate-500 text-[10px] font-mono mt-0.5">
                              เลขประจำตัว: {selectedCustomer.idCardNumber || 'ไม่ได้ระบุ'}
                              {selectedCustomer.idCardExpiry && ` | วันหมดอายุ: ${selectedCustomer.idCardExpiry}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedCustomer.idCardImageUrl) {
                                setZoomIDCardUrl(selectedCustomer.idCardImageUrl)
                              }
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>เปิดดูสำเนาบัตร</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(selectedCustomer)}
                            title="แก้ไข / อัปโหลดรูปใหม่"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>ยังไม่มีการอัปโหลดไฟล์สำเนาบัตรประจำตัวประชาชน</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(selectedCustomer)}
                          className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-[11px] self-end sm:self-center cursor-pointer transition-colors"
                        >
                          + อัปโหลดไฟล์สำเนาบัตร
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. ส่วนข้อมูลนิติบุคคล / ข้อมูลผู้เสียภาษี (Metadata - ข้อมูลประกอบ ไม่ใช่ไฟล์) */}
                  {(selectedCustomer.taxId || selectedCustomer.companyName) && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        ข้อมูลนิติบุคคล / ข้อมูลผู้เสียภาษี
                      </span>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {selectedCustomer.companyName || 'ข้อมูลภาษีลูกค้า'}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              ข้อมูลประกอบ (Metadata)
                            </span>
                          </div>
                          <p className="text-slate-500 text-[10px] font-mono mt-0.5">
                            เลขประจำตัวผู้เสียภาษี: {selectedCustomer.taxId || 'ไม่ได้ระบุ'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. ส่วนเอกสารเพิ่มเติมของลูกค้า */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      เอกสารแนบเพิ่มเติม
                    </span>
                    <div className="p-5 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <FileText className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-600 mb-1 opacity-60" />
                      <p className="font-bold text-xs text-slate-600 dark:text-slate-400">ยังไม่มีเอกสารเพิ่มเติมของลูกค้า</p>
                      <span className="text-[10px] text-slate-400">
                        (เช่น หนังสือรับรองบริษัท, ทะเบียนบ้าน หรือเอกสารแนบอื่นๆ)
                      </span>
                    </div>
                  </div>
                </div>
                )}
              </div>
            )}

            {/* TAB 6: สถิติการใช้งาน */}
            {active360Tab === 'ANALYTICS' && (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5 p-3 sm:p-3.5">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">สถิติและพฤติกรรมการเช่าจริง</h4>
                
                {/* 3 Main Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-xl">
                    <span className="text-slate-500 block text-xs">เช่ารวมสะสม</span>
                    <strong className="text-xl font-black text-blue-600 dark:text-blue-400 block mt-0.5">
                      {customerBills.filter((b) => b.rentalStatus !== 'CANCELLED').length} บิล
                    </strong>
                    <span className="text-[10px] text-slate-400">บิลที่ใช้งานจริงทั้งหมด</span>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 rounded-xl">
                    <span className="text-slate-500 block text-xs">ตรงเวลาคืน</span>
                    <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      {customerReturnStats.onTimeRatePercent !== null ? `${customerReturnStats.onTimeRatePercent}%` : '-'}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      {customerReturnStats.onTimeRatePercent !== null
                        ? `ตรงเวลา ${customerReturnStats.onTimeReturnedItems}/${customerReturnStats.totalReturnedItemsWithDates} รายการ`
                        : 'ยังไม่มีข้อมูลการคืนที่มีวันที่ครบ'}
                    </span>
                  </div>

                  <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900 rounded-xl">
                    <span className="text-slate-500 block text-xs">มูลค่าเฉลี่ยต่อบิล</span>
                    <strong className="text-xl font-black text-purple-600 dark:text-purple-400 block mt-0.5">
                      {customerBills.filter((b) => b.rentalStatus !== 'CANCELLED').length > 0
                        ? `฿${Math.round(totalSpent / customerBills.filter((b) => b.rentalStatus !== 'CANCELLED').length).toLocaleString('th-TH')}`
                        : '-'}
                    </strong>
                    <span className="text-[10px] text-slate-400">คำนวณจากยอดบิลจริง</span>
                  </div>
                </div>

                {/* Financial Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">ยอดเช่ารวมสุทธิ</span>
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">฿{totalSpent.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">ยอดชำระแล้ว</span>
                    <span className="font-extrabold text-sm text-emerald-600">฿{customerBills.reduce((sum, b) => sum + b.paidAmount, 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">หนี้ค้างชำระปัจจุบัน</span>
                    <span className="font-extrabold text-sm text-red-600">฿{totalOutstanding.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: หมายเหตุ */}
            {active360Tab === 'NOTES_TAGS' && (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5 p-3 sm:p-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">หมายเหตุภายในเกี่ยวกับลูกค้า</h4>
                    <p className="text-[10px] text-slate-500">บันทึกข้อความประสานงาน ข้อมูลติดต่อพิเศษ หรือข้อควรระวัง (บันทึกลงฐานข้อมูล)</p>
                  </div>
                  <button
                    type="button"
                    disabled={!selectedCustomer || isSavingNote}
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNote ? 'กำลังบันทึก...' : 'บันทึกหมายเหตุ'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    ข้อความหมายเหตุ (Note):
                  </label>
                  <textarea
                    rows={6}
                    disabled={!selectedCustomer}
                    value={customerNoteInput}
                    onChange={(e) => setCustomerNoteInput(e.target.value)}
                    placeholder={!selectedCustomer ? "กรุณาเลือกลูกค้าเพื่อแสดงข้อมูล..." : "ระบุหมายเหตุ หรือบันทึกข้อความภายในเกี่ยวกับลูกค้ารายนี้..."}
                    className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      <NewCustomerModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        onSave={handleSaveCustomer}
        editingCustomer={editingCustomer}
      />

      {/* Delete Confirmation Modal */}
      <AppModal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        size="sm"
      >
        {customerToDelete && (
          <>
            <AppModalHeader
              onClose={() => setCustomerToDelete(null)}
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
              title="ยืนยันการลบลูกค้า"
            />

            <AppModalBody className="space-y-3 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  ยืนยันการลบลูกค้า?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  คุณกำลังจะลบข้อมูลลูกค้า <strong className="text-slate-800 dark:text-slate-200">{customerToDelete.customerName}</strong> ({customerToDelete.customerCode}) ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้
                </p>
              </div>

              <div className="space-y-1 text-left mt-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>เหตุผลในการลบลูกค้า (จำเป็น)</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerDeleteReason}
                  onChange={(e) => setCustomerDeleteReason(e.target.value)}
                  placeholder="ระบุเหตุผล เช่น ข้อมูลซ้ำซ้อน, ลูกค้ายกเลิกการใช้งาน..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </AppModalBody>

            <AppModalFooter>
              <button
                type="button"
                onClick={() => {
                  setCustomerDeleteReason('')
                  setCustomerToDelete(null)
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={!customerDeleteReason.trim()}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/40 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบลูกค้า</span>
              </button>
            </AppModalFooter>
          </>
        )}
      </AppModal>

      {/* ZOOM ID CARD MODAL */}
      <AppModal
        isOpen={!!zoomIDCardUrl}
        onClose={() => setZoomIDCardUrl(null)}
        size="md"
      >
        {zoomIDCardUrl && (
          <>
            <AppModalHeader
              onClose={() => setZoomIDCardUrl(null)}
              icon={<CreditCard className="w-5 h-5 text-sky-500" />}
              title="สำเนาบัตรประจำตัวประชาชน"
            />

            <AppModalBody className="p-4 flex items-center justify-center">
              <div className="flex items-center justify-center max-h-[60vh] overflow-hidden rounded-2xl bg-slate-950 p-2 border border-slate-800 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={zoomIDCardUrl}
                  alt="ID Card Full"
                  className="max-h-[55vh] max-w-full object-contain rounded-xl shadow-lg"
                />
              </div>
            </AppModalBody>

            <AppModalFooter>
              <button
                type="button"
                onClick={() => setZoomIDCardUrl(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </AppModalFooter>
          </>
        )}
      </AppModal>

      {/* DELETE BILL CONFIRMATION MODAL */}
      <AppModal
        isOpen={!!billToDelete}
        onClose={() => {
          if (!isDeletingBill) {
            setBillToDelete(null)
            setDeleteBillReason('')
          }
        }}
        size="sm"
      >
        <AppModalHeader
          title="ยืนยันการลบรายการบิล"
          icon={<Trash2 className="w-5 h-5 text-red-600" />}
          onClose={() => {
            if (!isDeletingBill) {
              setBillToDelete(null)
              setDeleteBillReason('')
            }
          }}
        />
        <AppModalBody className="space-y-3 text-xs py-3">
          <p className="text-slate-700 dark:text-slate-300">
            คุณต้องการลบรายการบิล <strong className="text-slate-900 dark:text-slate-100 font-bold">{billToDelete?.billNo}</strong> ของลูกค้า <strong className="text-slate-900 dark:text-slate-100 font-bold">&quot;{selectedCustomer?.customerName || billToDelete?.customerName}&quot;</strong> หรือไม่?
          </p>

          <div className="space-y-1.5 text-left pt-1">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
              เหตุผลในการลบบิล <span className="text-red-500 font-bold">* (จำเป็นต้องระบุ)</span>:
            </label>
            <input
              type="text"
              value={deleteBillReason}
              onChange={(e) => setDeleteBillReason(e.target.value)}
              placeholder="เช่น ลูกค้ายกเลิกคำขอก่อนส่งมอบ / เปิดบิลผิดพลาด..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          {billToDelete && canHardDeleteBill(billToDelete) ? (
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
              * บิลนี้เป็นแบบร่างที่ยังไม่มีธุรกรรม/การเคลื่อนไหว จะถูกลบออกจากระบบอย่างถาวร
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
              * บิลนี้มีรายการธุรกรรม/ยืนยันแล้ว ระบบจะเปลี่ยนสถานะเป็น VOID พร้อมบันทึกประวัติ Audit Log เพื่อความถูกต้องของบัญชีและสต็อก
            </div>
          )}
        </AppModalBody>
        <AppModalFooter
          onCancel={() => {
            setBillToDelete(null)
            setDeleteBillReason('')
          }}
          cancelText="ยกเลิก"
          onConfirm={handleConfirmDeleteBill}
          confirmText={billToDelete && canHardDeleteBill(billToDelete) ? 'ยืนยันลบฉบับร่าง' : 'ยืนยันยกเลิก/VOID'}
          confirmButtonColor="red"
          isConfirmDisabled={isDeletingBill || !deleteBillReason.trim()}
          isConfirmLoading={isDeletingBill}
        />
      </AppModal>

    </div>
  )
}


