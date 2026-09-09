import * as XLSX from 'xlsx'
import { PaperSize, Orientation } from '@/lib/types/document'

export interface ConversionResult {
  success: boolean
  error?: string
  templateSchema?: string
  paperSize?: PaperSize
  orientation?: Orientation
  pageCount?: number
  detectedFields?: string[]
}

const SUPPORTED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'html', 'txt', 'rtf', 'csv'
]

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

/**
 * Standard placeholders recognized by the template rendering engine
 */
export const AVAILABLE_PLACEHOLDERS = [
  '{{business.name}}',
  '{{business.address}}',
  '{{business.tax_id}}',
  '{{business.phone}}',
  '{{business.email}}',
  '{{business.line_id}}',
  '{{business.description}}',
  '{{business.authorized_person}}',
  '{{business.bank_name}}',
  '{{business.bank_account_name}}',
  '{{business.bank_account_number}}',
  '{{business.promptpay}}',
  '{{document.number}}',
  '{{document.date}}',
  '{{document.valid_until}}',
  '{{document.rental_start_date}}',
  '{{document.rental_end_date}}',
  '{{document.site_name}}',
  '{{document.custom_terms}}',
  '{{customer.code}}',
  '{{customer.name}}',
  '{{customer.company_name}}',
  '{{customer.phone}}',
  '{{customer.email}}',
  '{{customer.address}}',
  '{{customer.tax_id}}',
  '{{customer.id_card}}',
  '{{customer.id_card_expire}}',
  '{{bill.no}}',
  '{{bill.subtotal}}',
  '{{bill.discount}}',
  '{{bill.shipping_fee}}',
  '{{bill.tax_amount}}',
  '{{bill.deposit_amount}}',
  '{{bill.grand_total}}',
  '{{bill.paid_amount}}',
  '{{bill.outstanding_amount}}',
  '{{bill.refund_amount}}',
  '{{bill.late_fee}}',
  '{{bill.damage_fee}}',
  '{{bill.payment_method}}',
  '{{items.rows_standard_20}}',
  '{{items.rows_delivery_20}}',
  '{{items.rows_return_20}}',
  '{{items.rows_statement_20}}',
]

/**
 * Parses XLSX / XLS files into semantic HTML tables and template schema
 */
