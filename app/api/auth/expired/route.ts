import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth'

export const runtime = 'nodejs'

/**
 * Lands here when a cookie is well-formed but no longer current — typically
 * after a password change revoked the sessions issued before it.
 *
 * `middleware.ts` can only check the signature, so it still treats such a
 * cookie as valid and bounces the holder back to the dashboard; the dashboard
 * then bounces them out again. Clearing the cookie breaks that loop, and a
 * route handler is the only place allowed to write cookies during a redirect.
 */
export async function GET(request: Request) {
  await destroySession()

  const next = new URL(request.url).searchParams.get('next')
  const loginUrl = new URL('/admin/login', request.url)
  // Only same-site dashboard paths, so this cannot be used as an open redirect.
  if (next && next.startsWith('/admin') && !next.startsWith('//')) {
    loginUrl.searchParams.set('next', next)
  }

  return NextResponse.redirect(loginUrl)
}
