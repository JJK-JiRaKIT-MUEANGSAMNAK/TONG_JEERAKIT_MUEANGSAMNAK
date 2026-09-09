'use client'

import React from 'react'

export interface BillTemplateData {
  documentTitle?: string
  businessName: string
  businessAddress: string
  businessTaxId: string
  businessPhone: string
  businessEmail?: string
  businessLineId?: string
  businessServices?: string
  logoDataUrl?: string
  showLogo?: boolean
  authorizedPerson?: string
  showAuthorizedPerson?: boolean
  showQRCode?: boolean
  qrCodeUrl?: string
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  promptPayValue?: string
  footerText?: string
  customerName: string
  customerAddress?: string
  customerPhone?: string
  customerTaxId?: string
  billNo: string
  billDate: string
  headerRentalDate?: string
  headerReturnDate?: string
  siteName?: string
  items: Array<{
    code?: string
    name: string
    quantity: number
    unit: string
    price: number
    rentalType: 'NORMAL' | 'DAILY' | 'SALE'
    usageCount?: number
    billableDays?: number
    dailyStartDate?: string
    dailyEndDate?: string
    lineTotal: number
  }>
  subtotal: number
  discount: number
  shippingFee: number
  taxAmount: number
  depositAmount: number
  grandTotal: number
  paidAmount: number
  outstandingAmount: number
  remark?: string
}

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

export function formatThaiShortDate(dateStr?: string): string {
  if (!dateStr) return ''
  const dateObj = new Date(dateStr)
  if (isNaN(dateObj.getTime())) return dateStr

  const day = dateObj.getDate()
  const monthIdx = dateObj.getMonth()
  const yearShort = (dateObj.getFullYear() + 543).toString().slice(-2)

  return `${day} ${THAI_MONTHS_SHORT[monthIdx]} ${yearShort}`
}

