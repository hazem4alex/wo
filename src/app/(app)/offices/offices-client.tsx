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
import { Pencil, Trash2, Plus } from 'lucide-react'
import { createOffice, updateOffice, deleteOffice } from '@/lib/actions/offices'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Row { id: string; code: string; name_ar: string; name_en: string; is_active: boolean; area_id: string; area_name: string; governorate_name: string; created_at: string }
interface Area { id: string; name_ar: string; governorate_id: string }
interface Governorate { id: string; name_ar: string }

function NativeSelect({ value, onChange, options, placeholder, disabled }: {
  value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string; disabled?: boolean
}) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className={cn(
        'w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors',
        'focus:border-ring focus:ring-2 focus:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        !value && 'text-muted-foreground'
      )}
    >
      <option value="">{placeholder ?? 'اختر'}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function OfficesClient({ rows, areas, governorates }: { rows: Row[]; areas: Area[]; governorates: Governorate[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [code, setCode] = useState('')
  const [governorateId, setGovernorateId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [address, setAddress] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  const filteredAreas = areas.filter(a => a.governorate_id === governorateId)

  const reset = () => { setNameAr(''); setNameEn(''); setCode(''); setGovernorateId(''); setAreaId(''); setAddress(''); setIsActive(true) }

  const openAdd = () => { setEditing(null); reset(); setOpen(true) }

  const openEdit = (row: Row) => {
    setEditing(row)
    setNameAr(row.name_ar); setNameEn(row.name_en); setCode(row.code)
    const area = areas.find(a => a.id === row.area_id)
    setGovernorateId(area?.governorate_id ?? '')
    setAreaId(row.area_id); setAddress(''); setIsActive(row.is_active)
    setOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const data = { name_ar: nameAr, name_en: nameEn, code, area_id: areaId, address, is_active: isActive }
      if (editing) await updateOffice(editing.id, data)
      else await createOffice(data)
      setOpen(false); router.refresh()
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await deleteOffice(id); router.refresh()
  }

  const columns: ColumnDef<Row, unknown>[] = [
    { header: '#', cell: ({ row }) => row.index + 1, size: 50 },
    { accessorKey: 'code', header: 'الكود' },
    { accessorKey: 'name_ar', header: 'اسم المكتب' },
    { accessorKey: 'governorate_name', header: 'المحافظة' },
    { accessorKey: 'area_name', header: 'المنطقة' },
    { accessorKey: 'is_active', header: 'الحالة', cell: ({ row }) => <ActiveBadge isActive={row.original.is_active} /> },
    { accessorKey: 'created_at', header: 'تاريخ الإنشاء' },
    {
      id: 'actions', header: 'اجراء',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => openEdit(row.original)}><Pencil className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(row.original.id)}><Trash2 className="w-4 h-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4" /> إضافة
        </Button>
      </div>
      <DataTable data={rows} columns={columns} noDataText="لا يوجد بيانات" />

      <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); setOpen(o) }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل' : 'إضافة'} مكتب</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>الاسم (عربي) <span className="text-red-500">*</span></Label>
                <Input value={nameAr} onChange={e => setNameAr(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>الاسم (انجليزي)</Label>
                <Input value={nameEn} onChange={e => setNameEn(e.target.value)} dir="ltr" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>الكود</Label>
              <Input value={code} onChange={e => setCode(e.target.value)} dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>المحافظة <span className="text-red-500">*</span></Label>
                <NativeSelect
                  value={governorateId}
                  onChange={v => { setGovernorateId(v); setAreaId('') }}
                  options={governorates.map(g => ({ value: g.id, label: g.name_ar }))}
                  placeholder="اختر المحافظة"
                />
              </div>
              <div className="space-y-1.5">
                <Label>المنطقة <span className="text-red-500">*</span></Label>
                <NativeSelect
                  value={areaId}
                  onChange={setAreaId}
                  options={filteredAreas.map(a => ({ value: a.id, label: a.name_ar }))}
                  placeholder="اختر المنطقة"
                  disabled={!governorateId}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>العنوان</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} id="office_is_active" />
              <Label htmlFor="office_is_active">مفعل</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? '...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
