'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExportButtons } from '@/components/shared/export-buttons'
import { Filter } from 'lucide-react'

interface RevenueRow {
  service_name_ar: string; service_code: string; order_count: number;
  total_qty: number; unit_price: number; total_revenue: number;
  discount_total: number; net_revenue: number;
}

export function RevenueReportClient() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<RevenueRow[]>([])
  const [fetched, setFetched] = useState(false)

  const handleFilter = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const res = await fetch(`/api/reports/revenue?${params}`)
      const data = await res.json()
      setRows(data.rows ?? [])
      setFetched(true)
    } finally { setLoading(false) }
  }

  const totalRevenue = rows.reduce((s, r) => s + Number(r.total_revenue), 0)
  const netRevenue = rows.reduce((s, r) => s + Number(r.net_revenue), 0)

  return (
    <div className="space-y-6">
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
            <Button onClick={handleFilter} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Filter className="w-4 h-4" /> {loading ? '...' : 'تطبيق الفلتر'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {fetched && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-blue-50">
              <CardContent className="p-5">
                <div className="text-2xl font-bold text-blue-700">{totalRevenue.toFixed(3)}</div>
                <div className="text-sm text-gray-500">إجمالي الإيرادات</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-green-50">
              <CardContent className="p-5">
                <div className="text-2xl font-bold text-green-700">{netRevenue.toFixed(3)}</div>
                <div className="text-sm text-gray-500">صافي الإيرادات</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-purple-50">
              <CardContent className="p-5">
                <div className="text-2xl font-bold text-purple-700">{rows.length}</div>
                <div className="text-sm text-gray-500">عدد الخدمات</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">تفاصيل إيرادات الخدمات</h3>
                <ExportButtons tableId="revenue-table" filename="تقرير-إيرادات-الخدمات" />
              </div>
              <div className="overflow-x-auto">
                <table id="revenue-table" className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-gray-600">
                    <th className="p-2">#</th>
                    <th className="p-2 text-start">اسم الخدمة</th>
                    <th className="p-2">كود الخدمة</th>
                    <th className="p-2">عدد أوامر العمل</th>
                    <th className="p-2">إجمالي الكمية</th>
                    <th className="p-2">السعر</th>
                    <th className="p-2">إجمالي الإيرادات</th>
                    <th className="p-2">إجمالي الخصم</th>
                    <th className="p-2">صافي الإيرادات</th>
                  </tr></thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 text-center text-gray-400">{i + 1}</td>
                        <td className="p-2">{r.service_name_ar}</td>
                        <td className="p-2 text-center text-blue-600">{r.service_code}</td>
                        <td className="p-2 text-center text-blue-600">{r.order_count}</td>
                        <td className="p-2 text-center">{r.total_qty}</td>
                        <td className="p-2 text-center">{Number(r.unit_price).toFixed(3)}</td>
                        <td className="p-2 text-center">{Number(r.total_revenue).toFixed(3)}</td>
                        <td className="p-2 text-center text-red-500">{Number(r.discount_total).toFixed(3)}</td>
                        <td className="p-2 text-center text-green-600 font-medium">{Number(r.net_revenue).toFixed(3)}</td>
                      </tr>
                    ))}
                    {rows.length > 0 && (
                      <tr className="bg-gray-50 font-bold border-t">
                        <td colSpan={6} className="p-2 text-end">الإجمالي:</td>
                        <td className="p-2 text-center">{totalRevenue.toFixed(3)}</td>
                        <td></td>
                        <td className="p-2 text-center text-green-700">{netRevenue.toFixed(3)}</td>
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
