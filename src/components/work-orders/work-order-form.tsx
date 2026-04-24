'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { createWorkOrder } from '@/lib/actions/work-orders'
import { useRouter } from 'next/navigation'

interface ServiceOption {
  id: string; code: string; name_ar: string; name_en: string;
  unit_price: string; require_electricity_meter: boolean; require_water_meter: boolean;
}
interface BillingItem {
  id: string; service_name_ar: string; service_name_en: string; service_code: string;
  quantity: number; unit_price: number; discount_amount: number; fine_amount: number; total_amount: number;
}

function calcTotal(item: BillingItem): number {
  return Math.max(0, item.quantity * item.unit_price - item.discount_amount + item.fine_amount)
}

export function WorkOrderForm({ consumers, governorates, areas, offices, supervisors, services, paymentMethods }: {
  consumers: Array<{ id: string; full_name: string; consumer_code: string; consumer_no?: string; national_id?: string; phone?: string; street?: string; house_no?: string; apartment_no?: string; governorate_text?: string; area_text?: string }>
  governorates: Array<{ id: string; name_ar: string }>
  areas: Array<{ id: string; name_ar: string; governorate_id: string }>
  offices: Array<{ id: string; name_ar: string; area_id: string }>
  supervisors: Array<{ id: string; full_name: string; office_id: string }>
  services: ServiceOption[]
  paymentMethods: Array<{ id: string; name_ar: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [consumerId, setConsumerId] = useState('')
  const [governorateId, setGovernorateId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [officeId, setOfficeId] = useState('')
  const [supervisorId, setSupervisorId] = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [notes, setNotes] = useState('')
  const [consumerSearch, setConsumerSearch] = useState('')
  // Address fields
  const [street, setStreet] = useState('')
  const [houseNo, setHouseNo] = useState('')
  const [apartmentNo, setApartmentNo] = useState('')
  // Meter fields
  const [elecOldNo, setElecOldNo] = useState('')
  const [elecNewNo, setElecNewNo] = useState('')
  const [elecOldReading, setElecOldReading] = useState('')
  const [elecNewReading, setElecNewReading] = useState('')
  const [waterOldNo, setWaterOldNo] = useState('')
  const [waterNewNo, setWaterNewNo] = useState('')
  const [waterOldReading, setWaterOldReading] = useState('')
  const [waterNewReading, setWaterNewReading] = useState('')
  // Billing items
  const [items, setItems] = useState<BillingItem[]>([])

  const filteredAreas = areas.filter(a => a.governorate_id === governorateId)
  const filteredOffices = offices.filter(o => o.area_id === areaId)
  const filteredSupervisors = supervisors.filter(s => !officeId || s.office_id === officeId)

  // Check if any selected service requires meter data
  const requiresElectricity = items.some(item => {
    const svc = services.find(s => s.name_ar === item.service_name_ar)
    return svc?.require_electricity_meter
  })
  const requiresWater = items.some(item => {
    const svc = services.find(s => s.name_ar === item.service_name_ar)
    return svc?.require_water_meter
  })

  const filteredConsumers = useMemo(() => {
    if (!consumerSearch) return consumers.slice(0, 50)
    const q = consumerSearch.toLowerCase()
    return consumers.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.consumer_code?.includes(q) ||
      c.consumer_no?.includes(q) ||
      c.national_id?.includes(q) ||
      c.phone?.includes(q)
    ).slice(0, 50)
  }, [consumers, consumerSearch])

  const addItem = (svc?: ServiceOption) => {
    const newItem: BillingItem = {
      id: Math.random().toString(36),
      service_name_ar: svc?.name_ar ?? '',
      service_name_en: svc?.name_en ?? '',
      service_code: svc?.code ?? '',
      quantity: 1,
      unit_price: svc ? Number(svc.unit_price) : 0,
      discount_amount: 0,
      fine_amount: 0,
      total_amount: svc ? Number(svc.unit_price) : 0,
    }
    setItems(prev => [...prev, newItem])
  }

  const updateItem = (id: string, field: keyof BillingItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      updated.total_amount = calcTotal(updated)
      return updated
    }))
  }

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const netAmount = items.reduce((sum, item) => sum + item.total_amount, 0)

  const handleSubmit = async () => {
    if (!consumerId || !officeId || items.length === 0) {
      alert('يرجى ملء الحقول المطلوبة وإضافة بند واحد على الأقل')
      return
    }
    setLoading(true)
    try {
      await createWorkOrder({
        consumer_id: consumerId,
        office_id: officeId,
        supervisor_id: supervisorId || undefined,
        payment_method_id: paymentMethodId || undefined,
        governorate_id: governorateId || undefined,
        area_id: areaId || undefined,
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
      })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) return // expected
      alert(e instanceof Error ? e.message : 'خطأ في الحفظ')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Consumer + Location */}
      <Card>
        <CardHeader><CardTitle className="text-base">بيانات المستهلك والموقع</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>المستهلك <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              <Input value={consumerSearch} onChange={e => setConsumerSearch(e.target.value)} placeholder="بحث بالاسم / الرقم المدني / رقم الهاتف / الكود..." className="w-full" />
            </div>
            <Select value={consumerId} onValueChange={v => {
              setConsumerId(v ?? '')
              const c = consumers.find(c => c.id === v)
              if (c) {
                setStreet(c.street ?? '')
                setHouseNo(c.house_no ?? '')
                setApartmentNo(c.apartment_no ?? '')
              }
            }}>
              <SelectTrigger><SelectValue placeholder="اختر المستهلك" /></SelectTrigger>
              <SelectContent>
                {filteredConsumers.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name}
                    {c.consumer_code ? ` — ${c.consumer_code}` : ''}
                    {c.national_id ? ` — ${c.national_id}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>الشارع</Label>
              <Input value={street} onChange={e => setStreet(e.target.value)} placeholder="اسم الشارع" />
            </div>
            <div className="space-y-1">
              <Label>رقم المنزل</Label>
              <Input value={houseNo} onChange={e => setHouseNo(e.target.value)} placeholder="رقم المنزل" />
            </div>
            <div className="space-y-1">
              <Label>رقم الشقة</Label>
              <Input value={apartmentNo} onChange={e => setApartmentNo(e.target.value)} placeholder="رقم الشقة" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>المحافظة</Label>
              <Select value={governorateId} onValueChange={v => { setGovernorateId(v ?? ''); setAreaId(''); setOfficeId('') }}>
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>{governorates.map(g => <SelectItem key={g.id} value={g.id}>{g.name_ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>المنطقة</Label>
              <Select value={areaId} onValueChange={v => { setAreaId(v ?? ''); setOfficeId('') }} disabled={!governorateId}>
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>{filteredAreas.map(a => <SelectItem key={a.id} value={a.id}>{a.name_ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>المكتب <span className="text-red-500">*</span></Label>
              <Select value={officeId} onValueChange={v => { setOfficeId(v ?? ''); setSupervisorId('') }} disabled={!areaId}>
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>{filteredOffices.map(o => <SelectItem key={o.id} value={o.id}>{o.name_ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>المشرف</Label>
              <Select value={supervisorId} onValueChange={v => setSupervisorId(v ?? '')}>
                <SelectTrigger><SelectValue placeholder="اختر المشرف" /></SelectTrigger>
                <SelectContent>{filteredSupervisors.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>طريقة الدفع</Label>
              <Select value={paymentMethodId} onValueChange={v => setPaymentMethodId(v ?? '')}>
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>{paymentMethods.map(p => <SelectItem key={p.id} value={p.id}>{p.name_ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>ملاحظات</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Billing Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">بنود الفاتورة</CardTitle>
            <Select onValueChange={v => { const svc = services.find(s => s.id === v); addItem(svc) }}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="+ إضافة خدمة" />
              </SelectTrigger>
              <SelectContent>
                {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name_ar}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-center text-gray-400 py-8">أضف خدمة من القائمة أعلاه</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
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
                    <tr key={item.id} className="border-t">
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
                  <tr className="border-t bg-gray-50 font-semibold">
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

      {/* Meter fields — always visible */}
      <Card>
        <CardHeader><CardTitle className="text-base">العدادات</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {/* Electricity */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-amber-500">⚡</span>
              <span className="text-sm font-medium text-amber-700">عداد الكهرباء</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1"><Label>الرقم القديم</Label><Input value={elecOldNo} onChange={e => setElecOldNo(e.target.value)} dir="ltr" placeholder="رقم العداد القديم" /></div>
              <div className="space-y-1"><Label>الرقم الجديد</Label><Input value={elecNewNo} onChange={e => setElecNewNo(e.target.value)} dir="ltr" placeholder="رقم العداد الجديد" /></div>
              <div className="space-y-1"><Label>القراءة القديمة</Label><Input type="number" step="0.001" value={elecOldReading} onChange={e => setElecOldReading(e.target.value)} dir="ltr" /></div>
              <div className="space-y-1"><Label>القراءة الجديدة</Label><Input type="number" step="0.001" value={elecNewReading} onChange={e => setElecNewReading(e.target.value)} dir="ltr" /></div>
            </div>
          </div>
          {/* Water */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-sky-500">💧</span>
              <span className="text-sm font-medium text-sky-700">عداد المياه</span>
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

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>إلغاء</Button>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-700 hover:bg-blue-800 text-white px-8">
          {loading ? '...' : 'حفظ أمر العمل'}
        </Button>
      </div>
    </div>
  )
}
