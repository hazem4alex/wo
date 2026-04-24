'use client'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { createArea, updateArea, deleteArea } from '@/lib/actions/areas'
import { useRouter } from 'next/navigation'

interface Row { id: string; name_ar: string; name_en: string; governorate_id: string; governorate_name: string }
interface Governorate { id: string; name_ar: string }

export function AreasClient({ rows, governorates }: { rows: Row[]; governorates: Governorate[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [governorateId, setGovernorateId] = useState('')
  const [loading, setLoading] = useState(false)

  const openAdd = () => { setEditing(null); setNameAr(''); setNameEn(''); setGovernorateId(''); setOpen(true) }
  const openEdit = (row: Row) => {
    setEditing(row)
    setNameAr(row.name_ar)
    setNameEn(row.name_en)
    setGovernorateId(row.governorate_id)
    setOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (editing) await updateArea(editing.id, { name_ar: nameAr, name_en: nameEn, governorate_id: governorateId })
      else await createArea({ name_ar: nameAr, name_en: nameEn, governorate_id: governorateId })
      setOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await deleteArea(id)
    router.refresh()
  }

  const columns: ColumnDef<Row, unknown>[] = [
    { header: '#', cell: ({ row }) => row.index + 1, size: 50 },
    { accessorKey: 'name_ar', header: 'اسم المنطقة (عربي)' },
    { accessorKey: 'name_en', header: 'اسم المنطقة (انجليزي)' },
    { accessorKey: 'governorate_name', header: 'المحافظة' },
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل' : 'إضافة'} منطقة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>المحافظة</Label>
              <Select value={governorateId} onValueChange={(v) => setGovernorateId(v ?? '')}>
                <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                <SelectContent>
                  {governorates.map(g => <SelectItem key={g.id} value={g.id}>{g.name_ar}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>الاسم (عربي)</Label>
                <Input value={nameAr} onChange={e => setNameAr(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>الاسم (انجليزي)</Label>
                <Input value={nameEn} onChange={e => setNameEn(e.target.value)} dir="ltr" />
              </div>
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
