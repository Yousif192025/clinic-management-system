import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground mb-6">الصفحة التي تبحث عنها غير موجودة أو تم نقلها</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
