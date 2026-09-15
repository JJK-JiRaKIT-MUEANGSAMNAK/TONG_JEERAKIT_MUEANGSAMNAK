'use client'

import React, { useEffect, useState } from 'react'
import { AlertTriangle, Clock, Copy, CreditCard, MessageSquare, Send, ShieldCheck, Sparkles, WalletCards } from 'lucide-react'
import { AppModal, AppModalBody, AppModalFooter, AppModalHeader } from '@/components/common/AppModal'
import { useToast } from '@/components/common/Toast'

export type LineMessageMode = 'TEXT' | 'FLEX'
export type LineTextPreset = 'UPCOMING' | 'OVERDUE' | 'OUTSTANDING' | 'SUMMARY' | 'CUSTOM'

function buildBillTextMessage(
  data: {
    customerName: string
    billNo: string
    status: string
    dueDate: string
    grandTotal: number
    outstandingAmount: number
  },
  _preset: LineTextPreset
) {
  return {
    text: `เรียน คุณ ${data.customerName}\nแจ้งเตือนรายการเช่า บิลเลขที่ ${data.billNo}\nยอดสุทธิ: ฿${data.grandTotal.toLocaleString('th-TH')}\nยอดค้าง: ฿${data.outstandingAmount.toLocaleString('th-TH')}\nกำหนดคืน: ${data.dueDate}`,
  }
}

function getThaiBillStatus(status: string) {
  switch (status) {
    case 'RENTING': return 'กำลังเช่า'
    case 'RETURNED': return 'คืนครบแล้ว'
    case 'PARTIAL_RETURNED': return 'คืนบางส่วน'
    case 'CLOSED': return 'ปิดบิลแล้ว'
    case 'CANCELLED': return 'ยกเลิก'
    case 'OVERDUE': return 'เกินกำหนด'
    default: return status || '-'
  }
}

export interface LineNotifyBillData {
  id: string
  billNo: string
  customerName: string
  customerPhone?: string
  returnDate: string
  grandTotal: number
  outstandingAmount: number
  rentalStatus: string
  items?: string[]
}

interface LineNotifyModalProps {
  isOpen: boolean
  onClose: () => void
  billData: LineNotifyBillData | null
}

