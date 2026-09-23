import { parseBody, searchParams, withAdmin } from '@/lib/api'
import StaffModel from '@/lib/models/staff'
import { escapeRegex } from '@/lib/data'
import { jsonOk } from '@/lib/security'
import { serializeStaff } from '@/lib/serialize'
import { toStaffDocument } from '@/lib/transform'
import { staffSchema } from '@/lib/validation'

export const runtime = 'nodejs'

export const GET = withAdmin(async ({ request }) => {
  const params = searchParams(request)
  const search = params.get('search')?.trim()

  const filter: Record<string, unknown> = {}
  if (search) {
    const safe = escapeRegex(search)
    filter.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { designation: { $regex: safe, $options: 'i' } },
      { department: { $regex: safe, $options: 'i' } },
    ]
  }

  const docs = await StaffModel.find(filter).sort({ displayOrder: 1, createdAt: 1 }).lean()
  return jsonOk({ data: docs.map(serializeStaff), total: docs.length })
})

export const POST = withAdmin(async ({ request }) => {
  const parsed = await parseBody(request, staffSchema)
  if (!parsed.ok) return parsed.response

  const created = await StaffModel.create(toStaffDocument(parsed.data))
  return jsonOk({ data: serializeStaff(created.toObject()) }, 201)
})
