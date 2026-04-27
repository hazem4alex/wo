'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table'
import { ActiveBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pencil, Trash2, Plus, Search, MapPin, Star, StarOff, X, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createConsumer, updateConsumer, deleteConsumer } from '@/lib/actions/consumers'
import { useRouter } from 'next/navigation'

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

interface ConsumerRow {
  id: string; full_name: string; national_id: string; consumer_code: string;
  consumer_no: string; phone: string; is_active: boolean; area_id: string;
  office_id: string; area_name: string; governorate_id: string; governorate_name: string;
  office_name: string; street: string; house_no: string; apartment_no: string;
  electricity_meter_no: string; water_meter_no: string;
}

interface AddressRow {
  id: string; consumer_id: string;
  governorate_id: string | null; area_id: string | null; office_id: string | null;
  block_no: string | null; town: string | null; street: string | null; house_no: string | null;
  automated_figure: string | null; note: string | null; is_default: boolean;
  governorate_name: string | null; area_name: string | null; office_name: string | null;
}

interface Option { id: string; name_ar: string; governorate_id?: string; area_id?: string }

const emptyForm = () => ({
  full_name: '', national_id: '', consumer_code: '', consumer_no: '',
  phone: '', street: '', house_no: '', apartment_no: '',
  electricity_meter_no: '', water_meter_no: '',
  governorate_id: '', area_id: '', office_id: '', is_active: true,
})

const emptyAddrForm = () => ({
  governorate_id: '', area_id: '', office_id: '',
  block_no: '', town: '', street: '', house_no: '', automated_figure: '', note: '', is_default: false,
})

