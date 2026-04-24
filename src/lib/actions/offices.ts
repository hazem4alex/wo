'use server'
import { pool } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  code: z.string().min(1),
  area_id: z.string().uuid(),
  address: z.string().optional(),
  is_active: z.boolean().default(true),
})

export async function createOffice(data: unknown) {
  await requireSession()
  const parsed = schema.parse(data)
  await pool.query(
    'INSERT INTO office (id, area_id, code, name_ar, name_en, address, is_active) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6)',
    [parsed.area_id, parsed.code, parsed.name_ar, parsed.name_en, parsed.address ?? null, parsed.is_active]
  )
  revalidatePath('/offices')
  return { success: true }
}

export async function updateOffice(id: string, data: unknown) {
  await requireSession()
  const parsed = schema.parse(data)
  await pool.query(
    'UPDATE office SET area_id=$1, code=$2, name_ar=$3, name_en=$4, address=$5, is_active=$6 WHERE id=$7',
    [parsed.area_id, parsed.code, parsed.name_ar, parsed.name_en, parsed.address ?? null, parsed.is_active, id]
  )
  revalidatePath('/offices')
  return { success: true }
}

export async function deleteOffice(id: string) {
  await requireSession()
  await pool.query('DELETE FROM office WHERE id=$1', [id])
  revalidatePath('/offices')
  return { success: true }
}
