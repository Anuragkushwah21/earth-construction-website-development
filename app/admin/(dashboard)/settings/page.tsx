import Link from 'next/link'
import { Database, ExternalLink, Globe, KeyRound, ShieldCheck, User } from 'lucide-react'
import { ChangePasswordCard } from '@/components/admin/change-password-card'
import { PageHeader } from '@/components/admin/page-header'
import { SeedButton } from '@/components/admin/seed-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireSession } from '@/lib/auth'
import { isDatabaseConfigured } from '@/lib/db'
import { uploadProvider } from '@/lib/upload'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Settings' }

export default async function AdminSettingsPage() {
  const session = await requireSession()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Account, environment and starter content. Company text and images are edited under About / Company."
      />

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Your account</CardTitle>
            <CardDescription>The admin account you are currently signed in with.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Row icon={<User className="size-4" />} label="Name" value={session.name} />
            <Row icon={<KeyRound className="size-4" />} label="Email" value={session.email} />
            <div className="mt-1 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <p className="m-0">
                Passwords are stored only as bcrypt hashes — no plain-text password exists anywhere in the
                code or the database. Use the card alongside to change yours, or{' '}
                <Link href="/admin/forgot-password" className="underline underline-offset-2">
                  reset it by email
                </Link>{' '}
                if you cannot sign in.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Read from environment variables at runtime.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Row
              icon={<Database className="size-4" />}
              label="Database"
              value={
                isDatabaseConfigured() ? (
                  <Badge variant="success">Connected via MONGODB_URI</Badge>
                ) : (
                  <Badge variant="danger">MONGODB_URI not set</Badge>
                )
              }
            />
            <Row
              icon={<ShieldCheck className="size-4" />}
              label="Image storage"
              value={
                uploadProvider() === 'cloudinary' ? (
                  <Badge variant="success">Cloudinary</Badge>
                ) : (
                  <Badge variant="warning">Local disk (public/uploads)</Badge>
                )
              }
            />
            <Row
              icon={<Globe className="size-4" />}
              label="Site URL"
              value={<span className="font-mono text-xs">{siteUrl}</span>}
            />
            <div className="mt-1">
              <Button variant="outline" size="sm" render={<Link href="/" target="_blank" rel="noreferrer" />}>
                <ExternalLink /> Open public site
              </Button>
            </div>
          </CardContent>
        </Card>

        <ChangePasswordCard />

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Starter content</CardTitle>
            <CardDescription>
              Loads the projects, services and leadership profiles documented in the company profile. Existing
              records are never overwritten, so this is safe to run at any time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SeedButton />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 font-medium break-words">{value}</span>
    </div>
  )
}
