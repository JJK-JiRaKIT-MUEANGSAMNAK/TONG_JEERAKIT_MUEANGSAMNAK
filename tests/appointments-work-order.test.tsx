// @vitest-environment jsdom
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import AppointmentsPage from '@/app/appointments/page'
import { saveAppointments, loadAppointments } from '@/lib/appointment-storage'
import { Appointment } from '@/lib/types/rental-pos'

const mockToast = vi.fn()
vi.mock('@/components/common/Toast', () => ({
  useToast: () => ({ showToast: mockToast }),
}))

vi.mock('@/components/appointments/CalendarView', () => ({
  CalendarView: () => <div data-testid="mock-calendar-view">Mock Calendar</div>,
}))

vi.mock('@/lib/customer-storage', () => ({
  loadCustomers: () => [
    { id: 'cust-1', customerName: 'บริษัท ทดสอบ จำกัด', phone: '0811111111' },
  ],
}))

describe('MASTER Appointment & Work Order Flow Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(cleanup)

  it('ไม่มีพนักงานจริง -> สั่งงานไม่ได้ (ปุ่ม disabled และไม่มีรายชื่อพนักงานปลอม)', async () => {
    const apt: Appointment = {
      id: 'apt-1',
      title: 'งานส่งอุปกรณ์ A',
      customerName: 'บริษัท กสทช.',
      date: '2026-09-25',
      startTime: '09:00',
      endTime: '11:00',
      type: 'DELIVERY',
      status: 'PENDING',
    }
    saveAppointments([apt])

    render(<AppointmentsPage />)

    // Switch to tab "งานทั้งหมด"
    const allTab = screen.getByRole('button', { name: 'งานทั้งหมด' })
    fireEvent.click(allTab)

    // Find and click [สั่งงาน]
    const dispatchBtn = screen.getByRole('button', { name: 'สั่งงาน' })
    fireEvent.click(dispatchBtn)

    // Modal opened
    expect(screen.getByText('สั่งงาน (Work Order Dispatch)')).toBeDefined()

    // 1. Verify "ยังไม่มีข้อมูลพนักงาน" is shown and NO mock employees (นายช่าง 1, นายช่าง 2) exist
    expect(screen.getByText('ยังไม่มีข้อมูลพนักงาน')).toBeDefined()
    expect(screen.queryByText('นายช่าง 1 (เอก)')).toBeNull()
    expect(screen.queryByText('นายช่าง 2 (ชัย)')).toBeNull()

    // 2. Verify "LINE ยังไม่เชื่อม" is displayed
    expect(screen.getByText('LINE ยังไม่เชื่อม')).toBeDefined()

    // 3. Verify the submit dispatch button inside the modal is disabled
    const modalDispatchBtn = screen.getByRole('button', {
      name: /สั่งงาน \(ยังไม่มีข้อมูลพนักงาน\)/,
    }) as HTMLButtonElement
    expect(modalDispatchBtn.disabled).toBe(true)

    // Interacting/clicking must not trigger toast or fake success
    fireEvent.click(modalDispatchBtn)
    expect(mockToast).not.toHaveBeenCalledWith(
      expect.stringContaining('สำเร็จ'),
      expect.anything(),
      expect.anything()
    )

    // Verify storage has not added fake events or assignees
    const stored = loadAppointments()
    expect(stored[0].assigneeId).toBeUndefined()
    expect(stored[0].events).toBeUndefined()
  })

  it('ไม่มี events -> Timeline แสดง "ยังไม่มีข้อมูล" และไม่ mark ขั้นว่าเสร็จ', async () => {
    const apt: Appointment = {
      id: 'apt-2',
      title: 'งานรับคืนอุปกรณ์ B',
      customerName: 'บริษัท ทีโอที จำกัด',
      date: '2026-09-25',
      startTime: '13:00',
      endTime: '15:00',
      type: 'RETURN',
      status: 'PENDING',
      events: [], // No events
    }
    saveAppointments([apt])

    render(<AppointmentsPage />)

    const allTab = screen.getByRole('button', { name: 'งานทั้งหมด' })
    fireEvent.click(allTab)

    // Click [สถานะงาน]
    const timelineBtn = screen.getByRole('button', { name: 'สถานะงาน' })
    fireEvent.click(timelineBtn)

    // Modal opened
    expect(screen.getByText('สถานะงาน (Work Order Timeline)')).toBeDefined()

    // Check stages for RETURN flow
    expect(screen.getByText('สั่งงานเก็บ')).toBeDefined()
    expect(screen.getByText('ออกเก็บ')).toBeDefined()
    expect(screen.getByText('รับคืนสินค้า')).toBeDefined()

    // Each empty stage shows "ยังไม่มีข้อมูล"
    const noDataElements = screen.getAllByText('ยังไม่มีข้อมูล')
    expect(noDataElements.length).toBeGreaterThanOrEqual(9)

    // Must not mark any stage as completed ("เสร็จสิ้น")
    expect(screen.queryByText('เสร็จสิ้น')).toBeNull()

    // Status warning note is displayed
    expect(screen.getByText(/นัดหมายนี้ยังไม่มีการบันทึก Work Order Event รายขั้นตอน/)).toBeDefined()
  })

  it('มี events -> Timeline แสดงข้อมูล event จริงครบถ้วน', async () => {
    const apt: Appointment = {
      id: 'apt-3',
      title: 'งานส่งอุปกรณ์ไซต์งาน C',
      customerName: 'บริษัท พระราม 9 คอนสตรัคชั่น',
      date: '2026-09-25',
      startTime: '10:00',
      endTime: '12:00',
      type: 'DELIVERY',
      status: 'IN_PROGRESS',
      events: [
        {
          id: 'ev-1',
          stage: 'DISPATCH',
          status: 'DONE',
          by: 'หัวหน้างาน สมชาย',
          timestamp: '2026-09-25 09:30',
          note: 'จัดเตรียมเอกสารส่งของครบ',
          actualQuantity: 10,
          issues: 'ไม่มีปัญหา',
          images: ['https://example.com/img1.jpg'],
        },
        {
          id: 'ev-2',
          stage: 'ARRIVED',
          status: 'PENDING',
          by: 'คนขับ นพดล',
          timestamp: '2026-09-25 10:15',
          issues: 'ติดรอหน้าไซด์งาน 15 นาที',
        },
      ],
    }
    saveAppointments([apt])

    render(<AppointmentsPage />)

    const allTab = screen.getByRole('button', { name: 'งานทั้งหมด' })
    fireEvent.click(allTab)

    const timelineBtn = screen.getByRole('button', { name: 'สถานะงาน' })
    fireEvent.click(timelineBtn)

    // Check DISPATCH event details
    expect(screen.getByText('หัวหน้างาน สมชาย')).toBeDefined()
    expect(screen.getByText('2026-09-25 09:30')).toBeDefined()
    expect(screen.getByText('จัดเตรียมเอกสารส่งของครบ')).toBeDefined()
    expect(screen.getByText('10')).toBeDefined()
    expect(screen.getByText('ไม่มีปัญหา')).toBeDefined()
    const img = screen.getByAltText('event-img-0') as HTMLImageElement
    expect(img.src).toBe('https://example.com/img1.jpg')
    expect(screen.getByText('เสร็จสิ้น')).toBeDefined()

    // Check ARRIVED event details
    expect(screen.getByText('คนขับ นพดล')).toBeDefined()
    expect(screen.getByText('2026-09-25 10:15')).toBeDefined()
    expect(screen.getByText('ติดรอหน้าไซด์งาน 15 นาที')).toBeDefined()
    expect(screen.getAllByText('กำลังดำเนินการ').length).toBe(2)

    // Stages without events still display "ยังไม่มีข้อมูล"
    expect(screen.getAllByText('ยังไม่มีข้อมูล').length).toBe(7)
  })

  it('UI-only ต้องไม่สร้าง assignee/event ปลอม และระบุชัดเจนว่ายังไม่เชื่อม POS', async () => {
    const apt: Appointment = {
      id: 'apt-4',
      title: 'งานติดตั้งตลับเมตร D',
      customerName: 'คุณสมศักดิ์',
      date: '2026-09-25',
      startTime: '14:00',
      endTime: '15:00',
      type: 'DELIVERY',
      status: 'PENDING',
    }
    saveAppointments([apt])

    render(<AppointmentsPage />)

    const allTab = screen.getByRole('button', { name: 'งานทั้งหมด' })
    fireEvent.click(allTab)

    // Click [สร้างบิล]
    const createBillBtn = screen.getByRole('button', { name: 'สร้างบิล' })
    fireEvent.click(createBillBtn)

    // Verify toast specifies "UI Only" and "ยังไม่เชื่อม POS"
    expect(mockToast).toHaveBeenCalledWith(
      'สร้างบิล (UI Only)',
      'ยังไม่เชื่อม POS (ยังไม่มีการสร้างบิลจริง)',
      'INFO'
    )

    // Appointment in storage remains unchanged without fake billId or fake assignee
    const current = loadAppointments()
    expect(current[0].billId).toBeUndefined()
    expect(current[0].assigneeId).toBeUndefined()
    expect(current[0].events).toBeUndefined()
  })
})
