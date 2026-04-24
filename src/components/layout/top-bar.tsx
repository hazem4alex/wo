'use client'

import { useTranslations } from 'next-intl'
import { Bell, Moon, Sun, Globe, Menu, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

interface TopBarProps {
  locale: string
  theme: string
  userName: string
  systemName: string
  onMenuClick?: () => void
}

export function TopBar({ locale, theme, userName, systemName, onMenuClick }: TopBarProps) {
  const t = useTranslations()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const toggleLocale = async () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar'
    await fetch('/api/locale', { method: 'POST', body: JSON.stringify({ locale: newLocale }) })
    startTransition(() => router.refresh())
  }

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    await fetch('/api/theme', { method: 'POST', body: JSON.stringify({ theme: newTheme }) })
    startTransition(() => router.refresh())
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="h-14 flex items-center justify-between px-4 sticky top-0 z-40" style={{ background: '#1e2130', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Left: system name + hamburger */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="text-sm flex items-center gap-1" style={{ color: '#4b5563' }}>
          <span>{systemName}</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <Button variant="ghost" size="icon" onClick={toggleLocale} title={locale === 'ar' ? 'English' : 'العربية'}>
          <Globe className="w-4 h-4" />
        </Button>

        {/* Dark mode toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="w-4 h-4" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-accent transition-colors">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: '#cd7f32', color: '#fff' }}>
              {userName.charAt(0)}
            </div>
            <span className="hidden sm:inline">{userName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              {t('auth.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
