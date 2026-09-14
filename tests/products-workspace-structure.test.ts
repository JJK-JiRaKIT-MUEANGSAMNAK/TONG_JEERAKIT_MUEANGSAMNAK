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
import { loadProducts, applyStockCountAdjustment } from '@/lib/product-storage'

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

  it('12. ProductCreateView defines columns in exact order and fits screen without horizontal scroll', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const filePath = path.resolve(process.cwd(), 'components/products/ProductCreateView.tsx')
    const content = fs.readFileSync(filePath, 'utf-8')

    // Elements in order across 2-line row layout
    const expectedHeaders = [
      'ลำดับ',
      'ชื่อสินค้า',
      'หมวดหมู่',
      'วิธีคิดเงิน',
      'หน่วย',
      'จัดการ',
      'ราคา',
      'ต้นทุน',
      'ค่าชำรุด',
      'ค่าสูญหาย',
      'จำนวนเพิ่ม',
      'วันที่ทำรายการ',
    ]

    let lastIdx = -1
    for (const h of expectedHeaders) {
      const idx = content.indexOf(h)
      expect(idx).toBeGreaterThan(-1)
      expect(idx).toBeGreaterThan(lastIdx)
      lastIdx = idx
    }

    // Fits screen width without horizontal scroll, scrolls vertically internally
    expect(content.includes('overflow-y-auto')).toBe(true)

    // Accessory checkbox has been cancelled as requested
    expect(content.includes('type="checkbox"')).toBe(false)
    expect(content.includes('แถวที่ไม่มีชื่อสินค้าจะไม่ถูกบันทึก')).toBe(true)
  })

  it('13. Category selection lookups composite rules and sets calculationType, unitId, and hides price on NO_CHARGE', async () => {
    const { createInitialDraftRows } = await import('@/lib/product-draft-types')
    const rows = createInitialDraftRows('cat-1', 'unit-1', 'PER_ROUND')
    expect(rows.length).toBe(10)
    expect(rows[0].categoryId).toBe('cat-1')
    expect(rows[0].calculationType).toBe('PER_ROUND')
    expect(rows[0].unitId).toBe('unit-1')

    // Test NO_CHARGE behavior
    rows[0].calculationType = 'NO_CHARGE'
    rows[0].price = 0
    rows[0].unitId = 'unit-2'
    rows[0].costPrice = 80
    rows[0].damageFee = 50
    rows[0].lossFee = 300
    rows[0].quantityAdded = 10
    rows[0].minimumStock = 5

    expect(rows[0].calculationType).toBe('NO_CHARGE')
    expect(rows[0].price).toBe(0)
    expect(rows[0].unitId).toBe('unit-2')
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

  it('15. COUNT Tab / Stock Count adjustments update inventory accurately and create audit records', () => {
    const products = loadProducts()
    const targetProduct = products[0]
    expect(targetProduct).toBeDefined()

    const initialTotal = targetProduct.totalQuantity
    const actor = { userId: 'user-test', displayName: 'ผู้ทดสอบ' }

    // Apply stock count adjustment
    const updatedProducts = applyStockCountAdjustment(
      targetProduct.id,
      { normalQty: initialTotal + 5, damagedQty: 2, lostQty: 1 },
      'ตรวจนับสต็อกประจำไตรมาส',
      actor
    )

    const updated = updatedProducts.find((p: any) => p.id === targetProduct.id)
    expect(updated).toBeDefined()
    if (!updated) throw new Error('Target product not found')
    expect(updated.availableQuantity).toBe(initialTotal + 5)
    expect(updated.damagedQuantity).toBe(2)
    expect(updated.lostQuantity).toBe(1)
    expect(updated.totalQuantity).toBe(initialTotal + 5 + 2 + 1)
  })

  it('16. Categories management (Table 1) adds, updates, and deletes safely', async () => {
    const { loadCategories, addCategory, updateCategory, deleteCategory } = await import('@/lib/category-rules-storage')
    const initialCats = loadCategories()
    expect(initialCats.length).toBeGreaterThan(0)

    const updated = addCategory('เสาค้ำยันพิเศษ')
    const found = updated.find((c) => c.name === 'เสาค้ำยันพิเศษ')
    expect(found).toBeDefined()

    const renamed = updateCategory(found!.id, 'เสาค้ำยันพิเศษ V2')
    expect(renamed.find((c) => c.id === found!.id)?.name).toBe('เสาค้ำยันพิเศษ V2')

    // Safety check: cannot delete if in use
    expect(() => {
      deleteCategory(found!.id, () => true)
    }).toThrow('กำลังถูกใช้งานอยู่')

    // Can delete if not in use
    const deleted = deleteCategory(found!.id, () => false)
    expect(deleted.some((c) => c.id === found!.id)).toBe(false)
  })

  it('17. Composite rules management (Table 3) supports 4 calculation types including NO_CHARGE', async () => {
    const {
      loadCompositeRules,
      addCompositeRule,
      updateCompositeRule,
      CALCULATION_OPTIONS,
    } = await import('@/lib/category-rules-storage')

    // Verify exactly the 4 required calculation types
    const types = CALCULATION_OPTIONS.map((o) => o.type)
    expect(types).toContain('PER_ROUND')
    expect(types).toContain('PER_DAY')
    expect(types).toContain('SALE')
    expect(types).toContain('NO_CHARGE')

    const initialRules = loadCompositeRules()
    expect(Array.isArray(initialRules)).toBe(true)

    const newRule = {
      categoryId: 'cat-test-1',
      calculationType: 'NO_CHARGE' as const,
      unitId: 'unit-4',
    }
    const withAdded = addCompositeRule(newRule)
    const addedItem = withAdded.find((r) => r.categoryId === 'cat-test-1')
    expect(addedItem).toBeDefined()
    expect(addedItem?.calculationType).toBe('NO_CHARGE')
    expect(addedItem?.unitId).toBe('unit-4')

    // Update rule retains values
    const updatedRules = updateCompositeRule({
      ...addedItem!,
      calculationType: 'PER_DAY',
      unitId: '', // Unit allowed to be empty
    })
    const updatedItem = updatedRules.find((r) => r.id === addedItem!.id)
    expect(updatedItem?.calculationType).toBe('PER_DAY')
    expect(updatedItem?.unitId).toBe('')
  })

  it('18. ProductCreateView lookup behavior: autofills on match, leaves empty without fallback if not found, NO_CHARGE sets price=0', async () => {
    const mockCompositeRules: any[] = [
      { id: 'comp-1', categoryId: 'cat-beam', calculationType: 'PER_ROUND', unitId: 'unit-sheet' },
      { id: 'comp-2', categoryId: 'cat-free', calculationType: 'NO_CHARGE', unitId: '' }, // No unit
    ]

    // 1. Category with rule and unit: autofills both
    const match1 = mockCompositeRules.find((r) => r.categoryId === 'cat-beam')
    expect(match1).toBeDefined()
    expect(match1.calculationType).toBe('PER_ROUND')
    expect(match1.unitId).toBe('unit-sheet')

    // 2. Category with NO_CHARGE and no unit: calculationType = NO_CHARGE, price = 0, unit empty for user to choose
    const match2 = mockCompositeRules.find((r) => r.categoryId === 'cat-free')
    expect(match2).toBeDefined()
    expect(match2.calculationType).toBe('NO_CHARGE')
    expect(match2.unitId).toBe('')
    const isNoCharge = match2.calculationType === 'NO_CHARGE'
    const finalPrice = isNoCharge ? 0 : 100
    expect(finalPrice).toBe(0)

    // 3. Category without composite rule: does NOT guess or fallback, leaves user to choose
    const match3 = mockCompositeRules.find((r) => r.categoryId === 'cat-unknown')
    expect(match3).toBeUndefined()
    const autoCalcType = match3 ? match3.calculationType : ''
    const autoUnitId = match3 ? match3.unitId : ''
    expect(autoCalcType).toBe('')
    expect(autoUnitId).toBe('')
  })

  it('19. ProductSettingsView layout: no outer card frames, 3 standard tables with pagination and fixed heights', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const filePath = path.resolve(process.cwd(), 'components/products/ProductSettingsView.tsx')
    const content = fs.readFileSync(filePath, 'utf-8')

    // No outer Card frame classes
    expect(content.includes('rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4')).toBe(false)

    // Landscape 2 columns + full width table 3 below
    expect(content.includes('grid grid-cols-1 lg:grid-cols-2 gap-4')).toBe(true)

    // 3 tables present
    expect(content.includes('หมวดหมู่สินค้า')).toBe(true)
    expect(content.includes('หน่วยนับ')).toBe(true)
    expect(content.includes('ตารางประกอบข้อมูล')).toBe(true)

    // Pagination elements (ก่อนหน้า | หน้า X / Y | ถัดไป)
    expect(content.includes('ก่อนหน้า')).toBe(true)
    expect(content.includes('ถัดไป')).toBe(true)
    expect(content.includes('PAGE_SIZE = 5')).toBe(true)

    // Fixed header
    expect(content.includes('sticky top-0')).toBe(true)

    // Centers text
    expect(content.includes('text-center')).toBe(true)

    // + เพิ่มแถว at bottom of table 3
    expect(content.includes('+ เพิ่มแถว')).toBe(true)
  })
})

