'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, MailCheck, Send, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ApiError, api } from '@/lib/api-client'

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState('')
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setFormError('')

    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields)
        setFormError(error.message)
      } else {
        setFormError('Could not reach the server. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="mt-8">
        <p className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
          <MailCheck className="mt-0.5 size-4 shrink-0" />
          If that email belongs to an admin account, a reset link is on its way. The link expires in
          one hour.
        </p>
        <p className="mt-4 text-xs leading-relaxed text-neutral-600">
          Nothing arrived? Check the spam folder, then try again — and make sure you used the address
          the account was registered with.
        </p>
        <Button
          variant="outline"
          size="lg"
          className="mt-6 h-11 w-full"
          render={<Link href="/admin/login" />}
        >
          <ArrowLeft /> Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
      {formError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-800"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {formError}
        </p>
      ) : null}

      <Field label="Email" htmlFor="forgot-email" error={errors.email} required>
        <Input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="username"
          aria-invalid={Boolean(errors.email)}
          autoFocus
          required
        />
      </Field>

      <Button type="submit" size="lg" className="mt-2 h-11 w-full" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <Send />}
        {submitting ? 'Sending…' : 'Send reset link'}
      </Button>

      <Link
        href="/admin/login"
        className="self-center text-xs font-medium text-neutral-600 underline underline-offset-4 hover:text-amber-700"
      >
        Back to sign in
      </Link>
    </form>
  )
}
