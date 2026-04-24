import { PageHeader } from '@/components/shared/page-header'
import { RevenueReportClient } from './revenue-report-client'

export default async function RevenueReportPage() {
  return (
    <div>
      <PageHeader
        title="تقرير إيرادات الخدمات"
        subtitle="تفاصيل الإيرادات حسب الخدمة"
        breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'التقارير' }, { label: 'تقرير إيرادات الخدمات' }]}
      />
      <RevenueReportClient />
    </div>
  )
}
