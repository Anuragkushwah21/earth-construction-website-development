import { parseBody, withAdmin } from '@/lib/api'
import { toWorkDocument } from '@/lib/transform'
import WorkModel from '@/lib/models/work'
import { jsonError, jsonOk, uniqueSlug } from '@/lib/security'
import { serializeWork } from '@/lib/serialize'
import { workSchema } from '@/lib/validation'
import { isValidObjectId } from 'mongoose'

export const runtime = 'nodejs'

type Params = { id: string }

export const GET = withAdmin<Params>(async ({ params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Project not found.', 404)

  const doc = await WorkModel.findById(params.id).lean()
  if (!doc) return jsonError('Project not found.', 404)
  return jsonOk({ data: serializeWork(doc) })
})

export const PATCH = withAdmin<Params>(async ({ request, params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Project not found.', 404)

  const existing = await WorkModel.findById(params.id)
  if (!existing) return jsonError('Project not found.', 404)

  const parsed = await parseBody(request, workSchema)
  if (!parsed.ok) return parsed.response

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.title, async (candidate) =>
    Boolean(await WorkModel.exists({ slug: candidate, _id: { $ne: existing._id } })),
  )

  existing.set({ ...toWorkDocument(parsed.data), slug })
  await existing.save()

  return jsonOk({ data: serializeWork(existing.toObject()) })
})

export const DELETE = withAdmin<Params>(async ({ params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Project not found.', 404)

  const deleted = await WorkModel.findByIdAndDelete(params.id).lean()
  if (!deleted) return jsonError('Project not found.', 404)
  return jsonOk({ success: true })
})
