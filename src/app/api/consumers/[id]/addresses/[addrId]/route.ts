import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

type Ctx = { params: Promise<{ id: string; addrId: string }> }

// DELETE /api/consumers/[id]/addresses/[addrId]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id, addrId } = await params
  await pool.query('DELETE FROM consumer_address WHERE id=$1 AND consumer_id=$2', [addrId, id])
  return NextResponse.json({ ok: true })
}

// PATCH /api/consumers/[id]/addresses/[addrId] — update or set default
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id, addrId } = await params
  const body = await req.json()

  if (body.set_default) {
    await pool.query('UPDATE consumer_address SET is_default=false WHERE consumer_id=$1', [id])
    await pool.query('UPDATE consumer_address SET is_default=true WHERE id=$1 AND consumer_id=$2', [addrId, id])
    return NextResponse.json({ ok: true })
  }

  const { governorate_id, area_id, office_id, block_no, town, street, house_no, automated_figure, note, is_default } = body

  if (is_default) {
    await pool.query('UPDATE consumer_address SET is_default=false WHERE consumer_id=$1', [id])
  }

  await pool.query(
    `UPDATE consumer_address SET
       governorate_id=$1, area_id=$2, office_id=$3,
       block_no=$4, town=$5, street=$6, house_no=$7, automated_figure=$8, note=$9, is_default=$10
     WHERE id=$11 AND consumer_id=$12`,
    [governorate_id || null, area_id || null, office_id || null,
     block_no || null, town || null, street || null, house_no || null,
     automated_figure || null, note || null, is_default ?? false, addrId, id]
  )
  return NextResponse.json({ ok: true })
}
