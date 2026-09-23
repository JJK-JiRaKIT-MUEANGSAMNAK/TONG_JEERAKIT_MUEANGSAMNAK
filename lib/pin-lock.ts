/**
 * Device-local App Lock PIN Utilities
 * Uses standard Web Crypto API (PBKDF2 + SHA-256)
 * Never stores plaintext PIN in browser storage.
 */

const STORAGE_PREFIX = 'rental_pos_app_lock_'
const SESSION_LOCK_PREFIX = 'rental_pos_app_locked_'
const LEGACY_PLAINTEXT_PREFIX = 'rental_pos_pin_'

export interface StoredPinCredential {
  enabled: boolean
  salt: string
  hash: string
  updatedAt: string
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

export function validatePinFormat(pin: string): { isValid: boolean; error: string | null } {
  if (!pin) {
    return { isValid: false, error: 'กรุณากรอกรหัส PIN 6 หลัก' }
  }
  if (!/^\d{6}$/.test(pin)) {
    return { isValid: false, error: 'PIN ต้องเป็นตัวเลข 6 หลักเท่านั้น' }
  }
  // Check repeating digits like '000000', '111111'
  if (/^(\d)\1{5}$/.test(pin)) {
    return { isValid: false, error: 'PIN ไม่ปลอดภัย (ห้ามใช้ตัวเลขซ้ำกันทั้งหมด)' }
  }
  // Check sequential digits like '012345', '123456', '654321', etc.
  const sequential = ['012345', '123456', '234567', '345678', '456789', '987654', '876543', '765432', '654321', '543210']
  if (sequential.includes(pin)) {
    return { isValid: false, error: 'PIN ไม่ปลอดภัย (ห้ามใช้ตัวเลขเรียงติดกัน)' }
  }
  return { isValid: true, error: null }
}

export async function hashPinWithSalt(pin: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const saltBytes = hexToBytes(saltHex)
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: 10000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  return bufferToHex(derivedBits)
}

export function removeLegacyPlaintextPin(userId: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(`${LEGACY_PLAINTEXT_PREFIX}${userId}`)
  } catch {}
}

export function isPinEnabled(userId: string): boolean {
  if (typeof window === 'undefined' || !userId) return false
  try {
    removeLegacyPlaintextPin(userId)
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    if (!raw) return false
    const parsed: StoredPinCredential = JSON.parse(raw)
    return Boolean(parsed?.enabled && parsed?.salt && parsed?.hash)
  } catch {
    return false
  }
}

export async function savePinCredential(userId: string, pin: string): Promise<boolean> {
  if (typeof window === 'undefined' || !userId) return false
  const val = validatePinFormat(pin)
  if (!val.isValid) {
    throw new Error(val.error || 'PIN รูปแบบไม่ถูกต้อง')
  }

  // Generate 16 random bytes for salt
  const saltArray = new Uint8Array(16)
  crypto.getRandomValues(saltArray)
  const saltHex = bufferToHex(saltArray)

  const hash = await hashPinWithSalt(pin, saltHex)

  const credential: StoredPinCredential = {
    enabled: true,
    salt: saltHex,
    hash,
    updatedAt: new Date().toISOString(),
  }

  // Remove legacy plaintext pin if any
  removeLegacyPlaintextPin(userId)

  localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(credential))
  return true
}

export async function verifyPinCredential(userId: string, enteredPin: string): Promise<boolean> {
  if (typeof window === 'undefined' || !userId) return false
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    if (!raw) return false
    const parsed: StoredPinCredential = JSON.parse(raw)
    if (!parsed?.enabled || !parsed?.salt || !parsed?.hash) return false

    const computedHash = await hashPinWithSalt(enteredPin, parsed.salt)
    return computedHash === parsed.hash
  } catch {
    return false
  }
}

export function getAppLockedState(userId: string): boolean {
  if (typeof window === 'undefined' || !userId) return false
  try {
    return sessionStorage.getItem(`${SESSION_LOCK_PREFIX}${userId}`) === 'true'
  } catch {
    return false
  }
}

export function setAppLockedState(userId: string, locked: boolean): void {
  if (typeof window === 'undefined' || !userId) return
  try {
    if (locked) {
      sessionStorage.setItem(`${SESSION_LOCK_PREFIX}${userId}`, 'true')
    } else {
      sessionStorage.removeItem(`${SESSION_LOCK_PREFIX}${userId}`)
    }
  } catch {}
}

export function removePinCredential(userId: string): void {
  if (typeof window === 'undefined' || !userId) return
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${userId}`)
    sessionStorage.removeItem(`${SESSION_LOCK_PREFIX}${userId}`)
    removeLegacyPlaintextPin(userId)
  } catch {}
}

// Convenience aliases
export const isPinSet = isPinEnabled
export const verifyPinHash = verifyPinCredential
export const isSessionLocked = getAppLockedState
export const setSessionLocked = setAppLockedState

