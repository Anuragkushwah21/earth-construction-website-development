import 'server-only'

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import connectToDatabase from '@/lib/db'
import Admin from '@/lib/models/admin'
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionToken,
  verifySessionClaims,
} from '@/lib/session'
import type { AdminSession } from '@/lib/types'

const BCRYPT_ROUNDS = 12

/** How long a password reset link stays usable. */
export const RESET_TOKEN_TTL_MINUTES = 60

export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

/**
 * Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD when the
 * collection is still empty. Credentials only ever live in env vars — never in
 * source or in anything sent to the browser.
 */
export async function ensureInitialAdmin() {
  await connectToDatabase()

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return null

  const existing = await Admin.findOne({ email })
  if (existing) return existing

  const count = await Admin.countDocuments()
  if (count > 0) return null

  return Admin.create({
    email,
    name: process.env.ADMIN_NAME?.trim() || 'Administrator',
    passwordHash: await hashPassword(password),
  })
}

export async function authenticateAdmin(email: string, password: string): Promise<AdminSession | null> {
  await connectToDatabase()
  await ensureInitialAdmin()

  const admin = await Admin.findOne({ email: email.trim().toLowerCase() })
  if (!admin) {
    // Burn roughly the same time as a real comparison so a missing account and
    // a wrong password are not distinguishable by response timing.
    await bcrypt.compare(password, '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin')
    return null
  }

  const valid = await verifyPassword(password, admin.passwordHash)
  if (!valid) return null

  admin.lastLoginAt = new Date()
  await admin.save()

  return { id: String(admin._id), email: admin.email, name: admin.name ?? 'Administrator' }
}

export async function createSession(session: AdminSession) {
  const token = await signSessionToken(session)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, sessionCookieOptions())
}

export async function destroySession() {
  const store = await cookies()
  store.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 })
}

/**
 * Reads the session cookie and confirms it is still current: a cookie minted
 * before the account's last password change is refused, so resetting a
 * password signs out every other device. `middleware.ts` cannot do this check
 * (no database on the edge runtime), which is why it runs here too.
 */
export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  const claims = await verifySessionClaims(token)
  if (!claims) return null

  await connectToDatabase()
  const admin = await Admin.findById(claims.session.id).select('passwordChangedAt').lean()
  if (!admin) return null

  // Compared in whole seconds because a JWT `iat` is second-granular and
  // rounds down: a cookie minted in the same second as the password change
  // would otherwise look older than it and lock the account out of itself.
  if (admin.passwordChangedAt) {
    const changedAt = Math.floor(admin.passwordChangedAt.getTime() / 1000)
    const issuedAt = Math.floor(claims.issuedAt / 1000)
    if (changedAt > issuedAt) return null
  }

  return claims.session
}

/** Throws `UnauthorizedError` when there is no valid admin session. */
export async function requireSession(): Promise<AdminSession> {
  const session = await getSession()
  if (!session) throw new UnauthorizedError()
  return session
}

/* ------------------------------------------------------- password changes -- */

/**
 * Changes the password of a signed-in admin. The current password is required
 * so that a hijacked, still-open session cannot lock the real owner out.
 */
export async function changeAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true; session: AdminSession } | { ok: false; reason: 'not-found' | 'wrong-password' }> {
  await connectToDatabase()

  const admin = await Admin.findById(adminId)
  if (!admin) return { ok: false, reason: 'not-found' }

  if (!(await verifyPassword(currentPassword, admin.passwordHash))) {
    return { ok: false, reason: 'wrong-password' }
  }

  admin.passwordHash = await hashPassword(newPassword)
  admin.passwordChangedAt = new Date()
  admin.resetTokenHash = null
  admin.resetTokenExpiresAt = null
  await admin.save()

  return {
    ok: true,
    session: { id: String(admin._id), email: admin.email, name: admin.name ?? 'Administrator' },
  }
}

/* -------------------------------------------------------- password resets -- */

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Issues a single-use reset token for an email address. Returns `null` when no
 * such admin exists — callers must still answer the browser identically either
 * way, so the form cannot be used to discover which addresses are registered.
 */
export async function createPasswordResetToken(email: string) {
  await connectToDatabase()

  const admin = await Admin.findOne({ email: email.trim().toLowerCase() })
  if (!admin) return null

  const token = randomBytes(32).toString('base64url')
  admin.resetTokenHash = hashResetToken(token)
  admin.resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000)
  await admin.save()

  return { token, email: admin.email, name: admin.name ?? '' }
}

/** Looks up the admin a reset token belongs to, or `null` if it is unusable. */
export async function findAdminByResetToken(token: string) {
  await connectToDatabase()

  const candidate = token.trim()
  if (!candidate) return null

  const admin = await Admin.findOne({ resetTokenHash: hashResetToken(candidate) })
  if (!admin || !admin.resetTokenHash || !admin.resetTokenExpiresAt) return null
  if (admin.resetTokenExpiresAt.getTime() < Date.now()) return null

  // The lookup above already matched on the digest; this constant-time compare
  // keeps the comparison itself free of early-exit timing differences.
  const provided = Buffer.from(hashResetToken(candidate))
  const stored = Buffer.from(admin.resetTokenHash)
  if (provided.length !== stored.length || !timingSafeEqual(provided, stored)) return null

  return admin
}

export async function isResetTokenValid(token: string) {
  return Boolean(await findAdminByResetToken(token))
}

/** Consumes a reset token and sets the new password. */
export async function resetPasswordWithToken(token: string, newPassword: string) {
  const admin = await findAdminByResetToken(token)
  if (!admin) return { ok: false as const }

  admin.passwordHash = await hashPassword(newPassword)
  admin.passwordChangedAt = new Date()
  admin.resetTokenHash = null
  admin.resetTokenExpiresAt = null
  await admin.save()

  return { ok: true as const, email: admin.email }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required.') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}