export function RentalBillTemplate({ data }: { data: BillTemplateData }) {
  const TOTAL_ROWS = 20
  const items = data.items || []
  const paddedItems = Array.from({ length: TOTAL_ROWS }, (_, i) => items[i] || null)

  const fmt = (val?: number | null) =>
    (typeof val === 'number' && !isNaN(val) ? val : 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const servicesDesc =
    data.businessServices ||
    'บริการให้เช่าอุปกรณ์จัดงาน อีเวนต์ นั่งร้าน เครื่องมือก่อสร้าง และเครื่องจักรคุณภาพสูง ครบวงจร'

  return (
    <div className="box-border flex h-full w-full flex-col justify-between overflow-hidden bg-white px-[10mm] py-[8mm] font-sans text-[9.5px] leading-[1.3] text-slate-900">
      {/* 1. Header Info */}
      <div className="mb-2 flex items-start justify-between gap-3 border-b-2 border-red-700 pb-2.5">
        <div className="flex items-start gap-2.5">
          {data.showLogo !== false && data.logoDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={data.logoDataUrl}
              alt="Logo"
              className="h-12 max-w-[75px] object-contain rounded shrink-0"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-700 text-white font-black text-xs shrink-0 shadow-xs">
              LOGO
            </div>
          )}
          <div>
            <h1 className="whitespace-nowrap text-[16px] font-black uppercase tracking-tight text-slate-900">
              {data.businessName || 'บริษัท อุปกรณ์เช่ามาตรฐาน จำกัด'}
            </h1>
            <p className="text-slate-600 text-[8.5px] mt-0.5 max-w-md leading-tight">
              {data.businessAddress || '99/9 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110'}
            </p>
            <p className="text-slate-600 text-[8.5px]">
              เลขผู้เสียภาษี: <span className="font-semibold text-slate-900">{data.businessTaxId || '-'}</span> | โทร: <span className="font-semibold text-slate-900">{data.businessPhone || '-'}</span>
              {data.businessEmail && ` | อีเมล: ${data.businessEmail}`}
            </p>
            <p className="text-red-800 font-medium text-[8px] mt-0.5">{servicesDesc}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="mb-1 inline-block whitespace-nowrap rounded bg-red-700 px-3 py-1 font-black text-[10.5px] uppercase tracking-wider text-white shadow-xs">
            {data.documentTitle || 'ใบแจ้งหนี้ / บิลเช่าสินค้า'}
          </div>
          <p className="whitespace-nowrap text-[10px] font-bold text-slate-800">
            เลขที่เอกสาร: <span className="text-red-700 font-extrabold">{data.billNo}</span>
          </p>
          <p className="text-slate-600 text-[8.5px]">
            วันที่ออกเอกสาร: {formatThaiShortDate(data.billDate) || data.billDate}
          </p>
        </div>
      </div>

      {/* 2. Customer & Rental Details */}
      <div className="mb-2 grid grid-cols-2 gap-3 rounded border border-slate-300 bg-slate-50/80 p-2 text-[9px]">
        <div>
          <h4 className="font-extrabold text-red-800 uppercase mb-0.5 text-[9.5px]">ข้อมูลผู้เช่า / ลูกค้า:</h4>
          <p className="whitespace-nowrap font-bold text-slate-900 text-[10px]">{data.customerName || 'ลูกค้าทั่วไป'}</p>
          {data.customerAddress && <p className="text-slate-600 truncate">{data.customerAddress}</p>}
          <p className="text-slate-600">
            โทร: <span className="font-semibold text-slate-800">{data.customerPhone || '-'}</span>
            {data.customerTaxId && (
              <span> | เลขผู้เสียภาษี: <span className="font-semibold text-slate-800">{data.customerTaxId}</span></span>
            )}
          </p>
        </div>
        <div>
          <h4 className="font-extrabold text-red-800 uppercase mb-0.5 text-[9.5px]">กำหนดการเช่าสินค้า:</h4>
          <p>วันเริ่มเช่า: <span className="font-bold text-slate-900">{formatThaiShortDate(data.headerRentalDate) || '-'}</span> | กำหนดคืน: <span className="font-bold text-slate-900">{formatThaiShortDate(data.headerReturnDate) || '-'}</span></p>
          {data.siteName && <p className="truncate">สถานที่ใช้งาน/หน้างาน: <span className="font-semibold text-slate-800">{data.siteName}</span></p>}
        </div>
      </div>

      {/* 3. Items Table (Exactly 20 Rows) */}
      <div className="mb-2 w-full overflow-hidden">
        <table className="w-full table-fixed border-collapse text-[8.5px] leading-tight border border-slate-400">
          <thead>
            <tr className="bg-slate-900 text-white font-extrabold border-b-2 border-red-700">
              <th className="w-[6%] border border-slate-700 px-1 py-1 text-center">ลำดับ</th>
              <th className="w-[34%] border border-slate-700 px-1.5 py-1 text-left">รายการสินค้า / รายละเอียด</th>
              <th className="w-[8%] border border-slate-700 px-1 py-1 text-center">จำนวน</th>
              <th className="w-[8%] border border-slate-700 px-1 py-1 text-center">หน่วย</th>
              <th className="w-[14%] border border-slate-700 px-1.5 py-1 text-right">ราคา/หน่วย</th>
              <th className="w-[12%] border border-slate-700 px-1 py-1 text-center">การเช่า</th>
              <th className="w-[18%] border border-slate-700 px-1.5 py-1 text-right">รวมเงิน (บาท)</th>
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
                      {item.rentalType === 'DAILY' && (item.dailyStartDate || item.dailyEndDate) && (
                        <span className="font-normal text-slate-500 ml-1 text-[7.5px]">
                          ({formatThaiShortDate(item.dailyStartDate)}–{formatThaiShortDate(item.dailyEndDate)})
                        </span>
                      )}
                    </td>
                    <td className="border-r border-slate-300 px-1 py-0.5 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="border-r border-slate-300 px-1 py-0.5 text-center">{item.unit}</td>
                    <td className="border-r border-slate-300 px-1 py-0.5 text-right font-mono tabular-nums">฿{fmt(item.price)}</td>
                    <td className="border-r border-slate-300 px-1 py-0.5 text-center font-medium">
                      {item.rentalType === 'DAILY' ? `${item.billableDays || 1} วัน` : item.rentalType === 'SALE' ? 'ขาย' : `${item.usageCount || 1} รอบ`}
                    </td>
                    <td className="border-r border-slate-300 px-1.5 py-0.5 text-right font-mono font-extrabold tabular-nums text-slate-900">
                      ฿{fmt(item.lineTotal)}
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

      {/* 4. Financial & Conditions Summary */}
      <div className="mb-2 grid grid-cols-12 gap-3 items-start">
        {/* Left 7 cols: Terms + Bank Account + QR Code */}
        <div className="col-span-7 space-y-1.5">
          {/* Warning / Terms */}
          <div className="rounded border border-slate-300 bg-slate-50/70 p-2 text-[8px] leading-relaxed text-slate-700">
            <p className="font-extrabold text-red-800 mb-0.5 text-[8.5px]">ข้อกำหนดและเงื่อนไขการเช่า:</p>
            <p>1. สินค้าที่ส่งคืนเกินกำหนดเวลา คิดค่าเช่าเพิ่มตามอัตราจริงรายวัน/รายรอบ</p>
            <p>2. กรณีสินค้าชำรุด สูญหาย หรือใช้งานผิดวิธี ผู้เช่ายินยอมชดใช้ค่าเสียหายเต็มจำนวน</p>
            <p>3. เงินมัดจำประกันจะคืนให้ภายใน 1-3 วันทำการ หลังตรวจสอบสภาพสินค้าเรียบร้อย</p>
            {data.remark && <p className="mt-0.5 font-bold text-slate-800">หมายเหตุ: {data.remark}</p>}
          </div>

          {/* Bank Info + QR */}
          <div className="flex items-center justify-between rounded border border-slate-300 bg-white p-2 text-[8.5px]">
            <div>
              <p className="font-extrabold text-red-800 text-[9px] mb-0.5">ข้อมูลการชำระเงินผ่านธนาคาร:</p>
              <p><span className="font-bold">ธนาคาร:</span> {data.bankName || 'ธนาคารกสิกรไทย (KBANK)'}</p>
              <p><span className="font-bold">ชื่อบัญชี:</span> {data.bankAccountName || data.businessName}</p>
              <p><span className="font-bold">เลขที่บัญชี:</span> <span className="font-mono font-bold text-slate-900">{data.bankAccountNumber || '012-3-45678-9'}</span></p>
              {data.promptPayValue && <p><span className="font-bold">พร้อมเพย์:</span> <span className="font-mono">{data.promptPayValue}</span></p>}
            </div>

            {data.showQRCode !== false && (
              <div className="text-center shrink-0 pl-2">
                {data.qrCodeUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={data.qrCodeUrl} alt="QR Code" className="h-12 w-12 object-contain mx-auto rounded border border-slate-200" />
                ) : (
                  <div className="h-12 w-12 border border-dashed border-red-700 bg-red-50 flex items-center justify-center text-[7px] text-red-700 font-bold rounded">
                    QR Pay
                  </div>
                )}
                <span className="text-[7.5px] text-slate-500 font-medium block mt-0.5">สแกนชำระเงิน</span>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 cols: Financial Breakdown */}
        <div className="col-span-5 rounded border border-slate-300 bg-slate-50 p-2 text-[8.5px] space-y-0.5">
          <div className="flex justify-between border-b border-slate-200 py-0.5">
            <span className="text-slate-600">มูลค่ารวมก่อนส่วนลด:</span>
            <span className="font-mono font-bold">฿{fmt(data.subtotal)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between border-b border-slate-200 py-0.5 text-emerald-700 font-bold">
              <span>ส่วนลด:</span>
              <span className="font-mono">-฿{fmt(data.discount)}</span>
            </div>
          )}
          {data.shippingFee > 0 && (
            <div className="flex justify-between border-b border-slate-200 py-0.5 text-slate-700">
              <span>ค่าจัดส่ง / บริการ:</span>
              <span className="font-mono font-semibold">+฿{fmt(data.shippingFee)}</span>
            </div>
          )}
          {data.taxAmount > 0 && (
            <div className="flex justify-between border-b border-slate-200 py-0.5 text-slate-700">
              <span>ภาษีมูลค่าเพิ่ม (7%):</span>
              <span className="font-mono font-semibold">+฿{fmt(data.taxAmount)}</span>
            </div>
          )}
          {data.depositAmount > 0 && (
            <div className="flex justify-between border-b border-slate-200 py-0.5 text-amber-800 font-bold">
              <span>เงินมัดจำประกัน:</span>
              <span className="font-mono">฿{fmt(data.depositAmount)}</span>
            </div>
          )}
          <div className="flex justify-between rounded bg-red-700 p-1.5 text-white font-extrabold text-[9.5px] mt-1 shadow-xs">
            <span>ยอดสุทธิรวมทั้งสิ้น:</span>
            <span className="font-mono">฿{fmt(data.grandTotal)}</span>
          </div>
          <div className="flex justify-between py-0.5 text-slate-700 font-semibold pt-1">
            <span>ชำระแล้ว:</span>
            <span className="font-mono text-emerald-700 font-bold">฿{fmt(data.paidAmount)}</span>
          </div>
          {(data.outstandingAmount || 0) > 0 && (
            <div className="flex justify-between border-t border-slate-200 py-0.5 text-red-700 font-black">
              <span>ยอดคงค้างชำระ:</span>
              <span className="font-mono">฿{fmt(data.outstandingAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Signature Zone */}
      <div className="mt-auto grid grid-cols-2 gap-8 border-t border-slate-300 pt-2 text-center text-[8.5px]">
        <div>
          <div className="mx-auto mb-1 h-6 w-40 border-b border-dashed border-slate-400" />
          <p className="font-bold text-slate-900">ลงชื่อ ({data.customerName || 'ผู้เช่า / ผู้รับมอบสินค้า'})</p>
          <p className="text-slate-500 text-[8px]">ผู้เช่า / ผู้ตรวจรับมอบอุปกรณ์</p>
          <p className="text-slate-400 text-[7.5px]">วันที่ _____/_____/_________</p>
        </div>
        <div>
          <div className="mx-auto mb-1 h-6 w-40 border-b border-dashed border-slate-400" />
          <p className="font-bold text-slate-900">
            ลงชื่อ ({data.showAuthorizedPerson !== false && data.authorizedPerson ? data.authorizedPerson : 'ผู้มีอำนาจลงนาม'})
          </p>
          <p className="text-slate-500 text-[8px]">{data.businessName || 'ผู้ให้เช่า / ผู้ออกเอกสาร'}</p>
          <p className="text-slate-400 text-[7.5px]">วันที่ _____/_____/_________</p>
        </div>
      </div>
    </div>
  )
}
