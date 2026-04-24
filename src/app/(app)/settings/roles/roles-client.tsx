'use client'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ShieldCheck } from 'lucide-react'
import { updateRolePermissions } from '@/lib/actions/roles'
import { useRouter } from 'next/navigation'

interface RoleRow {
  id: string
  name: string
  description: string | null
  permission_count: number
}

interface Permission {
  id: string
  name: string
  module_key: string
  description: string | null
}

interface RolePermission {
  role_id: string
  permission_id: string
}

interface Props {
  roles: RoleRow[]
  permissions: Permission[]
  rolePermissions: RolePermission[]
}

export function RolesClient({ roles, permissions, rolePermissions }: Props) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null)
  const [checkedPerms, setCheckedPerms] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const openPermissionsModal = (role: RoleRow) => {
    setSelectedRole(role)
    const existing = new Set(
      rolePermissions.filter(rp => rp.role_id === role.id).map(rp => rp.permission_id)
    )
    setCheckedPerms(existing)
  }

  const togglePerm = (id: string) => {
    setCheckedPerms(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    if (!selectedRole) return
    setLoading(true)
    try {
      await updateRolePermissions(selectedRole.id, Array.from(checkedPerms))
      setSelectedRole(null)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  // Group permissions by module_key
  const groupedPerms: Record<string, Permission[]> = {}
  for (const p of permissions) {
    if (!groupedPerms[p.module_key]) groupedPerms[p.module_key] = []
    groupedPerms[p.module_key].push(p)
  }

  const columns: ColumnDef<RoleRow, unknown>[] = [
    { header: '#', cell: ({ row }) => row.index + 1, size: 50 },
    { accessorKey: 'name', header: 'اسم الدور' },
    {
      accessorKey: 'description',
      header: 'الوصف',
      cell: ({ row }) => row.original.description ?? <span className="text-gray-400">—</span>,
    },
    {
      accessorKey: 'permission_count',
      header: 'عدد الصلاحيات',
      cell: ({ row }) => (
        <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium">
          {row.original.permission_count}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'اجراء',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => openPermissionsModal(row.original)}
        >
          <ShieldCheck className="w-4 h-4" />
          تعديل الصلاحيات
        </Button>
      ),
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <DataTable data={roles} columns={columns} noDataText="لا يوجد أدوار" />

      <Dialog open={!!selectedRole} onOpenChange={open => { if (!open) setSelectedRole(null) }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>صلاحيات دور: {selectedRole?.name}</DialogTitle>
          </DialogHeader>

          {permissions.length === 0 ? (
            <p className="text-center text-gray-400 py-8">لا توجد صلاحيات محددة في النظام</p>
          ) : (
            <div className="space-y-6 py-2">
              {Object.entries(groupedPerms).map(([moduleKey, perms]) => (
                <div key={moduleKey}>
                  <h4 className="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-md mb-3 uppercase tracking-wide">
                    {moduleKey}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {perms.map(p => (
                      <label key={p.id} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                          checked={checkedPerms.has(p.id)}
                          onChange={() => togglePerm(p.id)}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{p.name}</p>
                          {p.description && (
                            <p className="text-xs text-gray-500">{p.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setSelectedRole(null)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              {loading ? '...' : 'حفظ الصلاحيات'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
