import { z } from 'zod'
import { INQUIRY_STATUSES, MACHINE_AVAILABILITY, WORK_STATUSES } from '@/lib/types'

/** Every payload is validated here, on the server, before it reaches Mongo. */

const trimmed = (max: number) => z.string().trim().max(max)
const optionalText = (max: number) => trimmed(max).optional().default('')
const stringList = z.array(z.string().trim().min(1).max(160)).max(40).optional().default([])
const imageUrl = z.string().trim().max(600).optional().default('')

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(160),
  password: z.string().min(1, 'Enter your password.').max(200),
})

/** Minimum bar for a new password. Deliberately length-led rather than a
 *  symbol checklist, which mostly pushes people towards weaker patterns. */
export const PASSWORD_MIN_LENGTH = 10

const newPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(200, 'Use at most 200 characters.')
  .refine((value) => /[a-zA-Z]/.test(value), 'Include at least one letter.')
  .refine((value) => /[0-9]/.test(value), 'Include at least one number.')

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(160),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(10, 'This reset link is not valid.').max(200),
    password: newPassword,
    confirmPassword: z.string().max(200),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Both passwords must match.',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.').max(200),
    newPassword,
    confirmPassword: z.string().max(200),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Both passwords must match.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Choose a password you have not used here before.',
    path: ['newPassword'],
  })

export const workSchema = z.object({
  title: trimmed(180).min(2, 'Title is required.'),
  slug: optionalText(120),
  coverImage: imageUrl,
  galleryImages: z.array(z.string().trim().max(600)).max(30).optional().default([]),
  shortDescription: optionalText(400),
  description: optionalText(20000),
  category: optionalText(120),
  location: optionalText(200),
  client: optionalText(200),
  startDate: z.string().trim().max(40).optional().nullable().default(null),
  completionYear: optionalText(40),
  status: z.enum(WORK_STATUSES).optional().default('Completed'),
  services: stringList,
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
})

export const machineSchema = z.object({
  name: trimmed(180).min(2, 'Machine name is required.'),
  slug: optionalText(120),
  category: optionalText(120),
  mainImage: imageUrl,
  galleryImages: z.array(z.string().trim().max(600)).max(30).optional().default([]),
  description: optionalText(20000),
  specifications: z
    .array(z.object({ label: trimmed(120).min(1), value: trimmed(200).min(1) }))
    .max(40)
    .optional()
    .default([]),
  capacity: optionalText(160),
  applications: stringList,
  availability: z.enum(MACHINE_AVAILABILITY).optional().default('Available'),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
})

export const staffSchema = z.object({
  name: trimmed(140).min(2, 'Name is required.'),
  designation: optionalText(140),
  department: optionalText(140),
  profileImage: imageUrl,
  bio: optionalText(4000),
  experience: optionalText(140),
  skills: stringList,
  contactEmail: z
    .union([z.string().trim().toLowerCase().email('Enter a valid email address.').max(160), z.literal('')])
    .optional()
    .default(''),
  contactPhone: optionalText(40),
  showContact: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  displayOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
})

export const serviceSchema = z.object({
  title: trimmed(160).min(2, 'Service title is required.'),
  slug: optionalText(120),
  image: imageUrl,
  icon: optionalText(60),
  shortDescription: optionalText(400),
  description: optionalText(20000),
  benefits: stringList,
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  displayOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
})

export const inquirySchema = z.object({
  name: trimmed(120).min(2, 'Please enter your name.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(160),
  phone: trimmed(30).min(6, 'Please enter a contact number.'),
  subject: optionalText(180),
  message: trimmed(4000).min(10, 'Please tell us a little more about your requirement.'),
  projectType: optionalText(120),
  location: optionalText(160),
  // Hidden field: real people leave it empty, most bots fill it in.
  website: z.string().max(200).optional().default(''),
})

export const inquiryUpdateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  read: z.boolean().optional(),
})

const leaderSchema = z.object({
  name: optionalText(140),
  title: optionalText(140),
  bio: optionalText(4000),
  image: imageUrl,
})

export const companySettingsSchema = z.object({
  companyName: trimmed(180).min(2, 'Company name is required.'),
  tagline: optionalText(200),
  establishedDate: optionalText(80),
  address: optionalText(400),
  phone: z.array(z.string().trim().max(30)).max(6).optional().default([]),
  email: z
    .union([z.string().trim().toLowerCase().email('Enter a valid email address.').max(160), z.literal('')])
    .optional()
    .default(''),
  gstin: optionalText(40),
  logo: imageUrl,
  favicon: imageUrl,
  about: optionalText(20000),
  vision: optionalText(20000),
  mission: optionalText(20000),
  safetyCompliance: optionalText(20000),
  sustainability: optionalText(20000),
  ceo: leaderSchema.optional(),
  headOfProjects: leaderSchema.optional(),
  socialLinks: z
    .object({
      facebook: optionalText(300),
      instagram: optionalText(300),
      linkedin: optionalText(300),
      youtube: optionalText(300),
      twitter: optionalText(300),
    })
    .optional(),
  mapEmbedUrl: optionalText(1000),
})

export type WorkInput = z.infer<typeof workSchema>
export type MachineInput = z.infer<typeof machineSchema>
export type StaffInput = z.infer<typeof staffSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type InquiryInput = z.infer<typeof inquirySchema>
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>

/** Flattens a ZodError into `{ fieldName: 'first message' }` for form display. */
export function fieldErrors(error: z.ZodError) {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form'
    if (!result[key]) result[key] = issue.message
  }
  return result
}
