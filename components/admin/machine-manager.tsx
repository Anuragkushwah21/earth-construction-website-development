'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Pencil, Plus, Search, Star, Trash2, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api-client'
import { MACHINE_AVAILABILITY, type Machine, type Paginated } from '@/lib/types'

export function MachineManager() {
  const router = useRouter()
  const [machines, setMachines] = React.useState<Machine[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [availability, setAvailability] = React.useState('')
  const [published, setPublished] = React.useState('')
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<Machine | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ pageSize: '100' })
      if (search.trim()) params.set('search', search.trim())
      if (availability) params.set('availability', availability)
      if (published) params.set('published', published)

      const result = await api.get<Paginated<Machine>>(`/api/admin/machines?${params}`)
      setMachines(result.data)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load machines.')
    } finally {
      setLoading(false)
    }
  }, [search, availability, published])

  React.useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  async function toggle(machine: Machine, field: 'published' | 'featured') {
    setBusyId(machine.id)
    const nextValue = !machine[field]

    try {
      await api.patch(`/api/admin/machines/${machine.id}`, { ...toPayload(machine), [field]: nextValue })
      setMachines((current) =>
        current.map((item) => (item.id === machine.id ? { ...item, [field]: nextValue } : item)),
      )
      toast.success(
        field === 'published'
          ? nextValue
            ? 'Machine published to the website.'
            : 'Machine unpublished.'
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
      await api.delete(`/api/admin/machines/${pendingDelete.id}`)
      toast.success(`"${pendingDelete.name}" was deleted.`)
      setPendingDelete(null)
      load()
      router.refresh()
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Delete failed.')
    }
  }

  const hasFilters = Boolean(search.trim() || availability || published)
  const demoCount = machines.filter((machine) => machine.isDemo).length

  return (
    <>
      {demoCount > 0 ? (
        <div className="mb-4 rounded-lg border border-violet-300 bg-violet-50 px-4 py-3 text-sm text-violet-900">
          {demoCount} demo record{demoCount === 1 ? '' : 's'} present. These are placeholders with no real
          specifications — edit them with your own details before publishing, or delete them.
        </div>
      ) : null}

      <div className="mb-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1.6fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or category"
            className="pl-9"
            aria-label="Search machines"
          />
        </div>
        <Select
          value={availability}
          onChange={(event) => setAvailability(event.target.value)}
          aria-label="Filter by availability"
        >
          <option value="">All availability</option>
          {MACHINE_AVAILABILITY.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select
          value={published}
          onChange={(event) => setPublished(event.target.value)}
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
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : machines.length === 0 ? (
        <EmptyState
          icon={<Truck />}
          title={hasFilters ? 'No machines match these filters' : 'No machines added yet'}
          description={
            hasFilters
              ? 'Try a different search term or clear the filters.'
              : 'Add the machinery you want visitors to see. Only the details you enter are shown — nothing is assumed or filled in for you.'
          }
          action={
            hasFilters ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSearch('')
                  setAvailability('')
                  setPublished('')
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button size="lg" render={<Link href="/admin/machines/new" />}>
                <Plus /> Add your first machine
              </Button>
            )
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {machines.map((machine) => (
            <li
              key={machine.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-video bg-muted">
                {machine.mainImage ? (
                  <Image
                    src={machine.mainImage}
                    alt={machine.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 360px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full place-items-center text-muted-foreground">
                    <Truck className="size-7" />
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={machine.published ? 'success' : 'muted'}>
                    {machine.published ? 'Published' : 'Draft'}
                  </Badge>
                  {machine.featured ? <Badge variant="warning">Featured</Badge> : null}
                  {machine.isDemo ? <Badge variant="muted">Demo</Badge> : null}
                  <Badge variant="outline">{machine.availability}</Badge>
                </div>

                <Link href={`/admin/machines/${machine.id}`} className="font-medium hover:underline">
                  {machine.name}
                </Link>
                <p className="text-xs text-muted-foreground">{machine.category || 'No category set'}</p>
                <p className="text-xs text-muted-foreground">
                  {machine.specifications.length} specification
                  {machine.specifications.length === 1 ? '' : 's'} ·{' '}
                  {machine.galleryImages.length} gallery image
                  {machine.galleryImages.length === 1 ? '' : 's'}
                </p>

                <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border pt-3">
                  <Button
                    size="sm"
                    variant={machine.published ? 'secondary' : 'outline'}
                    onClick={() => toggle(machine, 'published')}
                    disabled={busyId === machine.id}
                  >
                    {busyId === machine.id ? (
                      <Loader2 className="animate-spin" />
                    ) : machine.published ? (
                      <EyeOff />
                    ) : (
                      <Eye />
                    )}
                    {machine.published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => toggle(machine, 'featured')}
                    disabled={busyId === machine.id}
                    aria-label={machine.featured ? 'Remove from featured' : 'Mark as featured'}
                    className={machine.featured ? 'text-amber-500' : 'text-muted-foreground'}
                  >
                    <Star fill={machine.featured ? 'currentColor' : 'none'} />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    render={<Link href={`/admin/machines/${machine.id}`} />}
                    aria-label={`Edit ${machine.name}`}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setPendingDelete(machine)}
                    aria-label={`Delete ${machine.name}`}
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this machine?"
        description={
          <>
            <strong>{pendingDelete?.name}</strong> will be removed from the dashboard and from the public
            equipment listing.
          </>
        }
        confirmLabel="Delete machine"
      />
    </>
  )
}

function toPayload(machine: Machine) {
  return {
    name: machine.name,
    slug: machine.slug,
    category: machine.category,
    mainImage: machine.mainImage,
    galleryImages: machine.galleryImages,
    description: machine.description,
    specifications: machine.specifications,
    capacity: machine.capacity,
    applications: machine.applications,
    availability: machine.availability,
    featured: machine.featured,
    published: machine.published,
  }
}
