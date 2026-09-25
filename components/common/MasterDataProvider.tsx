'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { loadProducts, setCachedProducts } from '@/lib/product-storage'
import { loadCategories, setCachedCategories } from '@/lib/category-rules-storage'
import { loadUnits, setCachedUnits } from '@/lib/unit-storage'
import { loadCustomers, setCachedCustomers } from '@/lib/customer-storage'
import { fetchProductsFromSupabase, fetchCategoriesFromSupabase, fetchUnitsFromSupabase } from '@/lib/repositories/product-repository'
import { fetchCustomersFromSupabase } from '@/lib/repositories/customer-repository'
import { fetchBillsFromSupabase, setCachedBills } from '@/lib/bill-storage'
import { fetchQuotationsFromSupabase, setCachedQuotations } from '@/lib/quotation-storage'
import { fetchAppointmentsFromSupabase, setCachedAppointments } from '@/lib/appointment-storage'
import { fetchTransactionsFromSupabase, setCachedTransactions } from '@/lib/finance-storage'
import { fetchReservationsFromSupabase, setCachedReservations } from '@/lib/reservation-storage'
import { fetchBackordersFromSupabase, setCachedBackorders } from '@/lib/backorder-storage'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/contexts/AuthContext'

interface MasterDataContextType {
  isLoaded: boolean
  error: Error | null
}

const MasterDataContext = createContext<MasterDataContextType>({ isLoaded: false, error: null })

export function useMasterData() {
  return useContext(MasterDataContext)
}

export function MasterDataProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { session, loading: authLoading } = useAuth()

  useEffect(() => {
    async function initData() {
      if (authLoading) return
      
      if (!session) {
        setCachedProducts([])
        setCachedCategories([])
        setCachedUnits([])
        setCachedCustomers([])
        setCachedBills([])
        setCachedQuotations([])
        setCachedAppointments([])
        setCachedTransactions([])
        setCachedReservations([])
        setCachedBackorders([])
        setIsLoaded(true)
        return
      }

      setIsLoaded(false)
      setError(null)

      try {
        const [products, categories, units, customers] = await Promise.all([
          fetchProductsFromSupabase(),
          fetchCategoriesFromSupabase(),
          fetchUnitsFromSupabase(),
          fetchCustomersFromSupabase()
        ])

        // Categories mapping
        setCachedCategories(categories.map(c => ({ 
          id: c.id, 
          name: c.name,
          calculationType: c.calculation_type,
          calculationLabel: c.calculation_label,
          defaultUnitId: c.default_unit_id,
          isDefault: c.is_default,
          isActive: c.is_active
        })))
        
        // Units mapping
        setCachedUnits(units.map(u => ({ 
          id: u.id, 
          name: u.name, 
          isActive: u.is_active ?? true 
        })))

        // Products mapping (already done inside fetchProductsFromSupabase)
        setCachedProducts(products)

        // Customers mapping (already done inside fetchCustomersFromSupabase)
        setCachedCustomers(customers)

        // Hydrate business entities from Supabase
        Promise.allSettled([
          fetchBillsFromSupabase(),
          fetchQuotationsFromSupabase(),
          fetchAppointmentsFromSupabase(),
          fetchTransactionsFromSupabase(),
          fetchReservationsFromSupabase(),
          fetchBackordersFromSupabase(),
        ]).catch(() => {})

        setIsLoaded(true)
      } catch (err: any) {
        console.error('Failed to load master data from Supabase:', err)
        setError(err)
      }
    }
    initData()
  }, [session, authLoading])

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin mb-4" />
          <p className="font-semibold">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50 text-red-500 flex-col">
        <h2 className="text-2xl font-bold mb-4">เชื่อมต่อฐานข้อมูลล้มเหลว</h2>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin mb-4" />
          <p className="font-semibold">กำลังโหลดข้อมูลระบบ...</p>
        </div>
      </div>
    )
  }

  return (
    <MasterDataContext.Provider value={{ isLoaded, error }}>
      {children}
    </MasterDataContext.Provider>
  )
}
