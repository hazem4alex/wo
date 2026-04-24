import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { SupervisorsReportClient } from './supervisors-report-client'

export default async function SupervisorsReportPage() {
  const officesRes = await pool.query('SELECT id, name_ar FROM office ORDER BY name_ar')
  return (
    <div>
      <PageHeader
        title="تقرير إنتاجية المشرفين"
        breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'التقارير' }, { label: 'تقرير المشرفين' }]}
      />
      <SupervisorsReportClient offices={officesRes.rows} />
    </div>
  )
}
