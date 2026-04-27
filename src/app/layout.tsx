import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import './globals.css'

export const metadata: Metadata = {
  title: 'نظام إدارة الكهرباء',
  description: 'Kuwait Electricity Work Order Management System',
}

const themeScript = `
(() => {
  const getCookie = (name) => document.cookie.split('; ').find((row) => row.startsWith(name + '='))?.split('=')[1]
  const applyTheme = () => {
    const theme = getCookie('theme') || 'system'
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && systemDark))
  }
  applyTheme()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme)
})()
`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'ar'
  const validLocale = ['ar', 'en'].includes(locale) ? locale : 'ar'
  const dir = validLocale === 'ar' ? 'rtl' : 'ltr'
  const theme = cookieStore.get('theme')?.value ?? 'system'
  const isDark = theme === 'dark'
  const messages = await getMessages()

  return (
    <html lang={validLocale} dir={dir} className={isDark ? 'dark' : ''} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased bg-background">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
