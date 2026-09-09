'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  FileText,
  Upload,
  Printer,
  CheckCircle2,
  FolderOpen,
  Trash2,
  FileCode,
  Layers,
  FilePlus,
  RefreshCw,
  Plus,
  X,
  Check,
} from 'lucide-react'

import { CustomSelect } from '@/components/common/CustomSelect'
import { useToast } from '@/components/common/Toast'
import { Customer } from '@/lib/types/rental-pos'
import { DocumentTemplate, CustomerDocument, CustomerSnapshot } from '@/lib/types/document'
import { convertFileToInternalTemplate } from '@/lib/utils/documentConverter'
import { renderDocumentTemplate } from '@/lib/utils/documentRenderer'
import { A4DocumentWorkspace } from '@/components/documents/A4DocumentWorkspace'
import { A4FitPreview } from '@/components/pos/A4FitPreview'
import { BatchDeleteModal } from '@/components/documents/BatchDeleteModal'
import { logger } from '@/lib/utils/logger'

import { INITIAL_TEMPLATES, INITIAL_DOC_CATEGORIES } from '@/lib/constants/initialDocumentTemplates'

export default function DocumentsPage() {
  const { showToast } = useToast()

  // Document Categories State
  const [docCategories, setDocCategories] = useState<string[]>(INITIAL_DOC_CATEGORIES)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCatInput, setNewCatInput] = useState('')
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null)
  const [editingCatValue, setEditingCatValue] = useState('')

  const documentCategoryOptions = useMemo(() => {
    return docCategories.map((cat) => ({ value: cat, label: `📁 ${cat}` }))
  }, [docCategories])

  // Tab State: 'CREATE_DOC' (สร้างเอกสาร) vs 'MANAGE_TEMPLATES' (จัดการเอกสาร)
  const [mainTab, setMainTab] = useState<'CREATE_DOC' | 'MANAGE_TEMPLATES'>('CREATE_DOC')
  const [mobileTab, setMobileTab] = useState<'WORKSPACE' | 'PREVIEW'>('WORKSPACE')
  const business = {
    companyName: '',
    phone: '',
    address: '',
    taxId: '',
  }

  // Template Sub-Tab State: 'LIBRARY' (คลังแบบฟอร์ม) vs 'ADD' (เพิ่มแบบฟอร์ม)
  const [templateSubTab, setTemplateSubTab] = useState<'LIBRARY' | 'ADD'>('LIBRARY')

  // Templates State
  const [templates, setTemplates] = useState<DocumentTemplate[]>(INITIAL_TEMPLATES)
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<DocumentTemplate | null>(INITIAL_TEMPLATES[0])
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([])

  // Customer Documents State
  const [customerDocs, setCustomerDocs] = useState<CustomerDocument[]>([])
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<CustomerDocument | null>(null)
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])

  // Batch Delete Modal State
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean
    type: 'TEMPLATES' | 'CUSTOMER_DOCS'
    ids: string[]
  }>({ isOpen: false, type: 'TEMPLATES', ids: [] })

  // Fullscreen A4 Preview Overlay State (triggered on double click)
  const [fullOverlayHtml, setFullOverlayHtml] = useState<string | null>(null)

  // ==========================================
  // FORM STATE: TAB 1 (สร้างเอกสารให้ลูกค้า)
  // ==========================================
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')

  useEffect(() => {
    setCustomers([])
  }, [])

  // Active Selected Customer Snapshot
  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId)
  }, [customers, selectedCustomerId])

  // Handle Template Selection in Create Tab -> Immediately Add Document into List!
  const handleAddDocumentFromTemplate = (tplId: string) => {
    if (!tplId) return
    const tpl = templates.find((t) => t.id === tplId)
    if (!tpl) return

    if (!activeCustomer) {
      showToast(
        'กรุณาเลือกลูกค้า',
        'ต้องเลือกลูกค้าก่อนเพิ่มเอกสาร',
        'ERROR'
      )
      return
    }

    const docCount = customerDocs.length + 1
    const newDocNo = `DOC-2026-${String(docCount).padStart(4, '0')}`
    const now = new Date()

    const frozenSnapshot: CustomerSnapshot = {
      id: activeCustomer.id,
      customerCode: activeCustomer.customerCode || '',
      customerName: activeCustomer.customerName,
      companyName: activeCustomer.customerName,
      phone: activeCustomer.phone,
      email: activeCustomer.email || '',
      houseNo: activeCustomer.houseNo || '',
      subDistrict: activeCustomer.subDistrict || '',
      district: activeCustomer.district || '',
      province: activeCustomer.province || '',
      postalCode: activeCustomer.postalCode || '',
      address: activeCustomer.address || '',
      taxId: activeCustomer.taxId || '-',
      idCardNumber: activeCustomer.idCardNumber || '-',
      idCardExpiry: activeCustomer.idCardExpiry || '-'
    }

    const newDoc: CustomerDocument = {
      id: `cust_doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      docNo: newDocNo,
      customerId: activeCustomer.id,
      customerName: activeCustomer.customerName,
      templateId: tpl.id,
      templateName: tpl.name,
      templateVersion: tpl.version,
      category: tpl.category,
      customerSnapshot: frozenSnapshot,
      customFields: {},
      items: [],
      terms: tpl.defaultTerms || '',
      createdDate: now.toISOString().split('T')[0],
      createdTime: now.toTimeString().slice(0, 5),
      createdBy: 'ผู้ใช้งานปัจจุบัน',
      status: 'ACTIVE',
      attachments: []
    }

    setCustomerDocs((prev) => [newDoc, ...prev])
    setSelectedDocForPreview(newDoc)

    showToast(
      'เพิ่มเอกสารสำเร็จ',
      `เพิ่ม "${tpl.name}" (${newDocNo}) เข้าสู่รายการเอกสารเรียบร้อยแล้ว`,
      'SUCCESS'
    )
  }

  // Handle Save All Customer Documents to Database
  const handleSaveCustomerDocuments = async () => {
    if (customerDocs.length === 0) {
      showToast('ไม่มีรายการเอกสาร', 'ยังไม่มีเอกสารสำหรับบันทึก', 'INFO')
      return
    }

    if (!activeCustomer) {
      showToast('กรุณาเลือกลูกค้า', 'ต้องเลือกลูกค้าก่อนบันทึกเอกสาร', 'ERROR')
      return
    }

    showToast(
      'บันทึกเอกสารสำเร็จ',
      `บันทึกเอกสารของลูกค้า ${activeCustomer.customerName} ทั้งหมด ${customerDocs.length} รายการเรียบร้อยแล้ว`,
      'SUCCESS'
    )
  }

  // ==========================================
  // FORM STATE: TAB 2 (จัดการเทมเพลตเอกสาร)
  // ==========================================
  const [newFormName, setNewFormName] = useState('')
  const [newFormCategory, setNewFormCategory] = useState<string>('สัญญาเช่าสินค้า')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [conversionProgress, setConversionProgress] = useState<string | null>(null)
  const [convertedSchema, setConvertedSchema] = useState<string | null>(null)
  const [newFormOrientation, setNewFormOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT')
  const [newFormDescription, setNewFormDescription] = useState('')
  const newFormTerms =
    '1. ผู้เช่าตกลงชำระค่าเช่าตามอัตราในสัญญานี้\n2. อุปกรณ์ที่เช่าต้องได้รับการดูแลให้อยู่ในสภาพใช้งานได้ปกติ\n3. ค่าปรับชำรุด/สูญหายเป็นไปตามที่ตกลงในแนบท้ายสัญญา'

  // Handle File Upload & Temporary Conversion
  const handleFileUploadAndConvert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]
    setUploadedFile(file)
    if (!newFormName) {
      setNewFormName(file.name.replace(/\.[^/.]+$/, ''))
    }

    setConversionProgress('กำลังอัปโหลดไฟล์ชั่วคราว...')
    await new Promise((res) => setTimeout(res, 400))

    setConversionProgress('กำลังวิเคราะห์โครงสร้างเอกสาร ตาราง ข้อความ และขนาดกระดาษ...')
    await new Promise((res) => setTimeout(res, 600))

    setConversionProgress('กำลังแปลงเป็น Internal Template Schema...')
    const result = await convertFileToInternalTemplate(file, newFormName || file.name, newFormCategory)

    if (!result.success) {
      setConversionProgress(null)
      showToast('ไม่สามารถแปลงไฟล์ได้', result.error || 'ไม่สามารถแปลงไฟล์ประเภทนี้เป็น Template ได้', 'ERROR')
      setUploadedFile(null)
      return
    }

    setConvertedSchema(result.templateSchema || '')
    if (result.orientation) setNewFormOrientation(result.orientation)
    setConversionProgress(null)

    // Clear temporary input file
    e.target.value = ''

    showToast(
      'แปลงไฟล์เป็น Template สำเร็จ',
      `ระบบได้แปลงโครงสร้างเอกสารเรียบร้อย และลบไฟล์ต้นฉบับชั่วคราวแล้ว`,
      'SUCCESS'
    )
  }

  // Handle Save New Template to Database
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newFormName.trim()) {
      showToast('กรุณาระบุชื่อแบบฟอร์ม', 'กรอกชื่อแบบฟอร์มก่อนบันทึก', 'INFO')
      return
    }

    const schemaToSave =
      convertedSchema ||
      `
<div class="template-doc text-slate-900 font-sans text-xs space-y-4">
  <div class="border-b-2 border-slate-900 pb-3">
    <h1 class="text-xl font-black">${newFormName}</h1>
    <p class="text-slate-500 font-bold text-[11px]">หมวดหมู่: ${newFormCategory}</p>
  </div>

  <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
    <p><span class="font-bold">คู่สัญญา/ลูกค้า:</span> {{customer.name}}</p>
    <p><span class="font-bold">โทรศัพท์:</span> {{customer.phone}}</p>
    <p><span class="font-bold">ที่อยู่:</span> {{customer.address}}</p>
    <p><span class="font-bold">เลขผู้เสียภาษี:</span> {{customer.tax_id}}</p>
  </div>

  <div class="p-3 bg-white rounded-lg border border-slate-300 text-[11px]">
    <p class="font-bold mb-1">เงื่อนไขเพิ่มเติม:</p>
    <p class="whitespace-pre-wrap">{{document.custom_terms}}</p>
  </div>
</div>
      `.trim()

    const newTplData: Partial<DocumentTemplate> = {
      name: newFormName,
      category: newFormCategory,
      source: uploadedFile ? 'CONVERTED_IMPORT' : 'BUILTIN',
      fileType: uploadedFile ? uploadedFile.name.split('.').pop()?.toUpperCase() || 'DOC' : 'HTML',
      fileName: uploadedFile?.name,
      templateSchema: schemaToSave,
      paperSize: 'A4',
      orientation: newFormOrientation,
      pageCount: 1,
      version: 1,
      isDefault: false,
      description: newFormDescription || 'เทมเพลตที่สร้างใหม่ในระบบ',
      defaultTerms: newFormTerms,
    }

    const savedTpl: DocumentTemplate = {
      ...newTplData,
      id: `tpl-${Date.now()}`,
    } as unknown as DocumentTemplate
    setTemplates((prev) => [savedTpl, ...prev])
    setSelectedTemplateForPreview(savedTpl)
    setTemplateSubTab('LIBRARY')

    // Reset Form & Clear Temp state
    setNewFormName('')
    setUploadedFile(null)
    setConvertedSchema(null)
    setNewFormDescription('')

    showToast('บันทึก Template สำเร็จ', `บันทึกแบบฟอร์ม "${savedTpl.name}" เข้าสู่ระบบเรียบร้อยแล้ว`, 'SUCCESS')
  }

  // ==========================================
  // DOCUMENT CATEGORY MANAGEMENT HANDLERS
  // ==========================================
  const handleAddCategory = () => {
    const trimmed = newCatInput.trim()
    if (!trimmed) return
    if (docCategories.includes(trimmed)) {
      showToast('ประเภทเอกสารซ้ำ', 'มีชื่อประเภทเอกสารนี้อยู่ในระบบแล้ว', 'INFO')
      return
    }
    setDocCategories((prev) => [...prev, trimmed])
    setNewCatInput('')
    showToast('เพิ่มประเภทเอกสารสำเร็จ', `เพิ่ม "${trimmed}" แล้ว`, 'SUCCESS')
  }

  const handleStartEditCategory = (idx: number, val: string) => {
    setEditingCatIndex(idx)
    setEditingCatValue(val)
  }

  const handleSaveEditCategory = () => {
    if (editingCatIndex === null) return
    const trimmed = editingCatValue.trim()
    if (!trimmed) return
    const oldVal = docCategories[editingCatIndex]
    setDocCategories((prev) => {
      const updated = [...prev]
      updated[editingCatIndex] = trimmed
      return updated
    })
    if (newFormCategory === oldVal) {
      setNewFormCategory(trimmed)
    }
    setEditingCatIndex(null)
    setEditingCatValue('')
    showToast('แก้ไขประเภทเอกสารสำเร็จ', `เปลี่ยนเป็น "${trimmed}" แล้ว`, 'SUCCESS')
  }

  const handleDeleteCategory = (idx: number) => {
    const target = docCategories[idx]
    setDocCategories((prev) => prev.filter((_, i) => i !== idx))
    if (newFormCategory === target) {
      const remaining = docCategories.filter((_, i) => i !== idx)
      setNewFormCategory(remaining[0] || '')
    }
    showToast('ลบประเภทเอกสารสำเร็จ', `ลบ "${target}" แล้ว`, 'SUCCESS')
  }

  // ==========================================
  // BATCH SELECTION & ACTIONS HANDLERS
  // ==========================================

  // Customer Docs Checkbox Select
  const handleToggleDocSelect = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAllDocs = () => {
    if (selectedDocIds.length === customerDocs.length) {
      setSelectedDocIds([])
    } else {
      setSelectedDocIds(customerDocs.map((d) => d.id))
    }
  }

  // Templates Checkbox Select
  const handleToggleTemplateSelect = (id: string) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAllTemplates = () => {
    if (selectedTemplateIds.length === templates.length) {
      setSelectedTemplateIds([])
    } else {
      setSelectedTemplateIds(templates.map((t) => t.id))
    }
  }

  // Execute Batch Print for Customer Documents (Native Central Print)
  const handleBatchPrintDocs = async () => {
    const docsToPrint =
      selectedDocIds.length > 0
        ? customerDocs.filter((d) => selectedDocIds.includes(d.id))
        : selectedDocForPreview
        ? [selectedDocForPreview]
        : customerDocs

    if (docsToPrint.length === 0) {
      showToast('ไม่พบเอกสาร', 'กรุณาเลือกเอกสารที่ต้องการพิมพ์', 'INFO')
      return
    }

    const combinedHtml = docsToPrint
      .map((doc) => {
        const tpl = templates.find((t) => t.id === doc.templateId) || templates[0]
        return `
          <div style="page-break-after: always;" class="print-page p-8 bg-white text-slate-900 font-sans space-y-6 max-w-[210mm] mx-auto text-xs">
            ${renderDocumentTemplate(
              tpl.templateSchema,
              doc.customerSnapshot,
              doc.docNo,
              doc.createdDate,
              doc.terms,
              business
            )}
          </div>
        `
      })
      .join('')

    window.print()
  }

  // Execute Batch Print for Templates (Native Central Print)
  const handleBatchPrintTemplates = async () => {
    window.print()
  }

  // Open Batch Delete Modal
  const handlePromptDelete = (type: 'TEMPLATES' | 'CUSTOMER_DOCS') => {
    const ids = type === 'TEMPLATES' ? selectedTemplateIds : selectedDocIds
    if (ids.length === 0) {
      showToast('เลือกรายการ', 'กรุณาเลือกรายการอย่างน้อย 1 รายการก่อนลบ', 'INFO')
      return
    }
    setDeleteModalConfig({ isOpen: true, type, ids })
  }

  // Execute Batch Delete Confirmation
  const handleConfirmBatchDelete = async (reason: string) => {
    const { type, ids } = deleteModalConfig
    const trimmedReason = reason?.trim()
    if (type === 'TEMPLATES' && !trimmedReason) {
      showToast('กรุณาระบุเหตุผล', 'จำเป็นต้องระบุเหตุผลในการลบแบบฟอร์ม', 'ERROR')
      return
    }
    if (type === 'TEMPLATES') {
      setTemplates((prev) => prev.filter((t) => !ids.includes(t.id)))
      setSelectedTemplateIds([])
      if (selectedTemplateForPreview && ids.includes(selectedTemplateForPreview.id)) {
        setSelectedTemplateForPreview(null)
      }
      showToast('ลบแบบฟอร์มสำเร็จ', `ลบแบบฟอร์มจำนวน ${ids.length} รายการแล้ว`, 'SUCCESS')
    } else {
      setCustomerDocs((prev) => prev.filter((d) => !ids.includes(d.id)))
      setSelectedDocIds([])
      if (selectedDocForPreview && ids.includes(selectedDocForPreview.id)) {
        setSelectedDocForPreview(customerDocs.find((d) => !ids.includes(d.id)) || null)
      }
      showToast('ลบเอกสารสำเร็จ', `ลบเอกสารลูกค้าจำนวน ${ids.length} รายการแล้ว`, 'SUCCESS')
    }
  }

  // Authoritative Sample data for Template Live Previews
  const sampleBillSnapshot = useMemo(() => ({
    billNo: 'INV-2026-00088',
    billDate: new Date().toISOString().split('T')[0],
    rentalStartDate: new Date().toISOString().split('T')[0],
    rentalEndDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    siteName: 'โครงการก่อสร้างอาคารชุด ไพร์ม เรสซิเดนซ์ ถ.สุขุมวิท',
    subtotal: 18500,
    discount: 1000,
    shippingFee: 1500,
    taxAmount: 1330,
    depositAmount: 5000,
    grandTotal: 25330,
    paidAmount: 20330,
    outstandingAmount: 5000,
    refundAmount: 5000,
    lateFee: 0,
    damageFee: 0,
    paymentMethod: 'โอนเงินผ่านธนาคาร (Bank Transfer)',
    items: [
      { code: 'EQ-001', name: 'นั่งร้านเหล็กมาตรฐาน ชุด 1.7 เมตร', quantity: 10, unit: 'ชุด', price: 450, rentalType: 'DAILY', billableDays: 7, lineTotal: 4500 },
      { code: 'EQ-002', name: 'บันไดนั่งร้านอลูมิเนียมกันลื่น 2.5 ม.', quantity: 4, unit: 'ตัว', price: 250, rentalType: 'DAILY', billableDays: 7, lineTotal: 1750 },
      { code: 'EQ-003', name: 'เครื่องสกัดคอนกรีตไฟฟ้า 15 กก. Heavy Duty', quantity: 2, unit: 'เครื่อง', price: 650, rentalType: 'DAILY', billableDays: 7, lineTotal: 4550 },
      { code: 'EQ-004', name: 'เครื่องตบดินแบบสปริง 5.5 แรงม้า', quantity: 1, unit: 'เครื่อง', price: 800, rentalType: 'DAILY', billableDays: 7, lineTotal: 5600 },
      { code: 'EQ-005', name: 'เครื่องปั่นไฟเบนซิน 5.5 kW Inverter', quantity: 1, unit: 'เครื่อง', price: 1200, rentalType: 'DAILY', billableDays: 7, lineTotal: 2100 }
    ]
  }), [])

  const sampleCustomerSnapshot = useMemo(() => ({
    customerCode: 'CUST-2026-001',
    customerName: 'คุณสมชาย มั่นคงเจริญ',
    companyName: 'บริษัท สยามก่อสร้างและวิศวกรรม จำกัด',
    phone: '089-123-4567',
    email: 'somchai.siam@example.com',
    address: 'เลขที่ 123/45 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพมหานคร 10900',
    taxId: '0105558098765',
    idCardNumber: '1-1002-34567-89-0',
    idCardExpiry: '2030-12-31'
  }), [])

  // Active rendered HTML for Tab 1 (Customer Doc Preview)
  const currentDocPreviewHtml = useMemo(() => {
    if (selectedDocForPreview) {
      const tpl = templates.find((t) => t.id === selectedDocForPreview.templateId) || templates[0]
      return renderDocumentTemplate(
        tpl.templateSchema,
        selectedDocForPreview.customerSnapshot || sampleCustomerSnapshot,
        selectedDocForPreview.docNo,
        selectedDocForPreview.createdDate,
        selectedDocForPreview.terms,
        business,
        sampleBillSnapshot,
        selectedDocForPreview.items
      )
    }
    if (customerDocs[0]) {
      const tpl = templates.find((t) => t.id === customerDocs[0].templateId) || templates[0]
      return renderDocumentTemplate(
        tpl.templateSchema,
        customerDocs[0].customerSnapshot || sampleCustomerSnapshot,
        customerDocs[0].docNo,
        customerDocs[0].createdDate,
        customerDocs[0].terms,
        business,
        sampleBillSnapshot,
        customerDocs[0].items
      )
    }
    return ''
  }, [selectedDocForPreview, customerDocs, templates, business, sampleCustomerSnapshot, sampleBillSnapshot])

  // Active rendered HTML for Tab 2 (Template Live Preview)
  const currentTemplatePreviewHtml = useMemo(() => {
    if (selectedTemplateForPreview) {
      return renderDocumentTemplate(
        selectedTemplateForPreview.templateSchema,
        activeCustomer || sampleCustomerSnapshot,
        'TPL-PREVIEW-001',
        new Date().toISOString().split('T')[0],
        selectedTemplateForPreview.defaultTerms,
        business,
        sampleBillSnapshot
      )
    }
    return ''
  }, [selectedTemplateForPreview, activeCustomer, business, sampleCustomerSnapshot, sampleBillSnapshot])

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden p-2.5 sm:p-3 md:p-4 bg-slate-100 dark:bg-slate-900 gap-2.5 sm:gap-3 text-xs">
      {/* Mobile View Switcher (< md screens) */}
      <div className="md:hidden flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('WORKSPACE')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'WORKSPACE'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ตั้งค่า/เลือกเอกสาร</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('PREVIEW')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'PREVIEW'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>ดูตัวอย่าง A4</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: สร้างเอกสาร (DOCUMENT GENERATION & CUSTOMER HISTORY WORKSPACE)      */}
      {/* ========================================================================= */}
      {mainTab === 'CREATE_DOC' && (
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 overflow-hidden animate-in fade-in duration-200">

          {/* LEFT PANEL: Document List / Add Document */}
          <div className={`md:col-span-5 xl:col-span-4 h-full min-h-0 overflow-hidden flex-col ${
            mobileTab === 'WORKSPACE' ? 'flex' : 'hidden md:flex'
          }`}>
            
            {/* Unified White Card */}
            <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 min-h-0 flex flex-col justify-between overflow-hidden gap-2">
              
              <div className="flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden">
                {/* 0. Main Mode Switcher (50 / 50 Equal Width) */}
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 font-extrabold text-xs">
                  <button
                    type="button"
                    onClick={() => setMainTab('CREATE_DOC')}
                    className="py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center bg-slate-900 dark:bg-slate-700 text-white dark:text-blue-300 shadow-sm"
                  >
                    <FilePlus className="w-3.5 h-3.5 shrink-0" />
                    <span>สร้างเอกสาร</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMainTab('MANAGE_TEMPLATES')}
                    className="py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>จัดการเอกสาร</span>
                  </button>
                </div>

                {/* Thin Divider */}
                <div className="border-b border-slate-200 dark:border-slate-700/80 shrink-0 my-0.5" />

                {/* 1. Dropdown ค้นหา/เลือกลูกค้า */}
                <div className="shrink-0">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อลูกค้า
                  </label>
                  <CustomSelect
                    value={selectedCustomerId}
                    placeholder="ค้นหา / เลือกลูกค้า"
                    onChange={(val) => setSelectedCustomerId(String(val))}
                    options={customers.map((c) => ({
                      value: c.id,
                      label: `${c.customerName} (${c.customerCode})`,
                      sublabel: c.companyName ? `${c.companyName} | 📞 ${c.phone}` : `📞 ${c.phone}`
                    }))}
                    searchable
                  />
                </div>

                {/* 2. Dropdown เลือกแบบฟอร์ม */}
                <div className="shrink-0">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    เลือกเอกสาร/แบบฟอร์ม
                  </label>
                  <CustomSelect
                    value=""
                    placeholder="-- เลือกแบบฟอร์มเพื่อเพิ่มเอกสาร --"
                    onChange={(val) => handleAddDocumentFromTemplate(String(val))}
                    options={templates.map((t) => ({
                      value: t.id,
                      label: `📄 [${t.category}] ${t.name}`
                    }))}
                  />
                </div>

                {/* 3. หัวข้อรายการเอกสาร */}
                <div className="flex items-center gap-1.5 pt-0.5 text-slate-800 dark:text-slate-200 font-bold text-xs shrink-0">
                  <FolderOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>รายการเอกสาร</span>
                </div>

                {/* 4. แถวเลือกทั้งหมด */}
                <div className="flex items-center justify-between py-1 px-1 text-xs border-b border-slate-200 dark:border-slate-700 shrink-0">
                  <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customerDocs.length > 0 && selectedDocIds.length === customerDocs.length}
                      onChange={handleToggleSelectAllDocs}
                      className="w-3.5 h-3.5 text-blue-600 rounded"
                    />
                    <span>เลือกทั้งหมด</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">
                    เลือกแล้ว {selectedDocIds.length} / {customerDocs.length}
                  </span>
                </div>

                {/* 5. รายการเอกสาร (Flat List Row + Divider) */}
                <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 pr-1">
                  {customerDocs.length > 0 ? (
                    customerDocs.map((doc, idx) => {
                      const isSelected = selectedDocForPreview?.id === doc.id
                      return (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDocForPreview(doc)}
                          className={`py-2 px-1.5 flex items-center justify-between gap-2 transition-colors cursor-pointer rounded-lg ${
                            isSelected
                              ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedDocIds.includes(doc.id)}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleToggleDocSelect(doc.id)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-3.5 h-3.5 text-blue-600 rounded shrink-0 cursor-pointer"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-[11px]">
                                {idx + 1}. {doc.templateName}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {doc.docNo} • {doc.createdDate}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-extrabold text-[9px] shrink-0">
                              พรีวิว
                            </span>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-slate-400 space-y-1">
                      <FileText className="w-7 h-7 mx-auto text-slate-300 stroke-[1.5]" />
                      <p className="font-bold text-xs text-slate-500">ยังไม่มีเอกสารในรายการ</p>
                      <p className="text-[10px] text-slate-400">เลือกแบบฟอร์มจากเมนูด้านบนเพื่อเพิ่มเอกสาร</p>
                    </div>
                  )}
                </div>

              </div>

              {/* 6. Bottom Action Section: Print / Delete (50/50) above Save */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1.5 shrink-0">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={handleBatchPrintDocs}
                    className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>พิมพ์ ({selectedDocIds.length > 0 ? selectedDocIds.length : 'ทั้งหมด'})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePromptDelete('CUSTOMER_DOCS')}
                    disabled={selectedDocIds.length === 0}
                    className={`py-1.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      selectedDocIds.length > 0
                        ? 'bg-red-600 text-white shadow-sm hover:bg-red-700'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบ ({selectedDocIds.length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveCustomerDocuments}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึก</span>
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT PANEL: A4 Preview Workspace */}
          <div className={`md:col-span-7 xl:col-span-8 h-full min-h-0 overflow-hidden flex-col ${
            mobileTab === 'PREVIEW' ? 'flex' : 'hidden md:flex'
          }`}>
            <A4DocumentWorkspace
              htmlContent={currentDocPreviewHtml}
              onDoubleClick={() => currentDocPreviewHtml && setFullOverlayHtml(currentDocPreviewHtml)}
            />
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: จัดการเอกสาร (TEMPLATE MANAGEMENT & CONVERSION STUDIO)              */}
      {/* ========================================================================= */}
      {mainTab === 'MANAGE_TEMPLATES' && (
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 overflow-hidden animate-in fade-in duration-200">

          {/* LEFT PANEL: Template Controls (Library / Add) */}
          <div className={`md:col-span-5 xl:col-span-4 h-full min-h-0 overflow-hidden flex-col ${
            mobileTab === 'WORKSPACE' ? 'flex' : 'hidden md:flex'
          }`}>

            {/* Unified Card */}
            <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 min-h-0 flex flex-col justify-between overflow-hidden gap-2">

              <div className="flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden">
                {/* 0. Main Mode Switcher (50 / 50 Equal Width - Same Exact Position) */}
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 font-extrabold text-xs">
                  <button
                    type="button"
                    onClick={() => setMainTab('CREATE_DOC')}
                    className="py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                  >
                    <FilePlus className="w-3.5 h-3.5 shrink-0" />
                    <span>สร้างเอกสาร</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMainTab('MANAGE_TEMPLATES')}
                    className="py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center bg-slate-900 dark:bg-slate-700 text-white dark:text-blue-300 shadow-sm"
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>จัดการเอกสาร</span>
                  </button>
                </div>

                {/* Thin Divider */}
                <div className="border-b border-slate-200 dark:border-slate-700/80 shrink-0 my-0.5" />

                {/* Sub-Tab Switcher: คลังแบบฟอร์ม vs เพิ่มแบบฟอร์ม */}
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 font-extrabold text-xs">
                  <button
                    type="button"
                    onClick={() => setTemplateSubTab('LIBRARY')}
                    className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center ${
                      templateSubTab === 'LIBRARY'
                        ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-blue-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span>คลังแบบฟอร์ม</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateSubTab('ADD')}
                    className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center ${
                      templateSubTab === 'ADD'
                        ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-blue-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FilePlus className="w-3.5 h-3.5 shrink-0" />
                    <span>เพิ่มแบบฟอร์ม</span>
                  </button>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SUB VIEW 1: คลังแบบฟอร์ม (TEMPLATE LIBRARY LIST ONLY)           */}
                {/* ------------------------------------------------------------- */}
                {templateSubTab === 'LIBRARY' && (
                  <div className="flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 pt-0.5 text-slate-800 dark:text-slate-200 font-bold text-xs shrink-0">
                      <FileCode className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>รายการแบบฟอร์มเอกสาร ({templates.length})</span>
                    </div>

                    {/* Select All Checkbox */}
                    <div className="flex items-center justify-between py-1 px-1 text-xs border-b border-slate-200 dark:border-slate-700 shrink-0">
                      <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={templates.length > 0 && selectedTemplateIds.length === templates.length}
                          onChange={handleToggleSelectAllTemplates}
                          className="w-3.5 h-3.5 text-purple-600 rounded"
                        />
                        <span>เลือกทั้งหมด</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        เลือกแล้ว {selectedTemplateIds.length} / {templates.length}
                      </span>
                    </div>

                    {/* Template Items List (Flat List Rows + Divider) */}
                    <div className="flex-1 min-h-0 divide-y divide-slate-100 dark:divide-slate-700/60 overflow-y-auto pr-1">
                      {templates.map((tpl) => {
                        const isSelected = selectedTemplateForPreview?.id === tpl.id
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => setSelectedTemplateForPreview(tpl)}
                            className={`py-2 px-1.5 flex items-center justify-between gap-2 transition-colors cursor-pointer rounded-lg ${
                              isSelected
                                ? 'bg-purple-50/80 dark:bg-purple-950/50 text-purple-900 dark:text-purple-100'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <input
                                type="checkbox"
                                checked={selectedTemplateIds.includes(tpl.id)}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleToggleTemplateSelect(tpl.id)
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-3.5 h-3.5 text-purple-600 rounded shrink-0 cursor-pointer"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate text-[11px]">
                                    {tpl.name}
                                  </span>
                                  {tpl.isDefault && (
                                    <span className="px-1.5 py-0.2 rounded bg-purple-600 text-white font-extrabold text-[9px]">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono block">
                                  หมวด: {tpl.category} | v{tpl.version}
                                </span>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-extrabold text-[9px] shrink-0">
                                พรีวิว
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* SUB VIEW 2: เพิ่มแบบฟอร์ม (ADD/CONVERT TEMPLATE FORM ONLY)      */}
                {/* ------------------------------------------------------------- */}
                {templateSubTab === 'ADD' && (
                  <form onSubmit={handleSaveTemplate} className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5 text-xs animate-in fade-in duration-150 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      {/* ชื่อแบบฟอร์ม / ชื่อเอกสาร */}
                      <div>
                        <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                          ชื่อแบบฟอร์ม / ชื่อเอกสาร
                        </label>
                        <input
                          type="text"
                          placeholder="ชื่อแบบฟอร์ม / ชื่อเอกสาร"
                          value={newFormName}
                          onChange={(e) => setNewFormName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>

                      {/* หมวดหมู่เอกสาร + [+] button to manage categories */}
                      <div>
                        <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                          หมวดหมู่เอกสาร
                        </label>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 min-w-0">
                            <CustomSelect
                              value={newFormCategory}
                              placeholder="ประเภทเอกสาร"
                              onChange={(val) => setNewFormCategory(String(val))}
                              options={documentCategoryOptions}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="p-2 h-[38px] w-[38px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-200 dark:border-slate-600 transition-colors shrink-0 shadow-sm"
                            title="จัดการประเภทเอกสาร"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* File Upload Area */}
                      <div>
                        <div className="p-3 border-2 border-dashed border-purple-300 dark:border-purple-800/80 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 text-center space-y-1.5">
                          <Upload className="w-5 h-5 text-purple-600 mx-auto" />
                          <p className="font-bold text-slate-700 dark:text-slate-200 text-[10px]">
                            {uploadedFile ? (
                              <span className="text-purple-600 font-mono">📎 {uploadedFile.name}</span>
                            ) : (
                              'รองรับ PDF, DOCX, XLSX, JPG, PNG'
                            )}
                          </p>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.html,.txt,.rtf"
                            onChange={handleFileUploadAndConvert}
                            className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-extrabold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                          />
                        </div>

                        {/* Conversion Progress State */}
                        {conversionProgress && (
                          <div className="mt-1.5 p-2 bg-purple-100 dark:bg-purple-950/80 rounded-xl border border-purple-300 flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-[11px] animate-pulse">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                            <span>{conversionProgress}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 text-xs transition-all hover:scale-[1.01]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>บันทึก Template เข้าคลังระบบ</span>
                    </button>
                  </form>
                )}

              </div>

              {/* Bottom Actions for Templates (Visible when in Library list subview) */}
              {templateSubTab === 'LIBRARY' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleBatchPrintTemplates}
                    className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>พิมพ์ ({selectedTemplateIds.length || 'ทั้งหมด'})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePromptDelete('TEMPLATES')}
                    disabled={selectedTemplateIds.length === 0}
                    className={`py-1.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      selectedTemplateIds.length > 0
                        ? 'bg-red-600 text-white shadow-sm hover:bg-red-700'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบ ({selectedTemplateIds.length})</span>
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT PANEL: Live Template Preview */}
          <div className={`md:col-span-7 xl:col-span-8 h-full min-h-0 overflow-hidden flex-col ${
            mobileTab === 'PREVIEW' ? 'flex' : 'hidden md:flex'
          }`}>
            <A4DocumentWorkspace
              htmlContent={currentTemplatePreviewHtml}
              onDoubleClick={() => currentTemplatePreviewHtml && setFullOverlayHtml(currentTemplatePreviewHtml)}
            />
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL VIEWPORT A4 PREVIEW OVERLAY (Double-click triggered, click to close)  */}
      {/* ========================================================================= */}
      {fullOverlayHtml && (
        <div
          onClick={() => setFullOverlayHtml(null)}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden cursor-pointer animate-in fade-in duration-150"
          title="คลิกตรงไหนก็ได้เพื่อปิด"
        >
          <div className="w-full h-full max-w-[96vw] max-h-[96vh] flex items-center justify-center overflow-hidden pointer-events-none">
            <A4FitPreview paddingPx={2} className="h-full w-full">
              <div
                className="p-8 text-slate-900 font-sans text-xs bg-white shadow-2xl"
                dangerouslySetInnerHTML={{ __html: fullOverlayHtml }}
              />
            </A4FitPreview>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DOCUMENT CATEGORY MANAGEMENT MODAL                                       */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCategoryModalOpen(false)
              setEditingCatIndex(null)
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] cursor-default"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-purple-600" />
                <span>จัดการประเภทเอกสาร</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false)
                  setEditingCatIndex(null)
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Category Input */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="ชื่อประเภทเอกสารใหม่..."
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCategory()
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่ม</span>
                </button>
              </div>
            </div>

            {/* Category List */}
            <div className="p-3 flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {docCategories.map((cat, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-2">
                  {editingCatIndex === idx ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <input
                        type="text"
                        value={editingCatValue}
                        onChange={(e) => setEditingCatValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSaveEditCategory()
                          }
                        }}
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-purple-400 bg-white dark:bg-slate-800 font-bold"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveEditCategory}
                        className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        title="บันทึก"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCatIndex(null)}
                        className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                        title="ยกเลิก"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {idx + 1}. {cat}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditCategory(idx, cat)}
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                        >
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(idx)}
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        >
                          ลบ
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false)
                  setEditingCatIndex(null)
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-xs transition-colors"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BATCH DELETE CONFIRMATION MODAL                                          */}
      {/* ========================================================================= */}
      <BatchDeleteModal
        isOpen={deleteModalConfig.isOpen}
        count={deleteModalConfig.ids.length}
        itemTypeLabel={deleteModalConfig.type === 'TEMPLATES' ? 'แบบฟอร์ม Template' : 'เอกสารลูกค้า'}
        onClose={() => setDeleteModalConfig({ isOpen: false, type: 'TEMPLATES', ids: [] })}
        onConfirm={handleConfirmBatchDelete}
      />

    </div>
  )
}
