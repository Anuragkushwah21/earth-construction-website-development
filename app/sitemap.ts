import type { MetadataRoute } from 'next'
import { getAllPublishedSlugs } from '@/lib/data'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { works, machines, services } = await getAllPublishedSlugs()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/work`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/machines`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/team`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  return [
    ...staticRoutes,
    ...services.map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
      lastModified: service.updatedAt ?? now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...works.map((work) => ({
      url: `${SITE_URL}/work/${work.slug}`,
      lastModified: work.updatedAt ?? now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...machines.map((machine) => ({
      url: `${SITE_URL}/machines/${machine.slug}`,
      lastModified: machine.updatedAt ?? now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
