import { parseBody, searchParams, withAdmin } from '@/lib/api'
import WorkModel from '@/lib/models/work'
import { escapeRegex } from '@/lib/data'
import { jsonOk, uniqueSlug } from '@/lib/security'
import { serializeWork } from '@/lib/serialize'
import { toWorkDocument } from '@/lib/transform'
import { workSchema } from '@/lib/validation'

export const runtime = 'nodejs'

export const GET = withAdmin(async ({ request }) => {
  const params = searchParams(request)
  const page = Math.max(1, Number(params.get('page') ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize') ?? 20)))
  const search = params.get('search')?.trim()
  const status = params.get('status')?.trim()
  const published = params.get('published')

  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  if (published === 'true') filter.published = true
  if (published === 'false') filter.published = false
  if (search) {
    const safe = escapeRegex(search)
    filter.$or = [
      { title: { $regex: safe, $options: 'i' } },
      { location: { $regex: safe, $options: 'i' } },
      { category: { $regex: safe, $options: 'i' } },
      { client: { $regex: safe, $options: 'i' } },
    ]
  }

  const [docs, total] = await Promise.all([
    WorkModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    WorkModel.countDocuments(filter),
  ])

  return jsonOk({
    data: docs.map(serializeWork),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  })
})

export const POST = withAdmin(async ({ request }) => {
  const parsed = await parseBody(request, workSchema)
  if (!parsed.ok) return parsed.response

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.title, async (candidate) =>
    Boolean(await WorkModel.exists({ slug: candidate })),
  )

  const created = await WorkModel.create({ ...toWorkDocument(parsed.data), slug })
  return jsonOk({ data: serializeWork(created.toObject()) }, 201)
})
