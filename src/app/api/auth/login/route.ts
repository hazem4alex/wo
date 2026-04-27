import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyPassword, signAccessToken, signRefreshToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const identifier = (email ?? '').trim()
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    // Match either by exact value or case-insensitive (for emails)
    const result = await pool.query(
      `SELECT id, email, password_hash, full_name, full_name_ar, role_id, office_id, is_active
       FROM app_user
       WHERE email = $1 OR LOWER(email) = LOWER($1)
       LIMIT 1`,
      [identifier]
    )

    const user = result.rows[0]
    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const payload = {
      userId: user.id,
      email: user.email,
      roleId: user.role_id,
      officeId: user.office_id,
      fullName: user.full_name_ar || user.full_name || user.email,
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    const response = NextResponse.json({ success: true })
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    }
    response.cookies.set('token', accessToken, { ...cookieOpts, maxAge: 60 * 60 * 24 })
    response.cookies.set('refresh_token', refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 })
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
