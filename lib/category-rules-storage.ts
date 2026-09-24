import { fetchCategoriesFromSupabase, saveCategoryToSupabase } from '@/lib/repositories/product-repository'
/**
 * Shared Product Category Rules & Composite Lookup Storage
 *
 * 1. Product Categories (หมวดหมู่สินค้า - ตาราง 1)
 * 2. Master Units (หน่วยนับ - ตาราง 2, in unit-storage.ts)
 * 3. Composite Rules (ตารางประกอบข้อมูล - ตาราง 3)
 *
 * Single source of truth backed by localStorage:
 * - 'pos_master_categories'
 * - 'pos_category_composite_rules'
 * - 'pos_category_rules' (legacy sync)
 */

export type CalculationType =
  | 'PER_ROUND'
  | 'PER_DAY'
  | 'SALE'
  | 'NO_CHARGE'
  | 'PER_WEEK'
  | 'PER_MONTH'
  | 'CUSTOM'

export interface ProductCategoryItem {
  id: string
  name: string
}

export interface CategoryCompositeRule {
  id: string
  categoryId: string
  calculationType: CalculationType
  unitId?: string
}

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
  { type: 'PER_ROUND', label: 'ต่อรอบ' },
  { type: 'PER_DAY', label: 'ต่อวัน' },
  { type: 'SALE', label: 'ขาย' },
  { type: 'NO_CHARGE', label: 'ไม่คิดเงิน' },
]

export const CALCULATION_LONG_LABELS: Record<CalculationType, string> = {
  PER_ROUND: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
  PER_DAY: 'ราคาเช่าต่อวัน × จำนวนสินค้า × จำนวนวัน',
  SALE: 'ราคาขายต่อชิ้น × จำนวนสินค้า',
  NO_CHARGE: 'ไม่คิดเงิน (ฟรี)',
  PER_WEEK: 'ราคาเช่าต่อสัปดาห์ × จำนวนสินค้า × จำนวนสัปดาห์',
  PER_MONTH: 'ราคาเช่าต่อเดือน × จำนวนสินค้า × จำนวนเดือน',
  CUSTOM: 'กำหนดเอง',
}

export const DEFAULT_CATEGORIES: ProductCategoryItem[] = [
  { id: 'cat-1', name: 'แบบคาน' },
  { id: 'cat-2', name: 'แบบเสา' },
  { id: 'cat-3', name: 'นั่งร้าน' },
  { id: 'cat-4', name: 'อุปกรณ์เสริม' },
  { id: 'cat-5', name: 'ทั่วไป' },
]

export const DEFAULT_CATEGORY_RULES: ProductCategoryRule[] = [
  {
    id: 'cat-1',
    name: 'แบบคาน',
    calculationType: 'PER_ROUND',
    calculationLabel: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
    unit: 'แผ่น',
    unitId: 'unit-1',
    isDefault: true,
  },
  {
    id: 'cat-2',
    name: 'แบบเสา',
    calculationType: 'PER_ROUND',
    calculationLabel: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
    unit: 'ต้น',
    unitId: 'unit-2',
    isDefault: true,
  },
  {
    id: 'cat-3',
    name: 'นั่งร้าน',
    calculationType: 'PER_ROUND',
    calculationLabel: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
    unit: 'ชุด',
    unitId: 'unit-3',
    isDefault: true,
  },
  {
    id: 'cat-4',
    name: 'อุปกรณ์เสริม',
    calculationType: 'PER_ROUND',
    calculationLabel: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
    unit: 'ชิ้น',
    unitId: 'unit-4',
    isDefault: true,
  },
  {
    id: 'cat-5',
    name: 'ทั่วไป',
    calculationType: 'PER_ROUND',
    calculationLabel: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
    unit: 'ชิ้น',
    unitId: 'unit-4',
    isDefault: true,
  },
]

const CATEGORIES_KEY = 'pos_master_categories'
const COMPOSITE_RULES_KEY = 'pos_category_composite_rules'
const LEGACY_RULES_KEY = 'pos_category_rules'

// ─── Categories Management (ตาราง 1) ───────────────────────


let _cachedCategories: ProductCategoryItem[] | null = null;
let _isFetchingCategories = false;
export function loadCategories(): ProductCategoryItem[] {
  if (typeof window === 'undefined') return [];
  if (_cachedCategories === null) {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    _cachedCategories = raw ? JSON.parse(raw) : [...DEFAULT_CATEGORIES];
  }
  if (!_isFetchingCategories) {
    _isFetchingCategories = true;
    fetchCategoriesFromSupabase().then(cats => {
      _cachedCategories = cats.map(c => ({ id: c.id, name: c.name }));
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(_cachedCategories));
      window.dispatchEvent(new Event('app_settings_changed'));
      _isFetchingCategories = false;
    }).catch(() => { _isFetchingCategories = false; });
  }
  return _cachedCategories || [];
}

export function saveCategories(categories: ProductCategoryItem[]): void {
  if (typeof window === 'undefined') return;
  _cachedCategories = categories;
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  categories.forEach(c => saveCategoryToSupabase(c).catch(console.error));
}

export function addCategory(name: string): ProductCategoryItem[] {
  const trimmed = name.trim()
  if (!trimmed) {
    throw new Error('กรุณาระบุชื่อหมวดหมู่')
  }

  const current = loadCategories()
  const exists = current.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
  if (exists) {
    throw new Error(`หมวดหมู่ "${trimmed}" มีอยู่ในระบบแล้ว`)
  }

  const newCat: ProductCategoryItem = {
    id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: trimmed,
  }

  const updated = [...current, newCat]
  saveCategories(updated)
  return updated
}

