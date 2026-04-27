'use client'

import { AlertTriangle, CheckCircle2, Clock3, Gauge, ReceiptText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import type { DashboardStats, OrdersByStatus, RecentOrder } from '@/lib/queries/dashboard'
import { formatKWD } from '@/lib/format'

interface AttentionPanelProps {
  stats: DashboardStats
  byStatus: OrdersByStatus[]
  recent: RecentOrder[]
}

export function AttentionPanel({ stats, byStatus, recent }: AttentionPanelProps) {
  const t = useTranslations('dashboard')
  const workOrders = useTranslations('workOrders')
  const labels: Record<string, string> = {
    draft: workOrders('statusDraft'),
    open: workOrders('statusOpen'),
    assigned: workOrders('statusAssigned'),
    in_progress: workOrders('statusInProgress'),
    completed: workOrders('statusCompleted'),
    cancelled: workOrders('statusCancelled'),
  }
  const statusCounts = new Map(byStatus.map((item) => [item.status, item.count]))
  const openCount = statusCounts.get('open') ?? stats.pendingCount
  const activeCount = openCount + (statusCounts.get('assigned') ?? 0) + (statusCounts.get('in_progress') ?? 0)
  const completionRate = stats.totalOrders > 0 ? Math.round((stats.completedCount / stats.totalOrders) * 100) : 0
  const latest = recent[0]

  const items = [
    {
      label: t('ordersNeedFollowUp'),
      value: openCount,
      icon: AlertTriangle,
      tone: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: t('activeFieldOrders'),
      value: activeCount,
      icon: Gauge,
      tone: 'text-primary',
      bg: 'bg-accent',
    },
    {
      label: t('completionRate'),
      value: `${completionRate}%`,
      icon: CheckCircle2,
      tone: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ]

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{t('attentionCenter')}</CardTitle>
        <p className="text-xs text-muted-foreground">{t('attentionSubtitle')}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <span className={`flex size-9 items-center justify-center rounded-md ${item.bg}`}>
                    <Icon className={`size-4 ${item.tone}`} />
                  </span>
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className={`text-lg font-bold ${item.tone}`}>{item.value}</span>
              </div>
            )
          })}
        </div>

        <div className="rounded-lg border border-border/70 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <ReceiptText className="size-4 text-primary" />
            {t('latestWorkOrder')}
          </div>
          {latest ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t('number')}</span>
                <span className="font-medium text-primary">{latest.work_order_no}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t('consumer')}</span>
                <span className="max-w-36 truncate text-foreground">{latest.consumer_name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{workOrders('status')}</span>
                <span className="text-foreground">{labels[latest.status] ?? latest.status}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t('value')}</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatKWD(latest.net_amount)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('noRecentOrders')}</p>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs text-accent-foreground">
          <Clock3 className="size-4" />
          {t('attentionHint')}
        </div>
      </CardContent>
    </Card>
  )
}
