'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateWorkOrderStatus } from '@/lib/actions/work-orders'
import { useRouter } from 'next/navigation'

const STATUSES = [
  { value: 'draft', label: 'مسودة' },
  { value: 'open', label: 'مفتوح' },
  { value: 'assigned', label: 'مُعين' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
]

export function WorkOrderStatusModal({ workOrderId, currentStatus }: { workOrderId: string; currentStatus: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateWorkOrderStatus(workOrderId, status, message)
      setOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
        تغيير الحالة
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>تغيير الحالة</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>الحالة الجديدة</Label>
              <Select value={status} onValueChange={v => setStatus(v ?? currentStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>ملاحظة (اختياري)</Label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                {loading ? '...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
