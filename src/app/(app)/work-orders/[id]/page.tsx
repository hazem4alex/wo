import { pool } from '@/lib/db'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkOrderStatusModal } from '@/components/work-orders/status-modal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { formatKWD } from '@/lib/format'

export default async function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [woRes, itemsRes, eventsRes] = await Promise.all([
    pool.query(`
      SELECT wo.*, c.full_name as consumer_name, c.national_id, c.phone as consumer_phone,
             s.full_name as supervisor_name, o.name_ar as office_name,
             a.name_ar as area_name, g.name_ar as governorate_name,
             pm.name_ar as payment_method_name
      FROM work_order wo
      LEFT JOIN consumer c ON wo.consumer_id = c.id
      LEFT JOIN supervisor s ON wo.supervisor_id = s.id
      LEFT JOIN office o ON wo.office_id = o.id
      LEFT JOIN area a ON wo.area_id = a.id
      LEFT JOIN governorate g ON wo.governorate_id = g.id
      LEFT JOIN payment_method pm ON wo.payment_method_id = pm.id
      WHERE wo.id = $1
    `, [id]),
    pool.query('SELECT * FROM work_order_item WHERE work_order_id=$1 ORDER BY created_at', [id]),
    pool.query(`
      SELECT e.*, u.full_name_ar as actor_name
      FROM work_order_event e
      LEFT JOIN app_user u ON e.actor_user_id = u.id
      WHERE e.work_order_id=$1
      ORDER BY e.created_at DESC
    `, [id]),
  ])

  if (!woRes.rows[0]) notFound()
  const wo = woRes.rows[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title={wo.work_order_no}
        breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'اوامر العمل', href: '/work-orders' }, { label: wo.work_order_no }]}
        actions={
          <div className="flex gap-2">
            <WorkOrderStatusModal workOrderId={id} currentStatus={wo.status} />
            <Link href="/work-orders">
              <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />رجوع</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">بيانات أمر العمل</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><dt className="text-gray-500">رقم الأمر</dt><dd className="font-medium">{wo.work_order_no}</dd></div>
                <div><dt className="text-gray-500">الحالة</dt><dd><StatusBadge status={wo.status} /></dd></div>
                <div><dt className="text-gray-500">المستهلك</dt><dd className="font-medium">{wo.consumer_name}</dd></div>
                <div><dt className="text-gray-500">الرقم المدني</dt><dd>{wo.national_id}</dd></div>
                <div><dt className="text-gray-500">المشرف</dt><dd>{wo.supervisor_name || '-'}</dd></div>
                <div><dt className="text-gray-500">المكتب</dt><dd>{wo.office_name}</dd></div>
                <div><dt className="text-gray-500">المنطقة</dt><dd>{wo.area_name || '-'}</dd></div>
                <div><dt className="text-gray-500">المحافظة</dt><dd>{wo.governorate_name || '-'}</dd></div>
                <div><dt className="text-gray-500">طريقة الدفع</dt><dd>{wo.payment_method_name || '-'}</dd></div>
                <div><dt className="text-gray-500">التاريخ</dt><dd>{new Date(wo.created_at).toLocaleDateString('ar-KW')}</dd></div>
                {wo.notes && <div className="col-span-2"><dt className="text-gray-500">ملاحظات</dt><dd>{wo.notes}</dd></div>}
              </dl>
            </CardContent>
          </Card>

          {/* Billing items */}
          <Card>
            <CardHeader><CardTitle className="text-base">بنود الفاتورة</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-gray-600">
                  <th className="text-start p-2">الخدمة</th>
                  <th className="p-2">الكمية</th>
                  <th className="p-2">السعر</th>
                  <th className="p-2">الخصم</th>
                  <th className="p-2">الغرامة</th>
                  <th className="p-2">الإجمالي</th>
                </tr></thead>
                <tbody>
                  {itemsRes.rows.map(item => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{item.service_name_ar}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-center">{formatKWD(item.unit_price)}</td>
                      <td className="p-2 text-center text-red-500">{formatKWD(item.discount_amount)}</td>
                      <td className="p-2 text-center text-orange-500">{formatKWD(item.fine_amount)}</td>
                      <td className="p-2 text-center text-green-600 font-medium">{formatKWD(item.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="border-t bg-gray-50 font-semibold">
                  <td colSpan={5} className="p-2 text-end">صافي المبلغ:</td>
                  <td className="p-2 text-center text-green-700">{formatKWD(wo.net_amount)}</td>
                </tr></tfoot>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div>
          <Card>
            <CardHeader><CardTitle className="text-base">سجل الأحداث</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventsRes.rows.map((event) => (
                  <div key={event.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{event.message}</p>
                      {event.actor_name && <p className="text-gray-500 text-xs">{event.actor_name}</p>}
                      <p className="text-gray-400 text-xs">{new Date(event.created_at).toLocaleString('ar-KW')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
