import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getPermissionMap } from '@/lib/permissions'
import { AppShell } from '@/components/layout/app-shell'
import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'ar'
  const theme = cookieStore.get('theme')?.value ?? 'light'
  const t = await getTranslations('app')
  const permissions = await getPermissionMap()

  return (
    <AppShell locale={locale} theme={theme} userName={session.fullName} systemName={t('name')} permissions={permissions}>
      {children}
    </AppShell>
  )
}
