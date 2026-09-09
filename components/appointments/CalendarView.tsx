'use client'

import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import thLocale from '@fullcalendar/core/locales/th'

interface CalendarViewProps {
  events: {
    id: string
    title: string
    start: string
    end: string
    backgroundColor: string
    borderColor: string
  }[]
  onEventClick?: (id: string) => void
}

export function CalendarView({ events, onEventClick }: CalendarViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-full min-h-0 flex items-center justify-center text-slate-400 font-bold animate-pulse">
        กำลังโหลดปฏิทินนัดหมาย...
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-0 text-xs">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={thLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        }}
        buttonText={{
          today: 'วันนี้',
          month: 'เดือน',
          week: 'สัปดาห์',
        }}
        events={events}
        eventClick={(info) => {
          if (onEventClick) {
            onEventClick(info.event.id)
          }
        }}
        height="100%"
      />
    </div>
  )
}

