'use client'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ActiveBadge } from '@/components/shared/status-badge'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { createSupervisor, updateSupervisor, deleteSupervisor } from '@/lib/actions/supervisors'
import { useRouter } from 'next/navigation'

interface Row {
  id: string
  full_name: string
  employee_code: string
  phone: string | null
  email: string | null
  is_active: boolean
  office_id: string
  office_name: string
}
interface Office { id: string; name_ar: string }

export function SupervisorsClient({ rows, offices }: { rows: Row[]; offices: Office[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [fullName, setFullName] = useState('')
  const [employeeCode, setEmployeeCode] = useState('')
  const [officeId, setOfficeId] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  const openAdd = () => {
    setEditing(null)
    setFullName(''); setEmployeeCode(''); setOfficeId(''); setPhone(''); setEmail(''); setIsActive(true)
    setOpen(true)
  }

  const openEdit = (row: Row) => {
    setEditing(row)
    setFullName(row.full_name)
    setEmployeeCode(row.employee_code)
    setOfficeId(row.office_id)
    setPhone(row.phone ?? '')
    setEmail(row.email ?? '')
    setIsActive(row.is_active)
    setOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const data = { full_name: fullName, employee_code: employeeCode, office_id: officeId, phone, email, is_active: isActive }
      if (editing) await updateSupervisor(editing.id, data)
      else await createSupervisor(data)
      setOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await deleteSupervisor(id)
    router.refresh()
  }

  const columns: ColumnDef<Row, unknown>[] = [
    { header: '#', cell: ({ row }) => row.index + 1, size: 50 },
    { accessorKey: 'full_name', header: 'الاسم الكامل' },
    { accessorKey: 'employee_code', header: 'كود الموظف' },
    { accessorKey: 'office_name', header: 'المكتب' },
    { accessorKey: 'phone', header: 'الهاتف' },
    { accessorKey: 'email', header: 'البريد الإلكتروني' },
    {
      accessorKey: 'is_active',
      header: 'الحالة',
      cell: ({ row }) => <ActiveBadge isActive={row.original.is_active} />,
    },
    {
      id: 'actions',
      header: 'اجراء',
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
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd} className="bg-blue-700 hover:bg-blue-800 text-white gap-2">
          <Plus className="w-4 h-4" /> إضافة
        </Button>
      </div>
      <DataTable data={rows} columns={columns} noDataText="لا يوجد بيانات" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل' : 'إضافة'} مشرف</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>الاسم الكامل</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>كود الموظف</Label>
                <Input value={employeeCode} onChange={e => setEmployeeCode(e.target.value)} dir="ltr" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>المكتب</Label>
              <Select value={officeId} onValueChange={(v) => setOfficeId(v ?? '')}>
                <SelectTrigger><SelectValue placeholder="اختر المكتب" /></SelectTrigger>
                <SelectContent>
                  {offices.map(o => <SelectItem key={o.id} value={o.id}>{o.name_ar}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>الهاتف</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label>البريد الإلكتروني</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} id="sup_is_active" />
              <Label htmlFor="sup_is_active">مفعل</Label>
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
