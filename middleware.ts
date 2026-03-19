import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/admin/login'
  const isApiRoute = pathname.startsWith('/api/')

  const authCookie = request.cookies.get('admin_token')
  const isAuthenticated = authCookie && authCookie.value === (process.env.ADMIN_PASSWORD || 'awsmnnit')

  if (isAdminRoute && !isLoginRoute) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isLoginRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Protect ALL API mutations automatically
  if (isApiRoute && request.method !== 'GET') {
    if (!isAuthenticated) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized Access' }), { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/api/:path*'],
}
