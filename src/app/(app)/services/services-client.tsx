'use client'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ActiveBadge } from '@/components/shared/status-badge'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { createService, updateService, deleteService } from '@/lib/actions/services'
import { useRouter } from 'next/navigation'

interface Row {
  id: string
  code: string
  name_ar: string
  name_en: string
  unit_price: number
  require_electricity_meter: boolean
  require_water_meter: boolean
  is_active: boolean
  created_at: string
}

export function ServicesClient({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [code, setCode] = useState('')
  const [unitPrice, setUnitPrice] = useState('0')
  const [requireElec, setRequireElec] = useState(false)
  const [requireWater, setRequireWater] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  const openAdd = () => {
    setEditing(null)
    setNameAr(''); setNameEn(''); setCode(''); setUnitPrice('0')
    setRequireElec(false); setRequireWater(false); setIsActive(true)
    setOpen(true)
  }

  const openEdit = (row: Row) => {
    setEditing(row)
    setNameAr(row.name_ar); setNameEn(row.name_en); setCode(row.code)
    setUnitPrice(String(row.unit_price))
    setRequireElec(row.require_electricity_meter)
    setRequireWater(row.require_water_meter)
    setIsActive(row.is_active)
    setOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const data = {
        name_ar: nameAr, name_en: nameEn, code,
        unit_price: parseFloat(unitPrice),
        require_electricity_meter: requireElec,
        require_water_meter: requireWater,
        is_active: isActive,
      }
      if (editing) await updateService(editing.id, data)
      else await createService(data)
      setOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await deleteService(id)
    router.refresh()
  }

  const columns: ColumnDef<Row, unknown>[] = [
    { header: '#', cell: ({ row }) => row.index + 1, size: 50 },
    { accessorKey: 'code', header: 'الكود' },
    { accessorKey: 'name_ar', header: 'اسم الخدمة' },
    {
      accessorKey: 'unit_price',
      header: 'سعر الوحدة',
      cell: ({ row }) => `${Number(row.original.unit_price).toFixed(3)} د.ك`,
    },
    {
      accessorKey: 'require_electricity_meter',
      header: 'عداد كهرباء',
      cell: ({ row }) => row.original.require_electricity_meter
        ? <Check className="w-4 h-4 text-green-600" />
        : <X className="w-4 h-4 text-muted-foreground" />,
    },
    {
      accessorKey: 'require_water_meter',
      header: 'عداد ماء',
      cell: ({ row }) => row.original.require_water_meter
        ? <Check className="w-4 h-4 text-green-600" />
        : <X className="w-4 h-4 text-muted-foreground" />,
    },
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
          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => openEdit(row.original)}>
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
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> إضافة
        </Button>
      </div>
      <DataTable data={rows} columns={columns} noDataText="لا يوجد بيانات" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل' : 'إضافة'} خدمة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>الكود</Label>
                <Input value={code} onChange={e => setCode(e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label>سعر الوحدة (د.ك)</Label>
                <Input type="number" min="0" step="0.001" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} dir="ltr" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="req_elec" checked={requireElec} onChange={e => setRequireElec(e.target.checked)} className="w-4 h-4" />
                <Label htmlFor="req_elec">يتطلب عداد كهرباء</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="req_water" checked={requireWater} onChange={e => setRequireWater(e.target.checked)} className="w-4 h-4" />
                <Label htmlFor="req_water">يتطلب عداد ماء</Label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} id="svc_is_active" />
              <Label htmlFor="svc_is_active">مفعل</Label>
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
