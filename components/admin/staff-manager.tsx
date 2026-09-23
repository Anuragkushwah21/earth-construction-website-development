'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api-client'
import type { Staff } from '@/lib/types'

export function StaffManager() {
  const router = useRouter()
  const [staff, setStaff] = React.useState<Staff[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<Staff | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      const result = await api.get<{ data: Staff[] }>(`/api/admin/staff?${params}`)
      setStaff(result.data)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load staff.')
    } finally {
      setLoading(false)
    }
  }, [search])

  React.useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  async function patch(member: Staff, changes: Partial<Staff>, message: string) {
    setBusyId(member.id)
    try {
      await api.patch(`/api/admin/staff/${member.id}`, { ...toPayload(member), ...changes })
      setStaff((current) =>
        current
          .map((item) => (item.id === member.id ? { ...item, ...changes } : item))
          .sort((a, b) => a.displayOrder - b.displayOrder),
      )
      toast.success(message)
      router.refresh()
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Update failed.')
    } finally {
      setBusyId(null)
    }
  }

  /** Swaps display order with the neighbour above or below. */
  async function move(member: Staff, direction: -1 | 1) {
    const ordered = [...staff].sort((a, b) => a.displayOrder - b.displayOrder)
    const index = ordered.findIndex((item) => item.id === member.id)
    const neighbour = ordered[index + direction]
    if (!neighbour) return

    setBusyId(member.id)
    try {
      await Promise.all([
        api.patch(`/api/admin/staff/${member.id}`, {
          ...toPayload(member),
          displayOrder: neighbour.displayOrder,
        }),
        api.patch(`/api/admin/staff/${neighbour.id}`, {
          ...toPayload(neighbour),
          displayOrder: member.displayOrder,
        }),
      ])
      await load()
      router.refresh()
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Could not reorder.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return
    try {
      await api.delete(`/api/admin/staff/${pendingDelete.id}`)
      toast.success(`${pendingDelete.name} was removed.`)
      setPendingDelete(null)
      load()
      router.refresh()
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Delete failed.')
    }
  }

  return (
    <>
      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, designation or department"
            className="pl-9"
            aria-label="Search staff"
          />
        </div>
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
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title={search ? 'No staff match this search' : 'No staff added yet'}
          description={
            search
              ? 'Try a different name, designation or department.'
              : 'Add your team members. Profiles stay hidden until you mark them published, and contact details are private unless you choose to show them.'
          }
          action={
            search ? (
              <Button variant="outline" size="lg" onClick={() => setSearch('')}>
                Clear search
              </Button>
            ) : (
              <Button size="lg" render={<Link href="/admin/staff/new" />}>
                <Plus /> Add your first team member
              </Button>
            )
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {staff.map((member, index) => (
            <li
              key={member.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-muted">
                {member.profileImage ? (
                  <Image
                    src={member.profileImage}
                    alt={member.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full place-items-center text-sm font-semibold text-muted-foreground">
                    {member.name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join('')}
                  </span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <Link href={`/admin/staff/${member.id}`} className="font-medium hover:underline">
                  {member.name}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {[member.designation, member.department].filter(Boolean).join(' · ') ||
                    'No designation set'}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant={member.published ? 'success' : 'muted'}>
                    {member.published ? 'Published' : 'Hidden'}
                  </Badge>
                  <Badge variant={member.active ? 'info' : 'muted'}>
                    {member.active ? 'Active' : 'Inactive'}
                  </Badge>
                  {member.showContact ? <Badge variant="warning">Contact shown</Badge> : null}
                  <Badge variant="outline">Order {member.displayOrder}</Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => move(member, -1)}
                  disabled={index === 0 || busyId === member.id}
                  aria-label={`Move ${member.name} up`}
                >
                  <ArrowUp />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => move(member, 1)}
                  disabled={index === staff.length - 1 || busyId === member.id}
                  aria-label={`Move ${member.name} down`}
                >
                  <ArrowDown />
                </Button>
                <Button
                  size="sm"
                  variant={member.published ? 'secondary' : 'outline'}
                  onClick={() =>
                    patch(
                      member,
                      { published: !member.published },
                      member.published ? 'Profile hidden from the website.' : 'Profile published.',
                    )
                  }
                  disabled={busyId === member.id}
                >
                  {busyId === member.id ? (
                    <Loader2 className="animate-spin" />
                  ) : member.published ? (
                    <EyeOff />
                  ) : (
                    <Eye />
                  )}
                  {member.published ? 'Hide' : 'Publish'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    patch(
                      member,
                      { active: !member.active },
                      member.active ? 'Marked inactive.' : 'Marked active.',
                    )
                  }
                  disabled={busyId === member.id}
                >
                  {member.active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  render={<Link href={`/admin/staff/${member.id}`} />}
                  aria-label={`Edit ${member.name}`}
                >
                  <Pencil />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setPendingDelete(member)}
                  aria-label={`Delete ${member.name}`}
                  className="text-destructive"
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Remove this team member?"
        description={
          <>
            <strong>{pendingDelete?.name}</strong>&rsquo;s profile will be deleted from the dashboard and the
            public team page.
          </>
        }
        confirmLabel="Remove profile"
      />
    </>
  )
}

function toPayload(member: Staff) {
  return {
    name: member.name,
    designation: member.designation,
    department: member.department,
    profileImage: member.profileImage,
    bio: member.bio,
    experience: member.experience,
    skills: member.skills,
    contactEmail: member.contactEmail,
    contactPhone: member.contactPhone,
    showContact: member.showContact,
    published: member.published,
    active: member.active,
    displayOrder: member.displayOrder,
  }
}
