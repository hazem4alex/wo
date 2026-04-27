'use client'
import { useEffect } from 'react'

/** Auto-triggers the browser print dialog once the page has rendered. */
export function PrintTrigger({ auto = true }: { auto?: boolean }) {
  useEffect(() => {
    if (!auto) return
    // Wait one tick so fonts and layout settle before opening the dialog
    const t = setTimeout(() => window.print(), 400)
    return () => clearTimeout(t)
  }, [auto])
  return null
}

/** A small button (visible only on screen, hidden when printing) for re-triggering print. */
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="fixed top-4 left-4 z-50 print:hidden bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg shadow-lg gap-2 inline-flex items-center"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
      طباعة
    </button>
  )
}
