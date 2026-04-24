'use client'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ActiveBadge } from '@/components/shared/status-badge'
import { Pencil, Trash2, Plus, Bell } from 'lucide-react'
import { createUser, updateUser, deleteUser, sendNotificationToAll } from '@/lib/actions/users'
import { useRouter } from 'next/navigation'

interface UserRow {
  id: string
  full_name: string
  email: string
  role_id: string | null
  office_id: string | null
  is_active: boolean
  created_at: string
  role_name: string | null
  office_name: string | null
}

interface Role { id: string; name: string }
interface Office { id: string; name_ar: string }

interface Props {
  users: UserRow[]
  roles: Role[]
  offices: Office[]
}

interface FormState {
  full_name: string
  email: string
  password: string
  role_id: string
  office_id: string
  is_active: boolean
}

const emptyForm: FormState = {
  full_name: '',
  email: '',
  password: '',
  role_id: '__none__',
  office_id: '__none_office__',
  is_active: true,
}

export function UsersClient({ users, roles, offices }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (row: UserRow) => {
    setEditing(row)
    setForm({
      full_name: row.full_name,
      email: row.email,
      password: '',
      role_id: row.role_id ?? '__none__',
      office_id: row.office_id ?? '__none_office__',
      is_active: row.is_active,
    })
    setOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const data = {
        full_name: form.full_name,
        email: form.email,
        password: form.password || undefined,
        role_id: form.role_id === '__none__' ? undefined : form.role_id || undefined,
        office_id: form.office_id === '__none_office__' ? undefined : form.office_id || undefined,
        is_active: form.is_active,
      }
      if (editing) {
        await updateUser(editing.id, data)
      } else {
        if (!form.password) {
          alert('كلمة المرور مطلوبة عند الإضافة')
          return
        }
        await createUser({ ...data, password: form.password })
      }
      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return
    await deleteUser(id)
    router.refresh()
  }

  const handleSendNotification = async () => {
    setNotifLoading(true)
    try {
      await sendNotificationToAll()
      alert('هذه الميزة قيد التطوير - لم يتم إرسال أي إشعارات')
    } finally {
      setNotifLoading(false)
    }
  }

  const columns: ColumnDef<UserRow, unknown>[] = [
    { header: '#', cell: ({ row }) => row.index + 1, size: 50 },
    { accessorKey: 'full_name', header: 'الاسم الكامل' },
    { accessorKey: 'email', header: 'البريد الإلكتروني' },
    {
      accessorKey: 'role_name',
      header: 'الدور',
      cell: ({ row }) => row.original.role_name ?? <span className="text-gray-400">—</span>,
    },
    {
      accessorKey: 'office_name',
      header: 'المكتب',
      cell: ({ row }) => row.original.office_name ?? <span className="text-gray-400">—</span>,
    },
    {
      accessorKey: 'is_active',
      header: 'الحالة',
      cell: ({ row }) => <ActiveBadge isActive={row.original.is_active} />,
    },
    {
      accessorKey: 'created_at',
      header: 'تاريخ الإنشاء',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('ar-KW'),
    },
    {
      id: 'actions',
      header: 'إجراء',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => openEdit(row.original)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          onClick={handleSendNotification}
          disabled={notifLoading}
          className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <Bell className="w-4 h-4" />
          {notifLoading ? '...' : 'إرسال إشعار للجميع'}
        </Button>
        <Button onClick={openAdd} className="bg-blue-700 hover:bg-blue-800 text-white gap-2">
          <Plus className="w-4 h-4" /> إضافة مستخدم
        </Button>
      </div>

      <DataTable data={users} columns={columns} noDataText="لا يوجد مستخدمون" />

      <Dialog open={open} onOpenChange={(o) => { if (!o) setForm(emptyForm); setOpen(o) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل مستخدم' : 'إضافة مستخدم'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>الاسم الكامل</Label>
              <Input
                value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                dir="ltr"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>{editing ? 'كلمة المرور (اتركها فارغة للإبقاء على الحالية)' : 'كلمة المرور'}</Label>
              <Input
                type="password"
                dir="ltr"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>الدور</Label>
                <Select value={form.role_id} onValueChange={v => setForm(p => ({ ...p, role_id: v ?? '__none__' }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">بدون دور</SelectItem>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>المكتب</Label>
                <Select value={form.office_id} onValueChange={v => setForm(p => ({ ...p, office_id: v ?? '__none_office__' }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر المكتب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none_office__">بدون مكتب</SelectItem>
                    {offices.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.name_ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="is_active"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
              />
              <Label htmlFor="is_active" className="cursor-pointer">مفعل</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                {loading ? '...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
