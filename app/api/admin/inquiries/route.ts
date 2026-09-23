import { searchParams, withAdmin } from '@/lib/api'
import InquiryModel from '@/lib/models/inquiry'
import { escapeRegex } from '@/lib/data'
import { jsonOk } from '@/lib/security'
import { serializeInquiry } from '@/lib/serialize'

export const runtime = 'nodejs'

export const GET = withAdmin(async ({ request }) => {
  const params = searchParams(request)
  const page = Math.max(1, Number(params.get('page') ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize') ?? 20)))
  const status = params.get('status')?.trim()
  const read = params.get('read')
  const search = params.get('search')?.trim()

  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  if (read === 'true') filter.read = true
  if (read === 'false') filter.read = false
  if (search) {
    const safe = escapeRegex(search)
    filter.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { email: { $regex: safe, $options: 'i' } },
      { phone: { $regex: safe, $options: 'i' } },
      { subject: { $regex: safe, $options: 'i' } },
    ]
  }

  const [docs, total, unreadCount] = await Promise.all([
    InquiryModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
    InquiryModel.countDocuments(filter),
    InquiryModel.countDocuments({ read: false }),
  ])

  return jsonOk({
    data: docs.map(serializeInquiry),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    unreadCount,
  })
})
