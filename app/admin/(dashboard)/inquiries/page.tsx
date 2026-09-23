import { PageHeader } from '@/components/admin/page-header'
import { InquiryInbox } from '@/components/admin/inquiry-inbox'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Inquiries' }

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const single = (key: string) => {
    const value = params[key]
    return (Array.isArray(value) ? value[0] : value) ?? ''
  }

  return (
    <>
      <PageHeader
        eyebrow="Communication"
        title="Inquiries"
        description="Every message sent through the website contact form lands here. Unread messages are highlighted."
      />
      <InquiryInbox initialStatus={single('status')} initialRead={single('read')} />
    </>
  )
}
