import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { OfficesClient } from './offices-client'

export default async function OfficesPage() {
  const [officesRes, areasRes, govRes] = await Promise.all([
    pool.query(`SELECT o.id, o.code, o.name_ar, o.name_en, o.is_active, o.area_id,
                       a.name_ar as area_name, g.name_ar as governorate_name,
                       TO_CHAR(o.created_at AT TIME ZONE 'Asia/Kuwait', 'YYYY-MM-DD HH24:MI') as created_at
                FROM office o
                LEFT JOIN area a ON o.area_id = a.id
                LEFT JOIN governorate g ON a.governorate_id = g.id
                ORDER BY o.created_at DESC`),
    pool.query('SELECT id, name_ar, governorate_id FROM area ORDER BY name_ar'),
    pool.query('SELECT id, name_ar FROM governorate ORDER BY name_ar'),
  ])
  return (
    <div>
      <PageHeader title="المكاتب" breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المكاتب' }]} />
      <OfficesClient rows={officesRes.rows} areas={areasRes.rows} governorates={govRes.rows} />
    </div>
  )
}
