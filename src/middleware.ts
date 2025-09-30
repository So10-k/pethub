import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only skip maintenance check for these critical paths
  const skipPaths = [
    '/api/auth',           // Auth endpoints must work
    '/api/maintenance',    // Maintenance status check
    '/maintenance',        // The maintenance page itself
    '/_next',              // Next.js internals
    '/favicon.ico',        // Favicon
    '/manifest.json',      // PWA manifest
    '/icon-',              // App icons
  ]

  if (skipPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check maintenance mode
  try {
    const maintenanceRes = await fetch(`${request.nextUrl.origin}/api/maintenance/status`, {
      headers: {
        'x-middleware-request': 'true',
      },
    })
    
    if (maintenanceRes.ok) {
      const { isActive, whitelistedUserIds } = await maintenanceRes.json()
      
      if (isActive) {
        // Check if user is whitelisted
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
        const userId = token?.sub
        
        if (!userId || !whitelistedUserIds.includes(userId)) {
          // Redirect to maintenance page
          return NextResponse.redirect(new URL('/maintenance', request.url))
        }
      }
    }
  } catch (error) {
    console.error('Maintenance check error:', error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
