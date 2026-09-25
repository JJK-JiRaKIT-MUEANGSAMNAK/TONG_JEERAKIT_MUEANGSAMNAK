import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCustomersFromSupabase, saveCustomerToSupabase } from '@/lib/repositories/customer-repository'

const mockSelect = vi.fn()
const mockOrder = vi.fn()
const mockUpsert = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: (table: string) => {
      if (table === 'customers') {
        return {
          select: mockSelect,
          upsert: mockUpsert
        }
      }
      return {}
    }
  })
}))

describe('Customer Repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockSelect.mockReturnValue({
      order: mockOrder
    })
  })

  it('fetch maps snake_case to camelCase correctly', async () => {
    mockOrder.mockResolvedValue({
      data: [{
        id: '123',
        customer_code: 'C001',
        customer_name: 'Test Customer',
        customer_type: 'INDIVIDUAL',
        is_suspended: true,
        note: 'Some note',
        house_no: '12',
        moo: '3',
        soi: '4',
        road: 'Main St',
        sub_district: 'Sub',
        district: 'Dist',
        province: 'Prov',
        postal_code: '12345',
        id_card_image_url: 'http://image.com'
      }],
      error: null
    })

    const result = await fetchCustomersFromSupabase()
    
    expect(result).toHaveLength(1)
    const c = result[0]
    expect(c.id).toBe('123')
    expect(c.customerCode).toBe('C001')
    expect(c.customerType).toBe('INDIVIDUAL')
    expect(c.isSuspended).toBe(true)
    expect(c.note).toBe('Some note')
    expect(c.houseNo).toBe('12')
    expect(c.idCardImageUrl).toBe('http://image.com')
  })

  it('save/upsert sends all fields correctly', async () => {
    mockUpsert.mockResolvedValue({ error: null })

    const customer = {
      id: '123',
      customerCode: 'C001',
      customerName: 'Test Name',
      customerType: 'COMPANY' as any,
      phone: '0812345678',
      houseNo: '123',
      subDistrict: 'Sub',
      isSuspended: false,
      note: 'Hello'
    }

    await saveCustomerToSupabase(customer)

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '123',
        customer_code: 'C001',
        customer_name: 'Test Name',
        customer_type: 'COMPANY',
        phone: '0812345678',
        house_no: '123',
        sub_district: 'Sub',
        is_suspended: false,
        note: 'Hello'
      })
    )
  })

  it('Supabase error must throw during fetch', async () => {
    mockOrder.mockResolvedValue({
      data: null,
      error: new Error('Database Error')
    })

    await expect(fetchCustomersFromSupabase()).rejects.toThrow('Database Error')
  })

  it('Supabase error must throw during save', async () => {
    mockUpsert.mockResolvedValue({
      error: new Error('Upsert Error')
    })

    await expect(saveCustomerToSupabase({ id: '123', customerName: 'Test', phone: '123' })).rejects.toThrow('Upsert Error')
  })
})
