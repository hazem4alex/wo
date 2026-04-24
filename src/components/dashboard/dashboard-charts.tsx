'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import type { RevenueTrend, OrdersByStatus, OrdersByArea, ConsumersByGovernorate } from '@/lib/queries/dashboard'

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8', open: '#3b82f6', assigned: '#8b5cf6',
  in_progress: '#f59e0b', completed: '#10b981', cancelled: '#ef4444',
}
const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة', open: 'مفتوح', assigned: 'مُعين',
  in_progress: 'قيد التنفيذ', completed: 'مكتمل', cancelled: 'ملغي',
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']

interface Props {
  trend: RevenueTrend[]
  byStatus: OrdersByStatus[]
  byArea: OrdersByArea[]
  byGov: ConsumersByGovernorate[]
}

export function DashboardCharts({ trend, byStatus, byArea, byGov }: Props) {
  const statusData = byStatus.map(s => ({
    ...s,
    label: STATUS_LABELS[s.status] ?? s.status,
    fill: STATUS_COLORS[s.status] ?? '#94a3b8',
  }))

  return (
    <div className="space-y-6">
      {/* Revenue trend */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm font-semibold">اتجاه الإيرادات</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => Number(v).toFixed(3)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" name="إجمالي الإيرادات" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" name="إجمالي الأوامر" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* By status donut */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm font-semibold">أوامر العمل حسب الحالة</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={50} outerRadius={75}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By area bar */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm font-semibold">أوامر العمل حسب المنطقة</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byArea} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name_ar" type="category" tick={{ fontSize: 10 }} width={70} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Consumers by governorate */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm font-semibold">المستهلكين حسب المحافظة</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byGov} dataKey="count" nameKey="name_ar" cx="50%" cy="50%" outerRadius={80}>
                {byGov.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
