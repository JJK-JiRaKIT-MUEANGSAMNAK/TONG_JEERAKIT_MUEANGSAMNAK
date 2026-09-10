/**
 * Shared Appointment Storage
 *
 * Backed by localStorage key 'app_appointment_storage'.
 * Single source of truth for appointments across Appointments, Dashboard, Calendar.
 */

import { Appointment } from '@/lib/types/rental-pos'

const STORAGE_KEY = 'app_appointment_storage'

export function loadAppointments(): Appointment[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as Appointment[]
    }
    return []
  } catch {
    return []
  }
}

export function saveAppointments(appointments: Appointment[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments))
  } catch {
    // silently ignore quota issues
  }
}

export function addAppointment(incoming: Appointment): Appointment[] {
  const current = loadAppointments()
  const exists = current.some((a) => a.id === incoming.id)
  const next = exists
    ? current.map((a) => (a.id === incoming.id ? incoming : a))
    : [incoming, ...current]
  saveAppointments(next)
  return next
}

export function updateAppointment(updated: Appointment): Appointment[] {
  const current = loadAppointments()
  const next = current.map((a) => (a.id === updated.id ? updated : a))
  saveAppointments(next)
  return next
}

export function deleteAppointment(id: string): Appointment[] {
  const current = loadAppointments()
  const next = current.filter((a) => a.id !== id)
  saveAppointments(next)
  return next
}
