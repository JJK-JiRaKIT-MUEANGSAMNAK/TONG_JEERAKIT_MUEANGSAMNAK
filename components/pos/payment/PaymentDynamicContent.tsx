'use client'

import React from 'react'
import Image from 'next/image'
import { AlertCircle, QrCode, RefreshCw } from 'lucide-react'
import { PaymentMethodType } from './PaymentMethodSelector'
import { NumericInput } from '@/components/common/NumericInput'

interface PaymentDynamicContentProps {
  paymentMethod: PaymentMethodType
  targetAmount: number
  receivedCashInput: string
  onReceivedCashInputChange: (value: string) => void
  changeAmount: number
  bankRef: string
  onBankRefChange: (value: string) => void
  qrCodeUrl?: string
  bankQrUrl?: string
  isQrLoading?: boolean
  qrError?: string | null
  onRetryQr?: () => void
  promptPayId?: string
  unpaidMessage?: React.ReactNode
  className?: string
}

export function PaymentDynamicContent({
  paymentMethod,
  targetAmount,
  receivedCashInput,
  onReceivedCashInputChange,
  changeAmount,
  bankRef,
  onBankRefChange,
  qrCodeUrl,
  bankQrUrl,
  isQrLoading = false,
  qrError,
  onRetryQr,
  promptPayId,
  unpaidMessage,
  className = '',
}: PaymentDynamicContentProps) {
  const displayQr = qrCodeUrl || bankQrUrl
  return (
    <div className={`shrink-0 ${className}`}>
      {paymentMethod === 'CASH' && (
        <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50/80 p-2 dark:border-slate-700 dark:bg-slate-900/50">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
              เงินสดที่รับมา (บาท)
            </label>
            <NumericInput
              value={receivedCashInput}
              onChange={(val) => onReceivedCashInputChange(val === '' ? '' : String(val))}
              min={0}
              placeholder={targetAmount > 0 ? targetAmount.toString() : '0'}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-base font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:text-lg tabular-nums"
            />
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">เงินทอน</span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
              ฿{changeAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {paymentMethod === 'TRANSFER' && (
        <div className="bg-slate-50/80 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-0.5 text-[11px]">
              เลขอ้างอิง / สลิปโอนเงิน
            </label>
            <input
              type="text"
              placeholder="กรอกเลขอ้างอิงธนาคาร..."
              value={bankRef}
              onChange={(e) => onBankRefChange(e.target.value)}
              className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
            />
          </div>
        </div>
      )}

      {paymentMethod === 'QR' && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-purple-200 bg-purple-50/50 p-2 dark:border-purple-900/40 dark:bg-purple-950/30 text-center">
          {qrError ? (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 text-xs space-y-2 w-full">
              <div className="flex items-center justify-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>ไม่สามารถสร้าง QR Payment ได้</span>
              </div>
              <p className="text-[11px] text-red-600 dark:text-red-400">{qrError}</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {onRetryQr && (
                  <button
                    type="button"
                    onClick={onRetryQr}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> ลองใหม่อีกครั้ง
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex aspect-square w-24 h-24 sm:w-28 sm:h-28 max-w-[120px] max-h-[120px] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-sm">
                {isQrLoading ? (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                    <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
                    <span className="text-[10px]">กำลังสร้าง QR...</span>
                  </div>
                ) : displayQr ? (
                  <Image
                    src={displayQr}
                    alt="QR Code"
                    width={120}
                    height={120}
                    unoptimized
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                    <QrCode className="w-6 h-6 text-slate-300 mb-1" />
                    <span>พื้นที่แสดง QR Code</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-semibold whitespace-nowrap">
                {promptPayId ? `PromptPay: ${promptPayId}` : bankQrUrl ? 'QR รับเงินธนาคาร' : 'ยังไม่ได้ตั้งค่าพร้อมเพย์'}
              </span>
            </>
          )}
        </div>
      )}

      {paymentMethod === 'UNPAID' && (
        <div className="bg-amber-50/80 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 leading-snug">
          {unpaidMessage || (
            <>
              ⚠️ บิลนี้จะถูกตั้งเป็น <strong>&quot;ค้างชำระ (Unpaid)&quot;</strong> ยอดคงค้าง ฿{targetAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} จะแสดงในระบบรายงานลูกหนี้
            </>
          )}
        </div>
      )}
    </div>
  )
}
