'use server'
import { pool } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const itemSchema = z.object({
  service_name_ar: z.string().min(1),
  service_name_en: z.string().default(''),
  service_code: z.string().optional(),
  quantity: z.coerce.number().min(1),
  unit_price: z.coerce.number().min(0),
  discount_amount: z.coerce.number().min(0).default(0),
  fine_amount: z.coerce.number().min(0).default(0),
  total_amount: z.coerce.number().min(0),
})

const workOrderSchema = z.object({
  consumer_id: z.string().uuid(),
  office_id: z.string().uuid(),
  supervisor_id: z.string().uuid().optional().or(z.literal('')),
  payment_method_id: z.string().uuid().optional().or(z.literal('')),
  governorate_id: z.string().uuid().optional().or(z.literal('')),
  area_id: z.string().uuid().optional().or(z.literal('')),
  status: z.enum(['draft','open','assigned','in_progress','completed','cancelled']).default('open'),
  notes: z.string().optional(),
  street: z.string().optional(),
  house_no: z.string().optional(),
  apartment_no: z.string().optional(),
  electricity_meter_old_no: z.string().optional(),
  electricity_meter_new_no: z.string().optional(),
  electricity_old_reading: z.coerce.number().default(0),
  electricity_new_reading: z.coerce.number().optional(),
  water_meter_old_no: z.string().optional(),
  water_meter_new_no: z.string().optional(),
  water_old_reading: z.coerce.number().default(0),
  water_new_reading: z.coerce.number().optional(),
  items: z.array(itemSchema).min(1, 'يجب إضافة بند واحد على الأقل'),
})

function generateWorkOrderNo(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `WO-${date}-${rand}`
}

export async function createWorkOrder(data: unknown) {
  const session = await requireSession()
  const parsed = workOrderSchema.parse(data)

  const netAmount = parsed.items.reduce((sum, item) => sum + item.total_amount, 0)
  const discountTotal = parsed.items.reduce((sum, item) => sum + item.discount_amount, 0)
  const workOrderNo = generateWorkOrderNo()

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const woResult = await client.query(
      `INSERT INTO work_order (
        id, work_order_no, work_order_code, consumer_id, office_id, supervisor_id,
        payment_method_id, status, notes, governorate_id, area_id,
        street, house_no, apartment_no,
        electricity_meter_old_no, electricity_meter_new_no, electricity_old_reading, electricity_new_reading,
        water_meter_old_no, water_meter_new_no, water_old_reading, water_new_reading,
        amount, discount_amount, net_amount, created_by
      ) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
      RETURNING id`,
      [
        workOrderNo, workOrderNo,
        parsed.consumer_id, parsed.office_id,
        parsed.supervisor_id || null, parsed.payment_method_id || null,
        parsed.status, parsed.notes || null,
        parsed.governorate_id || null, parsed.area_id || null,
        parsed.street || null, parsed.house_no || null, parsed.apartment_no || null,
        parsed.electricity_meter_old_no || null, parsed.electricity_meter_new_no || null,
        parsed.electricity_old_reading, parsed.electricity_new_reading ?? null,
        parsed.water_meter_old_no || null, parsed.water_meter_new_no || null,
        parsed.water_old_reading, parsed.water_new_reading ?? null,
        netAmount, discountTotal, netAmount,
        session.userId,
      ]
    )

    const woId = woResult.rows[0].id

    for (const item of parsed.items) {
      await client.query(
        `INSERT INTO work_order_item (id, work_order_id, service_name_ar, service_name_en, service_code,
           quantity, unit_price, discount_amount, fine_amount, total_amount, service_date)
         VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_DATE)`,
        [woId, item.service_name_ar, item.service_name_en, item.service_code || null,
         item.quantity, item.unit_price, item.discount_amount, item.fine_amount, item.total_amount]
      )
    }

    // Log creation event
    await client.query(
      `INSERT INTO work_order_event (id, work_order_id, event_type, message, actor_user_id)
       VALUES (gen_random_uuid(),$1,'created','تم إنشاء أمر العمل',$2)`,
      [woId, session.userId]
    )

    await client.query('COMMIT')
    revalidatePath('/work-orders')
    redirect(`/work-orders/${woId}`)
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export async function updateWorkOrderStatus(workOrderId: string, newStatus: string, message?: string) {
  const session = await requireSession()

  await pool.query('UPDATE work_order SET status=$1 WHERE id=$2', [newStatus, workOrderId])
  await pool.query(
    `INSERT INTO work_order_event (id, work_order_id, event_type, message, actor_user_id)
     VALUES (gen_random_uuid(),$1,$2,$3,$4)`,
    [workOrderId, `status_changed_to_${newStatus}`, message || `تغيير الحالة إلى ${newStatus}`, session.userId]
  )

  revalidatePath(`/work-orders/${workOrderId}`)
  revalidatePath('/work-orders')
  return { success: true }
}
