'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, X } from 'lucide-react'
import { NAV_LINKS } from '@/components/site/nav-links'
import { COMPANY_LOGO } from '@/lib/brand'

type SiteHeaderProps = {
  companyName: string
  logo?: string
}

export function SiteHeader({ companyName, logo }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const pathname = usePathname()

  // Close the mobile menu whenever navigation happens.
  React.useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const [firstWord, ...restWords] = companyName.split(' ')

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label={`${companyName} home`}>
        <span className="brand-mark">
          <Image
            src={logo || COMPANY_LOGO}
            alt=""
            width={40}
            height={40}
            className="brand-logo"
            priority
          />
        </span>
        <span>
          <strong>{(firstWord ?? 'EARTH').toUpperCase()}</strong>
          <small>{restWords.join(' ').toUpperCase() || 'CONSTRUCTION COMPANY'}</small>
        </span>
      </Link>

      <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
        {NAV_LINKS.map((link) => {
          const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
          return (
            <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined}>
              {link.label}
            </Link>
          )
        })}
      </nav>

      <Link href="/contact" className="header-cta">
        Get in touch <ArrowRight size={15} />
      </Link>

      <button
        type="button"
        className="menu-button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
    </header>
  )
}
