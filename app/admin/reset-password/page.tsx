import type { Metadata } from 'next'
import Link from 'next/link'
import { TriangleAlert } from 'lucide-react'
import { AuthPanel } from '@/components/admin/auth-panel'
import { ResetPasswordForm } from '@/components/admin/reset-password-form'
import { Button } from '@/components/ui/button'
import { isResetTokenValid } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Choose a New Password',
  robots: { index: false, follow: false },
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  // Checked before rendering so an expired link says so immediately, rather
  // than only after someone has typed a new password twice.
  const valid = token ? await isResetTokenValid(token) : false

  if (!valid) {
    return (
      <AuthPanel
        eyebrow="Account recovery"
        title={
          <>
            This link is
            <br />
            <span className="text-amber-600">no longer valid.</span>
          </>
        }
        description="Reset links expire one hour after they are sent and can only be used once."
      >
        <div className="mt-8">
          <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            Request a new link and use the most recent email you receive.
          </p>
          <Button size="lg" className="mt-6 h-11 w-full" render={<Link href="/admin/forgot-password" />}>
            Request a new link
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="mt-2 h-11 w-full"
            render={<Link href="/admin/login" />}
          >
            Back to sign in
          </Button>
        </div>
      </AuthPanel>
    )
  }

  return (
    <AuthPanel
      eyebrow="Account recovery"
      title={
        <>
          Choose a
          <br />
          <span className="text-amber-600">new password.</span>
        </>
      }
      description="Pick something you do not use anywhere else. Saving it signs you out of every other device."
    >
      <ResetPasswordForm token={token!} />
    </AuthPanel>
  )
}
