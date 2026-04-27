'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import type { TopService, TopSupervisor } from '@/lib/queries/dashboard'
import { formatKWD } from '@/lib/format'

export function TopTables({ topServices, topSupervisors }: { topServices: TopService[]; topSupervisors: TopSupervisor[] }) {
  const t = useTranslations('dashboard')

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t('performanceRanking')}</CardTitle>
        <p className="text-xs text-muted-foreground">{t('performanceSubtitle')}</p>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 text-sm font-semibold">{t('topServices')}</div>
          <div className="space-y-2">
            {topServices.map((s, i) => (
              <div key={i} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
                <span className="flex size-7 items-center justify-center rounded-md bg-accent text-xs font-semibold text-accent-foreground">{i + 1}</span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{s.name_ar}</div>
                  <div className="text-xs text-muted-foreground">{s.usage_count} {t('usage')}</div>
                </div>
                <div className="text-end text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatKWD(s.total_revenue)}</div>
              </div>
            ))}
            {topServices.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">{t('topServicesEmpty')}</p>}
          </div>
        </section>

        <section>
          <div className="mb-3 text-sm font-semibold">{t('topSupervisors')}</div>
          <div className="space-y-2">
            {topSupervisors.map((s, i) => (
              <div key={i} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
                <span className="flex size-7 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-secondary-foreground">{i + 1}</span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{s.full_name}</div>
                  <div className="text-xs text-muted-foreground">{s.total_orders} {t('orderUnit')}, {s.pending} {t('pending')}</div>
                </div>
                <div className="text-end text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatKWD(s.total_revenue)}</div>
              </div>
            ))}
            {topSupervisors.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">{t('topSupervisorsEmpty')}</p>}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
