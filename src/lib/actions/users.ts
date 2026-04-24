'use server'
import { pool } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { hashPassword } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export interface UserData {
  full_name: string
  email: string
  password?: string
  role_id?: string
  office_id?: string
  is_active: boolean
}

export async function createUser(data: UserData) {
  await requireSession()
  if (!data.password) throw new Error('كلمة المرور مطلوبة')
  const hash = await hashPassword(data.password)
  await pool.query(
    `INSERT INTO app_user (id, full_name, email, password_hash, role_id, office_id, is_active)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
    [
      data.full_name,
      data.email,
      hash,
      data.role_id || null,
      data.office_id || null,
      data.is_active,
    ]
  )
  revalidatePath('/settings/users')
  return { success: true }
}

export async function updateUser(id: string, data: UserData) {
  await requireSession()
  if (data.password) {
    const hash = await hashPassword(data.password)
    await pool.query(
      `UPDATE app_user SET full_name=$1, email=$2, password_hash=$3, role_id=$4, office_id=$5, is_active=$6 WHERE id=$7`,
      [data.full_name, data.email, hash, data.role_id || null, data.office_id || null, data.is_active, id]
    )
  } else {
    await pool.query(
      `UPDATE app_user SET full_name=$1, email=$2, role_id=$3, office_id=$4, is_active=$5 WHERE id=$6`,
      [data.full_name, data.email, data.role_id || null, data.office_id || null, data.is_active, id]
    )
  }
  revalidatePath('/settings/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  await requireSession()
  await pool.query('DELETE FROM app_user WHERE id=$1', [id])
  revalidatePath('/settings/users')
  return { success: true }
}

export async function sendNotificationToAll() {
  await requireSession()
  const result = await pool.query('SELECT id, email, full_name FROM app_user WHERE is_active = true')
  console.log(`[sendNotificationToAll] Sending notification to ${result.rows.length} users:`, result.rows.map(u => u.email))
  return { success: true }
}
