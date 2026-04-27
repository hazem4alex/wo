'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

const RANGES = [
  { labelKey: 'common.today', value: '1' },
  { labelKey: 'common.last7days', value: '7' },
  { labelKey: 'common.last30days', value: '30' },
  { labelKey: 'common.thisMonth', value: '30' },
]

export function DashboardFilters({ currentRange }: { currentRange: string }) {
  const router = useRouter()
  const t = useTranslations()

  const setRange = (range: string) => {
    router.push(`/dashboard?range=${range}`)
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card p-1">
      {RANGES.map(r => (
        <Button
          key={r.labelKey}
          size="sm"
          variant={currentRange === r.value ? 'default' : 'ghost'}
          className={currentRange === r.value ? 'bg-primary text-primary-foreground' : ''}
          onClick={() => setRange(r.value)}
        >
          {t(r.labelKey)}
        </Button>
      ))}
    </div>
  )
}
