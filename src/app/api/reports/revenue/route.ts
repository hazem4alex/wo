import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const conditions: string[] = []
  const values: unknown[] = []
  let i = 1
  if (from) { conditions.push(`wo.created_at >= $${i++}`); values.push(new Date(from)) }
  if (to) { conditions.push(`wo.created_at <= $${i++}`); values.push(new Date(to + 'T23:59:59')) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const result = await pool.query(`
    SELECT
      wi.service_name_ar, wi.service_code,
      COUNT(DISTINCT wo.id) as order_count,
      SUM(wi.quantity) as total_qty,
      AVG(wi.unit_price) as unit_price,
      SUM(wi.quantity * wi.unit_price) as total_revenue,
      SUM(wi.discount_amount) as discount_total,
      SUM(wi.total_amount) as net_revenue
    FROM work_order_item wi
    JOIN work_order wo ON wi.work_order_id = wo.id
    ${where}
    GROUP BY wi.service_name_ar, wi.service_code
    ORDER BY net_revenue DESC
  `, values)

  return NextResponse.json({ rows: result.rows })
}
