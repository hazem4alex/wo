import { pool } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { WorkOrdersClient } from './work-orders-client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function WorkOrdersPage() {
  const result = await pool.query(`
    SELECT
      wo.id, wo.work_order_no, wo.status, wo.net_amount,
      wo.created_at,
      c.full_name as consumer_name,
      s.full_name as supervisor_name,
      o.name_ar as office_name,
      a.name_ar as area_name,
      TO_CHAR(wo.created_at AT TIME ZONE 'Asia/Kuwait', 'YYYY-MM-DD') as date
    FROM work_order wo
    LEFT JOIN consumer c ON wo.consumer_id = c.id
    LEFT JOIN supervisor s ON wo.supervisor_id = s.id
    LEFT JOIN office o ON wo.office_id = o.id
    LEFT JOIN area a ON wo.area_id = a.id
    ORDER BY wo.created_at DESC
    LIMIT 200
  `)

  return (
    <div>
      <PageHeader
        title="اوامر العمل"
        breadcrumb={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'اوامر العمل' }]}
        actions={
          <Link href="/work-orders/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> إضافة امر عمل
            </Button>
          </Link>
        }
      />
      <WorkOrdersClient rows={result.rows} />
    </div>
  )
}
