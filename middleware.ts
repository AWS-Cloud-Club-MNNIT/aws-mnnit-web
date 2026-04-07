import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLoginRoute = pathname === '/admin/login'
  const isManagerRoute = pathname.startsWith('/manager')
  const isManagerLoginRoute = pathname === '/manager/login'
  const isApiRoute = pathname.startsWith('/api/')

  const adminCookie = request.cookies.get('admin_token')
  const managerCookie = request.cookies.get('manager_token')
  
  const isAdminAuthenticated = adminCookie && adminCookie.value === (process.env.ADMIN_PASSWORD || 'awsmnnit')
  const isManagerAuthenticated = managerCookie && managerCookie.value === (process.env.MANAGER_PASSWORD || 'scdmanagermnnit@2026')

  // Protect Admin Routes
  if (isAdminRoute && !isAdminLoginRoute) {
    if (!isAdminAuthenticated) return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  if (isAdminLoginRoute && isAdminAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Protect Manager Routes
  if (isManagerRoute && !isManagerLoginRoute) {
    if (!isManagerAuthenticated && !isAdminAuthenticated) return NextResponse.redirect(new URL('/manager/login', request.url))
  }
  if (isManagerLoginRoute && isManagerAuthenticated) {
    return NextResponse.redirect(new URL('/manager/participants', request.url))
  }

  // Protect ALL API mutations automatically (except public endpoints)
  if (isApiRoute && request.method !== 'GET') {
    const isPublicMutation = pathname === '/api/participants/find'
    if (!isPublicMutation && !isAdminAuthenticated && !isManagerAuthenticated) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized Access' }), { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/manager/:path*', '/manager', '/api/:path*'],
}
