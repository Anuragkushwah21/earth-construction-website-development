import { SignJWT, jwtVerify } from 'jose'
import type { AdminSession } from '@/lib/types'

export const SESSION_COOKIE = 'ecc_admin_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

/**
 * Edge-safe session helpers. `middleware.ts` runs on the edge runtime, so this
 * module must stay free of `bcryptjs`, `mongoose` and other Node-only code.
 */

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET is missing or too short. Set a random string of at least 32 characters in .env.local.',
    )
  }
  return new TextEncoder().encode(secret)
}

export async function signSessionToken(session: AdminSession) {
  return new SignJWT({ email: session.email, name: session.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.id)
    .setIssuedAt()
    .setIssuer('earth-construction')
    .setAudience('earth-construction-admin')
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret())
}

/**
 * Verifies the cookie and also reports when it was issued, which lets the
 * Node-side session check reject tokens minted before a password change.
 */
export async function verifySessionClaims(
  token: string,
): Promise<{ session: AdminSession; issuedAt: number } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: 'earth-construction',
      audience: 'earth-construction-admin',
    })
    if (!payload.sub) return null
    return {
      session: {
        id: String(payload.sub),
        email: String(payload.email ?? ''),
        name: String(payload.name ?? 'Administrator'),
      },
      // `iat` is in seconds; missing means "treat as ancient" so a token
      // without one cannot outlive a password change.
      issuedAt: typeof payload.iat === 'number' ? payload.iat * 1000 : 0,
    }
  } catch {
    return null
  }
}

export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  const claims = await verifySessionClaims(token)
  return claims?.session ?? null
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}
