import { handleUnexpected, searchParams } from '@/lib/api'
import { getPublishedMachines } from '@/lib/data'
import { jsonOk } from '@/lib/security'

export const runtime = 'nodejs'

/** Public, read-only listing of published machines. */
export async function GET(request: Request) {
  try {
    const params = searchParams(request)
    const result = await getPublishedMachines({
      search: params.get('search') ?? undefined,
      category: params.get('category') ?? undefined,
      availability: params.get('availability') ?? undefined,
      featuredOnly: params.get('featured') === 'true',
      page: Number(params.get('page') ?? 1),
      limit: Number(params.get('limit') ?? 9),
    })
    return jsonOk(result)
  } catch (error) {
    return handleUnexpected(error)
  }
}
