import { pool } from '@/lib/db'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkOrderStatusModal } from '@/components/work-orders/status-modal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Zap, Droplets } from 'lucide-react'
import { formatKWD } from '@/lib/format'

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-sm font-medium text-gray-800">{value || '-'}</dd>
    </div>
  )
}

export default async function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [woRes, itemsRes, eventsRes] = await Promise.all([
    pool.query(`
      SELECT wo.*,
             c.full_name as consumer_name, c.national_id, c.phone as consumer_phone,
             c.consumer_code, c.consumer_no, c.electricity_meter_no as consumer_elec_meter,
             c.water_meter_no as consumer_water_meter,
             c.street as consumer_street, c.house_no as consumer_house_no, c.apartment_no as consumer_apt_no,
             s.full_name as supervisor_name,
             o.name_ar as office_name,
             a.name_ar as area_name,
             g.name_ar as governorate_name,
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

  const hasElec = wo.electricity_meter_old_no || wo.electricity_meter_new_no || wo.electricity_old_reading || wo.electricity_new_reading
  const hasWater = wo.water_meter_old_no || wo.water_meter_new_no || wo.water_old_reading || wo.water_new_reading

  return (
    <div className="space-y-4">
      <PageHeader
        title={`عرض — ${wo.work_order_no}`}
        breadcrumb={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'اوامر العمل', href: '/work-orders' },
          { label: wo.work_order_no },
        ]}
        actions={
          <div className="flex gap-2">
            <WorkOrderStatusModal workOrderId={id} currentStatus={wo.status} />
            <Link href="/work-orders">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />رجوع
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">

          {/* Work Order Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">أوامر العمل</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                <Field label="رقم أمر العمل" value={wo.work_order_no} />
                <Field label="كود أمر العمل" value={wo.work_order_code} />
                <Field label="التاريخ" value={new Date(wo.created_at).toLocaleDateString('ar-KW')} />
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">الحالة</dt>
                  <dd><StatusBadge status={wo.status} /></dd>
                </div>
                <Field label="المنطقة" value={wo.area_name} />
                <Field label="المكتب" value={wo.office_name} />
                <Field label="المشرف" value={wo.supervisor_name} />
                <Field label="طريقة الدفع" value={wo.payment_method_name} />
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">غرامة</dt>
                  <dd className="text-sm font-medium">{wo.has_fine ? 'نعم' : 'لا'}</dd>
                </div>
                {wo.notes && (
                  <div className="col-span-2 md:col-span-4">
                    <dt className="text-xs text-gray-500 mb-0.5">ملاحظات</dt>
                    <dd className="text-sm text-gray-700">{wo.notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Consumer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">المستهلك</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                <Field label="اسم المستهلك" value={wo.consumer_name} />
                <Field label="كود المستهلك" value={wo.consumer_code} />
                <Field label="الرقم المدني" value={wo.national_id} />
                <Field label="رقم الهاتف" value={wo.consumer_phone} />
                <Field label="المحافظة" value={wo.governorate_name} />
                <Field label="المنطقة" value={wo.area_name} />
                <Field label="المكتب" value={wo.office_name} />
                <Field label="رقم المستهلك" value={wo.consumer_no} />
                <Field label="الشارع" value={wo.consumer_street} />
                <Field label="المنزل" value={wo.consumer_house_no} />
                <Field label="رقم الشقة" value={wo.consumer_apt_no} />
              </dl>
            </CardContent>
          </Card>

          {/* Meters */}
          {(hasElec || hasWater) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">العدادات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hasElec && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-700">عداد الكهرباء</span>
                      </div>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <Field label="الرقم القديم" value={wo.electricity_meter_old_no} />
                        <Field label="الرقم الجديد" value={wo.electricity_meter_new_no} />
                        <Field label="القراءة القديمة" value={wo.electricity_old_reading != null ? String(wo.electricity_old_reading) : null} />
                        <Field label="القراءة الجديدة" value={wo.electricity_new_reading != null ? String(wo.electricity_new_reading) : null} />
                      </dl>
                    </div>
                  )}
                  {hasWater && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <Droplets className="w-4 h-4 text-sky-500" />
                        <span className="text-sm font-medium text-sky-700">عداد المياه</span>
                      </div>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <Field label="الرقم القديم" value={wo.water_meter_old_no} />
                        <Field label="الرقم الجديد" value={wo.water_meter_new_no} />
                        <Field label="القراءة القديمة" value={wo.water_old_reading != null ? String(wo.water_old_reading) : null} />
                        <Field label="القراءة الجديدة" value={wo.water_new_reading != null ? String(wo.water_new_reading) : null} />
                      </dl>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">البنود</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-600 text-xs">
                    <th className="text-start px-4 py-2.5">#</th>
                    <th className="text-start px-4 py-2.5">الخدمة</th>
                    <th className="px-3 py-2.5 text-center">الكمية</th>
                    <th className="px-3 py-2.5 text-center">سعر الوحدة</th>
                    <th className="px-3 py-2.5 text-center">الخصم</th>
                    <th className="px-3 py-2.5 text-center">الإجمالي</th>
                    <th className="px-3 py-2.5 text-center">تاريخ الخدمة</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsRes.rows.map((item, i) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2.5">{item.service_name_ar || '-'}</td>
                      <td className="px-3 py-2.5 text-center">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-center">{formatKWD(item.unit_price)}</td>
                      <td className="px-3 py-2.5 text-center text-red-500">{formatKWD(item.discount_amount)}</td>
                      <td className="px-3 py-2.5 text-center font-medium">{formatKWD(item.total_amount)}</td>
                      <td className="px-3 py-2.5 text-center text-gray-500">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('ar-KW') : '-'}
                      </td>
                    </tr>
                  ))}
                  {itemsRes.rows.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">لا توجد بنود</td></tr>
                  )}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t px-4 py-3 space-y-1.5 bg-gray-50/50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المبلغ الإجمالي</span>
                  <span className="font-medium">{formatKWD(wo.amount ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-500">إجمالي الخصم</span>
                  <span className="text-red-500">{formatKWD(wo.discount_amount ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-1.5 mt-1.5">
                  <span>صافي المبلغ</span>
                  <span className="text-green-700">{formatKWD(wo.net_amount ?? 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">سجل الأحداث</CardTitle>
            </CardHeader>
            <CardContent>
              {eventsRes.rows.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">لا توجد أحداث</p>
              ) : (
                <div className="space-y-4">
                  {eventsRes.rows.map((event) => (
                    <div key={event.id} className="flex gap-3 text-sm">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="w-px flex-1 bg-gray-200 mt-1" />
                      </div>
                      <div className="pb-3">
                        <p className="font-medium text-gray-800">{event.message}</p>
                        {event.actor_name && <p className="text-gray-500 text-xs mt-0.5">{event.actor_name}</p>}
                        <p className="text-gray-400 text-xs mt-0.5">{new Date(event.created_at).toLocaleString('ar-KW')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