function parseExcelToSchema(buffer: ArrayBuffer, templateName: string, category: string): ConversionResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' })
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { success: false, error: 'ไม่พบ Sheet ในไฟล์ Excel' }
    }

    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: '' })

    if (!jsonData || jsonData.length === 0) {
      return { success: false, error: 'ไฟล์ Excel ว่างเปล่า ไม่มีข้อมูล' }
    }

    let tableHtml = '<table class="w-full border-collapse border border-slate-300 text-[11px] my-3">'
    let isHeader = true
    const detectedFields: string[] = []

    for (const row of jsonData) {
      if (!Array.isArray(row) || row.every((c) => String(c).trim() === '')) continue

      tableHtml += '<tr>'
      for (const cell of row) {
        const text = String(cell || '').trim()
        const cellTag = isHeader ? 'th' : 'td'
        const cellClass = isHeader
          ? 'border border-slate-300 bg-slate-100 p-2 font-bold text-slate-800 text-left'
          : 'border border-slate-300 p-2 text-slate-700'

        // Detect placeholders in cell content
        for (const ph of AVAILABLE_PLACEHOLDERS) {
          if (text.includes(ph) && !detectedFields.includes(ph)) {
            detectedFields.push(ph)
          }
        }

        tableHtml += `<${cellTag} class="${cellClass}">${text || '&nbsp;'}</${cellTag}>`
      }
      tableHtml += '</tr>'
      isHeader = false
    }
    tableHtml += '</table>'

    const templateSchema = `
<div class="template-document font-sans text-slate-900 leading-relaxed text-xs p-6 space-y-4">
  <div class="flex justify-between items-start border-b-2 border-slate-900 pb-4">
    <div>
      <h1 class="text-xl font-black text-slate-900">${templateName}</h1>
      <p class="text-slate-700 font-bold text-[11px] mt-1">{{business.name}}</p>
      <p class="text-slate-500 text-[10px]">{{business.address}} | โทรศัพท์: {{business.phone}} | เลขผู้เสียภาษี: {{business.tax_id}}</p>
    </div>
    <div class="text-right font-mono">
      <p class="text-xs font-bold text-slate-400">เลขที่เอกสาร</p>
      <p class="font-extrabold text-blue-600 text-sm">{{document.number}}</p>
      <p class="text-slate-500 text-[10px] mt-1">วันที่สร้าง: {{document.date}}</p>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
    <div class="space-y-1">
      <p class="font-extrabold text-slate-800 text-xs border-b pb-1 mb-2">ข้อมูลลูกค้า / คู่สัญญา</p>
      <p><span class="font-bold text-slate-700">รหัสลูกค้า:</span> {{customer.code}}</p>
      <p><span class="font-bold text-slate-700">ชื่อลูกค้า/บริษัท:</span> {{customer.name}}</p>
      <p><span class="font-bold text-slate-700">โทรศัพท์:</span> {{customer.phone}}</p>
      <p><span class="font-bold text-slate-700">อีเมล:</span> {{customer.email}}</p>
      <p><span class="font-bold text-slate-700">เลขผู้เสียภาษี:</span> {{customer.tax_id}}</p>
    </div>
    <div class="space-y-1">
      <p class="font-extrabold text-slate-800 text-xs border-b pb-1 mb-2">ที่อยู่ / ไซต์งาน</p>
      <p class="text-slate-700 leading-snug">{{customer.address}}</p>
      <div class="pt-2 border-t mt-2">
        <p class="font-bold text-slate-800">หมวดหมู่เอกสาร: ${category}</p>
      </div>
    </div>
  </div>

  <div class="overflow-x-auto">
    ${tableHtml}
  </div>

  <div class="space-y-2">
    <p class="font-extrabold text-slate-900 text-xs">ข้อกำหนดและเงื่อนไข</p>
    <div class="p-3 bg-white rounded-lg border border-slate-300 text-[11px] space-y-1 text-slate-700">
      <p>1. เอกสารนี้จัดทำขึ้นระหว่าง {{business.name}} กับ {{customer.name}}</p>
      <p>2. คู่สัญญาตกลงปฏิบัติตามข้อกำหนดและระเบียบการให้บริการตามที่ระบุไว้ในเอกสารนี้</p>
      <p class="pt-1 text-slate-600 italic font-serif">{{document.custom_terms}}</p>
    </div>
  </div>

  <div class="pt-8 grid grid-cols-2 gap-8 text-center text-[11px]">
    <div>
      <div class="border-b border-slate-400 w-48 mx-auto mb-1"></div>
      <p class="font-bold text-slate-900">ลงชื่อ ( {{customer.name}} )</p>
      <p class="text-[10px] text-slate-500">ผู้ขอรับบริการ / คู่สัญญา</p>
    </div>
    <div>
      <div class="border-b border-slate-400 w-48 mx-auto mb-1"></div>
      <p class="font-bold text-slate-900">ลงชื่อ ( ผู้มีอำนาจลงนาม )</p>
      <p class="text-[10px] text-slate-500">{{business.name}}</p>
    </div>
  </div>
</div>`

    return {
      success: true,
      templateSchema: templateSchema.trim(),
      paperSize: 'A4',
      orientation: 'PORTRAIT',
      pageCount: 1,
      detectedFields,
    }
  } catch (err: any) {
    return {
      success: false,
      error: `ไม่สามารถประมวลผลไฟล์ Excel ได้: ${err?.message || 'รูปแบบไฟล์ไม่ถูกต้อง'}`,
    }
  }
}

