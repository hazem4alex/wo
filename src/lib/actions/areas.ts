'use server'
import { pool } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  governorate_id: z.string().uuid(),
})

export async function createArea(data: unknown) {
  await requireSession()
  const parsed = schema.parse(data)
  await pool.query(
    'INSERT INTO area (id, governorate_id, name_ar, name_en) VALUES (gen_random_uuid(), $1, $2, $3)',
    [parsed.governorate_id, parsed.name_ar, parsed.name_en]
  )
  revalidatePath('/areas')
  return { success: true }
}

export async function updateArea(id: string, data: unknown) {
  await requireSession()
  const parsed = schema.parse(data)
  await pool.query('UPDATE area SET name_ar=$1, name_en=$2, governorate_id=$3 WHERE id=$4',
    [parsed.name_ar, parsed.name_en, parsed.governorate_id, id])
  revalidatePath('/areas')
  return { success: true }
}

export async function deleteArea(id: string) {
  await requireSession()
  await pool.query('DELETE FROM area WHERE id=$1', [id])
  revalidatePath('/areas')
  return { success: true }
}
