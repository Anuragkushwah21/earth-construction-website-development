import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AuthPanel } from '@/components/admin/auth-panel'
import { LoginForm } from '@/components/admin/login-form'

export const metadata: Metadata = {
  title: 'Admin Sign In',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <AuthPanel
      title={
        <>
          Manage your
          <br />
          <span className="text-amber-600">work profile.</span>
        </>
      }
      description="Sign in to publish project stories, update equipment and company details, and read incoming inquiries."
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthPanel>
  )
}
