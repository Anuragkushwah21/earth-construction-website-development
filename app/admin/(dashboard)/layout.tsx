import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/admin-shell'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s | Earth Construction Admin' },
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // The middleware already blocks unauthenticated requests; this second check
  // means a middleware misconfiguration still cannot expose the dashboard, and
  // it is also where a session revoked by a password change is caught. Such a
  // cookie still satisfies the middleware, so it has to be cleared on the way
  // out rather than simply redirected past.
  const session = await getSession()
  if (!session) redirect('/api/auth/expired')

  return <AdminShell session={session}>{children}</AdminShell>
}