export function ConsumersClient({ rows, governorates, areas, offices }: {
  rows: ConsumerRow[]; governorates: Option[]; areas: Option[]; offices: Option[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'info' | 'addresses'>('info')
  const [editing, setEditing] = useState<ConsumerRow | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [loading, setLoading] = useState(false)

  // Addresses state
  const [addresses, setAddresses] = useState<AddressRow[]>([])
  const [addrLoading, setAddrLoading] = useState(false)
  const [showAddrForm, setShowAddrForm] = useState(false)
  const [addrForm, setAddrForm] = useState(emptyAddrForm())
  const [addrSaving, setAddrSaving] = useState(false)
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    rows.filter(r =>
      !search || r.full_name?.includes(search) || r.national_id?.includes(search) || r.consumer_code?.includes(search)
    ), [rows, search])

  const filteredAreas = areas.filter(a => a.governorate_id === form.governorate_id)
  const filteredOffices = offices.filter(o => o.area_id === form.area_id)
  const addrFilteredAreas = areas.filter(a => a.governorate_id === addrForm.governorate_id)
  const addrFilteredOffices = offices.filter(o => o.area_id === addrForm.area_id)

  const loadAddresses = useCallback(async (consumerId: string) => {
    setAddrLoading(true)
    try {
      const res = await fetch(`/api/consumers/${consumerId}/addresses`)
      setAddresses(await res.json())
    } catch { setAddresses([]) }
    finally { setAddrLoading(false) }
  }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm()); setTab('info'); setAddresses([]); setOpen(true) }
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
    setTab('info')
    setShowAddrForm(false)
    setAddresses([])
    setOpen(true)
    loadAddresses(row.id)
  }

  // When tab switches to addresses, also load them
  useEffect(() => {
    if (tab === 'addresses' && editing) loadAddresses(editing.id)
  }, [tab, editing, loadAddresses])

  const set = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }))
  const setAddr = (field: string, value: unknown) => setAddrForm(prev => ({ ...prev, [field]: value }))

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

  const handleSaveAddress = async () => {
    if (!editing) return
    setAddrSaving(true)
    try {
      const url = editingAddrId
        ? `/api/consumers/${editing.id}/addresses/${editingAddrId}`
        : `/api/consumers/${editing.id}/addresses`
      const method = editingAddrId ? 'PATCH' : 'POST'
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addrForm),
      })
      setAddrForm(emptyAddrForm())
      setEditingAddrId(null)
      setShowAddrForm(false)
      await loadAddresses(editing.id)
    } catch { alert('خطأ في حفظ العنوان') }
    finally { setAddrSaving(false) }
  }

  const startEditAddress = (addr: AddressRow) => {
    setAddrForm({
      governorate_id: addr.governorate_id ?? '',
      area_id: addr.area_id ?? '',
      office_id: addr.office_id ?? '',
      block_no: addr.block_no ?? '',
      town: addr.town ?? '',
      street: addr.street ?? '',
      house_no: addr.house_no ?? '',
      automated_figure: addr.automated_figure ?? '',
      note: addr.note ?? '',
      is_default: addr.is_default,
    })
    setEditingAddrId(addr.id)
    setShowAddrForm(true)
  }

  const cancelAddrForm = () => {
    setShowAddrForm(false)
    setEditingAddrId(null)
    setAddrForm(emptyAddrForm())
  }

  const handleDeleteAddress = async (addrId: string) => {
    if (!editing || !confirm('حذف هذا العنوان؟')) return
    await fetch(`/api/consumers/${editing.id}/addresses/${addrId}`, { method: 'DELETE' })
    await loadAddresses(editing.id)
  }

  const handleSetDefault = async (addrId: string) => {
    if (!editing) return
    await fetch(`/api/consumers/${editing.id}/addresses/${addrId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ set_default: true }),
    })
    await loadAddresses(editing.id)
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

  const addrSummary = (a: AddressRow) => [
    a.governorate_name, a.area_name, a.block_no && `ق${a.block_no}`,
    a.town && `ش${a.town}`, a.street, a.house_no && `م${a.house_no}`
  ].filter(Boolean).join(' - ')

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
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editing ? `تعديل: ${editing.full_name}` : 'إضافة مستهلك'}</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border pb-0 -mb-px">
            {(['info', 'addresses'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  tab === t
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
                disabled={t === 'addresses' && !editing}
              >
                {t === 'info' ? 'البيانات الأساسية' : `العناوين${addresses.length ? ` (${addresses.length})` : ''}`}
              </button>
            ))}
            {!editing && <span className="text-xs text-muted-foreground self-center mr-2">احفظ أولاً لإدارة العناوين</span>}
          </div>

          <div className="overflow-y-auto flex-1">
            {/* ── INFO TAB ── */}
            {tab === 'info' && (
              <div className="space-y-4 py-2">
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
                <div className="space-y-1">
                  <Label>رقم الهاتف</Label>
                  <Input value={form.phone} onChange={e => set('phone', e.target.value)} dir="ltr" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>المحافظة</Label>
                    <NativeSelect value={form.governorate_id}
                      onChange={v => setForm(p => ({ ...p, governorate_id: v, area_id: '', office_id: '' }))}
                      options={governorates.map(g => ({ value: g.id, label: g.name_ar }))}
                      placeholder="اختر المحافظة" />
                  </div>
                  <div className="space-y-1">
                    <Label>المنطقة</Label>
                    <NativeSelect value={form.area_id}
                      onChange={v => setForm(p => ({ ...p, area_id: v, office_id: '' }))}
                      options={filteredAreas.map(a => ({ value: a.id, label: a.name_ar }))}
                      placeholder="اختر المنطقة" disabled={!form.governorate_id} />
                  </div>
                  <div className="space-y-1">
                    <Label>المكتب</Label>
                    <NativeSelect value={form.office_id}
                      onChange={v => set('office_id', v)}
                      options={filteredOffices.map(o => ({ value: o.id, label: o.name_ar }))}
                      placeholder="اختر المكتب" disabled={!form.area_id} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1"><Label>الشارع</Label><Input value={form.street} onChange={e => set('street', e.target.value)} /></div>
                  <div className="space-y-1"><Label>رقم المنزل</Label><Input value={form.house_no} onChange={e => set('house_no', e.target.value)} dir="ltr" /></div>
                  <div className="space-y-1"><Label>رقم الشقة</Label><Input value={form.apartment_no} onChange={e => set('apartment_no', e.target.value)} dir="ltr" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>رقم عداد الكهرباء</Label><Input value={form.electricity_meter_no} onChange={e => set('electricity_meter_no', e.target.value)} dir="ltr" /></div>
                  <div className="space-y-1"><Label>رقم عداد الماء</Label><Input value={form.water_meter_no} onChange={e => set('water_meter_no', e.target.value)} dir="ltr" /></div>
                </div>
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
            )}

            {/* ── ADDRESSES TAB ── */}
            {tab === 'addresses' && editing && (
              <div className="py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{addresses.length} عنوان مسجل</span>
                  <Button size="sm"
                    onClick={() => { if (showAddrForm) { cancelAddrForm() } else { setEditingAddrId(null); setAddrForm(emptyAddrForm()); setShowAddrForm(true) } }}
                    className="gap-1.5 bg-[#cd7f32] hover:bg-[#b56b20] text-white text-xs">
                    <Plus className="w-3.5 h-3.5" /> إضافة عنوان
                  </Button>
                </div>

                {/* Add/Edit address form */}
                {showAddrForm && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {editingAddrId ? 'تعديل العنوان' : 'عنوان جديد'}
                      </span>
                      <button onClick={cancelAddrForm} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">المحافظة</Label>
                        <NativeSelect value={addrForm.governorate_id}
                          onChange={v => setAddrForm(p => ({ ...p, governorate_id: v, area_id: '', office_id: '' }))}
                          options={governorates.map(g => ({ value: g.id, label: g.name_ar }))}
                          placeholder="اختر" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">المنطقة</Label>
                        <NativeSelect value={addrForm.area_id}
                          onChange={v => setAddrForm(p => ({ ...p, area_id: v, office_id: '' }))}
                          options={addrFilteredAreas.map(a => ({ value: a.id, label: a.name_ar }))}
                          placeholder="اختر" disabled={!addrForm.governorate_id} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">المكتب</Label>
                        <NativeSelect value={addrForm.office_id}
                          onChange={v => setAddr('office_id', v)}
                          options={addrFilteredOffices.map(o => ({ value: o.id, label: o.name_ar }))}
                          placeholder="اختر" disabled={!addrForm.area_id} />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">القطعة</Label>
                        <Input value={addrForm.block_no} onChange={e => setAddr('block_no', e.target.value)} dir="ltr" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">الشارع رقم</Label>
                        <Input value={addrForm.town} onChange={e => setAddr('town', e.target.value)} dir="ltr" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">الشارع / الجادة</Label>
                        <Input value={addrForm.street} onChange={e => setAddr('street', e.target.value)} className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">رقم المنزل</Label>
                        <Input value={addrForm.house_no} onChange={e => setAddr('house_no', e.target.value)} dir="ltr" className="h-8 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">الرقم الآلي للعنوان</Label>
                        <Input value={addrForm.automated_figure} onChange={e => setAddr('automated_figure', e.target.value)} dir="ltr" className="h-8 text-sm font-mono" placeholder="automated figure" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">ملاحظات</Label>
                        <Input value={addrForm.note} onChange={e => setAddr('note', e.target.value)} className="h-8 text-sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="addr-default" checked={addrForm.is_default}
                        onChange={e => setAddr('is_default', e.target.checked)} className="h-4 w-4" />
                      <label htmlFor="addr-default" className="text-sm">تعيين كعنوان افتراضي</label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={cancelAddrForm}>إلغاء</Button>
                      <Button size="sm" onClick={handleSaveAddress} disabled={addrSaving}
                        className="bg-[#cd7f32] hover:bg-[#b56b20] text-white">
                        {addrSaving ? '...' : (editingAddrId ? 'حفظ التعديلات' : 'إضافة')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Address list */}
                {addrLoading ? (
                  <p className="text-center text-sm text-muted-foreground py-4">جاري التحميل...</p>
                ) : addresses.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">لا توجد عناوين مسجلة</p>
                ) : (
                  <div className="space-y-2">
                    {addresses.map(addr => (
                      <div key={addr.id} className={cn(
                        'flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors',
                        addr.is_default ? 'border-[#cd7f32]/50 bg-[#cd7f32]/5' : 'border-border bg-card'
                      )}>
                        <MapPin className={cn('w-4 h-4 mt-0.5 shrink-0', addr.is_default ? 'text-[#cd7f32]' : 'text-muted-foreground')} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground">{addrSummary(addr)}</div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {addr.automated_figure && (
                              <span className="text-xs text-muted-foreground font-mono">
                                الرقم الآلي: {addr.automated_figure}
                              </span>
                            )}
                            {addr.note && <span className="text-xs text-muted-foreground">{addr.note}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!addr.is_default && (
                            <button onClick={() => handleSetDefault(addr.id)} title="تعيين كافتراضي"
                              className="p-1 text-muted-foreground hover:text-[#cd7f32] transition-colors">
                              <StarOff className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {addr.is_default && (
                            <span className="flex items-center gap-1 text-xs text-[#cd7f32] font-medium px-1">
                              <Star className="w-3 h-3 fill-current" /> افتراضي
                            </span>
                          )}
                          <button onClick={() => startEditAddress(addr)} title="تعديل"
                            className="p-1 text-muted-foreground hover:text-blue-600 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteAddress(addr.id)} title="حذف"
                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
