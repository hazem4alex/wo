import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { AreasClient } from './areas-client'

export default async function AreasPage() {
  const [areasRes, govRes] = await Promise.all([
    pool.query(`SELECT a.id, a.name_ar, a.name_en, a.governorate_id, g.name_ar as governorate_name
                FROM area a LEFT JOIN governorate g ON a.governorate_id = g.id ORDER BY a.name_ar`),
    pool.query('SELECT id, name_ar FROM governorate ORDER BY name_ar'),
  ])
  return (
    <div>
      <PageHeader title="المناطق" breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المناطق' }]} />
      <AreasClient rows={areasRes.rows} governorates={govRes.rows} />
    </div>
  )
}
