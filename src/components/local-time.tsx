"use client"

export function LocalTime({ date, format = 'full' }: { date: Date | string; format?: 'full' | 'date' | 'time' }) {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'date') {
    return <>{d.toLocaleDateString()}</>
  }
  
  if (format === 'time') {
    return <>{d.toLocaleTimeString()}</>
  }
  
  return <>{d.toLocaleString()}</>
}
