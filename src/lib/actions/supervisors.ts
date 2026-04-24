'use server'
import { pool } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  full_name: z.string().min(1),
  employee_code: z.string().min(1),
  office_id: z.string().uuid(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
})

export async function createSupervisor(data: unknown) {
  await requireSession()
  const parsed = schema.parse(data)
  await pool.query(
    'INSERT INTO supervisor (id, office_id, full_name, employee_code, phone, email, is_active) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6)',
    [parsed.office_id, parsed.full_name, parsed.employee_code, parsed.phone || null, parsed.email || null, parsed.is_active]
  )
  revalidatePath('/supervisors')
  return { success: true }
}

export async function updateSupervisor(id: string, data: unknown) {
  await requireSession()
  const parsed = schema.parse(data)
  await pool.query(
    'UPDATE supervisor SET office_id=$1, full_name=$2, employee_code=$3, phone=$4, email=$5, is_active=$6 WHERE id=$7',
    [parsed.office_id, parsed.full_name, parsed.employee_code, parsed.phone || null, parsed.email || null, parsed.is_active, id]
  )
  revalidatePath('/supervisors')
  return { success: true }
}

export async function deleteSupervisor(id: string) {
  await requireSession()
  await pool.query('DELETE FROM supervisor WHERE id=$1', [id])
  revalidatePath('/supervisors')
  return { success: true }
}
