import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { WorkManager } from '@/components/admin/work-manager'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Work / Projects' }

export default function AdminWorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Work / Projects"
        description="Each project is published to the website as its own page, with photos, location, client and completion year."
        actions={
          <Button size="lg" render={<Link href="/admin/work/new" />}>
            <Plus /> Add work
          </Button>
        }
      />
      <WorkManager />
    </>
  )
}
