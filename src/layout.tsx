import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/shared/providers'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'نظام إدارة العيادات', template: '%s | نظام إدارة العيادات' },
  description: 'نظام متكامل لإدارة العيادات الطبية - المرضى والمواعيد والفواتير',
  keywords: ['عيادة', 'طبي', 'مواعيد', 'مرضى', 'فواتير'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
