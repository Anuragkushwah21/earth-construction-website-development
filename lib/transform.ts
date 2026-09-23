import { sanitizeRichText, sanitizeText } from '@/lib/security'
import type {
  CompanySettingsInput,
  MachineInput,
  ServiceInput,
  StaffInput,
  WorkInput,
} from '@/lib/validation'

/**
 * Turns a validated payload into the document shape stored in Mongo, running
 * every free-text field through the sanitiser on the way. Create and update
 * handlers share these so the two paths cannot drift apart.
 */

export function toWorkDocument(input: WorkInput) {
  return {
    title: sanitizeText(input.title, 180),
    coverImage: input.coverImage,
    galleryImages: input.galleryImages.filter(Boolean),
    shortDescription: sanitizeText(input.shortDescription, 400),
    description: sanitizeRichText(input.description),
    category: sanitizeText(input.category, 120),
    location: sanitizeText(input.location, 200),
    client: sanitizeText(input.client, 200),
    startDate: input.startDate ? new Date(input.startDate) : null,
    completionYear: sanitizeText(input.completionYear, 40),
    status: input.status,
    services: input.services.map((value) => sanitizeText(value, 160)).filter(Boolean),
    featured: input.featured,
    published: input.published,
  }
}

export function toMachineDocument(input: MachineInput) {
  return {
    name: sanitizeText(input.name, 180),
    category: sanitizeText(input.category, 120),
    mainImage: input.mainImage,
    galleryImages: input.galleryImages.filter(Boolean),
    description: sanitizeRichText(input.description),
    specifications: input.specifications
      .map((spec) => ({ label: sanitizeText(spec.label, 120), value: sanitizeText(spec.value, 200) }))
      .filter((spec) => spec.label && spec.value),
    capacity: sanitizeText(input.capacity, 160),
    applications: input.applications.map((value) => sanitizeText(value, 160)).filter(Boolean),
    availability: input.availability,
    featured: input.featured,
    published: input.published,
  }
}

export function toStaffDocument(input: StaffInput) {
  return {
    name: sanitizeText(input.name, 140),
    designation: sanitizeText(input.designation, 140),
    department: sanitizeText(input.department, 140),
    profileImage: input.profileImage,
    bio: sanitizeRichText(input.bio, 4000),
    experience: sanitizeText(input.experience, 140),
    skills: input.skills.map((value) => sanitizeText(value, 160)).filter(Boolean),
    contactEmail: input.contactEmail,
    contactPhone: sanitizeText(input.contactPhone, 40),
    showContact: input.showContact,
    published: input.published,
    active: input.active,
    displayOrder: input.displayOrder,
  }
}

export function toServiceDocument(input: ServiceInput) {
  return {
    title: sanitizeText(input.title, 160),
    image: input.image,
    icon: sanitizeText(input.icon, 60) || 'Ruler',
    shortDescription: sanitizeText(input.shortDescription, 400),
    description: sanitizeRichText(input.description),
    benefits: input.benefits.map((value) => sanitizeText(value, 160)).filter(Boolean),
    featured: input.featured,
    published: input.published,
    displayOrder: input.displayOrder,
  }
}

export function toCompanySettingsDocument(input: CompanySettingsInput) {
  return {
    companyName: sanitizeText(input.companyName, 180),
    tagline: sanitizeText(input.tagline, 200),
    establishedDate: sanitizeText(input.establishedDate, 80),
    address: sanitizeText(input.address, 400),
    phone: input.phone.map((value) => sanitizeText(value, 30)).filter(Boolean),
    email: input.email,
    gstin: sanitizeText(input.gstin, 40),
    logo: input.logo,
    favicon: input.favicon,
    about: sanitizeRichText(input.about),
    vision: sanitizeRichText(input.vision),
    mission: sanitizeRichText(input.mission),
    safetyCompliance: sanitizeRichText(input.safetyCompliance),
    sustainability: sanitizeRichText(input.sustainability),
    ceo: {
      name: sanitizeText(input.ceo?.name ?? '', 140),
      title: sanitizeText(input.ceo?.title ?? '', 140) || 'CEO',
      bio: sanitizeRichText(input.ceo?.bio ?? '', 4000),
      image: input.ceo?.image ?? '',
    },
    headOfProjects: {
      name: sanitizeText(input.headOfProjects?.name ?? '', 140),
      title: sanitizeText(input.headOfProjects?.title ?? '', 140) || 'Head of Projects',
      bio: sanitizeRichText(input.headOfProjects?.bio ?? '', 4000),
      image: input.headOfProjects?.image ?? '',
    },
    socialLinks: {
      facebook: sanitizeText(input.socialLinks?.facebook ?? '', 300),
      instagram: sanitizeText(input.socialLinks?.instagram ?? '', 300),
      linkedin: sanitizeText(input.socialLinks?.linkedin ?? '', 300),
      youtube: sanitizeText(input.socialLinks?.youtube ?? '', 300),
      twitter: sanitizeText(input.socialLinks?.twitter ?? '', 300),
    },
    mapEmbedUrl: sanitizeText(input.mapEmbedUrl, 1000),
  }
}
