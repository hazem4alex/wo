'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Clock, FileText, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { DashboardStats } from '@/lib/queries/dashboard'
import { formatKWD } from '@/lib/format'

function pctChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%'
  const pct = ((current - previous) / previous) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`
}

export function SummaryCards({ stats }: { stats: DashboardStats }) {
  const t = useTranslations('dashboard')
  const cards = [
    {
      title: t('totalRevenue'),
      value: formatKWD(stats.totalRevenue),
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      change: pctChange(stats.totalRevenue, stats.previousRevenue),
      label: t('revenueGrowth'),
    },
    {
      title: t('pendingOrders'),
      value: stats.pendingCount.toString(),
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      sub: `${stats.completedCount} ${t('completed')}`,
      label: t('needsFollowUp'),
    },
    {
      title: t('totalConsumers'),
      value: stats.totalConsumers.toString(),
      icon: Users,
      color: 'text-primary',
      bg: 'bg-accent',
      change: '+100%',
      label: t('consumerBase'),
    },
    {
      title: t('totalOrders'),
      value: stats.totalOrders.toString(),
      icon: FileText,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-500/10',
      change: pctChange(stats.totalOrders, stats.previousOrders),
      label: t('operationVolume'),
    },
  ]

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="grid gap-0 p-0 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.title} className="border-b border-border/70 p-4 last:border-b-0 sm:[&:nth-child(odd)]:border-e xl:border-b-0 xl:border-e xl:last:border-e-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground">{card.label}</div>
                <div className={`mt-2 text-2xl font-bold tracking-tight ${card.color}`}>{card.value}</div>
                <div className="mt-1 text-sm text-foreground">{card.title}</div>
              </div>
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-md ${card.bg}`}>
                <Icon className={`size-5 ${card.color}`} />
              </div>
            </div>
            {card.change && (
              <div className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {card.change} <span className="text-muted-foreground">{t('comparedToPrevious')}</span>
                </div>
              )}
            {card.sub && <div className="mt-3 text-xs text-muted-foreground">{card.sub} {t('inExecution')}</div>}
          </div>
        )
      })}
      </CardContent>
    </Card>
  )
}
