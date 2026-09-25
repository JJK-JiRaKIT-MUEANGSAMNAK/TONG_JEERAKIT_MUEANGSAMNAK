/**
 * Shared Customer Storage
 *
 * Backed by localStorage key 'app_customer_storage'.
 * Single source of truth for customers across POS, Customers, Appointments, Bills, Dashboard.
 */

import { Customer } from '@/lib/types/rental-pos'
import { fetchCustomersFromSupabase, saveCustomerToSupabase } from '@/lib/repositories/customer-repository'

let _cachedCustomers: Customer[] | null = null

export function setCachedCustomers(customers: Customer[]) {
  _cachedCustomers = customers
}

export function loadCustomers(): Customer[] {
  if (typeof window === 'undefined') return []
  return _cachedCustomers || []
}

export function saveCustomers(customers: Customer[]): void {
  if (typeof window === 'undefined') return
  _cachedCustomers = customers
}

export async function addCustomerAsync(incoming: Customer): Promise<Customer[]> {
  const current = loadCustomers()
  const exists = current.some((c) => c.id === incoming.id)
  const next = exists
    ? current.map((c) => (c.id === incoming.id ? incoming : c))
    : [incoming, ...current]

  await saveCustomerToSupabase(incoming)
  saveCustomers(next)
  return next
}

export async function updateCustomerAsync(updated: Customer): Promise<Customer[]> {
  const current = loadCustomers()
  const next = current.map((c) => (c.id === updated.id ? updated : c))

  await saveCustomerToSupabase(updated)
  saveCustomers(next)
  return next
}

// We will keep synchronous functions for code that might still call them,
// but they fire-and-forget the save.
export function addCustomer(incoming: Customer): Customer[] {
  const current = loadCustomers()
  const exists = current.some((c) => c.id === incoming.id)
  const next = exists
    ? current.map((c) => (c.id === incoming.id ? incoming : c))
    : [incoming, ...current]

  saveCustomers(next)
  saveCustomerToSupabase(incoming).catch(e => console.error(e))
  return next
}

export function updateCustomer(updated: Customer): Customer[] {
  const current = loadCustomers()
  const next = current.map((c) => (c.id === updated.id ? updated : c))

  saveCustomers(next)
  saveCustomerToSupabase(updated).catch(e => console.error(e))
  return next
}

export function deleteCustomer(id: string): Customer[] {
  const current = loadCustomers()
  const next = current.filter((c) => c.id !== id)
  saveCustomers(next)
  return next
}
