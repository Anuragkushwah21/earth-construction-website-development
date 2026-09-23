import 'server-only'

import connectToDatabase, { isDatabaseConfigured } from '@/lib/db'
import CompanySettingsModel from '@/lib/models/company-settings'
import MachineModel from '@/lib/models/machine'
import ServiceModel from '@/lib/models/service'
import StaffModel from '@/lib/models/staff'
import WorkModel from '@/lib/models/work'
import { COMPANY_DEFAULTS, DEFAULT_SERVICES } from '@/lib/company-defaults'
import {
  serializeCompanySettings,
  serializeMachine,
  serializePublicStaff,
  serializeService,
  serializeWork,
} from '@/lib/serialize'
import type { CompanySettings, Machine, Service, Staff, Work } from '@/lib/types'

/**
 * Read helpers for public server components.
 *
 * Each one falls back to an empty result (or documented defaults) if the
 * database is not configured or unreachable, so a misconfigured environment
 * shows an empty state instead of a crashed page.
 */

async function withDb<T>(operation: () => Promise<T>, fallback: T, label: string): Promise<T> {
  if (!isDatabaseConfigured()) return fallback
  try {
    await connectToDatabase()
    return await operation()
  } catch (error) {
    console.error(`[data] ${label} failed:`, error)
    return fallback
  }
}

/* --------------------------------------------------------------- company -- */

export async function getCompanySettings(): Promise<CompanySettings> {
  return withDb(
    async () => {
      const doc = await CompanySettingsModel.findOne({ key: 'default' }).lean()
      if (!doc) return COMPANY_DEFAULTS
      const settings = serializeCompanySettings(doc)
      // Merge so a field the admin has left blank still renders documented copy.
      return {
        ...COMPANY_DEFAULTS,
        ...Object.fromEntries(
          Object.entries(settings).filter(([, value]) => {
            if (Array.isArray(value)) return value.length > 0
            if (value && typeof value === 'object') return true
            return value !== '' && value !== null && value !== undefined
          }),
        ),
        ceo: { ...COMPANY_DEFAULTS.ceo, ...stripEmpty(settings.ceo) },
        headOfProjects: { ...COMPANY_DEFAULTS.headOfProjects, ...stripEmpty(settings.headOfProjects) },
        socialLinks: settings.socialLinks,
      } as CompanySettings
    },
    COMPANY_DEFAULTS,
    'getCompanySettings',
  )
}

function stripEmpty<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== '' && v != null)) as Partial<T>
}

/* -------------------------------------------------------------- services -- */

const FALLBACK_SERVICES: Service[] = DEFAULT_SERVICES.map((service, index) => ({
  id: `default-${service.slug}`,
  title: service.title,
  slug: service.slug,
  image: '',
  icon: service.icon,
  shortDescription: service.shortDescription,
  description: service.description,
  benefits: [...service.benefits],
  featured: service.featured,
  published: true,
  displayOrder: service.displayOrder ?? index,
  createdAt: '',
  updatedAt: '',
}))

export async function getPublishedServices(): Promise<Service[]> {
  return withDb(
    async () => {
      const docs = await ServiceModel.find({ published: true })
        .sort({ displayOrder: 1, createdAt: 1 })
        .lean()
      if (docs.length === 0) return FALLBACK_SERVICES
      return docs.map(serializeService)
    },
    FALLBACK_SERVICES,
    'getPublishedServices',
  )
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return withDb(
    async () => {
      const doc = await ServiceModel.findOne({ slug, published: true }).lean()
      if (doc) return serializeService(doc)
      return FALLBACK_SERVICES.find((service) => service.slug === slug) ?? null
    },
    FALLBACK_SERVICES.find((service) => service.slug === slug) ?? null,
    'getServiceBySlug',
  )
}

/* ------------------------------------------------------------------ work -- */

export type WorkQuery = {
  search?: string
  category?: string
  location?: string
  status?: string
  featuredOnly?: boolean
  limit?: number
  page?: number
}

