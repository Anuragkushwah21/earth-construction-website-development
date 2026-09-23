import { destroySession } from '@/lib/auth'
import { handleUnexpected } from '@/lib/api'
import { isSameOrigin, jsonError, jsonOk } from '@/lib/security'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return jsonError('Request origin not allowed.', 403)
    }
    await destroySession()
    return jsonOk({ success: true })
  } catch (error) {
    return handleUnexpected(error)
  }
}
