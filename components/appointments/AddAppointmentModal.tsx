'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Settings,
  RefreshCw,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Appointment, Customer, AppointmentStatus, AppointmentType } from '@/lib/types/rental-pos'
import { CustomDatePicker, getLocalDateString, parseLocalDate } from '@/components/common/CustomDatePicker'
import { CustomSelect } from '@/components/common/CustomSelect'
import { CustomerAutocomplete } from '@/components/common/CustomerAutocomplete'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { useToast } from '@/components/common/Toast'
import { logger } from '@/lib/utils/logger'

export const DEFAULT_APPOINTMENT_TYPES: Array<{ id: string; label: string }> = [
  { id: 'DELIVERY', label: '🚚 นัดส่งสินค้า' },
  { id: 'RETURN', label: '🔄 นัดรับคืนสินค้า' },
  { id: 'PAYMENT', label: '💰 นัดชำระเงิน' },
  { id: 'CONTRACT', label: '📝 นัดทำสัญญา' },
  { id: 'QUOTATION', label: '📊 นัดติดตามใบเสนอราคา' },
  { id: 'INSPECTION', label: '🔍 นัดตรวจสินค้า' },
  { id: 'GENERAL', label: '📌 นัดหมายทั่วไป' },
]

export const getInitialAppointmentFormData = (dateStr?: string): Partial<Appointment> => ({
  title: '',
  type: 'DELIVERY',
  customerId: undefined,
  customerName: '',
  billNo: '',
  quotationNo: '',
  date: dateStr || getLocalDateString(),
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  contactPerson: '',
  phone: '',
  details: '',
  status: 'PENDING',
})

export interface AddAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (newAppointment: Appointment) => void
  customers?: Customer[]
  appointmentTypes?: Array<{ id: string; label: string }>
  onAddAppointmentType?: (label: string) => void
  onUpdateAppointmentType?: (id: string, label: string) => void
  onRemoveAppointmentType?: (id: string) => void
  initialDate?: string
}

