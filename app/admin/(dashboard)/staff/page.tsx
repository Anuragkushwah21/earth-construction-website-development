import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { StaffManager } from '@/components/admin/staff-manager'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Staff' }

export default function AdminStaffPage() {
  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Staff Management"
        description="Profiles stay private until you publish them, and contact details are never shown unless you choose to."
        actions={
          <Button size="lg" render={<Link href="/admin/staff/new" />}>
            <Plus /> Add staff
          </Button>
        }
      />
      <StaffManager />
    </>
  )
}
