/**
 * Shared Product Category Rules Storage
 *
 * 1 row = 1 Product Category Rule (ชุดกฎของสินค้า)
 * Comprises: id, name (ชื่อหมวดหมู่), calculationType & calculationLabel (รูปแบบการคำนวณ), unit (หน่วยนับ).
 * Single source of truth backed by localStorage key 'pos_category_rules'.
 * Automatically migrates from pos_master_categories, pos_master_rental_types, pos_master_units without destroying data.
 */

export type CalculationType = 'PER_ROUND' | 'PER_DAY' | 'PER_WEEK' | 'PER_MONTH' | 'SALE' | 'CUSTOM'

export interface ProductCategoryRule {
  id: string
  name: string
  calculationType: CalculationType
  calculationLabel: string
  unit: string
  unitId?: string
  unitName?: string
  isDefault?: boolean
}

export const CALCULATION_OPTIONS: Array<{ type: CalculationType; label: string }> = [
  { type: 'PER_ROUND', label: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ' },
  { type: 'PER_DAY', label: 'ราคาเช่าต่อวัน × จำนวนสินค้า × จำนวนวัน' },
  { type: 'PER_WEEK', label: 'ราคาเช่าต่อสัปดาห์ × จำนวนสินค้า × จำนวนสัปดาห์' },
  { type: 'PER_MONTH', label: 'ราคาเช่าต่อเดือน × จำนวนสินค้า × จำนวนเดือน' },
  { type: 'SALE', label: 'ราคาขายต่อชิ้น × จำนวนสินค้า' },
  { type: 'CUSTOM', label: 'กำหนดเอง' },
]

export const DEFAULT_CATEGORY_RULES: ProductCategoryRule[] = [
  {
    id: 'rule-cat-1',
    name: 'แบบคาน',
    calculationType: 'PER_ROUND',
    calculationLabel: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
    unit: 'แผ่น',
    unitId: 'unit-1',
    isDefault: true,
  },
  {
    id: 'rule-cat-2',
    name: 'แบบเสา',
    calculationType: 'PER_ROUND',
    calculationLabel: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
    unit: 'ต้น',
    unitId: 'unit-2',
    isDefault: true,
  },
  {
    id: 'rule-cat-3',
    name: 'นั่งร้าน',
    calculationType: 'PER_ROUND',
    calculationLabel: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
    unit: 'ชุด',
    unitId: 'unit-3',
    isDefault: true,
  },
  {
    id: 'rule-cat-4',
    name: 'อุปกรณ์เสริม',
    calculationType: 'PER_ROUND',
    calculationLabel: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
    unit: 'ชิ้น',
    unitId: 'unit-4',
    isDefault: true,
  },
  {
    id: 'rule-cat-5',
    name: 'ทั่วไป',
    calculationType: 'PER_ROUND',
    calculationLabel: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
    unit: 'ชิ้น',
    unitId: 'unit-4',
    isDefault: true,
  },
]

const STORAGE_KEY = 'pos_category_rules'
const LEGACY_CATS_KEY = 'pos_master_categories'
const LEGACY_RTS_KEY = 'pos_master_rental_types'
const LEGACY_UNITS_KEY = 'pos_master_units'

/**
 * Sync backward-compatible legacy storage keys so old components won't break
 */
function syncLegacyKeys(rules: ProductCategoryRule[]): void {
  if (typeof window === 'undefined') return
  try {
    const cats = rules.map((r) => ({ id: r.id, label: r.name }))
    const units = Array.from(new Set(rules.map((r) => r.unit))).map((u, i) => ({
      id: `legacy-u-${i + 1}`,
      label: u,
    }))
    const rentalTypes = Array.from(new Set(rules.map((r) => r.calculationLabel))).map((calc, i) => {
      const match = rules.find((r) => r.calculationLabel === calc)
      return {
        id: `legacy-rt-${i + 1}`,
        label: match?.calculationType === 'PER_DAY' ? 'ต่อวัน' : match?.calculationType === 'SALE' ? 'ขายขาด' : 'ต่อรอบ',
        calculation: calc,
        code: match?.calculationType === 'PER_DAY' ? 'DAILY' : match?.calculationType === 'SALE' ? 'SALE' : 'NORMAL',
      }
    })
    localStorage.setItem(LEGACY_CATS_KEY, JSON.stringify(cats))
    localStorage.setItem(LEGACY_UNITS_KEY, JSON.stringify(units))
    localStorage.setItem(LEGACY_RTS_KEY, JSON.stringify(rentalTypes))
  } catch {
    // ignore
  }
}

/**
 * Load all category rules from localStorage with non-destructive legacy migration.
 */
export function loadCategoryRules(): ProductCategoryRule[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORY_RULES

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as ProductCategoryRule[]
      }
    }

    // Migration from legacy keys if available
    const legacyCatsRaw = localStorage.getItem(LEGACY_CATS_KEY)
    if (legacyCatsRaw) {
      const legacyCats = JSON.parse(legacyCatsRaw)
      if (Array.isArray(legacyCats) && legacyCats.length > 0) {
        const migrated: ProductCategoryRule[] = legacyCats.map((cat: any, idx: number) => {
          const catName = cat.label || cat.name || `หมวดหมู่ ${idx + 1}`
          // Look for default mapping if available
          const defaultMatch = DEFAULT_CATEGORY_RULES.find((d) => d.name === catName)
          return {
            id: cat.id || `rule-${Date.now()}-${idx}`,
            name: catName,
            calculationType: defaultMatch ? defaultMatch.calculationType : 'PER_ROUND',
            calculationLabel: defaultMatch ? defaultMatch.calculationLabel : 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
            unit: defaultMatch ? defaultMatch.unit : 'ชิ้น',
            isDefault: defaultMatch?.isDefault ?? false,
          }
        })
        saveCategoryRules(migrated)
        return migrated
      }
    }

    // First launch fallback
    saveCategoryRules(DEFAULT_CATEGORY_RULES)
    return [...DEFAULT_CATEGORY_RULES]
  } catch {
    return [...DEFAULT_CATEGORY_RULES]
  }
}

