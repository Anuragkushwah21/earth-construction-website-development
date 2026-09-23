import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

/** Pages a signed-out admin must be able to reach to get back in. */
const PUBLIC_ADMIN_PATHS = new Set([
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
])

/**
 * Gate for everything under /admin. The dashboard is never rendered without a
 * valid session cookie, and each API route re-checks the session itself so the
 * middleware is a first line of defence rather than the only one.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = token ? await verifySessionToken(token) : null

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    // Someone already signed in has no use for these; send them to the
    // dashboard instead. Finishing a reset clears the cookie first, so this
    // does not strand anyone mid-flow.
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  if (!session) {
    const loginUrl = new URL('/admin/login', request.url)
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('next', `${pathname}${search}`)
    }
    const response = NextResponse.redirect(loginUrl)
    // Clear an expired or tampered cookie so the browser stops re-sending it.
    if (token) response.cookies.delete(SESSION_COOKIE)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
