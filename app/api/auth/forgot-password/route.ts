import { createPasswordResetToken, RESET_TOKEN_TTL_MINUTES } from '@/lib/auth'
import { handleUnexpected, parseBody } from '@/lib/api'
import { passwordResetEmail, sendMail, verifyMailConnection } from '@/lib/mailer'
import { clientIp, isSameOrigin, jsonError, jsonOk, rateLimit } from '@/lib/security'
import { forgotPasswordSchema } from '@/lib/validation'

export const runtime = 'nodejs'

function resetUrl(request: Request, token: string) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const base = configured || new URL(request.url).origin
  const url = new URL('/admin/reset-password', base)
  url.searchParams.set('token', token)
  return url.toString()
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return jsonError('Request origin not allowed.', 403)
    }

    // Reset mail is expensive and abusable: 4 requests per IP per 15 minutes.
    const limit = rateLimit(`forgot:${clientIp(request)}`, 4, 15 * 60 * 1000)
    if (!limit.allowed) {
      return jsonError(
        `Too many reset requests. Try again in ${limit.retryAfterSeconds} seconds.`,
        429,
        { retryAfterSeconds: limit.retryAfterSeconds },
      )
    }

    const parsed = await parseBody(request, forgotPasswordSchema)
    if (!parsed.ok) return parsed.response

    // Check SMTP before issuing a token. This prevents the UI from claiming a
    // link is on its way when the mail account is unavailable, while returning
    // the same response for every submitted address keeps admin accounts
    // undiscoverable.
    const mailConnection = await verifyMailConnection()
    if (!mailConnection.delivered) {
      return jsonError('Password reset email is temporarily unavailable. Please try again later.', 503)
    }

    const issued = await createPasswordResetToken(parsed.data.email)

    if (issued) {
      const url = resetUrl(request, issued.token)
      const { text, html } = passwordResetEmail({
        name: issued.name,
        url,
        minutes: RESET_TOKEN_TTL_MINUTES,
      })
      await sendMail({
        to: issued.email,
        subject: 'Reset your Earth Construction admin password',
        text,
        html,
      })
    }

    // Always the same answer, whether or not the address is registered, so
    // this endpoint cannot be used to enumerate admin accounts. Delivery
    // problems are logged server-side rather than reported here.
    return jsonOk({
      message: 'If that email belongs to an admin account, a reset link is on its way.',
    })
  } catch (error) {
    return handleUnexpected(error)
  }
}
