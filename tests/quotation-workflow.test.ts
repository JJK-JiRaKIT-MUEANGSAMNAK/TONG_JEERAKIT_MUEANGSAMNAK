import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadQuotations,
  addQuotation,
  updateQuotationStatus,
  updateQuotationConverted,
  getQuotationById,
  generateQuotationNo,
  mapQuotationToPos,
} from '../lib/quotation-storage'
import { Quotation, Product, Customer } from '../lib/types/rental-pos'
import { loadProducts, saveProducts } from '../lib/product-storage'
import { loadTransactions, saveTransactions, StatementTransaction } from '../lib/finance-storage'
import { loadBills, saveBills } from '../lib/bill-storage'

// Simulated in-memory localStorage adhering to Web Storage API
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

describe('Quotation Workflow Validation Suite', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('1. Save Quotation: correctly persists all fields into app_quotation_storage', () => {
    const quotationNo = generateQuotationNo()
    expect(quotationNo).toMatch(/^QT-\d{8}-\d{4}$/)

    const newQuotation: Quotation = {
      id: 'qt-save-test',
      quotationNo,
      quotationDate: '2026-09-11',
      expiryDate: '2026-09-26',
      customerId: 'cust-001',
      customerName: 'นายประสิทธิ์ พากเพียร',
      phone: '0891234567',
      customerAddress: '55/9 ม.2 ต.บางพลี จ.สมุทรปราการ',
      customerTaxId: '1100500123456',
      siteName: 'โครงการบ้านเดี่ยว พระราม 2',
      rentalStartDate: '2026-09-15',
      rentalEndDate: '2026-09-20',
      items: [
        {
          id: 'item-1',
          productId: 'prod-scaffold',
          productName: 'นั่งร้านเหล็ก 1.7m',
          rentalType: 'DAILY',
          quantity: 10,
          unitName: 'ชุด',
          unitPrice: 50,
          usageCountOrDays: 5,
          lineTotal: 2500,
          isAccessory: false,
          isChargeable: true,
          requiresReturn: true,
        },
      ],
      subtotal: 2500,
      discountAmount: 200,
      shippingFee: 500,
      depositAmount: 1000,
      taxAmount: 196,
      grandTotal: 3996,
      status: 'WAITING',
    }

    const savedList = addQuotation(newQuotation)
    expect(savedList).toHaveLength(1)
    expect(savedList[0].id).toBe('qt-save-test')

    // Confirm persisted into real localStorage key
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'app_quotation_storage',
      expect.stringContaining('qt-save-test')
    )

    // Load by ID
    const retrieved = getQuotationById('qt-save-test')
    expect(retrieved).not.toBeNull()
    expect(retrieved?.customerName).toBe('นายประสิทธิ์ พากเพียร')
    expect(retrieved?.items[0].quantity).toBe(10)
    expect(retrieved?.grandTotal).toBe(3996)
    expect(retrieved?.status).toBe('WAITING')
  })

  it('2. Load Quotation list: loads real quotation items from storage', () => {
    expect(loadQuotations()).toEqual([])

    const q1: Quotation = {
      id: 'qt-list-1',
      quotationNo: 'QT-20260911-0001',
      quotationDate: '2026-09-11',
      expiryDate: '2026-09-26',
      customerId: 'cust-1',
      customerName: 'ลูกค้า 1',
      rentalStartDate: '2026-09-15',
      rentalEndDate: '2026-09-20',
      items: [],
      subtotal: 1000,
      discountAmount: 0,
      shippingFee: 0,
      depositAmount: 0,
      taxAmount: 0,
      grandTotal: 1000,
      status: 'WAITING',
    }

    const q2: Quotation = {
      id: 'qt-list-2',
      quotationNo: 'QT-20260911-0002',
      quotationDate: '2026-09-11',
      expiryDate: '2026-09-26',
      customerId: 'cust-2',
      customerName: 'ลูกค้า 2',
      rentalStartDate: '2026-09-15',
      rentalEndDate: '2026-09-20',
      items: [],
      subtotal: 2000,
      discountAmount: 0,
      shippingFee: 0,
      depositAmount: 0,
      taxAmount: 0,
      grandTotal: 2000,
      status: 'ACCEPTED',
    }

    addQuotation(q1)
    addQuotation(q2)

    const loaded = loadQuotations()
    expect(loaded).toHaveLength(2)
    expect(loaded.map((q) => q.id)).toEqual(['qt-list-2', 'qt-list-1'])
  })

  it('3. Persist status: changes to quotation status persist to storage', () => {
    const q: Quotation = {
      id: 'qt-status-test',
      quotationNo: 'QT-20260911-0003',
      quotationDate: '2026-09-11',
      expiryDate: '2026-09-26',
      customerId: 'cust-1',
      customerName: 'ลูกค้าทดสอบสถานะ',
      rentalStartDate: '2026-09-15',
      rentalEndDate: '2026-09-20',
      items: [],
      subtotal: 1500,
      discountAmount: 0,
      shippingFee: 0,
      depositAmount: 0,
      taxAmount: 0,
      grandTotal: 1500,
      status: 'WAITING',
    }
    addQuotation(q)

    // 1. Accept quotation
    updateQuotationStatus('qt-status-test', 'ACCEPTED')
    let reloaded = loadQuotations().find((x) => x.id === 'qt-status-test')
    expect(reloaded?.status).toBe('ACCEPTED')

    // 2. Release quotation with remark
    updateQuotationStatus('qt-status-test', 'CANCELLED', 'ลูกค้าแจ้งยกเลิกโครงการ')
    reloaded = loadQuotations().find((x) => x.id === 'qt-status-test')
    expect(reloaded?.status).toBe('CANCELLED')
    expect(reloaded?.remark).toBe('ลูกค้าแจ้งยกเลิกโครงการ')

    // 3. Convert quotation to bill
    updateQuotationConverted('qt-status-test', 'bill-777')
    reloaded = loadQuotations().find((x) => x.id === 'qt-status-test')
    expect(reloaded?.status).toBe('CONVERTED')
    expect(reloaded?.convertedBillId).toBe('bill-777')
  })

  it('4. Open Quotation into POS: reuses exact runtime POS mapping helper without duplicate simulation', () => {
    const initialProducts: Product[] = [
      {
        id: 'prod-rent-1',
        code: 'RENT01',
        name: 'เครื่องตบดิน 5 ตัน',
        category: 'เครื่องจักร',
        unit: 'เครื่อง',
        rentalType: 'DAILY',
        normalPrice: 500,
        dailyPrice: 500,
        costPrice: 0,
        defaultDamageFee: 1000,
        defaultLossFee: 20000,
        totalQuantity: 5,
        availableQuantity: 5,
        rentedQuantity: 0,
        damagedQuantity: 0,
        lostQuantity: 0,
        minimumStock: 1,
        status: 'ACTIVE',
        isAccessory: false,
        isChargeable: true,
        requiresReturn: true,
      },
      {
        id: 'prod-sale-1',
        code: 'SALE01',
        name: 'ใบตัดเพชร 14 นิ้ว',
        category: 'วัสดุสิ้นเปลือง',
        unit: 'ใบ',
        rentalType: 'SALE',
        normalPrice: 1200,
        dailyPrice: 0,
        salePrice: 1200,
        costPrice: 800,
        defaultDamageFee: 0,
        defaultLossFee: 0,
        totalQuantity: 20,
        availableQuantity: 20,
        rentedQuantity: 0,
        damagedQuantity: 0,
        lostQuantity: 0,
        minimumStock: 5,
        status: 'ACTIVE',
        isAccessory: false,
        isChargeable: true,
        requiresReturn: false,
      },
    ]

    const initialCustomers: Customer[] = [
      {
        id: 'cust-vip-1',
        customerName: 'บริษัท ทีเจ คอนสตรัคชั่น จำกัด',
        phone: '028889999',
        address: '88/1 ถ.สาทรใต้ แขวงยานนาวา เขตสาทร กทม.',
        taxId: '0105551234567',
      },
    ]

    const testQuotation: Quotation = {
      id: 'qt-pos-flow',
      quotationNo: 'QT-20260911-8888',
      quotationDate: '2026-09-11',
      expiryDate: '2026-09-26',
      customerId: 'cust-vip-1',
      customerName: 'บริษัท ทีเจ คอนสตรัคชั่น จำกัด',
      phone: '028889999',
      customerAddress: '88/1 ถ.สาทรใต้ แขวงยานนาวา เขตสาทร กทม.',
      customerTaxId: '0105551234567',
      siteName: 'โครงการสร้างโรงงาน นิคมบางปู',
      rentalStartDate: '2026-09-12',
      rentalEndDate: '2026-09-15',
      items: [
        {
          id: 'qi-rent',
          productId: 'prod-rent-1',
          productName: 'เครื่องตบดิน 5 ตัน',
          rentalType: 'DAILY',
          quantity: 2,
          unitName: 'เครื่อง',
          unitPrice: 500,
          usageCountOrDays: 3,
          dailyStartDate: '2026-09-12',
          dailyEndDate: '2026-09-15',
          lineTotal: 3000,
          requiresReturn: true,
        },
        {
          id: 'qi-sale',
          productId: 'prod-sale-1',
          productName: 'ใบตัดเพชร 14 นิ้ว',
          rentalType: 'SALE',
          quantity: 3,
          unitName: 'ใบ',
          unitPrice: 1200,
          usageCountOrDays: 1,
          lineTotal: 3600,
          requiresReturn: false,
        },
      ],
      subtotal: 6600,
      discountAmount: 600,
      shippingFee: 800,
      depositAmount: 2000,
      taxAmount: 476,
      grandTotal: 9276,
      status: 'ACCEPTED',
    }

    addQuotation(testQuotation)
    const quoteFromStorage = getQuotationById('qt-pos-flow')!
    expect(quoteFromStorage).not.toBeNull()

    // Execute runtime shared mapping helper (reuse logic identical to runtime /pos)
    const { customer, cartItems, values } = mapQuotationToPos(
      quoteFromStorage,
      initialProducts,
      initialCustomers
    )

    // Validate Customer
    expect(customer.id).toBe('cust-vip-1')
    expect(customer.customerName).toBe('บริษัท ทีเจ คอนสตรัคชั่น จำกัด')
    expect(customer.phone).toBe('028889999')
    expect(customer.address).toBe('88/1 ถ.สาทรใต้ แขวงยานนาวา เขตสาทร กทม.')
    expect(customer.taxId).toBe('0105551234567')

    // Validate Items: RENT vs SALE, prices, quantities, calculations
    expect(cartItems).toHaveLength(2)

    // Item 1: RENT
    const rentItem = cartItems[0]
    expect(rentItem.productId).toBe('prod-rent-1')
    expect(rentItem.productName).toBe('เครื่องตบดิน 5 ตัน')
    expect(rentItem.itemType).toBe('RENT')
    expect(rentItem.rentalType).toBe('DAILY')
    expect(rentItem.quantity).toBe(2)
    expect(rentItem.unitPrice).toBe(500)
    expect(rentItem.usageCount).toBe(3)
    expect(rentItem.billableDays).toBe(3)
    expect(rentItem.dailyStartDate).toBe('2026-09-12')
    expect(rentItem.dailyEndDate).toBe('2026-09-15')
    expect(rentItem.lineTotal).toBe(3000)
    expect(rentItem.product.requiresReturn).toBe(true)

    // Item 2: SALE
    const saleItem = cartItems[1]
    expect(saleItem.productId).toBe('prod-sale-1')
    expect(saleItem.productName).toBe('ใบตัดเพชร 14 นิ้ว')
    expect(saleItem.itemType).toBe('SALE')
    expect(saleItem.rentalType).toBe('SALE')
    expect(saleItem.quantity).toBe(3)
    expect(saleItem.unitPrice).toBe(1200)
    expect(saleItem.lineTotal).toBe(3600)
    expect(saleItem.product.requiresReturn).toBe(false)

    // Validate Financial values: discount, shipping, deposit, VAT, dates
    expect(values.discount).toBe(600)
    expect(values.shippingFee).toBe(800)
    expect(values.depositAmount).toBe(2000)
    expect(values.taxRate).toBe(0.07)
    expect(values.shippingAddress).toBe('โครงการสร้างโรงงาน นิคมบางปู')
    expect(values.rentalStartDate).toBe('2026-09-12')
    expect(values.rentalEndDate).toBe('2026-09-15')
  })

  it('5. Quotation does not deduct stock: verifies with app_product_storage that totalQuantity, availableQuantity, and rentedQuantity remain unchanged', () => {
    // 1. Prepare product into app_product_storage
    const testProduct: Product = {
      id: 'prod-stock-verify',
      code: 'STK99',
      name: 'เครื่องกำเนิดไฟฟ้า 10kVA',
      category: 'เครื่องจักร',
      unit: 'เครื่อง',
      rentalType: 'DAILY',
      normalPrice: 1500,
      dailyPrice: 1500,
      costPrice: 50000,
      defaultDamageFee: 5000,
      defaultLossFee: 60000,
      totalQuantity: 10,
      availableQuantity: 8,
      rentedQuantity: 2,
      damagedQuantity: 0,
      lostQuantity: 0,
      minimumStock: 1,
      status: 'ACTIVE',
      isAccessory: false,
      isChargeable: true,
      requiresReturn: true,
    }

    saveProducts([testProduct])

    // Verify stored in app_product_storage
    const storedBefore = loadProducts()
    expect(storedBefore).toHaveLength(1)
    expect(storedBefore[0].availableQuantity).toBe(8)
    expect(storedBefore[0].rentedQuantity).toBe(2)
    expect(storedBefore[0].totalQuantity).toBe(10)

    // 2. Save Quotation requesting 4 units of this product
    const quote: Quotation = {
      id: 'qt-stock-check',
      quotationNo: 'QT-20260911-9999',
      quotationDate: '2026-09-11',
      expiryDate: '2026-09-26',
      customerId: 'cust-x',
      customerName: 'ลูกค้าทดสอบสต็อก',
      rentalStartDate: '2026-09-15',
      rentalEndDate: '2026-09-20',
      items: [
        {
          productId: 'prod-stock-verify',
          productName: 'เครื่องกำเนิดไฟฟ้า 10kVA',
          rentalType: 'DAILY',
          quantity: 4,
          unitPrice: 1500,
          usageCountOrDays: 5,
          lineTotal: 30000,
        },
      ],
      subtotal: 30000,
      discountAmount: 0,
      shippingFee: 0,
      depositAmount: 0,
      taxAmount: 0,
      grandTotal: 30000,
      status: 'WAITING',
    }

    addQuotation(quote)

    // 3. Reload Product from product-storage
    const storedAfter = loadProducts()
    const productAfter = storedAfter.find((p) => p.id === 'prod-stock-verify')!

    // 4. Confirm totalQuantity, availableQuantity, and rentedQuantity remain unchanged
    expect(productAfter.totalQuantity).toBe(10)
    expect(productAfter.availableQuantity).toBe(8)
    expect(productAfter.rentedQuantity).toBe(2)
    expect(productAfter.damagedQuantity).toBe(0)
    expect(productAfter.lostQuantity).toBe(0)
  })

  it('6. Quotation does not record finance: verifies real key app_finance_storage and app_bill_storage remain untouched', () => {
    // 1. Prepare existing transactions in app_finance_storage
    const initialTxs: StatementTransaction[] = [
      {
        id: 'tx-existing-1',
        dateTime: '2026-09-10T10:00:00.000Z',
        refNo: 'BILL-20260910-1001',
        type: 'INCOME',
        category: 'ค่าเช่าอุปกรณ์',
        description: 'ชำระค่าเช่าอุปกรณ์',
        customerName: 'ลูกค้าเดิม',
        incomeAmount: 5000,
        expenseAmount: 0,
        runningBalance: 5000,
        channel: 'โอนเงิน',
      },
    ]
    saveTransactions(initialTxs)
    saveBills([])

    // Snapshot before saving Quotation
    const financeSnapshotBefore = loadTransactions()
    const rawFinanceBefore = localStorageMock.getItem('app_finance_storage')
    const billsBefore = loadBills()

    expect(financeSnapshotBefore).toHaveLength(1)
    expect(billsBefore).toHaveLength(0)

    // 2. Save Quotation with large amount and deposit
    const quote: Quotation = {
      id: 'qt-finance-check',
      quotationNo: 'QT-20260911-7777',
      quotationDate: '2026-09-11',
      expiryDate: '2026-09-26',
      customerId: 'cust-f',
      customerName: 'ลูกค้ารายใหญ่',
      rentalStartDate: '2026-09-15',
      rentalEndDate: '2026-09-20',
      items: [
        {
          productId: 'p-dummy',
          productName: 'สินค้าทดสอบ',
          rentalType: 'NORMAL',
          quantity: 10,
          unitPrice: 1000,
          usageCountOrDays: 1,
          lineTotal: 10000,
        },
      ],
      subtotal: 10000,
      discountAmount: 1000,
      shippingFee: 500,
      depositAmount: 3000,
      taxAmount: 665,
      grandTotal: 13165,
      status: 'WAITING',
    }

    addQuotation(quote)

    // 3. Reload finance from app_finance_storage
    const financeAfter = loadTransactions()
    const rawFinanceAfter = localStorageMock.getItem('app_finance_storage')
    const billsAfter = loadBills()

    // 4. Must be exactly identical, no new transaction, and no new bill
    expect(financeAfter).toEqual(financeSnapshotBefore)
    expect(rawFinanceAfter).toBe(rawFinanceBefore)
    expect(billsAfter).toHaveLength(0)
    expect(localStorageMock.getItem('app_bill_storage')).toBe('[]')
  })
})
