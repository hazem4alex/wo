import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (!q || q.length < 1) {
    return NextResponse.json([])
  }

  const like = `%${q}%`

  const result = await pool.query(
    `SELECT c.id, c.full_name, c.consumer_code, c.consumer_no, c.national_id, c.phone,
            c.street, c.house_no, c.apartment_no,
            c.area_id, c.office_id,
            a.governorate_id
     FROM consumer c
     LEFT JOIN area a ON c.area_id = a.id
     WHERE c.is_active = true
       AND (
         c.full_name   ILIKE $1 OR
         c.national_id ILIKE $1 OR
         c.consumer_code ILIKE $1 OR
         c.consumer_no   ILIKE $1 OR
         c.phone         ILIKE $1
       )
     ORDER BY c.full_name
     LIMIT 50`,
    [like]
  )

  return NextResponse.json(result.rows)
}
