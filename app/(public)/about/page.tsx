import Image from 'next/image'
import type { Metadata } from 'next'
import { Building2, Leaf, ShieldCheck, Target, Telescope } from 'lucide-react'
import { CtaBand } from '@/components/site/cta-band'
import { Prose } from '@/components/site/prose'
import { FOUNDING_YEAR, yearsOfExperience } from '@/lib/company-defaults'
import { getCompanySettings } from '@/lib/data'
import type { LeaderProfile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Earth Construction Company was established on 20 April 2014 in Gwalior, Madhya Pradesh, delivering construction and infrastructure work with a focus on quality, safety and sustainability.',
  openGraph: {
    title: 'About Earth Construction Company',
    description:
      'Established 2014 in Gwalior, Madhya Pradesh. Construction and infrastructure delivered with quality, safety and sustainability at the core.',
  },
}

export default async function AboutPage() {
  const company = await getCompanySettings()

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow light">
          <span className="kicker-line" />
          About us
        </p>
        <h1>
          Building infrastructure
          <br />
          <em>since {FOUNDING_YEAR}.</em>
        </h1>
        <p>
          {company.companyName} has been delivering construction and infrastructure work for{' '}
          {yearsOfExperience()}+ years, from its base in Gwalior, Madhya Pradesh.
        </p>
      </section>

      {/* Company overview ------------------------------------------------ */}
      <section className="section-pad">
        <div className="block-heading">
          <div>
            <p className="eyebrow">
              <span className="kicker-line" />
              Company overview
            </p>
            <h2>
              Who we are and
              <br />
              <em>how we work.</em>
            </h2>
          </div>
        </div>

        <div className="split-panel">
          <Prose text={company.about} />
          <dl className="contact-cards">
            <div className="contact-card">
              <Building2 size={18} aria-hidden />
              <div>
                <h3>Established</h3>
                <p>{company.establishedDate}</p>
              </div>
            </div>
            <div className="contact-card">
              <Target size={18} aria-hidden />
              <div>
                <h3>Registered office</h3>
                <p>{company.address}</p>
              </div>
            </div>
            {company.gstin ? (
              <div className="contact-card">
                <ShieldCheck size={18} aria-hidden />
                <div>
                  <h3>GSTIN</h3>
                  <p>{company.gstin}</p>
                </div>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      {/* Vision + mission ------------------------------------------------ */}
      <section className="section-muted section-pad">
        <div className="split-panel">
          <article className="panel-card dark">
            <Telescope size={22} aria-hidden style={{ color: 'var(--amber)' }} />
            <h2>Our Vision</h2>
            <Prose text={company.vision} />
          </article>
          <article className="panel-card">
            <Target size={22} aria-hidden style={{ color: '#b87910' }} />
            <h2>Our Mission</h2>
            <Prose text={company.mission} />
          </article>
        </div>
      </section>

      {/* Leadership ------------------------------------------------------ */}
      <section className="section-pad">
        <div className="block-heading">
          <div>
            <p className="eyebrow">
              <span className="kicker-line" />
              Leadership
            </p>
            <h2>
              Led by people who
              <br />
              <em>have been on site.</em>
            </h2>
          </div>
        </div>

        <div className="card-grid cols-2">
          <LeaderCard leader={company.ceo} />
          <LeaderCard leader={company.headOfProjects} />
        </div>
      </section>

      {/* Safety + sustainability ----------------------------------------- */}
      <section className="section-white section-pad">
        <div className="split-panel">
          <article>
            <p className="eyebrow">
              <span className="kicker-line" />
              <ShieldCheck size={13} aria-hidden style={{ marginRight: 4 }} />
              Safety &amp; compliance
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', letterSpacing: '-.055em', margin: '18px 0 20px' }}>
              Safe sites, by design.
            </h2>
            <Prose text={company.safetyCompliance} />
          </article>

          <article>
            <p className="eyebrow">
              <span className="kicker-line" />
              <Leaf size={13} aria-hidden style={{ marginRight: 4 }} />
              Sustainability
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', letterSpacing: '-.055em', margin: '18px 0 20px' }}>
              Built with the ground in mind.
            </h2>
            <Prose text={company.sustainability} />
          </article>
        </div>
      </section>

      <CtaBand
        eyebrow="Work with us"
        title="Looking for a reliable construction partner?"
        description="Tell us what you are planning and we will tell you honestly whether we are the right fit."
      />
    </>
  )
}

function LeaderCard({ leader }: { leader: LeaderProfile }) {
  const monogram =
    leader.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '—'

  return (
    <article className="leader-card">
      <div className="leader-photo">
        {leader.image ? (
          <Image src={leader.image} alt={leader.name} fill sizes="200px" />
        ) : (
          // Real portraits only — a monogram stands in until one is uploaded.
          <span className="team-photo-fallback" aria-hidden>
            {monogram}
          </span>
        )}
      </div>
      <div>
        <p className="team-role">{leader.title}</p>
        <h3>{leader.name}</h3>
        <Prose text={leader.bio} />
      </div>
    </article>
  )
}
