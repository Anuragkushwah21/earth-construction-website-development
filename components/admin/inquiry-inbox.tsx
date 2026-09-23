'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  MapPin,
  Phone,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api-client'
import { INQUIRY_STATUSES, type Inquiry, type InquiryStatus, type Paginated } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS_VARIANT: Record<InquiryStatus, 'info' | 'warning' | 'success' | 'muted' | 'danger'> = {
  New: 'info',
  Contacted: 'warning',
  'In Progress': 'warning',
  Resolved: 'success',
  Spam: 'danger',
}

type InquiryResponse = Paginated<Inquiry> & { unreadCount: number }

export function InquiryInbox({
  initialStatus = '',
  initialRead = '',
}: {
  initialStatus?: string
  initialRead?: string
}) {
  const router = useRouter()
  const [inquiries, setInquiries] = React.useState<Inquiry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState(initialStatus)
  const [read, setRead] = React.useState(initialRead)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [selected, setSelected] = React.useState<Inquiry | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<Inquiry | null>(null)
  const [busy, setBusy] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (search.trim()) params.set('search', search.trim())
      if (status) params.set('status', status)
      if (read) params.set('read', read)

      const result = await api.get<InquiryResponse>(`/api/admin/inquiries?${params}`)
      setInquiries(result.data)
      setTotalPages(result.totalPages)
      setTotal(result.total)
      setUnreadCount(result.unreadCount)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load inquiries.')
    } finally {
      setLoading(false)
    }
  }, [page, search, status, read])

  React.useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  async function patch(inquiry: Inquiry, changes: { status?: InquiryStatus; read?: boolean }) {
    setBusy(true)
    try {
      const result = await api.patch<{ data: Inquiry }>(`/api/admin/inquiries/${inquiry.id}`, changes)
      setInquiries((current) => current.map((item) => (item.id === inquiry.id ? result.data : item)))
      setSelected((current) => (current?.id === inquiry.id ? result.data : current))
      setUnreadCount((current) => {
        if (changes.read === true && !inquiry.read) return Math.max(0, current - 1)
        if (changes.read === false && inquiry.read) return current + 1
        return current
      })
      router.refresh()
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Update failed.')
    } finally {
      setBusy(false)
    }
  }

  /** Opening an inquiry marks it read, the way an email client would. */
  function open(inquiry: Inquiry) {
    setSelected(inquiry)
    if (!inquiry.read) patch(inquiry, { read: true })
  }

  async function handleDelete() {
    if (!pendingDelete) return
    try {
      await api.delete(`/api/admin/inquiries/${pendingDelete.id}`)
      toast.success('Inquiry deleted.')
      if (selected?.id === pendingDelete.id) setSelected(null)
      setPendingDelete(null)
      load()
      router.refresh()
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Delete failed.')
    }
  }

  const hasFilters = Boolean(search.trim() || status || read)

  return (
    <>
      {unreadCount > 0 ? (
        <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          <Mail className="size-4" />
          New inquiries: {unreadCount}
        </div>
      ) : null}

      <div className="mb-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1.6fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search name, email, phone or subject"
            className="pl-9"
            aria-label="Search inquiries"
          />
        </div>
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {INQUIRY_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select
          value={read}
          onChange={(event) => {
            setRead(event.target.value)
            setPage(1)
          }}
          aria-label="Filter by read state"
        >
          <option value="">Read &amp; unread</option>
          <option value="false">Unread only</option>
          <option value="true">Read only</option>
        </Select>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {error}{' '}
          <button type="button" onClick={load} className="font-semibold underline">
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <EmptyState
          icon={<Inbox />}
          title={hasFilters ? 'No inquiries match these filters' : 'No inquiries yet'}
          description={
            hasFilters
              ? 'Try a different search term or clear the filters.'
              : 'Messages sent through the website contact form will appear here.'
          }
          action={
            hasFilters ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSearch('')
                  setStatus('')
                  setRead('')
                  setPage(1)
                }}
              >
                Clear filters
              </Button>
            ) : null
          }
        />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border bg-card">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id} className="border-b border-border last:border-b-0">
              <div
                className={cn(
                  'flex flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center',
                  !inquiry.read && 'border-l-3 border-l-amber-500 bg-amber-50/45',
                )}
              >
                <button
                  type="button"
                  onClick={() => open(inquiry)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={cn('truncate text-sm', !inquiry.read ? 'font-bold' : 'font-medium')}>
                      {inquiry.name}
                    </span>
                    <Badge variant={STATUS_VARIANT[inquiry.status]}>{inquiry.status}</Badge>
                    {!inquiry.read ? <Badge variant="warning">Unread</Badge> : null}
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted-foreground">
                    {inquiry.subject || 'Website inquiry'}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{inquiry.phone}</span>
                    <span className="truncate">{inquiry.email}</span>
                    <span>{formatDateTime(inquiry.createdAt)}</span>
                  </span>
                </button>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <Select
                    value={inquiry.status}
                    onChange={(event) => patch(inquiry, { status: event.target.value as InquiryStatus })}
                    aria-label={`Change status for ${inquiry.name}`}
                    className="h-8 w-36 text-xs"
                  >
                    {INQUIRY_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => patch(inquiry, { read: !inquiry.read })}
                    aria-label={inquiry.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {inquiry.read ? <Mail /> : <MailOpen />}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setPendingDelete(inquiry)}
                    aria-label={`Delete inquiry from ${inquiry.name}`}
                    className="text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Showing {inquiries.length} of {total} inquir{total === 1 ? 'y' : 'ies'}
        </span>
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="text-xs">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.subject || 'Website inquiry'}
        description={selected ? `Received ${formatDateTime(selected.createdAt)}` : undefined}
        className="sm:max-w-xl"
        footer={
          selected ? (
            <>
              <Button
                variant="outline"
                size="lg"
                render={<a href={`tel:${selected.phone.replace(/\s/g, '')}`} />}
              >
                <Phone /> Call
              </Button>
              <Button
                size="lg"
                render={
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(
                      `Re: ${selected.subject || 'Your inquiry'} — Earth Construction Company`,
                    )}`}
                  />
                }
              >
                <Mail /> Reply by email
              </Button>
            </>
          ) : null
        }
      >
        {selected ? (
          <div className="flex flex-col gap-4">
            <dl className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm sm:grid-cols-2">
              <DetailRow label="Name" value={selected.name} />
              <DetailRow label="Phone" value={selected.phone} href={`tel:${selected.phone}`} />
              <DetailRow label="Email" value={selected.email} href={`mailto:${selected.email}`} />
              <DetailRow label="Status" value={selected.status} />
              {selected.projectType ? (
                <DetailRow label="Project type" value={selected.projectType} />
              ) : null}
              {selected.location ? (
                <DetailRow label="Site location" value={selected.location} icon={<MapPin className="size-3.5" />} />
              ) : null}
            </dl>

            <div>
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Message
              </h3>
              <p className="whitespace-pre-wrap rounded-lg border border-border p-4 text-sm leading-relaxed">
                {selected.message}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={selected.status}
                onChange={(event) => patch(selected, { status: event.target.value as InquiryStatus })}
                aria-label="Change status"
                className="w-44"
                disabled={busy}
              >
                {INQUIRY_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Button
                size="lg"
                variant="outline"
                onClick={() => patch(selected, { read: !selected.read })}
                disabled={busy}
              >
                {busy ? <Loader2 className="animate-spin" /> : selected.read ? <Mail /> : <MailOpen />}
                Mark as {selected.read ? 'unread' : 'read'}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this inquiry?"
        description={
          <>
            The message from <strong>{pendingDelete?.name}</strong> will be permanently removed from your
            inbox.
          </>
        }
        confirmLabel="Delete inquiry"
      />
    </>
  )
}

function DetailRow({
  label,
  value,
  href,
  icon,
}: {
  label: string
  value: string
  href?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5 truncate text-sm font-medium">
        {icon}
        {href ? (
          <a href={href} className="truncate hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function formatDateTime(value: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
