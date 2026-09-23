import { PageHeader } from '@/components/admin/page-header'
import { ServiceManager } from '@/components/admin/service-manager'

export const metadata = { title: 'Services' }

export default function AdminServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Services"
        description="Edit the text, images and benefits shown on the Services page and on each service's own page."
      />
      <ServiceManager />
    </>
  )
}
