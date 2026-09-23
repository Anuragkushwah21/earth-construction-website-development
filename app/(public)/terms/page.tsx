import type { Metadata } from 'next'
import { getCompanySettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms governing the use of the Earth Construction Company website.',
  robots: { index: true, follow: true },
}

export default async function TermsPage() {
  const company = await getCompanySettings()

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow light">
          <span className="kicker-line" />
          Legal
        </p>
        <h1>Terms &amp; Conditions</h1>
        <p>The terms under which you may use this website.</p>
      </section>

      <section className="section-pad">
        <div className="prose-block">
          <p>
            By using this website you agree to the terms set out below. If you do not agree with them, please
            do not use the site.
          </p>

          <h2>About this website</h2>
          <p>
            This website is operated by {company.companyName}, {company.address}. It describes the services
            we offer and the projects we have delivered.
          </p>

          <h2>Accuracy of content</h2>
          <p>
            Project details, service descriptions and equipment listings are published in good faith and are
            kept up to date by our team. They describe work we have carried out and capabilities we offer;
            they do not by themselves form a quotation, a tender response or a contractual commitment.
          </p>

          <h2>Enquiries are not contracts</h2>
          <p>
            Submitting the inquiry form starts a conversation. It does not create a binding agreement between
            you and {company.companyName}. Any work we undertake is governed by a separate written work order
            or contract agreed between the parties.
          </p>

          <h2>Intellectual property</h2>
          <p>
            The text, project photographs, logo and layout of this website belong to {company.companyName}
            unless stated otherwise. You may not reproduce them for commercial purposes without our written
            permission.
          </p>

          <h2>External links</h2>
          <p>
            Where this site links to other websites, we are not responsible for their content or their
            privacy practices.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            We make reasonable efforts to keep this website accurate and available, but we do not guarantee
            uninterrupted access. To the extent permitted by law, we are not liable for loss arising from
            reliance on information published here alone.
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of India, and the courts at Gwalior, Madhya Pradesh shall
            have jurisdiction over any dispute relating to this website.
          </p>

          <h2>Contact</h2>
          <p>
            {company.companyName}
            {company.email ? (
              <>
                <br />
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </>
            ) : null}
            {company.phone.length > 0 ? (
              <>
                <br />
                {company.phone.join(' · ')}
              </>
            ) : null}
          </p>

          <p>
            <em>Last updated: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</em>
          </p>
        </div>
      </section>
    </>
  )
}
