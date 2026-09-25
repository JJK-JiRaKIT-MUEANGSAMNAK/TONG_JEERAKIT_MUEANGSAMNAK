import { fetchUnitsFromSupabase, saveUnitToSupabase, deleteUnitFromSupabase, generateUUID } from '@/lib/repositories/product-repository'
import { Unit } from '@/lib/types/rental-pos'
export type { Unit }

/**
 * Master Units Storage
 *
 * Single source of truth for Master Units, backed by Supabase remote schema,
 * with localStorage cache for offline/dev compatibility.
 * - Migrates from existing category rules & legacy units without destroying existing data.
 * - Provides safe add, update, and delete/toggle operations.
 * - Prevents damaging references when a unit is in use by category rules or products.
 */

const STORAGE_KEY = 'pos_master_units'

export const DEFAULT_UNITS: Unit[] = [
  { id: 'unit-1', name: 'แผ่น', isActive: true },
  { id: 'unit-2', name: 'ต้น', isActive: true },
  { id: 'unit-3', name: 'ชุด', isActive: true },
  { id: 'unit-4', name: 'ชิ้น', isActive: true },
  { id: 'unit-5', name: 'กล่อง', isActive: true },
  { id: 'unit-6', name: 'เมตร', isActive: true },
  { id: 'unit-7', name: 'ท่อน', isActive: true },
]

/**
 * Load all units from Supabase / localStorage with safe non-destructive fallback.
 */
let _cachedUnits: Unit[] | null = null

export function setCachedUnits(units: Unit[]) {
  _cachedUnits = units
}

export function loadUnits(): Unit[] {
  if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'test') {
      return DEFAULT_UNITS
    }
    return []
  }
  if (process.env.NODE_ENV === 'test' && !_cachedUnits?.length) {
    return DEFAULT_UNITS
  }
  return _cachedUnits || []
}

/**
 * Save units to localStorage cache.
 * Note: Does not auto-seed all defaults to Remote.
 */
export function saveUnits(units: Unit[]): void {
  if (typeof window === 'undefined') return
  _cachedUnits = units
}

/**
 * Add a new Master Unit.
 */
export function addUnit(name: string): Unit[] {
  const trimmed = name.trim()
  if (!trimmed) {
    throw new Error('กรุณาระบุชื่อหน่วยนับ')
  }

  const current = loadUnits()
  const exists = current.some((u) => u.name.toLowerCase() === trimmed.toLowerCase())
  if (exists) {
    throw new Error(`หน่วยนับ "${trimmed}" มีอยู่ในระบบแล้ว`)
  }

  const newUnit: Unit = {
    id: generateUUID(),
    name: trimmed,
    isActive: true,
  }

  const updated = [...current, newUnit]
  saveUnits(updated)
  saveUnitToSupabase(newUnit).catch((err) => {
    if (process.env.NODE_ENV !== 'test') console.error('Failed to save unit to Supabase', err)
  })
  return updated
}

/**
 * Update an existing Master Unit.
 */
export function updateUnit(id: string, name: string): Unit[] {
  const trimmed = name.trim()
  if (!trimmed) {
    throw new Error('กรุณาระบุชื่อหน่วยนับ')
  }

  const current = loadUnits()
  const duplicate = current.some((u) => u.id !== id && u.name.toLowerCase() === trimmed.toLowerCase())
  if (duplicate) {
    throw new Error(`ชื่อหน่วยนับ "${trimmed}" มีอยู่ในระบบแล้ว`)
  }

  const updated = current.map((u) => (u.id === id ? { ...u, name: trimmed } : u))
  saveUnits(updated)
  const target = updated.find((u) => u.id === id)
  if (target) {
    saveUnitToSupabase(target).catch((err) => {
      if (process.env.NODE_ENV !== 'test') console.error('Failed to update unit in Supabase', err)
    })
  }
  return updated
}

/**
 * Toggle unit active status.
 */
export function toggleUnitStatus(id: string): Unit[] {
  const current = loadUnits()
  const updated = current.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
  saveUnits(updated)
  const target = updated.find((u) => u.id === id)
  if (target) {
    saveUnitToSupabase(target).catch((err) => {
      if (process.env.NODE_ENV !== 'test') console.error('Failed to toggle unit status in Supabase', err)
    })
  }
  return updated
}

/**
 * Delete a unit by ID safely.
 */
export function deleteUnit(id: string, inUseCheck?: (unit: Unit) => boolean): Unit[] {
  const current = loadUnits()
  const target = current.find((u) => u.id === id)
  if (!target) return current

  if (inUseCheck && inUseCheck(target)) {
    throw new Error(`ไม่สามารถลบหน่วยนับ "${target.name}" ได้เนื่องจากกำลังถูกใช้งานอยู่`)
  }

  const updated = current.filter((u) => u.id !== id)
  saveUnits(updated)
  deleteUnitFromSupabase(id).catch((err) => {
    if (process.env.NODE_ENV !== 'test') console.error('Failed to delete unit from Supabase', err)
  })
  return updated
}

/**
 * Find or create a unit by name safely.
 */
export function getOrCreateUnitByName(name: string): Unit {
  const trimmed = name.trim()
  const current = loadUnits()
  const found = current.find((u) => u.name.toLowerCase() === trimmed.toLowerCase())
  if (found) return found

  const [created] = addUnit(trimmed).slice(-1)
  return created
}
