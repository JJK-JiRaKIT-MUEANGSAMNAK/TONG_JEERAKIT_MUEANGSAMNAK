import { THAI_ADDRESS_DATA, ALL_THAI_PROVINCES } from '@/lib/thai-address-data'

export interface ParsedThaiIdCard {
  name: string
  idCardNumber: string
  idCardExpiry: string
  houseNo: string
  moo?: string
  soi?: string
  road?: string
  subDistrict: string
  district: string
  province: string
  postalCode: string
  rawText?: string
}

/**
 * Validates 13-digit Thai National Identification Number using Mod 11 Checksum.
 */
export function validateThaiNationalId(id: string): boolean {
  const digits = id.replace(/\D/g, '')
  if (digits.length !== 13) return false
  if (/^(\d)\1{12}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i], 10) * (13 - i)
  }
  const checkDigit = (11 - (sum % 11)) % 10
  return checkDigit === parseInt(digits[12], 10)
}

/**
 * Format 13-digit Thai National ID to standard format 1-2345-67890-12-3
 */
export function formatThaiNationalId(id: string): string {
  const digits = id.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 1) return digits
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`
  if (digits.length <= 10) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12, 13)}`
}

/**
 * Clean OCR noise characters
 */
function cleanOcrText(text: string): string {
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/[|—_~`•*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract 13-digit ID Card Number from OCR text
 */
export function extractIdCardNumber(text: string): string {
  // Try finding standard separated pattern: x xxxx xxxxx xx x or x-xxxx-xxxxx-xx-x
  const matchFormatted = text.match(/([0-9])\s*[-– ]?\s*([0-9]{4})\s*[-– ]?\s*([0-9]{5})\s*[-– ]?\s*([0-9]{2})\s*[-– ]?\s*([0-9])/)
  if (matchFormatted) {
    const raw = `${matchFormatted[1]}${matchFormatted[2]}${matchFormatted[3]}${matchFormatted[4]}${matchFormatted[5]}`
    return formatThaiNationalId(raw)
  }

  // Fallback: search for any sequence of 13 digits
  const allDigits = text.replace(/[^0-9]/g, '')
  if (allDigits.length >= 13) {
    // Look for valid checksum among 13-digit windows
    for (let i = 0; i <= allDigits.length - 13; i++) {
      const window = allDigits.slice(i, i + 13)
      if (validateThaiNationalId(window)) {
        return formatThaiNationalId(window)
      }
    }
    return ''
  }

  return ''
}

/**
 * Extract Thai Full Name from OCR text
 */
export function extractThaiName(text: string): string {
  // Match prefix: นาย / นาง / นางสาว / เด็กชาย / เด็กหญิง / นายแพทย์ / ฯลฯ
  const prefixRegex = /(?:นาย|นางสาว|นาง|น\.ส\.|ด\.ช\.|ด\.ญ\.)\s*([ก-๙]+)\s+([ก-๙]+)/
  const match = text.match(prefixRegex)
  if (match) {
    return `${match[0]}`.trim()
  }

  // Fallback: look for lines after "ชื่อตัวและชื่อสกุล" or "Name"
  const nameLabelMatch = text.match(/(?:ชื่อตัวและชื่อสกุล|ชื่อ|Name)\s*([ก-๙]+(?:\s+[ก-๙]+)+)/i)
  if (nameLabelMatch && nameLabelMatch[1]) {
    return nameLabelMatch[1].trim()
  }

  return ''
}

/**
 * Match province, district, subdistrict against Thailand Master Database
 */
export function matchThaiAddress(text: string): {
  province: string
  district: string
  subDistrict: string
  postalCode: string
  houseNo: string
  moo?: string
  soi?: string
  road?: string
} {
  let matchedProvince = ''
  let matchedDistrict = ''
  let matchedSubDistrict = ''
  let matchedPostalCode = ''

  // 1. Match Province
  for (const prov of ALL_THAI_PROVINCES) {
    if (text.includes(prov) || text.includes(`จ.${prov}`) || text.includes(`จังหวัด${prov}`)) {
      matchedProvince = prov
      break
    }
  }

  // 2. Match District from the selected province
  const provObj = THAI_ADDRESS_DATA.find((p) => p.name === matchedProvince)
  if (provObj && provObj.districts.length > 0) {
    for (const dist of provObj.districts) {
      if (
        text.includes(`อ.${dist.name}`) ||
        text.includes(`อำเภอ${dist.name}`) ||
        text.includes(`เขต${dist.name}`) ||
        text.includes(dist.name)
      ) {
        matchedDistrict = dist.name

        // 3. Match Subdistrict from the selected district
        // Pass A: Exact match with prefix (ต. / ตำบล / แขวง)
        let foundSub = false
        for (const sub of dist.subDistricts) {
          if (
            text.includes(`ต.${sub.name}`) ||
            text.includes(`ตำบล${sub.name}`) ||
            text.includes(`แขวง${sub.name}`)
          ) {
            matchedSubDistrict = sub.name
            matchedPostalCode = sub.postalCode
            foundSub = true
            break
          }
        }

        // Pass B: Match bare subdistrict name if not identical to district name
        if (!foundSub) {
          for (const sub of dist.subDistricts) {
            if (sub.name !== dist.name && text.includes(sub.name)) {
              matchedSubDistrict = sub.name
              matchedPostalCode = sub.postalCode
              break
            }
          }
        }
        break
      }
    }
  }

  // 4. Extract House No
  let houseNo = ''
  const houseMatch = text.match(/(?:ที่อยู่|บ้านเลขที่|เลขที่)\s*([0-9]+\/[0-9]+|[0-9]+)/)
  if (houseMatch) {
    houseNo = houseMatch[1]
  } else {
    const slashMatch = text.match(/\b([0-9]+\/[0-9]+)\b/)
    if (slashMatch) {
      houseNo = slashMatch[1]
    }
  }

  // 5. Extract Moo
  let moo = ''
  const mooMatch = text.match(/หมู่(?:ที่)?\s*([0-9]+)/)
  if (mooMatch) {
    moo = mooMatch[1]
  }

  // 6. Extract Soi
  let soi = ''
  const soiMatch = text.match(/ซอย\s*([ก-๙0-9/ ]+?)(?=\s+(?:ถนน|ต\.|ตำบล|แขวง|อ\.|อำเภอ|เขต|จ\.|จังหวัด|$))/)
  if (soiMatch) {
    soi = soiMatch[1].trim()
  }

  // 7. Extract Road
  let road = ''
  const roadMatch = text.match(/ถนน\s*([ก-๙0-9 ]+?)(?=\s+(?:ต\.|ตำบล|แขวง|อ\.|อำเภอ|เขต|จ\.|จังหวัด|$))/)
  if (roadMatch) {
    road = roadMatch[1].trim()
  }

  return {
    province: matchedProvince,
    district: matchedDistrict,
    subDistrict: matchedSubDistrict,
    postalCode: matchedPostalCode,
    houseNo,
    moo: moo || undefined,
    soi: soi || undefined,
    road: road || undefined,
  }
}

const THAI_MONTHS: Record<string, number> = {
  'ม.ค.': 1, 'มกราคม': 1, 'ก.พ.': 2, 'กุมภาพันธ์': 2,
  'มี.ค.': 3, 'มีนาคม': 3, 'เม.ย.': 4, 'เมษายน': 4,
  'พ.ค.': 5, 'พฤษภาคม': 5, 'มิ.ย.': 6, 'มิถุนายน': 6,
  'ก.ค.': 7, 'กรกฎาคม': 7, 'ส.ค.': 8, 'สิงหาคม': 8,
  'ก.ย.': 9, 'กันยายน': 9, 'ต.ค.': 10, 'ตุลาคม': 10,
  'พ.ย.': 11, 'พฤศจิกายน': 11, 'ธ.ค.': 12, 'ธันวาคม': 12,
}

export function normalizeThaiIdExpiryDate(value: string): string {
  const text = value.trim()
  if (!text) return ''

  const isoMatch = text.match(/\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/)
  if (isoMatch) return isoMatch[0]

  const thaiMatch = text.match(/(?:วันหมดอายุ\s*)?(\d{1,2})\s*(ม\.ค\.|มกราคม|ก\.พ\.|กุมภาพันธ์|มี\.ค\.|มีนาคม|เม\.ย\.|เมษายน|พ\.ค\.|พฤษภาคม|มิ\.ย\.|มิถุนายน|ก\.ค\.|กรกฎาคม|ส\.ค\.|สิงหาคม|ก\.ย\.|กันยายน|ต\.ค\.|ตุลาคม|พ\.ย\.|พฤศจิกายน|ธ\.ค\.|ธันวาคม)\s*(25\d{2}|20\d{2})/)
  if (!thaiMatch) return ''

  const day = Number(thaiMatch[1])
  const month = THAI_MONTHS[thaiMatch[2]]
  const rawYear = Number(thaiMatch[3])
  const year = rawYear > 2400 ? rawYear - 543 : rawYear
  if (!month || day < 1 || day > 31 || year < 2000 || year > 2200) return ''
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

/**
 * Main parser that parses full OCR text into structured Thai ID Card data
 */
export function parseThaiIdCardText(rawText: string): ParsedThaiIdCard {
  const cleaned = cleanOcrText(rawText)
  const idCardNumber = extractIdCardNumber(cleaned)
  const name = extractThaiName(cleaned)
  const address = matchThaiAddress(cleaned)

  const expiryLabelMatch = cleaned.match(/วันหมดอายุ\s*\d{1,2}\s*(?:ม\.ค\.|มกราคม|ก\.พ\.|กุมภาพันธ์|มี\.ค\.|มีนาคม|เม\.ย\.|เมษายน|พ\.ค\.|พฤษภาคม|มิ\.ย\.|มิถุนายน|ก\.ค\.|กรกฎาคม|ส\.ค\.|สิงหาคม|ก\.ย\.|กันยายน|ต\.ค\.|ตุลาคม|พ\.ย\.|พฤศจิกายน|ธ\.ค\.|ธันวาคม)\s*(?:25\d{2}|20\d{2})/)
  const expiryDate = normalizeThaiIdExpiryDate(expiryLabelMatch?.[0] || '')

  return {
    name: name || '',
    idCardNumber: idCardNumber,
    idCardExpiry: expiryDate,
    houseNo: address.houseNo,
    moo: address.moo,
    soi: address.soi,
    road: address.road,
    subDistrict: address.subDistrict,
    district: address.district,
    province: address.province,
    postalCode: address.postalCode,
  }
}

/**
 * Detects if the current execution environment is production or Cloudflare Workers.
 */
export function isProductionOrCloudflare(env: Record<string, string | undefined> = process.env): boolean {
  if (env.NODE_ENV === 'production') return true
  if (Boolean(env.CF_PAGES || env.CLOUDFLARE_WORKERS)) return true
  if (typeof navigator !== 'undefined' && (navigator as any).userAgent === 'Cloudflare-Workers') return true
  return false
}

/**
 * Resolves external OCR service URL.
 * Never defaults to 127.0.0.1 in production or Cloudflare Workers.
 */
export function getOcrServiceUrl(env: Record<string, string | undefined> = process.env): string | null {
  const envUrl = env.OCR_SERVICE_URL?.trim()
  if (envUrl) return envUrl

  if (isProductionOrCloudflare(env)) {
    return null
  }

  return 'http://127.0.0.1:8000'
}

/**
 * Determines whether local Tesseract.js fallback is permitted.
 * Strictly forbidden in production and Cloudflare Workers to prevent memory limits/crashes.
 */
export function shouldAllowTesseractFallback(env: Record<string, string | undefined> = process.env): boolean {
  return !isProductionOrCloudflare(env)
}

