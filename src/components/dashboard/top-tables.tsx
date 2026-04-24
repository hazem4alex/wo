import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TopService, TopSupervisor } from '@/lib/queries/dashboard'
import { formatKWD } from '@/lib/format'

export function TopTables({ topServices, topSupervisors }: { topServices: TopService[]; topSupervisors: TopSupervisor[] }) {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm font-semibold">أعلى الخدمات</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b">
              <th className="text-start pb-2">#</th>
              <th className="text-start pb-2">اسم الخدمة</th>
              <th className="text-end pb-2">الاستخدام</th>
              <th className="text-end pb-2">الإجمالي</th>
            </tr></thead>
            <tbody>
              {topServices.map((s, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 text-gray-400">{i + 1}</td>
                  <td className="py-2 text-gray-700 truncate max-w-28">{s.name_ar}</td>
                  <td className="py-2 text-end text-blue-600">{s.usage_count}</td>
                  <td className="py-2 text-end text-green-600">{formatKWD(s.total_revenue)}</td>
                </tr>
              ))}
              {topServices.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400">لا يوجد بيانات</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm font-semibold">أعلى المشرفين</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b">
              <th className="text-start pb-2">#</th>
              <th className="text-start pb-2">المشرف</th>
              <th className="text-end pb-2">الأوامر</th>
              <th className="text-end pb-2">الإيرادات</th>
            </tr></thead>
            <tbody>
              {topSupervisors.map((s, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 text-gray-400">{i + 1}</td>
                  <td className="py-2 text-gray-700">{s.full_name}</td>
                  <td className="py-2 text-end text-blue-600">{s.total_orders}</td>
                  <td className="py-2 text-end text-green-600">{formatKWD(s.total_revenue)}</td>
                </tr>
              ))}
              {topSupervisors.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400">لا يوجد بيانات</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
