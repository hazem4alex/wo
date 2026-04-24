'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-bold text-red-600">حدث خطأ غير متوقع</h2>
      <p className="text-gray-500 text-sm">{error.message}</p>
      <Button onClick={unstable_retry}>إعادة المحاولة</Button>
    </div>
  )
}
