import { isValidObjectId } from 'mongoose'
import { parseBody, withAdmin } from '@/lib/api'
import InquiryModel from '@/lib/models/inquiry'
import { jsonError, jsonOk } from '@/lib/security'
import { serializeInquiry } from '@/lib/serialize'
import { inquiryUpdateSchema } from '@/lib/validation'

export const runtime = 'nodejs'

type Params = { id: string }

export const GET = withAdmin<Params>(async ({ params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Inquiry not found.', 404)
  const doc = await InquiryModel.findById(params.id).lean()
  if (!doc) return jsonError('Inquiry not found.', 404)
  return jsonOk({ data: serializeInquiry(doc) })
})

export const PATCH = withAdmin<Params>(async ({ request, params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Inquiry not found.', 404)

  const parsed = await parseBody(request, inquiryUpdateSchema)
  if (!parsed.ok) return parsed.response

  const update: Record<string, unknown> = {}
  if (parsed.data.status !== undefined) update.status = parsed.data.status
  if (parsed.data.read !== undefined) update.read = parsed.data.read

  const doc = await InquiryModel.findByIdAndUpdate(params.id, update, { new: true }).lean()
  if (!doc) return jsonError('Inquiry not found.', 404)
  return jsonOk({ data: serializeInquiry(doc) })
})

export const DELETE = withAdmin<Params>(async ({ params }) => {
  if (!isValidObjectId(params.id)) return jsonError('Inquiry not found.', 404)
  const deleted = await InquiryModel.findByIdAndDelete(params.id).lean()
  if (!deleted) return jsonError('Inquiry not found.', 404)
  return jsonOk({ success: true })
})
