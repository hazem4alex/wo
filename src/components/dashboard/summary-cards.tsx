import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Clock, CheckCircle, FileText, Users } from 'lucide-react'
import type { DashboardStats } from '@/lib/queries/dashboard'

function pctChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%'
  const pct = ((current - previous) / previous) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`
}

export function SummaryCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: 'إجمالي الإيرادات',
      value: stats.totalRevenue.toFixed(3),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      change: pctChange(stats.totalRevenue, stats.previousRevenue),
    },
    {
      title: 'أوامر معلقة',
      value: stats.pendingCount.toString(),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      sub: `${stats.completedCount} مكتمل`,
    },
    {
      title: 'إجمالي المستهلكين',
      value: stats.totalConsumers.toString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: '+100%',
    },
    {
      title: 'إجمالي أوامر العمل',
      value: stats.totalOrders.toString(),
      icon: FileText,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      change: pctChange(stats.totalOrders, stats.previousOrders),
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-full ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</div>
              <div className="text-sm text-gray-500 mb-1">{card.title}</div>
              {card.change && (
                <div className="text-xs text-green-600 font-medium">
                  {card.change} <span className="text-gray-400">مقارنة بالفترة السابقة</span>
                </div>
              )}
              {card.sub && <div className="text-xs text-gray-400">{card.sub} في التنفيذ</div>}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
