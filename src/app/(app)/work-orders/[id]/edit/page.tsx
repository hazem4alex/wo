import { pool } from '@/lib/db'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/shared/page-header'
import { WorkOrderForm } from '@/components/work-orders/work-order-form'

export default async function EditWorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const woRes = await pool.query('SELECT * FROM work_order WHERE id=$1', [id])
  if (!woRes.rows[0]) notFound()
  const wo = woRes.rows[0]

  const [
    govRes, areasRes, officesRes, supervisorsRes, servicesRes, paymentRes,
    itemsRes, consumerRes,
  ] = await Promise.all([
    pool.query('SELECT id, name_ar FROM governorate ORDER BY name_ar'),
    pool.query('SELECT id, name_ar, governorate_id FROM area ORDER BY name_ar'),
    pool.query('SELECT id, name_ar, area_id FROM office WHERE is_active=true ORDER BY name_ar'),
    pool.query('SELECT id, full_name, office_id FROM supervisor WHERE is_active=true ORDER BY full_name'),
    pool.query('SELECT id, code, name_ar, name_en, unit_price, require_electricity_meter, require_water_meter FROM service WHERE is_active=true ORDER BY name_ar'),
    pool.query('SELECT id, name_ar FROM payment_method ORDER BY name_ar'),
    pool.query(
      `SELECT id, service_name_ar, service_name_en, service_code,
              quantity, unit_price, discount_amount, fine_amount, total_amount
       FROM work_order_item WHERE work_order_id=$1 ORDER BY created_at`,
      [id]
    ),
    pool.query(
      `SELECT c.id, c.full_name, c.consumer_code, c.consumer_no, c.national_id, c.phone,
              c.street, c.house_no, c.apartment_no,
              c.area_id, c.office_id, a.governorate_id
       FROM consumer c
       LEFT JOIN area a ON c.area_id = a.id
       WHERE c.id = $1`,
      [wo.consumer_id]
    ),
  ])

  const consumer = consumerRes.rows[0] ?? null

  // Map items: give each a client-side id for keying
  const items = itemsRes.rows.map((r, i) => ({
    id: r.id ?? String(i),
    service_name_ar: r.service_name_ar ?? '',
    service_name_en: r.service_name_en ?? '',
    service_code: r.service_code ?? '',
    quantity: Number(r.quantity),
    unit_price: Number(r.unit_price),
    discount_amount: Number(r.discount_amount),
    fine_amount: Number(r.fine_amount),
    total_amount: Number(r.total_amount),
  }))

  return (
    <div>
      <PageHeader
        title={`تعديل أمر العمل — ${wo.work_order_no}`}
        breadcrumb={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'اوامر العمل', href: '/work-orders' },
          { label: wo.work_order_no, href: `/work-orders/${id}` },
          { label: 'تعديل' },
        ]}
      />
      <WorkOrderForm
        governorates={govRes.rows}
        areas={areasRes.rows}
        offices={officesRes.rows}
        supervisors={supervisorsRes.rows}
        services={servicesRes.rows}
        paymentMethods={paymentRes.rows}
        initialData={{
          id: wo.id,
          work_order_no: wo.work_order_no,
          work_order_code: wo.work_order_code,
          consumer_id: wo.consumer_id,
          consumer_phone: wo.consumer_phone,
          consumer,
          governorate_id: wo.governorate_id,
          area_id: wo.area_id,
          office_id: wo.office_id,
          supervisor_id: wo.supervisor_id,
          payment_method_id: wo.payment_method_id,
          notes: wo.notes,
          order_date: wo.order_date,
          street: wo.street,
          house_no: wo.house_no,
          apartment_no: wo.apartment_no,
          automated_figure: wo.automated_figure,
          electricity_meter_old_no: wo.electricity_meter_old_no,
          electricity_meter_new_no: wo.electricity_meter_new_no,
          electricity_old_reading: wo.electricity_old_reading,
          electricity_new_reading: wo.electricity_new_reading,
          water_meter_old_no: wo.water_meter_old_no,
          water_meter_new_no: wo.water_meter_new_no,
          water_old_reading: wo.water_old_reading,
          water_new_reading: wo.water_new_reading,
          items,
        }}
      />
    </div>
  )
}
