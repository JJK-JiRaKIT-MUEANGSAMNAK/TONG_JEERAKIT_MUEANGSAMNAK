'use client'

import React, { useState, useMemo, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Wallet,
  ShoppingBag,
  Clock,
  Truck,
  Package,
  LineChart,
} from 'lucide-react'
import { ReportFilter } from '@/components/reports/ReportFilter'
import { FinanceReportView } from '@/components/reports/FinanceReportView'
import { SalesRentalReportView } from '@/components/reports/SalesRentalReportView'
import { OperationsReportView } from '@/components/reports/OperationsReportView'
import { StockReportView } from '@/components/reports/StockReportView'
import { BusinessReportView } from '@/components/reports/BusinessReportView'
import {
  ReportDateFilter,
  getFinanceReportData,
  getSalesRentalReportData,
  getOperationsReportData,
  getStockReportData,
  getBusinessReportData,
} from '@/lib/report-data'

function getInitialDates(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  return { start, end }
}

const VIEW_TITLES: Record<string, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
  finance: {
    title: 'รายงานการเงิน',
    subtitle: 'สรุปรายรับ รายจ่าย สุทธิ ลูกหนี้ค้าง เงินมัดจำ และช่องทางรับเงิน',
    icon: Wallet,
  },
  'sales-rental': {
    title: 'รายงานขาย เช่า และเอกสาร',
    subtitle: 'ยอดขายสินค้า รายได้การเช่า บิล ใบเสนอราคา และงานเช่าปัจจุบัน',
    icon: ShoppingBag,
  },
  operations: {
    title: 'รายงานงานปฏิบัติการ',
    subtitle: 'งานส่งมอบ งานรับคืน การจองสินค้า และภารกิจที่ต้องจัดการ',
    icon: Truck,
  },
  stock: {
    title: 'รายงานสต็อกและสินค้า',
    subtitle: 'สต็อกพร้อมใช้ สัดส่วนสถานะ ชำรุด/สูญหาย และสินค้าทำเงินสูงสุด',
    icon: Package,
  },
  business: {
    title: 'รายงานวิเคราะห์ธุรกิจ',
    subtitle: 'อัตราการเติบโต ลูกค้าหลัก แนวโน้มรายได้ และการจัดอันดับ',
    icon: LineChart,
  },
}

function ReportsWorkspace() {
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') || 'finance'

  // Date filter state
  const initial = useMemo(() => getInitialDates(), [])
  const [startDate, setStartDate] = useState<Date>(initial.start)
  const [endDate, setEndDate] = useState<Date>(initial.end)
  const [preset, setPreset] = useState<string>('this_month')
  const [granularity, setGranularity] = useState<'daily' | 'monthly'>('daily')
  const [refreshKey, setRefreshKey] = useState<number>(0)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Handle Preset Changes
  const handlePresetChange = useCallback((newPreset: string) => {
    setPreset(newPreset)
    const now = new Date()
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    if (newPreset === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      setStartDate(todayStart)
      setEndDate(todayEnd)
      setGranularity('daily')
    } else if (newPreset === 'last_7_days') {
      const start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      start.setHours(0, 0, 0, 0)
      setStartDate(start)
      setEndDate(todayEnd)
      setGranularity('daily')
    } else if (newPreset === 'last_30_days') {
      const start = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
      start.setHours(0, 0, 0, 0)
      setStartDate(start)
      setEndDate(todayEnd)
      setGranularity('daily')
    } else if (newPreset === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
      setStartDate(start)
      setEndDate(todayEnd)
      setGranularity('daily')
    } else if (newPreset === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0)
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      setStartDate(start)
      setEndDate(end)
      setGranularity('daily')
    } else if (newPreset === 'this_year') {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
      setStartDate(start)
      setEndDate(todayEnd)
      setGranularity('monthly')
    } else if (newPreset === 'all') {
      const start = new Date(2020, 0, 1, 0, 0, 0)
      setStartDate(start)
      setEndDate(todayEnd)
      setGranularity('monthly')
    }
  }, [])

  const handleStartDateChange = useCallback((d: Date | null) => {
    if (d) {
      setStartDate(d)
      setPreset('custom')
    }
  }, [])

  const handleEndDateChange = useCallback((d: Date | null) => {
    if (d) {
      setEndDate(d)
      setPreset('custom')
    }
  }, [])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setRefreshKey((k) => k + 1)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 400)
  }, [])

  // Filter Object
  const filter: ReportDateFilter = useMemo(
    () => ({
      startDate,
      endDate,
      granularity,
    }),
    [startDate, endDate, granularity, refreshKey]
  )

  // Report Data
  const financeData = useMemo(() => {
    if (currentView === 'finance') return getFinanceReportData(filter)
    return null
  }, [currentView, filter])

  const salesRentalData = useMemo(() => {
    if (currentView === 'sales-rental') return getSalesRentalReportData(filter)
    return null
  }, [currentView, filter])

  const operationsData = useMemo(() => {
    if (currentView === 'operations') return getOperationsReportData(filter)
    return null
  }, [currentView, filter])

  const stockData = useMemo(() => {
    if (currentView === 'stock') return getStockReportData(filter)
    return null
  }, [currentView, filter])

  const businessData = useMemo(() => {
    if (currentView === 'business') return getBusinessReportData(filter)
    return null
  }, [currentView, filter])

  const viewConfig = VIEW_TITLES[currentView] || VIEW_TITLES.finance
  const Icon = viewConfig.icon

  return (
    <div className="p-2 space-y-2 min-h-screen bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 select-none">
      {/* ─── Header: View Title & Subtitle (No Tabs) ───────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate tracking-tight">
              {viewConfig.title}
            </h1>
            <p className="text-[10px] text-slate-400 truncate">
              {viewConfig.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Global Compact Filter Bar (Topic 7 Filter) ────────────────────── */}
      <ReportFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        preset={preset}
        onPresetChange={handlePresetChange}
        granularity={granularity}
        onGranularityChange={setGranularity}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* ─── Report Content By View ────────────────────────────────────────── */}
      {currentView === 'finance' && financeData && (
        <FinanceReportView data={financeData} />
      )}

      {currentView === 'sales-rental' && salesRentalData && (
        <SalesRentalReportView data={salesRentalData} />
      )}

      {currentView === 'operations' && operationsData && (
        <OperationsReportView data={operationsData} />
      )}

      {currentView === 'stock' && stockData && (
        <StockReportView data={stockData} />
      )}

      {currentView === 'business' && businessData && (
        <BusinessReportView data={businessData} />
      )}
    </div>
  )
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-xs text-slate-400 flex items-center justify-center min-h-[200px]">
          กำลังโหลดข้อมูลรายงานสรุป...
        </div>
      }
    >
      <ReportsWorkspace />
    </Suspense>
  )
}
