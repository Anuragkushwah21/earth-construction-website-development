import { handleUnexpected, searchParams } from '@/lib/api'
import { getPublishedWorks } from '@/lib/data'
import { jsonOk } from '@/lib/security'

export const runtime = 'nodejs'

/** Public, read-only listing of published projects. */
export async function GET(request: Request) {
  try {
    const params = searchParams(request)
    const result = await getPublishedWorks({
      search: params.get('search') ?? undefined,
      category: params.get('category') ?? undefined,
      location: params.get('location') ?? undefined,
      status: params.get('status') ?? undefined,
      featuredOnly: params.get('featured') === 'true',
      page: Number(params.get('page') ?? 1),
      limit: Number(params.get('limit') ?? 9),
    })
    return jsonOk(result)
  } catch (error) {
    return handleUnexpected(error)
  }
}
