import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { ServicesClient } from './services-client'

export default async function ServicesPage() {
  const result = await pool.query(
    'SELECT id, code, name_ar, name_en, unit_price, require_electricity_meter, require_water_meter, is_active, created_at FROM service ORDER BY code'
  )
  return (
    <div>
      <PageHeader title="الخدمات" breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الخدمات' }]} />
      <ServicesClient rows={result.rows} />
    </div>
  )
}
