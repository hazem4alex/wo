import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { ConsumersClient } from './consumers-client'

export default async function ConsumersPage() {
  const [consumersRes, govRes, areasRes, officesRes] = await Promise.all([
    pool.query(`
      SELECT c.id, c.full_name, c.national_id, c.consumer_code, c.consumer_no,
             c.phone, c.is_active, c.street, c.house_no, c.apartment_no,
             c.electricity_meter_no, c.water_meter_no, c.area_id, c.office_id,
             a.name_ar as area_name, a.governorate_id,
             g.name_ar as governorate_name,
             o.name_ar as office_name,
             TO_CHAR(c.created_at AT TIME ZONE 'Asia/Kuwait', 'YYYY-MM-DD') as created_at
      FROM consumer c
      LEFT JOIN area a ON c.area_id = a.id
      LEFT JOIN governorate g ON a.governorate_id = g.id
      LEFT JOIN office o ON c.office_id = o.id
      ORDER BY c.created_at DESC
    `),
    pool.query('SELECT id, name_ar FROM governorate ORDER BY name_ar'),
    pool.query('SELECT id, name_ar, governorate_id FROM area ORDER BY name_ar'),
    pool.query('SELECT id, name_ar, area_id FROM office WHERE is_active=true ORDER BY name_ar'),
  ])
  return (
    <div>
      <PageHeader
        title="المستهلكين"
        breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المستهلكين' }]}
      />
      <ConsumersClient
        rows={consumersRes.rows}
        governorates={govRes.rows}
        areas={areasRes.rows}
        offices={officesRes.rows}
      />
    </div>
  )
}
