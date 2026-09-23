'use client'

import { useState, useEffect } from 'react'

export function useLiveClock() {
  const [currentDateStr, setCurrentDateStr] = useState('')
  const [currentTimeStr, setCurrentTimeStr] = useState('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
      const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ]

      const dayName = dayNames[now.getDay()]
      const dateNum = now.getDate()
      const monthName = monthNames[now.getMonth()]
      const yearBE = now.getFullYear() + 543

      setCurrentDateStr(`วัน${dayName}ที่ ${dateNum} ${monthName} ${yearBE}`)

      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      setCurrentTimeStr(`${hours}:${minutes}:${seconds} น.`)
    }

    updateDateTime()
    const timer = setInterval(updateDateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return { currentDateStr, currentTimeStr }
}
