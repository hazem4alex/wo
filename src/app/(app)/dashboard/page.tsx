import {
  getDashboardStats, getRevenueTrend, getOrdersByStatus, getTopServices,
  getTopSupervisors, getConsumersByGovernorate, getOrdersByArea, getRecentOrders
} from '@/lib/queries/dashboard'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { TopTables } from '@/components/dashboard/top-tables'
import { RecentOrdersTable } from '@/components/dashboard/recent-orders-table'
import { DashboardFilters } from '@/components/dashboard/dashboard-filters'
import { PageHeader } from '@/components/shared/page-header'

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
      <PageHeader
        title="لوحة تحكم الكهرباء"
        subtitle="نظرة عامة على إحصائيات نظام إدارة الكهرباء"
        actions={<DashboardFilters currentRange={params.range || '30'} />}
      />

      <SummaryCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCharts trend={trend} byStatus={byStatus} byArea={byArea} byGov={byGov} />
        </div>
        <div>
          <TopTables topServices={topServices} topSupervisors={topSupervisors} />
        </div>
      </div>

      <RecentOrdersTable orders={recent} />
    </div>
  )
}
