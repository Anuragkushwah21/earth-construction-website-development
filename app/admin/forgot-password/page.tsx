import type { Metadata } from 'next'
import { AuthPanel } from '@/components/admin/auth-panel'
import { ForgotPasswordForm } from '@/components/admin/forgot-password-form'

export const metadata: Metadata = {
  title: 'Reset Admin Password',
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return (
    <AuthPanel
      eyebrow="Account recovery"
      title={
        <>
          Forgot your
          <br />
          <span className="text-amber-600">password?</span>
        </>
      }
      description="Enter the email address on your admin account and we will send you a link to choose a new password."
    >
      <ForgotPasswordForm />
    </AuthPanel>
  )
}
