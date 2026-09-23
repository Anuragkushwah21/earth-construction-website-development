import { getSession } from '@/lib/auth'
import { handleUnexpected } from '@/lib/api'
import { jsonOk } from '@/lib/security'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await getSession()
    return jsonOk({ session })
  } catch (error) {
    return handleUnexpected(error)
  }
}
