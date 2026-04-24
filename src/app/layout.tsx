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
  const messages = await getMessages()

  return (
    <html lang={validLocale} dir={dir}>
      <body className="min-h-screen antialiased" style={{ background: '#1a1d24' }}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
