'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'

type WorkOrderStatus = 'draft' | 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'

const statusConfig: Record<WorkOrderStatus, { label: string; labelAr: string; className: string }> = {
  draft:       { label: 'Draft',       labelAr: 'مسودة',       className: 'bg-muted text-muted-foreground border-border' },
  open:        { label: 'Open',        labelAr: 'مفتوح',       className: 'bg-accent text-primary border-primary/30' },
  assigned:    { label: 'Assigned',    labelAr: 'مُعين',       className: 'bg-purple-100 text-purple-700 border-purple-200' },
  in_progress: { label: 'In Progress', labelAr: 'قيد التنفيذ', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  completed:   { label: 'Completed',   labelAr: 'مكتمل',       className: 'bg-green-100 text-green-700 border-green-200' },
  cancelled:   { label: 'Cancelled',   labelAr: 'ملغي',        className: 'bg-red-100 text-red-700 border-red-200' },
}

export function StatusBadge({ status, locale }: { status: WorkOrderStatus; locale?: string }) {
  const currentLocale = useLocale()
  const displayLocale = locale ?? currentLocale
  const config = statusConfig[status]
  if (!config) return <Badge variant="outline">{status}</Badge>
  return (
    <Badge variant="outline" className={cn('font-medium text-xs', config.className)}>
      {displayLocale === 'ar' ? config.labelAr : config.label}
    </Badge>
  )
}

export function ActiveBadge({ isActive, locale }: { isActive: boolean; locale?: string }) {
  const currentLocale = useLocale()
  const displayLocale = locale ?? currentLocale
  return (
    <Badge variant="outline" className={isActive
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-muted text-muted-foreground border-border'
    }>
      {isActive ? (displayLocale === 'ar' ? 'مفعل' : 'Active') : (displayLocale === 'ar' ? 'معطل' : 'Inactive')}
    </Badge>
  )
}
