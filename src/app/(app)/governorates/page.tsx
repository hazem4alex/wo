import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { GovernoratesClient } from './governorates-client'

export default async function GovernoratesPage() {
  const result = await pool.query('SELECT id, name_ar, name_en, created_at FROM governorate ORDER BY name_ar')
  return (
    <div>
      <PageHeader title="المحافظات" breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المحافظات' }]} />
      <GovernoratesClient rows={result.rows} />
    </div>
  )
}
