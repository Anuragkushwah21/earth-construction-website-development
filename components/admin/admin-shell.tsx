'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Building2,
  ExternalLink,
  HardHat,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Truck,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { COMPANY_LOGO } from '@/lib/brand'
import { cn } from '@/lib/utils'
import type { AdminSession, DashboardStats } from '@/lib/types'

type NavItem = { href: string; label: string; icon: LucideIcon; badgeKey?: keyof DashboardStats }

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/work', label: 'Work / Projects', icon: HardHat },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/machines', label: 'Machines', icon: Truck },
  { href: '/admin/staff', label: 'Staff', icon: Users },
  { href: '/admin/inquiries', label: 'Inquiries', icon: Mail, badgeKey: 'newInquiries' },
  { href: '/admin/company', label: 'About / Company', icon: Building2 },
  { href: '/admin/media', label: 'Media', icon: Images },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminShell({
  session,
  children,
}: {
  session: AdminSession
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [signingOut, setSigningOut] = React.useState(false)

  // Refresh counters on every navigation so the inquiry badge stays current.
  React.useEffect(() => {
    let cancelled = false
    api
      .get<DashboardStats>('/api/admin/stats')
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch(() => {
        /* The badge is a nice-to-have; a failure here must not break the page. */
      })
    return () => {
      cancelled = true
    }
  }, [pathname])

  React.useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await api.post('/api/auth/logout', {})
      toast.success('Signed out.')
      router.push('/admin/login')
      router.refresh()
    } catch {
      toast.error('Could not sign out. Please try again.')
      setSigningOut(false)
    }
  }

  const navigation = (
    <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Dashboard sections">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
        const badge = item.badgeKey && stats ? stats[item.badgeKey] : 0

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-amber-500/15 text-amber-100'
                : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-100',
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {badge && Number(badge) > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[11px] font-bold text-neutral-950">
                {badge}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )

  const sidebarFooter = (
    <div className="shrink-0 border-t border-white/10 p-3">
      <Link
        href="/"
        target="_blank"
        rel="noreferrer"
        className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100"
      >
        <ExternalLink className="size-4 shrink-0" />
        View public site
      </Link>
      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-500 text-xs font-bold text-neutral-950">
          {session.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-neutral-100">{session.name}</span>
          <span className="block truncate text-xs text-neutral-500">{session.email}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-destructive/15 hover:text-red-300 disabled:opacity-60"
      >
        <LogOut className="size-4 shrink-0" />
        {signingOut ? 'Signing out…' : 'Logout'}
      </button>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-900">
      {/* Desktop sidebar — pinned to the viewport while the main column scrolls. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 self-start flex-col overflow-hidden bg-neutral-950 lg:flex">
        <BrandBlock />
        <div className="min-h-0 flex-1 overflow-y-auto">{navigation}</div>
        {sidebarFooter}
      </aside>

      {/* Mobile drawer */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-neutral-950">
            <BrandBlock onClose={() => setMenuOpen(false)} />
            <div className="min-h-0 flex-1 overflow-y-auto">{navigation}</div>
            {sidebarFooter}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <BrandLogo className="size-7" />
          <span className="text-sm font-semibold tracking-tight">Earth Construction Admin</span>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

function BrandBlock({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10 px-4">
      <BrandLogo className="size-9" />
      <span className="min-w-0 flex-1 leading-none">
        <span className="block text-[13px] font-bold tracking-[0.18em] text-white">EARTH</span>
        <span className="mt-1 block text-[7px] font-bold tracking-[0.16em] text-neutral-500">
          CONSTRUCTION COMPANY
        </span>
      </span>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-md p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

function BrandLogo({ className }: { className?: string }) {
  return (
    <Image
      src={COMPANY_LOGO}
      alt=""
      width={72}
      height={72}
      priority
      className={cn('shrink-0 rounded-full bg-white object-cover', className)}
    />
  )
}
