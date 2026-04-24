import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import Link from 'next/link'
import type { RecentOrder } from '@/lib/queries/dashboard'
import { formatKWD } from '@/lib/format'

export function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle className="text-sm font-semibold">أحدث أوامر العمل</CardTitle></CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-gray-600">
            <th className="text-start p-3">رقم أمر العمل</th>
            <th className="p-3">المستهلك</th>
            <th className="p-3">المشرف</th>
            <th className="p-3">الحالة</th>
            <th className="p-3 text-end">صافي المبلغ</th>
            <th className="p-3">التاريخ</th>
          </tr></thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <Link href={`/work-orders/${order.id}`} className="text-blue-600 hover:underline font-medium">
                    {order.work_order_no}
                  </Link>
                </td>
                <td className="p-3 text-center text-gray-700">{order.consumer_name}</td>
                <td className="p-3 text-center text-gray-700">{order.supervisor_name || '-'}</td>
                <td className="p-3 text-center"><StatusBadge status={order.status as 'draft'} /></td>
                <td className="p-3 text-end text-green-600 font-medium">{formatKWD(order.net_amount)}</td>
                <td className="p-3 text-center text-gray-500">{order.date}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">لا يوجد بيانات</td></tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
