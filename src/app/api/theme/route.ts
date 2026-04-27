import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { theme } = await req.json()
  const validTheme = ['light', 'dark', 'system'].includes(theme) ? theme : 'system'
  const response = NextResponse.json({ theme: validTheme })
  response.cookies.set('theme', validTheme, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  return response
}
