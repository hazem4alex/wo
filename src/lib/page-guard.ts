import { redirect } from 'next/navigation'
import { hasPermission } from './permissions'

/**
 * Server-component helper. Call at the top of a page.tsx server component to
 * enforce a permission. If the user lacks the permission, redirect to /dashboard
 * with a flash message (or just /dashboard).
 *
 *   await guardPage('consumers.view')
 */
export async function guardPage(key: string): Promise<void> {
  if (!(await hasPermission(key))) {
    redirect('/dashboard?denied=' + encodeURIComponent(key))
  }
}
