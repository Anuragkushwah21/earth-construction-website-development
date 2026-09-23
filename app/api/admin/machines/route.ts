import { parseBody, searchParams, withAdmin } from '@/lib/api'
import MachineModel from '@/lib/models/machine'
import { escapeRegex } from '@/lib/data'
import { jsonOk, uniqueSlug } from '@/lib/security'
import { serializeMachine } from '@/lib/serialize'
import { toMachineDocument } from '@/lib/transform'
import { machineSchema } from '@/lib/validation'

export const runtime = 'nodejs'

export const GET = withAdmin(async ({ request }) => {
  const params = searchParams(request)
  const page = Math.max(1, Number(params.get('page') ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize') ?? 20)))
  const search = params.get('search')?.trim()
  const availability = params.get('availability')?.trim()
  const published = params.get('published')

  const filter: Record<string, unknown> = {}
  if (availability) filter.availability = availability
  if (published === 'true') filter.published = true
  if (published === 'false') filter.published = false
  if (search) {
    const safe = escapeRegex(search)
    filter.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { category: { $regex: safe, $options: 'i' } },
    ]
  }

  const [docs, total] = await Promise.all([
    MachineModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
    MachineModel.countDocuments(filter),
  ])

  return jsonOk({
    data: docs.map(serializeMachine),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  })
})

export const POST = withAdmin(async ({ request }) => {
  const parsed = await parseBody(request, machineSchema)
  if (!parsed.ok) return parsed.response

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.name, async (candidate) =>
    Boolean(await MachineModel.exists({ slug: candidate })),
  )

  const created = await MachineModel.create({ ...toMachineDocument(parsed.data), slug })
  return jsonOk({ data: serializeMachine(created.toObject()) }, 201)
})
