import { auth } from '@/lib/auth/config'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Public routes
  const publicRoutes = ['/login', '/register']
  if (publicRoutes.some(r => pathname.startsWith(r))) {
    if (isAuthenticated) return NextResponse.redirect(new URL('/dashboard', req.url))
    return NextResponse.next()
  }

  // Protected routes
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Role-based protection
  const role = req.auth?.user?.role
  const adminOnlyRoutes = ['/reports', '/users']
  if (adminOnlyRoutes.some(r => pathname.startsWith(r)) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
