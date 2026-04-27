// Minimal layout for printable pages — no sidebar, no top bar.
// Inherits the html/body from the root layout. The page itself renders
// in a clean A4-sized canvas with print-specific CSS.
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="print-root bg-white text-black min-h-screen">
      {children}
    </div>
  )
}
