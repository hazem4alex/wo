import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type WorkOrderStatus = 'draft' | 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'

const statusConfig: Record<WorkOrderStatus, { label: string; labelAr: string; className: string }> = {
  draft:       { label: 'Draft',       labelAr: 'مسودة',       className: 'bg-gray-100 text-gray-700 border-gray-200' },
  open:        { label: 'Open',        labelAr: 'مفتوح',       className: 'bg-blue-100 text-blue-700 border-blue-200' },
  assigned:    { label: 'Assigned',    labelAr: 'مُعين',       className: 'bg-purple-100 text-purple-700 border-purple-200' },
  in_progress: { label: 'In Progress', labelAr: 'قيد التنفيذ', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  completed:   { label: 'Completed',   labelAr: 'مكتمل',       className: 'bg-green-100 text-green-700 border-green-200' },
  cancelled:   { label: 'Cancelled',   labelAr: 'ملغي',        className: 'bg-red-100 text-red-700 border-red-200' },
}

export function StatusBadge({ status, locale = 'ar' }: { status: WorkOrderStatus; locale?: string }) {
  const config = statusConfig[status]
  if (!config) return <Badge variant="outline">{status}</Badge>
  return (
    <Badge variant="outline" className={cn('font-medium text-xs', config.className)}>
      {locale === 'ar' ? config.labelAr : config.label}
    </Badge>
  )
}

export function ActiveBadge({ isActive, locale = 'ar' }: { isActive: boolean; locale?: string }) {
  return (
    <Badge variant="outline" className={isActive
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-500 border-gray-200'
    }>
      {isActive ? (locale === 'ar' ? 'مفعل' : 'Active') : (locale === 'ar' ? 'معطل' : 'Inactive')}
    </Badge>
  )
}
