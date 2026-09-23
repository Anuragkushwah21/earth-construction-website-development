import { notFound } from 'next/navigation'
import { isValidObjectId } from 'mongoose'
import { PageHeader } from '@/components/admin/page-header'
import { StaffForm } from '@/components/admin/staff-form'
import connectToDatabase from '@/lib/db'
import StaffModel from '@/lib/models/staff'
import { serializeStaff } from '@/lib/serialize'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Edit staff' }

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isValidObjectId(id)) notFound()

  await connectToDatabase()
  const doc = await StaffModel.findById(id).lean()
  if (!doc) notFound()

  const member = serializeStaff(doc)

  return (
    <>
      <PageHeader
        eyebrow="Staff Management"
        title={member.name}
        description={member.published ? 'Visible on the public Team page.' : 'Hidden from the public Team page.'}
      />
      <StaffForm member={member} />
    </>
  )
}
