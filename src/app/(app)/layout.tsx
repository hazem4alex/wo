import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { AppShell } from '@/components/layout/app-shell'
import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'ar'
  const t = await getTranslations('app')

  return (
    <AppShell locale={locale} userName={session.fullName} systemName={t('name')}>
      {children}
    </AppShell>
  )
}
