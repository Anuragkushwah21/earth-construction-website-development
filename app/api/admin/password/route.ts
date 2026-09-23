import { changeAdminPassword, createSession } from '@/lib/auth'
import { parseBody, withAdmin } from '@/lib/api'
import { clientIp, jsonError, jsonOk, rateLimit } from '@/lib/security'
import { changePasswordSchema } from '@/lib/validation'

export const runtime = 'nodejs'

/** Changes the signed-in admin's own password. */
export const POST = withAdmin(async ({ request, session }) => {
  const limit = rateLimit(`password:${clientIp(request)}`, 8, 15 * 60 * 1000)
  if (!limit.allowed) {
    return jsonError(`Too many attempts. Try again in ${limit.retryAfterSeconds} seconds.`, 429, {
      retryAfterSeconds: limit.retryAfterSeconds,
    })
  }

  const parsed = await parseBody(request, changePasswordSchema)
  if (!parsed.ok) return parsed.response

  const result = await changeAdminPassword(
    session.id,
    parsed.data.currentPassword,
    parsed.data.newPassword,
  )

  if (!result.ok) {
    if (result.reason === 'wrong-password') {
      return jsonError('Please check the highlighted fields.', 400, {
        fields: { currentPassword: 'That is not your current password.' },
      })
    }
    return jsonError('Your account could not be found. Sign in again.', 401)
  }

  // Changing the password retires every session issued before now, including
  // this one, so mint a fresh cookie to keep the current browser signed in.
  await createSession(result.session)

  return jsonOk({ message: 'Password updated. Other devices have been signed out.' })
})
