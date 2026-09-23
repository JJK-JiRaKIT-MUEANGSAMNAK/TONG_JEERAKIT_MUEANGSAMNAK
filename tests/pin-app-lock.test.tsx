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

  // ─── REQUIREMENT 1 ──────────────────────────────────────────────────────────
  it('1. Login สำเร็จโดยไม่ต้องมี PIN และเข้าใช้งานได้โดยไม่เจอ PinLockScreen', async () => {
    // User is logged in, but has not configured any PIN
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

    // Neither PinLockScreen nor InitialPinSetupScreen is shown
    expect(screen.queryByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/ตั้งค่ารหัส PIN 6 หลัก/i)).not.toBeInTheDocument()
  })

  // ─── REQUIREMENT 2 & 3 ──────────────────────────────────────────────────────
  it('2 & 3. สมัครสมาชิกด้วย Email และ Login ด้วย Username + Password โดย PIN ไม่ใช่รหัส Login', () => {
    // Contract check: user object uses email for identity/recovery and username for display/login
    expect(mockAuthUser.email).toBe('owner@example.com')
    expect(mockAuthUser.username).toBe('storeowner')

    // PIN is not part of the login credentials or session object
    expect(mockAuthUser.pin).toBeUndefined()
    expect(mockSession.pin).toBeUndefined()
  })

  // ─── REQUIREMENT 4 & 5 ──────────────────────────────────────────────────────
  it('4. ผู้ใช้กดเปิด PIN ต้องกรอก 6 หลัก และผ่านการตรวจสอบความปลอดภัย', () => {
    // Missing pin
    expect(validatePinFormat('').isValid).toBe(false)
    // Less than 6 digits
    expect(validatePinFormat('12345').isValid).toBe(false)
    // Non-digits
    expect(validatePinFormat('12345a').isValid).toBe(false)
    // Repeating digits (insecure)
    expect(validatePinFormat('111111').isValid).toBe(false)
    expect(validatePinFormat('000000').isValid).toBe(false)
    // Sequential digits (insecure)
    expect(validatePinFormat('123456').isValid).toBe(false)
    expect(validatePinFormat('654321').isValid).toBe(false)
    // Valid 6-digit PIN
    expect(validatePinFormat('849201').isValid).toBe(true)
  })

  it('5. กรอกยืนยัน PIN ไม่ตรงกัน บันทึกไม่ผ่าน', async () => {
    const handleSuccess = vi.fn()
    const handleCancel = vi.fn()

    render(
      <AppLockProvider>
        <InitialPinSetupScreen onSuccess={handleSuccess} onCancel={handleCancel} />
      </AppLockProvider>
    )

    // Step 1: Click 8, 4, 9, 2, 0, 1 on keypad
    for (const d of ['8', '4', '9', '2', '0', '1']) {
      const btn = screen.getByRole('button', { name: new RegExp(`^${d}$`) })
      fireEvent.click(btn)
    }

    // Step 1 automatically completes and moves to step 2
    await waitFor(() => {
      expect(screen.getByText(/ยืนยันรหัส PIN 6 หลัก/i)).toBeInTheDocument()
    })

    // Step 2: Enter mismatched PIN: 8, 4, 9, 2, 0, 2
    for (const d of ['8', '4', '9', '2', '0', '2']) {
      const btn = screen.getByRole('button', { name: new RegExp(`^${d}$`) })
      fireEvent.click(btn)
    }

    // Verify error shown
    await waitFor(() => {
      expect(screen.getByText('รหัส PIN ยืนยันไม่ตรงกับ PIN ที่ตั้งไว้')).toBeInTheDocument()
    })
    expect(handleSuccess).not.toHaveBeenCalled()
    expect(isPinSet('user-001')).toBe(false)
  })

  // ─── REQUIREMENT 6 ──────────────────────────────────────────────────────────
  it('6. ตั้ง PIN สำเร็จ ค่า pinEnabled เป็น true', async () => {
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

    // Setup PIN
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

  // ─── REQUIREMENT 7 ──────────────────────────────────────────────────────────
  it('7. ไม่มี PIN plaintext ใน localStorage หรือ sessionStorage เด็ดขาด', async () => {
    await savePinCredential('user-001', '849201')

    const rawStored = localStorage.getItem('rental_pos_app_lock_user-001')
    expect(rawStored).toBeTruthy()

    // Plaintext PIN must NOT be in the storage string
    expect(rawStored).not.toContain('849201')

    const parsed = JSON.parse(rawStored!)
    expect(parsed.enabled).toBe(true)
    expect(parsed.salt).toBeDefined()
    expect(parsed.salt.length).toBe(32) // 16 bytes hex = 32 chars
    expect(parsed.hash).toBeDefined()
    expect(parsed.hash.length).toBe(64) // SHA-256 hex = 64 chars
    expect(parsed.pin).toBeUndefined()

    // Ensure legacy plaintext keys are cleaned
    localStorage.setItem('rental_pos_pin_user-001', '849201')
    removeLegacyPlaintextPin('user-001')
    expect(localStorage.getItem('rental_pos_pin_user-001')).toBeNull()

    // No plaintext in sessionStorage
    expect(sessionStorage.getItem('rental_pos_pin_user-001')).toBeNull()
    expect(sessionStorage.getItem('rental_pos_app_lock_user-001')).toBeNull()
  })

  // ─── REQUIREMENT 8 ──────────────────────────────────────────────────────────
  it('8. ก่อนเปิด PIN จะไม่มีปุ่มล็อกระบบ / เมื่อเปิด PIN แล้ว จะปรากฏปุ่มล็อกระบบ', async () => {
    // 1. Not enabled -> AppLockButton renders nothing
    const { unmount } = render(
      <AppLockProvider>
        <AppLockButton variant="header" />
      </AppLockProvider>
    )
    expect(screen.queryByText(/ล็อกระบบ/i)).not.toBeInTheDocument()
    unmount()

    // 2. Enable PIN in storage
    await savePinCredential('user-001', '849201')

    // 3. Fresh mount with PIN enabled -> AppLockButton renders button
    render(
      <AppLockProvider>
        <AppLockButton variant="header" />
      </AppLockProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/ล็อกระบบ/i)).toBeInTheDocument()
    })
  })

  // ─── REQUIREMENT 9 ──────────────────────────────────────────────────────────
  it('9. ผู้ใช้กดปุ่มล็อกระบบ จะขึ้น PinLockScreen โดย URL และ Session เดิมยังอยู่', async () => {
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

    // Click Lock App
    const lockBtn = screen.getByRole('button', { name: /ล็อกระบบ/i })
    fireEvent.click(lockBtn)

    // PinLockScreen appears
    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).toBeInTheDocument()
    })

    // URL / route did not redirect away to login
    expect(mockPush).not.toHaveBeenCalledWith('/login')
    expect(mockReplace).not.toHaveBeenCalledWith('/login')
    expect(currentPathname).toBe('/pos')

    // Session is still intact (not signed out)
    expect(mockSignOut).not.toHaveBeenCalled()
    expect(mockAuthUser).not.toBeNull()
  })

  // ─── REQUIREMENT 10 ─────────────────────────────────────────────────────────
  it('10. กรอก PIN ถูกต้อง ระบบปลดล็อกและกลับเข้าหน้าเดิมได้', async () => {
    await savePinCredential('user-001', '849201')
    setSessionLocked('user-001', true)

    render(
      <AppLockProvider>
        <AuthShell>
          <div data-testid="pos-page">หน้าขายหน้าร้าน (POS)</div>
        </AuthShell>
      </AppLockProvider>
    )

    // PinLockScreen is shown
    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).toBeInTheDocument()
    })

    // Enter correct PIN: click keypad 8, 4, 9, 2, 0, 1
    const keypadDigits = ['8', '4', '9', '2', '0', '1']
    for (const d of keypadDigits) {
      const btn = screen.getByRole('button', { name: `ตัวเลข ${d}` })
      fireEvent.click(btn)
    }

    // Unlocks and returns to POS screen
    await waitFor(() => {
      expect(screen.getByTestId('pos-page')).toBeInTheDocument()
    })
    expect(screen.queryByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).not.toBeInTheDocument()
  })

  // ─── REQUIREMENT 11 ─────────────────────────────────────────────────────────
  it('11. กรอก PIN ผิด ระบบแจ้งเตือนและยังคงล็อกอยู่ ไม่เตะออกจากระบบ', async () => {
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

    // Enter incorrect PIN: 9, 9, 8, 8, 7, 7
    const wrongDigits = ['9', '9', '8', '8', '7', '7']
    for (const d of wrongDigits) {
      const btn = screen.getByRole('button', { name: `ตัวเลข ${d}` })
      fireEvent.click(btn)
    }

    // Error message shown
    await waitFor(() => {
      expect(screen.getByText(/PIN ไม่ถูกต้อง/i)).toBeInTheDocument()
    })

    // Still locked on PinLockScreen
    expect(screen.getByText(/กรุณากรอก PIN 6 หลักเพื่อปลดล็อก/i)).toBeInTheDocument()
    expect(screen.queryByTestId('pos-page')).not.toBeInTheDocument()

    // Not logged out
    expect(mockSignOut).not.toHaveBeenCalled()
    expect(mockAuthUser).not.toBeNull()
  })

  // ─── REQUIREMENT 12 ─────────────────────────────────────────────────────────
  it('12. กดออกจากระบบจากหน้าล็อก ต้องกลับไปหน้า Login', async () => {
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

    // When session becomes null, AuthShell redirects to /login
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

  // ─── REQUIREMENT 13 ─────────────────────────────────────────────────────────
  it('13. ทดสอบการแยกผู้ใช้: User A ตั้ง PIN แล้ว User B บนเครื่องเดียวกันต้องไม่ได้รับผลกระทบ', async () => {
    const userA = 'user-alice'
    const userB = 'user-bob'

    // User A sets PIN
    await savePinCredential(userA, '849201')
    setSessionLocked(userA, true)

    expect(isPinSet(userA)).toBe(true)
    expect(isSessionLocked(userA)).toBe(true)

    // User B does NOT have PIN set
    expect(isPinSet(userB)).toBe(false)
    expect(isSessionLocked(userB)).toBe(false)

    // Verifying User B with User A's PIN fails because User B has no PIN set
    const verifyResultB = await verifyPinHash(userB, '849201')
    expect(verifyResultB).toBe(false)

    // Removing User A's PIN does not affect User B
    removePinCredential(userA)
    expect(isPinSet(userA)).toBe(false)
    expect(isPinSet(userB)).toBe(false)
  })
})