export async function getPublishedWorks(query: WorkQuery = {}) {
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(48, Math.max(1, query.limit ?? 9))

  return withDb(
    async () => {
      const filter: Record<string, unknown> = { published: true }
      if (query.category) filter.category = query.category
      if (query.location) filter.location = query.location
      if (query.status) filter.status = query.status
      if (query.featuredOnly) filter.featured = true
      if (query.search) {
        const safe = escapeRegex(query.search)
        filter.$or = [
          { title: { $regex: safe, $options: 'i' } },
          { shortDescription: { $regex: safe, $options: 'i' } },
          { location: { $regex: safe, $options: 'i' } },
          { category: { $regex: safe, $options: 'i' } },
          { client: { $regex: safe, $options: 'i' } },
        ]
      }

      const [docs, total] = await Promise.all([
        WorkModel.find(filter)
          .sort({ featured: -1, createdAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .lean(),
        WorkModel.countDocuments(filter),
      ])

      return {
        data: docs.map(serializeWork),
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      }
    },
    { data: [] as Work[], page, pageSize, total: 0, totalPages: 1 },
    'getPublishedWorks',
  )
}

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  return withDb(
    async () => {
      const doc = await WorkModel.findOne({ slug, published: true }).lean()
      return doc ? serializeWork(doc) : null
    },
    null,
    'getWorkBySlug',
  )
}

export async function getRelatedWorks(work: Work, limit = 3): Promise<Work[]> {
  return withDb(
    async () => {
      const docs = await WorkModel.find({
        published: true,
        _id: { $ne: work.id },
        $or: [
          { category: work.category || '__none__' },
          { services: { $in: work.services.length ? work.services : ['__none__'] } },
          { location: work.location || '__none__' },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()

      if (docs.length > 0) return docs.map(serializeWork)

      const latest = await WorkModel.find({ published: true, _id: { $ne: work.id } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
      return latest.map(serializeWork)
    },
    [],
    'getRelatedWorks',
  )
}

export async function getWorksForService(serviceTitle: string, limit = 3): Promise<Work[]> {
  return withDb(
    async () => {
      const docs = await WorkModel.find({ published: true, services: serviceTitle })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
      return docs.map(serializeWork)
    },
    [],
    'getWorksForService',
  )
}

export async function getWorkFilterOptions() {
  return withDb(
    async () => {
      const [categories, locations] = await Promise.all([
        WorkModel.distinct('category', { published: true }),
        WorkModel.distinct('location', { published: true }),
      ])
      return {
        categories: (categories as string[]).filter(Boolean).sort(),
        locations: (locations as string[]).filter(Boolean).sort(),
      }
    },
    { categories: [] as string[], locations: [] as string[] },
    'getWorkFilterOptions',
  )
}

/* -------------------------------------------------------------- machines -- */

export type MachineQuery = {
  search?: string
  category?: string
  availability?: string
  featuredOnly?: boolean
  limit?: number
  page?: number
}

export async function getPublishedMachines(query: MachineQuery = {}) {
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(48, Math.max(1, query.limit ?? 9))

  return withDb(
    async () => {
      const filter: Record<string, unknown> = { published: true }
      if (query.category) filter.category = query.category
      if (query.availability) filter.availability = query.availability
      if (query.featuredOnly) filter.featured = true
      if (query.search) {
        const safe = escapeRegex(query.search)
        filter.$or = [
          { name: { $regex: safe, $options: 'i' } },
          { description: { $regex: safe, $options: 'i' } },
          { category: { $regex: safe, $options: 'i' } },
        ]
      }

      const [docs, total] = await Promise.all([
        MachineModel.find(filter)
          .sort({ featured: -1, createdAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .lean(),
        MachineModel.countDocuments(filter),
      ])

      return {
        data: docs.map(serializeMachine),
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      }
    },
    { data: [] as Machine[], page, pageSize, total: 0, totalPages: 1 },
    'getPublishedMachines',
  )
}

export async function getMachineBySlug(slug: string): Promise<Machine | null> {
  return withDb(
    async () => {
      const doc = await MachineModel.findOne({ slug, published: true }).lean()
      return doc ? serializeMachine(doc) : null
    },
    null,
    'getMachineBySlug',
  )
}

export async function getMachineFilterOptions() {
  return withDb(
    async () => {
      const categories = await MachineModel.distinct('category', { published: true })
      return { categories: (categories as string[]).filter(Boolean).sort() }
    },
    { categories: [] as string[] },
    'getMachineFilterOptions',
  )
}

/* ----------------------------------------------------------------- staff -- */

export async function getPublishedStaff(limit?: number): Promise<Staff[]> {
  return withDb(
    async () => {
      let queryBuilder = StaffModel.find({ published: true, active: true }).sort({
        displayOrder: 1,
        createdAt: 1,
      })
      if (limit) queryBuilder = queryBuilder.limit(limit)
      const docs = await queryBuilder.lean()
      return docs.map(serializePublicStaff)
    },
    [],
    'getPublishedStaff',
  )
}

/* ----------------------------------------------------------------- utils -- */

export function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 120)
}

type SlugEntry = { slug: string; updatedAt?: Date }

/** Every published slug, used to build the sitemap. */
export async function getAllPublishedSlugs() {
  return withDb<{ works: SlugEntry[]; machines: SlugEntry[]; services: SlugEntry[] }>(
    async () => {
      const [works, machines, services] = await Promise.all([
        WorkModel.find({ published: true }).select('slug updatedAt').lean(),
        MachineModel.find({ published: true }).select('slug updatedAt').lean(),
        ServiceModel.find({ published: true }).select('slug updatedAt').lean(),
      ])
      const toEntry = (doc: { slug?: unknown; updatedAt?: unknown }): SlugEntry => ({
        slug: String(doc.slug),
        updatedAt: doc.updatedAt as Date | undefined,
      })

      return {
        works: works.map(toEntry),
        machines: machines.map(toEntry),
        services: services.map(toEntry),
      }
    },
    {
      works: [],
      machines: [],
      services: DEFAULT_SERVICES.map((service) => ({ slug: service.slug })),
    },
    'getAllPublishedSlugs',
  )
}
