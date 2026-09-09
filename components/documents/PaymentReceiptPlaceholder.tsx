'use client'

import React from 'react'

export interface PaymentReceiptItem {
  name: string
  code?: string
  description?: string
  amount: number
  paymentMethod?: string
}

export interface PaymentReceiptPlaceholderProps {
  businessName?: string
  businessAddress?: string
  businessTaxId?: string
  businessPhone?: string
  businessEmail?: string
  businessServices?: string
  logoDataUrl?: string
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  customerTaxId?: string
  receiptNo?: string
  billNo?: string
  paymentDate?: string
  amount?: number
  paymentChannel?: string
  outstandingRemaining?: number
  originalBillTotal?: number
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  promptPayValue?: string
  qrCodeUrl?: string
  note?: string
  items?: PaymentReceiptItem[]
}

export function PaymentReceiptPlaceholder({
  businessName = 'บริษัท อุปกรณ์เช่ามาตรฐาน จำกัด',
  businessAddress = '99/9 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
  businessTaxId = '0105567012345',
  businessPhone = '02-123-4567, 081-234-5678',
  businessEmail,
  businessServices = 'บริการให้เช่าอุปกรณ์จัดงาน อีเวนต์ นั่งร้าน เครื่องมือก่อสร้าง และเครื่องจักรคุณภาพสูง ครบวงจร',
  logoDataUrl,
  customerName = 'ลูกค้าทั่วไป',
  customerPhone = '-',
  customerAddress,
  customerTaxId,
  receiptNo = 'RC-2026-0001',
  billNo = 'INV-2026-0001',
  paymentDate = new Date().toISOString().split('T')[0],
  amount = 0,
  paymentChannel = 'CASH',
  outstandingRemaining = 0,
  originalBillTotal = 0,
  bankName = 'ธนาคารกสิกรไทย (KBANK)',
  bankAccountName,
  bankAccountNumber = '012-3-45678-9',
  promptPayValue,
  qrCodeUrl,
  note = 'รับชำระเงินค่าเช่า / ค่าบริการตามบิลสัญญาเช่า',
  items = [],
}: PaymentReceiptPlaceholderProps) {
  const channelLabels: Record<string, string> = {
    CASH: 'เงินสด (Cash)',
    TRANSFER: 'โอนเงินผ่านธนาคาร (Bank Transfer)',
    QR: 'สแกน QR Code (PromptPay)',
    UNPAID: 'ยังไม่ชำระ (Unpaid)',
    CHEQUE: 'เช็คธนาคาร (Cheque)',
  }

  const TOTAL_ROWS = 20
  const effectiveItems =
    items.length > 0
      ? items
      : [
          {
            name: `รับชำระค่าบริการเช่าตามบิล ${billNo}`,
            code: billNo,
            description: note,
            amount: amount,
            paymentMethod: channelLabels[paymentChannel] || paymentChannel,
          },
        ]

  const paddedItems = Array.from({ length: TOTAL_ROWS }, (_, i) => effectiveItems[i] || null)

  const fmt = (val?: number | null) =>
    (typeof val === 'number' && !isNaN(val) ? val : 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  return (
    <div className="box-border flex h-full w-full flex-col justify-between overflow-hidden bg-white px-[10mm] py-[8mm] font-sans text-[9.5px] leading-[1.3] text-slate-900">
      {/* 1. Header Info */}
      <div className="mb-2 flex items-start justify-between gap-3 border-b-2 border-red-700 pb-2.5">
        <div className="flex items-start gap-2.5">
          {logoDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logoDataUrl} alt="Logo" className="h-12 max-w-[75px] object-contain rounded shrink-0" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-700 text-white font-black text-xs shrink-0 shadow-xs">
              LOGO
            </div>
          )}
          <div>
            <h1 className="whitespace-nowrap text-[16px] font-black uppercase tracking-tight text-slate-900">
              {businessName}
            </h1>
            <p className="text-slate-600 text-[8.5px] mt-0.5 max-w-md leading-tight">{businessAddress}</p>
            <p className="text-slate-600 text-[8.5px]">
              เลขผู้เสียภาษี: <span className="font-semibold text-slate-900">{businessTaxId}</span> | โทร: <span className="font-semibold text-slate-900">{businessPhone}</span>
              {businessEmail && ` | อีเมล: ${businessEmail}`}
            </p>
            <p className="text-red-800 font-medium text-[8px] mt-0.5">{businessServices}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="mb-1 inline-block whitespace-nowrap rounded bg-red-700 px-3 py-1 font-black text-[10.5px] uppercase tracking-wider text-white shadow-xs">
            ใบเสร็จรับเงิน / RECEIPT
          </div>
          <p className="whitespace-nowrap text-[10px] font-bold text-slate-800">
            เลขที่ใบเสร็จ: <span className="text-red-700 font-extrabold">{receiptNo}</span>
          </p>
          <p className="whitespace-nowrap text-[8.5px] text-slate-600">
            อ้างอิงบิลเช่า: <span className="font-bold text-slate-900">{billNo}</span>
          </p>
          <p className="text-slate-600 text-[8.5px]">วันที่รับชำระ: {paymentDate}</p>
        </div>
      </div>

      {/* 2. Customer Info */}
      <div className="mb-2 rounded border border-slate-300 bg-slate-50/80 p-2 text-[9px]">
        <h4 className="font-extrabold text-red-800 uppercase mb-0.5 text-[9.5px]">ได้รับเงินจาก (Received From):</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="font-bold text-slate-900 text-[10px]">{customerName}</p>
            {customerAddress && <p className="text-slate-600 truncate">{customerAddress}</p>}
          </div>
          <div>
            <p className="text-slate-600">โทรศัพท์: <span className="font-semibold text-slate-900">{customerPhone}</span></p>
            {customerTaxId && <p className="text-slate-600">เลขผู้เสียภาษี: <span className="font-semibold text-slate-900">{customerTaxId}</span></p>}
          </div>
        </div>
      </div>

      {/* 3. Payment Details Table (Exactly 20 Rows) */}
      <div className="mb-2 w-full overflow-hidden">
        <table className="w-full table-fixed border-collapse text-[8.5px] leading-tight border border-slate-400">
          <thead>
            <tr className="bg-slate-900 text-white font-extrabold border-b-2 border-red-700">
              <th className="w-[6%] border border-slate-700 px-1 py-1 text-center">ลำดับ</th>
              <th className="w-[50%] border border-slate-700 px-1.5 py-1 text-left">รายการชำระ / รายละเอียด</th>
              <th className="w-[22%] border border-slate-700 px-1.5 py-1 text-center">ช่องทางชำระเงิน</th>
              <th className="w-[22%] border border-slate-700 px-1.5 py-1 text-right">จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {paddedItems.map((item, idx) => {
              const rowNum = idx + 1
              if (item) {
                return (
                  <tr key={idx} className="h-[18px] border-b border-slate-300">
                    <td className="border-x border-slate-300 px-1 py-0.5 text-center font-mono text-[8px]">{rowNum}</td>
                    <td className="border-r border-slate-300 px-1.5 py-0.5 font-bold truncate text-slate-900">
                      {item.name}
                      {item.description && item.description !== item.name && (
                        <span className="font-normal text-slate-500 ml-1 text-[7.5px]">({item.description})</span>
                      )}
                    </td>
                    <td className="border-r border-slate-300 px-1.5 py-0.5 text-center text-slate-700">
                      {item.paymentMethod || channelLabels[paymentChannel] || paymentChannel}
                    </td>
                    <td className="border-r border-slate-300 px-1.5 py-0.5 text-right font-mono font-extrabold tabular-nums text-slate-900">
                      ฿{fmt(item.amount)}
                    </td>
                  </tr>
                )
              }
              return (
                <tr key={idx} className="h-[18px] border-b border-slate-200 bg-white">
                  <td className="border-x border-slate-300 px-1 py-0.5 text-center font-mono text-slate-300 text-[7.5px]">{rowNum}</td>
                  <td className="border-r border-slate-300 px-1.5 py-0.5">&nbsp;</td>
                  <td className="border-r border-slate-300 px-1.5 py-0.5">&nbsp;</td>
                  <td className="border-r border-slate-300 px-1.5 py-0.5">&nbsp;</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Payment Summary & Bank/QR Area */}
      <div className="mb-2 grid grid-cols-12 gap-3 items-start">
        {/* Left 7 cols: Notes + Bank details */}
        <div className="col-span-7 space-y-1.5">
          <div className="rounded border border-slate-300 bg-slate-50/70 p-2 text-[8px] leading-relaxed text-slate-700">
            <p className="font-extrabold text-red-800 mb-0.5 text-[8.5px]">หมายเหตุและเงื่อนไขการรับเงิน:</p>
            <p>1. ใบเสร็จรับเงินนี้จะสมบูรณ์เมื่อบริษัทได้รับชำระเงินหรือเช็คผ่านการเคลียริ่งเรียบร้อยแล้ว</p>
            <p>2. เอกสารนี้ออกโดยระบบอัตโนมัติ มีผลสมบูรณ์ตามกฎหมาย</p>
            {note && <p className="mt-0.5 font-bold text-slate-800">บันทึก: {note}</p>}
          </div>

          <div className="flex items-center justify-between rounded border border-slate-300 bg-white p-2 text-[8.5px]">
            <div>
              <p className="font-extrabold text-red-800 text-[9px] mb-0.5">บัญชีผู้รับเงิน / บริษัท:</p>
              <p><span className="font-bold">ธนาคาร:</span> {bankName}</p>
              <p><span className="font-bold">ชื่อบัญชี:</span> {bankAccountName || businessName}</p>
              <p><span className="font-bold">เลขที่บัญชี:</span> <span className="font-mono font-bold text-slate-900">{bankAccountNumber}</span></p>
              {promptPayValue && <p><span className="font-bold">พร้อมเพย์:</span> <span className="font-mono">{promptPayValue}</span></p>}
            </div>

            <div className="text-center shrink-0 pl-2">
              {qrCodeUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={qrCodeUrl} alt="QR" className="h-12 w-12 object-contain mx-auto rounded border border-slate-200" />
              ) : (
                <div className="h-12 w-12 border border-dashed border-red-700 bg-red-50 flex items-center justify-center text-[7px] text-red-700 font-bold rounded">
                  Paid
                </div>
              )}
              <span className="text-[7.5px] text-slate-500 font-medium block mt-0.5">รับชำระแล้ว</span>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Financial Summary */}
        <div className="col-span-5 rounded border border-slate-300 bg-slate-50 p-2 text-[8.5px] space-y-0.5">
          <div className="flex justify-between border-b border-slate-200 py-0.5">
            <span className="text-slate-600">มูลค่าบิลรวมทั้งสิ้น:</span>
            <span className="font-mono font-bold">฿{fmt(originalBillTotal || amount)}</span>
          </div>
          <div className="flex justify-between rounded bg-red-700 p-1.5 text-white font-extrabold text-[9.5px] mt-1 shadow-xs">
            <span>ยอดรับชำระครั้งนี้:</span>
            <span className="font-mono">฿{fmt(amount)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 py-0.5 text-slate-700 font-semibold pt-1">
            <span>ช่องทางชำระ:</span>
            <span className="font-bold text-slate-900">{channelLabels[paymentChannel] || paymentChannel}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 py-0.5 font-bold">
            <span className="text-slate-700">ยอดคงค้างคงเหลือ:</span>
            <span className={outstandingRemaining > 0 ? 'font-mono text-red-700 font-extrabold' : 'font-mono text-emerald-700'}>
              ฿{fmt(outstandingRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Signature Zone */}
      <div className="mt-auto grid grid-cols-2 gap-8 border-t border-slate-300 pt-2 text-center text-[8.5px]">
        <div>
          <div className="mx-auto mb-1 h-6 w-40 border-b border-dashed border-slate-400" />
          <p className="font-bold text-slate-900">ลงชื่อ ({customerName})</p>
          <p className="text-slate-500 text-[8px]">ผู้ชำระเงิน / ลูกค้า</p>
          <p className="text-slate-400 text-[7.5px]">วันที่ _____/_____/_________</p>
        </div>
        <div>
          <div className="mx-auto mb-1 h-6 w-40 border-b border-dashed border-slate-400" />
          <p className="font-bold text-slate-900">ลงชื่อ (เจ้าหน้าที่การเงิน / ผู้รับเงิน)</p>
          <p className="text-slate-500 text-[8px]">{businessName}</p>
          <p className="text-slate-400 text-[7.5px]">วันที่ _____/_____/_________</p>
        </div>
      </div>
    </div>
  )
}

