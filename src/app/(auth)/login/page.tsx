'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Zap, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        setError(t('invalidCredentials'))
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(t('invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ background: '#1a1d24' }}>
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12" style={{ background: '#13151c', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Ministry emblem */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2" style={{ background: 'rgba(205,127,50,0.1)', borderColor: 'rgba(205,127,50,0.3)' }} />
            <div className="absolute inset-2 rounded-full border" style={{ background: 'rgba(205,127,50,0.05)', borderColor: 'rgba(205,127,50,0.2)' }} />
            <div className="flex gap-1 z-10">
              <Zap className="w-7 h-7" style={{ color: '#cd7f32' }} />
              <Droplets className="w-7 h-7" style={{ color: '#38bdf8' }} />
            </div>
          </div>
        </div>
        <div className="text-center mb-6">
          <div className="text-xl font-bold mb-1" style={{ color: '#e2e8f0' }}>وزارة الكهرباء والماء</div>
          <div className="text-sm font-medium" style={{ color: '#cd7f32' }}>Ministry of Electricity & Water</div>
          <div className="text-xs mt-1" style={{ color: '#374151' }}>دولة الكويت</div>
        </div>
        <div className="w-16 my-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        <p className="text-center text-sm max-w-xs leading-relaxed" style={{ color: '#4b5563' }}>
          نظام إدارة أوامر العمل للخدمات الميدانية
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(205,127,50,0.08)', border: '1px solid rgba(205,127,50,0.15)' }}>
            <Zap className="w-5 h-5 mx-auto mb-1" style={{ color: '#cd7f32' }} />
            <div className="text-xs" style={{ color: '#64748b' }}>خدمات الكهرباء</div>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}>
            <Droplets className="w-5 h-5 mx-auto mb-1" style={{ color: '#38bdf8' }} />
            <div className="text-xs" style={{ color: '#64748b' }}>خدمات المياه</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#1a1d24' }}>
        <div className="rounded-2xl w-full max-w-md p-8" style={{ background: '#1e2130', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#cd7f32,#f59e0b)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-center" style={{ color: '#e2e8f0' }}>{t('login')}</h1>
          <p className="text-sm text-center mb-8" style={{ color: '#4b5563' }}>وزارة الكهرباء والماء — دولة الكويت</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@system.com" required dir="ltr" className="text-left" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                required dir="ltr" />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</p>
            )}
            <Button type="submit" disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 text-base font-medium">
              {loading ? '...' : t('loginButton')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
