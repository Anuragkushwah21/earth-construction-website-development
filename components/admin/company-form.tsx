'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Save, Trash2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUploader } from '@/components/admin/image-uploader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, api } from '@/lib/api-client'
import type { CompanySettings } from '@/lib/types'

export function CompanyForm({ settings }: { settings: CompanySettings }) {
  const router = useRouter()
  const [values, setValues] = React.useState<CompanySettings>(settings)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  function set<K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function setLeader(
    key: 'ceo' | 'headOfProjects',
    field: 'name' | 'title' | 'bio' | 'image',
    value: string,
  ) {
    setValues((current) => ({ ...current, [key]: { ...current[key], [field]: value } }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setFormError('')

    try {
      await api.patch('/api/admin/company', {
        ...values,
        phone: values.phone.filter((number) => number.trim()),
      })
      toast.success('Company details saved. The public website is updated.')
      router.refresh()
    } catch (caught) {
      if (caught instanceof ApiError) {
        setErrors(caught.fields)
        setFormError(caught.message)
      } else {
        setFormError('Could not save. Please check your connection and try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {formError}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Company details</CardTitle>
          <CardDescription>
            These values appear in the header, the footer, the Contact page and the page metadata.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" htmlFor="companyName" error={errors.companyName} required>
            <Input
              id="companyName"
              value={values.companyName}
              onChange={(event) => set('companyName', event.target.value)}
            />
          </Field>

          <Field label="Tagline" htmlFor="tagline" error={errors.tagline}>
            <Input
              id="tagline"
              value={values.tagline}
              onChange={(event) => set('tagline', event.target.value)}
              placeholder="Building Infrastructure. Delivering Strength."
            />
          </Field>

          <Field label="Established" htmlFor="establishedDate" error={errors.establishedDate}>
            <Input
              id="establishedDate"
              value={values.establishedDate}
              onChange={(event) => set('establishedDate', event.target.value)}
              placeholder="20 April 2014"
            />
          </Field>

          <Field label="GSTIN" htmlFor="gstin" error={errors.gstin}>
            <Input
              id="gstin"
              value={values.gstin}
              onChange={(event) => set('gstin', event.target.value)}
            />
          </Field>

          <Field label="Email" htmlFor="company-email" error={errors.email} className="sm:col-span-2">
            <Input
              id="company-email"
              type="email"
              value={values.email}
              onChange={(event) => set('email', event.target.value)}
            />
          </Field>

          <Field label="Address" htmlFor="address" error={errors.address} className="sm:col-span-2">
            <Textarea
              id="address"
              rows={2}
              value={values.address}
              onChange={(event) => set('address', event.target.value)}
            />
          </Field>

          <div className="sm:col-span-2">
            <span className="text-sm font-medium">Phone numbers</span>
            <div className="mt-2 flex flex-col gap-2">
              {values.phone.map((number, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={number}
                    onChange={(event) =>
                      set(
                        'phone',
                        values.phone.map((item, position) =>
                          position === index ? event.target.value : item,
                        ),
                      )
                    }
                    placeholder="6264147250"
                    aria-label={`Phone number ${index + 1}`}
                  />
                  <Button
                    type="button"
                    size="icon-lg"
                    variant="ghost"
                    onClick={() =>
                      set(
                        'phone',
                        values.phone.filter((_, position) => position !== index),
                      )
                    }
                    aria-label={`Remove phone number ${index + 1}`}
                    className="text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => set('phone', [...values.phone, ''])}
                  disabled={values.phone.length >= 6}
                >
                  <Plus /> Add phone number
                </Button>
              </div>
            </div>
          </div>

          <Field
            label="Google Maps embed URL"
            htmlFor="mapEmbedUrl"
            error={errors.mapEmbedUrl}
            className="sm:col-span-2"
            hint="From Google Maps: Share → Embed a map → copy the src value from the iframe code."
          >
            <Input
              id="mapEmbedUrl"
              value={values.mapEmbedUrl}
              onChange={(event) => set('mapEmbedUrl', event.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=…"
              className="font-mono text-xs"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Optional. Defaults are used when these are left empty.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <ImageUploader
            value={values.logo}
            onChange={(url) => set('logo', url)}
            folder="branding"
            label="Logo"
            aspect="square"
            hint="Shown in the site header."
          />
          <ImageUploader
            value={values.favicon}
            onChange={(url) => set('favicon', url)}
            folder="branding"
            label="Favicon"
            aspect="square"
            hint="Browser tab icon. A square PNG works best."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About, vision &amp; mission</CardTitle>
          <CardDescription>
            Leave a blank line between paragraphs. This text drives the About page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="About text" htmlFor="about" error={errors.about}>
            <Textarea
              id="about"
              rows={8}
              value={values.about}
              onChange={(event) => set('about', event.target.value)}
            />
          </Field>
          <Field label="Vision statement" htmlFor="vision" error={errors.vision}>
            <Textarea
              id="vision"
              rows={7}
              value={values.vision}
              onChange={(event) => set('vision', event.target.value)}
            />
          </Field>
          <Field label="Mission statement" htmlFor="mission" error={errors.mission}>
            <Textarea
              id="mission"
              rows={7}
              value={values.mission}
              onChange={(event) => set('mission', event.target.value)}
            />
          </Field>
          <Field label="Safety & compliance" htmlFor="safetyCompliance" error={errors.safetyCompliance}>
            <Textarea
              id="safetyCompliance"
              rows={7}
              value={values.safetyCompliance}
              onChange={(event) => set('safetyCompliance', event.target.value)}
            />
          </Field>
          <Field label="Sustainability" htmlFor="sustainability" error={errors.sustainability}>
            <Textarea
              id="sustainability"
              rows={7}
              value={values.sustainability}
              onChange={(event) => set('sustainability', event.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leadership</CardTitle>
          <CardDescription>
            Shown on the About page. Photos are only used if you upload them — no stock portraits are ever
            substituted.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 lg:grid-cols-2">
          {(['ceo', 'headOfProjects'] as const).map((key) => (
            <div key={key} className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold">{key === 'ceo' ? 'CEO' : 'Head of Projects'}</h3>
              <Field label="Name" htmlFor={`${key}-name`}>
                <Input
                  id={`${key}-name`}
                  value={values[key].name}
                  onChange={(event) => setLeader(key, 'name', event.target.value)}
                />
              </Field>
              <Field label="Title" htmlFor={`${key}-title`}>
                <Input
                  id={`${key}-title`}
                  value={values[key].title}
                  onChange={(event) => setLeader(key, 'title', event.target.value)}
                />
              </Field>
              <Field label="Biography" htmlFor={`${key}-bio`}>
                <Textarea
                  id={`${key}-bio`}
                  rows={7}
                  value={values[key].bio}
                  onChange={(event) => setLeader(key, 'bio', event.target.value)}
                />
              </Field>
              <ImageUploader
                value={values[key].image}
                onChange={(url) => setLeader(key, 'image', url)}
                folder="leadership"
                label="Photo"
                aspect="square"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
          <CardDescription>Optional. Leave blank if the company has no profile there.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(['facebook', 'instagram', 'linkedin', 'youtube', 'twitter'] as const).map((platform) => (
            <Field
              key={platform}
              label={platform.charAt(0).toUpperCase() + platform.slice(1)}
              htmlFor={`social-${platform}`}
            >
              <Input
                id={`social-${platform}`}
                value={values.socialLinks[platform]}
                onChange={(event) =>
                  set('socialLinks', { ...values.socialLinks, [platform]: event.target.value })
                }
                placeholder="https://…"
              />
            </Field>
          ))}
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" size="lg" className="h-11 shadow-lg" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {saving ? 'Saving…' : 'Save company details'}
        </Button>
      </div>
    </form>
  )
}
