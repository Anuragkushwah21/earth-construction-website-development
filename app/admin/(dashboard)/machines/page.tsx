import Link from 'next/link'
import { Plus } from 'lucide-react'
import { MachineManager } from '@/components/admin/machine-manager'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Machines' }

export default function AdminMachinesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Machines & Equipment"
        description="Add the machinery you want visitors to see. Only the details you enter are published — nothing is assumed."
        actions={
          <Button size="lg" render={<Link href="/admin/machines/new" />}>
            <Plus /> Add machine
          </Button>
        }
      />
      <MachineManager />
    </>
  )
}
