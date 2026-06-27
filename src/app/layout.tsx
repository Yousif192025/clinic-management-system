import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-4 shadow-lg shadow-primary/30">
            <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">نظام إدارة العيادات</h1>
          <p className="text-muted-foreground text-sm mt-1">منصة طبية متكاملة واحترافية</p>
        </div>
        {children}
      </div>
    </div>
  )
}
