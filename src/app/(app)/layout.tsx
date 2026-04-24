import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { TopBar } from '@/components/layout/top-bar'
import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'ar'
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const t = await getTranslations('app')

  return (
    <html lang={locale} dir={dir}>
      <body className="bg-gray-50 min-h-screen">
        <div className={`flex min-h-screen ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
          <AppSidebar />
          <div className={`flex-1 flex flex-col ${dir === 'rtl' ? 'me-64' : 'ms-64'}`}>
            <TopBar locale={locale} userName={session.fullName} systemName={t('name')} />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
