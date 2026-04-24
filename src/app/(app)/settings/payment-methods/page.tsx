import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { PaymentMethodsClient } from './payment-methods-client'

export default async function PaymentMethodsPage() {
  const result = await pool.query('SELECT id, code, name_ar, name_en FROM payment_method ORDER BY name_ar')
  return (
    <div>
      <PageHeader title="طرق الدفع" breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الإعدادات' }, { label: 'طرق الدفع' }]} />
      <PaymentMethodsClient rows={result.rows} />
    </div>
  )
}
