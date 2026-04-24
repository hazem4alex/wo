import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { RolesClient } from './roles-client'

export default async function RolesPage() {
  const [rolesRes, permissionsRes, rolePermissionsRes] = await Promise.all([
    pool.query(`SELECT r.id, r.name, r.description FROM role r ORDER BY r.name`),
    pool.query(`SELECT id, name, module_key, description FROM permission ORDER BY module_key, name`).catch(() => ({ rows: [] })),
    pool.query(`SELECT role_id, permission_id FROM role_permission`).catch(() => ({ rows: [] })),
  ])

  // Count permissions per role
  const permCountMap: Record<string, number> = {}
  for (const rp of rolePermissionsRes.rows) {
    permCountMap[rp.role_id] = (permCountMap[rp.role_id] ?? 0) + 1
  }

  const roles = rolesRes.rows.map(r => ({
    ...r,
    permission_count: permCountMap[r.id] ?? 0,
  }))

  return (
    <div>
      <PageHeader
        title="الأدوار والصلاحيات"
        breadcrumb={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'الإعدادات' },
          { label: 'الأدوار والصلاحيات' },
        ]}
      />
      <RolesClient
        roles={roles}
        permissions={permissionsRes.rows}
        rolePermissions={rolePermissionsRes.rows}
      />
    </div>
  )
}
