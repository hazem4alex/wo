'use server'
import { pool } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { hashPassword } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// TODO: add role-based permission check

const userSchema = z.object({
  full_name: z.string().min(2, 'الاسم مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8).optional().or(z.literal('')),
  role_id: z.string().uuid().optional().or(z.literal('')).or(z.literal(null)),
  office_id: z.string().uuid().optional().or(z.literal('')).or(z.literal(null)),
  is_active: z.boolean(),
})

export interface UserData {
  full_name: string
  email: string
  password?: string
  role_id?: string | null
  office_id?: string | null
  is_active: boolean
}

export async function createUser(data: UserData) {
  await requireSession()
  userSchema.parse(data)
  if (!data.password) throw new Error('كلمة المرور مطلوبة')
  const hash = await hashPassword(data.password)
  try {
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
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      throw new Error('البريد الإلكتروني مستخدم مسبقاً')
    }
    throw err
  }
  revalidatePath('/settings/users')
  return { success: true }
}

export async function updateUser(id: string, data: UserData) {
  await requireSession()
  userSchema.parse(data)
  try {
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
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      throw new Error('البريد الإلكتروني مستخدم مسبقاً')
    }
    throw err
  }
  revalidatePath('/settings/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  await requireSession()
  // TODO: add role-based permission check
  await pool.query(`UPDATE app_user SET is_active = false WHERE id = $1`, [id])
  revalidatePath('/settings/users')
  return { success: true }
}

export async function sendNotificationToAll() {
  await requireSession()
  // TODO: add role-based permission check
  const result = await pool.query('SELECT id, email, full_name FROM app_user WHERE is_active = true')
  console.log(`[sendNotificationToAll] Sending notification to ${result.rows.length} users:`, result.rows.map(u => u.email))
  return { success: true }
}
