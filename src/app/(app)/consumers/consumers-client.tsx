'use client'

import { useState, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table'
import { ActiveBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

function NativeSelect({ value, onChange, options, placeholder, disabled }: {
  value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string; disabled?: boolean
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors',
        'focus:border-ring focus:ring-3 focus:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        !value && 'text-muted-foreground'
      )}
    >
      <option value="">{placeholder ?? 'اختر'}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
import { createConsumer, updateConsumer, deleteConsumer } from '@/lib/actions/consumers'
import { useRouter } from 'next/navigation'

interface ConsumerRow {
  id: string; full_name: string; national_id: string; consumer_code: string;
  consumer_no: string; phone: string; is_active: boolean; area_id: string;
  office_id: string; area_name: string; governorate_id: string; governorate_name: string;
  office_name: string; street: string; house_no: string; apartment_no: string;
  electricity_meter_no: string; water_meter_no: string;
}

interface Option { id: string; name_ar: string; governorate_id?: string; area_id?: string }

const emptyForm = () => ({
  full_name: '', national_id: '', consumer_code: '', consumer_no: '',
  phone: '', street: '', house_no: '', apartment_no: '',
  electricity_meter_no: '', water_meter_no: '',
  governorate_id: '', area_id: '', office_id: '', is_active: true,
})

export function ConsumersClient({ rows, governorates, areas, offices }: {
  rows: ConsumerRow[]; governorates: Option[]; areas: Option[]; offices: Option[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ConsumerRow | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() =>
    rows.filter(r =>
      !search || r.full_name?.includes(search) || r.national_id?.includes(search) || r.consumer_code?.includes(search)
    ), [rows, search])

  const filteredAreas = areas.filter(a => a.governorate_id === form.governorate_id)
  const filteredOffices = offices.filter(o => o.area_id === form.area_id)

  const openAdd = () => { setEditing(null); setForm(emptyForm()); setOpen(true) }
  const openEdit = (row: ConsumerRow) => {
    setEditing(row)
    setForm({
      full_name: row.full_name || '', national_id: row.national_id || '',
      consumer_code: row.consumer_code || '', consumer_no: row.consumer_no || '',
      phone: row.phone || '', street: row.street || '',
      house_no: row.house_no || '', apartment_no: row.apartment_no || '',
      electricity_meter_no: row.electricity_meter_no || '',
      water_meter_no: row.water_meter_no || '',
      governorate_id: row.governorate_id || '', area_id: row.area_id || '',
      office_id: row.office_id || '', is_active: row.is_active,
    })
    setOpen(true)
  }

  const set = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = { ...form }
      if (editing) await updateConsumer(editing.id, payload)
      else await createConsumer(payload)
      setOpen(false)
      router.refresh()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'خطأ في الحفظ')
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await deleteConsumer(id)
    router.refresh()
  }

  const columns: ColumnDef<ConsumerRow, unknown>[] = [
    { header: '#', cell: ({ row }) => row.index + 1, size: 50 },
    { accessorKey: 'full_name', header: 'الاسم' },
    { accessorKey: 'national_id', header: 'الرقم المدني' },
    { accessorKey: 'consumer_code', header: 'كود المستهلك' },
    { accessorKey: 'phone', header: 'الهاتف' },
    { accessorKey: 'area_name', header: 'المنطقة' },
    { accessorKey: 'office_name', header: 'المكتب' },
    { id: 'status', header: 'الحالة', cell: ({ row }) => <ActiveBadge isActive={row.original.is_active} /> },
    {
      id: 'actions', header: 'اجراء',
      cell: ({ row }) => (
        <div className="flex gap-2">
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
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="ps-9" />
        </div>
        <Button onClick={openAdd} className="bg-blue-700 hover:bg-blue-800 text-white gap-2">
          <Plus className="w-4 h-4" /> إضافة
        </Button>
      </div>

      <DataTable data={filtered} columns={columns} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل مستهلك' : 'إضافة مستهلك'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Name + national ID */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>الاسم الكامل <span className="text-red-500">*</span></Label>
                <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>الرقم المدني (12 رقم)</Label>
                <Input value={form.national_id} onChange={e => set('national_id', e.target.value)} maxLength={12} dir="ltr" />
              </div>
            </div>

            {/* Codes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>كود المستهلك</Label>
                <Input value={form.consumer_code} onChange={e => set('consumer_code', e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label>رقم المستهلك</Label>
                <Input value={form.consumer_no} onChange={e => set('consumer_no', e.target.value)} dir="ltr" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label>رقم الهاتف</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} dir="ltr" />
            </div>

            {/* Cascading selects */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>المحافظة</Label>
                <NativeSelect
                  value={form.governorate_id}
                  onChange={v => setForm(p => ({ ...p, governorate_id: v, area_id: '', office_id: '' }))}
                  options={governorates.map(g => ({ value: g.id, label: g.name_ar }))}
                  placeholder="اختر المحافظة"
                />
              </div>
              <div className="space-y-1">
                <Label>المنطقة</Label>
                <NativeSelect
                  value={form.area_id}
                  onChange={v => setForm(p => ({ ...p, area_id: v, office_id: '' }))}
                  options={filteredAreas.map(a => ({ value: a.id, label: a.name_ar }))}
                  placeholder="اختر المنطقة"
                  disabled={!form.governorate_id}
                />
              </div>
              <div className="space-y-1">
                <Label>المكتب</Label>
                <NativeSelect
                  value={form.office_id}
                  onChange={v => set('office_id', v)}
                  options={filteredOffices.map(o => ({ value: o.id, label: o.name_ar }))}
                  placeholder="اختر المكتب"
                  disabled={!form.area_id}
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>الشارع</Label>
                <Input value={form.street} onChange={e => set('street', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>رقم المنزل</Label>
                <Input value={form.house_no} onChange={e => set('house_no', e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label>رقم الشقة</Label>
                <Input value={form.apartment_no} onChange={e => set('apartment_no', e.target.value)} dir="ltr" />
              </div>
            </div>

            {/* Meters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>رقم عداد الكهرباء</Label>
                <Input value={form.electricity_meter_no} onChange={e => set('electricity_meter_no', e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label>رقم عداد الماء</Label>
                <Input value={form.water_meter_no} onChange={e => set('water_meter_no', e.target.value)} dir="ltr" />
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => set('is_active', v)} />
              <Label>{form.is_active ? 'مفعل' : 'معطل'}</Label>
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
