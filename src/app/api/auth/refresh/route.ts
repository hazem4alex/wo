import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, signAccessToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value
    if (!refreshToken) return NextResponse.json({ error: 'No refresh token' }, { status: 401 })

    const payload = verifyRefreshToken(refreshToken)
    const newToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
      roleId: payload.roleId,
      officeId: payload.officeId,
      fullName: payload.fullName,
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }
}
