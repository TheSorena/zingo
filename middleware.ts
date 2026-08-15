import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken, adminCookieName } from './lib/admin'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Handle CORS for API routes
  if (path.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
    response.headers.set('Access-Control-Allow-Headers', '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400')
    return response
  }

  // Protect admin API routes (the /admin page itself handles auth client-side)
  const isAdminApi = path.startsWith('/api/admin') && !path.startsWith('/api/admin/login')

  if (isAdminApi) {
    const token = request.cookies.get(adminCookieName)?.value
    const isValid = await verifyAdminToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/:path*'
  ],
}