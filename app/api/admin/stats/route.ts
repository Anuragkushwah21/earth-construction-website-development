import { withAdmin } from '@/lib/api'
import InquiryModel from '@/lib/models/inquiry'
import MachineModel from '@/lib/models/machine'
import ServiceModel from '@/lib/models/service'
import StaffModel from '@/lib/models/staff'
import WorkModel from '@/lib/models/work'
import { jsonOk } from '@/lib/security'

export const runtime = 'nodejs'

export const GET = withAdmin(async () => {
  const [
    totalProjects,
    publishedProjects,
    totalMachines,
    publishedMachines,
    activeStaff,
    newInquiries,
    totalInquiries,
    totalServices,
  ] = await Promise.all([
    WorkModel.countDocuments(),
    WorkModel.countDocuments({ published: true }),
    MachineModel.countDocuments(),
    MachineModel.countDocuments({ published: true }),
    StaffModel.countDocuments({ active: true }),
    InquiryModel.countDocuments({ read: false }),
    InquiryModel.countDocuments(),
    ServiceModel.countDocuments(),
  ])

  return jsonOk({
    totalProjects,
    publishedProjects,
    totalMachines,
    publishedMachines,
    activeStaff,
    newInquiries,
    totalInquiries,
    totalServices,
  })
})
