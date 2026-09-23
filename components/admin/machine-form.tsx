'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Loader2, Plus, Save, Trash2, TriangleAlert } from 'lucide-react'
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
import { MACHINE_AVAILABILITY, type Machine, type MachineSpecification } from '@/lib/types'

const CATEGORY_SUGGESTIONS = [
  'Road Construction Equipment',
  'Excavation Equipment',
  'Concrete Equipment',
  'Cutting Equipment',
  'Transport & Haulage',
  'General Construction Equipment',
]

const APPLICATION_SUGGESTIONS = [
  'PQC / CC road laying',
  'Transverse groove cutting',
  'Longitudinal groove cutting',
  'Canal lining',
  'Excavation',
  'Compaction',
]

type FormState = {
  name: string
  slug: string
  category: string
  mainImage: string
  galleryImages: string[]
  description: string
  specifications: MachineSpecification[]
  capacity: string
  applications: string[]
  availability: Machine['availability']
  featured: boolean
  published: boolean
}

function initialState(machine?: Machine): FormState {
  return {
    name: machine?.name ?? '',
    slug: machine?.slug ?? '',
    category: machine?.category ?? '',
    mainImage: machine?.mainImage ?? '',
    galleryImages: machine?.galleryImages ?? [],
    description: machine?.description ?? '',
    specifications: machine?.specifications ?? [],
    capacity: machine?.capacity ?? '',
    applications: machine?.applications ?? [],
    availability: machine?.availability ?? 'Available',
    featured: machine?.featured ?? false,
    published: machine?.published ?? false,
  }
}

export function MachineForm({ machine }: { machine?: Machine }) {
  const router = useRouter()
  const isEdit = Boolean(machine)
  const [values, setValues] = React.useState<FormState>(() => initialState(machine))
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

  function updateSpec(index: number, patch: Partial<MachineSpecification>) {
    set(
      'specifications',
      values.specifications.map((spec, position) =>
        position === index ? { ...spec, ...patch } : spec,
      ),
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setFormError('')

    // Drop half-filled specification rows rather than failing validation.
    const payload = {
      ...values,
      specifications: values.specifications.filter((spec) => spec.label.trim() && spec.value.trim()),
    }

    try {
      if (isEdit && machine) {
        await api.patch(`/api/admin/machines/${machine.id}`, payload)
        toast.success('Machine saved.')
      } else {
        const created = await api.post<{ data: Machine }>('/api/admin/machines', payload)
        toast.success('Machine created.')
        router.push(`/admin/machines/${created.data.id}`)
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
        <Button variant="ghost" size="sm" render={<Link href="/admin/machines" />}>
          <ArrowLeft /> Back to machines
        </Button>
        {isEdit && machine?.published ? (
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/machines/${machine.slug}`} target="_blank" rel="noreferrer" />}
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
              <CardTitle>Machine details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Machine name" htmlFor="name" error={errors.name} required>
                <Input
                  id="name"
                  value={values.name}
                  onChange={(event) => set('name', event.target.value)}
                  placeholder="PQC Paver Machine"
                  aria-invalid={Boolean(errors.name)}
                  required
                />
              </Field>

              <Field
                label="URL slug"
                htmlFor="machine-slug"
                error={errors.slug}
                hint={`Leave blank to generate from the name. Page address: /machines/${values.slug || 'machine-name'}`}
              >
                <Input
                  id="machine-slug"
                  value={values.slug}
                  onChange={(event) => set('slug', event.target.value)}
                  placeholder="pqc-paver-machine"
                  className="font-mono"
                />
              </Field>

              <Field
                label="Description"
                htmlFor="machine-description"
                error={errors.description}
                hint="Describe what the machine does and where it is used. Leave a blank line between paragraphs."
              >
                <Textarea
                  id="machine-description"
                  rows={8}
                  value={values.description}
                  onChange={(event) => set('description', event.target.value)}
                  placeholder="Used for laying Pavement Quality Concrete on road and highway projects…"
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Add only specifications you can confirm. The website shows exactly these rows and nothing
                else — no figures are estimated or filled in automatically.
              </p>

              {values.specifications.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                  No specifications added. The specifications table will be hidden on the public page.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {values.specifications.map((spec, index) => (
                    <li key={index} className="grid gap-2 sm:grid-cols-[1fr_1.3fr_auto]">
                      <Input
                        value={spec.label}
                        onChange={(event) => updateSpec(index, { label: event.target.value })}
                        placeholder="Engine power"
                        aria-label={`Specification ${index + 1} label`}
                      />
                      <Input
                        value={spec.value}
                        onChange={(event) => updateSpec(index, { value: event.target.value })}
                        placeholder="e.g. 110 HP"
                        aria-label={`Specification ${index + 1} value`}
                      />
                      <Button
                        type="button"
                        size="icon-lg"
                        variant="ghost"
                        onClick={() =>
                          set(
                            'specifications',
                            values.specifications.filter((_, position) => position !== index),
                          )
                        }
                        aria-label={`Remove specification ${index + 1}`}
                        className="text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => set('specifications', [...values.specifications, { label: '', value: '' }])}
                  disabled={values.specifications.length >= 40}
                >
                  <Plus /> Add specification
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <ImageUploader
                value={values.mainImage}
                onChange={(url) => set('mainImage', url)}
                folder="machines"
                label="Main image"
              />
              <GalleryUploader
                value={values.galleryImages}
                onChange={(urls) => set('galleryImages', urls)}
                folder="machines"
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
              <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                <label htmlFor="machine-published" className="min-w-0 cursor-pointer">
                  <span className="block text-sm font-medium">Published</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {values.published
                      ? 'Listed on the public Machines page.'
                      : 'Hidden from visitors until you publish.'}
                  </span>
                </label>
                <Switch
                  id="machine-published"
                  checked={values.published}
                  onCheckedChange={(checked) => set('published', checked)}
                  aria-label="Published"
                />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                <label htmlFor="machine-featured" className="min-w-0 cursor-pointer">
                  <span className="block text-sm font-medium">Featured</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Shown on the homepage and at the top of the Machines page.
                  </span>
                </label>
                <Switch
                  id="machine-featured"
                  checked={values.featured}
                  onCheckedChange={(checked) => set('featured', checked)}
                  aria-label="Featured"
                />
              </div>

              <Button type="submit" size="lg" className="mt-1 h-11 w-full" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create machine'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Category" htmlFor="machine-category" error={errors.category}>
                <Input
                  id="machine-category"
                  list="machine-categories"
                  value={values.category}
                  onChange={(event) => set('category', event.target.value)}
                  placeholder="Road Construction Equipment"
                />
                <datalist id="machine-categories">
                  {CATEGORY_SUGGESTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </Field>

              <Field label="Availability" htmlFor="availability" error={errors.availability}>
                <Select
                  id="availability"
                  value={values.availability}
                  onChange={(event) => set('availability', event.target.value as Machine['availability'])}
                >
                  {MACHINE_AVAILABILITY.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Capacity"
                htmlFor="capacity"
                error={errors.capacity}
                hint="Optional. Leave blank if you do not want to state a figure."
              >
                <Input
                  id="capacity"
                  value={values.capacity}
                  onChange={(event) => set('capacity', event.target.value)}
                  placeholder="e.g. 7.5 m paving width"
                />
              </Field>

              <Field label="Applications" error={errors.applications}>
                <TagInput
                  value={values.applications}
                  onChange={(applications) => set('applications', applications)}
                  suggestions={APPLICATION_SUGGESTIONS}
                  placeholder="Add an application"
                />
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
