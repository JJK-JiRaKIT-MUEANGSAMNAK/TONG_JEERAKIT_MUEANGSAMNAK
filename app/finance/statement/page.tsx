'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { Plus, FileSpreadsheet, Search, TrendingUp, TrendingDown, Wallet, Settings, ChevronLeft, Pencil, Trash2, Check, X } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'
import { NumericInput } from '@/components/common/NumericInput'
import { CustomDatePicker, getLocalDateString } from '@/components/common/CustomDatePicker'
import { useToast } from '@/components/common/Toast'
import { logger } from '@/lib/utils/logger'
import * as XLSX from 'xlsx'
import { loadTransactions as fetchTransactions, addTransaction } from '@/lib/finance-storage'

interface StatementTransaction {
  id: string
  dateTime: string
  refNo: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  description: string
  customerName?: string
  incomeAmount: number
  expenseAmount: number
  runningBalance: number
  channel: string
}

export default function StatementPage() {
  const [incomeCategories, setIncomeCategories] = useState<Array<{ id: string; label: string }>>([])
  const [expenseCategories, setExpenseCategories] = useState<Array<{ id: string; label: string }>>([])

  const addIncomeCategory = (label: string) => setIncomeCategories((prev) => [...prev, { id: 'inc-' + Date.now(), label }])
  const updateIncomeCategory = (id: string, label: string) => setIncomeCategories((prev) => prev.map((c) => (c.id === id ? { ...c, label } : c)))
  const removeIncomeCategory = (id: string) => setIncomeCategories((prev) => prev.filter((c) => c.id !== id))

  const addExpenseCategory = (label: string) => setExpenseCategories((prev) => [...prev, { id: 'exp-' + Date.now(), label }])
  const updateExpenseCategory = (id: string, label: string) => setExpenseCategories((prev) => prev.map((c) => (c.id === id ? { ...c, label } : c)))
  const removeExpenseCategory = (id: string) => setExpenseCategories((prev) => prev.filter((c) => c.id !== id))

  const { showToast } = useToast()
  const [transactions, setTransactions] = useState<StatementTransaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const loadTransactions = React.useCallback(async () => {
    const list = fetchTransactions()
    setTransactions(list)
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  // Form State for manual entry (Quick Item + Manual Description)
  const [modalView, setModalView] = useState<'FORM' | 'MANAGE_CATEGORIES'>('FORM')
  const [manualType, setManualType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [quickItem, setQuickItem] = useState('')
  const [manualDesc, setManualDesc] = useState('')
  const [manualAmount, setManualAmount] = useState<number>(0)
  const [manualChannel, setManualChannel] = useState('เงินสด')

  // Quick Item Manager internal state
  const [categoryManageType, setCategoryManageType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [newCatLabel, setNewCatLabel] = useState('')
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editingCatLabel, setEditingCatLabel] = useState('')

  // Active quick item list based on current manualType
  const activeQuickItems = useMemo(() => {
    return manualType === 'INCOME' ? incomeCategories : expenseCategories
  }, [manualType, incomeCategories, expenseCategories])

  const quickItemOptions = useMemo(() => {
    return [
      { value: '', label: '-- เลือกรายการด่วน (ไม่ระบุก็ได้) --' },
      ...activeQuickItems.map((c) => ({
        value: c.label,
        label: c.label,
      })),
    ]
  }, [activeQuickItems])

  // Quick items list for management tab
  const manageTargetList = useMemo(() => {
    return categoryManageType === 'INCOME' ? incomeCategories : expenseCategories
  }, [categoryManageType, incomeCategories, expenseCategories])

  // Reset quickItem if no longer in active list
  useEffect(() => {
    if (quickItem && !activeQuickItems.some((c) => c.label === quickItem)) {
      setQuickItem('')
    }
  }, [manualType, activeQuickItems, quickItem])

  // Date Range Filtered Transactions [startDate, endDate]
  const dateFilteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!startDate && !endDate) return true

      const tDateStr = t.dateTime.substring(0, 10)

      if (startDate && endDate) {
        const fromStr = getLocalDateString(startDate)
        const toStr = getLocalDateString(endDate)
        return tDateStr >= fromStr && tDateStr <= toStr
      }

      if (startDate) {
        const fromStr = getLocalDateString(startDate)
        return tDateStr >= fromStr
      }

      if (endDate) {
        const toStr = getLocalDateString(endDate)
        return tDateStr <= toStr
      }

      return true
    })
  }, [transactions, startDate, endDate])

  // Summary Metrics calculated according to the selected date filter
  const totalIncome = useMemo(() => {
    return dateFilteredTransactions.reduce((sum, t) => sum + (t.type === 'INCOME' ? t.incomeAmount : 0), 0)
  }, [dateFilteredTransactions])

  const totalExpense = useMemo(() => {
    return dateFilteredTransactions.reduce((sum, t) => sum + (t.type === 'EXPENSE' ? t.expenseAmount : 0), 0)
  }, [dateFilteredTransactions])

  const netBalance = totalIncome - totalExpense

  // Combined Filtered Transactions (Date + Search + Type)
  const filtered = useMemo(() => {
    return dateFilteredTransactions.filter((t) => {
      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = typeFilter === 'ALL' || t.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [dateFilteredTransactions, searchTerm, typeFilter])

  const handleExportExcel = () => {
    const dataToExport = filtered.map((t) => ({
      'วัน-เวลา': t.dateTime,
      'เลขที่รายการ': t.refNo,
      'ประเภท': t.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย',
      'รายละเอียด': t.description,
      'ลูกค้า': t.customerName || '-',
      'เงินเข้า (บาท)': t.incomeAmount,
      'เงินออก (บาท)': t.expenseAmount,
      'คงเหลือ (บาท)': t.runningBalance,
      'ช่องทาง': t.channel,
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Financial Statement')
    XLSX.writeFile(wb, `Financial_Statement_${getLocalDateString(new Date())}.xlsx`)
  }

  const handleAddManualTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (manualAmount <= 0) {
      showToast('จำนวนเงินไม่ถูกต้อง', 'กรุณาระบุจำนวนเงินที่มากกว่า 0', 'ERROR')
      return
    }

    const trimmedQuick = (quickItem || '').trim()
    const trimmedManual = (manualDesc || '').trim()

    let finalDescription = ''
    if (trimmedQuick && trimmedManual) {
      finalDescription = `${trimmedQuick} - ${trimmedManual}`
    } else if (trimmedQuick) {
      finalDescription = trimmedQuick
    } else if (trimmedManual) {
      finalDescription = trimmedManual
    }

    if (!finalDescription) {
      showToast('กรุณาระบุรายละเอียด', 'ต้องเลือกรายการด่วนหรือกรอกรายละเอียดเพิ่มเติมอย่างน้อย 1 อย่าง', 'ERROR')
      return
    }

    const fallbackCategory = manualType === 'INCOME' ? 'รายรับอื่นๆ' : 'ค่าใช้จ่ายทั่วไป'
    const categoryToSave = trimmedQuick || fallbackCategory

    const newTx: StatementTransaction = {
      id: `tx-${Date.now()}`,
      dateTime: new Date().toISOString(),
      refNo: `TX-${Date.now().toString().slice(-6)}`,
      type: manualType,
      category: categoryToSave,
      description: finalDescription,
      incomeAmount: manualType === 'INCOME' ? manualAmount : 0,
      expenseAmount: manualType === 'EXPENSE' ? manualAmount : 0,
      runningBalance: manualAmount,
      channel: manualChannel,
    }

    addTransaction(newTx)
    setTransactions((prev) => [newTx, ...prev])
    setShowAddModal(false)
    setManualAmount(0)
    setQuickItem('')
    setManualDesc('')
    showToast('บันทึกรายการสำเร็จ', `บันทึกรายการ ${newTx.refNo} เรียบร้อยแล้ว`, 'SUCCESS')
  }

  const handleCreateCategory = async () => {
    const trimmed = newCatLabel.trim()
    if (!trimmed) return
    if (categoryManageType === 'INCOME') {
      await addIncomeCategory(trimmed)
    } else {
      await addExpenseCategory(trimmed)
    }
    setNewCatLabel('')
    if (categoryManageType === manualType) {
      setQuickItem(trimmed)
    }
  }

  const handleSaveEditCategory = async (id: string) => {
    const trimmed = editingCatLabel.trim()
    if (!trimmed) return
    if (categoryManageType === 'INCOME') {
      await updateIncomeCategory(id, trimmed)
    } else {
      await updateExpenseCategory(id, trimmed)
    }
    setEditingCatId(null)
  }

  const handleDeleteCategory = async (id: string, label: string) => {
    if (categoryManageType === 'INCOME') {
      await removeIncomeCategory(id)
    } else {
      await removeExpenseCategory(id)
    }
    if (quickItem === label) {
      setQuickItem('')
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden p-2 bg-slate-100 dark:bg-slate-900 gap-2 text-xs">

      {/* Summary Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 sm:p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block">รายรับรวม</span>
            <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              ฿{totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-2 sm:p-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-300">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-950/30 p-2.5 sm:p-3 rounded-2xl border border-red-200/60 dark:border-red-900/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-red-700 dark:text-red-300 font-semibold block">รายจ่ายรวม</span>
            <h3 className="text-lg sm:text-xl font-black text-red-600 dark:text-red-400 mt-0.5">
              ฿{totalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-2 sm:p-2.5 bg-red-100 dark:bg-red-900/50 rounded-xl text-red-600 dark:text-red-300">
            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className={`p-2.5 sm:p-3 rounded-2xl border shadow-sm flex items-center justify-between ${
          netBalance >= 0
            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40'
            : 'bg-red-50 dark:bg-red-950/30 border-red-200/60 dark:border-red-900/40'
        }`}>
          <div>
            <span className={`text-[11px] font-semibold block ${netBalance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
              คงเหลือสุทธิ
            </span>
            <h3 className={`text-lg sm:text-xl font-black mt-0.5 ${netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              ฿{netBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className={`p-2 sm:p-2.5 rounded-xl ${netBalance >= 0 ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300'}`}>
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-2 border-b border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2">
          
          {/* Search & Type Filters & 2 DatePickers */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            <div className="relative min-w-[140px] flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาเลขที่, รายละเอียด..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="h-9 flex items-center bg-slate-100 dark:bg-slate-900 p-1 gap-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setTypeFilter('ALL')}
                className={`h-7 px-3.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center justify-center ${typeFilter === 'ALL' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-500'}`}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('INCOME')}
                className={`h-7 px-3.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center justify-center ${typeFilter === 'INCOME' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-slate-500'}`}
              >
                เข้า
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('EXPENSE')}
                className={`h-7 px-3.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center justify-center ${typeFilter === 'EXPENSE' ? 'bg-white dark:bg-slate-800 text-red-600 shadow-xs' : 'text-slate-500'}`}
              >
                ออก
              </button>
            </div>

            {/* Central 2-Calendar Date Range Filter: [จากวันที่] ถึง [ถึงวันที่] */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-34 sm:w-40">
                <CustomDatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="จากวันที่"
                  align="left"
                  showClear={true}
                  buttonClassName="h-9 px-2.5 py-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold hover:border-slate-300 dark:hover:border-slate-600"
                />
              </div>
              <span className="text-slate-400 font-bold text-xs shrink-0">ถึง</span>
              <div className="w-34 sm:w-40">
                <CustomDatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="ถึงวันที่"
                  align="left"
                  showClear={true}
                  buttonClassName="h-9 px-2.5 py-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold hover:border-slate-300 dark:hover:border-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Right Actions: Excel & Add Statement */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportExcel}
              className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModalView('FORM')
                setShowAddModal(true)
              }}
              className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกรายการ</span>
            </button>
          </div>

        </div>

        {/* Table Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
          <table className={`w-full table-fixed text-left text-xs leading-tight border-collapse ${filtered.length === 0 ? 'h-full' : ''}`}>
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-bold z-10">
              <tr>
                <th className="w-[13%] py-2 px-3 whitespace-nowrap">วัน-เวลา</th>
                <th className="w-[13%] py-2 px-3 whitespace-nowrap">เลขที่เอกสาร</th>
                <th className="w-[30%] py-2 px-3 whitespace-nowrap">รายละเอียด</th>
                <th className="w-[10%] py-2 px-3 whitespace-nowrap">ช่องทาง</th>
                <th className="w-[11%] py-2 px-3 text-right whitespace-nowrap">เงินเข้า</th>
                <th className="w-[11%] py-2 px-3 text-right whitespace-nowrap">เงินออก</th>
                <th className="w-[12%] py-2 px-3 text-right whitespace-nowrap">คงเหลือ</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 ${filtered.length === 0 ? 'h-full' : ''}`}>
              {filtered.length === 0 ? (
                <tr className="h-full">
                  <td colSpan={7} className="h-full px-4 text-center text-slate-400 italic align-middle">
                    <div className="flex flex-col items-center justify-center py-6">
                      <p className="font-bold text-xs text-slate-600 dark:text-slate-400">ไม่พบรายการความเคลื่อนไหวทางการเงิน</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-1.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px] truncate">{t.dateTime}</td>
                    <td className="py-1.5 px-3 whitespace-nowrap font-bold text-slate-900 dark:text-slate-100 truncate">{t.refNo}</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-800 dark:text-slate-200 truncate" title={t.description}>
                      {t.description}
                    </td>
                    <td className="py-1.5 px-3 whitespace-nowrap text-slate-500 truncate">{t.channel}</td>
                    <td className="py-1.5 px-3 whitespace-nowrap text-right font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {t.incomeAmount > 0 ? `+฿${t.incomeAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-1.5 px-3 whitespace-nowrap text-right font-black text-red-600 dark:text-red-400 tabular-nums">
                      {t.expenseAmount > 0 ? `-฿${t.expenseAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-1.5 px-3 whitespace-nowrap text-right font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                      ฿{t.runningBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Manual Transaction & Inline Category Management Modal */}
      <AppModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setModalView('FORM')
        }}
        size="md"
      >
        {/* VIEW 1: Main Transaction Form */}
        {modalView === 'FORM' && (
          <>
            <AppModalHeader
              onClose={() => setShowAddModal(false)}
              icon={<Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              title="เพิ่มรายรับ/รายจ่าย"
            />

            <form onSubmit={handleAddManualTransaction} className="flex-1 min-h-0 flex flex-col">
              <AppModalBody className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ประเภทรายการ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setManualType('INCOME')}
                      className={`h-9 py-0 rounded-xl font-bold border transition-colors cursor-pointer flex items-center justify-center text-xs ${manualType === 'INCOME' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                    >
                      รายรับ (เงินเข้า)
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualType('EXPENSE')}
                      className={`h-9 py-0 rounded-xl font-bold border transition-colors cursor-pointer flex items-center justify-center text-xs ${manualType === 'EXPENSE' ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                    >
                      รายจ่าย (เงินออก)
                    </button>
                  </div>
                </div>

                {/* Quick Item Selection with Inline Gear Button */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">รายการด่วน</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <CustomSelect
                        value={quickItem}
                        onChange={(val) => setQuickItem(String(val))}
                        options={quickItemOptions}
                        placeholder="-- เลือกรายการด่วน (ไม่ระบุก็ได้) --"
                        buttonClassName="h-9 px-2.5 py-0 rounded-xl text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryManageType(manualType)
                        setModalView('MANAGE_CATEGORIES')
                      }}
                      className="h-9 w-9 p-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
                      title="จัดการรายการด่วน"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">จำนวนเงิน (บาท)</label>
                  <NumericInput
                    value={manualAmount || ''}
                    onChange={(val) => setManualAmount(val === '' ? 0 : val)}
                    defaultValueOnBlur={0}
                    min={0}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ช่องทางชำระเงิน</label>
                  <CustomSelect
                    value={manualChannel}
                    onChange={(val) => setManualChannel(String(val))}
                    buttonClassName="h-9 px-2.5 py-0 rounded-xl text-xs"
                    options={[
                      { value: 'เงินสด', label: 'เงินสด' },
                      { value: 'โอนธนาคาร', label: 'โอนธนาคาร' },
                      { value: 'PromptPay QR', label: 'PromptPay QR' },
                      { value: 'เช็ค', label: 'เช็ค' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">รายละเอียดเพิ่มเติม</label>
                  <textarea
                    value={manualDesc}
                    onChange={(e) => setManualDesc(e.target.value)}
                    rows={2}
                    placeholder="กรอกรายละเอียดเพิ่มเติม หรือระบุรายละเอียดเอง..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </AppModalBody>

              <AppModalFooter>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-9 px-4 py-0 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer text-xs flex items-center justify-center"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 py-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center justify-center"
                >
                  บันทึกรายการ
                </button>
              </AppModalFooter>
            </form>
          </>
        )}

        {/* VIEW 2: Inline Quick Item Management View (Same Modal Window) */}
        {modalView === 'MANAGE_CATEGORIES' && (
          <>
            <AppModalHeader
              onClose={() => {
                setShowAddModal(false)
                setModalView('FORM')
              }}
              icon={<Settings className="w-5 h-5 text-blue-600" />}
              title="จัดการรายการด่วน"
              headerActions={
                <button
                  type="button"
                  onClick={() => setModalView('FORM')}
                  className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="กลับสู่ฟอร์ม"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>กลับ</span>
                </button>
              }
            />

            <AppModalBody className="space-y-4 text-xs">
              {/* Sub-tab: Income vs Expense */}
              <div className="h-9 grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCategoryManageType('INCOME')}
                  className={`h-7 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                    categoryManageType === 'INCOME'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  รายการด่วนรายรับ
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryManageType('EXPENSE')}
                  className={`h-7 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                    categoryManageType === 'EXPENSE'
                      ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  รายการด่วนรายจ่าย
                </button>
              </div>

              {/* Add new Quick Item Input */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  เพิ่มรายการด่วน{categoryManageType === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}ใหม่
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    placeholder={`ชื่อรายการด่วน${categoryManageType === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}...`}
                    className="h-9 flex-1 px-3 py-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateCategory()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCatLabel.trim()}
                    className="h-9 px-3.5 py-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่ม
                  </button>
                </div>
              </div>

              {/* List of Quick Items */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                <label className="block font-semibold text-slate-500 text-[11px]">
                  รายการด่วนปัจจุบัน ({manageTargetList.length})
                </label>
                {manageTargetList.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    ยังไม่มีรายการด่วน
                  </div>
                ) : (
                  manageTargetList.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
                    >
                      {editingCatId === cat.id ? (
                        <div className="flex items-center gap-1.5 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingCatLabel}
                            onChange={(e) => setEditingCatLabel(e.target.value)}
                            className="flex-1 px-2.5 py-1 rounded-lg border border-blue-400 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditCategory(cat.id)
                              if (e.key === 'Escape') setEditingCatId(null)
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditCategory(cat.id)}
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                            title="บันทึก"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="p-1 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 cursor-pointer"
                            title="ยกเลิก"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{cat.label}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCatId(cat.id)
                                setEditingCatLabel(cat.label)
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              title="แก้ไข"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id, cat.label)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              title="ลบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </AppModalBody>

            <AppModalFooter>
              <button
                type="button"
                onClick={() => setModalView('FORM')}
                className="w-full h-9 py-0 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-xs transition-colors cursor-pointer text-center shadow-sm flex items-center justify-center"
              >
                เสร็จสิ้น / กลับสู่หน้าฟอร์ม
              </button>
            </AppModalFooter>
          </>
        )}
      </AppModal>

    </div>
  )
}
