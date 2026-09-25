/**
 * Shared Appointment Storage
 *
 * Source of truth: Supabase PostgreSQL public.appointments table with in-memory cache.
 * Single source of truth for appointments across Appointments, Dashboard, Calendar.
 * ZERO localStorage fallback for business data.
 */

import { Appointment } from '@/lib/types/rental-pos'
import { createClient } from '@/lib/supabase/client'

// In-memory cache for fast synchronous access by UI components
let _cachedAppointments: Appointment[] | null = null

const STORAGE_KEY = 'app_appointment_storage'

export function setCachedAppointments(appointments: Appointment[]): void {
  _cachedAppointments = appointments
}

export function loadAppointments(): Appointment[] {
  if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === null) {
        _cachedAppointments = []
        return []
      }
      return JSON.parse(raw) as Appointment[]
    } catch {
      return []
    }
  }
  return _cachedAppointments || []
}

export function saveAppointments(appointments: Appointment[]): void {
  _cachedAppointments = appointments
  if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments))
    } catch {}
  }
}

export function addAppointment(incoming: Appointment): Appointment[] {
  const current = loadAppointments()
  const exists = current.some((a) => a.id === incoming.id)
  const next = exists
    ? current.map((a) => (a.id === incoming.id ? incoming : a))
    : [incoming, ...current]
  saveAppointments(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveAppointmentToSupabase(incoming).catch((err) =>
      console.error('[Supabase] Failed to sync added appointment:', err)
    )
  }
  return next
}

export function updateAppointment(updated: Appointment): Appointment[] {
  const current = loadAppointments()
  const next = current.map((a) => (a.id === updated.id ? updated : a))
  saveAppointments(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    saveAppointmentToSupabase(updated).catch((err) =>
      console.error('[Supabase] Failed to sync updated appointment:', err)
    )
  }
  return next
}

export function deleteAppointment(id: string): Appointment[] {
  const current = loadAppointments()
  const next = current.filter((a) => a.id !== id)
  saveAppointments(next)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    deleteAppointmentFromSupabase(id).catch((err) =>
      console.error('[Supabase] Failed to delete appointment:', err)
    )
  }
  return next
}

// ─── Database Row Mapping ──────────────────────────────────────────

export function dbAppointmentToDomain(row: any): Appointment {
  return {
    id: row.id,
    businessId: row.business_id,
    customerId: row.customer_id,
    customerName: row.customer_name || '',
    phone: row.phone || '',
    title: row.title || row.topic || '',
    type: row.type || 'GENERAL',
    appointmentTypeId: row.appointment_type_id,
    date: row.date || (row.appointment_date ? new Date(row.appointment_date).toISOString().slice(0, 10) : ''),
    startTime: row.start_time || '09:00',
    endTime: row.end_time || '10:00',
    location: row.location || '',
    contactPerson: row.contact_person,
    billId: row.bill_id,
    billNo: row.bill_no,
    quotationId: row.quotation_id,
    quotationNo: row.quotation_no,
    details: row.details,
    status: row.status || 'PENDING',
    priority: row.priority || 'NORMAL',
    assigneeId: row.assignee_id,
    assigneeName: row.assignee_name,
    items: Array.isArray(row.items) ? row.items : undefined,
    events: Array.isArray(row.events) ? row.events : undefined,
    createdAt: row.created_at,
  }
}

export function domainAppointmentToDbRow(apt: Appointment): Record<string, any> {
  const aptDate = apt.date || new Date().toISOString().slice(0, 10)
  return {
    id: apt.id,
    customer_id: apt.customerId || null,
    customer_name: apt.customerName,
    appointment_date: `${aptDate}T${apt.startTime || '09:00'}:00.000Z`,
    topic: apt.title,
    title: apt.title,
    type: apt.type,
    appointment_type_id: apt.appointmentTypeId || null,
    date: aptDate,
    start_time: apt.startTime || '09:00',
    end_time: apt.endTime || '10:00',
    phone: apt.phone || null,
    location: apt.location || null,
    contact_person: apt.contactPerson || null,
    bill_id: apt.billId || null,
    bill_no: apt.billNo || null,
    quotation_id: apt.quotationId || null,
    quotation_no: apt.quotationNo || null,
    details: apt.details || null,
    status: apt.status,
    priority: apt.priority || 'NORMAL',
    assignee_id: apt.assigneeId || null,
    assignee_name: apt.assigneeName || null,
    items: apt.items || [],
    events: apt.events || [],
    updated_at: new Date().toISOString(),
  }
}

// ─── Supabase Async Operations ────────────────────────────────────────

export async function fetchAppointmentsFromSupabase(): Promise<Appointment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('appointment_date', { ascending: true })

  if (error) {
    throw new Error(`ไม่สามารถดึงข้อมูลนัดหมายจาก Supabase ได้: ${error.message}`)
  }

  const mapped = (data || []).map(dbAppointmentToDomain)
  saveAppointments(mapped)
  return mapped
}

export async function saveAppointmentToSupabase(appointment: Appointment): Promise<void> {
  const supabase = createClient()
  const row = domainAppointmentToDbRow(appointment)
  const { error } = await supabase.from('appointments').upsert(row)

  if (error) {
    throw new Error(`ไม่สามารถบันทึกนัดหมายลง Supabase ได้: ${error.message}`)
  }
}

export async function deleteAppointmentFromSupabase(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('appointments').delete().eq('id', id)

  if (error) {
    throw new Error(`ไม่สามารถลบนัดหมายจาก Supabase ได้: ${error.message}`)
  }
}
