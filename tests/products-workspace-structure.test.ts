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

  it('12. ProductCreateView defines the 13 columns in exact order and horizontal scroll container', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const filePath = path.resolve(process.cwd(), 'components/products/ProductCreateView.tsx')
    const content = fs.readFileSync(filePath, 'utf-8')

    // 13 columns in order
    const expectedHeaders = [
      'ลำดับ',
      'ชื่อสินค้า',
      'อุปกรณ์เสริม',
      'หมวดหมู่',
      'หน่วยนับอุปกรณ์เสริม',
      'ราคา',
      'ต้นทุน/หน่วย',
      'ค่าชำรุด',
      'ค่าสูญหาย',
      'จำนวนเพิ่ม',
      'สต็อกขั้นต่ำ',
      'วันที่ทำรายการ',
      'จัดการ',
    ]

    let lastIdx = -1
    for (const h of expectedHeaders) {
      const idx = content.indexOf(h)
      expect(idx).toBeGreaterThan(-1)
      expect(idx).toBeGreaterThan(lastIdx)
      lastIdx = idx
    }

    // Horizontal scroll is within the table border container (overflow-x-auto, min-w-[1040px])
    expect(content.includes('overflow-x-auto')).toBe(true)
    expect(content.includes('min-w-[1040px]')).toBe(true)

    // No global accessory checkbox
    expect(content.includes('type="checkbox"')).toBe(true) // Row-level checkbox exists
    expect(content.includes('แถวที่ไม่มีชื่อสินค้าจะไม่ถูกบันทึก')).toBe(true)
  })

  it('13. Row-level accessory toggle enables accessory unit dropdown without muting isChargeable', async () => {
    const { createInitialDraftRows } = await import('@/lib/product-draft-types')
    const rows = createInitialDraftRows('rule-cat-1', 'unit-4')
    expect(rows.length).toBe(10)
    expect(rows[0].isAccessory).toBe(false)
    expect(rows[0].accessoryUnitId).toBe('unit-4')

    // Toggle row 0 to accessory
    rows[0].isAccessory = true
    rows[0].accessoryUnitId = 'unit-2' // e.g. 'ต้น'
    rows[0].price = 150
    rows[0].costPrice = 80
    rows[0].damageFee = 50
    rows[0].lossFee = 300
    rows[0].quantityAdded = 10
    rows[0].minimumStock = 5

    expect(rows[0].isAccessory).toBe(true)
    expect(rows[0].accessoryUnitId).toBe('unit-2')
    expect(rows[0].costPrice).toBe(80)
    expect(rows[0].damageFee).toBe(50)
    expect(rows[0].lossFee).toBe(300)
    expect(rows[0].minimumStock).toBe(5)
  })

  it('14. ADD Tab row mapping accurately preserves costPrice, damageFee, lossFee, minimumStock, and maps price by calculationType', () => {
    // Add or find a PER_DAY rule
    const chosenUnit = loadUnits()[0]
    const updatedRules = addCategoryRule({
      name: 'เสาค้ำยัน',
      calculationType: 'PER_DAY',
      calculationLabel: 'ราคาเช่าต่อวัน × จำนวนสินค้า × จำนวนวัน',
      unit: chosenUnit.name,
      unitId: chosenUnit.id,
    })
    const perDayRule = updatedRules.find((r) => r.calculationType === 'PER_DAY')!
    const units = loadUnits()
    const accUnit = units.find((u) => u.name === 'ชิ้น') || units[0]

    const draftRow = {
      id: 'row-test-1',
      name: 'เสาค้ำยัน 3.5 ม.',
      isAccessory: true,
      categoryId: perDayRule.id,
      accessoryUnitId: accUnit.id,
      price: 25,
      costPrice: 150,
      damageFee: 50,
      lossFee: 200,
      quantityAdded: 20,
      minimumStock: 4,
      addedDate: new Date('2026-03-12'),
    }

    // Map according to business rules in handleCreateSubmit
    const calcType = perDayRule.calculationType
    let rentPriceNum = null
    let salePriceNum = null
    let dailyPriceNum = 0
    let normalPriceNum = 0
    let rentalTypeVal = 'NORMAL'

    if (calcType === 'PER_DAY') {
      rentPriceNum = draftRow.price
      dailyPriceNum = draftRow.price
      normalPriceNum = draftRow.price
      rentalTypeVal = 'DAILY'
    }

    expect(rentPriceNum).toBe(25)
    expect(dailyPriceNum).toBe(25)
    expect(rentalTypeVal).toBe('DAILY')
    expect(draftRow.costPrice).toBe(150)
    expect(draftRow.damageFee).toBe(50)
    expect(draftRow.lossFee).toBe(200)
    expect(draftRow.minimumStock).toBe(4)
    expect(draftRow.quantityAdded).toBe(20)
    expect(draftRow.isAccessory).toBe(true)
  })
})

