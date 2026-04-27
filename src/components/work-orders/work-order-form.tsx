'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Search, X } from 'lucide-react'
import { createWorkOrder, updateWorkOrder } from '@/lib/actions/work-orders'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ServiceOption {
  id: string; code: string; name_ar: string; name_en: string;
  unit_price: string; require_electricity_meter: boolean; require_water_meter: boolean;
}
interface BillingItem {
  id: string; service_name_ar: string; service_name_en: string; service_code: string;
  quantity: number; unit_price: number; discount_amount: number; fine_amount: number; total_amount: number;
}
interface Consumer {
  id: string; full_name: string; consumer_code: string; consumer_no?: string;
  national_id?: string; phone?: string; street?: string; house_no?: string; apartment_no?: string;
  governorate_id?: string; area_id?: string; office_id?: string;
}

interface ConsumerAddress {
  id: string; consumer_id: string;
  governorate_id: string | null; area_id: string | null; office_id: string | null;
  block_no: string | null; town: string | null; street: string | null; house_no: string | null;
  automated_figure: string | null; note: string | null; is_default: boolean;
  governorate_name: string | null; area_name: string | null; office_name: string | null;
}

function calcTotal(item: BillingItem): number {
  return Math.max(0, item.quantity * item.unit_price - item.discount_amount + item.fine_amount)
}

