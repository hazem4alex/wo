import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// GET /api/consumers/[id]/addresses
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await pool.query(
    `SELECT ca.id, ca.consumer_id, ca.governorate_id, ca.area_id, ca.office_id,
            ca.block_no, ca.town, ca.street, ca.house_no, ca.automated_figure, ca.note,
            ca.is_default, ca.sort_order,
            g.name_ar AS governorate_name,
            a.name_ar AS area_name,
            o.name_ar AS office_name
     FROM consumer_address ca
     LEFT JOIN governorate g ON ca.governorate_id = g.id
     LEFT JOIN area a ON ca.area_id = a.id
     LEFT JOIN office o ON ca.office_id = o.id
     WHERE ca.consumer_id = $1
     ORDER BY ca.is_default DESC, ca.sort_order ASC, ca.created_at ASC`,
    [id]
  )
  return NextResponse.json(result.rows)
}

// POST /api/consumers/[id]/addresses — add new address
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const { governorate_id, area_id, office_id, block_no, town, street, house_no, automated_figure, note, is_default } = body

  // If setting as default, clear existing default first
  if (is_default) {
    await pool.query('UPDATE consumer_address SET is_default=false WHERE consumer_id=$1', [id])
  }

  const result = await pool.query(
    `INSERT INTO consumer_address
       (consumer_id, governorate_id, area_id, office_id, block_no, town, street, house_no, automated_figure, note, is_default)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING id`,
    [id, governorate_id || null, area_id || null, office_id || null,
     block_no || null, town || null, street || null, house_no || null,
     automated_figure || null, note || null, is_default ?? false]
  )
  return NextResponse.json({ id: result.rows[0].id })
}