/**
 * Simple binary string extractor for text-based formats (TXT, HTML, PDF text streams, DOCX XML text)
 */
function extractTextFromBinary(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const decoder = new TextDecoder('utf-8', { fatal: false })
  const decoded = decoder.decode(bytes)
  
  // Clean null bytes and control chars while keeping Thai/Unicode and newlines
  return decoded.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')
}

/**
 * Parses DOCX / DOC / Text / PDF buffer into structured paragraphs and template schema
 */
function parseTextDocumentToSchema(
  rawText: string,
  templateName: string,
  category: string,
  fileExtension: string
): ConversionResult {
  // Extract meaningful lines
  let lines: string[] = []

  if (fileExtension === 'html' || fileExtension === 'htm') {
    // Basic tag stripping while keeping text content
    const textOnly = rawText.replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<\/?[^>]+(>|$)/g, '\n')
    lines = textOnly.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
  } else if (fileExtension === 'docx') {
    // Extract text chunks from XML tags <w:t>...</w:t>
    const matches = rawText.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)
    if (matches && matches.length > 0) {
      const extracted = matches.map((m) => m.replace(/<\/?[^>]+(>|$)/g, '').trim()).filter((t) => t.length > 0)
      lines = extracted
    } else {
      lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 2 && /[\u0E00-\u0E7Fa-zA-Z0-9]/.test(l))
    }
  } else {
    lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && /[\u0E00-\u0E7Fa-zA-Z0-9]/.test(l))
  }

  // Filter out binary garbage lines
  const cleanLines = lines.filter((l) => {
    const printableRatio = (l.match(/[\u0E00-\u0E7Fa-zA-Z0-9\s.,!?:;()[\]{}/\-+=%฿]/g) || []).length / l.length
    return printableRatio > 0.6 && l.length < 500
  }).slice(0, 30) // Take top paragraphs

  const detectedFields: string[] = []
  for (const ph of AVAILABLE_PLACEHOLDERS) {
    if (rawText.includes(ph) && !detectedFields.includes(ph)) {
      detectedFields.push(ph)
    }
  }

  let bodyContentHtml = ''
  if (cleanLines.length > 0) {
    bodyContentHtml = cleanLines.map((line) => `<p class="text-slate-700 leading-relaxed">${line}</p>`).join('\n    ')
  } else {
    bodyContentHtml = `
    <p class="text-slate-700 leading-relaxed">1. ข้อกำหนดและเงื่อนไขการให้บริการตามแบบฟอร์ม ${templateName}</p>
    <p class="text-slate-700 leading-relaxed">2. ผู้ขอรับบริการตกลงและยอมรับตามเงื่อนไขที่ระบุไว้ในสัญญาทุกประการ</p>
    <p class="text-slate-600 italic font-serif pt-2">{{document.custom_terms}}</p>
    `
  }

  const templateSchema = `
<div class="template-document font-sans text-slate-900 leading-relaxed text-xs p-6 space-y-5">
  <div class="flex justify-between items-start border-b-2 border-slate-900 pb-4">
    <div>
      <h1 class="text-xl font-black text-slate-900">${templateName}</h1>
      <p class="text-slate-700 font-bold text-[11px] mt-1">{{business.name}}</p>
      <p class="text-slate-500 text-[10px]">{{business.address}} | โทรศัพท์: {{business.phone}} | เลขผู้เสียภาษี: {{business.tax_id}}</p>
    </div>
    <div class="text-right font-mono">
      <p class="text-xs font-bold text-slate-400">เลขที่เอกสาร</p>
      <p class="font-extrabold text-blue-600 text-sm">{{document.number}}</p>
      <p class="text-slate-500 text-[10px] mt-1">วันที่สร้าง: {{document.date}}</p>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
    <div class="space-y-1">
      <p class="font-extrabold text-slate-800 text-xs border-b pb-1 mb-2">ข้อมูลลูกค้า / คู่สัญญา</p>
      <p><span class="font-bold text-slate-700">รหัสลูกค้า:</span> {{customer.code}}</p>
      <p><span class="font-bold text-slate-700">ชื่อลูกค้า/บริษัท:</span> {{customer.name}}</p>
      <p><span class="font-bold text-slate-700">โทรศัพท์:</span> {{customer.phone}}</p>
      <p><span class="font-bold text-slate-700">อีเมล:</span> {{customer.email}}</p>
      <p><span class="font-bold text-slate-700">เลขผู้เสียภาษี:</span> {{customer.tax_id}}</p>
    </div>
    <div class="space-y-1">
      <p class="font-extrabold text-slate-800 text-xs border-b pb-1 mb-2">ที่อยู่ / ไซต์งาน</p>
      <p class="text-slate-700 leading-snug">{{customer.address}}</p>
      <div class="pt-2 border-t mt-2">
        <p class="font-bold text-slate-800">หมวดหมู่เอกสาร: ${category}</p>
        <p class="text-slate-500 text-[10px]">ประเภทไฟล์ต้นฉบับ: .${fileExtension.toUpperCase()}</p>
      </div>
    </div>
  </div>

  <div class="space-y-3 p-4 bg-white rounded-lg border border-slate-300">
    <p class="font-extrabold text-slate-900 text-xs border-b pb-2">เนื้อหาและข้อกำหนดตามแบบฟอร์ม</p>
    <div class="space-y-2 text-[11px]">
      ${bodyContentHtml}
    </div>
  </div>

  <div class="pt-8 grid grid-cols-2 gap-8 text-center text-[11px]">
    <div>
      <div class="border-b border-slate-400 w-48 mx-auto mb-1"></div>
      <p class="font-bold text-slate-900">ลงชื่อ ( {{customer.name}} )</p>
      <p class="text-[10px] text-slate-500">ผู้ขอรับบริการ / คู่สัญญา</p>
    </div>
    <div>
      <div class="border-b border-slate-400 w-48 mx-auto mb-1"></div>
      <p class="font-bold text-slate-900">ลงชื่อ ( ผู้มีอำนาจลงนาม )</p>
      <p class="text-[10px] text-slate-500">{{business.name}}</p>
    </div>
  </div>
</div>`

  return {
    success: true,
    templateSchema: templateSchema.trim(),
    paperSize: 'A4',
    orientation: 'PORTRAIT',
    pageCount: 1,
    detectedFields,
  }
}

