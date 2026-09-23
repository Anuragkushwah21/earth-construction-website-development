import type { MetadataRoute } from 'next'

// Resolved per request rather than baked in at build time, so changing
// NEXT_PUBLIC_SITE_URL does not require a rebuild.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/admin/', '/api/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
