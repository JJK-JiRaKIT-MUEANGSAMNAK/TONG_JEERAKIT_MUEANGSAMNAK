'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { logger } from '@/lib/utils/logger'

export type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  theme: ThemeMode
  isDark: boolean
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'rental_pos_theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark')

  // Initialize theme from localStorage or document element
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored)
        if (stored === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      } else {
        // Default to dark mode
        document.documentElement.classList.add('dark')
        localStorage.setItem(THEME_STORAGE_KEY, 'dark')
      }
    } catch {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (e) {
      logger.error('Failed to save theme to localStorage:', e)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const nextTheme: ThemeMode = current === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      } catch (e) {
        logger.error('Failed to save theme to localStorage:', e)
      }
      return nextTheme
    })
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
