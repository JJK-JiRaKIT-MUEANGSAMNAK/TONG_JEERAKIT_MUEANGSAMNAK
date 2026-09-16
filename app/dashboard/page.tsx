'use client'

import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  DollarSign,
  Package,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import { loadTransactions } from '@/lib/finance-storage'
import { loadBills } from '@/lib/bill-storage'
import { loadProducts } from '@/lib/product-storage'
import { loadReservations } from '@/lib/reservation-storage'
import { loadNotifications } from '@/lib/notification-storage'
import { computeDashboardMetrics } from '@/lib/dashboard-data'
import { AssetsTransactionView } from '@/components/dashboard/AssetsTransactionView'
import { StockManagementView } from '@/components/dashboard/StockManagementView'
import { BusinessAnalyticsView } from '@/components/dashboard/BusinessAnalyticsView'

function DashboardContent() {
  const searchParams = useSearchParams()
  const viewParam = searchParams.get('view') || 'assets'

  const [activeTab, setActiveTab] = useState<'assets' | 'stock' | 'business'>('assets')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (viewParam === 'stock' || viewParam === 'business' || viewParam === 'assets') {
      setActiveTab(viewParam)
    } else {
      setActiveTab('assets')
    }
  }, [viewParam])

  // Listen to storage update events
  useEffect(() => {
    const handleStorageUpdate = () => {
      setRefreshKey((prev) => prev + 1)
    }
    window.addEventListener('storage', handleStorageUpdate)
    window.addEventListener('app-storage-update', handleStorageUpdate)
    window.addEventListener('app_settings_changed', handleStorageUpdate)
    return () => {
      window.removeEventListener('storage', handleStorageUpdate)
      window.removeEventListener('app-storage-update', handleStorageUpdate)
      window.removeEventListener('app_settings_changed', handleStorageUpdate)
    }
  }, [])

  // Compute metrics from actual domain persistence
  const metrics = useMemo(() => {
    const txs = loadTransactions()
    const bills = loadBills()
    const products = loadProducts()
    const reservations = loadReservations()
    const notifications = loadNotifications()

    return computeDashboardMetrics(txs, bills, products, reservations, notifications)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  const handleManualRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="p-2 sm:p-3 md:p-3.5 lg:p-4 text-slate-900 dark:text-slate-100 min-w-0 max-w-full overflow-x-hidden space-y-3">
      {/* View Switcher Tabs Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl border border-slate-300/70 dark:border-slate-700/70">
          <button
            type="button"
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'assets'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>ธุรกรรมสินทรัพย์</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>บริหารงานสต็อก</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'business'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>วิเคราะห์ธุรกิจ</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700/80 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
          title="รีเฟรชข้อมูล"
          aria-label="รีเฟรชข้อมูล"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Render Active View */}
      {activeTab === 'assets' && <AssetsTransactionView metrics={metrics} />}
      {activeTab === 'stock' && <StockManagementView metrics={metrics} />}
      {activeTab === 'business' && <BusinessAnalyticsView metrics={metrics} />}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}
