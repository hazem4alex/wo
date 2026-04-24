import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { SupervisorsClient } from './supervisors-client'

export default async function SupervisorsPage() {
  const [supRes, officeRes] = await Promise.all([
    pool.query(`SELECT s.id, s.full_name, s.employee_code, s.phone, s.email, s.is_active, s.office_id,
                       o.name_ar as office_name
                FROM supervisor s LEFT JOIN office o ON s.office_id = o.id
                ORDER BY s.full_name`),
    pool.query('SELECT id, name_ar FROM office WHERE is_active = true ORDER BY name_ar'),
  ])
  return (
    <div>
      <PageHeader title="المشرفين" breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المشرفين' }]} />
      <SupervisorsClient rows={supRes.rows} offices={officeRes.rows} />
    </div>
  )
}
