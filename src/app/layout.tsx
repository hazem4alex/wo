import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import './globals.css'

export const metadata: Metadata = {
  title: 'نظام إدارة الكهرباء',
  description: 'Kuwait Electricity Work Order Management System',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'ar'
  const validLocale = ['ar', 'en'].includes(locale) ? locale : 'ar'
  const dir = validLocale === 'ar' ? 'rtl' : 'ltr'
  const theme = cookieStore.get('theme')?.value ?? 'light'
  const isDark = theme === 'dark'
  const messages = await getMessages()

  return (
    <html lang={validLocale} dir={dir} className={isDark ? 'dark' : ''}>
      <body className="bg-gray-50 min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
