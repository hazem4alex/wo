import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'

// Cache permissions per session to avoid hitting the DB on every check.
// Server Components run per request; this cache lives just for the request.
const cache = new Map<string, Set<string>>()

/**
 * Load all permission keys (e.g. "consumers.view", "work_orders.create") that
 * the current session's role grants. Returns an empty set if not logged in or
 * no role assigned. Admin role is always treated as having every permission.
 */
export async function loadPermissions(): Promise<Set<string>> {
  const session = await getSession()
  if (!session) return new Set()

  // Re-fetch role from DB by userId — session.roleId may be stale (issued
  // before role was assigned). This costs one extra query per request, which
  // is fine because we cache the result per session.
  const cacheKey = session.userId
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const res = await pool.query(
    `SELECT p.key
     FROM app_user u
     JOIN role_permission rp ON rp.role_id = u.role_id
     JOIN permission p ON p.id = rp.permission_id
     WHERE u.id = $1 AND u.is_active = true`,
    [session.userId]
  )
  const keys = new Set<string>(res.rows.map(r => r.key))
  cache.set(cacheKey, keys)
  return keys
}

/** Check a single permission key against the current session. */
export async function hasPermission(key: string): Promise<boolean> {
  const keys = await loadPermissions()
  return keys.has(key)
}

/** Throw if the current session lacks the permission — for use inside server actions. */
export async function requirePermission(key: string): Promise<void> {
  if (!(await hasPermission(key))) {
    throw new Error(`غير مصرح: ${key}`)
  }
}

/**
 * Build a flat permission map for the current user — convenient to pass down
 * to the sidebar/page-headers as a server-component prop.
 */
export async function getPermissionMap(): Promise<Record<string, boolean>> {
  const keys = await loadPermissions()
  const map: Record<string, boolean> = {}
  for (const k of keys) map[k] = true
  return map
}
