// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import {
  validatePinFormat,
  savePinCredential,
  verifyPinCredential,
  isPinEnabled,
  removeLegacyPlaintextPin,
  getAppLockedState,
  setAppLockedState,
  removePinCredential,
  getPinLockoutState,
  savePinLockoutState,
  clearPinLockoutState,
  isPinSet,
  verifyPinHash,
  isSessionLocked,
  setSessionLocked,
} from '@/lib/pin-lock'
import { AppLockProvider, useAppLock } from '@/lib/contexts/AppLockContext'
import { AppLockButton } from '@/components/auth/AppLockButton'
import { InitialPinSetupScreen } from '@/components/auth/InitialPinSetupScreen'
import { PinLockScreen } from '@/components/auth/PinLockScreen'
import { AuthShell } from '@/components/auth/AuthShell'

// Polyfill Web Crypto for jsdom if needed
beforeAll(() => {
  if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.subtle)) {
    window.crypto = globalThis.crypto as Crypto
  }
})

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()
let currentPathname = '/pos'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: vi.fn(),
  }),
  usePathname: () => currentPathname,
}))

// Mock Auth Context
let mockAuthUser: any = {
  id: 'user-001',
  email: 'owner@example.com',
  username: 'storeowner',
  fullName: 'เจ้าของร้านค้าหลัก',
  role: 'OWNER',
}
let mockSession: any = { access_token: 'valid-token' }
let mockAuthLoading = false
const mockSignOut = vi.fn().mockImplementation(async () => {
  mockAuthUser = null
  mockSession = null
})

vi.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    session: mockSession,
    loading: mockAuthLoading,
    signOut: mockSignOut,
    signIn: vi.fn(),
  }),
}))

