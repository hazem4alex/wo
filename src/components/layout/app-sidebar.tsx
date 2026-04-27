'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ClipboardList,
  Folder,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  MapPin,
  Map,
  Building2,
  Users,
  Wrench,
  CreditCard,
  FileBarChart,
  TrendingUp,
  UserCheck,
  PieChart,
  UserCog,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'

interface AppSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  permissions?: Record<string, boolean>
}

export function AppSidebar({ mobileOpen, onMobileClose, collapsed, onToggleCollapse, permissions = {} }: AppSidebarProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    mainFiles: true,
    reports: false,
    settings: false,
  })

  // Treat empty permissions object as "show everything" (admin / dev fallback);
  // otherwise hide items the user has no .view permission for.
  const can = (key: string) => Object.keys(permissions).length === 0 || !!permissions[key]

  const toggle = (key: string) => {
    if (collapsed) return // don't expand sections when icon-only
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const sidebarW = collapsed ? 'w-16' : 'w-64'

  return (
    <div
      className={cn(
        'fixed inset-y-0 end-0 z-40 flex flex-col overflow-y-auto transition-all duration-300 md:relative',
        sidebarW,
        mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      )}
      style={{ background: '#13151c' }}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-3 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 shrink-0 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#cd7f32,#f59e0b)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: '#cd7f32' }}>وزارة الكهرباء</div>
              <div className="text-xs truncate" style={{ color: '#4b5563' }}>والماء</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto w-8 h-8 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#cd7f32,#f59e0b)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
        )}
        {/* Desktop collapse button */}
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex shrink-0 w-6 h-6 items-center justify-center rounded hover:bg-white/10 transition-colors"
            title="طي القائمة"
          >
            <ChevronRight className="w-4 h-4" style={{ color: '#64748b' }} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex mx-auto mt-2 w-8 h-8 items-center justify-center rounded hover:bg-white/10 transition-colors shrink-0"
          title="توسيع القائمة"
        >
          <ChevronLeft className="w-4 h-4" style={{ color: '#64748b' }} />
        </button>
      )}

      {/* Navigation */}
      <nav className={cn('flex-1 py-4 space-y-1', collapsed ? 'px-1' : 'px-2')}>
        {/* Dashboard */}
        {can('dashboard.view') && (
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard className="w-4 h-4 shrink-0" />}
            label={t('dashboard')}
            isActive={isActive('/dashboard')}
            onClose={onMobileClose}
            collapsed={collapsed}
          />
        )}

        {/* Work Orders */}
        {can('work_orders.view') && (
          <div className={cn('pt-2', collapsed && 'pt-1')}>
            {!collapsed && (
              <p className="px-3 text-xs uppercase tracking-wider mb-1" style={{ color: '#374151' }}>{t('workOrders')}</p>
            )}
            <NavItem
              href="/work-orders"
              icon={<ClipboardList className="w-4 h-4 shrink-0" />}
              label={t('workOrders')}
              isActive={isActive('/work-orders')}
              onClose={onMobileClose}
              collapsed={collapsed}
            />
          </div>
        )}

        {/* Main Files — show section if user can see at least one item */}
        {(can('governorates.view') || can('areas.view') || can('offices.view') ||
          can('consumers.view') || can('services.view') || can('supervisors.view') ||
          can('settings.view')) && (
          <CollapsibleSection
            label={t('mainFiles')}
            icon={<Folder className="w-4 h-4 shrink-0" />}
            isOpen={expanded.mainFiles}
            onToggle={() => toggle('mainFiles')}
            collapsed={collapsed}
          >
            {can('governorates.view') && <NavItem href="/governorates" icon={<MapPin className="w-3.5 h-3.5 shrink-0" />} label={t('governorates')} isActive={isActive('/governorates')} indent onClose={onMobileClose} collapsed={collapsed} />}
            {can('areas.view')        && <NavItem href="/areas"        icon={<Map className="w-3.5 h-3.5 shrink-0" />}     label={t('areas')}         isActive={isActive('/areas')}        indent onClose={onMobileClose} collapsed={collapsed} />}
            {can('offices.view')      && <NavItem href="/offices"      icon={<Building2 className="w-3.5 h-3.5 shrink-0" />} label={t('offices')}     isActive={isActive('/offices')}      indent onClose={onMobileClose} collapsed={collapsed} />}
            {can('consumers.view')    && <NavItem href="/consumers"    icon={<Users className="w-3.5 h-3.5 shrink-0" />}   label={t('consumers')}     isActive={isActive('/consumers')}    indent onClose={onMobileClose} collapsed={collapsed} />}
            {can('services.view')     && <NavItem href="/services"     icon={<Wrench className="w-3.5 h-3.5 shrink-0" />}  label={t('services')}      isActive={isActive('/services')}     indent onClose={onMobileClose} collapsed={collapsed} />}
            {can('supervisors.view')  && <NavItem href="/supervisors"  icon={<UserCheck className="w-3.5 h-3.5 shrink-0" />} label={t('supervisors')} isActive={isActive('/supervisors')}  indent onClose={onMobileClose} collapsed={collapsed} />}
            {can('settings.view')     && <NavItem href="/settings/payment-methods" icon={<CreditCard className="w-3.5 h-3.5 shrink-0" />} label={t('paymentMethods')} isActive={isActive('/settings/payment-methods')} indent onClose={onMobileClose} collapsed={collapsed} />}
          </CollapsibleSection>
        )}

        {/* Reports */}
        {can('reports.view') && (
          <CollapsibleSection
            label={t('reports')}
            icon={<BarChart3 className="w-4 h-4 shrink-0" />}
            isOpen={expanded.reports}
            onToggle={() => toggle('reports')}
            collapsed={collapsed}
          >
            <NavItem href="/reports/work-orders"      icon={<FileBarChart className="w-3.5 h-3.5 shrink-0" />} label={t('workOrdersReport')}  isActive={isActive('/reports/work-orders')}      indent onClose={onMobileClose} collapsed={collapsed} />
            <NavItem href="/reports/revenue"          icon={<TrendingUp className="w-3.5 h-3.5 shrink-0" />}   label={t('revenueReport')}      isActive={isActive('/reports/revenue')}          indent onClose={onMobileClose} collapsed={collapsed} />
            <NavItem href="/reports/supervisors"      icon={<UserCheck className="w-3.5 h-3.5 shrink-0" />}    label={t('supervisorsReport')}  isActive={isActive('/reports/supervisors')}      indent onClose={onMobileClose} collapsed={collapsed} />
            <NavItem href="/reports/consumers-by-area" icon={<PieChart className="w-3.5 h-3.5 shrink-0" />}   label={t('consumersReport')}    isActive={isActive('/reports/consumers-by-area')} indent onClose={onMobileClose} collapsed={collapsed} />
          </CollapsibleSection>
        )}

        {/* Settings — Users / Roles */}
        {(can('users.view') || can('roles.view') || can('roles.edit')) && (
          <CollapsibleSection
            label={t('settings')}
            icon={<Settings className="w-4 h-4 shrink-0" />}
            isOpen={expanded.settings}
            onToggle={() => toggle('settings')}
            collapsed={collapsed}
          >
            {can('users.view') && <NavItem href="/settings/users" icon={<UserCog className="w-3.5 h-3.5 shrink-0" />}   label={t('users')} isActive={isActive('/settings/users')} indent onClose={onMobileClose} collapsed={collapsed} />}
            {(can('roles.view') || can('roles.edit')) && <NavItem href="/settings/roles" icon={<ShieldCheck className="w-3.5 h-3.5 shrink-0" />} label={t('roles')} isActive={isActive('/settings/roles')} indent onClose={onMobileClose} collapsed={collapsed} />}
          </CollapsibleSection>
        )}
      </nav>
    </div>
  )
}

