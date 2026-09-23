import { parseBody, withAdmin } from '@/lib/api'
import CompanySettingsModel from '@/lib/models/company-settings'
import { COMPANY_DEFAULTS } from '@/lib/company-defaults'
import { jsonOk } from '@/lib/security'
import { serializeCompanySettings } from '@/lib/serialize'
import { toCompanySettingsDocument } from '@/lib/transform'
import { companySettingsSchema } from '@/lib/validation'

export const runtime = 'nodejs'

export const GET = withAdmin(async () => {
  const doc = await CompanySettingsModel.findOne({ key: 'default' }).lean()
  return jsonOk({ data: doc ? serializeCompanySettings(doc) : COMPANY_DEFAULTS })
})

export const PATCH = withAdmin(async ({ request }) => {
  const parsed = await parseBody(request, companySettingsSchema)
  if (!parsed.ok) return parsed.response

  const doc = await CompanySettingsModel.findOneAndUpdate(
    { key: 'default' },
    { $set: { key: 'default', ...toCompanySettingsDocument(parsed.data) } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean()

  return jsonOk({ data: serializeCompanySettings(doc) })
})
