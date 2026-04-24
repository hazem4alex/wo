import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'نظام إدارة الكهرباء',
  description: 'Kuwait Electricity Work Order Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
