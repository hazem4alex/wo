'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts'
import type { RevenueTrend, OrdersByStatus, OrdersByArea, ConsumersByGovernorate } from '@/lib/queries/dashboard'

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8', open: 'var(--primary)', assigned: '#8b5cf6',
  in_progress: '#f59e0b', completed: '#10b981', cancelled: '#ef4444',
}
interface Props {
  trend: RevenueTrend[]
  byStatus: OrdersByStatus[]
  byArea: OrdersByArea[]
  byGov: ConsumersByGovernorate[]
}

export function DashboardCharts({ byStatus, byArea, byGov }: Props) {
  const t = useTranslations('dashboard')
  const workOrders = useTranslations('workOrders')
  const statusLabels: Record<string, string> = {
    draft: workOrders('statusDraft'),
    open: workOrders('statusOpen'),
    assigned: workOrders('statusAssigned'),
    in_progress: workOrders('statusInProgress'),
    completed: workOrders('statusCompleted'),
    cancelled: workOrders('statusCancelled'),
  }
  const statusData = byStatus.map(s => ({
    ...s,
    label: statusLabels[s.status] ?? s.status,
    fill: STATUS_COLORS[s.status] ?? '#94a3b8',
  }))
  const totalOrders = statusData.reduce((sum, item) => sum + item.count, 0)
  const maxGov = Math.max(...byGov.map((gov) => gov.count), 1)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">{t('workflow')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusData.map((item) => {
                const pct = totalOrders ? Math.round((item.count / totalOrders) * 100) : 0
                return (
                  <div key={item.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="text-muted-foreground">{item.count} {t('orderUnit')}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: item.fill }} />
                    </div>
                  </div>
                )
              })}
              {statusData.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t('statusNoData')}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('ordersByArea')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byArea} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name_ar" type="category" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} width={70} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader><CardTitle className="text-sm font-semibold">{t('consumersByGovernorate')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {byGov.slice(0, 6).map((gov) => {
            const pct = Math.round((gov.count / maxGov) * 100)
            return (
              <div key={gov.name_ar} className="grid grid-cols-[7rem_1fr_4rem] items-center gap-3 text-sm">
                <span className="truncate text-foreground">{gov.name_ar}</span>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-end font-medium text-muted-foreground">{gov.count}</span>
              </div>
            )
          })}
          {byGov.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">{t('governorateNoData')}</p>}
        </CardContent>
      </Card>

    </div>
  )
}

export function RevenueWorkloadChart({ trend }: Pick<Props, 'trend'>) {
  const t = useTranslations('dashboard')

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold">{t('revenueWorkload')}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{t('revenueWorkloadSubtitle')}</p>
        </div>
        <div className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{t('analytical')}</div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.32} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => Number(v).toFixed(3)} />
            <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#revenueFill)" name={t('revenueSeries')} strokeWidth={2.5} dot={false} />
            <Area type="monotone" dataKey="orders" stroke="#10b981" fill="transparent" name={t('ordersSeries')} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
