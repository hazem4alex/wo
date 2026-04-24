'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Zap } from 'lucide-react'
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
    <div className="min-h-screen flex" dir="rtl">
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f172a] flex-col items-center justify-center p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-amber-400 rounded-xl flex items-center justify-center">
            <Zap className="w-10 h-10 text-slate-900" />
          </div>
          <div className="text-white">
            <div className="text-2xl font-bold">ALSHAMEL</div>
            <div className="text-slate-400 text-sm">نظام إدارة الكهرباء</div>
          </div>
        </div>
        <p className="text-slate-400 text-center text-sm max-w-xs leading-relaxed">
          نظرة عامة على إحصائيات نظام إدارة الكهرباء والماء لوزارة الكهرباء والماء
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-slate-900" />
            </div>
            <span className="text-xl font-bold text-slate-800">ALSHAMEL</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">{t('login')}</h1>
          <p className="text-gray-500 text-sm text-center mb-8">نظام إدارة الكهرباء والماء</p>

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
