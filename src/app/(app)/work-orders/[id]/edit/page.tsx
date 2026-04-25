import { pool } from '@/lib/db'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/shared/page-header'
import { WorkOrderForm } from '@/components/work-orders/work-order-form'

export default async function EditWorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const woRes = await pool.query('SELECT * FROM work_order WHERE id=$1', [id])
  if (!woRes.rows[0]) notFound()

  const [consumersRes, govRes, areasRes, officesRes, supervisorsRes, servicesRes, paymentRes] = await Promise.all([
    pool.query(`
      SELECT c.id, c.full_name, c.consumer_code, c.consumer_no, c.national_id, c.phone,
             c.street, c.house_no, c.apartment_no,
             c.area_id, c.office_id,
             a.governorate_id
      FROM consumer c
      LEFT JOIN area a ON c.area_id = a.id
      WHERE c.is_active=true ORDER BY c.full_name LIMIT 1000
    `),
    pool.query('SELECT id, name_ar FROM governorate ORDER BY name_ar'),
    pool.query('SELECT id, name_ar, governorate_id FROM area ORDER BY name_ar'),
    pool.query('SELECT id, name_ar, area_id FROM office WHERE is_active=true ORDER BY name_ar'),
    pool.query('SELECT id, full_name, office_id FROM supervisor WHERE is_active=true ORDER BY full_name'),
    pool.query('SELECT id, code, name_ar, name_en, unit_price, require_electricity_meter, require_water_meter FROM service WHERE is_active=true ORDER BY name_ar'),
    pool.query('SELECT id, name_ar FROM payment_method ORDER BY name_ar'),
  ])

  return (
    <div>
      <PageHeader
        title={`تعديل أمر العمل — ${woRes.rows[0].work_order_no}`}
        breadcrumb={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'اوامر العمل', href: '/work-orders' },
          { label: woRes.rows[0].work_order_no, href: `/work-orders/${id}` },
          { label: 'تعديل' },
        ]}
      />
      <WorkOrderForm
        consumers={consumersRes.rows}
        governorates={govRes.rows}
        areas={areasRes.rows}
        offices={officesRes.rows}
        supervisors={supervisorsRes.rows}
        services={servicesRes.rows}
        paymentMethods={paymentRes.rows}
      />
    </div>
  )
}
