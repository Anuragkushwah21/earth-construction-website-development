import { PageHeader } from '@/components/admin/page-header'
import { CompanyForm } from '@/components/admin/company-form'
import CompanySettingsModel from '@/lib/models/company-settings'
import { COMPANY_DEFAULTS } from '@/lib/company-defaults'
import connectToDatabase, { isDatabaseConfigured } from '@/lib/db'
import { serializeCompanySettings } from '@/lib/serialize'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'About / Company' }

export default async function AdminCompanyPage() {
  let settings = COMPANY_DEFAULTS

  if (isDatabaseConfigured()) {
    await connectToDatabase()
    const doc = await CompanySettingsModel.findOne({ key: 'default' }).lean()
    if (doc) settings = serializeCompanySettings(doc)
  }

  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="About / Company"
        description="Everything here is read live by the public website — the header, footer, About page, Contact page and page titles."
      />
      <CompanyForm settings={settings} />
    </>
  )
}
