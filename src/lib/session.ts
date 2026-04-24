import { cookies } from 'next/headers'
import { verifyAccessToken, JwtPayload } from './auth'

export async function getSession(): Promise<JwtPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null
    return verifyAccessToken(token)
  } catch {
    return null
  }
}

export async function requireSession(): Promise<JwtPayload> {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}
