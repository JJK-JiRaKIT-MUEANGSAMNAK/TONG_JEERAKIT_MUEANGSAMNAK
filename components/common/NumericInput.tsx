'use client'

import React, { useState, useEffect, useRef } from 'react'

export interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'min' | 'max'> {
  value: number | string | undefined | null
  onChange: (value: number | '') => void
  min?: number
  max?: number
  allowDecimals?: boolean
  defaultValueOnBlur?: number
  allowNegative?: boolean
}

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  function NumericInput(
    {
      value,
      onChange,
      min,
      max,
      allowDecimals = true,
      defaultValueOnBlur,
      allowNegative = false,
      onBlur,
      onKeyDown,
      className = '',
      placeholder = '',
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined
    const initialText =
      value === null || value === undefined || value === '' ? '' : String(value)

    const [rawText, setRawText] = useState<string>(initialText)
    const isFocusedRef = useRef(false)

    // Synchronize external value changes ONLY when not focused (rawText is the single source of truth while typing)
    useEffect(() => {
      if (!isControlled) return

      const formattedVal =
        value === null || value === undefined || value === '' ? '' : String(value)

      if (!isFocusedRef.current) {
        setRawText(formattedVal)
      }
    }, [value, isControlled])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value

      // Allow empty string while typing
      if (val === '') {
        setRawText('')
        onChange('')
        return
      }

      // Allow typing single negative sign if negative is allowed
      if (allowNegative && val === '-') {
        setRawText('-')
        onChange('')
        return
      }

      // Regex validation based on decimal settings
      const pattern = allowDecimals
        ? allowNegative
          ? /^-?\d*\.?\d*$/
          : /^\d*\.?\d*$/
        : allowNegative
        ? /^-?\d*$/
        : /^\d*$/

      if (!pattern.test(val)) {
        return // reject non-matching characters
      }

      setRawText(val)

      // If typing incomplete decimal e.g. "10.", do not parse yet for parent if not valid number, or pass current float
      if (val.endsWith('.')) {
        const num = parseFloat(val)
        if (!isNaN(num)) {
          onChange(num)
        }
        return
      }

      const num = parseFloat(val)
      if (!isNaN(num)) {
        onChange(num)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = false

      if (rawText === '' || rawText === '-') {
        if (defaultValueOnBlur !== undefined) {
          setRawText(String(defaultValueOnBlur))
          onChange(defaultValueOnBlur)
        } else {
          setRawText('')
          onChange('')
        }
      } else {
        let parsed = parseFloat(rawText)
        if (isNaN(parsed)) {
          const fallback = defaultValueOnBlur !== undefined ? defaultValueOnBlur : ''
          setRawText(fallback !== '' ? String(fallback) : '')
          onChange(fallback)
        } else {
          if (!allowDecimals) parsed = Math.floor(parsed)
          if (min !== undefined && parsed < min) parsed = min
          if (max !== undefined && parsed > max) parsed = max
          setRawText(String(parsed))
          onChange(parsed)
        }
      }

      if (onBlur) {
        onBlur(e)
      }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = true
      // Auto-select text on focus so user can immediately type to replace without appending
      try {
        e.currentTarget.select()
      } catch {}
      if (rest.onFocus) {
        rest.onFocus(e)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur()
      }
      if (onKeyDown) {
        onKeyDown(e)
      }
    }

    return (
      <input
        ref={ref}
        type="text"
        inputMode={allowDecimals ? 'decimal' : 'numeric'}
        value={rawText}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        {...rest}
      />
    )
  }
)
