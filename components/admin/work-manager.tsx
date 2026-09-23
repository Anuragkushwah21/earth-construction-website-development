'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye,
  EyeOff,
  HardHat,
  ImageOff,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api-client'
import { WORK_STATUSES, type Paginated, type Work } from '@/lib/types'

export function WorkManager() {
  const router = useRouter()
  const [works, setWorks] = React.useState<Work[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState('')
  const [published, setPublished] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<Work | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (search.trim()) params.set('search', search.trim())
      if (status) params.set('status', status)
      if (published) params.set('published', published)

      const result = await api.get<Paginated<Work>>(`/api/admin/works?${params}`)
      setWorks(result.data)
      setTotalPages(result.totalPages)
      setTotal(result.total)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load projects.')
    } finally {
      setLoading(false)
    }
  }, [page, search, status, published])

  // Debounce so typing in the search box does not fire a request per keystroke.
  React.useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  async function toggle(work: Work, field: 'published' | 'featured') {
    setBusyId(work.id)
    const nextValue = !work[field]

    try {
      await api.patch(`/api/admin/works/${work.id}`, { ...toPayload(work), [field]: nextValue })
      setWorks((current) =>
        current.map((item) => (item.id === work.id ? { ...item, [field]: nextValue } : item)),
      )
      toast.success(
        field === 'published'
          ? nextValue
            ? 'Project published to the website.'
            : 'Project unpublished — it is now a draft.'
          : nextValue
            ? 'Marked as featured.'
            : 'Removed from featured.',
      )
      router.refresh()
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Update failed.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return
    try {
      await api.delete(`/api/admin/works/${pendingDelete.id}`)
      toast.success(`"${pendingDelete.title}" was deleted.`)
      setPendingDelete(null)
      load()
      router.refresh()
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Delete failed.')
    }
  }

  const hasFilters = Boolean(search.trim() || status || published)

  return (
    <>
      <div className="mb-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1.6fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search title, location or client"
            className="pl-9"
            aria-label="Search projects"
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
          {WORK_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select
          value={published}
          onChange={(event) => {
            setPublished(event.target.value)
            setPage(1)
          }}
          aria-label="Filter by publish state"
        >
          <option value="">Published &amp; drafts</option>
          <option value="true">Published only</option>
          <option value="false">Drafts only</option>
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
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : works.length === 0 ? (
        <EmptyState
          icon={<HardHat />}
          title={hasFilters ? 'No projects match these filters' : 'No projects yet'}
          description={
            hasFilters
              ? 'Try a different search term, or clear the filters to see everything.'
              : 'Add your first project. Each one becomes a page on the public website with its own photos, location and completion year.'
          }
          action={
            hasFilters ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSearch('')
                  setStatus('')
                  setPublished('')
                  setPage(1)
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button size="lg" render={<Link href="/admin/work/new" />}>
                <Plus /> Add your first project
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card lg:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left">
                <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-3 font-semibold">Image</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Published</th>
                  <th className="px-4 py-3 font-semibold">Featured</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {works.map((work) => (
                  <tr key={work.id} className="align-middle">
                    <td className="px-4 py-3">
                      <Thumb src={work.coverImage} alt={work.title} />
                    </td>
                    <td className="max-w-70 px-4 py-3">
                      <Link href={`/admin/work/${work.id}`} className="font-medium hover:underline">
                        {work.title}
                      </Link>
                      {work.isDemo ? (
                        <Badge variant="muted" className="ml-2">
                          Demo
                        </Badge>
                      ) : null}
                      <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">
                        /work/{work.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{work.location || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={work.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="xs"
                        variant={work.published ? 'secondary' : 'outline'}
                        onClick={() => toggle(work, 'published')}
                        disabled={busyId === work.id}
                      >
                        {busyId === work.id ? (
                          <Loader2 className="animate-spin" />
                        ) : work.published ? (
                          <Eye />
                        ) : (
                          <EyeOff />
                        )}
                        {work.published ? 'Published' : 'Draft'}
                      </Button>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => toggle(work, 'featured')}
                        disabled={busyId === work.id}
                        aria-label={work.featured ? 'Remove from featured' : 'Mark as featured'}
                        className={work.featured ? 'text-amber-500' : 'text-muted-foreground'}
                      >
                        <Star fill={work.featured ? 'currentColor' : 'none'} />
                      </Button>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(work.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <RowActions work={work} onDelete={() => setPendingDelete(work)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="flex flex-col gap-3 lg:hidden">
            {works.map((work) => (
              <li key={work.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex gap-3">
                  <Thumb src={work.coverImage} alt={work.title} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/work/${work.id}`} className="font-medium hover:underline">
                      {work.title}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {work.location || 'No location set'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={work.status} />
                      <Badge variant={work.published ? 'success' : 'muted'}>
                        {work.published ? 'Published' : 'Draft'}
                      </Badge>
                      {work.featured ? <Badge variant="warning">Featured</Badge> : null}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button
                    size="sm"
                    variant={work.published ? 'secondary' : 'outline'}
                    onClick={() => toggle(work, 'published')}
                    disabled={busyId === work.id}
                  >
                    {work.published ? <EyeOff /> : <Eye />}
                    {work.published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggle(work, 'featured')}
                    disabled={busyId === work.id}
                  >
                    <Star fill={work.featured ? 'currentColor' : 'none'} />
                    {work.featured ? 'Unfeature' : 'Feature'}
                  </Button>
                  <RowActions work={work} onDelete={() => setPendingDelete(work)} />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              Showing {works.length} of {total} project{total === 1 ? '' : 's'}
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
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this project?"
        description={
          <>
            <strong>{pendingDelete?.title}</strong> will be removed from the dashboard and from the public
            website, along with its gallery references.
          </>
        }
        confirmLabel="Delete project"
      />
    </>
  )
}

function RowActions({ work, onDelete }: { work: Work; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <Button size="icon-sm" variant="ghost" render={<Link href={`/admin/work/${work.id}`} />} aria-label={`Edit ${work.title}`}>
        <Pencil />
      </Button>
      {work.published ? (
        <Button
          size="icon-sm"
          variant="ghost"
          render={<Link href={`/work/${work.slug}`} target="_blank" rel="noreferrer" />}
          aria-label={`View ${work.title} on the website`}
        >
          <Eye />
        </Button>
      ) : null}
      <Button size="icon-sm" variant="ghost" onClick={onDelete} aria-label={`Delete ${work.title}`} className="text-destructive">
        <Trash2 />
      </Button>
    </div>
  )
}

function Thumb({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <ImageOff className="size-4" />
      </span>
    )
  }
  return (
    <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
      <Image src={src} alt={alt} fill sizes="56px" className="object-cover" />
    </span>
  )
}

function StatusBadge({ status }: { status: Work['status'] }) {
  const variant = status === 'Completed' ? 'success' : status === 'Ongoing' ? 'warning' : 'info'
  return <Badge variant={variant}>{status}</Badge>
}

function formatDate(value: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Rebuilds the full payload the PATCH endpoint validates. */
function toPayload(work: Work) {
  return {
    title: work.title,
    slug: work.slug,
    coverImage: work.coverImage,
    galleryImages: work.galleryImages,
    shortDescription: work.shortDescription,
    description: work.description,
    category: work.category,
    location: work.location,
    client: work.client,
    startDate: work.startDate,
    completionYear: work.completionYear,
    status: work.status,
    services: work.services,
    featured: work.featured,
    published: work.published,
  }
}
