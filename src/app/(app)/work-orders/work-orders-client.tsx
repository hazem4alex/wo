'use client'

import { useState, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Eye, Search, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface WORow {
  id: string; work_order_no: string; status: string; net_amount: string;
  consumer_name: string; supervisor_name: string; office_name: string;
  area_name: string; date: string;
}

const STATUSES = ['draft','open','assigned','in_progress','completed','cancelled']
const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة', open: 'مفتوح', assigned: 'مُعين',
  in_progress: 'قيد التنفيذ', completed: 'مكتمل', cancelled: 'ملغي'
}

export function WorkOrdersClient({ rows }: { rows: WORow[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => rows.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (search && !r.work_order_no?.includes(search) && !r.consumer_name?.includes(search)) return false
    return true
  }), [rows, search, statusFilter])

  const columns: ColumnDef<WORow, unknown>[] = [
    { header: '#', cell: ({ row }) => row.index + 1, size: 50 },
    { accessorKey: 'work_order_no', header: 'رقم أمر العمل',
      cell: ({ row }) => (
        <Link href={`/work-orders/${row.original.id}`} className="text-blue-600 hover:underline font-medium">
          {row.original.work_order_no}
        </Link>
      )
    },
    { accessorKey: 'consumer_name', header: 'المستهلك' },
    { accessorKey: 'supervisor_name', header: 'المشرف' },
    { accessorKey: 'area_name', header: 'المنطقة' },
    { accessorKey: 'office_name', header: 'المكتب' },
    { id: 'status', header: 'الحالة',
      cell: ({ row }) => <StatusBadge status={row.original.status as 'draft'} />
    },
    { accessorKey: 'net_amount', header: 'صافي المبلغ',
      cell: ({ row }) => <span className="text-green-600 font-medium">{Number(row.original.net_amount).toFixed(3)}</span>
    },
    { accessorKey: 'date', header: 'التاريخ' },
    {
      id: 'actions', header: 'اجراء',
      cell: ({ row }) => (
        <Link href={`/work-orders/${row.original.id}`}>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600">
            <Eye className="w-4 h-4" />
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث برقم الأمر أو المستهلك..." className="ps-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="w-44"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => router.refresh()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> تحديث
        </Button>
      </div>
      <DataTable data={filtered} columns={columns} />
    </div>
  )
}
