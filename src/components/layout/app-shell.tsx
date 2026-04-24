'use client'
import { useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { TopBar } from './top-bar'

interface AppShellProps {
  locale: string
  theme: string
  userName: string
  systemName: string
  children: React.ReactNode
}

export function AppShell({ locale, theme, userName, systemName, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          locale={locale}
          theme={theme}
          userName={userName}
          systemName={systemName}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
