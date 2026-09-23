import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken, adminCookieName } from './lib/admin'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith('/api/')) {
    // Protect admin API routes BEFORE the generic CORS passthrough
    const isAdminApi =
      path.startsWith('/api/admin') && !path.startsWith('/api/admin/login')

    if (isAdminApi && request.method !== 'OPTIONS') {
      const token = request.cookies.get(adminCookieName)?.value
      const isValid = await verifyAdminToken(token)
      if (!isValid) {
        return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
      }
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: CORS_HEADERS })
    }

    const response = NextResponse.next()
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      response.headers.set(key, value)
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/:path*'
  ],
}
