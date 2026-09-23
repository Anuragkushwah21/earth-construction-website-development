import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { NAV_LINKS } from '@/components/site/nav-links'
import { COMPANY_LOGO } from '@/lib/brand'
import type { CompanySettings } from '@/lib/types'

export function SiteFooter({ company }: { company: CompanySettings }) {
  const [firstWord, ...restWords] = company.companyName.split(' ')
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand-block">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <Image
                src={company.logo || COMPANY_LOGO}
                alt=""
                width={40}
                height={40}
                className="brand-logo"
              />
            </span>
            <span>
              <strong>{(firstWord ?? 'EARTH').toUpperCase()}</strong>
              <small>{restWords.join(' ').toUpperCase() || 'CONSTRUCTION COMPANY'}</small>
            </span>
          </Link>
          <p className="footer-description">
            {company.tagline || 'Building Infrastructure. Delivering Strength.'} A construction and
            infrastructure company delivering roads, structures, drainage and canal works with a focus on
            quality, safety and reliable execution.
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <h2>Quick Links</h2>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="footer-contact">
          <h2>Contact</h2>
          <ul>
            {company.phone.map((number) => (
              <li key={number}>
                <a href={`tel:${number.replace(/\s/g, '')}`}>
                  <Phone size={14} /> {number}
                </a>
              </li>
            ))}
            {company.email ? (
              <li>
                <a href={`mailto:${company.email}`}>
                  <Mail size={14} /> {company.email}
                </a>
              </li>
            ) : null}
            {company.address ? (
              <li className="footer-address">
                <MapPin size={14} /> <span>{company.address}</span>
              </li>
            ) : null}
          </ul>
        </address>
      </div>

      <div className="footer-bottom">
        <span className="footer-meta">
          <span>
            © {year} {company.companyName}. All rights reserved.
          </span>
          <a
            className="footer-developer"
            href="https://anuragkushwah.vercel.app/"
            target="_blank"
            rel="noreferrer noopener"
          >
            Website by <strong>Anurag Kushwah</strong>
            <ArrowUpRight size={12} aria-hidden />
          </a>
        </span>
        <span className="footer-legal">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms &amp; Conditions</Link>
        </span>
      </div>
    </footer>
  )
}
