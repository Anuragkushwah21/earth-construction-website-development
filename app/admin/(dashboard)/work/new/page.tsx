import { PageHeader } from '@/components/admin/page-header'
import { WorkForm } from '@/components/admin/work-form'

export const metadata = { title: 'Add work' }

export default function NewWorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Work / Projects"
        title="Add a project"
        description="Save it as a draft first if you are still gathering photos — nothing appears on the website until you publish it."
      />
      <WorkForm />
    </>
  )
}
