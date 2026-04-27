'use client'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ShieldCheck, Plus, Trash2 } from 'lucide-react'
import { updateRolePermissions, createRole, deleteRole } from '@/lib/actions/roles'
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

const MODULE_LABELS: Record<string, string> = {
  workOrders: 'أوامر العمل',
  consumers: 'المستهلكون',
  users: 'المستخدمون',
  reports: 'التقارير',
  settings: 'الإعدادات',
  services: 'الخدمات',
  supervisors: 'المشرفون',
  offices: 'المكاتب',
  dashboard: 'لوحة التحكم',
  areas: 'المناطق',
  governorates: 'المحافظات',
}

export function RolesClient({ roles, permissions, rolePermissions }: Props) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null)
  const [checkedPerms, setCheckedPerms] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const handleCreate = async () => {
    if (!newName.trim()) { alert('اسم الدور مطلوب'); return }
    setLoading(true)
    try {
      await createRole(newName, newDesc)
      setAddOpen(false); setNewName(''); setNewDesc('')
      router.refresh()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'خطأ')
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدور؟')) return
    try {
      await deleteRole(id)
      router.refresh()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'خطأ')
    }
  }

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
      header: 'إجراء',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => openPermissionsModal(row.original)}
          >
            <ShieldCheck className="w-4 h-4" />
            تعديل الصلاحيات
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-500"
            onClick={() => handleDelete(row.original.id)}
            title="حذف الدور"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setAddOpen(true)} className="bg-[#cd7f32] hover:bg-[#b56b20] text-white gap-2">
          <Plus className="w-4 h-4" /> إضافة دور
        </Button>
      </div>
      <DataTable data={roles} columns={columns} noDataText="لا يوجد أدوار" />

      {/* Add role dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة دور جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>اسم الدور <span className="text-red-500">*</span></Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="مثال: مشرف، مراجع، فني" />
            </div>
            <div className="space-y-1">
              <Label>الوصف</Label>
              <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>إلغاء</Button>
              <Button onClick={handleCreate} disabled={loading} className="bg-[#cd7f32] hover:bg-[#b56b20] text-white">
                {loading ? '...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedRole} onOpenChange={open => { if (!open) setSelectedRole(null) }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
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
                    {MODULE_LABELS[moduleKey] ?? moduleKey}
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
