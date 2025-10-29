import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Log all requests to /api/auth for debugging
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    console.log('Auth request:', {
      pathname: request.nextUrl.pathname,
      method: request.method,
      headers: {
        referer: request.headers.get('referer'),
        'user-agent': request.headers.get('user-agent'),
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/auth/:path*',
}