'use client'

import * as React from 'react'
import { KeyRound, Loader2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ApiError, api } from '@/lib/api-client'
import { PASSWORD_MIN_LENGTH } from '@/lib/validation'

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' }

export function ChangePasswordCard() {
  const [values, setValues] = React.useState(EMPTY)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  function set(key: keyof typeof EMPTY, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setFormError('')

    try {
      await api.post('/api/admin/password', values)
      setValues(EMPTY)
      toast.success('Password updated. Other devices have been signed out.')
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Your current password is required. Saving signs out every other device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {formError ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              {formError}
            </p>
          ) : null}

          <Field
            label="Current password"
            htmlFor="current-password"
            error={errors.currentPassword}
            required
          >
            <Input
              id="current-password"
              type="password"
              value={values.currentPassword}
              onChange={(event) => set('currentPassword', event.target.value)}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.currentPassword)}
              required
            />
          </Field>

          <Field
            label="New password"
            htmlFor="new-password"
            error={errors.newPassword}
            hint={`At least ${PASSWORD_MIN_LENGTH} characters, including a letter and a number.`}
            required
          >
            <Input
              id="new-password"
              type="password"
              value={values.newPassword}
              onChange={(event) => set('newPassword', event.target.value)}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.newPassword)}
              required
            />
          </Field>

          <Field
            label="Confirm new password"
            htmlFor="confirm-password"
            error={errors.confirmPassword}
            required
          >
            <Input
              id="confirm-password"
              type="password"
              value={values.confirmPassword}
              onChange={(event) => set('confirmPassword', event.target.value)}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              required
            />
          </Field>

          <div>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : <KeyRound />}
              {submitting ? 'Saving…' : 'Update password'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
