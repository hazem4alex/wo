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
    <div className="min-h-screen flex" dir="rtl">
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f172a] flex-col items-center justify-center p-12">
        {/* Ministry emblem */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 border-2 border-amber-400/40" />
            <div className="absolute inset-2 rounded-full bg-amber-400/10 border border-amber-400/30" />
            <div className="flex gap-1 z-10">
              <Zap className="w-7 h-7 text-amber-400" />
              <Droplets className="w-7 h-7 text-sky-400" />
            </div>
          </div>
        </div>
        <div className="text-center mb-6">
          <div className="text-white text-xl font-bold mb-1">وزارة الكهرباء والماء</div>
          <div className="text-amber-400 text-sm font-medium">Ministry of Electricity & Water</div>
          <div className="text-slate-500 text-xs mt-1">دولة الكويت</div>
        </div>
        <div className="w-16 border-t border-slate-700 my-4" />
        <p className="text-slate-400 text-center text-sm max-w-xs leading-relaxed">
          نظام إدارة أوامر العمل للخدمات الميدانية
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-slate-400 text-xs">خدمات الكهرباء</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <Droplets className="w-5 h-5 text-sky-400 mx-auto mb-1" />
            <div className="text-slate-400 text-xs">خدمات المياه</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-amber-400 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-slate-900" />
            </div>
            <div className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">{t('login')}</h1>
          <p className="text-gray-500 text-sm text-center mb-8">وزارة الكهرباء والماء — دولة الكويت</p>

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
