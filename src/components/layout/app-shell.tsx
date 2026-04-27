'use client'
import { useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { TopBar } from './top-bar'

interface AppShellProps {
  locale: string
  theme: string
  userName: string
  systemName: string
  permissions: Record<string, boolean>
  children: React.ReactNode
}

export function AppShell({ locale, theme, userName, systemName, permissions, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <AppSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        permissions={permissions}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          locale={locale}
          theme={theme}
          userName={userName}
          systemName={systemName}
          onMenuClick={() => setMobileOpen(m => !m)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 bg-background sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