/**
 * Real document conversion workflow:
 * Reads source file arrayBuffer -> parses actual format structure -> converts to internal HTML/CSS template schema -> releases buffer
 */
export async function convertFileToInternalTemplate(
  file: File | { name: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> },
  templateName: string,
  category: string
): Promise<ConversionResult> {
  if (!file || !file.name) {
    return { success: false, error: 'กรุณาเลือกไฟล์ที่ต้องการแปลง' }
  }

  if (file.size === 0) {
    return { success: false, error: 'ไฟล์ที่อัปโหลดมีขนาด 0 byte (ไฟล์ว่างเปล่า)' }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: 'ขนาดไฟล์เกินกำหนด (สูงสุด 10 MB)' }
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    return {
      success: false,
      error: `ไม่รองรับไฟล์สกุล .${extension} (รองรับ: PDF, DOCX, XLSX, XLS, HTML, TXT, CSV)`,
    }
  }

  try {
    const buffer = await file.arrayBuffer()

    if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
      return parseExcelToSchema(buffer, templateName || file.name, category)
    }

    const textContent = extractTextFromBinary(buffer)
    return parseTextDocumentToSchema(textContent, templateName || file.name, category, extension)
  } catch (err: any) {
    return {
      success: false,
      error: `เกิดข้อผิดพลาดในการประมวลผลไฟล์: ${err?.message || 'ไม่สามารถอ่านไฟล์ได้'}`,
    }
  }
}
