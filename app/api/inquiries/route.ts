import connectToDatabase from '@/lib/db'
import InquiryModel from '@/lib/models/inquiry'
import { handleUnexpected, parseBody } from '@/lib/api'
import { clientIp, isSameOrigin, jsonError, jsonOk, rateLimit, sanitizeText } from '@/lib/security'
import { inquirySchema } from '@/lib/validation'

export const runtime = 'nodejs'

/** Public endpoint: the visitor-facing contact and inquiry form posts here. */
export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return jsonError('Request origin not allowed.', 403)
    }

    const ip = clientIp(request)
    // 5 inquiries per IP per hour is generous for a real visitor and a hard
    // stop for a script hammering the form.
    const limit = rateLimit(`inquiry:${ip}`, 5, 60 * 60 * 1000)
    if (!limit.allowed) {
      return jsonError(
        'You have sent several inquiries already. Please call us directly or try again later.',
        429,
        { retryAfterSeconds: limit.retryAfterSeconds },
      )
    }

    const parsed = await parseBody(request, inquirySchema)
    if (!parsed.ok) return parsed.response

    // Honeypot: a filled hidden field means a bot. Respond as if it worked so
    // the bot does not learn to work around the check.
    if (parsed.data.website.trim()) {
      return jsonOk({ success: true }, 201)
    }

    await connectToDatabase()
    await InquiryModel.create({
      name: sanitizeText(parsed.data.name, 120),
      email: parsed.data.email,
      phone: sanitizeText(parsed.data.phone, 30),
      subject: sanitizeText(parsed.data.subject, 180) || 'Website inquiry',
      message: sanitizeText(parsed.data.message, 4000),
      projectType: sanitizeText(parsed.data.projectType, 120),
      location: sanitizeText(parsed.data.location, 160),
      status: 'New',
      read: false,
      sourceIp: ip,
    })

    return jsonOk(
      { success: true, message: 'Thank you. Your inquiry has been received and our team will be in touch.' },
      201,
    )
  } catch (error) {
    return handleUnexpected(error)
  }
}
