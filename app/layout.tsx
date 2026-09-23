import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { getCompanySettings } from '@/lib/data'
import './globals.css'

export const dynamic = 'force-dynamic'

/** Site-wide metadata is built from the admin-managed company settings. */
export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanySettings()
  const title = `${company.companyName} | ${company.tagline}`
  const description =
    'Earth Construction Company delivers road construction, PQC/CC roads, structural engineering, drainage systems, canal construction, groove cutting, labour supply and project management across India.'

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: { default: title, template: `%s | ${company.companyName}` },
    description,
    keywords: [
      company.companyName,
      'road construction',
      'PQC roads',
      'CC roads',
      'groove cutting',
      'canal construction',
      'drainage systems',
      'labour supply',
      'construction company Gwalior',
      'infrastructure Madhya Pradesh',
    ],
    openGraph: {
      type: 'website',
      siteName: company.companyName,
      title,
      description,
      locale: 'en_IN',
      images: [{ url: '/earth-construction-hero.png', width: 1200, height: 630, alt: company.companyName }],
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
    // Without an admin-supplied favicon the app/icon.png and app/apple-icon.png
    // file conventions supply the company mark, so nothing is declared here.
    icons: company.favicon ? { icon: [{ url: company.favicon }], apple: company.favicon } : undefined,
  }
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1c211f',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The site's design system is a fixed light palette (charcoal / paper /
    // amber) with no dark variant. The `light` class opts out of the
    // `prefers-color-scheme: dark` block in globals.css, which would otherwise
    // flip the shadcn tokens used by the dashboard and leave text unreadable.
    <html lang="en" className="light">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