// Convert Arabic-Indic digits ٠١٢٣٤٥٦٧٨٩ → 0123456789
function normalizeNums(s: string): string {
  return s.replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

// Styled native select
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
        'w-full h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors',
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

// Server-side consumer search combobox
function ConsumerSearch({ value, onChange, initialConsumer }: {
  value: string
  onChange: (id: string, c: Consumer | null) => void
  initialConsumer?: Consumer | null
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Consumer[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Consumer | null>(initialConsumer ?? null)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/consumers/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setResults(data)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
  }, [])

  const handleInput = (q: string) => { setQuery(q); setOpen(true); search(q) }

  const select = (c: Consumer) => {
    setSelected(c); onChange(c.id, c); setQuery(''); setOpen(false); setResults([])
  }

  const clear = () => {
    setSelected(null); onChange('', null); setQuery(''); setResults([])
  }

  return (
    <div ref={ref} className="relative">
      <div className={cn(
        'flex items-center gap-1.5 h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors',
        open && 'border-ring ring-2 ring-ring/50'
      )}>
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        {selected && !open ? (
          <span className="flex-1 truncate text-foreground">
            {selected.full_name}{selected.consumer_code ? ` — ${selected.consumer_code}` : ''}
          </span>
        ) : (
          <input
            ref={inputRef}
            value={query}
            onChange={e => handleInput(e.target.value)}
            onFocus={() => { setOpen(true); if (!query && !results.length) search('') }}
            placeholder={selected
              ? `${selected.full_name}${selected.consumer_code ? ` — ${selected.consumer_code}` : ''}`
              : 'ابحث بالاسم / الرقم المدني / الهاتف / الكود...'}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            dir="rtl"
          />
        )}
        {loading && <span className="text-xs text-muted-foreground animate-pulse">...</span>}
        {selected && !loading && (
          <button type="button" onClick={clear} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-border bg-card shadow-lg max-h-64 overflow-y-auto">
          {!query.trim() ? (
            <div className="p-3 text-sm text-muted-foreground text-center">اكتب للبحث...</div>
          ) : loading ? (
            <div className="p-3 text-sm text-muted-foreground text-center">جاري البحث...</div>
          ) : results.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">لا توجد نتائج</div>
          ) : results.map(c => (
            <button key={c.id} type="button" onClick={() => select(c)}
              className={cn('w-full text-start px-3 py-2 text-sm hover:bg-accent transition-colors', c.id === value && 'bg-accent font-medium')}
            >
              <div className="font-medium">{c.full_name}</div>
              <div className="text-xs text-muted-foreground">
                {[c.consumer_code, c.national_id, c.phone].filter(Boolean).join(' · ')}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Generic client-side searchable combobox (used for services)
function SearchCombobox<T extends { id: string }>({
  items, value, onChange, placeholder, renderItem, renderSelected, filterFn,
}: {
  items: T[]
  value: string
  onChange: (id: string, item: T | null) => void
  placeholder: string
  renderItem: (item: T) => React.ReactNode
  renderSelected: (item: T) => string
  filterFn: (item: T, query: string) => boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selected = items.find(i => i.id === value) ?? null

  const filtered = useMemo(() => {
    if (!search) return items.slice(0, 60)
    return items.filter(i => filterFn(i, search.toLowerCase())).slice(0, 60)
  }, [items, search, filterFn])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const select = (item: T) => { onChange(item.id, item); setSearch(''); setOpen(false) }
  const clear = () => { onChange('', null); setSearch(''); setOpen(false) }

  return (
    <div ref={ref} className="relative">
      <div className={cn(
        'flex items-center gap-1.5 h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors',
        open && 'border-ring ring-2 ring-ring/50'
      )}>
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        {selected && !open ? (
          <span className="flex-1 truncate text-foreground">{renderSelected(selected)}</span>
        ) : (
          <input
            ref={inputRef}
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={selected ? renderSelected(selected) : placeholder}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            dir="rtl"
          />
        )}
        {selected && (
          <button type="button" onClick={clear} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {!selected && (
          <button type="button" onClick={() => { setOpen(o => !o); inputRef.current?.focus() }} className="text-muted-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-border bg-card shadow-lg max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">لا توجد نتائج</div>
          ) : filtered.map(item => (
            <button
              key={item.id} type="button" onClick={() => select(item)}
              className={cn('w-full text-start px-3 py-2 text-sm hover:bg-accent transition-colors', item.id === value && 'bg-accent font-medium')}
            >
              {renderItem(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface InitialData {
  id: string
  work_order_no: string
  work_order_code: string | null
  consumer_id: string
  consumer: Consumer | null
  governorate_id: string | null
  area_id: string | null
  office_id: string | null
  supervisor_id: string | null
  payment_method_id: string | null
  notes: string | null
  order_date: string | Date | null
  street: string | null
  house_no: string | null
  apartment_no: string | null
  automated_figure: string | null
  electricity_meter_old_no: string | null
  electricity_meter_new_no: string | null
  electricity_old_reading: number | null
  electricity_new_reading: number | null
  water_meter_old_no: string | null
  water_meter_new_no: string | null
  water_old_reading: number | null
  water_new_reading: number | null
  items: BillingItem[]
}

export function WorkOrderForm({ governorates, areas, offices, supervisors, services, paymentMethods, initialData }: {
  governorates: Array<{ id: string; name_ar: string }>
  areas: Array<{ id: string; name_ar: string; governorate_id: string }>
  offices: Array<{ id: string; name_ar: string; area_id: string }>
  supervisors: Array<{ id: string; full_name: string; office_id: string }>
  services: ServiceOption[]
  paymentMethods: Array<{ id: string; name_ar: string }>
  initialData?: InitialData
}) {
  const init = initialData
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [consumerId, setConsumerId] = useState(init?.consumer_id ?? '')
  const [consumerAddresses, setConsumerAddresses] = useState<ConsumerAddress[]>([])
  const [selectedAddrId, setSelectedAddrId] = useState('')
  const [governorateId, setGovernorateId] = useState(init?.governorate_id ?? '')
  const [areaId, setAreaId] = useState(init?.area_id ?? '')
  const [officeId, setOfficeId] = useState(init?.office_id ?? '')
  const [supervisorId, setSupervisorId] = useState(init?.supervisor_id ?? '')
  const [paymentMethodId, setPaymentMethodId] = useState(init?.payment_method_id ?? '')
  const [notes, setNotes] = useState(init?.notes ?? '')
  const [orderDate, setOrderDate] = useState(() => {
    if (init?.order_date) {
      const d = init.order_date
      // pg returns DATE as a JS Date object; convert to YYYY-MM-DD string
      if (typeof d === 'string') return d.slice(0, 10)
      if (d instanceof Date) return d.toISOString().slice(0, 10)
    }
    return new Date().toISOString().slice(0, 10)
  })
  const [manualRef, setManualRef] = useState(
    init ? (init.work_order_code !== init.work_order_no ? (init.work_order_code ?? '') : '') : ''
  )
  const [street, setStreet] = useState(init?.street ?? '')
  const [houseNo, setHouseNo] = useState(init?.house_no ?? '')
  const [apartmentNo, setApartmentNo] = useState(init?.apartment_no ?? '')
  const [automatedFigure, setAutomatedFigure] = useState(init?.automated_figure ?? '')
  const [elecOldNo, setElecOldNo] = useState(init?.electricity_meter_old_no ?? '')
  const [elecNewNo, setElecNewNo] = useState(init?.electricity_meter_new_no ?? '')
  const [elecOldReading, setElecOldReading] = useState(init?.electricity_old_reading != null ? String(init.electricity_old_reading) : '')
  const [elecNewReading, setElecNewReading] = useState(init?.electricity_new_reading != null ? String(init.electricity_new_reading) : '')
  const [waterOldNo, setWaterOldNo] = useState(init?.water_meter_old_no ?? '')
  const [waterNewNo, setWaterNewNo] = useState(init?.water_meter_new_no ?? '')
  const [waterOldReading, setWaterOldReading] = useState(init?.water_old_reading != null ? String(init.water_old_reading) : '')
  const [waterNewReading, setWaterNewReading] = useState(init?.water_new_reading != null ? String(init.water_new_reading) : '')
  const [items, setItems] = useState<BillingItem[]>(init?.items ?? [])

  const filteredAreas = areas.filter(a => a.governorate_id === governorateId)
  const filteredOffices = offices.filter(o => o.area_id === areaId)
  const filteredSupervisors = supervisors.filter(s => !officeId || s.office_id === officeId)

  // Apply a ConsumerAddress to the location/address fields
  const applyAddress = useCallback((addr: ConsumerAddress | null) => {
    if (!addr) return
    setStreet(addr.street ?? '')
    setHouseNo(addr.house_no ?? '')
    setApartmentNo('')
    setAutomatedFigure(addr.automated_figure ?? '')
    if (addr.governorate_id) setGovernorateId(addr.governorate_id)
    if (addr.area_id) setAreaId(addr.area_id)
    if (addr.office_id) setOfficeId(addr.office_id)
    setSupervisorId('')
  }, [])

  // When consumer is selected, fetch their addresses and auto-fill
  const handleConsumerChange = useCallback(async (id: string, c: Consumer | null) => {
    setConsumerId(id)
    setConsumerAddresses([])
    setSelectedAddrId('')
    if (!id) {
      setStreet(''); setHouseNo(''); setApartmentNo('')
      return
    }
    // First fill from consumer record itself as a fallback
    setStreet(c?.street ?? '')
    setHouseNo(c?.house_no ?? '')
    setApartmentNo(c?.apartment_no ?? '')
    if (c?.governorate_id) { setGovernorateId(c.governorate_id); setAreaId(c.area_id ?? ''); setOfficeId(c.office_id ?? ''); setSupervisorId('') }

    // Then fetch proper addresses
    try {
      const res = await fetch(`/api/consumers/${id}/addresses`)
      const addrs: ConsumerAddress[] = await res.json()
      setConsumerAddresses(addrs)
      if (addrs.length === 1) {
        // Single address — auto-select silently
        setSelectedAddrId(addrs[0].id)
        applyAddress(addrs[0])
      } else if (addrs.length > 1) {
        // Multiple — select the default if one exists
        const def = addrs.find(a => a.is_default)
        if (def) { setSelectedAddrId(def.id); applyAddress(def) }
        // else leave picker visible for user to choose
      }
    } catch { /* keep consumer-level data */ }
  }, [applyAddress])

  const addItem = (svc: ServiceOption) => {
    setItems(prev => [...prev, {
      id: Math.random().toString(36),
      service_name_ar: svc.name_ar,
      service_name_en: svc.name_en,
      service_code: svc.code,
      quantity: 1,
      unit_price: Number(svc.unit_price),
      discount_amount: 0,
      fine_amount: 0,
      total_amount: Number(svc.unit_price),
    }])
  }

  const updateItem = (id: string, field: keyof BillingItem, value: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      updated.total_amount = calcTotal(updated)
      return updated
    }))
  }

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const netAmount = items.reduce((sum, i) => sum + i.total_amount, 0)

  const handleSubmit = async () => {
    if (!consumerId || items.length === 0) {
      alert('يرجى اختيار المستهلك وإضافة بند واحد على الأقل')
      return
    }
    setLoading(true)
    try {
      const payload = {
        consumer_id: consumerId,
        office_id: officeId || undefined,
        supervisor_id: supervisorId || undefined,
        payment_method_id: paymentMethodId || undefined,
        governorate_id: governorateId || undefined,
        area_id: areaId || undefined,
        manual_ref: manualRef || undefined,
        order_date: orderDate || undefined,
        automated_figure: automatedFigure || undefined,
        notes,
        street: street || undefined,
        house_no: houseNo || undefined,
        apartment_no: apartmentNo || undefined,
        electricity_meter_old_no: elecOldNo || undefined,
        electricity_meter_new_no: elecNewNo || undefined,
        electricity_old_reading: elecOldReading ? Number(elecOldReading) : 0,
        electricity_new_reading: elecNewReading ? Number(elecNewReading) : undefined,
        water_meter_old_no: waterOldNo || undefined,
        water_meter_new_no: waterNewNo || undefined,
        water_old_reading: waterOldReading ? Number(waterOldReading) : 0,
        water_new_reading: waterNewReading ? Number(waterNewReading) : undefined,
        items,
      }
      if (init?.id) {
        await updateWorkOrder(init.id, payload)
      } else {
        await createWorkOrder(payload)
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) return
      alert(e instanceof Error ? e.message : 'خطأ في الحفظ')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header info */}
      <Card>
        <CardHeader><CardTitle className="text-base">بيانات أمر العمل</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>رقم أمر العمل <span className="text-xs text-muted-foreground">(تلقائي)</span></Label>
              <Input value={init?.work_order_no ?? 'يتم توليده تلقائياً'} readOnly dir="ltr" className="bg-muted text-muted-foreground cursor-default text-xs" />
            </div>
            <div className="space-y-1">
              <Label>رقم المرجع / الكود</Label>
              <Input
                value={manualRef}
                onChange={e => setManualRef(e.target.value)}
                placeholder="اختياري — رقم يدوي"
                dir="ltr"
              />
            </div>
            <div className="space-y-1">
              <Label>تاريخ الأمر</Label>
              <Input
                type="date"
                value={orderDate}
                onChange={e => setOrderDate(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          {/* Consumer — server-side searchable dropdown */}
          <div className="space-y-1">
            <Label>المستهلك <span className="text-red-500">*</span></Label>
            <ConsumerSearch value={consumerId} onChange={handleConsumerChange} initialConsumer={init?.consumer ?? null} />
          </div>

          {/* Address picker — shown when consumer has multiple addresses */}
          {consumerAddresses.length > 1 && (
            <div className="space-y-1">
              <Label className="flex items-center gap-1.5">
                <span>اختر العنوان</span>
                <span className="text-xs text-muted-foreground">({consumerAddresses.length} عنوان متاح)</span>
              </Label>
              <div className="grid gap-1.5 max-h-40 overflow-y-auto">
                {consumerAddresses.map(addr => {
                  const label = [
                    addr.governorate_name, addr.area_name,
                    addr.block_no && `ق${addr.block_no}`,
                    addr.town && `ش${addr.town}`,
                    addr.street, addr.house_no && `م${addr.house_no}`,
                  ].filter(Boolean).join(' - ')
                  return (
                    <button key={addr.id} type="button"
                      onClick={() => { setSelectedAddrId(addr.id); applyAddress(addr) }}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-start transition-colors w-full',
                        selectedAddrId === addr.id
                          ? 'border-[#cd7f32] bg-[#cd7f32]/10 text-foreground'
                          : 'border-border bg-card hover:bg-muted/50'
                      )}
                    >
                      <span className={cn('w-2 h-2 rounded-full shrink-0',
                        selectedAddrId === addr.id ? 'bg-[#cd7f32]' : 'bg-muted-foreground/30')} />
                      <span className="flex-1 truncate">{label || 'عنوان بدون تفاصيل'}</span>
                      {addr.is_default && <span className="text-xs text-[#cd7f32] shrink-0">افتراضي</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Address */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1 col-span-2">
              <Label>الشارع</Label>
              <Input value={street} onChange={e => setStreet(e.target.value)} placeholder="اسم الشارع" />
            </div>
            <div className="space-y-1">
              <Label>رقم المنزل</Label>
              <Input value={houseNo} onChange={e => setHouseNo(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label>رقم الشقة</Label>
              <Input value={apartmentNo} onChange={e => setApartmentNo(e.target.value)} dir="ltr" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>الرقم الآلي للعنوان</Label>
            <Input value={automatedFigure} onChange={e => setAutomatedFigure(e.target.value)} dir="ltr" className="font-mono" placeholder="automated figure" />
          </div>

          {/* Location cascade */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>المحافظة</Label>
              <NativeSelect
                value={governorateId}
                onChange={v => { setGovernorateId(v); setAreaId(''); setOfficeId(''); setSupervisorId('') }}
                options={governorates.map(g => ({ value: g.id, label: g.name_ar }))}
                placeholder="اختر المحافظة"
              />
            </div>
            <div className="space-y-1">
              <Label>المنطقة</Label>
              <NativeSelect
                value={areaId}
                onChange={v => { setAreaId(v); setOfficeId(''); setSupervisorId('') }}
                options={filteredAreas.map(a => ({ value: a.id, label: a.name_ar }))}
                placeholder="اختر المنطقة"
                disabled={!governorateId}
              />
            </div>
            <div className="space-y-1">
              <Label>المكتب</Label>
              <NativeSelect
                value={officeId}
                onChange={v => { setOfficeId(v); setSupervisorId('') }}
                options={filteredOffices.map(o => ({ value: o.id, label: o.name_ar }))}
                placeholder="اختر المكتب"
                disabled={!areaId}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>المشرف</Label>
              <NativeSelect
                value={supervisorId}
                onChange={setSupervisorId}
                options={filteredSupervisors.map(s => ({ value: s.id, label: s.full_name }))}
                placeholder="اختر المشرف"
              />
            </div>
            <div className="space-y-1">
              <Label>طريقة الدفع</Label>
              <NativeSelect
                value={paymentMethodId}
                onChange={setPaymentMethodId}
                options={paymentMethods.map(p => ({ value: p.id, label: p.name_ar }))}
                placeholder="اختر طريقة الدفع"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>ملاحظات</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Meters — before invoice items */}
      <Card>
        <CardHeader><CardTitle className="text-base">العدادات</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-amber-500">⚡</span>
              <span className="text-sm font-medium">عداد الكهرباء</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1"><Label>الرقم القديم</Label><Input value={elecOldNo} onChange={e => setElecOldNo(e.target.value)} dir="ltr" placeholder="رقم العداد القديم" /></div>
              <div className="space-y-1"><Label>الرقم الجديد</Label><Input value={elecNewNo} onChange={e => setElecNewNo(e.target.value)} dir="ltr" placeholder="رقم العداد الجديد" /></div>
              <div className="space-y-1"><Label>القراءة القديمة</Label><Input type="number" step="0.001" value={elecOldReading} onChange={e => setElecOldReading(e.target.value)} dir="ltr" /></div>
              <div className="space-y-1"><Label>القراءة الجديدة</Label><Input type="number" step="0.001" value={elecNewReading} onChange={e => setElecNewReading(e.target.value)} dir="ltr" /></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-sky-500">💧</span>
              <span className="text-sm font-medium">عداد المياه</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1"><Label>الرقم القديم</Label><Input value={waterOldNo} onChange={e => setWaterOldNo(e.target.value)} dir="ltr" placeholder="رقم العداد القديم" /></div>
              <div className="space-y-1"><Label>الرقم الجديد</Label><Input value={waterNewNo} onChange={e => setWaterNewNo(e.target.value)} dir="ltr" placeholder="رقم العداد الجديد" /></div>
              <div className="space-y-1"><Label>القراءة القديمة</Label><Input type="number" step="0.001" value={waterOldReading} onChange={e => setWaterOldReading(e.target.value)} dir="ltr" /></div>
              <div className="space-y-1"><Label>القراءة الجديدة</Label><Input type="number" step="0.001" value={waterNewReading} onChange={e => setWaterNewReading(e.target.value)} dir="ltr" /></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice items */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-row-reverse justify-between">
            <CardTitle className="text-base">بنود الفاتورة</CardTitle>
            {/* Service searchable dropdown — wider, starts from right in RTL */}
            <div className="w-96">
              <SearchCombobox<ServiceOption>
                items={services}
                value=""
                onChange={(_, svc) => { if (svc) addItem(svc) }}
                placeholder="ابحث بالاسم أو الكود (أرقام عربية أو إنجليزية)..."
                renderSelected={s => s.name_ar}
                renderItem={s => (
                  <>
                    <div className="font-medium">{s.name_ar}</div>
                    <div className="text-xs text-muted-foreground">{[s.code, s.unit_price ? `${s.unit_price} د.ك` : ''].filter(Boolean).join(' · ')}</div>
                  </>
                )}
                filterFn={(s, q) => {
                  const norm = normalizeNums(q.trim())
                  // Pure number → exact code match
                  if (/^\d+$/.test(norm)) return s.code === norm
                  // Text → substring match on names and code
                  return (
                    s.name_ar.includes(q) ||
                    s.name_en.toLowerCase().includes(q) ||
                    s.code.includes(norm)
                  )
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">ابحث واختر خدمة من القائمة أعلاه لإضافة بند</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-muted-foreground">
                    <th className="text-start p-2">الخدمة</th>
                    <th className="p-2 w-20">الكمية</th>
                    <th className="p-2 w-24">السعر</th>
                    <th className="p-2 w-24">الخصم</th>
                    <th className="p-2 w-24">الغرامة</th>
                    <th className="p-2 w-24">الإجمالي</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="p-2">{item.service_name_ar}</td>
                      <td className="p-2"><Input type="number" min={1} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} className="w-full text-center" /></td>
                      <td className="p-2"><Input type="number" min={0} step="0.001" value={item.unit_price} onChange={e => updateItem(item.id, 'unit_price', Number(e.target.value))} className="w-full" dir="ltr" /></td>
                      <td className="p-2"><Input type="number" min={0} step="0.001" value={item.discount_amount} onChange={e => updateItem(item.id, 'discount_amount', Number(e.target.value))} className="w-full" dir="ltr" /></td>
                      <td className="p-2"><Input type="number" min={0} step="0.001" value={item.fine_amount} onChange={e => updateItem(item.id, 'fine_amount', Number(e.target.value))} className="w-full" dir="ltr" /></td>
                      <td className="p-2 text-green-600 font-medium text-center">{item.total_amount.toFixed(3)}</td>
                      <td className="p-2"><Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => removeItem(item.id)}><Trash2 className="w-3 h-3" /></Button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted font-semibold">
                    <td colSpan={5} className="p-2 text-end">الإجمالي:</td>
                    <td className="p-2 text-green-700 text-center">{netAmount.toFixed(3)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>إلغاء</Button>
        <Button onClick={handleSubmit} disabled={loading} style={{ background: '#cd7f32', color: '#fff' }} className="px-8">
          {loading ? '...' : init?.id ? 'حفظ التعديلات' : 'إنشاء أمر العمل'}
        </Button>
      </div>
    </div>
  )
}