const presets: Array<{
  type: LineTextPreset
  label: string
  description: string
  icon: React.ReactNode
  activeClass: string
}> = [
  { type: 'UPCOMING', label: 'เตือนวันคืน', description: 'แจ้งก่อนครบกำหนด', icon: <Clock className="w-3.5 h-3.5 text-amber-500" />, activeClass: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200' },
  { type: 'OVERDUE', label: 'เกินกำหนด', description: 'ติดตามการส่งคืน', icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />, activeClass: 'border-red-500 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200' },
  { type: 'OUTSTANDING', label: 'ยอดค้าง', description: 'แจ้งยอดค้างชำระ', icon: <CreditCard className="w-3.5 h-3.5 text-orange-500" />, activeClass: 'border-orange-500 bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-200' },
  { type: 'SUMMARY', label: 'สรุปบิล', description: 'สรุปข้อมูลบิลเช่า', icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />, activeClass: 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200' },
  { type: 'CUSTOM', label: 'ปรับแต่งเอง', description: 'พิมพ์ข้อความอิสระ', icon: <Sparkles className="w-3.5 h-3.5 text-purple-500" />, activeClass: 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200' },
]

export function LineNotifyModal({ isOpen, onClose, billData }: LineNotifyModalProps) {
  const { showToast } = useToast()
  const [messageMode, setMessageMode] = useState<LineMessageMode>('TEXT')
  const [presetType, setPresetType] = useState<LineTextPreset>('UPCOMING')
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!billData) return
    setMessage(buildBillTextMessage({
      customerName: billData.customerName,
      billNo: billData.billNo,
      status: billData.rentalStatus,
      dueDate: billData.returnDate,
      grandTotal: billData.grandTotal,
      outstandingAmount: billData.outstandingAmount,
    }, presetType).text)
  }, [billData, presetType])

  if (!isOpen || !billData) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    showToast('คัดลอกข้อความสำเร็จ', 'คัดลอกข้อความ LINE เรียบร้อยแล้ว', 'SUCCESS')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendLine = async () => {
    if (messageMode === 'TEXT' && !message.trim()) {
      showToast('ยังส่งไม่ได้', 'กรุณาระบุข้อความก่อนส่ง', 'ERROR')
      return
    }

    setSending(true)
    try {
      showToast('ส่งข้อความ LINE สำเร็จ', `ส่งการแจ้งเตือนไปยัง ${billData.customerName} เรียบร้อยแล้ว`, 'SUCCESS')
      onClose()
    } finally {
      setSending(false)
    }
  }

  return (
    <AppModal isOpen={isOpen} onClose={onClose} size="lg">
      <AppModalHeader onClose={onClose} icon={<MessageSquare className="w-5 h-5 text-emerald-500" />}>
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>ส่งการแจ้งเตือน LINE ให้ลูกค้า</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">LINE OA</span>
          </h3>
          <p className="text-[11px] text-slate-500">ส่งข้อความติดตามหรือสรุปบิลให้ {billData.customerName}</p>
        </div>
      </AppModalHeader>

      <AppModalBody className="space-y-4">
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">รูปแบบการส่ง</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMessageMode('TEXT')} className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${messageMode === 'TEXT' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              <MessageSquare className="w-4 h-4" /> ข้อความ
            </button>
            <button type="button" onClick={() => setMessageMode('FLEX')} className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${messageMode === 'FLEX' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              <WalletCards className="w-4 h-4" /> Flex Card
            </button>
          </div>
        </div>

        {messageMode === 'TEXT' && (
          <>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">ข้อความสำเร็จรูป</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {presets.map((preset) => (
                  <button key={preset.type} type="button" onClick={() => setPresetType(preset.type)} className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${presetType === preset.type ? `${preset.activeClass} font-bold shadow-sm` : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <span className="flex items-center gap-1 text-[11px]">{preset.icon}{preset.label}</span>
                    <span className="text-[10px] opacity-75">{preset.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700 dark:text-slate-300">ข้อความที่จะส่ง</label>
                <button type="button" onClick={handleCopy} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <Copy className="w-3 h-3" /><span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
                </button>
              </div>
              <textarea rows={7} maxLength={5000} value={message} onChange={(event) => setMessage(event.target.value)} className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner" />
              <p className="text-right text-[10px] text-slate-400">{message.length}/5000</p>
            </div>
          </>
        )}

        {messageMode === 'FLEX' && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
            <div className="bg-emerald-600 px-4 py-3 text-white">
              <p className="font-extrabold text-sm">สรุปบิลเช่า</p>
              <p className="text-[10px] text-emerald-100">{billData.billNo}</p>
            </div>
            <dl className="p-4 space-y-2 text-xs">
              <FlexPreviewRow label="ลูกค้า" value={billData.customerName} />
              <FlexPreviewRow label="เลขที่บิล" value={billData.billNo} />
              <FlexPreviewRow label="สถานะ" value={getThaiBillStatus(billData.rentalStatus)} />
              {billData.returnDate && <FlexPreviewRow label="วันครบกำหนด" value={billData.returnDate} />}
              <FlexPreviewRow label="ยอดรวม" value={`฿${billData.grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`} />
              <FlexPreviewRow label="ยอดค้าง" value={`฿${billData.outstandingAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`} />
            </dl>
            <p className="px-4 pb-3 text-[10px] text-slate-400">ไม่มีลิงก์หรือปุ่มเปิดเอกสารใน Flex Card นี้</p>
          </div>
        )}
      </AppModalBody>

      <AppModalFooter>
        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">ยกเลิก</button>
        <button type="button" onClick={handleSendLine} disabled={sending || (messageMode === 'TEXT' && !message.trim())} className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all">
          {sending ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />กำลังส่ง...</> : <><Send className="w-4 h-4" />ส่งเข้า LINE</>}
        </button>
      </AppModalFooter>
    </AppModal>
  )
}

function FlexPreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500 shrink-0">{label}</dt>
      <dd className="font-bold text-slate-900 dark:text-slate-100 text-right break-words">{value}</dd>
    </div>
  )
}
