// @vitest-environment jsdom
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { CartPanel } from '@/components/pos/CartPanel'
import CheckoutPage from '@/app/pos/checkout/page'
import { SystemSettingsProvider } from '@/lib/contexts/SystemSettingsContext'
import { loadSystemSettings, saveSystemSettings } from '@/lib/settings-storage'
import { CartItem, saveActiveCart } from '@/lib/cart-storage'
import { Customer } from '@/lib/types/rental-pos'

const mocks = vi.hoisted(() => ({ create: vi.fn(), draft: vi.fn(), toast: vi.fn(), push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/lib/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'tester', fullName: 'Tester' } }) }))
vi.mock('@/components/common/Toast', () => ({ useToast: () => ({ showToast: mocks.toast }) }))
vi.mock('@/lib/bill-workflow-service', () => ({
  checkAndExpireReservations: vi.fn(), createBillWorkflow: mocks.create,
  saveDraftBillWorkflow: mocks.draft, confirmDraftBillWorkflow: vi.fn(),
}))
vi.mock('@/components/pos/CustomerUnifiedSelector', () => ({ CustomerUnifiedSelector: () => null }))
vi.mock('@/components/customers/NewCustomerModal', () => ({ NewCustomerModal: () => null }))
vi.mock('@/components/pos/A4FitPreview', () => ({ A4FitPreview: ({ children }: any) => children }))
vi.mock('@/templates/rental-bill/RentalBillTemplate', () => ({
  RentalBillTemplate: ({ data }: any) => <output data-testid="preview-tax">{data.taxAmount}</output>,
}))
vi.mock('@/components/pos/payment/PaymentDynamicContent', () => ({ PaymentDynamicContent: () => null }))
vi.mock('@/components/common/PostSavePrintModal', () => ({ PostSavePrintModal: () => null }))

const customer = { id: 'customer', customerName: 'Customer', phone: '0812345678', address: 'Bangkok' } as Customer
function item(mode: 'RENT' | 'SALE', legacy = false): CartItem {
  return {
    id: mode, product: { id: mode, code: mode, name: mode, rentalType: mode === 'SALE' ? 'SALE' : 'NORMAL' } as CartItem['product'],
    itemType: legacy ? undefined : mode, rentalType: mode === 'SALE' ? 'SALE' : 'NORMAL',
    unitPrice: 100, quantity: 1, usageCount: 1, lineTotal: 100,
  }
}
function mountCheckout(items: CartItem[], selectedCustomer: Customer | null = customer) {
  saveActiveCart({
    items, customer: selectedCustomer, discount: 0, shippingFee: 0, depositAmount: 0,
    tax: 999, taxRate: 0.99, subtotal: 100, grandTotal: 1099,
    shippingAddress: '', documentType: 'บิลเช่า', documentDate: '2026-09-24',
    headerRentalDate: '2026-09-24', headerReturnDate: '2026-09-25',
  })
  return render(<SystemSettingsProvider><CheckoutPage /></SystemSettingsProvider>)
}
beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  const settings = loadSystemSettings()
  saveSystemSettings({ ...settings, financePayment: { ...settings.financePayment, defaultVatPercent: 7, vatEnabled: true } })
})
afterEach(cleanup)

describe('MASTER #5 rendered POS/Checkout', () => {
  it('POS switch persists shared setting and responds to settings changes', () => {
    render(<SystemSettingsProvider><CartPanel onCheckout={vi.fn()} items={[item('SALE')]} /></SystemSettingsProvider>)
    const toggle = screen.getByRole('switch', { name: 'เปิดใช้งาน VAT' }) as HTMLInputElement
    expect(toggle.checked).toBe(true)
    fireEvent.click(toggle)
    expect(loadSystemSettings().financePayment).toMatchObject({ vatEnabled: false, defaultVatPercent: 7 })
    expect(toggle.checked).toBe(false)
    act(() => {
      const settings = loadSystemSettings()
      saveSystemSettings({ ...settings, financePayment: { ...settings.financePayment, vatEnabled: true } })
    })
    expect(toggle.checked).toBe(true)
  })

  it.each([false, true])('Checkout ignores stale snapshot, previews/saves current VAT enabled=%s', (enabled) => {
    const settings = loadSystemSettings()
    saveSystemSettings({ ...settings, financePayment: { ...settings.financePayment, vatEnabled: enabled } })
    mountCheckout([item('SALE')], null)
    expect(screen.getByTestId('preview-tax').textContent).toBe(enabled ? '7' : '0')
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันออกบิลเช่า' }))
    expect(mocks.create).toHaveBeenCalledOnce()
    expect(mocks.create.mock.calls[0][0].bill).toMatchObject({
      taxAmount: enabled ? 7 : 0, grandTotal: enabled ? 107 : 100,
      rentalStatus: 'CONFIRMED', dispatchStatus: 'PENDING',
      items: [expect.objectContaining({ itemType: 'SALE', requiresReturn: false, status: 'PENDING', deliveredQty: 0, remainingQty: 1 })],
    })
  })

  it('Checkout updates VAT while mounted and draft saves recalculated tax', () => {
    mountCheckout([item('RENT'), item('SALE')])
    expect(screen.getByTestId('preview-tax').textContent).toBe('14')
    act(() => {
      const settings = loadSystemSettings()
      saveSystemSettings({ ...settings, financePayment: { ...settings.financePayment, vatEnabled: false } })
    })
    expect(screen.getByTestId('preview-tax').textContent).toBe('0')
    fireEvent.click(screen.getByRole('button', { name: 'บันทึกแบบร่าง (Save Draft)' }))
    expect(mocks.draft).toHaveBeenCalledOnce()
    expect(mocks.draft.mock.calls[0][0].bill).toMatchObject({ taxAmount: 0, grandTotal: 200,
      items: [expect.objectContaining({ itemType: 'RENT', requiresReturn: true, status: 'PENDING' }),
        expect.objectContaining({ itemType: 'SALE', requiresReturn: false, status: 'PENDING' })],
    })
  })

  it.each([null, { ...customer, phone: '' }, { ...customer, address: '' }])('legacy RENT blocks confirm and draft for incomplete customer', (selectedCustomer) => {
    mountCheckout([item('RENT', true)], selectedCustomer)
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันออกบิลเช่า' }))
    fireEvent.click(screen.getByRole('button', { name: 'บันทึกแบบร่าง (Save Draft)' }))
    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.draft).not.toHaveBeenCalled()
    expect(mocks.toast).toHaveBeenCalledTimes(2)
  })
})
