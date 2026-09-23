import { isValidObjectId } from 'mongoose'
import { parseBody, withAdmin } from '@/lib/api'
import StaffModel from '@/lib/models/staff'
import { jsonError, jsonOk } from '@/lib/security'
import { serializeStaff } from '@/lib/serialize'
import { toStaffDocument } from '@/lib/transform'
import { staffSchema } from '@/lib/validation'

export const runtime = 'nodejs'

type Params = { id: string }

export const GET = withAdmin<Params>(async ({ params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Staff member not found.', 404)
  const doc = await StaffModel.findById(params.id).lean()
  if (!doc) return jsonError('Staff member not found.', 404)
  return jsonOk({ data: serializeStaff(doc) })
})

export const PATCH = withAdmin<Params>(async ({ request, params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Staff member not found.', 404)

  const existing = await StaffModel.findById(params.id)
  if (!existing) return jsonError('Staff member not found.', 404)

  const parsed = await parseBody(request, staffSchema)
  if (!parsed.ok) return parsed.response

  existing.set(toStaffDocument(parsed.data))
  await existing.save()

  return jsonOk({ data: serializeStaff(existing.toObject()) })
})

export const DELETE = withAdmin<Params>(async ({ params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Staff member not found.', 404)
  const deleted = await StaffModel.findByIdAndDelete(params.id).lean()
  if (!deleted) return jsonError('Staff member not found.', 404)
  return jsonOk({ success: true })
})
