import Link from 'next/link'
import { ArrowRight, Send } from 'lucide-react'

export function CtaBand({
  eyebrow = 'Start a conversation',
  title = 'Have a construction requirement?',
  description = 'Tell us about the site, the scope and the timeline. Our team will get back to you with a practical way forward.',
}: {
  eyebrow?: string
  title?: string
  description?: string
}) {
  return (
    <section className="cta-band section-pad">
      <p className="eyebrow">
        <span className="kicker-line" />
        {eyebrow}
      </p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="cta-actions">
        <Link href="/contact" className="button button-dark">
          Contact us <ArrowRight size={16} aria-hidden />
        </Link>
        <Link href="/contact#inquiry" className="button button-ghost">
          Send inquiry <Send size={16} aria-hidden />
        </Link>
      </div>
    </section>
  )
}
