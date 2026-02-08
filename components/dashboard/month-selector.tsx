'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { format, parse } from 'date-fns'
import { hu } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Month } from '@/lib/types/database'

interface MonthSelectorProps {
  months: Month[]
  currentMonth: string // Format: "YYYY-MM"
}

export function MonthSelector({ months, currentMonth }: MonthSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleMonthChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('month', value)
    router.push(`/dashboard?${params.toString()}`)
  }

  // Create month options from database months
  const monthOptionsMap = new Map<string, string>()

  // Add all months from database
  months.forEach((m) => {
    const monthStr = `${m.year}-${String(m.month).padStart(2, '0')}`
    const date = parse(monthStr, 'yyyy-MM', new Date())
    const label = format(date, 'yyyy MMMM', { locale: hu })
    monthOptionsMap.set(monthStr, label)
  })

  // Add current month if not in list (it might be auto-created)
  if (!monthOptionsMap.has(currentMonth)) {
    const date = parse(currentMonth, 'yyyy-MM', new Date())
    const label = format(date, 'yyyy MMMM', { locale: hu })
    monthOptionsMap.set(currentMonth, label)
  }

  // Convert to array and sort by value (YYYY-MM) descending
  const monthOptions = Array.from(monthOptionsMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => b.value.localeCompare(a.value))

  return (
    <Select value={currentMonth} onValueChange={handleMonthChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Válassz hónapot" />
      </SelectTrigger>
      <SelectContent>
        {monthOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
