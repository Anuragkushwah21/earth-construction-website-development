'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ImageOff, Loader2, Pencil, Plus, Save, Trash2, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUploader } from '@/components/admin/image-uploader'
import { TagInput } from '@/components/admin/tag-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SERVICE_ICON_NAMES, ServiceIcon } from '@/components/site/service-icon'
import { ApiError, api } from '@/lib/api-client'
import type { Service } from '@/lib/types'

type FormState = {
  title: string
  slug: string
  image: string
  icon: string
  shortDescription: string
  description: string
  benefits: string[]
  featured: boolean
  published: boolean
  displayOrder: number
}

function initialState(service?: Service): FormState {
  return {
    title: service?.title ?? '',
    slug: service?.slug ?? '',
    image: service?.image ?? '',
    icon: service?.icon ?? 'Ruler',
    shortDescription: service?.shortDescription ?? '',
    description: service?.description ?? '',
    benefits: service?.benefits ?? [],
    featured: service?.featured ?? false,
    published: service?.published ?? true,
    displayOrder: service?.displayOrder ?? 0,
  }
}

export function ServiceManager() {
  const router = useRouter()
  const [services, setServices] = React.useState<Service[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [editing, setEditing] = React.useState<Service | 'new' | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<Service | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.get<{ data: Service[] }>('/api/admin/services')
      setServices(result.data)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load services.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  async function togglePublished(service: Service) {
    setBusyId(service.id)
    try {
      await api.patch(`/api/admin/services/${service.id}`, {
        ...toPayload(service),
        published: !service.published,
      })
      setServices((current) =>
        current.map((item) =>
          item.id === service.id ? { ...item, published: !item.published } : item,
        ),
      )
      toast.success(service.published ? 'Service hidden from the website.' : 'Service published.')
      router.refresh()
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Update failed.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return
    try {
      await api.delete(`/api/admin/services/${pendingDelete.id}`)
      toast.success(`"${pendingDelete.title}" was deleted.`)
      setPendingDelete(null)
      load()
      router.refresh()
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Delete failed.')
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="lg" onClick={() => setEditing('new')}>
          <Plus /> Add service
        </Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {error}{' '}
          <button type="button" onClick={load} className="font-semibold underline">
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={<Wrench />}
          title="No services in the database yet"
          description="The public Services page is currently showing the eight default services from the company profile. Add them to the database to make them editable — or load the starter content from the dashboard."
          action={
            <Button size="lg" onClick={() => setEditing('new')}>
              <Plus /> Add a service
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <li key={service.id} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {service.image ? (
                  <Image src={service.image} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <span className="grid h-full place-items-center text-muted-foreground">
                    <ServiceIcon name={service.icon} size={20} />
                  </span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-medium">{service.title}</span>
                  <Badge variant={service.published ? 'success' : 'muted'}>
                    {service.published ? 'Published' : 'Hidden'}
                  </Badge>
                  <Badge variant="outline">#{service.displayOrder}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {service.shortDescription || 'No short description set.'}
                </p>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant={service.published ? 'secondary' : 'outline'}
                    onClick={() => togglePublished(service)}
                    disabled={busyId === service.id}
                  >
                    {busyId === service.id ? (
                      <Loader2 className="animate-spin" />
                    ) : service.published ? (
                      <EyeOff />
                    ) : (
                      <Eye />
                    )}
                    {service.published ? 'Hide' : 'Publish'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(service)}>
                    <Pencil /> Edit
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setPendingDelete(service)}
                    aria-label={`Delete ${service.title}`}
                    className="text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <ServiceDialog
          service={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
            router.refresh()
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this service?"
        description={
          <>
            <strong>{pendingDelete?.title}</strong> will be removed from the Services page and its own service
            page will stop working.
          </>
        }
        confirmLabel="Delete service"
      />
    </>
  )
}

function ServiceDialog({
  service,
  onClose,
  onSaved,
}: {
  service?: Service
  onClose: () => void
  onSaved: () => void
}) {
  const [values, setValues] = React.useState<FormState>(() => initialState(service))
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function save() {
    setSaving(true)
    setErrors({})
    setFormError('')
    try {
      if (service) {
        await api.patch(`/api/admin/services/${service.id}`, values)
        toast.success('Service saved.')
      } else {
        await api.post('/api/admin/services', values)
        toast.success('Service created.')
      }
      onSaved()
    } catch (caught) {
      if (caught instanceof ApiError) {
        setErrors(caught.fields)
        setFormError(caught.message)
      } else {
        setFormError('Could not save. Please try again.')
      }
      setSaving(false)
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={service ? `Edit ${service.title}` : 'Add a service'}
      className="sm:max-w-2xl"
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="lg" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            {saving ? 'Saving…' : 'Save service'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {formError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        <Field label="Title" htmlFor="service-title" error={errors.title} required>
          <Input
            id="service-title"
            value={values.title}
            onChange={(event) => set('title', event.target.value)}
            placeholder="Road Construction"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="URL slug"
            htmlFor="service-slug"
            error={errors.slug}
            hint="Leave blank to generate from the title."
          >
            <Input
              id="service-slug"
              value={values.slug}
              onChange={(event) => set('slug', event.target.value)}
              placeholder="road-construction"
              className="font-mono"
            />
          </Field>

          <Field label="Icon" htmlFor="service-icon" error={errors.icon}>
            <Select
              id="service-icon"
              value={values.icon}
              onChange={(event) => set('icon', event.target.value)}
            >
              {SERVICE_ICON_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Short description" htmlFor="service-short" error={errors.shortDescription}>
          <Textarea
            id="service-short"
            rows={2}
            value={values.shortDescription}
            onChange={(event) => set('shortDescription', event.target.value)}
            placeholder="One sentence shown on service cards."
          />
        </Field>

        <Field label="Full description" htmlFor="service-description" error={errors.description}>
          <Textarea
            id="service-description"
            rows={6}
            value={values.description}
            onChange={(event) => set('description', event.target.value)}
          />
        </Field>

        <Field label="Key benefits" error={errors.benefits}>
          <TagInput
            value={values.benefits}
            onChange={(benefits) => set('benefits', benefits)}
            placeholder="Add a benefit"
          />
        </Field>

        <ImageUploader
          value={values.image}
          onChange={(url) => set('image', url)}
          folder="services"
          label="Service image"
          hint="Optional. An icon is shown when no image is uploaded."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Display order"
            htmlFor="service-order"
            error={errors.displayOrder}
            hint="Lower numbers appear first."
          >
            <Input
              id="service-order"
              type="number"
              min={0}
              value={values.displayOrder}
              onChange={(event) => set('displayOrder', Number(event.target.value))}
            />
          </Field>

          <div className="flex items-end">
            <div className="flex w-full items-center justify-between gap-4 rounded-lg border border-border p-3">
              <label htmlFor="service-published" className="cursor-pointer text-sm font-medium">
                Published
              </label>
              <Switch
                id="service-published"
                checked={values.published}
                onCheckedChange={(checked) => set('published', checked)}
                aria-label="Published"
              />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

function toPayload(service: Service) {
  return {
    title: service.title,
    slug: service.slug,
    image: service.image,
    icon: service.icon,
    shortDescription: service.shortDescription,
    description: service.description,
    benefits: service.benefits,
    featured: service.featured,
    published: service.published,
    displayOrder: service.displayOrder,
  }
}
