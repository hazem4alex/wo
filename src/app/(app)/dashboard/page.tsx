import {
  getDashboardStats, getRevenueTrend, getOrdersByStatus, getTopServices,
  getTopSupervisors, getConsumersByGovernorate, getOrdersByArea, getRecentOrders
} from '@/lib/queries/dashboard'
import { DashboardCharts, RevenueWorkloadChart } from '@/components/dashboard/dashboard-charts'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { TopTables } from '@/components/dashboard/top-tables'
import { RecentOrdersTable } from '@/components/dashboard/recent-orders-table'
import { DashboardFilters } from '@/components/dashboard/dashboard-filters'
import { AttentionPanel } from '@/components/dashboard/attention-panel'
import { getTranslations } from 'next-intl/server'

interface Props {
  searchParams: Promise<{ from?: string; to?: string; range?: string }>
}

function getDateRange(searchParams: { from?: string; to?: string; range?: string }): [Date, Date] {
  const now = new Date()
  if (searchParams.from && searchParams.to) {
    return [new Date(searchParams.from), new Date(searchParams.to)]
  }
  const range = searchParams.range || '30'
  const from = new Date(now)
  from.setDate(from.getDate() - parseInt(range))
  return [from, now]
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams
  const [from, to] = getDateRange(params)
  const t = await getTranslations('dashboard')

  const [stats, trend, byStatus, topServices, topSupervisors, byGov, byArea, recent] = await Promise.all([
    getDashboardStats(from, to),
    getRevenueTrend(from, to),
    getOrdersByStatus(from, to),
    getTopServices(from, to),
    getTopSupervisors(from, to),
    getConsumersByGovernorate(),
    getOrdersByArea(from, to),
    getRecentOrders(),
  ])

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-3 inline-flex rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {t('eyebrow')}
            </div>
            <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground">
              {t('title')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
          <DashboardFilters currentRange={params.range || '30'} />
        </div>
      </section>

      <SummaryCards stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <DashboardCharts trend={trend} byStatus={byStatus} byArea={byArea} byGov={byGov} />
        </div>
        <div className="space-y-6">
          <AttentionPanel stats={stats} byStatus={byStatus} recent={recent} />
        </div>
      </div>

      <TopTables topServices={topServices} topSupervisors={topSupervisors} />

      <RecentOrdersTable orders={recent} />

      <RevenueWorkloadChart trend={trend} />
    </div>
  )
}
