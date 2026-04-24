import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { WorkOrdersReportClient } from './work-orders-report-client'

export default async function WorkOrdersReportPage() {
  const [supervisorsRes, officesRes, areasRes] = await Promise.all([
    pool.query('SELECT id, full_name FROM supervisor ORDER BY full_name'),
    pool.query('SELECT id, name_ar FROM office ORDER BY name_ar'),
    pool.query('SELECT id, name_ar FROM area ORDER BY name_ar'),
  ])

  return (
    <div>
      <PageHeader
        title="تقرير أوامر العمل"
        subtitle="تقرير تفصيلي لأوامر العمل مع فلاتر"
        breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'التقارير' }, { label: 'تقرير أوامر العمل' }]}
      />
      <WorkOrdersReportClient
        supervisors={supervisorsRes.rows}
        offices={officesRes.rows}
        areas={areasRes.rows}
      />
    </div>
  )
}
