'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

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
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-muted-foreground text-sm mb-5">
          {error.message || 'يرجى المحاولة مرة أخرى'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
        >
          حاول مجدداً
        </button>
      </div>
    </div>
  )
}