export function updateCategory(id: string, name: string): ProductCategoryItem[] {
  const trimmed = name.trim()
  if (!trimmed) {
    throw new Error('กรุณาระบุชื่อหมวดหมู่')
  }

  const current = loadCategories()
  const duplicate = current.some((c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase())
  if (duplicate) {
    throw new Error(`ชื่อหมวดหมู่ "${trimmed}" มีอยู่ในระบบแล้ว`)
  }

  const updated = current.map((c) => (c.id === id ? { ...c, name: trimmed } : c))
  saveCategories(updated)
  return updated
}

export function deleteCategory(id: string, inUseCheck?: (cat: ProductCategoryItem) => boolean): ProductCategoryItem[] {
  const current = loadCategories()
  const target = current.find((c) => c.id === id)
  if (!target) return current

  if (inUseCheck && inUseCheck(target)) {
    throw new Error(`ไม่สามารถลบหมวดหมู่ "${target.name}" ได้เนื่องจากกำลังถูกใช้งานอยู่`)
  }

  const updated = current.filter((c) => c.id !== id)
  saveCategories(updated)
  return updated
}

// ─── Composite Rules Management (ตาราง 3: ตารางประกอบข้อมูล) ─

export function loadCompositeRules(): CategoryCompositeRule[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(COMPOSITE_RULES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed as CategoryCompositeRule[]
      }
    }

    // If never initialized before, migrate from legacy rules if present
    const legacyRaw = localStorage.getItem(LEGACY_RULES_KEY)
    if (legacyRaw) {
      const legacyRules = JSON.parse(legacyRaw)
      if (Array.isArray(legacyRules) && legacyRules.length > 0) {
        const migrated: CategoryCompositeRule[] = legacyRules.map((r: any, idx: number) => ({
          id: `comp-${r.id || idx + 1}`,
          categoryId: r.id,
          calculationType: (r.calculationType as CalculationType) || 'PER_ROUND',
          unitId: r.unitId || '',
        }))
        saveCompositeRules(migrated)
        return migrated
      }
    }

    // Default: table can start empty or with migrated rules
    return []
  } catch {
    return []
  }
}

export function saveCompositeRules(rules: CategoryCompositeRule[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(COMPOSITE_RULES_KEY, JSON.stringify(rules))
  } catch {
    // ignore
  }
}

export function addCompositeRule(ruleData: Omit<CategoryCompositeRule, 'id'>): CategoryCompositeRule[] {
  const current = loadCompositeRules()
  const newRule: CategoryCompositeRule = {
    ...ruleData,
    id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }
  const updated = [...current, newRule]
  saveCompositeRules(updated)
  return updated
}

export function updateCompositeRule(updatedRule: CategoryCompositeRule): CategoryCompositeRule[] {
  const current = loadCompositeRules()
  const updated = current.map((r) => (r.id === updatedRule.id ? updatedRule : r))
  saveCompositeRules(updated)
  return updated
}

// ─── Backward Compatibility Wrappers ───────────────────────

export function loadCategoryRules(): ProductCategoryRule[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORY_RULES

  try {
    const raw = localStorage.getItem(LEGACY_RULES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as ProductCategoryRule[]
      }
    }

    const categories = loadCategories()
    const compositeRules = loadCompositeRules()

    const merged: ProductCategoryRule[] = categories.map((cat) => {
      const comp = compositeRules.find((r) => r.categoryId === cat.id)
      const calcType = comp?.calculationType || 'PER_ROUND'
      return {
        id: cat.id,
        name: cat.name,
        calculationType: calcType,
        calculationLabel: CALCULATION_LONG_LABELS[calcType] || 'ต่อรอบ',
        unit: 'ชิ้น',
        unitId: comp?.unitId,
      }
    })

    if (merged.length > 0) {
      saveCategoryRules(merged)
      return merged
    }

    saveCategoryRules(DEFAULT_CATEGORY_RULES)
    return [...DEFAULT_CATEGORY_RULES]
  } catch {
    return [...DEFAULT_CATEGORY_RULES]
  }
}

export function saveCategoryRules(rules: ProductCategoryRule[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LEGACY_RULES_KEY, JSON.stringify(rules))
  } catch {
    // ignore
  }
}

export function addCategoryRule(ruleData: Omit<ProductCategoryRule, 'id'>): ProductCategoryRule[] {
  const current = loadCategoryRules()
  const newRule: ProductCategoryRule = {
    ...ruleData,
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }
  const next = [...current, newRule]
  saveCategoryRules(next)

  // Keep categories updated too
  try {
    const cats = loadCategories()
    if (!cats.some((c) => c.name.toLowerCase() === ruleData.name.toLowerCase())) {
      addCategory(ruleData.name)
    }
  } catch {}

  return next
}

export function updateCategoryRule(updated: ProductCategoryRule): ProductCategoryRule[] {
  const current = loadCategoryRules()
  const next = current.map((r) => (r.id === updated.id ? updated : r))
  saveCategoryRules(next)
  return next
}

export function deleteCategoryRule(id: string): ProductCategoryRule[] {
  const current = loadCategoryRules()
  const next = current.filter((r) => r.id !== id)
  saveCategoryRules(next)
  return next
}

export function getCategoryRuleById(id?: string): ProductCategoryRule | undefined {
  if (!id) return undefined
  const rules = loadCategoryRules()
  return rules.find((r) => r.id === id)
}

export function getCategoryRuleByName(name?: string): ProductCategoryRule | undefined {
  if (!name) return undefined
  const rules = loadCategoryRules()
  return rules.find((r) => r.name.trim().toLowerCase() === name.trim().toLowerCase())
}
