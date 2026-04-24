'use server'
import { pool } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  code: z.string().min(1),
})

export async function createPaymentMethod(data: unknown) {
  await requireSession()
  const parsed = schema.parse(data)
  await pool.query(
    'INSERT INTO payment_method (id, code, name_ar, name_en) VALUES (gen_random_uuid(),$1,$2,$3)',
    [parsed.code, parsed.name_ar, parsed.name_en]
  )
  revalidatePath('/settings/payment-methods')
  return { success: true }
}

export async function updatePaymentMethod(id: string, data: unknown) {
  await requireSession()
  const parsed = schema.parse(data)
  await pool.query('UPDATE payment_method SET code=$1, name_ar=$2, name_en=$3 WHERE id=$4',
    [parsed.code, parsed.name_ar, parsed.name_en, id])
  revalidatePath('/settings/payment-methods')
  return { success: true }
}

export async function deletePaymentMethod(id: string) {
  await requireSession()
  await pool.query('DELETE FROM payment_method WHERE id=$1', [id])
  revalidatePath('/settings/payment-methods')
  return { success: true }
}
