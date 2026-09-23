import type { Metadata } from 'next'
import { getCompanySettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Earth Construction Company collects, uses and protects the information you submit through this website.',
  robots: { index: true, follow: true },
}

export default async function PrivacyPolicyPage() {
  const company = await getCompanySettings()

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow light">
          <span className="kicker-line" />
          Legal
        </p>
        <h1>Privacy Policy</h1>
        <p>How we handle the information you share with us through this website.</p>
      </section>

      <section className="section-pad">
        <div className="prose-block">
          <p>
            This policy explains what information {company.companyName} collects through this website, why we
            collect it, and what we do with it.
          </p>

          <h2>Information we collect</h2>
          <p>
            We collect only the information you choose to send us through the inquiry form: your name, email
            address, phone number, and the subject, project type, location and message you write. We also
            record the date and time of your submission, and the IP address the request came from, so that we
            can identify and block automated spam.
          </p>

          <h2>How we use it</h2>
          <p>
            We use your details solely to respond to your enquiry and to discuss the work you have asked
            about. We do not sell your information, and we do not use it for marketing unrelated to your
            enquiry.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Inquiries are kept in our system for as long as they remain relevant to an ongoing or potential
            project. You can ask us to delete your enquiry at any time by contacting us at the details below.
          </p>

          <h2>Who can see it</h2>
          <p>
            Inquiries are visible only to authorised staff at {company.companyName} through a
            password-protected admin area. Our website is hosted by third-party infrastructure providers who
            process data on our behalf.
          </p>

          <h2>Cookies</h2>
          <p>
            This website uses a session cookie only for the administrator login. Visiting the public pages
            does not require you to accept any tracking cookie.
          </p>

          <h2>Your rights</h2>
          <p>
            You may ask us what information we hold about you, ask us to correct it, or ask us to delete it.
            Write to us and we will respond.
          </p>

          <h2>Contact</h2>
          <p>
            {company.companyName}
            <br />
            {company.address}
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
