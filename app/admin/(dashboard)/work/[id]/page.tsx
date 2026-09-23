import { notFound } from 'next/navigation'
import { isValidObjectId } from 'mongoose'
import { PageHeader } from '@/components/admin/page-header'
import { WorkForm } from '@/components/admin/work-form'
import connectToDatabase from '@/lib/db'
import WorkModel from '@/lib/models/work'
import { serializeWork } from '@/lib/serialize'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Edit work' }

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isValidObjectId(id)) notFound()

  await connectToDatabase()
  const doc = await WorkModel.findById(id).lean()
  if (!doc) notFound()

  const work = serializeWork(doc)

  return (
    <>
      <PageHeader
        eyebrow="Work / Projects"
        title={work.title}
        description={work.published ? 'Live on the website.' : 'Saved as a draft — not yet visible to visitors.'}
      />
      <WorkForm work={work} />
    </>
  )
}