export function AddAppointmentModal({
  isOpen,
  onClose,
  onSave,
  customers = [],
  appointmentTypes: externalTypes,
  onAddAppointmentType,
  onUpdateAppointmentType,
  onRemoveAppointmentType,
  initialDate,
}: AddAppointmentModalProps) {
  const { showToast } = useToast()

  // Types State (fallback to internal if not provided externally)
  const [internalTypes, setInternalTypes] = useState<Array<{ id: string; label: string }>>(DEFAULT_APPOINTMENT_TYPES)
  const effectiveTypes = (externalTypes && externalTypes.length > 0) ? externalTypes : internalTypes

  const handleAddType = (label: string) => {
    if (onAddAppointmentType) {
      onAddAppointmentType(label)
    } else {
      setInternalTypes((prev) => [...prev, { id: 'apt-' + Date.now(), label }])
    }
  }

  const handleUpdateType = (id: string, label: string) => {
    if (onUpdateAppointmentType) {
      onUpdateAppointmentType(id, label)
    } else {
      setInternalTypes((prev) => prev.map((t) => (t.id === id ? { ...t, label } : t)))
    }
  }

  const handleRemoveType = (id: string) => {
    if (onRemoveAppointmentType) {
      onRemoveAppointmentType(id)
    } else {
      setInternalTypes((prev) => prev.filter((t) => t.id !== id))
    }
  }

  // Type Manager Modal State
  const [showTypeManagerModal, setShowTypeManagerModal] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null)
  const [editingTypeLabel, setEditingTypeLabel] = useState('')
  const [confirmDeleteTypeId, setConfirmDeleteTypeId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState<Partial<Appointment>>(getInitialAppointmentFormData(initialDate))
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialAppointmentFormData(initialDate))
      setIsSubmitting(false)
    }
  }, [isOpen, initialDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.title.trim()) {
      showToast('กรุณาระบุหัวข้องานนัดหมาย', undefined, 'ERROR')
      return
    }

    setIsSubmitting(true)
    try {
      const created: Appointment = {
        ...(formData as Appointment),
        id: `apt-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      onSave?.(created)
      onClose()
      setFormData(getInitialAppointmentFormData(initialDate))
      showToast('บันทึกการนัดหมายสำเร็จ', `สร้างนัดหมาย "${created.title}" เรียบร้อยแล้ว`, 'SUCCESS')
    } catch (err: any) {
      logger.error('Create appointment error:', err)
      showToast('บันทึกนัดหมายไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาด', 'ERROR')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <AppModal isOpen={isOpen} onClose={onClose} size="lg">
        <AppModalHeader
          onClose={onClose}
          icon={<Calendar className="w-5 h-5 text-emerald-600" />}
          title="เพิ่มนัดหมายใหม่"
        />

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <AppModalBody className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                หัวข้องานนัดหมาย <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น ส่งนั่งร้าน 100 ชุด หน้างานสุขุมวิท"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">ประเภทนัดหมาย</label>
                  <button
                    type="button"
                    onClick={() => setShowTypeManagerModal(true)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                    title="จัดการประเภทนัดหมาย"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
                <CustomSelect
                  value={formData.appointmentTypeId || formData.type || 'DELIVERY'}
                  onChange={(val) => {
                    const matched = effectiveTypes.find((t) => t.id === val)
                    const validCodes: AppointmentType[] = ['DELIVERY', 'RETURN', 'PAYMENT', 'CONTRACT', 'QUOTATION', 'INSPECTION', 'GENERAL']
                    const code = (validCodes.includes(val as AppointmentType) ? val : 'GENERAL') as AppointmentType
                    setFormData((prev) => ({
                      ...prev,
                      type: code,
                      appointmentTypeId: matched?.id || val,
                    }))
                  }}
                  options={effectiveTypes.map((t) => ({ value: t.id, label: t.label }))}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อลูกค้า / บริษัท <span className="text-red-500">*</span>
                </label>
                <CustomerAutocomplete
                  value={formData.customerId}
                  customerName={formData.customerName}
                  customers={customers}
                  onChange={(cust, customName) => {
                    if (cust) {
                      setFormData((prev) => ({
                        ...prev,
                        customerId: cust.id,
                        customerName: cust.customerName,
                        phone: cust.phone || prev.phone,
                        location: cust.address || prev.location,
                      }))
                    } else {
                      setFormData((prev) => ({
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
                  value={formData.date ? parseLocalDate(formData.date) : null}
                  onChange={(d) => setFormData({ ...formData, date: d ? getLocalDateString(d) : '' })}
                  align="left"
                  placeholder="เลือกวันที่..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">เวลาเริ่ม</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">เวลาสิ้นสุด</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">สถานที่ / หน้างาน</label>
                <input
                  type="text"
                  placeholder="เช่น โครงการคอนโด ถ.สุขุมวิท"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">เบอร์โทรติดต่อ</label>
                <input
                  type="text"
                  placeholder="081-xxx-xxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ผู้ติดต่อ (ถ้ามี)</label>
                <input
                  type="text"
                  placeholder="ชื่อผู้ติดต่อหน้างาน"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">สถานะ</label>
                <CustomSelect
                  value={formData.status || 'PENDING'}
                  onChange={(val) => setFormData({ ...formData, status: val as AppointmentStatus })}
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
                placeholder="ระบุรายละเอียดงาน สิ่งที่ต้องเตรียม หรือหมายเหตุ..."
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </AppModalBody>

          <AppModalFooter>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>บันทึกการนัดหมาย</span>
              )}
            </button>
          </AppModalFooter>
        </form>
      </AppModal>

      {/* Appointment Type Manager Modal */}
      <AppModal
        isOpen={showTypeManagerModal}
        onClose={() => {
          setShowTypeManagerModal(false)
          setConfirmDeleteTypeId(null)
          setEditingTypeId(null)
        }}
        size="md"
      >
        <AppModalHeader
          onClose={() => {
            setShowTypeManagerModal(false)
            setConfirmDeleteTypeId(null)
            setEditingTypeId(null)
          }}
          icon={<Settings className="w-5 h-5 text-emerald-600" />}
          title="จัดการประเภทงานนัดหมาย"
        />

        <AppModalBody className="space-y-4">
          {/* Add New Type Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ชื่อประเภทงานใหม่..."
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTypeName.trim()) {
                  handleAddType(newTypeName.trim())
                  setNewTypeName('')
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => {
                if (newTypeName.trim()) {
                  handleAddType(newTypeName.trim())
                  setNewTypeName('')
                }
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-colors cursor-pointer"
            >
              + เพิ่ม
            </button>
          </div>

          {/* List of Types */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {effectiveTypes.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60"
              >
                <div className="w-3 h-3 rounded-full shrink-0 bg-emerald-500" />
                {editingTypeId === t.id ? (
                  <input
                    type="text"
                    autoFocus
                    value={editingTypeLabel}
                    onChange={(e) => setEditingTypeLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editingTypeLabel.trim()) {
                          handleUpdateType(t.id, editingTypeLabel.trim())
                        }
                        setEditingTypeId(null)
                      }
                      if (e.key === 'Escape') setEditingTypeId(null)
                    }}
                    className="flex-1 px-2 py-1 rounded-lg border border-blue-400 dark:border-blue-600 text-xs bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <span className="flex-1 text-xs font-semibold text-slate-800 dark:text-slate-200">{t.label}</span>
                )}

                {confirmDeleteTypeId === t.id ? (
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveType(t.id)
                        setConfirmDeleteTypeId(null)
                      }}
                      className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer"
                    >
                      ยืนยันลบ
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteTypeId(null)}
                      className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                  </div>
                ) : editingTypeId === t.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (editingTypeLabel.trim()) {
                        handleUpdateType(t.id, editingTypeLabel.trim())
                      }
                      setEditingTypeId(null)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shrink-0 cursor-pointer"
                  >
                    บันทึก
                  </button>
                ) : (
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTypeId(t.id)
                        setEditingTypeLabel(t.label)
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                      title="แก้ไข"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteTypeId(t.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AppModalBody>

        <AppModalFooter>
          <button
            type="button"
            onClick={() => {
              setShowTypeManagerModal(false)
              setConfirmDeleteTypeId(null)
              setEditingTypeId(null)
            }}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            ปิด
          </button>
        </AppModalFooter>
      </AppModal>
    </>
  )
}
