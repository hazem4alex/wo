'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-bold text-red-600">حدث خطأ غير متوقع</h2>
      <p className="text-gray-500 text-sm">يُرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني</p>
      {error.digest && <p className="text-xs text-gray-400 font-mono">{error.digest}</p>}
      <Button onClick={reset}>إعادة المحاولة</Button>
    </div>
  )
}
