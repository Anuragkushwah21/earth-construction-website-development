import { withAdmin } from '@/lib/api'
import CompanySettingsModel from '@/lib/models/company-settings'
import MachineModel from '@/lib/models/machine'
import ServiceModel from '@/lib/models/service'
import StaffModel from '@/lib/models/staff'
import WorkModel from '@/lib/models/work'
import { COMPANY_DEFAULTS, DEFAULT_SERVICES } from '@/lib/company-defaults'
import { SEED_MACHINES, SEED_STAFF, SEED_WORKS } from '@/lib/seed-data'
import { jsonOk } from '@/lib/security'

export const runtime = 'nodejs'

/**
 * Idempotent starter content. Existing records are never overwritten, so the
 * admin can run this safely at any time — it only fills in what is missing.
 */
export const POST = withAdmin(async () => {
  const created = { works: 0, machines: 0, staff: 0, services: 0, company: false }

  for (const work of SEED_WORKS) {
    if (await WorkModel.exists({ slug: work.slug })) continue
    await WorkModel.create(work)
    created.works += 1
  }

  for (const machine of SEED_MACHINES) {
    if (await MachineModel.exists({ slug: machine.slug })) continue
    await MachineModel.create(machine)
    created.machines += 1
  }

  for (const member of SEED_STAFF) {
    if (await StaffModel.exists({ name: member.name })) continue
    await StaffModel.create(member)
    created.staff += 1
  }

  for (const service of DEFAULT_SERVICES) {
    if (await ServiceModel.exists({ slug: service.slug })) continue
    await ServiceModel.create({ ...service, benefits: [...service.benefits], published: true })
    created.services += 1
  }

  const existingCompany = await CompanySettingsModel.findOne({ key: 'default' })
  if (!existingCompany) {
    await CompanySettingsModel.create({ key: 'default', ...COMPANY_DEFAULTS })
    created.company = true
  }

  return jsonOk({ created })
})

/** Reports what starter content is still missing, for the dashboard prompt. */
export const GET = withAdmin(async () => {
  const [works, machines, staff, services, company] = await Promise.all([
    WorkModel.countDocuments(),
    MachineModel.countDocuments(),
    StaffModel.countDocuments(),
    ServiceModel.countDocuments(),
    CompanySettingsModel.countDocuments({ key: 'default' }),
  ])

  return jsonOk({
    works,
    machines,
    staff,
    services,
    company,
    isEmpty: works === 0 && machines === 0 && staff === 0 && services === 0,
  })
})
