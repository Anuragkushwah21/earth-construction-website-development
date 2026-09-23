import Link from 'next/link'
import { ArrowRight, Construction } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="page-hero" style={{ minHeight: '70vh', display: 'grid', alignContent: 'center' }}>
      <p className="eyebrow light">
        <span className="kicker-line" />
        Error 404
      </p>
      <h1>
        This page
        <br />
        <em>isn&apos;t here.</em>
      </h1>
      <p>
        The page you are looking for may have been moved, or the project you followed a link to may no longer
        be published.
      </p>
      <div className="hero-actions">
        <Link href="/" className="button button-accent">
          Back to home <ArrowRight size={16} aria-hidden />
        </Link>
        <Link href="/work" className="button button-ghost">
          View our work <Construction size={16} aria-hidden />
        </Link>
      </div>
    </main>
  )
}
