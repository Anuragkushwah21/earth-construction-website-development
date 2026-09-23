'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Loader2, Save, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { GalleryUploader } from '@/components/admin/gallery-uploader'
import { ImageUploader } from '@/components/admin/image-uploader'
import { TagInput } from '@/components/admin/tag-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, api } from '@/lib/api-client'
import { WORK_STATUSES, type Work } from '@/lib/types'

const SERVICE_SUGGESTIONS = [
  'Road Construction',
  'Structural Engineering',
  'Drainage Systems',
  'Canal Construction',
  'Groove Cutting',
  'PQC / CC Roads',
  'Labour Supply',
  'Project Management',
]

const CATEGORY_SUGGESTIONS = [
  'PQC / CC Roads',
  'Road Construction',
  'Groove Cutting',
  'Canal Construction',
  'Drainage Systems',
  'Structural Engineering',
]

type FormState = {
  title: string
  slug: string
  coverImage: string
  galleryImages: string[]
  shortDescription: string
  description: string
  category: string
  location: string
  client: string
  startDate: string
  completionYear: string
  status: Work['status']
  services: string[]
  featured: boolean
  published: boolean
}

function initialState(work?: Work): FormState {
  return {
    title: work?.title ?? '',
    slug: work?.slug ?? '',
    coverImage: work?.coverImage ?? '',
    galleryImages: work?.galleryImages ?? [],
    shortDescription: work?.shortDescription ?? '',
    description: work?.description ?? '',
    category: work?.category ?? '',
    location: work?.location ?? '',
    client: work?.client ?? '',
    startDate: work?.startDate ? work.startDate.slice(0, 10) : '',
    completionYear: work?.completionYear ?? '',
    status: work?.status ?? 'Completed',
    services: work?.services ?? [],
    featured: work?.featured ?? false,
    published: work?.published ?? false,
  }
}

export function WorkForm({ work }: { work?: Work }) {
  const router = useRouter()
  const isEdit = Boolean(work)
  const [values, setValues] = React.useState<FormState>(() => initialState(work))
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key as string]) return current
      const next = { ...current }
      delete next[key as string]
      return next
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setFormError('')

    const payload = { ...values, startDate: values.startDate || null }

    try {
      if (isEdit && work) {
        await api.patch(`/api/admin/works/${work.id}`, payload)
        toast.success('Project saved.')
      } else {
        const created = await api.post<{ data: Work }>('/api/admin/works', payload)
        toast.success('Project created.')
        router.push(`/admin/work/${created.data.id}`)
      }
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
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/admin/work" />}>
          <ArrowLeft /> Back to projects
        </Button>
        {isEdit && work?.published ? (
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/work/${work.slug}`} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink /> View on website
          </Button>
        ) : null}
      </div>

      {formError ? (
        <p
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {formError}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr] xl:items-start">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Project details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Title" htmlFor="title" error={errors.title} required>
                <Input
                  id="title"
                  value={values.title}
                  onChange={(event) => set('title', event.target.value)}
                  placeholder="5 KM PQC Road — Mehgaon Mau Road"
                  aria-invalid={Boolean(errors.title)}
                  required
                />
              </Field>

              <Field
                label="URL slug"
                htmlFor="slug"
                error={errors.slug}
                hint={`Leave blank to generate from the title. Page address: /work/${values.slug || 'your-project-title'}`}
              >
                <Input
                  id="slug"
                  value={values.slug}
                  onChange={(event) => set('slug', event.target.value)}
                  placeholder="pqc-road-mehgaon-mau"
                  className="font-mono"
                />
              </Field>

              <Field
                label="Short description"
                htmlFor="shortDescription"
                error={errors.shortDescription}
                hint="One or two sentences. Shown on project cards and used for search results."
              >
                <Textarea
                  id="shortDescription"
                  rows={3}
                  value={values.shortDescription}
                  onChange={(event) => set('shortDescription', event.target.value)}
                  placeholder="Construction of a 5-kilometre Pavement Quality Concrete road…"
                />
              </Field>

              <Field
                label="Full description"
                htmlFor="description"
                error={errors.description}
                hint="The full project story. Leave a blank line between paragraphs."
              >
                <Textarea
                  id="description"
                  rows={12}
                  value={values.description}
                  onChange={(event) => set('description', event.target.value)}
                  placeholder="Describe the scope, the approach and the outcome…"
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <ImageUploader
                value={values.coverImage}
                onChange={(url) => set('coverImage', url)}
                folder="work"
                label="Cover image"
                hint="Used on cards and at the top of the project page."
              />
              <GalleryUploader
                value={values.galleryImages}
                onChange={(urls) => set('galleryImages', urls)}
                folder="work"
                label="Gallery images"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ToggleRow
                id="published"
                label="Published"
                description={
                  values.published
                    ? 'Visible on the public website.'
                    : 'Saved as a draft — not visible to visitors.'
                }
                checked={values.published}
                onChange={(checked) => set('published', checked)}
              />
              <ToggleRow
                id="featured"
                label="Featured project"
                description="Highlighted at the top of the Our Work page and on the homepage."
                checked={values.featured}
                onChange={(checked) => set('featured', checked)}
              />

              <Button type="submit" size="lg" className="mt-1 h-11 w-full" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Status" htmlFor="status" error={errors.status}>
                <Select
                  id="status"
                  value={values.status}
                  onChange={(event) => set('status', event.target.value as Work['status'])}
                >
                  {WORK_STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Category" htmlFor="category" error={errors.category}>
                <Input
                  id="category"
                  list="work-categories"
                  value={values.category}
                  onChange={(event) => set('category', event.target.value)}
                  placeholder="PQC / CC Roads"
                />
                <datalist id="work-categories">
                  {CATEGORY_SUGGESTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </Field>

              <Field label="Location" htmlFor="location" error={errors.location}>
                <Input
                  id="location"
                  value={values.location}
                  onChange={(event) => set('location', event.target.value)}
                  placeholder="Mehgaon Mau Road, Distt. Bhind, M.P."
                />
              </Field>

              <Field
                label="Client / organisation"
                htmlFor="client"
                error={errors.client}
                hint="Optional. Leave blank if the client should not be named."
              >
                <Input
                  id="client"
                  value={values.client}
                  onChange={(event) => set('client', event.target.value)}
                  placeholder="RCL Porsa Highways Private Limited"
                />
              </Field>

              <Field label="Start date" htmlFor="startDate" error={errors.startDate} hint="Optional.">
                <Input
                  id="startDate"
                  type="date"
                  value={values.startDate}
                  onChange={(event) => set('startDate', event.target.value)}
                />
              </Field>

              <Field
                label="Completion year"
                htmlFor="completionYear"
                error={errors.completionYear}
                hint="For example: 2020–2021, or 2024 – ongoing."
              >
                <Input
                  id="completionYear"
                  value={values.completionYear}
                  onChange={(event) => set('completionYear', event.target.value)}
                  placeholder="2020–2021"
                />
              </Field>

              <Field
                label="Services used"
                error={errors.services}
                hint="Links this project to the matching service pages."
              >
                <TagInput
                  value={values.services}
                  onChange={(services) => set('services', services)}
                  suggestions={SERVICE_SUGGESTIONS}
                  placeholder="Add a service"
                />
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  )
}
