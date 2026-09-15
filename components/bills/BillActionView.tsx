'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  FullBill,
  ReturnInspectionItem,
  ReturnCalculationResult,
} from '@/lib/types/rental-return'
import {
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { CustomDatePicker, getLocalDateString, parseLocalDate } from '@/components/common/CustomDatePicker'
import { ModalPortal } from '@/components/common/ModalPortal'
import { NumericInput } from '@/components/common/NumericInput'
import { A4FitPreview } from '@/components/pos/A4FitPreview'
import { ReturnSlipPlaceholder } from '@/components/documents/ReturnSlipPlaceholder'
import { PaymentReceiptPlaceholder } from '@/components/documents/PaymentReceiptPlaceholder'
import { DamageReceiptPlaceholder } from '@/components/documents/DamageReceiptPlaceholder'
import { PaymentMethodSelector, PaymentMethodType } from '@/components/pos/payment/PaymentMethodSelector'
import { PaymentDynamicContent } from '@/components/pos/payment/PaymentDynamicContent'
import { SplitTenderEditor, SplitPaymentTender, SplitTenderMethod } from '@/components/pos/payment/SplitTenderEditor'
import { useToast } from '@/components/common/Toast'
import { PostSavePrintModal } from '@/components/common/PostSavePrintModal'
import { BusinessSettings } from '@/lib/types/rental-pos'
import { useAuth } from '@/lib/contexts/AuthContext'
import { generateCorrelationId } from '@/lib/audit-storage'
import { processReturnWorkflow, processSplitPaymentWorkflow } from '@/lib/bill-workflow-service'

interface ConfirmRentalReturnItemPayload {
  rental_bill_item_id: string
  normal_quantity: number
  damaged_quantity: number
  lost_quantity: number
  repair_fee_per_unit: number
  replacement_fee_per_unit: number
  note: string | null
  rental_start_date: string | null
  scheduled_return_date: string | null
  actual_return_date: string | null
  billable_days: number
}

interface RentalBillingConfig {
  allowPartialReturn?: boolean
  allowContinueAfterPaid?: boolean
  [key: string]: unknown
}

const rentalBilling: RentalBillingConfig = {
  allowPartialReturn: true,
  allowContinueAfterPaid: true,
}

const getReturnedQty = (item: ReturnInspectionItem) =>
  (item.normalQty || 0) + (item.damagedQty || 0) + (item.lostQty || 0) || (item.returnQty || 0)

const getItemDamageFee = (item: ReturnInspectionItem) =>
  (item.damagedQty || 0) * (item.repairFeePerUnit || 0) +
  (item.lostQty || 0) * (item.replacementFeePerUnit || 0)

function computeItemRentalCalculation(
  _item: ReturnInspectionItem,
  _dates?: { rentalStartDate?: string; scheduledReturnDate?: string; actualReturnDate?: string },
  _config?: unknown
) {
  return {
    actualRentalDays: 0,
    overdueDays: 0,
    isOverdue: false,
    itemRentalFee: 0,
  }
}

function computeReturnCalculation(
  _start: string,
  _scheduled: string,
  _actual: string,
  items: ReturnInspectionItem[],
  heldDeposit: number,
  deductDeposit: boolean,
  collected: number,
  _config?: unknown,
  billSummary?: { grandTotal: number; paidAmount: number; outstandingAmount: number }
): ReturnCalculationResult {
  const repairTotal = items.reduce((sum, i) => sum + (i.damagedQty || 0) * (i.repairFeePerUnit || 0), 0)
  const replaceTotal = items.reduce((sum, i) => sum + (i.lostQty || 0) * (i.replacementFeePerUnit || 0), 0)
  const damageTotal = repairTotal + replaceTotal
  const persistedGrand = billSummary?.grandTotal || 0
  const persistedPaid = billSummary?.paidAmount || 0
  const persistedOutstanding = billSummary?.outstandingAmount || 0
  const grandTotalCharge = persistedGrand + damageTotal
  const netAmount = Math.max(0, grandTotalCharge - persistedPaid - (deductDeposit ? heldDeposit : 0))

  return {
    actualRentalDays: 0,
    scheduledRentalDays: 0,
    lateDays: 0,
    isEarlyReturn: false,
    isOverdue: false,
    persistedGrandTotal: persistedGrand,
    persistedPaidAmount: persistedPaid,
    persistedOutstandingAmount: persistedOutstanding,
    actualRentalFee: 0,
    rentalFeeDelta: 0,
    lateFeeTotal: 0,
    totalDamageFee: damageTotal,
    repairFeeTotal: repairTotal,
    replacementFeeTotal: replaceTotal,
    returnChargeDelta: damageTotal,
    grandTotalCharge,
    heldDepositAmount: heldDeposit,
    netAmount,
    deductFromDeposit: deductDeposit,
    actualCollectedAmount: collected,
    netRefundAmount: 0,
    remainingDebtAmount: Math.max(0, netAmount - collected),
  }
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface BillActionViewProps {
  customerName: string
  bills: FullBill[]
  setBills: React.Dispatch<React.SetStateAction<FullBill[]>>
  initialMode: 'RETURN' | 'PAYMENT'
  initialBillId?: string
  onClose: () => void
}

export function BillActionView({
  customerName,
  bills,
  setBills,
  initialMode,
  initialBillId,
  onClose,
}: BillActionViewProps) {
  const { showToast } = useToast()
  const { user } = useAuth()
  const business: Partial<BusinessSettings> = {}

  const printDocuments = async (_docs: React.ReactNode[], _options?: { title?: string }) => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const [mode] = useState<'RETURN' | 'PAYMENT'>(initialMode)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [selectedBillId, setSelectedBillId] = useState<string | null>(() => {
    if (initialBillId) return initialBillId
    const matching = bills.filter((b) => b.customerName === customerName)
    return matching.length === 1 ? matching[0].id : (bills[0]?.id || null)
  })
  const [returnDocIndex, setReturnDocIndex] = useState<number>(0)

  // Idempotency Request ID for Payment (Strict UUID v4)
  const [paymentRequestId, setPaymentRequestId] = useState<string>(() => generateUUID())

  // Idempotency Request ID for Return (Strict UUID v4)
  const [returnRequestId, setReturnRequestId] = useState<string>(() => generateUUID())

  // Saved return & payment document numbers for accurate post-save printing
  const [savedReturnInfo, setSavedReturnInfo] = useState<{ returnNo?: string } | null>(null)
  const [savedPaymentInfo, setSavedPaymentInfo] = useState<{ paymentNo?: string; receiptNo?: string } | null>(null)

  // Post-Save Print Confirmation Modal State
  const [postSavePrintModal, setPostSavePrintModal] = useState<{
    isOpen: boolean
    title: string
    description: string
  }>({
    isOpen: false,
    title: '',
    description: '',
  })

  // Full-screen / Full-area Preview Overlay State
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState<boolean>(false)

  // Active Bill Selection
  const customerBills = useMemo(() => {
    return bills.filter((b) => b.customerName === customerName)
  }, [bills, customerName])

  const activeBill = useMemo(() => {
    return bills.find((b) => b.id === selectedBillId) || null
  }, [bills, selectedBillId])

  // --- Header Dates State ---
  const [billRentalStartDate, setBillRentalStartDate] = useState<string>('')
  const [billScheduledReturnDate, setBillScheduledReturnDate] = useState<string>('')

  // --- Return Dates & Items State ---
  const [actualReturnDate, setActualReturnDate] = useState<string>('')
  const [paymentDate, setPaymentDate] = useState<string>('')
  const [inspectionItems, setInspectionItems] = useState<ReturnInspectionItem[]>([])

  // --- Return State / Payment State ---
  const [deductFromDeposit, setDeductFromDeposit] = useState<boolean>(false)
  const [userCollectedAmount, setUserCollectedAmount] = useState<number>(0)
  const [paymentChannel, setPaymentChannel] = useState<PaymentMethodType>('CASH')
  const [receivedCashInput, setReceivedCashInput] = useState<string>('')
  const [bankRef, setBankRef] = useState<string>('')
  const createSplitTender = (paymentMethod: SplitTenderMethod = 'CASH'): SplitPaymentTender => ({
    id: generateUUID(),
    requestId: generateUUID(),
    paymentMethod,
    amount: 0,
    cashReceived: 0,
    referenceNo: '',
  })
  const [splitTenders, setSplitTenders] = useState<SplitPaymentTender[]>(() => [createSplitTender('CASH')])
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isQrLoading, setIsQrLoading] = useState<boolean>(false)

  const promptPayId = business?.promptPayValue || ''

  // --- Submitting State ---
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Auto select if initialBillId or activeBill available
  useEffect(() => {
    if (!selectedBillId) {
      if (initialBillId) {
        setSelectedBillId(initialBillId)
      } else if (customerBills.length === 1) {
        setSelectedBillId(customerBills[0].id)
      } else if (bills.length > 0) {
        setSelectedBillId(bills[0].id)
      }
    }
  }, [customerBills, selectedBillId, initialBillId, bills])

  // Reset internal states when activeBill changes
  useEffect(() => {
    if (activeBill) {
      const todayStr = getLocalDateString(new Date())
      setBillRentalStartDate(activeBill.rentalStartDate)
      setBillScheduledReturnDate(activeBill.scheduledReturnDate)
      setActualReturnDate(activeBill.actualReturnDate || todayStr)
      setPaymentDate(todayStr)
      setInspectionItems(
        activeBill.items
          .filter((item) => item.requiresReturn && item.rentalType !== 'SALE')
          .map((item) => {
          const itemStart =
            item.rentalStartDate || activeBill.rentalStartDate || activeBill.billDate || ''
          const itemSched = item.scheduledReturnDate || activeBill.scheduledReturnDate || ''
          const itemActual =
            item.actualReturnDate || activeBill.actualReturnDate || todayStr

          return {
            rentalBillItemId: item.rentalBillItemId,
            productId: item.productId,
            productCode: item.productCode,
            productName: item.productName,
            totalQtyInBill: item.quantity,
            outstandingQty: item.outstandingQty,
            returnQty: 0,
            normalQty: 0,
            damagedQty: 0,
            lostQty: 0,
            dailyRate: item.dailyRate,
            rentalType: item.rentalType === 'DAILY' ? 'DAILY' : 'NORMAL',
            usageCount: item.usageCount || 1,
            repairFeePerUnit: item.defaultRepairFee || 150,
            replacementFeePerUnit: item.defaultReplacementFee || 1000,
            totalDamageFee: 0,
            note: '',
            selected: false,
            rentalStartDate: itemStart,
            scheduledReturnDate: itemSched,
            actualReturnDate: itemActual,
          }
        })
      )
      setDeductFromDeposit(activeBill.heldDepositAmount > 0)
      if (mode === 'PAYMENT') {
        setUserCollectedAmount(activeBill.outstandingAmount)
        setReceivedCashInput(activeBill.outstandingAmount > 0 ? activeBill.outstandingAmount.toString() : '')
        const initialTender = createSplitTender('CASH')
        initialTender.amount = activeBill.outstandingAmount
        initialTender.cashReceived = activeBill.outstandingAmount
        setSplitTenders([initialTender])
        setPaymentRequestId(generateUUID())
      } else {
        setUserCollectedAmount(0)
        setReceivedCashInput('')
        setReturnRequestId(generateUUID())
      }
    }
  }, [activeBill, mode])

  // Calculations for Return (Reacts to changed dates & items)
  const calcResult: ReturnCalculationResult = useMemo(() => {
    if (!activeBill) return computeReturnCalculation('2026-01-01', '2026-01-01', actualReturnDate, [], 0, false, 0, rentalBilling)
    return computeReturnCalculation(
      billRentalStartDate,
      billScheduledReturnDate,
      actualReturnDate,
      inspectionItems.filter((i) => i.selected && (i.normalQty + i.damagedQty + i.lostQty) > 0),
      activeBill.heldDepositAmount,
      deductFromDeposit,
      userCollectedAmount,
      rentalBilling,
      {
        grandTotal: activeBill.grandTotal,
        paidAmount: activeBill.paidAmount,
        outstandingAmount: activeBill.outstandingAmount,
      }
    )
  }, [activeBill, billRentalStartDate, billScheduledReturnDate, actualReturnDate, inspectionItems, deductFromDeposit, userCollectedAmount, rentalBilling])

  // Dynamic Documents available for Return Step 4 Preview
  const availableReturnDocs = useMemo<Array<'RETURN_SLIP' | 'RECEIPT' | 'DAMAGE_RECEIPT'>>(() => {
    const docs: Array<'RETURN_SLIP' | 'RECEIPT' | 'DAMAGE_RECEIPT'> = ['RETURN_SLIP']
    const isPaid = paymentChannel !== 'UNPAID' && userCollectedAmount > 0
    const hasDamageOrLost = inspectionItems.some((i) => i.selected && ((i.damagedQty || 0) > 0 || (i.lostQty || 0) > 0)) || calcResult.totalDamageFee > 0
    const hasRentalOrLate = (calcResult.actualRentalFee + calcResult.lateFeeTotal) > 0

    if (isPaid) {
      if (hasRentalOrLate || !hasDamageOrLost) {
        docs.push('RECEIPT')
      }
      if (hasDamageOrLost) {
        docs.push('DAMAGE_RECEIPT')
      }
    } else if (hasDamageOrLost && calcResult.totalDamageFee > 0) {
      docs.push('DAMAGE_RECEIPT')
    }
    return docs
  }, [paymentChannel, userCollectedAmount, calcResult.totalDamageFee, calcResult.actualRentalFee, calcResult.lateFeeTotal, inspectionItems])

  // Ensure returnDocIndex is within bounds
  useEffect(() => {
    if (returnDocIndex >= availableReturnDocs.length) {
      setReturnDocIndex(0)
    }
  }, [availableReturnDocs.length, returnDocIndex])

  const handlePrevReturnDoc = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (availableReturnDocs.length <= 1) return
    setReturnDocIndex((prev) => (prev > 0 ? prev - 1 : availableReturnDocs.length - 1))
  }

  const handleNextReturnDoc = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (availableReturnDocs.length <= 1) return
    setReturnDocIndex((prev) => (prev < availableReturnDocs.length - 1 ? prev + 1 : 0))
  }

  const hasReturnItems = inspectionItems.some((item) => item.selected && getReturnedQty(item) > 0)

  // Sync return step 3 default collected amount
  useEffect(() => {
    if (mode === 'RETURN' && currentStep === 3 && calcResult.netAmount > 0 && userCollectedAmount === 0 && paymentChannel !== 'UNPAID') {
      setUserCollectedAmount(calcResult.netAmount)
      setReceivedCashInput(calcResult.netAmount.toString())
    }
  }, [mode, currentStep, calcResult.netAmount, userCollectedAmount, paymentChannel])

  const currentPayableAmount = useMemo(() => {
    if (mode === 'RETURN') {
      return calcResult.netAmount > 0 ? (paymentChannel === 'UNPAID' ? 0 : userCollectedAmount) : 0
    }
    return paymentChannel === 'UNPAID' ? 0 : userCollectedAmount
  }, [mode, calcResult.netAmount, userCollectedAmount, paymentChannel])

  const targetPayableForCash = useMemo(() => {
    if (mode === 'RETURN') {
      return calcResult.netAmount > 0 ? userCollectedAmount : 0
    }
    return userCollectedAmount
  }, [mode, calcResult.netAmount, userCollectedAmount])

  const receivedCash = receivedCashInput === '' ? targetPayableForCash : (parseFloat(receivedCashInput) || 0)
  const changeAmount = paymentChannel === 'CASH' ? Math.max(0, receivedCash - targetPayableForCash) : 0

  // Generate QR Code dynamically
  useEffect(() => {
    setQrCodeUrl('')
    setIsQrLoading(false)
  }, [paymentChannel, currentPayableAmount, promptPayId])

  // Derived saved document numbers & damage allocation values (safe preview without counter consumption)
  const savedDamageDocNo = 'รอสร้างเลขเอกสาร'
  const savedReceiptDocNo = 'รอสร้างเลขเอกสาร'

  const isDamageFullySettled = calcResult.remainingDebtAmount === 0 && userCollectedAmount >= calcResult.netAmount
  const damageCollectedValue = isDamageFullySettled ? calcResult.totalDamageFee : (userCollectedAmount === 0 ? 0 : undefined)
  const damageOutstandingValue = isDamageFullySettled ? 0 : calcResult.totalDamageFee

  // Unified Return Document Renderer for Preview, Full Preview, and Central Multi-Document Print
  const renderReturnDoc = (
    docType: 'RETURN_SLIP' | 'RECEIPT' | 'DAMAGE_RECEIPT',
    customReceiptNo?: string,
    customDamageDocNo?: string,
    customReturnNo?: string
  ) => {
    if (!activeBill) return null

    if (docType === 'RETURN_SLIP') {
      return (
        <ReturnSlipPlaceholder
          businessName={business?.businessName}
          businessAddress={business?.address}
          businessTaxId={business?.taxId}
          businessPhone={business?.phone}
          customerName={activeBill.customerName}
          customerPhone={activeBill.customerPhone}
          billNo={customReturnNo || activeBill.billNo}
          returnDate={actualReturnDate}
          rentalStartDate={billRentalStartDate}
          scheduledReturnDate={billScheduledReturnDate}
          actualRentalDays={calcResult.actualRentalDays}
          lateDays={calcResult.lateDays}
          lateFeeTotal={calcResult.lateFeeTotal}
          totalDamageFee={calcResult.totalDamageFee}
          grandTotalCharge={calcResult.grandTotalCharge}
          netAmount={calcResult.netAmount}
          userCollectedAmount={userCollectedAmount}
          items={inspectionItems
            .filter((i) => i.returnQty > 0)
            .map((i) => {
              const itemCalc = computeItemRentalCalculation(
                i,
                {
                  rentalStartDate: billRentalStartDate,
                  scheduledReturnDate: billScheduledReturnDate,
                  actualReturnDate,
                },
                rentalBilling
              )
              return {
                name: i.productName,
                returnedQty: i.returnQty,
                normalQty: i.normalQty,
                damagedQty: i.damagedQty,
                lostQty: i.lostQty,
                damageFee: i.totalDamageFee,
                rentalStartDate: i.rentalStartDate || billRentalStartDate,
                scheduledReturnDate: i.scheduledReturnDate || billScheduledReturnDate,
                actualReturnDate: i.actualReturnDate || actualReturnDate,
                actualRentalDays: itemCalc.actualRentalDays,
                overdueDays: itemCalc.overdueDays,
                isOverdue: itemCalc.isOverdue,
                rentalType: i.rentalType,
              }
            })}
        />
      )
    }

    if (docType === 'DAMAGE_RECEIPT') {
      return (
        <DamageReceiptPlaceholder
          businessName={business?.businessName}
          businessAddress={business?.address}
          businessTaxId={business?.taxId}
          businessPhone={business?.phone}
          customerName={activeBill.customerName}
          customerPhone={activeBill.customerPhone}
          customerAddress={activeBill.customerAddress}
          receiptNo={customDamageDocNo || savedDamageDocNo}
          billNo={activeBill.billNo}
          paymentDate={actualReturnDate}
          paymentChannel={paymentChannel}
          totalDamageFee={calcResult.repairFeeTotal}
          totalLossFee={calcResult.replacementFeeTotal}
          grandTotalDamage={calcResult.totalDamageFee}
          collectedAmount={damageCollectedValue}
          outstandingRemaining={damageOutstandingValue}
          items={inspectionItems
            .filter(
              (i) =>
                (i.damagedQty > 0 || i.lostQty > 0) &&
                (i.repairFeePerUnit > 0 || i.replacementFeePerUnit > 0 || i.totalDamageFee > 0)
            )
            .flatMap((i) => {
              const list = []
              if (i.damagedQty > 0) {
                list.push({
                  name: i.productName,
                  code: i.productCode,
                  type: 'DAMAGED' as const,
                  quantity: i.damagedQty,
                  feePerUnit: i.repairFeePerUnit,
                  totalFee: i.repairFeePerUnit * i.damagedQty,
                })
              }
              if (i.lostQty > 0) {
                list.push({
                  name: i.productName,
                  code: i.productCode,
                  type: 'LOST' as const,
                  quantity: i.lostQty,
                  feePerUnit: i.replacementFeePerUnit,
                  totalFee: i.replacementFeePerUnit * i.lostQty,
                })
              }
              return list
            })}
        />
      )
    }

    // Default: 'RECEIPT'
    return (
      <PaymentReceiptPlaceholder
        businessName={business?.businessName}
        businessAddress={business?.address}
        businessTaxId={business?.taxId}
        businessPhone={business?.phone}
        customerName={activeBill.customerName}
        customerPhone={activeBill.customerPhone}
        customerAddress={activeBill.customerAddress}
        receiptNo={customReceiptNo || savedReceiptDocNo}
        billNo={activeBill.billNo}
        paymentDate={actualReturnDate}
        amount={userCollectedAmount || (calcResult.netAmount > 0 ? calcResult.netAmount : 0)}
        paymentChannel={paymentChannel}
        outstandingRemaining={Math.max(0, calcResult.netAmount - userCollectedAmount)}
        originalBillTotal={calcResult.grandTotalCharge}
        note={`รับชำระส่วนต่างบิลเช่า ${activeBill.billNo}`}
      />
    )
  }

  // Unified Payment Document Renderer
  const renderPaymentDoc = (customReceiptNo?: string) => {
    if (!activeBill) return null
    return (
      <PaymentReceiptPlaceholder
        businessName={business?.businessName}
        businessAddress={business?.address}
        businessTaxId={business?.taxId}
        businessPhone={business?.phone}
        customerName={activeBill.customerName}
        customerPhone={activeBill.customerPhone}
        customerAddress={activeBill.customerAddress}
        receiptNo={customReceiptNo || savedReceiptDocNo}
        billNo={activeBill.billNo}
        paymentDate={paymentDate}
        amount={userCollectedAmount}
        paymentChannel={paymentChannel}
        outstandingRemaining={Math.max(0, activeBill.outstandingAmount - userCollectedAmount)}
        originalBillTotal={activeBill.grandTotal}
        note={`ชำระยอดค้างชำระ บิล ${activeBill.billNo}`}
      />
    )
  }

  // Global Multi-Document Print Handler for Return Flow (Prints all available documents in preview order)
  const handlePrintReturnDocs = async (savedNos?: { returnNo?: string; receiptNo?: string; damageNo?: string }) => {
    if (!activeBill) return
    const docs = availableReturnDocs.map((docType, idx) => (
      <div key={`${docType}-${idx}`} className="w-full">
        {renderReturnDoc(docType, savedNos?.receiptNo, savedNos?.damageNo, savedNos?.returnNo)}
      </div>
    ))
    await printDocuments(docs, {
      title: `เอกสารรับคืน_${activeBill.billNo}`,
    })
  }

  // Global Multi-Document Print Handler for Payment Flow
  const handlePrintPaymentDocs = async (savedNos?: { paymentNo?: string; receiptNo?: string }) => {
    if (!activeBill) return
    const docs = [
      <div key="payment-receipt" className="w-full">
        {renderPaymentDoc(savedNos?.receiptNo || savedNos?.paymentNo)}
      </div>,
    ]
    await printDocuments(docs, {
      title: `ใบเสร็จรับเงิน_${activeBill.billNo}`,
    })
  }

  const handleSelectPaymentMethod = (method: PaymentMethodType) => {
    setPaymentChannel(method)
    if (method === 'UNPAID') {
      setUserCollectedAmount(0)
      setReceivedCashInput('')
    } else {
      if (userCollectedAmount === 0) {
        if (mode === 'RETURN' && calcResult.netAmount > 0) {
          setUserCollectedAmount(calcResult.netAmount)
          setReceivedCashInput(calcResult.netAmount.toString())
        } else if (mode === 'PAYMENT' && activeBill) {
          setUserCollectedAmount(activeBill.outstandingAmount)
          setReceivedCashInput(activeBill.outstandingAmount.toString())
        }
      } else {
        setReceivedCashInput(userCollectedAmount.toString())
      }
    }
  }

  // Actions
  const handleSelectBillAndProceed = (billId: string) => {
    setSelectedBillId(billId)
    setCurrentStep(2)
  }

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      onClose()
    }
  }

  const handleToggleSelectAll = () => {
    const allSelected = inspectionItems.length > 0 && inspectionItems.every((i) => i.selected)
    setInspectionItems((prev) => prev.map((item) => ({ ...item, selected: !allSelected })))
  }

  const handleToggleSelectItem = (idx: number) => {
    setInspectionItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, selected: !item.selected } : item))
    )
  }

  const handleItemDateChange = (
    idx: number,
    field: 'rentalStartDate' | 'scheduledReturnDate' | 'actualReturnDate',
    val: string
  ) => {
    setInspectionItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    )
  }

  const handleItemQtyChange = (
    rentalBillItemId: string,
    field: 'normalQty' | 'damagedQty' | 'lostQty',
    qty: number
  ) => {
    setInspectionItems((prev) =>
      prev.map((item) => {
        if (item.rentalBillItemId !== rentalBillItemId) return item

        const otherQty =
          field === 'normalQty'
            ? (item.damagedQty || 0) + (item.lostQty || 0)
            : field === 'damagedQty'
            ? (item.normalQty || 0) + (item.lostQty || 0)
            : (item.normalQty || 0) + (item.damagedQty || 0)

        const maxAllowed = Math.max(0, item.outstandingQty - otherQty)
        const parsedQty = Math.max(0, Math.min(maxAllowed, Math.floor(qty) || 0))

        const updatedItem = {
          ...item,
          [field]: parsedQty,
        }
        updatedItem.returnQty =
          (updatedItem.normalQty || 0) +
          (updatedItem.damagedQty || 0) +
          (updatedItem.lostQty || 0)
        updatedItem.totalDamageFee = getItemDamageFee(updatedItem)
        return updatedItem
      })
    )
  }

  const handlePayAllShortcut = () => {
    if (!activeBill) return
    if (activeBill.outstandingAmount <= 0) {
      showToast('ชำระครบแล้ว', 'บิลนี้ชำระครบตามยอดแล้ว', 'INFO')
      return
    }

    const amountToCollect = activeBill.outstandingAmount
    setUserCollectedAmount(amountToCollect)
    setReceivedCashInput(amountToCollect > 0 ? amountToCollect.toString() : '')
    const initialTender = createSplitTender('CASH')
    initialTender.amount = amountToCollect
    initialTender.cashReceived = amountToCollect
    setSplitTenders([initialTender])
    setCurrentStep(2)
  }

  const handlePaymentStep1Next = () => {
    if (!activeBill) return
    if (activeBill.outstandingAmount <= 0) {
      showToast('ชำระครบแล้ว', 'บิลนี้ชำระครบตามยอดแล้ว', 'INFO')
      return
    }

    const selectedItems = inspectionItems.filter((i) => i.selected)
    if (selectedItems.length > 0) {
      const selectedTotal = selectedItems.reduce((sum, item) => {
        const calc = computeItemRentalCalculation(
          item,
          {
            rentalStartDate: billRentalStartDate,
            scheduledReturnDate: billScheduledReturnDate,
            actualReturnDate,
          },
          rentalBilling
        )
        return sum + calc.itemRentalFee
      }, 0)

      const allSelected = selectedItems.length === inspectionItems.length
      const amountToCollect = allSelected
        ? activeBill.outstandingAmount
        : Math.min(selectedTotal, activeBill.outstandingAmount)

      setUserCollectedAmount(amountToCollect)
      setReceivedCashInput(amountToCollect > 0 ? amountToCollect.toString() : '')
      const initialTender = createSplitTender('CASH')
      initialTender.amount = amountToCollect
      initialTender.cashReceived = amountToCollect
      setSplitTenders([initialTender])
    } else {
      // Bill-level payment mode (no items selected or empty items list)
      const amountToCollect = activeBill.outstandingAmount
      setUserCollectedAmount(amountToCollect)
      setReceivedCashInput(amountToCollect > 0 ? amountToCollect.toString() : '')
      const initialTender = createSplitTender('CASH')
      initialTender.amount = amountToCollect
      initialTender.cashReceived = amountToCollect
      setSplitTenders([initialTender])
    }

    setCurrentStep(2)
  }

  const handleFinalCloseAndConfirmReturn = async (_isExtendRental: boolean = false) => {
    if (!activeBill) return

    const returnedItems = inspectionItems.filter((i) => (i.normalQty + i.damagedQty + i.lostQty) > 0)
    if (returnedItems.length === 0) {
      showToast('ไม่มีรายการคืน', 'กรุณาระบุจำนวนสินค้าที่ต้องการคืนอย่างน้อย 1 ชิ้น', 'ERROR')
      return
    }

    const remainingOutstandingTotal = inspectionItems.reduce((sum, i) => sum + (i.outstandingQty - (i.normalQty + i.damagedQty + i.lostQty)), 0)
    const fullyReturned = remainingOutstandingTotal === 0

    if (rentalBilling?.allowPartialReturn === false && !fullyReturned) {
      showToast('ไม่อนุญาตให้คืนบางส่วน', 'การตั้งค่าระบบไม่อนุญาตให้คืนสินค้าบางส่วน', 'ERROR')
      return
    }

    const rpcItems: ConfirmRentalReturnItemPayload[] = returnedItems.map((item) => {
      const itemCalc = computeItemRentalCalculation(
        item,
        {
          rentalStartDate: billRentalStartDate,
          scheduledReturnDate: billScheduledReturnDate,
          actualReturnDate,
        },
        rentalBilling
      )

      return {
        rental_bill_item_id: item.rentalBillItemId,
        normal_quantity: item.normalQty || 0,
        damaged_quantity: item.damagedQty || 0,
        lost_quantity: item.lostQty || 0,
        repair_fee_per_unit: item.damagedQty > 0 ? (item.repairFeePerUnit || 0) : 0,
        replacement_fee_per_unit: item.lostQty > 0 ? (item.replacementFeePerUnit || 0) : 0,
        note: item.note || null,
        rental_start_date: item.rentalStartDate || billRentalStartDate || null,
        scheduled_return_date: item.scheduledReturnDate || billScheduledReturnDate || null,
        actual_return_date: item.actualReturnDate || actualReturnDate || null,
        billable_days: itemCalc.actualRentalDays,
      }
    })

    setIsSubmitting(true)

    try {
      const actorUserId = user?.userId || 'system'
      const actorDisplayName = user?.displayName || 'ระบบ'
      setReturnRequestId(generateUUID())

      const { bill: updatedBill, returnNo } = processReturnWorkflow({
        billId: activeBill.id,
        items: returnedItems.map((item) => ({
          rentalBillItemId: item.rentalBillItemId,
          productId: item.productId,
          normalQty: Number(item.normalQty || 0),
          damagedQty: Number(item.damagedQty || 0),
          lostQty: Number(item.lostQty || 0),
          repairFeePerUnit: item.repairFeePerUnit,
          replacementFeePerUnit: item.replacementFeePerUnit,
          note: item.note,
        })),
        collectedAmount: userCollectedAmount,
        paymentMethod: paymentChannel,
        actor: {
          userId: actorUserId,
          displayName: actorDisplayName,
        },
      })

      setBills((prev) =>
        prev.map((b) => (b.id === updatedBill.id ? updatedBill : b))
      )

      showToast(
        'บันทึกรับคืนสินค้าสำเร็จ',
        `รับคืนสินค้าใบคืนเลขที่ ${returnNo} สำเร็จแล้ว`,
        'SUCCESS'
      )

      setSavedReturnInfo({ returnNo })
      setPostSavePrintModal({
        isOpen: true,
        title: 'บันทึกรับคืนสินค้าสำเร็จ',
        description: 'รับคืนสินค้าเรียบร้อยแล้ว\nต้องการพิมพ์ใบรับคืนสินค้าหรือไม่?',
      })
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการรับคืนสินค้า', err?.message || 'ไม่สามารถบันทึกรับคืนสินค้าได้', 'ERROR')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinalConfirmPayment = async () => {
    if (!activeBill) return

    const validTenders = splitTenders.filter((tender) => Number(tender.amount || 0) > 0)
    const totalPayment = validTenders.reduce((sum, tender) => sum + Number(tender.amount || 0), 0)

    if (totalPayment <= 0) {
      showToast('ระบุจำนวนเงินไม่ถูกต้อง', 'จำนวนเงินที่รับชำระต้องมากกว่า 0 บาท', 'ERROR')
      return
    }
    if (totalPayment > activeBill.outstandingAmount + 0.001) {
      showToast('ยอดชำระเกินยอดค้าง', 'ยอดชำระรวมต้องไม่เกินยอดค้างของบิล', 'ERROR')
      return
    }
    if (validTenders.some((tender) => tender.paymentMethod === 'CASH' && tender.cashReceived < tender.amount)) {
      showToast('เงินสดไม่ถูกต้อง', 'เงินสดที่รับมาต้องไม่น้อยกว่ายอดชำระของช่องทางเงินสด', 'ERROR')
      return
    }
    if (rentalBilling?.allowPartialPayment === false && totalPayment < activeBill.outstandingAmount) {
      showToast('ไม่อนุญาตให้ชำระบางส่วน', 'การตั้งค่าระบบไม่อนุญาตให้ชำระบางส่วน', 'ERROR')
      return
    }

    setIsSubmitting(true)

    try {
      const actorUserId = user?.userId || 'system'
      const actorDisplayName = user?.displayName || 'ระบบ'

      const paymentBatchId = `PAY-${Date.now().toString().slice(-6)}`
      const receiptNo = `RC-${Date.now().toString().slice(-6)}`
      setPaymentRequestId(generateUUID())

      const { bill: updatedBill } = processSplitPaymentWorkflow({
        billId: activeBill.id,
        tenders: validTenders.map((t) => ({
          paymentMethod: t.paymentMethod,
          amount: Number(t.amount || 0),
          referenceNo: t.referenceNo,
          cashReceived: t.cashReceived,
        })),
        paymentDate: paymentDate || undefined,
        actor: {
          userId: actorUserId,
          displayName: actorDisplayName,
        },
      })

      setBills((prev) =>
        prev.map((b) => (b.id === updatedBill.id ? updatedBill : b))
      )

      showToast(
        'บันทึกรับชำระเงินสำเร็จ',
        `รับชำระเงิน ฿${totalPayment.toLocaleString()} (${validTenders.length} ช่องทาง) สำเร็จแล้ว`,
        'SUCCESS'
      )

      setSavedPaymentInfo({
        paymentNo: paymentBatchId,
        receiptNo,
      })
      const isPartial = updatedBill.outstandingAmount > 0
      setPostSavePrintModal({
        isOpen: true,
        title: 'บันทึกรายการสำเร็จ',
        description: isPartial
          ? 'รับชำระเงินเรียบร้อยแล้ว\nต้องการพิมพ์ใบเสร็จรับชำระบางส่วนหรือไม่?'
          : 'รับชำระเงินครบเรียบร้อยแล้ว\nต้องการพิมพ์ใบเสร็จรับเงินหรือไม่?',
      })
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการรับชำระเงิน', err?.message || 'ไม่สามารถบันทึกรับชำระเงินได้', 'ERROR')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Steps
  const steps =
    mode === 'RETURN'
      ? [
          { step: 1, title: '1. เลือกรายการ & กำหนดวันที่' },
          { step: 2, title: '2. ตรวจสินค้า' },
          { step: 3, title: '3. สรุปยอด' },
        ]
      : [
          { step: 1, title: '1. เลือกรายการ & กำหนดวันที่' },
          { step: 2, title: '2. เลือกยอดชำระ & วิธีชำระ' },
        ]

  return (
    <div className="flex flex-col min-h-0 h-full w-full overflow-hidden animate-in fade-in duration-150 gap-2 sm:gap-2.5">
      {/* 1. Stepper Navigation */}
      <div
        className={`grid gap-1.5 sm:gap-2 shrink-0 ${
          mode === 'RETURN' ? 'grid-cols-3' : 'grid-cols-2'
        }`}
      >
        {steps.map((s) => {
          const active = currentStep === s.step
          const passed = currentStep > s.step
          const canClick = activeBill && s.step < currentStep
          return (
            <button
              type="button"
              key={s.step}
              onClick={() => {
                if (canClick) setCurrentStep(s.step)
              }}
              className={`py-1.5 sm:py-2 px-1 sm:px-2.5 rounded-xl text-center text-xs font-bold transition-all truncate whitespace-nowrap min-w-0 border ${
                active
                  ? mode === 'RETURN'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : passed
                  ? mode === 'RETURN'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
              } ${canClick ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
            >
              {s.title}
            </button>
          )
        })}
      </div>

      {/* 2. Content of current Step */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* RETURN WORKFLOW STEPS */}
        {mode === 'RETURN' && activeBill && (
          <>
            {/* STEP 1: Select Items + Item Dates */}
            {currentStep === 1 && (
              <div className="flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden">
                {/* Top Summary Bar */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                      เลือกรายการสินค้าและกำหนดวันคืนจริง
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0">
                      {activeBill.billNo}
                    </span>
                    <span className="text-slate-500 text-xs truncate hidden md:inline">
                      ({activeBill.customerName})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
                    <span>เลือกแล้ว: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{inspectionItems.filter((i) => i.selected).length}</strong>/{inspectionItems.length} รายการ</span>
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 min-h-0 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <colgroup>
                      <col className="w-[36px] sm:w-[42px]" />  {/* Checkbox */}
                      <col className="w-[36px] sm:w-[42px]" />  {/* ลำดับ */}
                      <col className="w-auto" />                {/* รายการ */}
                      <col className="w-[104px] sm:w-[125px]" /> {/* วันที่เช่า */}
                      <col className="w-[104px] sm:w-[125px]" /> {/* กำหนดคืน */}
                      <col className="w-[104px] sm:w-[125px]" /> {/* วันคืนจริง */}
                      <col className="w-[56px] sm:w-[68px]" />  {/* วันใช้จริง */}
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-slate-800 dark:bg-slate-900 text-white font-bold border-b border-slate-700 shadow-xs text-xs">
                      <tr>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">
                          <input
                            type="checkbox"
                            checked={inspectionItems.length > 0 && inspectionItems.every((i) => i.selected)}
                            onChange={handleToggleSelectAll}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            title="เลือก/ยกเลิกทั้งหมด"
                          />
                        </th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">ลำดับ</th>
                        <th className="py-2 px-1.5 bg-slate-800 dark:bg-slate-900 text-white">รายการ</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">วันที่เช่า</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">กำหนดคืน</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">วันคืนจริง</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">วันใช้จริง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800 text-[10.5px] sm:text-xs">
                      {inspectionItems.map((item, idx) => {
                        const itemCalc = computeItemRentalCalculation(
                          item,
                          {
                            rentalStartDate: billRentalStartDate,
                            scheduledReturnDate: billScheduledReturnDate,
                            actualReturnDate,
                          },
                          rentalBilling
                        )

                        return (
                          <tr
                            key={item.rentalBillItemId || item.productId}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                              !item.selected ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : ''
                            }`}
                          >
                            <td className="py-1 px-1 text-center">
                              <input
                                type="checkbox"
                                checked={item.selected ?? false}
                                onChange={() => handleToggleSelectItem(idx)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-1 px-1 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="py-1 px-1.5 font-bold text-slate-800 dark:text-slate-200 overflow-hidden">
                              <div className="truncate">{item.productName}</div>
                              {item.productCode && (
                                <span className="text-[9.5px] text-slate-400 font-mono block truncate">
                                  {item.productCode}
                                </span>
                              )}
                            </td>
                            <td className="py-1 px-1 text-center">
                              <CustomDatePicker
                                value={parseLocalDate(item.rentalStartDate)}
                                onChange={(d) =>
                                  handleItemDateChange(
                                    idx,
                                    'rentalStartDate',
                                    d ? getLocalDateString(d) : ''
                                  )
                                }
                                align="left"
                                placeholder="วันที่เช่า..."
                                className="text-xs"
                              />
                            </td>
                            <td className="py-1 px-1 text-center">
                              <CustomDatePicker
                                value={parseLocalDate(item.scheduledReturnDate)}
                                onChange={(d) =>
                                  handleItemDateChange(
                                    idx,
                                    'scheduledReturnDate',
                                    d ? getLocalDateString(d) : ''
                                  )
                                }
                                align="left"
                                placeholder="วันกำหนดคืน..."
                                className="text-xs"
                              />
                            </td>
                            <td className="py-1 px-1 text-center">
                              <CustomDatePicker
                                value={parseLocalDate(item.actualReturnDate)}
                                onChange={(d) =>
                                  handleItemDateChange(
                                    idx,
                                    'actualReturnDate',
                                    d ? getLocalDateString(d) : ''
                                  )
                                }
                                align="left"
                                placeholder="วันคืนจริง..."
                                className="text-xs"
                              />
                            </td>
                            <td className="py-1 px-1 text-center">
                              <span className="px-1.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-black text-[10.5px] sm:text-[11px] whitespace-nowrap">
                                {itemCalc.actualRentalDays} วัน
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Nav Bar */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700 shrink-0">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="px-4 sm:px-5 py-2 rounded-xl font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all text-xs cursor-pointer"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={inspectionItems.filter((i) => i.selected).length === 0}
                    className={`px-5 py-2 rounded-xl font-bold text-white transition-all text-xs ${
                      inspectionItems.filter((i) => i.selected).length > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-sm'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Inspect Selected Items */}
            {currentStep === 2 && (
              <div className="flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden">
                {/* Table */}
                <div className="flex-1 min-h-0 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <colgroup>
                      <col className="w-[36px] sm:w-[42px]" />  {/* ลำดับ */}
                      <col className="w-auto" />                {/* รายการ */}
                      <col className="w-[48px] sm:w-[56px]" />  {/* ทั้งหมด */}
                      <col className="w-[48px] sm:w-[56px]" />  {/* ค้างคืน */}
                      <col className="w-[48px] sm:w-[56px]" />  {/* คืนแล้ว */}
                      <col className="w-[54px] sm:w-[68px]" />  {/* ปกติ */}
                      <col className="w-[54px] sm:w-[68px]" />  {/* ชำรุด */}
                      <col className="w-[54px] sm:w-[68px]" />  {/* หาย */}
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-slate-800 dark:bg-slate-900 text-white font-bold border-b border-slate-700 shadow-xs text-xs">
                      <tr>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">ลำดับ</th>
                        <th className="py-2 px-1.5 bg-slate-800 dark:bg-slate-900 text-white">รายการ</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">ทั้งหมด</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">ค้างคืน</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">คืนแล้ว</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">ปกติ</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">ชำรุด</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">หาย</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800 text-[10.5px] sm:text-xs">
                      {inspectionItems
                        .filter((item) => item.selected)
                        .map((item, idx) => {
                          const billItem = activeBill.items.find(
                            (i) => i.rentalBillItemId === item.rentalBillItemId
                          )
                          const returnedQty =
                            billItem?.returnedQty ?? Math.max(0, item.totalQtyInBill - item.outstandingQty)
                          const isCompleted = item.outstandingQty <= 0
                          const maxNormal = Math.max(0, item.outstandingQty - (item.damagedQty || 0) - (item.lostQty || 0))
                          const maxDamaged = Math.max(0, item.outstandingQty - (item.normalQty || 0) - (item.lostQty || 0))
                          const maxLost = Math.max(0, item.outstandingQty - (item.normalQty || 0) - (item.damagedQty || 0))

                          return (
                            <tr key={item.rentalBillItemId || item.productId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <td className="py-1 px-1 text-center font-bold text-slate-500">{idx + 1}</td>
                              <td className="py-1 px-1.5 font-bold text-slate-800 dark:text-slate-200 overflow-hidden">
                                <div className="truncate">{item.productName}</div>
                                {item.productCode && (
                                  <span className="text-[9.5px] text-slate-400 font-mono block truncate">
                                    {item.productCode}
                                  </span>
                                )}
                              </td>
                              <td className="py-1 px-1 text-center font-bold text-slate-700 dark:text-slate-300">
                                {item.totalQtyInBill}
                              </td>
                              <td className="py-1 px-1 text-center">
                                <span className="px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                                  {item.outstandingQty}
                                </span>
                              </td>
                              <td className="py-1 px-1 text-center">
                                <span className="px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                                  {returnedQty}
                                </span>
                              </td>
                              <td className="py-1 px-1 text-center">
                                <NumericInput
                                  value={item.normalQty === 0 ? '' : item.normalQty}
                                  onChange={(val) =>
                                    handleItemQtyChange(
                                      item.rentalBillItemId,
                                      'normalQty',
                                      val === '' ? 0 : val
                                    )
                                  }
                                  defaultValueOnBlur={0}
                                  min={0}
                                  max={maxNormal}
                                  disabled={isCompleted}
                                  allowDecimals={false}
                                  allowNegative={false}
                                  placeholder=""
                                  className={`w-full min-w-0 h-7 sm:h-8 text-center font-bold border rounded-lg text-xs focus:outline-none ${
                                    isCompleted
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-2 focus:ring-emerald-500'
                                  }`}
                                />
                              </td>
                              <td className="py-1 px-1 text-center">
                                <NumericInput
                                  value={item.damagedQty === 0 ? '' : item.damagedQty}
                                  onChange={(val) =>
                                    handleItemQtyChange(
                                      item.rentalBillItemId,
                                      'damagedQty',
                                      val === '' ? 0 : val
                                    )
                                  }
                                  defaultValueOnBlur={0}
                                  min={0}
                                  max={maxDamaged}
                                  disabled={isCompleted}
                                  allowDecimals={false}
                                  allowNegative={false}
                                  placeholder=""
                                  className={`w-full min-w-0 h-7 sm:h-8 text-center font-bold border rounded-lg text-xs focus:outline-none ${
                                    isCompleted
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-amber-600 focus:ring-2 focus:ring-amber-500'
                                  }`}
                                />
                              </td>
                              <td className="py-1 px-1 text-center">
                                <NumericInput
                                  value={item.lostQty === 0 ? '' : item.lostQty}
                                  onChange={(val) =>
                                    handleItemQtyChange(
                                      item.rentalBillItemId,
                                      'lostQty',
                                      val === '' ? 0 : val
                                    )
                                  }
                                  defaultValueOnBlur={0}
                                  min={0}
                                  max={maxLost}
                                  disabled={isCompleted}
                                  allowDecimals={false}
                                  allowNegative={false}
                                  placeholder=""
                                  className={`w-full min-w-0 h-7 sm:h-8 text-center font-bold border rounded-lg text-xs focus:outline-none ${
                                    isCompleted
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500'
                                  }`}
                                />
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Nav Bar */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700 shrink-0">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="px-4 sm:px-5 py-2 rounded-xl font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all text-xs cursor-pointer"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={!hasReturnItems}
                    className={`px-5 py-2 rounded-xl font-bold text-white transition-all text-xs ${
                      hasReturnItems ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-sm' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Return Summary (Centered A4 Preview without Outer White Card + External Navigation + Double-click Full Preview) */}
            {currentStep === 3 && (() => {
              const remainingOutstandingTotal = inspectionItems.reduce(
                (sum, i) => sum + (i.outstandingQty - i.returnQty),
                0
              )
              const hasUnreturnedItems = remainingOutstandingTotal > 0
              const canExtendRental =
                hasUnreturnedItems &&
                (calcResult.netAmount <= 0 ||
                  calcResult.remainingDebtAmount === 0 ||
                  (paymentChannel !== 'UNPAID' && userCollectedAmount >= calcResult.netAmount))

              return (
                <div className="flex-1 min-h-0 h-full w-full grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5 overflow-hidden">
                  {/* Left: Document Preview Area (Centered A4, No outer white card, Outside Prev/Next buttons) */}
                  <div className="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 shadow-inner">
                    {/* Previous Button Zone (Outside A4) */}
                    {availableReturnDocs.length > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevReturnDoc}
                        aria-label="เอกสารก่อนหน้า"
                        className="w-7 sm:w-9 h-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors z-10 shrink-0 cursor-pointer group"
                        title="เอกสารก่อนหน้า (ใบรับคืน / ใบเสร็จรับเงิน)"
                      >
                        <ChevronLeft className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}

                    {/* Multi-Doc Indicator */}
                    {availableReturnDocs.length > 1 && (
                      <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-slate-900/60 text-white text-[10px] font-mono font-bold backdrop-blur-xs shadow-sm">
                        {returnDocIndex + 1} / {availableReturnDocs.length}
                      </div>
                    )}

                    {/* A4 Center Container with Double-click to Full Preview */}
                    <div
                      className="flex-1 min-h-0 min-w-0 h-full relative cursor-pointer"
                      onDoubleClick={() => setIsFullPreviewOpen(true)}
                      title="ดับเบิ้ลคลิกเพื่อดูตัวอย่างเอกสารแบบเต็มจอ"
                    >
                      <A4FitPreview paddingPx={4} align="center">
                        {renderReturnDoc(availableReturnDocs[returnDocIndex])}
                      </A4FitPreview>
                    </div>

                    {/* Next Button Zone (Outside A4) */}
                    {availableReturnDocs.length > 1 && (
                      <button
                        type="button"
                        onClick={handleNextReturnDoc}
                        aria-label="เอกสารถัดไป"
                        className="w-7 sm:w-9 h-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors z-10 shrink-0 cursor-pointer group"
                        title="เอกสารถัดไป (ใบรับคืน / ใบเสร็จรับเงิน / ใบเสร็จค่าชำรุด)"
                      >
                        <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </div>

                  {/* Right: Payment & Summary Panel */}
                  <div className="flex min-h-0 min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 h-full">
                    <div className="flex min-h-0 flex-1 flex-col space-y-1.5 sm:space-y-2 overflow-y-auto pr-0.5">
                      {/* 1. Header */}
                      <div className="flex shrink-0 min-w-0 items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                          <h3 className="truncate whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">
                            สรุปยอดและรับชำระเงิน
                          </h3>
                        </div>
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800 shrink-0">
                          {activeBill.billNo}
                        </span>
                      </div>

                      {/* 2. Fee Breakdown Card */}
                      <div className="shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 p-2 text-xs">
                        <div className="grid grid-cols-2 gap-x-2.5 gap-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">ยอดรวมบิลเดิม:</span>
                            <span className="font-bold tabular-nums">฿{calcResult.persistedGrandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">ชำระแล้ว:</span>
                            <span className="font-bold text-emerald-600 tabular-nums">฿{calcResult.persistedPaidAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">ค่าปรับ ({calcResult.lateDays} วัน):</span>
                            <span className="font-bold text-red-600 tabular-nums">
                              ฿{calcResult.lateFeeTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">ค่าเสียหาย/สูญหาย:</span>
                            <span className="font-bold text-amber-600 tabular-nums">
                              ฿{calcResult.totalDamageFee.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between font-extrabold text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700 pt-0.5 col-span-2">
                            <span>ยอดรวมสุทธิหลังรับคืน:</span>
                            <span className="tabular-nums">฿{calcResult.grandTotalCharge.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Net Amount Banner */}
                      <div
                        className={`shrink-0 rounded-xl p-1.5 sm:p-2 text-center border ${
                          calcResult.netAmount > 0
                            ? 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                            : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        <span className="text-[11px] font-bold opacity-80 block leading-tight">
                          {calcResult.netAmount > 0
                            ? 'ลูกค้าต้องชำระเพิ่ม'
                            : calcResult.netAmount < 0
                            ? 'คืนเงินมัดจำให้ลูกค้า'
                            : 'ชำระครบถ้วนแล้ว (ไม่มีค่าใช้จ่ายเพิ่มเติม)'}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black tabular-nums leading-tight">
                          {calcResult.netAmount > 0 ? '฿' : calcResult.netAmount < 0 ? '- ฿' : '฿'}
                          {Math.abs(calcResult.netAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </h2>
                      </div>

                      {/* 4. Payment Inputs (when netAmount > 0) */}
                      {calcResult.netAmount > 0 && (
                        <div className="shrink-0 space-y-1.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                              ยอดรับชำระจริง (บาท)
                            </label>
                            <NumericInput
                              value={userCollectedAmount}
                              onChange={(val) => {
                                const num = val === '' ? 0 : val
                                setUserCollectedAmount(num)
                                setReceivedCashInput(num > 0 ? num.toString() : '')
                              }}
                              defaultValueOnBlur={0}
                              min={0}
                              max={calcResult.netAmount}
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1 text-base font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 tabular-nums"
                            />
                            <p className="text-[10px] text-slate-400 mt-0.5">* รองรับการจ่ายบางส่วน (Partial Payment)</p>
                          </div>

                          {/* Payment Method Selector */}
                          <PaymentMethodSelector
                            selectedMethod={paymentChannel}
                            onSelectMethod={handleSelectPaymentMethod}
                          />

                          {/* Dynamic Payment Content */}
                          <PaymentDynamicContent
                            paymentMethod={paymentChannel}
                            targetAmount={userCollectedAmount}
                            receivedCashInput={receivedCashInput}
                            onReceivedCashInputChange={setReceivedCashInput}
                            changeAmount={changeAmount}
                            bankRef={bankRef}
                            onBankRefChange={setBankRef}
                            qrCodeUrl={qrCodeUrl}
                            bankQrUrl={business?.bankQrDataUrl}
                            isQrLoading={isQrLoading}
                            promptPayId={promptPayId}
                            unpaidMessage={
                              <>
                                ⚠️ ยอดส่วนต่าง ฿{calcResult.netAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}{' '}
                                จะถูกบันทึกเป็น <strong>&quot;ค้างชำระ (Unpaid)&quot;</strong> ในระบบ
                              </>
                            }
                          />
                        </div>
                      )}
                    </div>

                    {/* 5. Action Buttons Bar */}
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={handleBackStep}
                        className="px-3 sm:px-4 py-2 rounded-xl font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all text-xs min-h-[38px] shrink-0 cursor-pointer"
                      >
                        ย้อนกลับ
                      </button>

                      {hasUnreturnedItems && canExtendRental && (
                        <button
                          type="button"
                          disabled={
                            isSubmitting ||
                            (paymentChannel !== 'UNPAID' && calcResult.netAmount > 0 && userCollectedAmount <= 0)
                          }
                          onClick={() => handleFinalCloseAndConfirmReturn(true)}
                          className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 transition-all shadow-md shadow-blue-600/25 active:scale-[0.99] disabled:opacity-50 min-h-[38px] whitespace-nowrap"
                        >
                          {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกและเช่าต่อ'}
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={
                          isSubmitting ||
                          (paymentChannel !== 'UNPAID' && calcResult.netAmount > 0 && userCollectedAmount <= 0)
                        }
                        onClick={() => handleFinalCloseAndConfirmReturn(false)}
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm py-2 transition-all shadow-md shadow-emerald-600/25 active:scale-[0.99] disabled:opacity-50 min-h-[38px] whitespace-nowrap"
                      >
                        {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })()}
          </>
        )}

        {/* PAYMENT WORKFLOW STEPS */}
        {mode === 'PAYMENT' && activeBill && (
          <>
            {/* STEP 1: Select Items + Item Dates + Payment Date */}
            {currentStep === 1 && (
              <div className="flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden">
                {/* Top Summary & Payment Date Bar */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <DollarSign className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      เลือกรายการ และกำหนดวันที่สำหรับรับชำระ
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800 shrink-0">
                      {activeBill.billNo}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">วันที่ชำระ:</span>
                    <div className="w-32 sm:w-36">
                      <CustomDatePicker
                        value={paymentDate ? new Date(paymentDate) : new Date()}
                        onChange={(d) =>
                          setPaymentDate(
                            d ? d.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                          )
                        }
                        align="right"
                        placeholder="วันที่ชำระ..."
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 min-h-0 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <colgroup>
                      <col className="w-[36px] sm:w-[42px]" />  {/* Checkbox */}
                      <col className="w-[36px] sm:w-[42px]" />  {/* ลำดับ */}
                      <col className="w-auto" />                {/* รายการ */}
                      <col className="w-[84px] sm:w-[100px] lg:w-[115px]" /> {/* วันที่เช่า */}
                      <col className="w-[84px] sm:w-[100px] lg:w-[115px]" /> {/* กำหนดคืน */}
                      <col className="w-[84px] sm:w-[100px] lg:w-[115px]" /> {/* วันคืนจริง */}
                      <col className="w-[56px] sm:w-[68px]" />  {/* วันใช้จริง */}
                      <col className="w-[72px] sm:w-[88px]" />  {/* รวมค่าเช่า */}
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-slate-800 dark:bg-slate-900 text-white font-bold border-b border-slate-700 shadow-xs text-xs">
                      <tr>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">
                          <input
                            type="checkbox"
                            checked={inspectionItems.length > 0 && inspectionItems.every((i) => i.selected)}
                            onChange={handleToggleSelectAll}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            title="เลือก/ยกเลิกทั้งหมด"
                          />
                        </th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">ลำดับ</th>
                        <th className="py-2 px-1.5 bg-slate-800 dark:bg-slate-900 text-white">รายการ</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">วันที่เช่า</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">กำหนดคืน</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">วันคืนจริง</th>
                        <th className="py-2 px-1 text-center bg-slate-800 dark:bg-slate-900 text-white">วันใช้จริง</th>
                        <th className="py-2 px-1.5 text-right bg-slate-800 dark:bg-slate-900 text-white">รวมค่าเช่า</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800 text-[10.5px] sm:text-xs">
                      {inspectionItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400">
                            <p className="font-semibold text-sm">ไม่มีรายการสินค้าที่ต้องเลือก</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                              สามารถชำระยอดค้างของบิลแบบรวมได้ (กดปุ่ม &quot;ชำระรวม&quot; หรือ &quot;ถัดไป&quot;)
                            </p>
                          </td>
                        </tr>
                      ) : (
                        inspectionItems.map((item, idx) => {
                          const itemCalc = computeItemRentalCalculation(
                            item,
                            {
                              rentalStartDate: billRentalStartDate,
                              scheduledReturnDate: billScheduledReturnDate,
                              actualReturnDate,
                            },
                            rentalBilling
                          )

                          return (
                            <tr
                              key={item.rentalBillItemId || item.productId}
                              className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                                !item.selected ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : ''
                              }`}
                            >
                              <td className="py-1 px-1 text-center">
                                <input
                                  type="checkbox"
                                  checked={item.selected ?? true}
                                  onChange={() => handleToggleSelectItem(idx)}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-1 px-1 text-center font-bold text-slate-500">{idx + 1}</td>
                              <td className="py-1 px-1.5 font-bold text-slate-800 dark:text-slate-200 overflow-hidden">
                                <div className="truncate">{item.productName}</div>
                                {item.productCode && (
                                  <span className="text-[9.5px] text-slate-400 font-mono block truncate">
                                    {item.productCode}
                                  </span>
                                )}
                              </td>
                              <td className="py-1 px-1 text-center">
                                <CustomDatePicker
                                  value={parseLocalDate(item.rentalStartDate)}
                                  onChange={(d) =>
                                    handleItemDateChange(
                                      idx,
                                      'rentalStartDate',
                                      d ? getLocalDateString(d) : ''
                                    )
                                  }
                                  align="left"
                                  placeholder="วันที่เช่า..."
                                  className="text-xs"
                                />
                              </td>
                              <td className="py-1 px-1 text-center">
                                <CustomDatePicker
                                  value={parseLocalDate(item.scheduledReturnDate)}
                                  onChange={(d) =>
                                    handleItemDateChange(
                                      idx,
                                      'scheduledReturnDate',
                                      d ? getLocalDateString(d) : ''
                                    )
                                  }
                                  align="left"
                                  placeholder="วันกำหนดคืน..."
                                  className="text-xs"
                                />
                              </td>
                              <td className="py-1 px-1 text-center">
                                <CustomDatePicker
                                  value={parseLocalDate(item.actualReturnDate)}
                                  onChange={(d) =>
                                    handleItemDateChange(
                                      idx,
                                      'actualReturnDate',
                                      d ? getLocalDateString(d) : ''
                                    )
                                  }
                                  align="left"
                                  placeholder="วันคืนจริง..."
                                  className="text-xs"
                                />
                              </td>
                              <td className="py-1 px-1 text-center">
                                <span className="px-1.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-black text-[10.5px] sm:text-[11px] whitespace-nowrap">
                                  {itemCalc.actualRentalDays} วัน
                                </span>
                              </td>
                              <td className="py-1 px-1.5 text-right font-black text-slate-900 dark:text-slate-100 tabular-nums truncate">
                                ฿{itemCalc.itemRentalFee.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Nav Bar with "ชำระรวม" Shortcut */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700 shrink-0">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="px-4 sm:px-5 py-2 rounded-xl font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all text-xs cursor-pointer"
                  >
                    ย้อนกลับ
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePayAllShortcut}
                      disabled={activeBill.outstandingAmount <= 0 || activeBill.paymentStatus === 'PAID'}
                      className={`px-4 sm:px-5 py-2 rounded-xl font-black text-white transition-all text-xs shadow-md shadow-emerald-600/20 active:scale-[0.99] ${
                        activeBill.outstandingAmount > 0 && activeBill.paymentStatus !== 'PAID'
                          ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                          : 'bg-slate-300 cursor-not-allowed'
                      }`}
                      title="คำนวณยอดค้างชำระทั้งหมดและไปหน้าสรุปรับชำระทันที"
                    >
                      ชำระรวม
                    </button>
                    <button
                      type="button"
                      onClick={handlePaymentStep1Next}
                      disabled={activeBill.outstandingAmount <= 0 || activeBill.paymentStatus === 'PAID'}
                      className={`px-4 sm:px-5 py-2 rounded-xl font-bold text-white transition-all text-xs shadow-md shadow-blue-600/20 active:scale-[0.99] ${
                        activeBill.outstandingAmount > 0 && activeBill.paymentStatus !== 'PAID'
                          ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                          : 'bg-slate-300 cursor-not-allowed'
                      }`}
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Amount & Payment Method */}
            {currentStep === 2 && (
              <div className="flex-1 min-h-0 h-full w-full grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5 overflow-hidden">
                {/* Left: Document Preview Area */}
                <div className="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 shadow-inner">
                  <div
                    className="flex-1 min-h-0 min-w-0 h-full relative cursor-pointer"
                    onDoubleClick={() => setIsFullPreviewOpen(true)}
                    title="ดับเบิ้ลคลิกเพื่อดูตัวอย่างเอกสารแบบเต็มจอ"
                  >
                    <A4FitPreview paddingPx={4} align="center">
                      {renderPaymentDoc()}
                    </A4FitPreview>
                  </div>
                </div>

                {/* Right: Payment Panel */}
                <div className="flex min-h-0 min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 h-full">
                  <div className="flex min-h-0 flex-1 flex-col space-y-1.5 sm:space-y-2 overflow-y-auto pr-0.5">
                    {/* 1. Header */}
                    <div className="flex shrink-0 min-w-0 items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <DollarSign className="w-4 h-4 text-blue-600 shrink-0" />
                        <h3 className="truncate whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">
                          ระบุยอดที่ต้องการชำระ
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800 shrink-0">
                        {activeBill.billNo}
                      </span>
                    </div>

                    {/* 2. Outstanding Amount Card & Date Picker */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
                      <div className="rounded-xl bg-gradient-to-r from-red-600 to-rose-700 p-2.5 text-white shadow-xs flex flex-col justify-center">
                        <span className="text-[11px] text-red-100 block font-medium leading-tight">
                          ยอดค้างชำระทั้งหมด
                        </span>
                        <span className="whitespace-nowrap text-lg sm:text-xl font-black tracking-tight block leading-tight">
                          ฿{activeBill.outstandingAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                          วันที่ชำระเงิน
                        </label>
                        <CustomDatePicker
                          value={paymentDate ? new Date(paymentDate) : new Date()}
                          onChange={(d) =>
                            setPaymentDate(
                              d ? d.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                            )
                          }
                          align="left"
                          placeholder="เลือกวันที่ชำระ..."
                        />
                      </div>
                    </div>

                    {/* 3. Collected Amount Input */}
                    <div className="shrink-0 space-y-1">
                      <label className="block text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                        ระบุยอดรับชำระเงิน (บาท)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">฿</span>
                        <NumericInput
                          value={userCollectedAmount}
                          onChange={(val) => {
                            const num = val === '' ? 0 : val
                            setUserCollectedAmount(num)
                            setReceivedCashInput(num > 0 ? num.toString() : '')
                          }}
                          defaultValueOnBlur={0}
                          min={0}
                          max={activeBill.outstandingAmount}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl border-2 border-blue-200 focus:border-blue-500 bg-white dark:bg-slate-900 font-black text-lg text-slate-800 dark:text-slate-100 tabular-nums"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold">* รองรับการจ่ายบางส่วน (Partial Payment)</p>
                    </div>

                    {/* 4-5. Atomic Split Tender */}
                    <SplitTenderEditor
                      outstandingAmount={activeBill.outstandingAmount}
                      tenders={splitTenders}
                      createTender={createSplitTender}
                      disabled={isSubmitting}
                      onChange={(next) => {
                        setSplitTenders(next)
                        const total = next.reduce((sum, tender) => sum + Math.max(0, Number(tender.amount) || 0), 0)
                        setUserCollectedAmount(total)
                      }}
                    />
                  </div>

                  {/* 6. Action Buttons */}
                  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="px-3.5 sm:px-4 py-2 rounded-xl font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all text-xs min-h-[38px] shrink-0 cursor-pointer"
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      type="button"
                      disabled={
                        isSubmitting ||
                        (paymentChannel !== 'UNPAID' &&
                          (userCollectedAmount <= 0 || userCollectedAmount > activeBill.outstandingAmount))
                      }
                      onClick={handleFinalConfirmPayment}
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm py-2 transition-all shadow-md shadow-blue-600/25 active:scale-[0.99] disabled:opacity-50 min-h-[38px] whitespace-nowrap cursor-pointer"
                    >
                      {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกและออกบิล'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Full-screen / Full-area Preview Modal (Activated by Double-clicking A4) */}
      {isFullPreviewOpen && activeBill && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 select-none cursor-pointer"
            onClick={() => setIsFullPreviewOpen(false)}
            title="แตะหรือคลิกที่ใดก็ได้เพื่อปิดตัวอย่างแบบเต็มจอ"
          >
            <div
              className="w-full h-full max-w-5xl max-h-full flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation()
                setIsFullPreviewOpen(false)
              }}
            >
              <A4FitPreview paddingPx={0} align="center">
                {mode === 'RETURN'
                  ? renderReturnDoc(availableReturnDocs[returnDocIndex])
                  : renderPaymentDoc()}
              </A4FitPreview>
            </div>

            {/* Floating Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsFullPreviewOpen(false)
              }}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white shadow-2xl transition-all border border-slate-600 z-[110]"
              aria-label="ปิดตัวอย่างเต็มจอ"
              title="ปิดตัวอย่างเต็มจอ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </ModalPortal>
      )}

      {/* Post-Save Print Confirmation Modal */}
      <PostSavePrintModal
        isOpen={postSavePrintModal.isOpen}
        title={postSavePrintModal.title}
        description={postSavePrintModal.description}
        onPrint={() => {
          if (mode === 'RETURN') {
            handlePrintReturnDocs(savedReturnInfo || undefined)
          } else {
            handlePrintPaymentDocs(savedPaymentInfo || undefined)
          }
        }}
        onClose={() => {
          setPostSavePrintModal({ isOpen: false, title: '', description: '' })
          onClose()
        }}
      />
    </div>
  )
}


