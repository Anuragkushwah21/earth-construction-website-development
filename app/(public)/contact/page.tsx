import type { Metadata } from 'next'
import { Clock, Mail, MapPin, MapPinned, Phone, ReceiptText } from 'lucide-react'
import { InquiryForm } from '@/components/site/inquiry-form'
import { getCompanySettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact Earth Construction Company — Shivnagar, Shamshan Road, Gadaipura, Gwalior, M.P. 474004. Call 6264147250 or 7999270766, or send an inquiry online.',
  openGraph: {
    title: 'Contact Earth Construction Company',
    description: 'Call, email or send an inquiry to Earth Construction Company, Gwalior, Madhya Pradesh.',
  },
}

export default async function ContactPage() {
  const company = await getCompanySettings()

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow light">
          <span className="kicker-line" />
          Contact us
        </p>
        <h1>
          Let&apos;s talk about
          <br />
          <em>your project.</em>
        </h1>
        <p>
          Call us, email us, or send an inquiry below. We respond to every genuine enquiry about road,
          structural, drainage and canal work.
        </p>
      </section>

      <section className="section-pad">
        <div className="contact-layout">
          <div>
            <p className="eyebrow">
              <span className="kicker-line" />
              {company.companyName}
            </p>

            <div className="contact-cards" style={{ marginTop: 26 }}>
              <div className="contact-card">
                <MapPin size={18} aria-hidden />
                <div>
                  <h3>Office address</h3>
                  <p>{company.address}</p>
                </div>
              </div>

              <div className="contact-card">
                <Phone size={18} aria-hidden />
                <div>
                  <h3>Phone</h3>
                  {company.phone.map((number) => (
                    <a key={number} href={`tel:${number.replace(/\s/g, '')}`}>
                      {number}
                    </a>
                  ))}
                  <div className="contact-quick-actions">
                    {company.phone[0] ? (
                      <a
                        className="button button-dark"
                        href={`tel:${company.phone[0].replace(/\s/g, '')}`}
                      >
                        <Phone size={15} aria-hidden /> Call now
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              {company.email ? (
                <div className="contact-card">
                  <Mail size={18} aria-hidden />
                  <div>
                    <h3>Email</h3>
                    <a href={`mailto:${company.email}`}>{company.email}</a>
                    <div className="contact-quick-actions">
                      <a className="button button-accent" href={`mailto:${company.email}`}>
                        <Mail size={15} aria-hidden /> Email us
                      </a>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="contact-card">
                <Clock size={18} aria-hidden />
                <div>
                  <h3>Established</h3>
                  <p>{company.establishedDate}</p>
                </div>
              </div>

              {company.gstin ? (
                <div className="contact-card">
                  <ReceiptText size={18} aria-hidden />
                  <div>
                    <h3>GSTIN</h3>
                    <p>{company.gstin}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="map-frame">
              {company.mapEmbedUrl ? (
                <iframe
                  src={company.mapEmbedUrl}
                  title={`Map showing ${company.companyName}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="map-placeholder">
                  <MapPinned size={30} aria-hidden />
                  <p>
                    A Google Maps embed can be added from the admin dashboard under Company Settings, and it
                    will appear here.
                  </p>
                  <a
                    className="text-link"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Open address in Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>

          <InquiryForm />
        </div>
      </section>
    </>
  )
}
