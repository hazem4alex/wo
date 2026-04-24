'use server'
import { pool } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  code: z.string().min(1),
  unit_price: z.coerce.number().min(0),
  require_electricity_meter: z.boolean().default(false),
  require_water_meter: z.boolean().default(false),
  is_active: z.boolean().default(true),
})

export async function createService(data: unknown) {
  await requireSession()
  const parsed = schema.parse(data)
  await pool.query(
    'INSERT INTO service (id, code, name_ar, name_en, unit_price, require_electricity_meter, require_water_meter, is_active) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7)',
    [parsed.code, parsed.name_ar, parsed.name_en, parsed.unit_price, parsed.require_electricity_meter, parsed.require_water_meter, parsed.is_active]
  )
  revalidatePath('/services')
  return { success: true }
}

export async function updateService(id: string, data: unknown) {
  await requireSession()
  const parsed = schema.parse(data)
  await pool.query(
    'UPDATE service SET code=$1, name_ar=$2, name_en=$3, unit_price=$4, require_electricity_meter=$5, require_water_meter=$6, is_active=$7 WHERE id=$8',
    [parsed.code, parsed.name_ar, parsed.name_en, parsed.unit_price, parsed.require_electricity_meter, parsed.require_water_meter, parsed.is_active, id]
  )
  revalidatePath('/services')
  return { success: true }
}

export async function deleteService(id: string) {
  await requireSession()
  await pool.query('DELETE FROM service WHERE id=$1', [id])
  revalidatePath('/services')
  return { success: true }
}
