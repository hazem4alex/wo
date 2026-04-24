'use server'
import { pool } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  await requireSession()
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
