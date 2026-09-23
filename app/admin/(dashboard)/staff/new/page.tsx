import { PageHeader } from '@/components/admin/page-header'
import { StaffForm } from '@/components/admin/staff-form'

export const metadata = { title: 'Add staff' }

export default function NewStaffPage() {
  return (
    <>
      <PageHeader
        eyebrow="Staff Management"
        title="Add a team member"
        description="Nothing about this person appears on the website until you mark the profile published."
      />
      <StaffForm />
    </>
  )
}
