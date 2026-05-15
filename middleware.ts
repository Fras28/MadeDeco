import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'
import { COOKIE_NAME } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Proteger rutas admin (excepto el login)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token || !(await verifyAdminToken(token))) {
      const loginUrl = new URL('/admin', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Proteger API admin
  if (pathname.startsWith('/api/admin') && !pathname.includes('/login')) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
