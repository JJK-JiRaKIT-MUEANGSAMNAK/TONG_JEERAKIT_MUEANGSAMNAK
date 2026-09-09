'use client'

import React, { useEffect, useMemo } from 'react'
import { Banknote, CreditCard, QrCode, ShieldAlert } from 'lucide-react'

export type PaymentMethodType = 'CASH' | 'TRANSFER' | 'QR' | 'UNPAID'

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType
  onSelectMethod: (method: PaymentMethodType) => void
  disabled?: boolean
  className?: string
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  disabled = false,
  className = '',
}: PaymentMethodSelectorProps) {
  const methods = {
    cash: true,
    bankTransfer: true,
    promptPay: true,
    credit: true,
  }

  const enabledList = useMemo(() => {
    const list: { key: PaymentMethodType; label: string; icon: React.ReactNode; activeClass: string }[] = []
    if (methods.cash) {
      list.push({
        key: 'CASH',
        label: 'เงินสด',
        icon: <Banknote className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-600 shrink-0" />,
        activeClass: 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm',
      })
    }
    if (methods.bankTransfer) {
      list.push({
        key: 'TRANSFER',
        label: 'โอนเงินธนาคาร',
        icon: <CreditCard className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600 shrink-0" />,
        activeClass: 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm',
      })
    }
    if (methods.promptPay) {
      list.push({
        key: 'QR',
        label: 'PromptPay QR',
        icon: <QrCode className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-purple-600 shrink-0" />,
        activeClass: 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm',
      })
    }
    if (methods.credit) {
      list.push({
        key: 'UNPAID',
        label: 'ค้างชำระ (เครดิต)',
        icon: <ShieldAlert className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 shrink-0" />,
        activeClass: 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-sm',
      })
    }
    return list
  }, [methods.cash, methods.bankTransfer, methods.promptPay, methods.credit])

  useEffect(() => {
    if (enabledList.length > 0 && !enabledList.some((item) => item.key === selectedMethod)) {
      onSelectMethod(enabledList[0].key)
    }
  }, [enabledList, selectedMethod, onSelectMethod])

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        เลือกช่องทางการชำระเงิน
      </label>

      <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:gap-2">
        {enabledList.map((item) => (
          <button
            key={item.key}
            type="button"
            disabled={disabled}
            onClick={() => onSelectMethod(item.key)}
            className={`p-2 sm:p-2.5 rounded-xl border-2 font-bold text-xs flex items-center gap-2 transition-all min-h-[38px] ${
              selectedMethod === item.key
                ? item.activeClass
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {item.icon}
            <span className="whitespace-nowrap truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
