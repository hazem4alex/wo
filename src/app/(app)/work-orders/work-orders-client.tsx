'use client'

import { useState, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2, Search, RefreshCw, Plus, Printer } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatKWD } from '@/lib/format'
import { deleteWorkOrder } from '@/lib/actions/work-orders'
import { cn } from '@/lib/utils'

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
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = useMemo(() => rows.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (search && !r.work_order_no?.includes(search) && !r.consumer_name?.includes(search)) return false
    return true
  }), [rows, search, statusFilter])

  const handleDelete = async (id: string, woNo: string) => {
    if (!confirm(`هل أنت متأكد من حذف أمر العمل ${woNo}؟`)) return
    setDeleting(id)
    try {
      await deleteWorkOrder(id)
      router.refresh()
    } catch {
      alert('حدث خطأ أثناء الحذف')
    } finally {
      setDeleting(null)
    }
  }

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
      cell: ({ row }) => <span className="text-green-600 font-medium">{formatKWD(row.original.net_amount)}</span>
    },
    { accessorKey: 'date', header: 'التاريخ' },
    {
      id: 'actions', header: 'اجراء',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Link href={`/work-orders/${row.original.id}`}>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" title="عرض">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/work-orders/${row.original.id}/edit`}>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600" title="تعديل">
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
          <a href={`/work-orders/${row.original.id}/print`} target="_blank" rel="noopener noreferrer">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-[#cd7f32]" title="طباعة">
              <Printer className="w-4 h-4" />
            </Button>
          </a>
          <Button
            size="icon" variant="ghost"
            className="h-8 w-8 text-red-500"
            title="حذف"
            disabled={deleting === row.original.id}
            onClick={() => handleDelete(row.original.id, row.original.work_order_no)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث برقم الأمر أو المستهلك..." className="ps-9" />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className={cn(
            'h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors',
            'focus:border-ring focus:ring-2 focus:ring-ring/50'
          )}
        >
          <option value="all">كل الحالات</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <Button variant="outline" onClick={() => router.refresh()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> تحديث
        </Button>
        <Link href="/work-orders/new">
          <Button style={{ background: '#cd7f32', color: '#fff' }} className="gap-2">
            <Plus className="w-4 h-4" /> أمر عمل جديد
          </Button>
        </Link>
      </div>
      <DataTable data={filtered} columns={columns} />
    </div>
  )
}
