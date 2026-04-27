import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { ExportButtons } from '@/components/shared/export-buttons'
import { Card, CardContent } from '@/components/ui/card'

export default async function ConsumersByAreaPage() {
  const result = await pool.query(`
    SELECT g.name_ar as governorate, a.name_ar as area, COUNT(c.id) as count
    FROM governorate g
    LEFT JOIN area a ON a.governorate_id = g.id
    LEFT JOIN consumer c ON c.area_id = a.id AND c.is_active = true
    GROUP BY g.id, g.name_ar, a.id, a.name_ar
    HAVING COUNT(c.id) > 0
    ORDER BY count DESC
  `)

  const total = result.rows.reduce((s: number, r: { count: string }) => s + Number(r.count), 0)

  return (
    <div>
      <PageHeader
        title="تقرير المستهلكين حسب المنطقة"
        breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'التقارير' }, { label: 'تقرير المستهلكين' }]}
        actions={<ExportButtons tableId="consumers-area-table" filename="تقرير-المستهلكين" />}
      />
      <Card>
        <CardContent className="pt-6">
          <table id="consumers-area-table" className="w-full text-sm">
            <thead><tr className="bg-muted text-muted-foreground">
              <th className="p-3 text-start">#</th>
              <th className="p-3 text-start">المحافظة</th>
              <th className="p-3 text-start">المنطقة</th>
              <th className="p-3 text-end">عدد المستهلكين</th>
            </tr></thead>
            <tbody>
              {result.rows.map((r: { governorate: string; area: string; count: string }, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-3 text-muted-foreground">{i + 1}</td>
                  <td className="p-3">{r.governorate}</td>
                  <td className="p-3">{r.area}</td>
                  <td className="p-3 text-end font-medium text-primary">{r.count}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-muted font-bold border-t">
              <td colSpan={3} className="p-3 text-end">الإجمالي:</td>
              <td className="p-3 text-end text-primary">{total}</td>
            </tr></tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
