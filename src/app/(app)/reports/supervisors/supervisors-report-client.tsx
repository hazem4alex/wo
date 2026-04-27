'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExportButtons } from '@/components/shared/export-buttons'
import { Filter, RotateCcw } from 'lucide-react'

interface SupervisorRow {
  supervisor_name: string
  office_name: string
  total_orders: number
  completed: number
  pending: number
  total_revenue: number
}

interface Option { id: string; name_ar?: string }

export function SupervisorsReportClient({ offices }: { offices: Option[] }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [officeId, setOfficeId] = useState('all')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<SupervisorRow[]>([])
  const [fetched, setFetched] = useState(false)

  const handleFilter = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      if (officeId !== 'all') params.set('office_id', officeId)
      const res = await fetch(`/api/reports/supervisors?${params}`)
      const data = await res.json()
      setRows(data.rows ?? [])
      setFetched(true)
    } finally { setLoading(false) }
  }

  const reset = () => {
    setFrom(''); setTo(''); setOfficeId('all')
    setRows([]); setFetched(false)
  }

  const totalOrders = rows.reduce((s, r) => s + Number(r.total_orders), 0)
  const totalCompleted = rows.reduce((s, r) => s + Number(r.completed), 0)
  const totalPending = rows.reduce((s, r) => s + Number(r.pending), 0)
  const totalRevenue = rows.reduce((s, r) => s + Number(r.total_revenue), 0)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="space-y-1">
              <Label>تاريخ البداية</Label>
              <Input type="date" value={from} onChange={e => setFrom(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label>تاريخ الانتهاء</Label>
              <Input type="date" value={to} onChange={e => setTo(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1 min-w-40">
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
              <Button onClick={handleFilter} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1">
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
              { label: 'إجمالي الأوامر', value: totalOrders, color: 'text-primary', bg: 'bg-accent' },
              { label: 'مكتمل', value: totalCompleted, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'معلق', value: totalPending, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'إجمالي الإيرادات', value: totalRevenue.toFixed(3), color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map(c => (
              <Card key={c.label} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
                  <div className="text-sm text-muted-foreground">{c.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Export + Table */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">تفاصيل إنتاجية المشرفين</h3>
                <ExportButtons tableId="supervisors-report-table" filename="تقرير-المشرفين" />
              </div>
              <div className="overflow-x-auto">
                <table id="supervisors-report-table" className="w-full text-sm">
                  <thead><tr className="bg-muted text-muted-foreground">
                    <th className="p-2 text-start">#</th>
                    <th className="p-2 text-start">المشرف</th>
                    <th className="p-2">المكتب</th>
                    <th className="p-2">إجمالي الأوامر</th>
                    <th className="p-2">مكتمل</th>
                    <th className="p-2">معلق</th>
                    <th className="p-2 text-end">إجمالي الإيرادات</th>
                  </tr></thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 text-muted-foreground">{i + 1}</td>
                        <td className="p-2 font-medium">{r.supervisor_name}</td>
                        <td className="p-2 text-center text-muted-foreground">{r.office_name || '-'}</td>
                        <td className="p-2 text-center text-primary font-medium">{r.total_orders}</td>
                        <td className="p-2 text-center text-green-600">{r.completed}</td>
                        <td className="p-2 text-center text-amber-600">{r.pending}</td>
                        <td className="p-2 text-end text-green-600 font-medium">{Number(r.total_revenue).toFixed(3)}</td>
                      </tr>
                    ))}
                    {rows.length > 0 && (
                      <tr className="bg-muted font-bold border-t">
                        <td colSpan={3} className="p-2 text-end">الإجمالي:</td>
                        <td className="p-2 text-center text-primary">{totalOrders}</td>
                        <td className="p-2 text-center text-green-700">{totalCompleted}</td>
                        <td className="p-2 text-center text-amber-700">{totalPending}</td>
                        <td className="p-2 text-end text-green-700">{totalRevenue.toFixed(3)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {rows.length === 0 && <p className="text-center text-muted-foreground py-8">لا يوجد بيانات</p>}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
