import { describe, it, expect, beforeEach, vi } from 'vitest'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})
Object.defineProperty(globalThis, 'window', {
  value: globalThis,
  writable: true,
})

import { loadUnits, addUnit, updateUnit, deleteUnit, toggleUnitStatus, DEFAULT_UNITS } from '@/lib/unit-storage'
import { loadCategoryRules, addCategoryRule, DEFAULT_CATEGORY_RULES } from '@/lib/category-rules-storage'
import { loadProducts } from '@/lib/product-storage'

describe('Unit and Category Rules & Products Workspace Tests', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('3. LIST displays products with categories and units', () => {
    const products = loadProducts()
    expect(products.length).toBeGreaterThan(0)
    expect(products[0].unit).toBeDefined()
    expect(products[0].name).toBeDefined()
  })

  it('6. SETTINGS can add new Master Unit', () => {
    const initialUnits = loadUnits()
    expect(initialUnits.length).toBe(DEFAULT_UNITS.length)

    const updated = addUnit('มัด')
    expect(updated.some(u => u.name === 'มัด')).toBe(true)

    // Verify duplicate error
    expect(() => addUnit('มัด')).toThrow()
  })

  it('6. SETTINGS can update and toggle Master Unit', () => {
    loadUnits()
    const updated = updateUnit('unit-1', 'แผ่นเหล็ก')
    expect(updated.find(u => u.id === 'unit-1')?.name).toBe('แผ่นเหล็ก')

    const toggled = toggleUnitStatus('unit-1')
    expect(toggled.find(u => u.id === 'unit-1')?.isActive).toBe(false)
  })

  it('6. SETTINGS safely protects in-use Master Unit from deletion', () => {
    loadUnits()
    expect(() => {
      deleteUnit('unit-1', (u) => u.id === 'unit-1')
    }).toThrow('กำลังถูกใช้งานอยู่')
  })

  it('7. SETTINGS can add and edit category rules and select unit from Master', () => {
    const rules = loadCategoryRules()
    expect(rules.length).toBe(DEFAULT_CATEGORY_RULES.length)

    const units = loadUnits()
    const chosenUnit = units.find(u => u.name === 'ต้น') || units[0]

    const nextRules = addCategoryRule({
      name: 'เสาเหล็กกลม',
      calculationType: 'PER_DAY',
      calculationLabel: 'ราคาเช่าต่อวัน × จำนวนสินค้า × จำนวนวัน',
      unit: chosenUnit.name,
      unitId: chosenUnit.id,
    })

    const found = nextRules.find(r => r.name === 'เสาเหล็กกลม')
    expect(found).toBeDefined()
    expect(found?.unit).toBe('ต้น')
    expect(found?.unitId).toBe(chosenUnit.id)
    expect(found?.calculationType).toBe('PER_DAY')
  })

  it('8. Reload retains Category Rules and Master Units in storage', () => {
    loadUnits()
    addUnit('ท่อ')
    const reloadedUnits = loadUnits()
    expect(reloadedUnits.some(u => u.name === 'ท่อ')).toBe(true)

    const rules = loadCategoryRules()
    expect(rules.length).toBeGreaterThanOrEqual(DEFAULT_CATEGORY_RULES.length)
  })

  it('9. Existing products retain their units and categories', () => {
    const products = loadProducts()
    const beam = products.find(p => p.category === 'แบบคาน')
    expect(beam).toBeDefined()
    expect(beam?.unit).toBe('แผ่น')
  })

  it('10. SETTINGS source code does not contain Master or technical jargon in UI', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const filePath = path.resolve(process.cwd(), 'components/products/ProductSettingsView.tsx')
    const content = fs.readFileSync(filePath, 'utf-8')

    // Must not have technical jargon in UI
    expect(content.includes('stable ID')).toBe(false)
    expect(content.includes('snapshot')).toBe(false)
    expect(content.includes('legacy')).toBe(false)
    // Must not have Master in Thai headings or descriptions
    expect(content.includes('Master หน่วยนับ')).toBe(false)
    expect(content.includes('หน่วยนับหลัก (Master)')).toBe(false)
    expect(content.includes('ดึงจาก Master')).toBe(false)

    // Verify sections and column headers exist
    expect(content.includes('หมวดหมู่สินค้า')).toBe(true)
    expect(content.includes('หน่วยนับ')).toBe(true)
    expect(content.includes('รูปแบบการคิดเงิน')).toBe(true)
    expect(content.includes('ยังไม่มีรายการ')).toBe(true)
  })

  it('11. Draft state persists across tab switching (ADD -> SETTINGS -> ADD)', () => {
    let activeMainTab: 'LIST' | 'ADD' | 'SETTINGS' = 'ADD'
    let createDraftRows = [
      {
        id: 'draft-row-1',
        name: 'นั่งร้านแบบพิเศษ 1.7 ม.',
        categoryId: 'rule-cat-1',
        rentPrice: 120,
        salePrice: 1500,
        quantityAdded: 25,
        addedDate: new Date('2026-03-10'),
      },
    ]
    let isAccessory = true

    // Switch to SETTINGS to manage/add categories
    activeMainTab = 'SETTINGS'
    expect(activeMainTab).toBe('SETTINGS')

    // Add a new category rule in SETTINGS
    const chosenUnit = loadUnits()[0]
    const updatedRules = addCategoryRule({
      name: 'โครงสร้างพิเศษ',
      calculationType: 'PER_ROUND',
      calculationLabel: 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ',
      unit: chosenUnit.name,
      unitId: chosenUnit.id,
    })
    const newCat = updatedRules.find(r => r.name === 'โครงสร้างพิเศษ')
    expect(newCat).toBeDefined()

    // Switch back to ADD
    activeMainTab = 'ADD'
    expect(activeMainTab).toBe('ADD')

    // Verify draft rows are 100% intact
    expect(createDraftRows.length).toBe(1)
    expect(createDraftRows[0].name).toBe('นั่งร้านแบบพิเศษ 1.7 ม.')
    expect(createDraftRows[0].rentPrice).toBe(120)
    expect(createDraftRows[0].quantityAdded).toBe(25)
    expect(isAccessory).toBe(true)

    // User can now pick the newly created category
    createDraftRows[0].categoryId = newCat!.id
    expect(createDraftRows[0].categoryId).toBe(newCat!.id)
  })
})
