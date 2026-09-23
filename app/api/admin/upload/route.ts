import { requireSession, UnauthorizedError } from '@/lib/auth'
import { handleUnexpected } from '@/lib/api'
import { clientIp, isSameOrigin, jsonError, jsonOk, rateLimit } from '@/lib/security'
import { MAX_UPLOAD_BYTES, UploadError, uploadImage, uploadProvider } from '@/lib/upload'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return jsonError('Request origin not allowed.', 403)
    }

    const session = await requireSession()

    const limit = rateLimit(`upload:${session.id}:${clientIp(request)}`, 60, 10 * 60 * 1000)
    if (!limit.allowed) {
      return jsonError('Too many uploads in a short time. Please wait a moment.', 429)
    }

    const contentLength = Number(request.headers.get('content-length') ?? 0)
    if (contentLength && contentLength > MAX_UPLOAD_BYTES + 1024 * 100) {
      return jsonError('Image is too large. Maximum size is 5 MB.', 413)
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const folder = String(formData.get('folder') ?? 'general')

    if (!(file instanceof File)) {
      return jsonError('No image file was provided.', 400)
    }

    const result = await uploadImage(file, folder)
    return jsonOk(result, 201)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError('You need to sign in to upload images.', 401)
    }
    if (error instanceof UploadError) {
      return jsonError(error.message, error.status)
    }
    return handleUnexpected(error)
  }
}

export async function GET() {
  try {
    await requireSession()
    return jsonOk({ provider: uploadProvider(), maxBytes: MAX_UPLOAD_BYTES })
  } catch {
    return jsonError('You need to sign in to do that.', 401)
  }
}
