'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Loader2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ApiError, api } from '@/lib/api-client'
import { PASSWORD_MIN_LENGTH } from '@/lib/validation'

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [done, setDone] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setFormError('')

    try {
      await api.post('/api/auth/reset-password', { token, password, confirmPassword })
      // Deliberately no router.refresh(): the token has just been consumed, so
      // re-rendering the page would replace this success panel with the
      // "link is no longer valid" branch.
      setDone(true)
      toast.success('Password updated.')
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields)
        setFormError(error.message)
      } else {
        setFormError('Could not reach the server. Please try again.')
      }
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="mt-8">
        <p className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          Your password has been updated and every other device has been signed out.
        </p>
        <Button size="lg" className="mt-6 h-11 w-full" render={<Link href="/admin/login" />}>
          Sign in <ArrowRight />
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

      <Field
        label="New password"
        htmlFor="reset-password"
        error={errors.password}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters, including a letter and a number.`}
        required
      >
        <Input
          id="reset-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          autoFocus
          required
        />
      </Field>

      <Field
        label="Confirm new password"
        htmlFor="reset-confirm"
        error={errors.confirmPassword}
        required
      >
        <Input
          id="reset-confirm"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          required
        />
      </Field>

      <Button type="submit" size="lg" className="mt-2 h-11 w-full" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : null}
        {submitting ? 'Saving…' : 'Set new password'}
      </Button>
    </form>
  )
}
