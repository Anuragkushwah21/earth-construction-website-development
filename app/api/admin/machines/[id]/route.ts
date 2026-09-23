import { isValidObjectId } from 'mongoose'
import { parseBody, withAdmin } from '@/lib/api'
import MachineModel from '@/lib/models/machine'
import { jsonError, jsonOk, uniqueSlug } from '@/lib/security'
import { serializeMachine } from '@/lib/serialize'
import { toMachineDocument } from '@/lib/transform'
import { machineSchema } from '@/lib/validation'

export const runtime = 'nodejs'

type Params = { id: string }

export const GET = withAdmin<Params>(async ({ params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Machine not found.', 404)
  const doc = await MachineModel.findById(params.id).lean()
  if (!doc) return jsonError('Machine not found.', 404)
  return jsonOk({ data: serializeMachine(doc) })
})

export const PATCH = withAdmin<Params>(async ({ request, params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Machine not found.', 404)

  const existing = await MachineModel.findById(params.id)
  if (!existing) return jsonError('Machine not found.', 404)

  const parsed = await parseBody(request, machineSchema)
  if (!parsed.ok) return parsed.response

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.name, async (candidate) =>
    Boolean(await MachineModel.exists({ slug: candidate, _id: { $ne: existing._id } })),
  )

  existing.set({ ...toMachineDocument(parsed.data), slug })
  await existing.save()

  return jsonOk({ data: serializeMachine(existing.toObject()) })
})

export const DELETE = withAdmin<Params>(async ({ params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Machine not found.', 404)
  const deleted = await MachineModel.findByIdAndDelete(params.id).lean()
  if (!deleted) return jsonError('Machine not found.', 404)
  return jsonOk({ success: true })
})
