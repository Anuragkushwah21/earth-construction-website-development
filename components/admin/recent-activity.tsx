import Link from 'next/link'
import { HardHat, Mail, Truck, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Inquiry, Machine, Staff, Work } from '@/lib/types'

type ActivityItem = {
  key: string
  icon: typeof HardHat
  label: string
  title: string
  meta: string
  href: string
  at: number
  unread?: boolean
}

export function RecentActivity({
  works,
  machines,
  staff,
  inquiries,
}: {
  works: Work[]
  machines: Machine[]
  staff: Staff[]
  inquiries: Inquiry[]
}) {
  const items: ActivityItem[] = [
    ...works.map((work) => ({
      key: `work-${work.id}`,
      icon: HardHat,
      label: 'Project',
      title: work.title,
      meta: [work.location, work.published ? 'Published' : 'Draft'].filter(Boolean).join(' · '),
      href: `/admin/work/${work.id}`,
      at: Date.parse(work.createdAt) || 0,
    })),
    ...machines.map((machine) => ({
      key: `machine-${machine.id}`,
      icon: Truck,
      label: 'Machine',
      title: machine.name,
      meta: [machine.category, machine.published ? 'Published' : 'Draft'].filter(Boolean).join(' · '),
      href: `/admin/machines/${machine.id}`,
      at: Date.parse(machine.createdAt) || 0,
    })),
    ...staff.map((member) => ({
      key: `staff-${member.id}`,
      icon: Users,
      label: 'Staff',
      title: member.name,
      meta: [member.designation, member.published ? 'Published' : 'Hidden'].filter(Boolean).join(' · '),
      href: `/admin/staff/${member.id}`,
      at: Date.parse(member.createdAt) || 0,
    })),
    ...inquiries.map((inquiry) => ({
      key: `inquiry-${inquiry.id}`,
      icon: Mail,
      label: 'Inquiry',
      title: inquiry.subject || `Inquiry from ${inquiry.name}`,
      meta: `${inquiry.name} · ${inquiry.status}`,
      href: '/admin/inquiries',
      at: Date.parse(inquiry.createdAt) || 0,
      unread: !inquiry.read,
    })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 8)

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold">Recent activity</h2>
        <Link href="/admin/work" className="text-xs font-medium text-amber-700 hover:underline">
          Manage content
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          Nothing has been added yet. Start by adding your first project.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/60"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <item.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.label} · {item.meta}
                  </span>
                </span>
                {item.unread ? (
                  <Badge variant="warning" className="shrink-0">
                    New
                  </Badge>
                ) : null}
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                  {item.at ? formatRelative(item.at) : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function formatRelative(timestamp: number) {
  const diffMinutes = Math.round((timestamp - Date.now()) / 60000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute')
  if (Math.abs(diffMinutes) < 60 * 24) return formatter.format(Math.round(diffMinutes / 60), 'hour')
  return formatter.format(Math.round(diffMinutes / (60 * 24)), 'day')
}
