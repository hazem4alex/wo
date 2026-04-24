import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const officeId = searchParams.get('office_id')

  const conditions: string[] = []
  const values: unknown[] = []
  let i = 1
  if (from) { conditions.push(`wo.created_at >= $${i++}`); values.push(new Date(from)) }
  if (to) { conditions.push(`wo.created_at <= $${i++}`); values.push(new Date(to + 'T23:59:59')) }
  if (officeId) { conditions.push(`s.office_id = $${i++}`); values.push(officeId) }

  const where = conditions.length ? `AND ${conditions.join(' AND ')}` : ''

  const result = await pool.query(`
    SELECT
      s.full_name as supervisor_name,
      o.name_ar as office_name,
      COUNT(wo.id) as total_orders,
      COUNT(wo.id) FILTER (WHERE wo.status = 'completed') as completed,
      COUNT(wo.id) FILTER (WHERE wo.status = 'open') as pending,
      COALESCE(SUM(wo.net_amount), 0) as total_revenue
    FROM supervisor s
    LEFT JOIN office o ON s.office_id = o.id
    LEFT JOIN work_order wo ON wo.supervisor_id = s.id ${where}
    GROUP BY s.id, s.full_name, o.name_ar
    ORDER BY total_orders DESC
  `, values)

  return NextResponse.json({ rows: result.rows })
}