/**
 * Save category rules list to localStorage and sync legacy keys.
 */
export function saveCategoryRules(rules: ProductCategoryRule[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
    syncLegacyKeys(rules)
  } catch {
    // ignore
  }
}

/**
 * Add a new category rule.
 */
export function addCategoryRule(ruleData: Omit<ProductCategoryRule, 'id'>): ProductCategoryRule[] {
  const current = loadCategoryRules()
  const newRule: ProductCategoryRule = {
    ...ruleData,
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }
  const next = [...current, newRule]
  saveCategoryRules(next)
  return next
}

/**
 * Update an existing category rule.
 */
export function updateCategoryRule(updated: ProductCategoryRule): ProductCategoryRule[] {
  const current = loadCategoryRules()
  const next = current.map((r) => (r.id === updated.id ? updated : r))
  saveCategoryRules(next)
  return next
}

/**
 * Delete a category rule by id.
 */
export function deleteCategoryRule(id: string): ProductCategoryRule[] {
  const current = loadCategoryRules()
  const next = current.filter((r) => r.id !== id)
  saveCategoryRules(next)
  return next
}

/**
 * Get category rule by ID
 */
export function getCategoryRuleById(id?: string): ProductCategoryRule | undefined {
  if (!id) return undefined
  const rules = loadCategoryRules()
  return rules.find((r) => r.id === id)
}

/**
 * Get category rule by Name
 */
export function getCategoryRuleByName(name?: string): ProductCategoryRule | undefined {
  if (!name) return undefined
  const rules = loadCategoryRules()
  return rules.find((r) => r.name.trim().toLowerCase() === name.trim().toLowerCase())
}
