import type { Metadata } from 'next'
import { cookies } from 'next/headers'
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

  return (
    <html lang={validLocale} dir={dir}>
      <body className="bg-gray-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
