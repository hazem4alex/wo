'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { RecentOrder } from '@/lib/queries/dashboard'
import { formatKWD } from '@/lib/format'

export function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  const t = useTranslations('dashboard')
  const common = useTranslations('common')

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">{t('recentOrders')}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{t('lastOperations')}</p>
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{t('recentOrdersCount', { count: orders.length })}</span>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-y bg-muted/60 text-muted-foreground">
              <th className="text-start p-3">{t('workOrderNo')}</th>
              <th className="p-3">{t('consumer')}</th>
              <th className="p-3">{t('supervisor')}</th>
              <th className="p-3">{common('status')}</th>
              <th className="p-3 text-end">{t('netAmount')}</th>
              <th className="p-3">{common('date')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b last:border-b-0 hover:bg-muted/50">
                <td className="p-3">
                  <Link href={`/work-orders/${order.id}`} className="font-semibold text-primary hover:underline">
                    {order.work_order_no}
                  </Link>
                </td>
                <td className="p-3 text-center text-foreground">{order.consumer_name}</td>
                <td className="p-3 text-center text-muted-foreground">{order.supervisor_name || '-'}</td>
                <td className="p-3 text-center"><StatusBadge status={order.status as 'draft'} /></td>
                <td className="p-3 text-end font-semibold text-emerald-600 dark:text-emerald-400">{formatKWD(order.net_amount)}</td>
                <td className="p-3 text-center text-muted-foreground">{order.date}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">{t('noData')}</td></tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
