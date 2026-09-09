'use client'

import React from 'react'

export interface ReturnSlipItem {
  name: string
  returnedQty: number
  normalQty: number
  damagedQty: number
  lostQty: number
  damageFee?: number
  rentalStartDate?: string
  scheduledReturnDate?: string
  actualReturnDate?: string
  actualRentalDays?: number
  overdueDays?: number
  isOverdue?: boolean
  rentalType?: string
}

export interface ReturnSlipPlaceholderProps {
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
  slipNo?: string
  billNo?: string
  returnDate?: string
  items?: ReturnSlipItem[]
  rentalStartDate?: string
  scheduledReturnDate?: string
  actualRentalDays?: number
  lateDays?: number
  lateFeeTotal?: number
  totalDamageFee?: number
  grandTotalCharge?: number
  netAmount?: number
  userCollectedAmount?: number
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  promptPayValue?: string
  qrCodeUrl?: string
  remark?: string
}

export function ReturnSlipPlaceholder({
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
  slipNo = 'RET-2026-0001',
  billNo = 'INV-2026-0001',
  returnDate = new Date().toISOString().split('T')[0],
  items = [],
  rentalStartDate = '-',
  scheduledReturnDate = '-',
  actualRentalDays = 0,
  lateDays = 0,
  lateFeeTotal = 0,
  totalDamageFee = 0,
  grandTotalCharge = 0,
  netAmount = 0,
  userCollectedAmount = 0,
  bankName = 'ธนาคารกสิกรไทย (KBANK)',
  bankAccountName,
  bankAccountNumber = '012-3-45678-9',
  promptPayValue,
  qrCodeUrl,
  remark = '',
}: ReturnSlipPlaceholderProps) {
  const TOTAL_ROWS = 20
  const paddedItems = Array.from({ length: TOTAL_ROWS }, (_, i) => items[i] || null)

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
            ใบรับคืนสินค้า / RETURN SLIP
          </div>
          <p className="whitespace-nowrap text-[10px] font-bold text-slate-800">
            เลขที่เอกสาร: <span className="text-red-700 font-extrabold">{slipNo}</span>
          </p>
          <p className="whitespace-nowrap text-[8.5px] text-slate-600">
            อ้างอิงบิลเช่า: <span className="font-bold text-slate-900">{billNo}</span>
          </p>
          <p className="text-slate-600 text-[8.5px]">วันที่รับคืน: {returnDate}</p>
        </div>
      </div>

      {/* 2. Customer & Rental Details */}
      <div className="mb-2 grid grid-cols-2 gap-3 rounded border border-slate-300 bg-slate-50/80 p-2 text-[9px]">
        <div>
          <h4 className="font-extrabold text-red-800 uppercase mb-0.5 text-[9.5px]">ข้อมูลผู้เช่า / ผู้ส่งคืน:</h4>
          <p className="whitespace-nowrap font-bold text-slate-900 text-[10px]">{customerName}</p>
          {customerAddress && <p className="text-slate-600 truncate">{customerAddress}</p>}
          <p className="text-slate-600">
            โทร: <span className="font-semibold text-slate-800">{customerPhone}</span>
            {customerTaxId && <span> | เลขผู้เสียภาษี: <span className="font-semibold text-slate-800">{customerTaxId}</span></span>}
          </p>
        </div>
        <div>
          <h4 className="font-extrabold text-red-800 uppercase mb-0.5 text-[9.5px]">ระยะเวลาการเช่าและการคืน:</h4>
          <p>เริ่มเช่า: <span className="font-bold text-slate-900">{rentalStartDate}</span> | กำหนดคืน: <span className="font-bold text-slate-900">{scheduledReturnDate}</span></p>
          <p>
            ใช้งานจริง: <span className="font-bold text-slate-900">{actualRentalDays} วัน</span>
            {lateDays > 0 && <span className="text-red-700 font-extrabold ml-1.5">(เกินกำหนด {lateDays} วัน)</span>}
          </p>
        </div>
      </div>

      {/* 3. Returned Items Table (Exactly 20 Rows) */}
      <div className="mb-2 w-full overflow-hidden">
        <table className="w-full table-fixed border-collapse text-[8.5px] leading-tight border border-slate-400">
          <thead>
            <tr className="bg-slate-900 text-white font-extrabold border-b-2 border-red-700">
              <th className="w-[6%] border border-slate-700 px-1 py-1 text-center">ลำดับ</th>
              <th className="w-[42%] border border-slate-700 px-1.5 py-1 text-left">รายการสินค้า</th>
              <th className="w-[10%] border border-slate-700 px-1 py-1 text-center">คืนแล้ว</th>
              <th className="w-[10%] border border-slate-700 px-1 py-1 text-center text-emerald-300">ปกติ</th>
              <th className="w-[10%] border border-slate-700 px-1 py-1 text-center text-amber-300">ชำรุด</th>
              <th className="w-[10%] border border-slate-700 px-1 py-1 text-center text-red-300">หาย</th>
              <th className="w-[12%] border border-slate-700 px-1.5 py-1 text-right">ค่าเสียหาย</th>
            </tr>
          </thead>
          <tbody>
            {paddedItems.map((item, idx) => {
              const rowNum = idx + 1
              if (item) {
                return (
                  <tr key={idx} className="h-[18px] border-b border-slate-300">
                    <td className="border-x border-slate-300 px-1 py-0.5 text-center font-mono text-[8px]">{rowNum}</td>
                    <td className="border-r border-slate-300 px-1.5 py-0.5 truncate font-bold text-slate-900" title={item.name}>
                      {item.name}
                      {item.isOverdue && item.overdueDays && item.overdueDays > 0 ? (
                        <span className="text-red-700 font-normal ml-1 text-[7.5px]">[เกิน {item.overdueDays} วัน]</span>
                      ) : null}
                    </td>
                    <td className="border-r border-slate-300 px-1 py-0.5 text-center font-mono font-bold">{item.returnedQty}</td>
                    <td className="border-r border-slate-300 px-1 py-0.5 text-center font-mono font-bold text-emerald-700">{item.normalQty}</td>
                    <td className="border-r border-slate-300 px-1 py-0.5 text-center font-mono font-bold text-amber-700">{item.damagedQty}</td>
                    <td className="border-r border-slate-300 px-1 py-0.5 text-center font-mono font-bold text-red-700">{item.lostQty}</td>
                    <td className="border-r border-slate-300 px-1.5 py-0.5 text-right font-mono font-bold tabular-nums text-slate-900">
                      ฿{fmt(item.damageFee || 0)}
                    </td>
                  </tr>
                )
              }
              return (
                <tr key={idx} className="h-[18px] border-b border-slate-200 bg-white">
                  <td className="border-x border-slate-300 px-1 py-0.5 text-center font-mono text-slate-300 text-[7.5px]">{rowNum}</td>
                  <td className="border-r border-slate-300 px-1.5 py-0.5">&nbsp;</td>
                  <td className="border-r border-slate-300 px-1 py-0.5">&nbsp;</td>
                  <td className="border-r border-slate-300 px-1 py-0.5">&nbsp;</td>
                  <td className="border-r border-slate-300 px-1.5 py-0.5">&nbsp;</td>
                  <td className="border-r border-slate-300 px-1.5 py-0.5">&nbsp;</td>
                  <td className="border-r border-slate-300 px-1.5 py-0.5">&nbsp;</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Settlement & Bank Summary */}
      <div className="mb-2 grid grid-cols-12 gap-3 items-start">
        {/* Left 7 cols: Terms + Notes */}
        <div className="col-span-7 space-y-1.5">
          <div className="rounded border border-slate-300 bg-slate-50/70 p-2 text-[8px] leading-relaxed text-slate-700">
            <p className="font-extrabold text-red-800 mb-0.5 text-[8.5px]">บันทึกการตรวจสอบสภาพสินค้า:</p>
            <p>1. ตรวจนับจำนวนและทดสอบการใช้งานอุปกรณ์ตามมาตรฐานความปลอดภัยเรียบร้อย</p>
            <p>2. ยอดสรุปเงินมัดจำคงเหลือหลังหักค่าปรับ/ค่าเสียหาย จะโอนคืนภายใน 1-3 วันทำการ</p>
            {remark && <p className="mt-0.5 font-bold text-slate-800">หมายเหตุ: {remark}</p>}
          </div>

          <div className="flex items-center justify-between rounded border border-slate-300 bg-white p-2 text-[8.5px]">
            <div>
              <p className="font-extrabold text-red-800 text-[9px] mb-0.5">ข้อมูลบัญชีเงินโอนคืนมัดจำ / ชำระเพิ่ม:</p>
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
                  Verified
                </div>
              )}
              <span className="text-[7.5px] text-slate-500 font-medium block mt-0.5">ตรวจรับแล้ว</span>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Settlement Summary */}
        <div className="col-span-5 rounded border border-slate-300 bg-slate-50 p-2 text-[8.5px] space-y-0.5">
          <div className="flex justify-between border-b border-slate-200 py-0.5">
            <span className="text-slate-600">ค่าปรับส่งคืนล่าช้า:</span>
            <span className="font-mono font-semibold text-red-700">฿{fmt(lateFeeTotal)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 py-0.5">
            <span className="text-slate-600">ค่าชำรุด / สูญหาย:</span>
            <span className="font-mono font-semibold text-amber-800">฿{fmt(totalDamageFee)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 py-0.5 font-bold">
            <span className="text-slate-900">รวมค่าใช้จ่ายส่วนเพิ่ม:</span>
            <span className="font-mono text-slate-900">฿{fmt(grandTotalCharge)}</span>
          </div>
          <div className="flex justify-between py-0.5 text-slate-700 font-semibold">
            <span>รับชำระแล้วครั้งนี้:</span>
            <span className="font-mono font-bold">฿{fmt(userCollectedAmount)}</span>
          </div>
          <div className="flex justify-between rounded bg-red-700 p-1.5 text-white font-extrabold text-[9.5px] mt-1 shadow-xs">
            <span>{netAmount > 0 ? 'ยอดต้องชำระเพิ่ม:' : 'ยอดคืนเงินมัดจำ:'}</span>
            <span className="font-mono">฿{fmt(Math.abs(netAmount))}</span>
          </div>
        </div>
      </div>

      {/* 5. Signature Zone */}
      <div className="mt-auto grid grid-cols-2 gap-8 border-t border-slate-300 pt-2 text-center text-[8.5px]">
        <div>
          <div className="mx-auto mb-1 h-6 w-40 border-b border-dashed border-slate-400" />
          <p className="font-bold text-slate-900">ลงชื่อ ({customerName})</p>
          <p className="text-slate-500 text-[8px]">ผู้ส่งคืนสินค้า / ลูกค้า</p>
          <p className="text-slate-400 text-[7.5px]">วันที่ _____/_____/_________</p>
        </div>
        <div>
          <div className="mx-auto mb-1 h-6 w-40 border-b border-dashed border-slate-400" />
          <p className="font-bold text-slate-900">ลงชื่อ (เจ้าหน้าที่ตรวจรับสินค้า)</p>
          <p className="text-slate-500 text-[8px]">{businessName}</p>
          <p className="text-slate-400 text-[7.5px]">วันที่ _____/_____/_________</p>
        </div>
      </div>
    </div>
  )
}

