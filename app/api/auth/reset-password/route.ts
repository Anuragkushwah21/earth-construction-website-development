import { destroySession, resetPasswordWithToken } from '@/lib/auth'
import { handleUnexpected, parseBody } from '@/lib/api'
import { clientIp, isSameOrigin, jsonError, jsonOk, rateLimit } from '@/lib/security'
import { resetPasswordSchema } from '@/lib/validation'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return jsonError('Request origin not allowed.', 403)
    }

    // Tokens are 256-bit, so this only needs to stop bulk guessing.
    const limit = rateLimit(`reset:${clientIp(request)}`, 10, 15 * 60 * 1000)
    if (!limit.allowed) {
      return jsonError(
        `Too many attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
        429,
        { retryAfterSeconds: limit.retryAfterSeconds },
      )
    }

    const parsed = await parseBody(request, resetPasswordSchema)
    if (!parsed.ok) return parsed.response

    const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password)
    if (!result.ok) {
      return jsonError('This reset link has expired or has already been used.', 400)
    }

    // The new password invalidates every existing session; clear this
    // browser's cookie too so the next step is a clean sign-in.
    await destroySession()

    return jsonOk({ message: 'Password updated. You can sign in with the new password.' })
  } catch (error) {
    return handleUnexpected(error)
  }
}
