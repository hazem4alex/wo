import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { UsersClient } from './users-client'

export default async function UsersPage() {
  const [usersRes, rolesRes, officesRes] = await Promise.all([
    pool.query(`SELECT u.id, u.full_name, u.email, u.role_id, u.office_id, u.is_active, u.created_at,
                       COALESCE(r.name_ar, r.name) as role_name, o.name_ar as office_name
                FROM app_user u
                LEFT JOIN app_role r ON r.id = u.role_id
                LEFT JOIN office o ON o.id = u.office_id
                ORDER BY u.created_at DESC`),
    pool.query(`SELECT id, COALESCE(name_ar, name) AS name FROM app_role ORDER BY COALESCE(name_ar, name)`),
    pool.query(`SELECT id, name_ar FROM office ORDER BY name_ar`),
  ])
  return (
    <div>
      <PageHeader
        title="المستخدمون"
        breadcrumb={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'الإعدادات' },
          { label: 'المستخدمون' },
        ]}
      />
      <UsersClient users={usersRes.rows} roles={rolesRes.rows} offices={officesRes.rows} />
    </div>
  )
}
