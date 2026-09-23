'use client'

import * as React from 'react'
import { ArrowRight, CircleCheck, Loader2 } from 'lucide-react'

type FieldErrors = Record<string, string>

const PROJECT_TYPES = [
  'Road Construction',
  'Structural Engineering',
  'Drainage Systems',
  'Canal Construction',
  'Groove Cutting',
  'PQC / CC Roads',
  'Labour Supply',
  'Project Management',
  'Other',
]

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  projectType: '',
  location: '',
}

export function InquiryForm({ compact = false }: { compact?: boolean }) {
  const [values, setValues] = React.useState(EMPTY)
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [formError, setFormError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const honeypotRef = React.useRef<HTMLInputElement>(null)

  function update(field: keyof typeof EMPTY, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setFormError('')

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website: honeypotRef.current?.value ?? '' }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
        fields?: FieldErrors
      }

      if (!response.ok) {
        setErrors(payload.fields ?? {})
        setFormError(payload.error ?? 'We could not send your inquiry. Please try again.')
        return
      }

      setSubmitted(true)
      setValues(EMPTY)
    } catch {
      setFormError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="form-card" id="inquiry">
        <div className="form-success">
          <CircleCheck size={40} aria-hidden />
          <h3>Inquiry received</h3>
          <p>
            Thank you for getting in touch. Our team has your details and will respond as soon as possible.
          </p>
          <button type="button" className="text-link" onClick={() => setSubmitted(false)}>
            Send another inquiry <ArrowRight size={15} aria-hidden />
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="form-card" id="inquiry" onSubmit={handleSubmit} noValidate>
      <h2>Send an inquiry</h2>
      <p>
        Share a few details about your requirement and we will get back to you. Fields marked with * are
        required.
      </p>

      {formError ? (
        <p className="form-alert" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="form-grid">
        <label className="form-field">
          <span>Name *</span>
          <input
            name="name"
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            required
          />
          {errors.name ? <p className="field-error">{errors.name}</p> : null}
        </label>

        <label className="form-field">
          <span>Phone *</span>
          <input
            name="phone"
            type="tel"
            value={values.phone}
            onChange={(event) => update('phone', event.target.value)}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            required
          />
          {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
        </label>

        <label className="form-field">
          <span>Email *</span>
          <input
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            required
          />
          {errors.email ? <p className="field-error">{errors.email}</p> : null}
        </label>

        <label className="form-field">
          <span>Subject</span>
          <input
            name="subject"
            value={values.subject}
            onChange={(event) => update('subject', event.target.value)}
            placeholder="What is this about?"
          />
        </label>

        {compact ? null : (
          <>
            <label className="form-field">
              <span>Project type</span>
              <select
                name="projectType"
                value={values.projectType}
                onChange={(event) => update('projectType', event.target.value)}
              >
                <option value="">Select a service</option>
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Site location</span>
              <input
                name="location"
                value={values.location}
                onChange={(event) => update('location', event.target.value)}
                placeholder="City / district / state"
              />
            </label>
          </>
        )}

        <label className="form-field span-2">
          <span>Message *</span>
          <textarea
            name="message"
            rows={5}
            value={values.message}
            onChange={(event) => update('message', event.target.value)}
            placeholder="Tell us about the scope, site conditions and expected timeline."
            aria-invalid={Boolean(errors.message)}
            required
          />
          {errors.message ? <p className="field-error">{errors.message}</p> : null}
        </label>
      </div>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="form-honeypot" aria-hidden>
        <label>
          Website
          <input ref={honeypotRef} name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="form-footer">
        <button className="button button-accent" type="submit" disabled={submitting}>
          {submitting ? <Loader2 size={16} className="spin" aria-hidden /> : null}
          {submitting ? 'Sending…' : 'Send inquiry'}
          {submitting ? null : <ArrowRight size={16} aria-hidden />}
        </button>
        <small>We use your details only to respond to this inquiry.</small>
      </div>
    </form>
  )
}
