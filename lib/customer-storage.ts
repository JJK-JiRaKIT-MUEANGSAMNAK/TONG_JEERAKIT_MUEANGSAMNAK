/**
 * Shared Customer Storage
 *
 * Backed by localStorage key 'app_customer_storage'.
 * Single source of truth for customers across POS, Customers, Appointments, Bills, Dashboard.
 */

import { Customer } from '@/lib/types/rental-pos'

const STORAGE_KEY = 'app_customer_storage'

export function loadCustomers(): Customer[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as Customer[]
    }
    return []
  } catch {
    return []
  }
}

export function saveCustomers(customers: Customer[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
  } catch {
    // silently ignore quota issues
  }
}

export function addCustomer(incoming: Customer): Customer[] {
  const current = loadCustomers()
  const exists = current.some((c) => c.id === incoming.id)
  const next = exists
    ? current.map((c) => (c.id === incoming.id ? incoming : c))
    : [incoming, ...current]
  saveCustomers(next)
  return next
}

export function updateCustomer(updated: Customer): Customer[] {
  const current = loadCustomers()
  const next = current.map((c) => (c.id === updated.id ? updated : c))
  saveCustomers(next)
  return next
}

export function deleteCustomer(id: string): Customer[] {
  const current = loadCustomers()
  const next = current.filter((c) => c.id !== id)
  saveCustomers(next)
  return next
}
