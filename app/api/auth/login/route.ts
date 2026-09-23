import { authenticateAdmin, createSession } from '@/lib/auth'
import { handleUnexpected, parseBody } from '@/lib/api'
import { clientIp, isSameOrigin, jsonError, jsonOk, rateLimit } from '@/lib/security'
import { loginSchema } from '@/lib/validation'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return jsonError('Request origin not allowed.', 403)
    }

    // Throttle credential guessing: 8 attempts per IP per 10 minutes.
    const limit = rateLimit(`login:${clientIp(request)}`, 8, 10 * 60 * 1000)
    if (!limit.allowed) {
      return jsonError(
        `Too many sign-in attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
        429,
        { retryAfterSeconds: limit.retryAfterSeconds },
      )
    }

    const parsed = await parseBody(request, loginSchema)
    if (!parsed.ok) return parsed.response

    const session = await authenticateAdmin(parsed.data.email, parsed.data.password)
    if (!session) {
      return jsonError('Invalid email or password.', 401)
    }

    await createSession(session)
    return jsonOk({ session })
  } catch (error) {
    return handleUnexpected(error)
  }
}
