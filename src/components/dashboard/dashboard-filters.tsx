'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const RANGES = [
  { label: 'اليوم', value: '1' },
  { label: 'أخر 7 أيام', value: '7' },
  { label: 'أخر 30 يوم', value: '30' },
  { label: 'هذا الشهر', value: '30' },
]

export function DashboardFilters({ currentRange }: { currentRange: string }) {
  const router = useRouter()

  const setRange = (range: string) => {
    router.push(`/dashboard?range=${range}`)
  }

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
      {RANGES.map(r => (
        <Button
          key={r.label}
          size="sm"
          variant={currentRange === r.value ? 'default' : 'ghost'}
          className={currentRange === r.value ? 'bg-blue-700 text-white' : ''}
          onClick={() => setRange(r.value)}
        >
          {r.label}
        </Button>
      ))}
    </div>
  )
}
