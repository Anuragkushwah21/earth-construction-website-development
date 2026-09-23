'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ApiError, api } from '@/lib/api-client'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setFormError('')

    try {
      await api.post('/api/auth/login', { email, password })

      // Only allow same-site redirect targets, so `?next=` cannot be used to
      // bounce a signed-in admin to another domain.
      const next = searchParams.get('next')
      const destination = next && next.startsWith('/admin') ? next : '/admin'

      router.push(destination)
      router.refresh()
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

      <Field label="Email" htmlFor="admin-email" error={errors.email} required>
        <Input
          id="admin-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@earthconstruction.com"
          autoComplete="username"
          aria-invalid={Boolean(errors.email)}
          required
        />
      </Field>

      <Field label="Password" htmlFor="admin-password" error={errors.password} required>
        <Input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          required
        />
      </Field>

      <Button type="submit" size="lg" className="mt-2 h-11 w-full" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : null}
        {submitting ? 'Signing in…' : 'Open dashboard'}
        {submitting ? null : <ArrowRight />}
      </Button>

      <Link
        href="/admin/forgot-password"
        className="self-center text-xs font-medium text-neutral-600 underline underline-offset-4 hover:text-amber-700"
      >
        Forgot your password?
      </Link>
    </form>
  )
}
