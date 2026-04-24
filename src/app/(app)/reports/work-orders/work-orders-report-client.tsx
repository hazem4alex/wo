'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/status-badge'
import { ExportButtons } from '@/components/shared/export-buttons'
import { Filter, RotateCcw } from 'lucide-react'
import { formatKWD } from '@/lib/format'

interface WORow {
  id: string; work_order_no: string; consumer_name: string; supervisor_name: string;
  office_name: string; area_name: string; service_names: string; status: string;
  net_amount: string; has_fine: boolean; date: string;
}

interface Option { id: string; full_name?: string; name_ar?: string }

const STATUSES = [
  { value: 'all', label: 'الكل' }, { value: 'draft', label: 'مسودة' },
  { value: 'open', label: 'مفتوح' }, { value: 'assigned', label: 'مُعين' },
  { value: 'in_progress', label: 'قيد التنفيذ' }, { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
]

export function WorkOrdersReportClient({ supervisors, offices, areas }: {
  supervisors: Option[]; offices: Option[]; areas: Option[]
}) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('all')
  const [supervisorId, setSupervisorId] = useState('all')
  const [officeId, setOfficeId] = useState('all')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<WORow[]>([])
  const [fetched, setFetched] = useState(false)

  const handleFilter = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      if (status !== 'all') params.set('status', status)
      if (supervisorId !== 'all') params.set('supervisor_id', supervisorId)
      if (officeId !== 'all') params.set('office_id', officeId)
      const res = await fetch(`/api/reports/work-orders?${params}`)
      const data = await res.json()
      setRows(data.rows ?? [])
      setFetched(true)
    } finally { setLoading(false) }
  }

  const reset = () => {
    setFrom(''); setTo(''); setStatus('all'); setSupervisorId('all'); setOfficeId('all')
    setRows([]); setFetched(false)
  }

  const totalRevenue = rows.reduce((s, r) => s + Number(r.net_amount), 0)
  const pendingCount = rows.filter(r => r.status === 'open').length
  const completedCount = rows.filter(r => r.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-1">
              <Label>تاريخ البداية</Label>
              <Input type="date" value={from} onChange={e => setFrom(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label>تاريخ الانتهاء</Label>
              <Input type="date" value={to} onChange={e => setTo(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label>الحالة</Label>
              <Select value={status} onValueChange={v => setStatus(v ?? 'all')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>المشرف</Label>
              <Select value={supervisorId} onValueChange={v => setSupervisorId(v ?? 'all')}>
                <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {supervisors.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>المكتب</Label>
              <Select value={officeId} onValueChange={v => setOfficeId(v ?? 'all')}>
                <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {offices.map(o => <SelectItem key={o.id} value={o.id}>{o.name_ar}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleFilter} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white gap-1 flex-1">
                <Filter className="w-4 h-4" /> {loading ? '...' : 'تطبيق الفلتر'}
              </Button>
              <Button variant="outline" onClick={reset} className="gap-1"><RotateCcw className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {fetched && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'إجمالي الإيرادات', value: formatKWD(totalRevenue), color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'معلق', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'مكتمل', value: completedCount, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'إجمالي الأوامر', value: rows.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map(c => (
              <Card key={c.label} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
                  <div className="text-sm text-gray-500">{c.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Export + Table */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">تفاصيل أوامر العمل</h3>
                <ExportButtons tableId="wo-report-table" filename="تقرير-أوامر-العمل" />
              </div>
              <div className="overflow-x-auto">
                <table id="wo-report-table" className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-gray-600">
                    <th className="p-2 text-start">#</th>
                    <th className="p-2 text-start">رقم أمر العمل</th>
                    <th className="p-2">المستهلك</th>
                    <th className="p-2">المشرف</th>
                    <th className="p-2">المنطقة</th>
                    <th className="p-2">المكتب</th>
                    <th className="p-2">الخدمة</th>
                    <th className="p-2">الحالة</th>
                    <th className="p-2">غرامة</th>
                    <th className="p-2 text-end">صافي المبلغ</th>
                    <th className="p-2">التاريخ</th>
                  </tr></thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.id} className="border-t">
                        <td className="p-2 text-gray-400">{i + 1}</td>
                        <td className="p-2 font-medium text-blue-600">{r.work_order_no}</td>
                        <td className="p-2 text-center">{r.consumer_name}</td>
                        <td className="p-2 text-center">{r.supervisor_name || '-'}</td>
                        <td className="p-2 text-center">{r.area_name || '-'}</td>
                        <td className="p-2 text-center">{r.office_name}</td>
                        <td className="p-2 text-center text-xs">{r.service_names}</td>
                        <td className="p-2 text-center"><StatusBadge status={r.status as 'draft'} /></td>
                        <td className="p-2 text-center">{r.has_fine ? 'نعم' : 'لا'}</td>
                        <td className="p-2 text-end text-green-600 font-medium">{formatKWD(r.net_amount)}</td>
                        <td className="p-2 text-center">{r.date}</td>
                      </tr>
                    ))}
                    {rows.length > 0 && (
                      <tr className="bg-gray-50 font-bold border-t">
                        <td colSpan={9} className="p-2 text-end">الإجمالي:</td>
                        <td className="p-2 text-end text-green-700">{formatKWD(totalRevenue)}</td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {rows.length === 0 && <p className="text-center text-gray-400 py-8">لا يوجد بيانات</p>}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
