'use server'
import { pool } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { requirePermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'

export async function createRole(name: string, description?: string) {
  await requireSession()
  await requirePermission('roles.edit')
  if (!name?.trim()) throw new Error('اسم الدور مطلوب')
  await pool.query(
    `INSERT INTO app_role (id, name, name_ar, description) VALUES (gen_random_uuid(), $1, $1, $2)`,
    [name.trim(), description?.trim() || null]
  )
  revalidatePath('/settings/roles')
  return { success: true }
}

export async function deleteRole(id: string) {
  await requireSession()
  await requirePermission('roles.edit')
  // Don't allow deleting if any user is assigned
  const usersRes = await pool.query('SELECT COUNT(*)::int AS cnt FROM app_user WHERE role_id=$1', [id])
  if (usersRes.rows[0].cnt > 0) {
    throw new Error(`لا يمكن حذف الدور — يوجد ${usersRes.rows[0].cnt} مستخدم مرتبط به`)
  }
  await pool.query('DELETE FROM role_permission WHERE role_id=$1', [id])
  await pool.query('DELETE FROM app_role WHERE id=$1', [id])
  revalidatePath('/settings/roles')
  return { success: true }
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  await requireSession()
  await requirePermission('roles.edit')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM role_permission WHERE role_id = $1', [roleId])
    if (permissionIds.length > 0) {
      const values = permissionIds.map((pid, i) => `($1, $${i + 2})`).join(', ')
      await client.query(
        `INSERT INTO role_permission (role_id, permission_id) VALUES ${values}`,
        [roleId, ...permissionIds]
      )
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
  revalidatePath('/settings/roles')
  return { success: true }
}
