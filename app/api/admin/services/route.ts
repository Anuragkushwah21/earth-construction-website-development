import { parseBody, withAdmin } from '@/lib/api'
import ServiceModel from '@/lib/models/service'
import { jsonOk, uniqueSlug } from '@/lib/security'
import { serializeService } from '@/lib/serialize'
import { toServiceDocument } from '@/lib/transform'
import { serviceSchema } from '@/lib/validation'

export const runtime = 'nodejs'

export const GET = withAdmin(async () => {
  const docs = await ServiceModel.find({}).sort({ displayOrder: 1, createdAt: 1 }).lean()
  return jsonOk({ data: docs.map(serializeService), total: docs.length })
})

export const POST = withAdmin(async ({ request }) => {
  const parsed = await parseBody(request, serviceSchema)
  if (!parsed.ok) return parsed.response

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.title, async (candidate) =>
    Boolean(await ServiceModel.exists({ slug: candidate })),
  )

  const created = await ServiceModel.create({ ...toServiceDocument(parsed.data), slug })
  return jsonOk({ data: serializeService(created.toObject()) }, 201)
})
