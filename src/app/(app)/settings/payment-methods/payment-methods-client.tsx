'use client'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '@/lib/actions/payment-methods'
import { useRouter } from 'next/navigation'

interface Row { id: string; code: string; name_ar: string; name_en: string }

export function PaymentMethodsClient({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const openAdd = () => { setEditing(null); setNameAr(''); setNameEn(''); setCode(''); setOpen(true) }
  const openEdit = (row: Row) => { setEditing(row); setNameAr(row.name_ar); setNameEn(row.name_en); setCode(row.code); setOpen(true) }

  const handleSave = async () => {
    setLoading(true)
    try {
      const data = { name_ar: nameAr, name_en: nameEn, code }
      if (editing) await updatePaymentMethod(editing.id, data)
      else await createPaymentMethod(data)
      setOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await deletePaymentMethod(id)
    router.refresh()
  }

  const columns: ColumnDef<Row, unknown>[] = [
    { header: '#', cell: ({ row }) => row.index + 1, size: 50 },
    { accessorKey: 'code', header: 'الكود' },
    { accessorKey: 'name_ar', header: 'الاسم (عربي)' },
    { accessorKey: 'name_en', header: 'الاسم (انجليزي)' },
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل' : 'إضافة'} طريقة دفع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>الكود</Label>
              <Input value={code} onChange={e => setCode(e.target.value)} dir="ltr" />
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
