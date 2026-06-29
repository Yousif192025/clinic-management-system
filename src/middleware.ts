export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patients/:path*',
    '/doctors/:path*',
    '/appointments/:path*',
    '/medical-records/:path*',
    '/invoices/:path*',
    '/reports/:path*',
    '/users/:path*',
    '/settings/:path*',
  ],
}
