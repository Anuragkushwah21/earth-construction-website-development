import { notFound } from 'next/navigation'
import { isValidObjectId } from 'mongoose'
import { MachineForm } from '@/components/admin/machine-form'
import { PageHeader } from '@/components/admin/page-header'
import connectToDatabase from '@/lib/db'
import MachineModel from '@/lib/models/machine'
import { serializeMachine } from '@/lib/serialize'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Edit machine' }

export default async function EditMachinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isValidObjectId(id)) notFound()

  await connectToDatabase()
  const doc = await MachineModel.findById(id).lean()
  if (!doc) notFound()

  const machine = serializeMachine(doc)

  return (
    <>
      <PageHeader
        eyebrow="Machines & Equipment"
        title={machine.name}
        description={
          machine.isDemo
            ? 'This is a demo placeholder. Replace the details with real information before publishing, or delete it.'
            : machine.published
              ? 'Live on the website.'
              : 'Saved as a draft — not yet visible to visitors.'
        }
      />
      <MachineForm machine={machine} />
    </>
  )
}
