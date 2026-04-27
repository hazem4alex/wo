import { pool } from '@/lib/db'
import { notFound } from 'next/navigation'
import { getSession } from '@/lib/session'
import { PrintTrigger, PrintButton } from '@/components/work-orders/print-trigger'

export const dynamic = 'force-dynamic'

function formatDate(d: Date | string | null | undefined, withTime = false): string {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return ''
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  if (!withTime) return `${yyyy}-${mm}-${dd}`
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

function fmt(n: number | string | null | undefined): string {
  if (n == null) return '0.000'
  const v = typeof n === 'string' ? Number(n) : n
  return v.toFixed(3)
}

// A simple labelled field (label on the right in RTL, value to the left of it,
// joined by a dotted line — matches the reference printout style)
function Row({ label, value, valueAlign = 'start' }: {
  label: string; value?: React.ReactNode; valueAlign?: 'start' | 'center' | 'end'
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-baseline gap-3 mb-1.5">
      <div className="text-[12px] text-gray-700 underline underline-offset-2 decoration-gray-300">{label}</div>
      <div className={`text-[13px] text-black border-b border-dotted border-gray-400 px-1 pb-0.5 text-${valueAlign}`}>
        {value || <span>&nbsp;</span>}
      </div>
    </div>
  )
}

// An inline label:value pair with a separator — used for the compact address row
function CompactPair({ label, value, last }: { label: string; value?: React.ReactNode; last?: boolean }) {
  if (!value) return null
  return (
    <span className="inline-flex items-baseline gap-1 me-2">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-black">{value}</span>
      {!last && <span className="text-gray-400 mx-0.5">|</span>}
    </span>
  )
}

export default async function WorkOrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()

  const [woRes, itemsRes] = await Promise.all([
    pool.query(
      `SELECT wo.*,
              c.full_name AS consumer_name, c.national_id, c.phone AS consumer_phone,
              c.consumer_code, c.consumer_no,
              c.street AS consumer_street, c.house_no AS consumer_house, c.apartment_no AS consumer_apt,
              s.full_name AS supervisor_name,
              o.name_ar AS office_name,
              a.name_ar AS area_name,
              g.name_ar AS governorate_name,
              pm.name_ar AS payment_method_name,
              u.full_name_ar AS created_by_name
         FROM work_order wo
    LEFT JOIN consumer c       ON wo.consumer_id    = c.id
    LEFT JOIN supervisor s     ON wo.supervisor_id  = s.id
    LEFT JOIN office o         ON wo.office_id      = o.id
    LEFT JOIN area a           ON wo.area_id        = a.id
    LEFT JOIN governorate g    ON wo.governorate_id = g.id
    LEFT JOIN payment_method pm ON wo.payment_method_id = pm.id
    LEFT JOIN app_user u       ON wo.created_by     = u.id
        WHERE wo.id = $1`,
      [id]
    ),
    pool.query(
      `SELECT id, service_name_ar, service_code, quantity, unit_price,
              discount_amount, fine_amount, total_amount
         FROM work_order_item WHERE work_order_id = $1
        ORDER BY created_at`,
      [id]
    ),
  ])

  if (!woRes.rows[0]) notFound()
  const wo = woRes.rows[0]
  const items = itemsRes.rows

  // Try to also pull the consumer's default address (if exists) — gives us
  // the proper block_no / town / automated_figure that the form pulled into
  // the work order, but we keep the work-order's own street/house as source
  // of truth for what was printed.
  const addrRes = await pool.query(
    `SELECT block_no, town, street, house_no, automated_figure
       FROM consumer_address
      WHERE consumer_id = $1
      ORDER BY is_default DESC, sort_order ASC LIMIT 1`,
    [wo.consumer_id]
  )
  const addr = addrRes.rows[0]

  const block = addr?.block_no
  const town = addr?.town
  // Prefer the value saved on the work order itself; fall back to the address record
  const automatedFig = wo.automated_figure || addr?.automated_figure
  const street = wo.street || addr?.street
  const house = wo.house_no || addr?.house_no

  const totalAmount = items.reduce((s, i) => s + Number(i.total_amount), 0)
  const totalDiscount = items.reduce((s, i) => s + Number(i.discount_amount), 0)
  const netAmount = totalAmount - totalDiscount

  const printedBy = session?.fullName ?? 'admin'
  const printedAt = formatDate(new Date(), true)
  const orderDate = formatDate(wo.order_date ?? wo.created_at)

  return (
    <>
      {/* Auto-trigger print + a manual button (hidden when printing) */}
      <PrintTrigger />
      <PrintButton />

      {/* Print-specific styles — A4, hide UI chrome, print-only typography */}
      <style>{`
        @page { size: A4; margin: 12mm 14mm; }
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
        }
        .print-page { font-family: 'Cairo', 'Tahoma', 'Arial', sans-serif; color: #111; }
        .print-page h1, .print-page h2, .print-page h3 { color: #111; }
      `}</style>

      <div className="print-page mx-auto bg-white" style={{ maxWidth: '210mm', minHeight: '290mm', padding: '6mm 6mm 10mm', direction: 'rtl' }}>
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-[16px] font-bold mb-0.5">دولة الكويت</h1>
          <h2 className="text-[12px] font-semibold">وزارة الكهرباء والماء والطاقة المتجددة</h2>
        </div>

        {/* Title + top fields */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4 mb-4">
          {/* Right column (RTL first) — date / WO number */}
          <div className="text-[12px]">
            <Row label="التاريخ" value={orderDate} valueAlign="center" />
            <Row label="رقم امر العمل" value={wo.work_order_no} valueAlign="center" />
            <Row label="رقم امر عمل الوزاره" value={wo.work_order_code !== wo.work_order_no ? wo.work_order_code : ''} valueAlign="center" />
          </div>

          {/* Center — title badge */}
          <div className="text-center">
            <div className="inline-block border border-gray-700 px-8 py-1.5 text-[16px] font-bold tracking-wide">
              اصدار امر عمل
            </div>
          </div>

          {/* Left column — creator / source of order */}
          <div className="text-[12px]">
            <Row label="مصدر امر العمل" value={wo.created_by_name || ''} />
          </div>
        </div>

        {/* Consumer Info — compact 3 fields in one row */}
        <section className="mb-3">
          <h3 className="text-[13px] font-bold mb-1.5 underline underline-offset-2 decoration-gray-400">بيانات المستهلك</h3>
          <div className="grid grid-cols-3 gap-x-6">
            <Row label="الاسم" value={wo.consumer_name} />
            <Row label="الرقم المدني" value={wo.national_id} valueAlign="center" />
            <Row label="رقم التلفون" value={wo.consumer_phone} valueAlign="center" />
          </div>
        </section>

        {/* Address Info — compact one/two-line layout */}
        <section className="mb-3">
          <h3 className="text-[13px] font-bold mb-1.5 underline underline-offset-2 decoration-gray-400">عنوان امر العمل</h3>
          <div className="border border-gray-300 rounded px-3 py-1.5 text-[12px] leading-6 bg-gray-50/50">
            <CompactPair label="محافظة" value={wo.governorate_name} />
            <CompactPair label="منطقة" value={wo.area_name} />
            <CompactPair label="مكتب" value={wo.office_name} />
            <CompactPair label="قطعة" value={block} />
            <CompactPair label="جادة" value={town} />
            <CompactPair label="شارع" value={street} />
            <CompactPair label="منزل" value={house} />
            <CompactPair label="الرقم الآلي للعنوان" value={automatedFig} />
            <CompactPair label="الرقم الآلي للشقة" value={wo.consumer_apt} last />
          </div>
        </section>

        {/* Items table */}
        <section className="mb-4">
          <h3 className="text-[13px] font-bold mb-2 underline underline-offset-2 decoration-gray-400">بنود امر العمل</h3>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b-2 border-gray-700 bg-gray-100">
                <th className="border border-gray-400 px-2 py-1.5 text-center w-[80px]">رقم البند</th>
                <th className="border border-gray-400 px-2 py-1.5 text-center">وصف البند</th>
                <th className="border border-gray-400 px-2 py-1.5 text-center w-[60px]">عدد</th>
                <th className="border border-gray-400 px-2 py-1.5 text-center w-[80px]">قيمه</th>
                <th className="border border-gray-400 px-2 py-1.5 text-center w-[80px]">اجمالي</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} className="border border-gray-400 px-2 py-3 text-center text-gray-500">لا توجد بنود</td></tr>
              ) : items.map(item => (
                <tr key={item.id}>
                  <td className="border border-gray-400 px-2 py-1.5 text-center">{item.service_code || '-'}</td>
                  <td className="border border-gray-400 px-2 py-1.5">{item.service_name_ar || '-'}</td>
                  <td className="border border-gray-400 px-2 py-1.5 text-center">{item.quantity}</td>
                  <td className="border border-gray-400 px-2 py-1.5 text-center">{fmt(item.unit_price)}</td>
                  <td className="border border-gray-400 px-2 py-1.5 text-center">{fmt(item.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-2 space-y-1 text-[12px]">
            <div className="flex justify-start gap-4">
              <span className="font-medium">قيمة اجمالي البنود</span>
              <span>{fmt(totalAmount)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-start gap-4">
                <span className="font-medium">قيمة اجمالي البنود بعد الخصم</span>
                <span>{fmt(netAmount)}</span>
              </div>
            )}
          </div>
        </section>

        {/* Meters — only render if any value present, 4 columns */}
        {(wo.electricity_meter_old_no || wo.electricity_meter_new_no || wo.electricity_old_reading != null || wo.electricity_new_reading != null
          || wo.water_meter_old_no || wo.water_meter_new_no || wo.water_old_reading != null || wo.water_new_reading != null) && (
          <section className="mb-3">
            <h3 className="text-[13px] font-bold mb-1.5 underline underline-offset-2 decoration-gray-400">بيانات عدادات عنوان امر العمل</h3>
            <div className="grid grid-cols-4 gap-x-4">
              <Row label="كهرباء حالي" value={wo.electricity_meter_old_no} valueAlign="center" />
              <Row label="قراءة حالية" value={wo.electricity_old_reading != null ? fmt(wo.electricity_old_reading) : ''} valueAlign="center" />
              <Row label="كهرباء جديد" value={wo.electricity_meter_new_no} valueAlign="center" />
              <Row label="قراءة جديدة" value={wo.electricity_new_reading != null ? fmt(wo.electricity_new_reading) : ''} valueAlign="center" />
              <Row label="مياه حالي" value={wo.water_meter_old_no} valueAlign="center" />
              <Row label="قراءة حالية" value={wo.water_old_reading != null ? fmt(wo.water_old_reading) : ''} valueAlign="center" />
              <Row label="مياه جديد" value={wo.water_meter_new_no} valueAlign="center" />
              <Row label="قراءة جديدة" value={wo.water_new_reading != null ? fmt(wo.water_new_reading) : ''} valueAlign="center" />
            </div>
          </section>
        )}

        {/* Signatures — compact in 3 cols */}
        <section className="mt-4 grid grid-cols-3 gap-x-6 gap-y-3 text-[12px]">
          <Row label="اسم منفذ امر العمل" value="" />
          <Row label="توقيع منفذ" value="" />
          <Row label="توقيع مراقب الشركة" value="" />
          <Row label="اسم مشرف الوزارة" value={wo.supervisor_name} />
          <Row label="توقيع مشرف الوزارة" value="" />
        </section>

        {/* Footer */}
        <div className="absolute bottom-4 inset-x-6 text-[10px] text-gray-600 flex justify-between" style={{ position: 'fixed', bottom: '6mm', left: '14mm', right: '14mm' }}>
          <span>تاريخ الطباعة {printedAt} / بواسطة {printedBy}</span>
          <span>صفحة 1 من 1</span>
        </div>
      </div>
    </>
  )
}
