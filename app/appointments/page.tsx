'use client'

import React, { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  Plus,
  Clock,
  Eye,
  MapPin,
  Phone,
  User,
  Calendar,
  FileText,
  CheckSquare,
  Settings,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { Appointment, Customer, AppointmentStatus, AppointmentType } from '@/lib/types/rental-pos'
import { CustomDatePicker, getLocalDateString, parseLocalDate } from '@/components/common/CustomDatePicker'
import { CustomSelect } from '@/components/common/CustomSelect'
import { CustomerAutocomplete } from '@/components/common/CustomerAutocomplete'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { useToast } from '@/components/common/Toast'
import { logger } from '@/lib/utils/logger'
import { AddAppointmentModal, DEFAULT_APPOINTMENT_TYPES } from '@/components/appointments/AddAppointmentModal'
import {
  loadAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
} from '@/lib/appointment-storage'
import { loadCustomers } from '@/lib/customer-storage'

const CalendarView = dynamic(
  () => import('@/components/appointments/CalendarView').then((mod) => mod.CalendarView),
  { ssr: false }
)

const getInitialFormData = (): Partial<Appointment> => ({
  title: '',
  type: 'DELIVERY',
  customerId: undefined,
  customerName: '',
  billNo: '',
  quotationNo: '',
  date: getLocalDateString(),
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  contactPerson: '',
  phone: '',
  details: '',
  status: 'PENDING',
})

export default function AppointmentsPage() {
  const { showToast } = useToast()
  const [appointmentTypes, setAppointmentTypes] = useState<Array<{ id: string; label: string }>>(DEFAULT_APPOINTMENT_TYPES)
  const addAppointmentType = (label: string) => setAppointmentTypes((prev) => [...prev, { id: 'apt-' + Date.now(), label }])
  const updateAppointmentType = (id: string, label: string) => setAppointmentTypes((prev) => prev.map((t) => (t.id === id ? { ...t, label } : t)))
  const removeAppointmentType = (id: string) => setAppointmentTypes((prev) => prev.filter((t) => t.id !== id))

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [activeTab, setActiveTab] = useState<'APPOINTMENTS' | 'TODAY' | 'TOMORROW' | 'ALL'>('APPOINTMENTS')

  // Selected Appointment for Detail Modal
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)

  // Status update in progress ID
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false)

  // Edit Modal State
  const [editingApt, setEditingApt] = useState<Appointment | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Appointment>>(getInitialFormData())
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  // Delete Confirmation State
  const [deletingApt, setDeletingApt] = useState<Appointment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load Data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const apts = loadAppointments()
      const custs = loadCustomers()
      setAppointments(apts)
      setCustomers(custs)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 2. OPEN EDIT MODAL
  const handleOpenEdit = (apt: Appointment) => {
    setEditingApt(apt)
    setEditFormData({
      title: apt.title,
      type: apt.type,
      appointmentTypeId: apt.appointmentTypeId,
      customerId: apt.customerId,
      customerName: apt.customerName,
      billNo: apt.billNo || '',
      quotationNo: apt.quotationNo || '',
      date: apt.date,
      startTime: apt.startTime,
      endTime: apt.endTime,
      location: apt.location || '',
      contactPerson: apt.contactPerson || '',
      phone: apt.phone || '',
      details: apt.details || '',
      status: apt.status,
    })
  }

  // 3. SUBMIT EDIT APPOINTMENT
  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingApt) return
    if (!editFormData.title || !editFormData.title.trim()) {
      showToast('กรุณาระบุหัวข้องานนัดหมาย', undefined, 'ERROR')
      return
    }

    setIsEditSubmitting(true)
    try {
      const updated: Appointment = {
        ...editingApt,
        ...(editFormData as Appointment),
      }
      updateAppointment(updated)
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      if (selectedApt && selectedApt.id === updated.id) {
        setSelectedApt(updated)
      }
      setEditingApt(null)
      showToast('แก้ไขนัดหมายสำเร็จ', `อัปเดตนัดหมาย "${updated.title}" เรียบร้อยแล้ว`, 'SUCCESS')
    } catch (err: any) {
      logger.error('Update appointment error:', err)
      showToast('แก้ไขไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาด', 'ERROR')
    } finally {
      setIsEditSubmitting(false)
    }
  }

  // 4. STATUS CHANGE
  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    setUpdatingStatusId(id)
    try {
      const target = appointments.find((a) => a.id === id)
      if (target) {
        updateAppointment({ ...target, status: newStatus })
      }
      setAppointments((prev) => prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt)))
      if (selectedApt && selectedApt.id === id) {
        setSelectedApt({ ...selectedApt, status: newStatus })
      }
      const statusLabels: Record<AppointmentStatus, string> = {
        PENDING: 'รอดำเนินการ',
        IN_PROGRESS: 'กำลังดำเนินการ',
        DONE: 'เสร็จแล้ว',
        CANCELLED: 'ยกเลิก',
      }
      showToast('อัปเดตสถานะสำเร็จ', `เปลี่ยนสถานะเป็น "${statusLabels[newStatus]}" แล้ว`, 'SUCCESS')
    } catch (err: any) {
      logger.error('Failed to change appointment status:', err)
      showToast('เปลี่ยนสถานะไม่สำเร็จ', err.message || 'ไม่สามารถบันทึกสถานะได้', 'ERROR')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  // 5. DELETE APPOINTMENT
  const handleDeleteAppointment = async () => {
    if (!deletingApt) return
    setIsDeleting(true)
    try {
      deleteAppointment(deletingApt.id)
      setAppointments((prev) => prev.filter((a) => a.id !== deletingApt.id))
      if (selectedApt && selectedApt.id === deletingApt.id) {
        setSelectedApt(null)
      }
      setDeletingApt(null)
      showToast('ลบนัดหมายสำเร็จ', 'ลบรายการนัดหมายออกจากระบบเรียบร้อยแล้ว', 'SUCCESS')
    } catch (err: any) {
      logger.error('Delete appointment error:', err)
      showToast('ลบนัดหมายไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาด', 'ERROR')
    } finally {
      setIsDeleting(false)
    }
  }

  // Type Badge Config
  const getTypeBadge = (type: Appointment['type']) => {
    switch (type) {
      case 'DELIVERY':
        return { label: '🚚 นัดส่งสินค้า', bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300' }
      case 'RETURN':
        return { label: '🔄 นัดรับคืนสินค้า', bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300' }
      case 'PAYMENT':
        return { label: '💰 นัดชำระเงิน', bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300' }
      case 'CONTRACT':
        return { label: '📝 นัดทำสัญญา', bg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300' }
      case 'QUOTATION':
        return { label: '📊 นัดติดตามใบเสนอราคา', bg: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300' }
      case 'INSPECTION':
        return { label: '🔍 นัดตรวจสินค้า', bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300' }
      default:
        return { label: '📌 นัดหมายทั่วไป', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300' }
    }
  }

  // Format Calendar Events
  const calendarEvents = appointments.map((apt) => {
    let color = '#2563eb' // Delivery: blue
    if (apt.type === 'RETURN') color = '#059669' // Return: green
    if (apt.type === 'PAYMENT') color = '#d97706' // Payment: amber
    if (apt.type === 'CONTRACT') color = '#9333ea' // Contract: purple
    if (apt.type === 'QUOTATION') color = '#0891b2' // Quotation: cyan
    if (apt.type === 'INSPECTION') color = '#dc2626' // Inspection: red
    if (apt.status === 'DONE') color = '#10b981'
    if (apt.status === 'CANCELLED') color = '#64748b'

    return {
      id: apt.id,
      title: apt.title,
      start: `${apt.date}T${apt.startTime}:00`,
      end: `${apt.date}T${apt.endTime}:00`,
      backgroundColor: color,
      borderColor: color,
    }
  })

  // Filter Tasks for Right Sidebar
  const todayStr = getLocalDateString()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = getLocalDateString(tomorrow)

  const filteredTasks = appointments.filter((apt) => {
    if (activeTab === 'APPOINTMENTS') return apt.status !== 'DONE' && apt.status !== 'CANCELLED'
    if (activeTab === 'TODAY') return apt.date === todayStr
    if (activeTab === 'TOMORROW') return apt.date === tomorrowStr
    return true
  })

  return (
    <div className="h-full min-h-0 min-w-0 p-2.5 sm:p-3 md:p-4 bg-slate-100 dark:bg-slate-900 flex flex-col overflow-hidden">
      {/* Unified Appointment Container */}
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
        {/* 1. Appointment Toolbar */}
        <div className="p-2.5 sm:p-3 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex min-w-0 flex-wrap items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-950 p-1 text-[10px] sm:text-xs">
            {[
              { value: 'APPOINTMENTS', label: 'ปฏิทิน' },
              { value: 'TODAY', label: 'งานวันนี้' },
              { value: 'TOMORROW', label: 'งานพรุ่งนี้' },
              { value: 'ALL', label: 'งานทั้งหมด' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as typeof activeTab)}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 font-bold transition-colors cursor-pointer ${
                  activeTab === tab.value
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              title="รีเฟรชข้อมูล"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                setShowAddModal(true)
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มนัดหมายใหม่</span>
            </button>
          </div>
        </div>

        {/* 2. Main Workspace View */}
        {isLoading ? (
          <div className="flex-1 min-h-0 p-6 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="font-bold text-xs">กำลังโหลดข้อมูลนัดหมายจากฐานข้อมูล...</span>
          </div>
        ) : activeTab === 'APPOINTMENTS' ? (
          <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-hidden">
            <CalendarView
              events={calendarEvents}
              onEventClick={(id) => {
                const found = appointments.find((a) => a.id === id)
                if (found) setSelectedApt(found)
              }}
            />
          </div>
        ) : (
          /* 3. Appointment List Workspace */
          <div className="flex-1 min-h-0 p-3 sm:p-4 flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                รายการนัดหมาย ({filteredTasks.length})
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 space-y-2.5 overflow-y-auto overflow-x-hidden pr-1">
            {filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {filteredTasks.map((apt) => {
                  const typeInfo = getTypeBadge(apt.type)
                  return (
                    <div
                      key={apt.id}
                      onClick={() => setSelectedApt(apt)}
                      className="p-3 rounded-2xl border space-y-2 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-500/60 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block group-hover:text-blue-600 transition-colors">
                            {apt.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ml-2 ${
                              apt.status === 'DONE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : apt.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : apt.status === 'CANCELLED'
                                ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {apt.status === 'DONE'
                              ? 'เสร็จแล้ว'
                              : apt.status === 'IN_PROGRESS'
                              ? 'กำลังดำเนินการ'
                              : apt.status === 'CANCELLED'
                              ? 'ยกเลิก'
                              : 'รอดำเนินการ'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${typeInfo.bg}`}>
                            {typeInfo.label}
                          </span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            ลูกค้า: {apt.customerName}
                          </span>
                          {apt.phone && ` (${apt.phone})`}
                        </p>

                        <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                          <p>
                            📅 {apt.date} ({apt.startTime} - {apt.endTime} น.)
                          </p>
                          {apt.location && <p className="truncate">📍 {apt.location}</p>}
                        </div>

                        {/* Preview details snippet if present */}
                        {apt.details && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700 line-clamp-2 italic">
                            💬 {apt.details}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex justify-between items-center mt-2">
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 group-hover:underline">
                          <Eye className="w-3.5 h-3.5" />
                          <span>ดูรายละเอียดงาน</span>
                        </span>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(apt)}
                            title="แก้ไข"
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingApt(apt)}
                            title="ลบ"
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 font-bold text-xs">
                ไม่มีรายการนัดหมายในช่วงนี้
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* APPOINTMENT DETAIL MODAL */}
      <AppModal isOpen={!!selectedApt} onClose={() => setSelectedApt(null)} size="lg">
        {selectedApt && (
          <>
            {/* Modal Header */}
            <AppModalHeader
              onClose={() => setSelectedApt(null)}
              icon={<FileText className="w-5 h-5 text-blue-500" />}
              title="รายละเอียดงานนัดหมาย (Job Details)"
            />

            {/* Modal Body Content */}
            <AppModalBody className="space-y-5">
              {/* Job Title & Status Banner */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="text-base font-black text-slate-900 dark:text-slate-100">{selectedApt.title}</h2>
                  <span
                    className={`px-2.5 py-1 rounded-full font-extrabold text-xs shrink-0 ${
                      selectedApt.status === 'DONE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                        : selectedApt.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300'
                        : selectedApt.status === 'CANCELLED'
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                    }`}
                  >
                    {selectedApt.status === 'DONE'
                      ? '✓ ทำเสร็จแล้ว'
                      : selectedApt.status === 'IN_PROGRESS'
                      ? '⏳ กำลังดำเนินการ'
                      : selectedApt.status === 'CANCELLED'
                      ? '✕ ยกเลิก'
                      : '🕒 รอดำเนินการ'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className={`px-2.5 py-0.5 rounded-lg font-bold border text-[11px] ${getTypeBadge(selectedApt.type).bg}`}>
                    {getTypeBadge(selectedApt.type).label}
                  </span>
                </div>
              </div>

              {/* SECTION: รายละเอียดสิ่งที่ต้องทำ */}
              <div className="bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2">
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold text-xs">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>รายละเอียดสิ่งที่ต้องทำ (Task Instructions & Details)</span>
                </div>
                {selectedApt.details ? (
                  <div className="whitespace-pre-line text-slate-800 dark:text-slate-200 font-medium leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-100 dark:border-blue-900/60 shadow-xs text-xs">
                    {selectedApt.details}
                  </div>
                ) : (
                  <p className="text-slate-400 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    ไม่มีรายละเอียดเพิ่มเติม
                  </p>
                )}
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. ข้อมูลลูกค้า */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>ข้อมูลลูกค้า</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {selectedApt.customerName}
                    </p>
                    {selectedApt.contactPerson && (
                      <p className="text-slate-500">ผู้ติดต่อ: {selectedApt.contactPerson}</p>
                    )}
                    {selectedApt.phone && (
                      <p className="text-blue-600 dark:text-blue-400 font-mono font-bold flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{selectedApt.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. สถานที่ / หน้างาน */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>สถานที่ / จุดนัดหมาย</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {selectedApt.location || 'ไม่ได้ระบุสถานที่'}
                  </p>
                </div>
              </div>

              {/* วันที่และเวลานัดหมาย & บิลที่เกี่ยวข้อง */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>กำหนดการ</span>
                  </div>
                  <div className="space-y-0.5 text-slate-800 dark:text-slate-200 font-semibold font-mono">
                    <p>📅 {selectedApt.date}</p>
                    {selectedApt.startTime && (
                      <p>
                        ⏰ {selectedApt.startTime} - {selectedApt.endTime} น.
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>เอกสารที่เกี่ยวข้อง</span>
                  </div>
                  <div className="space-y-1 text-slate-800 dark:text-slate-200 font-mono text-xs">
                    {selectedApt.billNo && (
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        🧾 เลขที่บิล: {selectedApt.billNo}
                      </p>
                    )}
                    {selectedApt.quotationNo && (
                      <p className="font-bold text-blue-600 dark:text-blue-400">
                        📄 ใบเสนอราคา: {selectedApt.quotationNo}
                      </p>
                    )}
                    {!selectedApt.billNo && !selectedApt.quotationNo && (
                      <p className="text-slate-400 italic">ไม่มีเอกสารอ้างอิง</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div className="pt-2">
                <span className="font-extrabold text-slate-700 dark:text-slate-300 block mb-2">
                  เปลี่ยนสถานะงานนัดหมาย:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    disabled={updatingStatusId === selectedApt.id}
                    onClick={() => handleStatusChange(selectedApt.id, 'PENDING')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      selectedApt.status === 'PENDING'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-102'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-50'
                    }`}
                  >
                    🕒 รอดำเนินการ
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatusId === selectedApt.id}
                    onClick={() => handleStatusChange(selectedApt.id, 'IN_PROGRESS')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      selectedApt.status === 'IN_PROGRESS'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50'
                    }`}
                  >
                    ⏳ กำลังทำ
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatusId === selectedApt.id}
                    onClick={() => handleStatusChange(selectedApt.id, 'DONE')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      selectedApt.status === 'DONE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50'
                    }`}
                  >
                    ✓ เสร็จแล้ว
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatusId === selectedApt.id}
                    onClick={() => handleStatusChange(selectedApt.id, 'CANCELLED')}
                    className={`py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      selectedApt.status === 'CANCELLED'
                        ? 'bg-slate-600 text-white border-slate-700 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    ✕ ยกเลิก
                  </button>
                </div>
              </div>
            </AppModalBody>

            {/* Modal Footer */}
            <AppModalFooter>
              <div className="flex-1 flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(selectedApt)}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200 dark:border-blue-900"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>แก้ไขนัดหมาย</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingApt(selectedApt)}
                    className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-red-200 dark:border-red-900"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบนัดหมาย</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedApt(null)}
                  className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </AppModalFooter>
          </>
        )}
      </AppModal>

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(created) => {
          addAppointment(created)
          setAppointments((prev) => [created, ...prev])
        }}
        customers={customers}
        appointmentTypes={appointmentTypes}
        onAddAppointmentType={addAppointmentType}
        onUpdateAppointmentType={updateAppointmentType}
        onRemoveAppointmentType={removeAppointmentType}
      />

      {/* Edit Appointment Modal */}
      <AppModal isOpen={!!editingApt} onClose={() => setEditingApt(null)} size="lg">
        {editingApt && (
          <>
            <AppModalHeader
              onClose={() => setEditingApt(null)}
              icon={<Pencil className="w-5 h-5 text-blue-600" />}
              title="แก้ไขนัดหมาย"
            />

            <form onSubmit={handleUpdateAppointment} className="flex-1 min-h-0 flex flex-col">
              <AppModalBody className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    หัวข้องานนัดหมาย <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="รายละเอียดงาน"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ประเภทนัดหมาย</label>
                    <CustomSelect
                      value={editFormData.appointmentTypeId || editFormData.type || 'DELIVERY'}
                      onChange={(val) => {
                        const matched = appointmentTypes.find((t) => t.id === val)
                        const validCodes: AppointmentType[] = ['DELIVERY', 'RETURN', 'PAYMENT', 'CONTRACT', 'QUOTATION', 'INSPECTION', 'GENERAL']
                        const code = (validCodes.includes(val as AppointmentType) ? val : 'GENERAL') as AppointmentType
                        setEditFormData((prev) => ({
                          ...prev,
                          type: code,
                          appointmentTypeId: matched?.id || val,
                        }))
                      }}
                      options={appointmentTypes.map((t) => ({ value: t.id, label: t.label }))}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ชื่อลูกค้า / บริษัท <span className="text-red-500">*</span>
                    </label>
                    <CustomerAutocomplete
                      value={editFormData.customerId}
                      customerName={editFormData.customerName}
                      customers={customers}
                      onChange={(cust, customName) => {
                        if (cust) {
                          setEditFormData((prev) => ({
                            ...prev,
                            customerId: cust.id,
                            customerName: cust.customerName,
                            phone: cust.phone || prev.phone,
                            location: cust.address || prev.location,
                          }))
                        } else {
                          setEditFormData((prev) => ({
                            ...prev,
                            customerId: undefined,
                            customerName: customName || '',
                          }))
                        }
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">วันที่นัดหมาย</label>
                    <CustomDatePicker
                      value={editFormData.date ? parseLocalDate(editFormData.date) : null}
                      onChange={(d) => setEditFormData({ ...editFormData, date: d ? getLocalDateString(d) : '' })}
                      align="left"
                      placeholder="เลือกวันที่..."
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">เวลาเริ่ม</label>
                    <input
                      type="time"
                      value={editFormData.startTime}
                      onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">เวลาสิ้นสุด</label>
                    <input
                      type="time"
                      value={editFormData.endTime}
                      onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">สถานที่ / หน้างาน</label>
                    <input
                      type="text"
                      placeholder="สถานที่จัดส่ง"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">เบอร์โทรติดต่อ</label>
                    <input
                      type="text"
                      placeholder="081-xxx-xxxx"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ผู้ติดต่อ (ถ้ามี)</label>
                    <input
                      type="text"
                      placeholder="ชื่อผู้ติดต่อ"
                      value={editFormData.contactPerson}
                      onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">สถานะ</label>
                    <CustomSelect
                      value={editFormData.status || 'PENDING'}
                      onChange={(val) => setEditFormData({ ...editFormData, status: val as AppointmentStatus })}
                      options={[
                        { value: 'PENDING', label: '🕒 รอดำเนินการ' },
                        { value: 'IN_PROGRESS', label: '⏳ กำลังดำเนินการ' },
                        { value: 'DONE', label: '✓ เสร็จแล้ว' },
                        { value: 'CANCELLED', label: '✕ ยกเลิก' },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    รายละเอียดงานเพิ่มเติม / สิ่งที่ต้องทำ
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ระบุข้อความสิ่งที่ต้องทำ..."
                    value={editFormData.details}
                    onChange={(e) => setEditFormData({ ...editFormData, details: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </AppModalBody>

              <AppModalFooter>
                <button
                  type="button"
                  disabled={isEditSubmitting}
                  onClick={() => setEditingApt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isEditSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>บันทึกการแก้ไข</span>
                  )}
                </button>
              </AppModalFooter>
            </form>
          </>
        )}
      </AppModal>

      {/* Delete Confirmation Modal */}
      <AppModal isOpen={!!deletingApt} onClose={() => setDeletingApt(null)} size="sm">
        {deletingApt && (
          <>
            <AppModalHeader
              onClose={() => setDeletingApt(null)}
              icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
              title="ยืนยันการลบนัดหมาย"
            />

            <AppModalBody className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  คุณแน่ใจหรือไม่ว่าต้องการลบนัดหมาย &quot;<span className="font-bold text-slate-800 dark:text-slate-200">{deletingApt.title}</span>&quot;? การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
            </AppModalBody>

            <AppModalFooter>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingApt(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAppointment}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <span>ยืนยันลบ</span>
                )}
              </button>
            </AppModalFooter>
          </>
        )}
      </AppModal>

    </div>
  )
}
