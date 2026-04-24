'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Folder,
  Search,
  Building2,
  BarChart3,
  Settings,
  ChevronDown,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

interface AppSidebarProps {
  open?: boolean
  onClose?: () => void
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    mainFiles: false,
    searchFiles: true,
    reports: false,
    settings: false,
  })

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className={`fixed inset-y-0 end-0 z-40 w-64 bg-[#0f172a] flex flex-col overflow-y-auto transition-transform duration-300 md:relative md:translate-x-0 ${open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700">
        <div className="w-8 h-8 bg-amber-400 rounded flex items-center justify-center">
          <Zap className="w-5 h-5 text-slate-900" />
        </div>
        <span className="text-white font-bold text-sm">ALSHAMEL</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {/* Dashboard */}
        <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label={t('dashboard')} isActive={isActive('/dashboard')} onClose={onClose} />

        {/* Work Orders */}
        <div className="pt-2">
          <p className="px-3 text-xs text-slate-500 uppercase tracking-wider mb-1">{t('workOrders')}</p>
          <NavLink href="/work-orders" icon={<ClipboardList className="w-4 h-4" />} label={t('workOrders')} isActive={isActive('/work-orders') && !pathname.startsWith('/work-orders/new')} onClose={onClose} />
          <NavLink href="/work-orders/new" icon={<PlusCircle className="w-4 h-4" />} label={t('addWorkOrder')} isActive={isActive('/work-orders/new')} onClose={onClose} />
        </div>

        {/* Main Files */}
        <CollapsibleNav
          label={t('mainFiles')}
          icon={<Folder className="w-4 h-4" />}
          isOpen={expanded.mainFiles}
          onToggle={() => toggle('mainFiles')}
        >
          <NavLink href="/governorates" label={t('governorates')} isActive={isActive('/governorates')} indent onClose={onClose} />
          <NavLink href="/areas" label={t('areas')} isActive={isActive('/areas')} indent onClose={onClose} />
          <NavLink href="/offices" label={t('offices')} isActive={isActive('/offices')} indent onClose={onClose} />
        </CollapsibleNav>

        {/* Search Files */}
        <CollapsibleNav
          label={t('searchFiles')}
          icon={<Search className="w-4 h-4" />}
          isOpen={expanded.searchFiles}
          onToggle={() => toggle('searchFiles')}
        >
          <NavLink href="/consumers" label={t('consumers')} isActive={isActive('/consumers')} indent onClose={onClose} />
          <NavLink href="/services" label={t('services')} isActive={isActive('/services')} indent onClose={onClose} />
          <NavLink href="/supervisors" label={t('supervisors')} isActive={isActive('/supervisors')} indent onClose={onClose} />
          <NavLink href="/offices" label={t('offices')} isActive={isActive('/offices')} indent onClose={onClose} />
        </CollapsibleNav>

        {/* Reports */}
        <CollapsibleNav
          label={t('reports')}
          icon={<BarChart3 className="w-4 h-4" />}
          isOpen={expanded.reports}
          onToggle={() => toggle('reports')}
        >
          <NavLink href="/reports/work-orders" label={t('workOrdersReport')} isActive={isActive('/reports/work-orders')} indent onClose={onClose} />
          <NavLink href="/reports/revenue" label={t('revenueReport')} isActive={isActive('/reports/revenue')} indent onClose={onClose} />
          <NavLink href="/reports/supervisors" label={t('supervisorsReport')} isActive={isActive('/reports/supervisors')} indent onClose={onClose} />
          <NavLink href="/reports/consumers-by-area" label={t('consumersReport')} isActive={isActive('/reports/consumers-by-area')} indent onClose={onClose} />
        </CollapsibleNav>

        {/* Settings */}
        <CollapsibleNav
          label={t('settings')}
          icon={<Settings className="w-4 h-4" />}
          isOpen={expanded.settings}
          onToggle={() => toggle('settings')}
        >
          <NavLink href="/settings/users" label={t('users')} isActive={isActive('/settings/users')} indent onClose={onClose} />
          <NavLink href="/settings/roles" label={t('roles')} isActive={isActive('/settings/roles')} indent onClose={onClose} />
          <NavLink href="/settings/payment-methods" label={t('paymentMethods')} isActive={isActive('/settings/payment-methods')} indent onClose={onClose} />
        </CollapsibleNav>
      </nav>
    </div>
  )
}

function NavLink({ href, icon, label, isActive, indent, onClose }: {
  href: string
  icon?: React.ReactNode
  label: string
  isActive: boolean
  indent?: boolean
  onClose?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
        indent ? 'ps-8' : '',
        isActive
          ? 'bg-blue-700 text-white'
          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </Link>
  )
}

function CollapsibleNav({ label, icon, isOpen, onToggle, children }: {
  label: string
  icon: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen ? 'rotate-180' : '')} />
      </button>
      {isOpen && <div className="mt-1 space-y-1">{children}</div>}
    </div>
  )
}
