import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { WorkOrderForm } from '@/components/work-orders/work-order-form'

export default async function NewWorkOrderPage() {
  const [govRes, areasRes, officesRes, supervisorsRes, servicesRes, paymentRes] = await Promise.all([
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
        title="إضافة امر عمل"
        breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'اوامر العمل', href: '/work-orders' }, { label: 'إضافة' }]}
      />
      <WorkOrderForm
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
