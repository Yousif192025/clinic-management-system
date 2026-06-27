import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
