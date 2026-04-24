import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { locale } = await req.json()
  const validLocale = ['ar', 'en'].includes(locale) ? locale : 'ar'
  const response = NextResponse.json({ locale: validLocale })
  response.cookies.set('locale', validLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  return response
}
