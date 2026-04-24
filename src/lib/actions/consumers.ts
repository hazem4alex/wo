'use server'
import { pool } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  full_name: z.string().min(1, 'الاسم مطلوب'),
  national_id: z.string().length(12, 'الرقم المدني يجب أن يكون 12 رقماً').optional().or(z.literal('')),
  consumer_code: z.string().optional(),
  consumer_no: z.string().optional(),
  phone: z.string().optional(),
  office_id: z.string().uuid(),
  area_id: z.string().uuid(),
  street: z.string().optional(),
  house_no: z.string().optional(),
  apartment_no: z.string().optional(),
  electricity_meter_no: z.string().optional(),
  water_meter_no: z.string().optional(),
  is_active: z.boolean().default(true),
})

export async function createConsumer(data: unknown) {
  await requireSession()
  const d = schema.parse(data)
  await pool.query(
    `INSERT INTO consumer (id, office_id, area_id, consumer_no, full_name, national_id,
      consumer_code, phone, street, house_no, apartment_no,
      electricity_meter_no, water_meter_no, is_active)
     VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [d.office_id, d.area_id, d.consumer_no||null, d.full_name, d.national_id||null,
     d.consumer_code||null, d.phone||null, d.street||null, d.house_no||null,
     d.apartment_no||null, d.electricity_meter_no||null, d.water_meter_no||null, d.is_active]
  )
  revalidatePath('/consumers')
  return { success: true }
}

export async function updateConsumer(id: string, data: unknown) {
  await requireSession()
  const d = schema.parse(data)
  await pool.query(
    `UPDATE consumer SET office_id=$1, area_id=$2, consumer_no=$3, full_name=$4,
      national_id=$5, consumer_code=$6, phone=$7, street=$8, house_no=$9,
      apartment_no=$10, electricity_meter_no=$11, water_meter_no=$12, is_active=$13
     WHERE id=$14`,
    [d.office_id, d.area_id, d.consumer_no||null, d.full_name, d.national_id||null,
     d.consumer_code||null, d.phone||null, d.street||null, d.house_no||null,
     d.apartment_no||null, d.electricity_meter_no||null, d.water_meter_no||null, d.is_active, id]
  )
  revalidatePath('/consumers')
  return { success: true }
}

export async function deleteConsumer(id: string) {
  await requireSession()
  await pool.query('DELETE FROM consumer WHERE id=$1', [id])
  revalidatePath('/consumers')
  return { success: true }
}
