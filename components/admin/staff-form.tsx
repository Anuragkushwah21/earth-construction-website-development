'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save, ShieldAlert, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUploader } from '@/components/admin/image-uploader'
import { TagInput } from '@/components/admin/tag-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, api } from '@/lib/api-client'
import type { Staff } from '@/lib/types'

const SKILL_SUGGESTIONS = [
  'Project Planning',
  'Site Supervision',
  'Quality Control',
  'Safety & Compliance',
  'Surveying',
  'Machine Operation',
  'Resource Management',
]

type FormState = {
  name: string
  designation: string
  department: string
  profileImage: string
  bio: string
  experience: string
  skills: string[]
  contactEmail: string
  contactPhone: string
  showContact: boolean
  published: boolean
  active: boolean
  displayOrder: number
}

function initialState(member?: Staff): FormState {
  return {
    name: member?.name ?? '',
    designation: member?.designation ?? '',
    department: member?.department ?? '',
    profileImage: member?.profileImage ?? '',
    bio: member?.bio ?? '',
    experience: member?.experience ?? '',
    skills: member?.skills ?? [],
    contactEmail: member?.contactEmail ?? '',
    contactPhone: member?.contactPhone ?? '',
    showContact: member?.showContact ?? false,
    published: member?.published ?? false,
    active: member?.active ?? true,
    displayOrder: member?.displayOrder ?? 0,
  }
}

export function StaffForm({ member }: { member?: Staff }) {
  const router = useRouter()
  const isEdit = Boolean(member)
  const [values, setValues] = React.useState<FormState>(() => initialState(member))
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

    try {
      if (isEdit && member) {
        await api.patch(`/api/admin/staff/${member.id}`, values)
        toast.success('Profile saved.')
      } else {
        const created = await api.post<{ data: Staff }>('/api/admin/staff', values)
        toast.success('Team member added.')
        router.push(`/admin/staff/${created.data.id}`)
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
      <div className="mb-5">
        <Button variant="ghost" size="sm" render={<Link href="/admin/staff" />}>
          <ArrowLeft /> Back to staff
        </Button>
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
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Full name" htmlFor="staff-name" error={errors.name} required>
                <Input
                  id="staff-name"
                  value={values.name}
                  onChange={(event) => set('name', event.target.value)}
                  placeholder="Full name"
                  aria-invalid={Boolean(errors.name)}
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Designation" htmlFor="designation" error={errors.designation}>
                  <Input
                    id="designation"
                    value={values.designation}
                    onChange={(event) => set('designation', event.target.value)}
                    placeholder="Site Engineer"
                  />
                </Field>

                <Field label="Department" htmlFor="department" error={errors.department}>
                  <Input
                    id="department"
                    value={values.department}
                    onChange={(event) => set('department', event.target.value)}
                    placeholder="Projects"
                  />
                </Field>
              </div>

              <Field
                label="Experience"
                htmlFor="experience"
                error={errors.experience}
                hint="Free text, for example: 8 years, or Since 2016."
              >
                <Input
                  id="experience"
                  value={values.experience}
                  onChange={(event) => set('experience', event.target.value)}
                  placeholder="8 years"
                />
              </Field>

              <Field label="Short bio" htmlFor="bio" error={errors.bio}>
                <Textarea
                  id="bio"
                  rows={5}
                  value={values.bio}
                  onChange={(event) => set('bio', event.target.value)}
                  placeholder="A few sentences about their role and responsibilities."
                />
              </Field>

              <Field label="Skills" error={errors.skills}>
                <TagInput
                  value={values.skills}
                  onChange={(skills) => set('skills', skills)}
                  suggestions={SKILL_SUGGESTIONS}
                  placeholder="Add a skill"
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                <p className="m-0">
                  Contact details are stored privately. They are only shown on the public team page if you
                  turn on &ldquo;Show contact publicly&rdquo; below.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" htmlFor="contactEmail" error={errors.contactEmail}>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={values.contactEmail}
                    onChange={(event) => set('contactEmail', event.target.value)}
                    placeholder="name@example.com"
                    aria-invalid={Boolean(errors.contactEmail)}
                  />
                </Field>

                <Field label="Phone" htmlFor="contactPhone" error={errors.contactPhone}>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={values.contactPhone}
                    onChange={(event) => set('contactPhone', event.target.value)}
                    placeholder="10-digit mobile number"
                  />
                </Field>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                <label htmlFor="showContact" className="min-w-0 cursor-pointer">
                  <span className="block text-sm font-medium">Show contact publicly</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Off by default. Only turn this on with the person&rsquo;s consent.
                  </span>
                </label>
                <Switch
                  id="showContact"
                  checked={values.showContact}
                  onCheckedChange={(checked) => set('showContact', checked)}
                  aria-label="Show contact publicly"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                <label htmlFor="staff-published" className="min-w-0 cursor-pointer">
                  <span className="block text-sm font-medium">Published</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Shown on the public Team page.
                  </span>
                </label>
                <Switch
                  id="staff-published"
                  checked={values.published}
                  onCheckedChange={(checked) => set('published', checked)}
                  aria-label="Published"
                />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                <label htmlFor="staff-active" className="min-w-0 cursor-pointer">
                  <span className="block text-sm font-medium">Active</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Turn off when someone leaves, instead of deleting the record.
                  </span>
                </label>
                <Switch
                  id="staff-active"
                  checked={values.active}
                  onCheckedChange={(checked) => set('active', checked)}
                  aria-label="Active"
                />
              </div>

              <Field
                label="Display order"
                htmlFor="displayOrder"
                error={errors.displayOrder}
                hint="Lower numbers appear first on the Team page."
              >
                <Input
                  id="displayOrder"
                  type="number"
                  min={0}
                  value={values.displayOrder}
                  onChange={(event) => set('displayOrder', Number(event.target.value))}
                />
              </Field>

              <Button type="submit" size="lg" className="mt-1 h-11 w-full" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add team member'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader
                value={values.profileImage}
                onChange={(url) => set('profileImage', url)}
                folder="staff"
                label="Profile photo"
                aspect="square"
                hint="Optional. A monogram is shown when no photo is uploaded."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