function NavItem({ href, icon, label, isActive, indent, onClose, collapsed }: {
  href: string; icon: React.ReactNode; label: string
  isActive: boolean; indent?: boolean; onClose?: () => void; collapsed?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md text-sm transition-colors',
        collapsed ? 'justify-center px-2 py-2' : (indent ? 'ps-8 px-3 py-2' : 'px-3 py-2'),
        isActive
          ? 'text-[#cd7f32] bg-[rgba(205,127,50,0.12)]'
          : 'text-[#64748b] hover:bg-[#1e2130] hover:text-[#cbd5e1]'
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )
}

function CollapsibleSection({ label, icon, isOpen, onToggle, children, collapsed }: {
  label: string; icon: React.ReactNode; isOpen: boolean; onToggle: () => void
  children: React.ReactNode; collapsed?: boolean
}) {
  if (collapsed) {
    // In collapsed mode show section icon as a separator/hint only
    return (
      <div className="py-1">
        <div className="flex justify-center py-1" title={label}>
          <span className="text-[#374151]">{icon}</span>
        </div>
        {/* Show all children as icon-only items */}
        <div className="space-y-0.5">{children}</div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-colors text-[#64748b] hover:bg-[#1e2130] hover:text-[#cbd5e1]"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isOpen ? 'rotate-180' : '')} />
      </button>
      {isOpen && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  )
}
