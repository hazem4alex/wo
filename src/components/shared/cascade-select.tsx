'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Option { id: string; name_ar: string; governorate_id?: string; area_id?: string }

interface CascadeSelectProps {
  governorates: Option[]
  areas: Option[]
  offices: Option[]
  value: { governorateId?: string; areaId?: string; officeId?: string }
  onChange: (v: { governorateId?: string; areaId?: string; officeId?: string }) => void
  showOffice?: boolean
}

export function CascadeSelect({ governorates, areas, offices, value, onChange, showOffice = true }: CascadeSelectProps) {
  const filteredAreas = areas.filter(a => a.governorate_id === value.governorateId)
  const filteredOffices = offices.filter(o => o.area_id === value.areaId)

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="space-y-1">
        <Label>المحافظة</Label>
        <Select
          value={value.governorateId ?? ''}
          onValueChange={v => onChange({ governorateId: v ?? undefined, areaId: undefined, officeId: undefined })}
        >
          <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
          <SelectContent>
            {governorates.map(g => <SelectItem key={g.id} value={g.id}>{g.name_ar}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>المنطقة</Label>
        <Select
          value={value.areaId ?? ''}
          onValueChange={v => onChange({ ...value, areaId: v ?? undefined, officeId: undefined })}
          disabled={!value.governorateId}
        >
          <SelectTrigger><SelectValue placeholder="اختر المنطقة" /></SelectTrigger>
          <SelectContent>
            {filteredAreas.map(a => <SelectItem key={a.id} value={a.id}>{a.name_ar}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {showOffice && (
        <div className="space-y-1">
          <Label>المكتب</Label>
          <Select
            value={value.officeId ?? ''}
            onValueChange={v => onChange({ ...value, officeId: v ?? undefined })}
            disabled={!value.areaId}
          >
            <SelectTrigger><SelectValue placeholder="اختر المكتب" /></SelectTrigger>
            <SelectContent>
              {filteredOffices.map(o => <SelectItem key={o.id} value={o.id}>{o.name_ar}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
