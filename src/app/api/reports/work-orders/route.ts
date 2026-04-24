import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const status = searchParams.get('status')
  const supervisorId = searchParams.get('supervisor_id')
  const officeId = searchParams.get('office_id')

  const conditions: string[] = []
  const values: unknown[] = []
  let i = 1

  if (from) { conditions.push(`wo.created_at >= $${i++}`); values.push(new Date(from)) }
  if (to) { conditions.push(`wo.created_at <= $${i++}`); values.push(new Date(to + 'T23:59:59')) }
  if (status) { conditions.push(`wo.status = $${i++}`); values.push(status) }
  if (supervisorId) { conditions.push(`wo.supervisor_id = $${i++}`); values.push(supervisorId) }
  if (officeId) { conditions.push(`wo.office_id = $${i++}`); values.push(officeId) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const result = await pool.query(`
    SELECT
      wo.id, wo.work_order_no, wo.status, wo.net_amount,
      c.full_name as consumer_name,
      s.full_name as supervisor_name,
      o.name_ar as office_name,
      a.name_ar as area_name,
      COALESCE(STRING_AGG(DISTINCT wi.service_name_ar, ', '), '') as service_names,
      EXISTS(SELECT 1 FROM work_order_item woi WHERE woi.work_order_id = wo.id AND woi.fine_amount > 0) as has_fine,
      TO_CHAR(wo.created_at AT TIME ZONE 'Asia/Kuwait', 'YYYY-MM-DD') as date
    FROM work_order wo
    LEFT JOIN consumer c ON wo.consumer_id = c.id
    LEFT JOIN supervisor s ON wo.supervisor_id = s.id
    LEFT JOIN office o ON wo.office_id = o.id
    LEFT JOIN area a ON wo.area_id = a.id
    LEFT JOIN work_order_item wi ON wi.work_order_id = wo.id
    ${where}
    GROUP BY wo.id, wo.work_order_no, wo.status, wo.net_amount, c.full_name, s.full_name, o.name_ar, a.name_ar, wo.created_at
    ORDER BY wo.created_at DESC
    LIMIT 500
  `, values)

  return NextResponse.json({ rows: result.rows })
}
