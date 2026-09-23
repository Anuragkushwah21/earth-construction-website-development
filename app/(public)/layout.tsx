import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { getCompanySettings } from '@/lib/data'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const company = await getCompanySettings()

  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader companyName={company.companyName} logo={company.logo} />
      <main id="main-content" className="page-main">
        {children}
      </main>
      <SiteFooter company={company} />
    </div>
  )
}
