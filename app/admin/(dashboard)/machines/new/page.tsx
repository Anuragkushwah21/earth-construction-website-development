import { MachineForm } from '@/components/admin/machine-form'
import { PageHeader } from '@/components/admin/page-header'

export const metadata = { title: 'Add machine' }

export default function NewMachinePage() {
  return (
    <>
      <PageHeader
        eyebrow="Machines & Equipment"
        title="Add a machine"
        description="Enter only specifications you can confirm — blank fields are simply left out of the public page."
      />
      <MachineForm />
    </>
  )
}
