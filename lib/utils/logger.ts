/**
 * Centralized Production-Safe Logger
 * Automatically redacts sensitive credentials, PINs, tokens, and PII from application logs.
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'pin',
  'newpin',
  'oldpin',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'secret',
  'apikey',
  'api_key',
  'service_role_key',
  'id_card',
  'id_card_number',
  'credit_card',
])

export function sanitizeLogData(data: unknown, depth = 0): unknown {
  if (depth > 5) return '[DepthLimit]'
  if (data === null || data === undefined) return data
  if (typeof data !== 'object') {
    if (typeof data === 'string' && data.length > 500) {
      if (data.startsWith('data:') || data.startsWith('ey')) {
        return `${data.substring(0, 20)}...[TRUNCATED ${data.length} chars]`
      }
    }
    return data
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item, depth + 1))
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '')
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value, depth + 1)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    const sanitizedArgs = args.map((a) => sanitizeLogData(a))
    console.log(`[INFO] ${message}`, ...sanitizedArgs)
  },
  warn: (message: string, ...args: unknown[]) => {
    const sanitizedArgs = args.map((a) => sanitizeLogData(a))
    console.warn(`[WARN] ${message}`, ...sanitizedArgs)
  },
  error: (message: string, ...args: unknown[]) => {
    const sanitizedArgs = args.map((a) => sanitizeLogData(a))
    console.error(`[ERROR] ${message}`, ...sanitizedArgs)
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      const sanitizedArgs = args.map((a) => sanitizeLogData(a))
      console.debug(`[DEBUG] ${message}`, ...sanitizedArgs)
    }
  },
}
