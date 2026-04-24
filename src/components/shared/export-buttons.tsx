'use client'

import { Button } from '@/components/ui/button'
import { FileDown, FileSpreadsheet } from 'lucide-react'

export function ExportButtons({ tableId, filename }: { tableId: string; filename: string }) {
  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')
    const element = document.getElementById(tableId)
    if (!element) return
    const canvas = await html2canvas(element, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const width = pdf.internal.pageSize.getWidth()
    const height = (canvas.height / canvas.width) * width
    pdf.addImage(imgData, 'PNG', 0, 0, width, height)
    pdf.save(`${filename}.pdf`)
  }

  const exportExcel = async () => {
    const { utils, writeFile } = await import('xlsx')
    const table = document.getElementById(tableId)
    if (!table) return
    const wb = utils.book_new()
    const ws = utils.table_to_sheet(table)
    utils.book_append_sheet(wb, ws, 'Sheet1')
    writeFile(wb, `${filename}.xlsx`)
  }

  return (
    <div className="flex gap-2">
      <Button onClick={exportExcel} className="bg-green-600 hover:bg-green-700 text-white gap-2">
        <FileSpreadsheet className="w-4 h-4" /> تصدير إلى Excel
      </Button>
      <Button onClick={exportPDF} className="bg-red-600 hover:bg-red-700 text-white gap-2">
        <FileDown className="w-4 h-4" /> تحميل PDF
      </Button>
    </div>
  )
}
