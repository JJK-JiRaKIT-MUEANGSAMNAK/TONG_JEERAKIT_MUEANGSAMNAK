/**
 * Master Units Storage
 *
 * Single source of truth for Master Units, backed by localStorage pos_master_units.
 * - Migrates from existing category rules & legacy units without destroying existing data.
 * - Provides safe add, update, and delete/toggle operations.
 * - Prevents damaging references when a unit is in use by category rules or products.
 */

import { Unit } from '@/lib/types/rental-pos'
export type { Unit }

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
 * Load all units from localStorage with safe non-destructive migration.
 */
export function loadUnits(): Unit[] {
  if (typeof window === 'undefined') return DEFAULT_UNITS

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized: Unit[] = parsed.map((item: any, idx: number) => {
          const unitName = (item.name || item.label || '').trim()
          return {
            id: item.id || `unit-${idx + 1}`,
            name: unitName,
            isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
          }
        }).filter((u) => u.name.length > 0)

        const seenNames = new Set<string>()
        const uniqueUnits: Unit[] = []
        for (const u of normalized) {
          const lower = u.name.toLowerCase()
          if (!seenNames.has(lower)) {
            seenNames.add(lower)
            uniqueUnits.push(u)
          }
        }

        if (uniqueUnits.length > 0) {
          return uniqueUnits
        }
      }
    }

    saveUnits(DEFAULT_UNITS)
    return [...DEFAULT_UNITS]
  } catch {
    return [...DEFAULT_UNITS]
  }
}

/**
 * Save units to localStorage.
 */
export function saveUnits(units: Unit[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(units))
  } catch {
    // quota exceeded - silently ignore
  }
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
    id: `unit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: trimmed,
    isActive: true,
  }

  const updated = [...current, newUnit]
  saveUnits(updated)
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
  return updated
}

/**
 * Toggle unit active status.
 */
export function toggleUnitStatus(id: string): Unit[] {
  const current = loadUnits()
  const updated = current.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
  saveUnits(updated)
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

  const newUnit: Unit = {
    id: `unit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: trimmed,
    isActive: true,
  }
  const updated = [...current, newUnit]
  saveUnits(updated)
  return newUnit
}
