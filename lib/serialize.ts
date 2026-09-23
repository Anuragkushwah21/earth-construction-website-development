import type {
  CompanySettings,
  Inquiry,
  Machine,
  Service,
  Staff,
  Work,
} from '@/lib/types'

/* eslint-disable @typescript-eslint/no-explicit-any */

const str = (value: unknown, fallback = '') =>
  value === null || value === undefined ? fallback : String(value)

const bool = (value: unknown, fallback = false) =>
  value === null || value === undefined ? fallback : Boolean(value)

const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : []

const date = (value: unknown): string =>
  value instanceof Date ? value.toISOString() : value ? new Date(String(value)).toISOString() : ''

const nullableDate = (value: unknown): string | null =>
  value ? date(value) : null

export function serializeWork(doc: any): Work {
  return {
    id: String(doc._id),
    title: str(doc.title),
    slug: str(doc.slug),
    coverImage: str(doc.coverImage),
    galleryImages: list(doc.galleryImages),
    shortDescription: str(doc.shortDescription),
    description: str(doc.description),
    category: str(doc.category),
    location: str(doc.location),
    client: str(doc.client),
    startDate: nullableDate(doc.startDate),
    completionYear: str(doc.completionYear),
    status: (doc.status ?? 'Completed') as Work['status'],
    services: list(doc.services),
    featured: bool(doc.featured),
    published: bool(doc.published),
    isDemo: bool(doc.isDemo),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  }
}

export function serializeMachine(doc: any): Machine {
  return {
    id: String(doc._id),
    name: str(doc.name),
    slug: str(doc.slug),
    category: str(doc.category),
    mainImage: str(doc.mainImage),
    galleryImages: list(doc.galleryImages),
    description: str(doc.description),
    specifications: Array.isArray(doc.specifications)
      ? doc.specifications
          .map((spec: any) => ({ label: str(spec?.label), value: str(spec?.value) }))
          .filter((spec: any) => spec.label && spec.value)
      : [],
    capacity: str(doc.capacity),
    applications: list(doc.applications),
    availability: (doc.availability ?? 'Available') as Machine['availability'],
    featured: bool(doc.featured),
    published: bool(doc.published),
    isDemo: bool(doc.isDemo),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  }
}

export function serializeStaff(doc: any): Staff {
  return {
    id: String(doc._id),
    name: str(doc.name),
    designation: str(doc.designation),
    department: str(doc.department),
    profileImage: str(doc.profileImage),
    bio: str(doc.bio),
    experience: str(doc.experience),
    skills: list(doc.skills),
    contactEmail: str(doc.contactEmail),
    contactPhone: str(doc.contactPhone),
    showContact: bool(doc.showContact),
    published: bool(doc.published),
    active: bool(doc.active, true),
    displayOrder: Number(doc.displayOrder ?? 0),
    isDemo: bool(doc.isDemo),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  }
}

/**
 * Contact details stay private unless the admin explicitly published them,
 * so the public team page never leaks a staff member's phone or email.
 */
export function serializePublicStaff(doc: any): Staff {
  const staff = serializeStaff(doc)
  if (staff.showContact) return staff
  return { ...staff, contactEmail: '', contactPhone: '' }
}

export function serializeInquiry(doc: any): Inquiry {
  return {
    id: String(doc._id),
    name: str(doc.name),
    email: str(doc.email),
    phone: str(doc.phone),
    subject: str(doc.subject),
    message: str(doc.message),
    projectType: str(doc.projectType),
    location: str(doc.location),
    status: (doc.status ?? 'New') as Inquiry['status'],
    read: bool(doc.read),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  }
}

export function serializeService(doc: any): Service {
  return {
    id: String(doc._id),
    title: str(doc.title),
    slug: str(doc.slug),
    image: str(doc.image),
    icon: str(doc.icon, 'Ruler'),
    shortDescription: str(doc.shortDescription),
    description: str(doc.description),
    benefits: list(doc.benefits),
    featured: bool(doc.featured),
    published: bool(doc.published, true),
    displayOrder: Number(doc.displayOrder ?? 0),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  }
}

export function serializeCompanySettings(doc: any): CompanySettings {
  return {
    companyName: str(doc.companyName),
    tagline: str(doc.tagline),
    establishedDate: str(doc.establishedDate),
    address: str(doc.address),
    phone: list(doc.phone),
    email: str(doc.email),
    gstin: str(doc.gstin),
    logo: str(doc.logo),
    favicon: str(doc.favicon),
    about: str(doc.about),
    vision: str(doc.vision),
    mission: str(doc.mission),
    safetyCompliance: str(doc.safetyCompliance),
    sustainability: str(doc.sustainability),
    ceo: {
      name: str(doc.ceo?.name),
      title: str(doc.ceo?.title, 'CEO'),
      bio: str(doc.ceo?.bio),
      image: str(doc.ceo?.image),
    },
    headOfProjects: {
      name: str(doc.headOfProjects?.name),
      title: str(doc.headOfProjects?.title, 'Head of Projects'),
      bio: str(doc.headOfProjects?.bio),
      image: str(doc.headOfProjects?.image),
    },
    socialLinks: {
      facebook: str(doc.socialLinks?.facebook),
      instagram: str(doc.socialLinks?.instagram),
      linkedin: str(doc.socialLinks?.linkedin),
      youtube: str(doc.socialLinks?.youtube),
      twitter: str(doc.socialLinks?.twitter),
    },
    mapEmbedUrl: str(doc.mapEmbedUrl),
  }
}
