import { isValidObjectId } from 'mongoose'
import { parseBody, withAdmin } from '@/lib/api'
import ServiceModel from '@/lib/models/service'
import { jsonError, jsonOk, uniqueSlug } from '@/lib/security'
import { serializeService } from '@/lib/serialize'
import { toServiceDocument } from '@/lib/transform'
import { serviceSchema } from '@/lib/validation'

export const runtime = 'nodejs'

type Params = { id: string }

export const GET = withAdmin<Params>(async ({ params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Service not found.', 404)
  const doc = await ServiceModel.findById(params.id).lean()
  if (!doc) return jsonError('Service not found.', 404)
  return jsonOk({ data: serializeService(doc) })
})

export const PATCH = withAdmin<Params>(async ({ request, params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Service not found.', 404)

  const existing = await ServiceModel.findById(params.id)
  if (!existing) return jsonError('Service not found.', 404)

  const parsed = await parseBody(request, serviceSchema)
  if (!parsed.ok) return parsed.response

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.title, async (candidate) =>
    Boolean(await ServiceModel.exists({ slug: candidate, _id: { $ne: existing._id } })),
  )

  existing.set({ ...toServiceDocument(parsed.data), slug })
  await existing.save()

  return jsonOk({ data: serializeService(existing.toObject()) })
})

export const DELETE = withAdmin<Params>(async ({ params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Service not found.', 404)
  const deleted = await ServiceModel.findByIdAndDelete(params.id).lean()
  if (!deleted) return jsonError('Service not found.', 404)
  return jsonOk({ success: true })
})
