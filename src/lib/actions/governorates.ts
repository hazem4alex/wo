'use server'
import { pool } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
})

export async function createGovernorate(data: unknown) {
  await requireSession()
  const parsed = schema.parse(data)
  // Get Kuwait country id
  const country = await pool.query("SELECT id FROM country LIMIT 1")
  const countryId = country.rows[0]?.id
  await pool.query(
    'INSERT INTO governorate (id, country_id, name_ar, name_en) VALUES (gen_random_uuid(), $1, $2, $3)',
    [countryId, parsed.name_ar, parsed.name_en]
  )
  revalidatePath('/governorates')
  return { success: true }
}

export async function updateGovernorate(id: string, data: unknown) {
  await requireSession()
  const parsed = schema.parse(data)
  await pool.query('UPDATE governorate SET name_ar=$1, name_en=$2 WHERE id=$3', [parsed.name_ar, parsed.name_en, id])
  revalidatePath('/governorates')
  return { success: true }
}

export async function deleteGovernorate(id: string) {
  await requireSession()
  await pool.query('DELETE FROM governorate WHERE id=$1', [id])
  revalidatePath('/governorates')
  return { success: true }
}