describe('iOS-Style 6-Digit PIN App Lock Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
    currentPathname = '/pos'
    mockAuthUser = {
      id: 'user-001',
      email: 'owner@example.com',
      username: 'storeowner',
      fullName: 'เจ้าของร้านค้าหลัก',
      role: 'OWNER',
    }
    mockSession = { access_token: 'valid-token' }
    mockAuthLoading = false
  })

  // ─── 1. PIN ไม่มี → Login สำเร็จ → เข้า App โดยไม่เจอ PIN ─────────────────────
  it('1. PIN ไม่มี: Login สำเร็จและเข้าใช้งานได้โดยไม่เจอ PinLockScreen', async () => {
    expect(isPinSet('user-001')).toBe(false)

    render(
      <AppLockProvider>
        <AuthShell>
          <div data-testid="pos-page">หน้าขายหน้าร้าน (POS)</div>
        </AuthShell>
      </AppLockProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('pos-page')).toBeInTheDocument()
    })

    expect(screen.queryByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/ตั้งค่ารหัส PIN 6 หลัก/i)).not.toBeInTheDocument()
  })

  // ─── 2. PIN เปิดแต่ App ไม่ Locked → เข้า App ได้ ────────────────────────────
  it('2. PIN เปิดแต่ App ไม่ Locked: เข้า App ได้ทันทีโดยไม่เจอ PinLockScreen', async () => {
    await savePinCredential('user-001', '849201')
    setAppLockedState('user-001', false)

    expect(isPinSet('user-001')).toBe(true)
    expect(getAppLockedState('user-001')).toBe(false)

    render(
      <AppLockProvider>
        <AuthShell>
          <div data-testid="pos-page">หน้าขายหน้าร้าน (POS)</div>
        </AuthShell>
      </AppLockProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('pos-page')).toBeInTheDocument()
    })
    expect(screen.queryByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).not.toBeInTheDocument()
  })

  // ─── 3. PIN เปิด + Locked → PinLockScreen ────────────────────────────────────
  it('3. PIN เปิด + Locked: ต้องแสดง PinLockScreen และไม่แสดง protected content', async () => {
    await savePinCredential('user-001', '849201')
    setAppLockedState('user-001', true)

    expect(isPinSet('user-001')).toBe(true)
    expect(getAppLockedState('user-001')).toBe(true)

    render(
      <AppLockProvider>
        <AuthShell>
          <div data-testid="pos-page">หน้าขายหน้าร้าน (POS)</div>
        </AuthShell>
      </AppLockProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).toBeInTheDocument()
    })
    expect(screen.queryByTestId('pos-page')).not.toBeInTheDocument()
  })

  // ─── 4. Refresh ขณะ Locked → ห้าม protected content โผล่ก่อน ─────────────────
  it('4. Refresh ขณะ Locked: ระหว่าง AppLock loading ห้าม protected content ถูก render ก่อน', async () => {
    await savePinCredential('user-001', '849201')
    setAppLockedState('user-001', true)

    let protectedRendered = false
    function GuardedPOS() {
      protectedRendered = true
      return <div data-testid="pos-page">หน้าขายหน้าร้าน (POS)</div>
    }

    render(
      <AppLockProvider>
        <AuthShell>
          <GuardedPOS />
        </AuthShell>
      </AppLockProvider>
    )

    // Protected content must not be rendered
    expect(screen.queryByTestId('pos-page')).not.toBeInTheDocument()
    expect(protectedRendered).toBe(false)

    // Wait until PinLockScreen is rendered
    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).toBeInTheDocument()
    })

    // Still never rendered
    expect(screen.queryByTestId('pos-page')).not.toBeInTheDocument()
    expect(protectedRendered).toBe(false)
  })

  // ─── 5. Logout จากหน้าล็อก → ล้าง session lock แต่ PIN credential ยังอยู่ ─────
  it('5. Logout จากหน้าล็อก: ล้าง session lock แต่ PIN credential ในอุปกรณ์ยังอยู่', async () => {
    await savePinCredential('user-001', '849201')
    setAppLockedState('user-001', true)

    render(
      <AppLockProvider>
        <AuthShell>
          <div data-testid="pos-page">หน้าขายหน้าร้าน (POS)</div>
        </AuthShell>
      </AppLockProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).toBeInTheDocument()
    })

    const logoutBtn = screen.getByRole('button', { name: /ออกจากระบบ/i })
    fireEvent.click(logoutBtn)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })

    // Session lock must be cleared
    expect(getAppLockedState('user-001')).toBe(false)
    // PIN credential must NOT be deleted
    expect(isPinSet('user-001')).toBe(true)
  })

  // ─── 6. Login user เดิมใหม่หลัง Logout → เข้า App ได้ทันที ──────────────────
  it('6. Login user เดิมใหม่หลัง Logout: pinEnabled ยัง true แต่ isLocked เป็น false และเข้า App ได้ทันที', async () => {
    // Stored PIN exists from before
    await savePinCredential('user-001', '849201')
    // Session lock was cleared upon logout
    setAppLockedState('user-001', false)

    expect(isPinSet('user-001')).toBe(true)
    expect(getAppLockedState('user-001')).toBe(false)

    // User logs in again with Username + Password
    mockAuthUser = {
      id: 'user-001',
      email: 'owner@example.com',
      username: 'storeowner',
      fullName: 'เจ้าของร้านค้าหลัก',
      role: 'OWNER',
    }
    mockSession = { access_token: 'valid-relogin-token' }

    render(
      <AppLockProvider>
        <AuthShell>
          <div data-testid="pos-page">หน้าขายหน้าร้าน (POS)</div>
        </AuthShell>
      </AppLockProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('pos-page')).toBeInTheDocument()
    })
    expect(screen.queryByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).not.toBeInTheDocument()
  })

  // ─── 7. User A ใส่ PIN ผิดจน lockout → User B ไม่ได้รับผลกระทบ ───────────────
  it('7. User A ใส่ PIN ผิดจนมี lockout: User B ต้องไม่มี failedAttempts/lockout ของ User A', () => {
    const userA = 'user-alice'
    const userB = 'user-bob'

    savePinLockoutState(userA, {
      failedAttempts: 5,
      lockoutLevel: 0,
      lockUntil: Date.now() + 30000,
    })

    const stateA = getPinLockoutState(userA)
    expect(stateA.failedAttempts).toBe(5)
    expect(stateA.lockUntil).toBeGreaterThan(Date.now())

    const stateB = getPinLockoutState(userB)
    expect(stateB.failedAttempts).toBe(0)
    expect(stateB.lockoutLevel).toBe(0)
    expect(stateB.lockUntil).toBe(0)
  })

  // ─── 8. clear lockout User A → ห้ามล้าง User B ──────────────────────────────
  it('8. clear lockout User A ต้องไม่ล้าง lockout ของ User B', () => {
    const userA = 'user-alice'
    const userB = 'user-bob'

    savePinLockoutState(userA, {
      failedAttempts: 3,
      lockoutLevel: 0,
      lockUntil: 0,
    })
    savePinLockoutState(userB, {
      failedAttempts: 5,
      lockoutLevel: 1,
      lockUntil: Date.now() + 60000,
    })

    clearPinLockoutState(userA)

    expect(getPinLockoutState(userA).failedAttempts).toBe(0)
    const stateB = getPinLockoutState(userB)
    expect(stateB.failedAttempts).toBe(5)
    expect(stateB.lockoutLevel).toBe(1)
    expect(stateB.lockUntil).toBeGreaterThan(Date.now())
  })

  // ─── 9. validatePinFormat: 6-digit numeric checks ───────────────────────────
  it('9. validatePinFormat: 123456, 111111, 000000, 654321 = PASS / 12345, 12345A = FAIL', () => {
    expect(validatePinFormat('123456')).toEqual({ isValid: true, error: null })
    expect(validatePinFormat('111111')).toEqual({ isValid: true, error: null })
    expect(validatePinFormat('000000')).toEqual({ isValid: true, error: null })
    expect(validatePinFormat('654321')).toEqual({ isValid: true, error: null })

    expect(validatePinFormat('12345').isValid).toBe(false)
    expect(validatePinFormat('12345A').isValid).toBe(false)
    expect(validatePinFormat('12345a').isValid).toBe(false)
    expect(validatePinFormat('').isValid).toBe(false)
  })

  // ─── 10. Plaintext PIN ไม่ปรากฏใน storage ────────────────────────────────────
  it('10. ไม่มี PIN plaintext ใน localStorage หรือ sessionStorage เด็ดขาด', async () => {
    await savePinCredential('user-001', '849201')

    const rawStored = localStorage.getItem('rental_pos_app_lock_user-001')
    expect(rawStored).toBeTruthy()

    expect(rawStored).not.toContain('849201')

    const parsed = JSON.parse(rawStored!)
    expect(parsed.enabled).toBe(true)
    expect(parsed.salt).toBeDefined()
    expect(parsed.salt.length).toBe(32)
    expect(parsed.hash).toBeDefined()
    expect(parsed.hash.length).toBe(64)
    expect(parsed.pin).toBeUndefined()

    localStorage.setItem('rental_pos_pin_user-001', '849201')
    removeLegacyPlaintextPin('user-001')
    expect(localStorage.getItem('rental_pos_pin_user-001')).toBeNull()

    expect(sessionStorage.getItem('rental_pos_pin_user-001')).toBeNull()
    expect(sessionStorage.getItem('rental_pos_app_lock_user-001')).toBeNull()
  })

  // ─── 11. PIN ถูก → unlock → Session เดิม → URL เดิม ─────────────────────────
  it('11. กรอก PIN ถูกต้อง ระบบปลดล็อกและกลับเข้าหน้าเดิมได้โดย Session และ URL เดิมยังอยู่', async () => {
    await savePinCredential('user-001', '849201')
    setSessionLocked('user-001', true)

    render(
      <AppLockProvider>
        <AuthShell>
          <div data-testid="pos-page">หน้าขายหน้าร้าน (POS)</div>
        </AuthShell>
      </AppLockProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).toBeInTheDocument()
    })

    const keypadDigits = ['8', '4', '9', '2', '0', '1']
    for (const d of keypadDigits) {
      const btn = screen.getByRole('button', { name: `ตัวเลข ${d}` })
      fireEvent.click(btn)
    }

    await waitFor(() => {
      expect(screen.getByTestId('pos-page')).toBeInTheDocument()
    })
    expect(screen.queryByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).not.toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalledWith('/login')
    expect(mockReplace).not.toHaveBeenCalledWith('/login')
    expect(mockAuthUser).not.toBeNull()
  })

  // ─── 12. PIN ผิด → ยัง Locked → ไม่ Logout ──────────────────────────────────
  it('12. กรอก PIN ผิด ระบบแจ้งเตือนและยังคงล็อกอยู่ ไม่เตะออกจากระบบ', async () => {
    await savePinCredential('user-001', '849201')
    setSessionLocked('user-001', true)

    render(
      <AppLockProvider>
        <AuthShell>
          <div data-testid="pos-page">หน้าขายหน้าร้าน (POS)</div>
        </AuthShell>
      </AppLockProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).toBeInTheDocument()
    })

    const wrongDigits = ['9', '9', '8', '8', '7', '7']
    for (const d of wrongDigits) {
      const btn = screen.getByRole('button', { name: `ตัวเลข ${d}` })
      fireEvent.click(btn)
    }

    await waitFor(() => {
      expect(screen.getByText(/PIN ไม่ถูกต้อง/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).toBeInTheDocument()
    expect(screen.queryByTestId('pos-page')).not.toBeInTheDocument()

    expect(mockSignOut).not.toHaveBeenCalled()
    expect(mockAuthUser).not.toBeNull()
  })

  // ─── Supporting Tests (Retained Requirements) ────────────────────────────────
  it('13. สมัครสมาชิกด้วย Email และ Login ด้วย Username + Password โดย PIN ไม่ใช่รหัส Login', () => {
    expect(mockAuthUser.email).toBe('owner@example.com')
    expect(mockAuthUser.username).toBe('storeowner')
    expect(mockAuthUser.pin).toBeUndefined()
    expect(mockSession.pin).toBeUndefined()
  })

  it('14. กรอกยืนยัน PIN ไม่ตรงกัน บันทึกไม่ผ่าน', async () => {
    const handleSuccess = vi.fn()
    const handleCancel = vi.fn()

    render(
      <AppLockProvider>
        <InitialPinSetupScreen onSuccess={handleSuccess} onCancel={handleCancel} />
      </AppLockProvider>
    )

    for (const d of ['8', '4', '9', '2', '0', '1']) {
      const btn = screen.getByRole('button', { name: new RegExp(`^${d}$`) })
      fireEvent.click(btn)
    }

    await waitFor(() => {
      expect(screen.getByText(/ยืนยันรหัส PIN 6 หลัก/i)).toBeInTheDocument()
    })

    for (const d of ['8', '4', '9', '2', '0', '2']) {
      const btn = screen.getByRole('button', { name: new RegExp(`^${d}$`) })
      fireEvent.click(btn)
    }

    await waitFor(() => {
      expect(screen.getByText('รหัส PIN ยืนยันไม่ตรงกับ PIN ที่ตั้งไว้')).toBeInTheDocument()
    })
    expect(handleSuccess).not.toHaveBeenCalled()
    expect(isPinSet('user-001')).toBe(false)
  })

  it('15. ตั้ง PIN สำเร็จ ค่า pinEnabled เป็น true', async () => {
    let appLockRef: ReturnType<typeof useAppLock> | null = null

    function TestConsumer() {
      appLockRef = useAppLock()
      return (
        <div>
          <span data-testid="pin-status">{appLockRef.pinEnabled ? 'ENABLED' : 'DISABLED'}</span>
        </div>
      )
    }

    render(
      <AppLockProvider>
        <TestConsumer />
      </AppLockProvider>
    )

    expect(screen.getByTestId('pin-status')).toHaveTextContent('DISABLED')

    let success = false
    await waitFor(async () => {
      if (appLockRef) {
        success = await appLockRef.setupPin('849201')
      }
    })

    expect(success).toBe(true)
    await waitFor(() => {
      expect(screen.getByTestId('pin-status')).toHaveTextContent('ENABLED')
    })
    expect(isPinSet('user-001')).toBe(true)
  })

  it('16. ก่อนเปิด PIN จะไม่มีปุ่มล็อกระบบ / เมื่อเปิด PIN แล้ว จะปรากฏปุ่มล็อกระบบ', async () => {
    const { unmount } = render(
      <AppLockProvider>
        <AppLockButton variant="header" />
      </AppLockProvider>
    )
    expect(screen.queryByText(/ล็อกระบบ/i)).not.toBeInTheDocument()
    unmount()

    await savePinCredential('user-001', '849201')

    render(
      <AppLockProvider>
        <AppLockButton variant="header" />
      </AppLockProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/ล็อกระบบ/i)).toBeInTheDocument()
    })
  })

  it('17. ผู้ใช้กดปุ่มล็อกระบบ จะขึ้น PinLockScreen โดย URL และ Session เดิมยังอยู่', async () => {
    await savePinCredential('user-001', '849201')
    currentPathname = '/pos'

    render(
      <AppLockProvider>
        <AuthShell>
          <div data-testid="pos-page">
            <span>หน้าขายหน้าร้าน (POS)</span>
            <AppLockButton variant="header" />
          </div>
        </AuthShell>
      </AppLockProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('pos-page')).toBeInTheDocument()
    })

    const lockBtn = screen.getByRole('button', { name: /ล็อกระบบ/i })
    fireEvent.click(lockBtn)

    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalledWith('/login')
    expect(mockReplace).not.toHaveBeenCalledWith('/login')
    expect(currentPathname).toBe('/pos')
    expect(mockSignOut).not.toHaveBeenCalled()
    expect(mockAuthUser).not.toBeNull()
  })

  it('18. กดออกจากระบบจากหน้าล็อก ต้องกลับไปหน้า Login', async () => {
    await savePinCredential('user-001', '849201')
    setSessionLocked('user-001', true)

    const { rerender } = render(
      <AppLockProvider>
        <AuthShell>
          <div data-testid="pos-page">หน้าขายหน้าร้าน (POS)</div>
        </AuthShell>
      </AppLockProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).toBeInTheDocument()
    })

    const logoutBtn = screen.getByRole('button', { name: /ออกจากระบบ/i })
    fireEvent.click(logoutBtn)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })

    rerender(
      <AppLockProvider>
        <AuthShell>
          <div data-testid="pos-page">หน้าขายหน้าร้าน (POS)</div>
        </AuthShell>
      </AppLockProvider>
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
  })

  it('19. ทดสอบการแยกผู้ใช้: User A ตั้ง PIN แล้ว User B บนเครื่องเดียวกันต้องไม่ได้รับผลกระทบ', async () => {
    const userA = 'user-alice'
    const userB = 'user-bob'

    await savePinCredential(userA, '849201')
    setSessionLocked(userA, true)

    expect(isPinSet(userA)).toBe(true)
    expect(isSessionLocked(userA)).toBe(true)

    expect(isPinSet(userB)).toBe(false)
    expect(isSessionLocked(userB)).toBe(false)

    const verifyResultB = await verifyPinHash(userB, '849201')
    expect(verifyResultB).toBe(false)

    removePinCredential(userA)
    expect(isPinSet(userA)).toBe(false)
    expect(isPinSet(userB)).toBe(false)
  })
})
